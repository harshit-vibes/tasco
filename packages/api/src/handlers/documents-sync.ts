import { NextResponse } from "next/server";
import { getDocumentsIndex, getDocument } from "@tasco/db/s3";
import {
  getDocumentSyncStatus,
  getAllDocumentSyncStatuses,
  updateDocumentSyncStatus,
} from "@tasco/db";
import { syncDocumentToRAG, resyncDocumentToRAG, unsyncDocumentFromRAG } from "@tasco/rag";

/**
 * Configuration for the sync handler factory
 */
export interface SyncHandlerConfig {
  /** Knowledge base ID for syncing documents */
  kbId: string;
  /** Lyzr API key (can be from env) */
  apiKey: string;
  /** RAG API base URL (optional) */
  ragBaseUrl?: string;
  /** Chunk size for text splitting (default: 1000) */
  chunkSize?: number;
  /** Chunk overlap (default: 100) */
  chunkOverlap?: number;
}

/**
 * Get sync handler config from environment variables
 * Useful for creating config in route files
 */
export function getSyncConfigFromEnv(): SyncHandlerConfig {
  return {
    kbId: process.env.LYZR_KB_ID || process.env.NEXT_PUBLIC_LYZR_KB_ID || "",
    apiKey: process.env.LYZR_API_KEY || process.env.NEXT_PUBLIC_LYZR_API_KEY || "",
    ragBaseUrl: process.env.RAG_BASE_URL || process.env.NEXT_PUBLIC_RAG_BASE_URL,
  };
}

/**
 * Creates document sync handlers for RAG operations
 *
 * @example
 * ```ts
 * // In app/api/documents/sync/route.ts
 * import { createSyncHandler, getSyncConfigFromEnv } from "@tasco/api";
 *
 * const config = getSyncConfigFromEnv();
 * export const { GET, POST } = createSyncHandler(config);
 * ```
 */
export function createSyncHandler(config: SyncHandlerConfig) {
  const {
    kbId,
    apiKey,
    ragBaseUrl,
    chunkSize = 1000,
    chunkOverlap = 100,
  } = config;

  /**
   * POST - Sync or unsync a document to/from RAG
   */
  async function POST(request: Request): Promise<Response> {
    try {
      const body = await request.json();
      const { documentId, action } = body;

      if (!documentId || !action) {
        return NextResponse.json(
          { success: false, error: "Missing documentId or action" },
          { status: 400 }
        );
      }

      if (!["sync", "unsync"].includes(action)) {
        return NextResponse.json(
          { success: false, error: "Invalid action. Use 'sync' or 'unsync'" },
          { status: 400 }
        );
      }

      // Get document metadata
      const index = await getDocumentsIndex();
      const doc = index.find((d) => d.id === documentId);

      if (!doc) {
        return NextResponse.json(
          { success: false, error: "Document not found" },
          { status: 404 }
        );
      }

      if (action === "sync") {
        // Get document content for RAG sync
        // For PDFs with OCR-extracted text, use the extracted text file
        let content: string | null = null;

        if (doc.extractedTextFile) {
          // Use OCR-extracted text for PDFs
          console.log(`[Sync] Using extracted text from: ${doc.extractedTextFile}`);
          content = await getDocument(doc.extractedTextFile);
        }

        // Fallback to original file if no extracted text
        if (!content) {
          content = await getDocument(doc.filename);
        }

        // Check if document was previously synced (has a kbDocumentId)
        const existingSyncStatus = await getDocumentSyncStatus(documentId);
        const existingKbDocId = existingSyncStatus?.kbDocumentId;

        let syncResult;

        if (existingKbDocId && existingSyncStatus?.syncedToKB) {
          // Document was previously synced - use resync to delete old and create new
          // This handles document updates (new S3 versions) correctly
          console.log(`[Sync] Document ${documentId} was previously synced (KB ID: ${existingKbDocId}), using resync...`);
          syncResult = await resyncDocumentToRAG(
            { kbId, apiKey, baseUrl: ragBaseUrl, chunkSize, chunkOverlap },
            {
              id: doc.id,
              name: doc.name,
              filename: doc.filename,
              content: content || "",
              category: doc.category,
              entityId: doc.entityId,
            },
            existingKbDocId
          );
        } else {
          // New document - use normal sync
          syncResult = await syncDocumentToRAG(
            { kbId, apiKey, baseUrl: ragBaseUrl, chunkSize, chunkOverlap },
            {
              id: doc.id,
              name: doc.name,
              filename: doc.filename,
              content: content || "",
              category: doc.category,
              entityId: doc.entityId,
            }
          );
        }

        // Always update sync status in DynamoDB (persistent storage)
        const updated = await updateDocumentSyncStatus(documentId, true, syncResult.kbDocumentId);

        if (!updated) {
          console.error("Failed to update sync status in database");
          return NextResponse.json(
            { success: false, error: "Failed to update sync status in database" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: syncResult.message,
          ragSynced: syncResult.success,
          document: {
            id: documentId,
            syncedToKB: true,
          },
        });
      } else {
        // Unsync action
        const syncStatus = await getDocumentSyncStatus(documentId);
        const kbDocumentId = syncStatus?.kbDocumentId || documentId;

        if (apiKey) {
          const unsyncResult = await unsyncDocumentFromRAG(
            { kbId, apiKey, baseUrl: ragBaseUrl },
            kbDocumentId
          );

          if (!unsyncResult.success) {
            console.warn("Unsync from RAG failed:", unsyncResult.error);
          }
        }

        // Update sync status in DynamoDB
        const updated = await updateDocumentSyncStatus(documentId, false);

        if (!updated) {
          console.error("Failed to update sync status in database");
          return NextResponse.json(
            { success: false, error: "Failed to update sync status" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Document removed from knowledge base",
          document: {
            id: documentId,
            syncedToKB: false,
          },
        });
      }
    } catch (error) {
      console.error("Error in sync operation:", error);
      return NextResponse.json(
        { success: false, error: "Failed to process sync request" },
        { status: 500 }
      );
    }
  }

  /**
   * GET - Get sync status for a document or all documents
   */
  async function GET(request: Request): Promise<Response> {
    try {
      const { searchParams } = new URL(request.url);
      const documentId = searchParams.get("documentId");

      if (documentId) {
        const status = await getDocumentSyncStatus(documentId);
        return NextResponse.json({
          success: true,
          documentId,
          synced: status?.syncedToKB ?? null,
          syncedAt: status?.syncedAt,
        });
      }

      // Return all sync statuses
      const allStatuses = await getAllDocumentSyncStatuses();
      const overrides: Record<string, boolean> = {};

      for (const [docId, status] of Object.entries(allStatuses)) {
        overrides[docId] = status.syncedToKB;
      }

      return NextResponse.json({
        success: true,
        overrides,
      });
    } catch (error) {
      console.error("Error getting sync status:", error);
      return NextResponse.json(
        { success: false, error: "Failed to get sync status" },
        { status: 500 }
      );
    }
  }

  return { GET, POST };
}
