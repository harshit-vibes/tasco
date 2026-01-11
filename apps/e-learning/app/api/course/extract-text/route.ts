import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/course/extract-text
 * Extracts text from uploaded documents (PDF, DOCX, TXT, MD)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    let extractedText = "";

    if (extension === "txt" || extension === "md") {
      // Plain text files - read directly
      extractedText = await file.text();
    } else if (extension === "pdf") {
      // PDF files - use pdf-parse or similar
      // For now, we'll use a simple approach with pdf-parse
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Dynamic import of pdf-parse
        const pdfParse = (await import("pdf-parse")).default;
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text || "";

        console.log(`[Extract Text] PDF parsed: ${pdfData.numpages} pages, ${extractedText.length} chars`);
      } catch (pdfError) {
        console.error("[Extract Text] PDF parsing error:", pdfError);
        // Fallback: return empty text but don't fail
        extractedText = "";
      }
    } else if (extension === "docx") {
      // DOCX files - use mammoth
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Dynamic import of mammoth
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value || "";

        console.log(`[Extract Text] DOCX parsed: ${extractedText.length} chars`);
      } catch (docxError) {
        console.error("[Extract Text] DOCX parsing error:", docxError);
        extractedText = "";
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Unsupported file type" },
        { status: 400 }
      );
    }

    // Truncate if too long (limit to ~50k chars for context window)
    const MAX_CHARS = 50000;
    if (extractedText.length > MAX_CHARS) {
      extractedText = extractedText.substring(0, MAX_CHARS) + "\n\n[Content truncated...]";
    }

    return NextResponse.json({
      success: true,
      text: extractedText,
      charCount: extractedText.length,
      fileName: file.name,
    });
  } catch (error) {
    console.error("[Extract Text] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to extract text" },
      { status: 500 }
    );
  }
}
