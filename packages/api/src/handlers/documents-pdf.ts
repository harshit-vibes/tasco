import { NextResponse } from "next/server";
import { getDocumentsIndex, getDocumentBuffer } from "@tasco/db/s3";

/**
 * GET handler for PDF documents
 * Streams PDF content with proper headers for inline viewing
 *
 * Query params:
 * - id: Document ID or name
 *
 * @example
 * ```ts
 * // In app/api/documents/pdf/route.ts
 * export { handlePdfGet as GET } from "@tasco/api";
 * export const dynamic = "force-dynamic";
 * ```
 */
export async function handlePdfGet(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Find document in index
    const index = await getDocumentsIndex();
    let doc = index.find((d) => d.id === id);
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

    // Get the PDF buffer from S3
    const buffer = await getDocumentBuffer(doc.filename);
    if (!buffer) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch document" },
        { status: 500 }
      );
    }

    // Extract just the filename without path
    const cleanFilename = doc.filename.split("/").pop() || doc.filename;

    // Return the PDF with proper headers for inline viewing
    // Convert Buffer to Uint8Array for NextResponse compatibility
    const uint8Array = new Uint8Array(buffer);
    return new NextResponse(uint8Array, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${cleanFilename}"`,
        "Content-Length": buffer.length.toString(),
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("[API] Error fetching PDF:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
