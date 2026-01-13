import { NextResponse } from "next/server";
import {
  getDocumentsIndex,
  putDocument,
  putDocumentBinary,
  updateDocumentsIndex,
  type DocumentMetadata,
} from "@tasco/db/s3";
import {
  getContentType,
  isBinaryFile,
  generateDocumentId,
  sanitizeFilename,
  getEntityMap,
  type EntityMap,
} from "@tasco/db";

/**
 * Configuration for the upload handler factory
 */
export interface UploadHandlerConfig {
  /** Default entity ID when none specified */
  defaultEntity: string;
  /** Default document type (e.g., "policy") */
  defaultDocumentType?: string;
  /** Path to the sync API endpoint */
  syncApiPath?: string;
  /** Path to the OCR API endpoint (for PDF text extraction) */
  ocrApiPath?: string;
  /** Enable OCR for PDF files (default: true) */
  enableOCR?: boolean;
}

/**
 * Creates an upload handler for multipart form data uploads
 * Fetches entities from the database for document enrichment
 *
 * @example
 * ```ts
 * // In app/api/documents/upload/route.ts
 * import { createUploadHandler } from "@tasco/api";
 *
 * export const { POST } = createUploadHandler({
 *   defaultEntity: "tasco-group",
 *   syncApiPath: "/api/documents/sync",
 * });
 * export const dynamic = "force-dynamic";
 * ```
 */
export function createUploadHandler(config: UploadHandlerConfig) {
  const {
    defaultEntity,
    defaultDocumentType = "policy",
    syncApiPath = "/api/documents/sync",
    ocrApiPath = "/api/ocr",
    enableOCR = true,
  } = config;

  // Cache for entities loaded from database
  let cachedEntities: EntityMap | null = null;

  /**
   * Get entities from database (cached)
   */
  async function getEntities(): Promise<EntityMap> {
    if (!cachedEntities) {
      cachedEntities = await getEntityMap();
    }
    return cachedEntities;
  }

  /**
   * Enrich document with entity name for client-side display
   */
  async function enrichDocument(doc: DocumentMetadata) {
    const entities = await getEntities();
    const entityData = entities[doc.entityId || defaultEntity];
    return {
      ...doc,
      entity: entityData?.shortName || doc.entityId || defaultEntity,
      entityName: entityData?.name || doc.entityId || defaultEntity,
    };
  }

  /**
   * POST - Upload a document via multipart form data
   */
  async function POST(request: Request): Promise<Response> {
    try {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const name = formData.get("name") as string | null;
      const category = formData.get("category") as string | null;
      const entityId = formData.get("entityId") as string | null;
      const tags = formData.get("tags") as string | null;
      const summary = formData.get("summary") as string | null;
      const syncToKB = formData.get("syncToKB") === "true";

      if (!file || !name) {
        return NextResponse.json(
          { success: false, error: "File and name are required" },
          { status: 400 }
        );
      }

      // Generate document ID and filename
      const docId = generateDocumentId(name);
      const ext = file.name.split(".").pop()?.toLowerCase() || "md";
      const sanitizedName = sanitizeFilename(name);
      const filename = `documents/${sanitizedName}.${ext}`;
      const contentType = getContentType(ext);

      // Check if this is a binary file
      const isBinary = isBinaryFile(file.name);
      const isPDF = ext === "pdf";

      let uploadSuccess = false;
      let contentForPages = "";
      let extractedText = ""; // Text extracted via OCR for PDFs

      if (isBinary) {
        // For binary files (PDFs, images, etc.), read as ArrayBuffer and upload as binary
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        uploadSuccess = await putDocumentBinary(filename, buffer, contentType);
        console.log(`[Upload] Binary file uploaded: ${filename}, size: ${buffer.length} bytes`);

        // For PDFs, attempt OCR to extract text for RAG sync
        if (isPDF && enableOCR) {
          try {
            console.log(`[Upload] Running OCR on PDF: ${file.name}`);
            const ocrFormData = new FormData();
            ocrFormData.append("file", file);

            const ocrResponse = await fetch(new URL(ocrApiPath, request.url).toString(), {
              method: "POST",
              body: ocrFormData,
            });

            if (ocrResponse.ok) {
              const ocrResult = await ocrResponse.json();
              if (ocrResult.success && ocrResult.text) {
                extractedText = ocrResult.text;
                console.log(`[Upload] OCR extracted ${extractedText.length} chars from ${ocrResult.totalPages} pages`);
              }
            } else {
              console.warn(`[Upload] OCR failed for ${file.name}, will upload without text extraction`);
            }
          } catch (ocrError) {
            console.warn(`[Upload] OCR error for ${file.name}:`, ocrError);
          }
        }
      } else {
        // For text files, read as text
        const content = await file.text();
        uploadSuccess = await putDocument(filename, content, contentType);
        contentForPages = content;
        extractedText = content; // Use content directly for text files
      }

      if (!uploadSuccess) {
        return NextResponse.json(
          { success: false, error: "Failed to upload document to S3" },
          { status: 500 }
        );
      }

      // If we have extracted text (from OCR or text file), save it alongside the document
      // This allows the RAG sync to use the extracted content
      if (extractedText && isPDF) {
        const textFilename = filename.replace(/\.pdf$/i, ".extracted.md");
        await putDocument(textFilename, extractedText, "text/markdown");
        console.log(`[Upload] Saved extracted text to: ${textFilename}`);
      }

      // Get current index and add new document
      const currentDocs = await getDocumentsIndex();
      const newDoc: DocumentMetadata = {
        id: docId,
        name,
        filename,
        type: defaultDocumentType,
        category: category || "General",
        entityId: entityId || defaultEntity,
        effectiveDate: new Date().toISOString().split("T")[0],
        version: "1.0",
        // Use actual page count from OCR if available, otherwise estimate
        pages: extractedText && isPDF
          ? Math.max(1, Math.ceil(extractedText.length / 3000))
          : isBinary
          ? Math.max(1, Math.ceil(file.size / 3000))
          : Math.ceil(contentForPages.length / 3000),
        language: "en",
        tags: tags ? tags.split(",").map((t) => t.trim()) : [],
        summary: summary || name,
        syncedToKB: false,
        // Review status - always start as pending (must be approved before sync)
        reviewStatus: "pending",
        // Store extracted text reference for PDFs
        ...(extractedText && isPDF ? { extractedTextFile: filename.replace(/\.pdf$/i, ".extracted.md") } : {}),
      };

      const updatedDocs = [...currentDocs, newDoc];
      const indexSuccess = await updateDocumentsIndex(updatedDocs);

      if (!indexSuccess) {
        return NextResponse.json(
          { success: false, error: "Failed to update document index" },
          { status: 500 }
        );
      }

      // Note: syncToKB is ignored - documents must be approved before syncing
      // The sync can be triggered manually after approval via the UI
      const finalDoc = newDoc;

      const enrichedDoc = await enrichDocument(finalDoc);
      return NextResponse.json({
        success: true,
        document: enrichedDoc,
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      return NextResponse.json(
        { success: false, error: "Failed to upload document" },
        { status: 500 }
      );
    }
  }

  return { POST };
}
