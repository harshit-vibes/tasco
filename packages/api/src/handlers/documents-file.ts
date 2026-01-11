import { NextResponse } from "next/server";
import { getDocumentsIndex, getSignedUrl, getDocumentBuffer } from "@tasco/db/s3";
import { getContentType } from "@tasco/db";

/**
 * GET handler for document files
 * Returns signed URL or base64-encoded content
 *
 * Query params:
 * - id: Document ID or name
 * - format: 'url' (signed URL) or 'base64' (base64-encoded content)
 *
 * @example
 * ```ts
 * // In app/api/documents/file/route.ts
 * export { handleFileGet as GET } from "@tasco/api";
 * export const dynamic = "force-dynamic";
 * ```
 */
export async function handleFileGet(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const format = searchParams.get("format") || "url";

  if (!id) {
    return NextResponse.json(
      { success: false, error: "Document ID is required" },
      { status: 400 }
    );
  }

  try {
    // Find document in index
    const index = await getDocumentsIndex();
    let doc = index.find((d) => d.id === id);

    // Try by name if not found by ID
    if (!doc) {
      doc = index.find((d) => d.name === id);
    }
    if (!doc) {
      doc = index.find((d) => d.name.toLowerCase() === id.toLowerCase());
    }

    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    // Determine file type from filename
    const ext = doc.filename.split(".").pop()?.toLowerCase() || "";
    const mimeType = getContentType(ext);

    if (format === "base64") {
      // Return base64-encoded content (for embedding in component)
      const buffer = await getDocumentBuffer(doc.filename);
      if (!buffer) {
        return NextResponse.json(
          { success: false, error: "Failed to fetch document content" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        document: {
          id: doc.id,
          name: doc.name,
          filename: doc.filename,
          mimeType,
          extension: ext,
          base64: buffer.toString("base64"),
        },
      });
    }

    // Return signed URL (default)
    const signedUrl = await getSignedUrl(doc.filename, 3600); // 1 hour expiration
    if (!signedUrl) {
      return NextResponse.json(
        { success: false, error: "Failed to generate document URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      document: {
        id: doc.id,
        name: doc.name,
        filename: doc.filename,
        mimeType,
        extension: ext,
        url: signedUrl,
        expiresIn: 3600,
      },
    });
  } catch (error) {
    console.error("Error fetching document file:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}
