/**
 * OCR Handler - Global handler for Lyzr OCR API
 *
 * Extracts text from PDF and image files using Lyzr OCR service.
 * Used by: compliance-qa, sales-order
 *
 * @example
 * // In app's app/api/ocr/route.ts:
 * import { handleOCR } from "@tasco/api";
 * export const POST = handleOCR;
 * export const dynamic = "force-dynamic";
 */

import { NextResponse } from "next/server";

const LYZR_OCR_API = "https://lyzr-ocr.lyzr.app/extract";

/**
 * OCR extraction result
 */
export interface OCRResult {
  success: boolean;
  text?: string;
  pages?: Record<string, { page: number; content: string }>;
  totalPages?: number;
  error?: string;
  actionsUsed?: number;
}

/**
 * OCR handler configuration
 */
export interface OCRHandlerConfig {
  /** Override the API key (defaults to env LYZR_API_KEY) */
  apiKey?: string;
  /** Allowed file types (defaults to PDF and images) */
  allowedTypes?: ("pdf" | "image")[];
  /** Custom page separator (defaults to "\n\n---\n\n") */
  pageSeparator?: string;
}

/**
 * Check if file is a PDF
 */
function isPDFFile(file: File): boolean {
  return (
    file.name.toLowerCase().endsWith(".pdf") ||
    file.type === "application/pdf"
  );
}

/**
 * Check if file is an image
 */
function isImageFile(file: File): boolean {
  return (
    file.type.startsWith("image/") ||
    !!file.name.toLowerCase().match(/\.(png|jpg|jpeg|gif|webp|bmp|tiff?)$/)
  );
}

/**
 * Create an OCR handler with custom configuration
 */
export function createOCRHandler(config: OCRHandlerConfig = {}) {
  return async function handleOCR(request: Request): Promise<Response> {
    const {
      apiKey: configApiKey,
      allowedTypes = ["pdf", "image"],
      pageSeparator = "\n\n---\n\n",
    } = config;

    try {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: "No file provided" },
          { status: 400 }
        );
      }

      // Check file type
      const isPDF = isPDFFile(file);
      const isImage = isImageFile(file);

      const allowPDF = allowedTypes.includes("pdf");
      const allowImage = allowedTypes.includes("image");

      if ((isPDF && !allowPDF) || (isImage && !allowImage)) {
        return NextResponse.json(
          {
            success: false,
            error: `File type not allowed. Allowed: ${allowedTypes.join(", ")}`,
          },
          { status: 400 }
        );
      }

      if (!isPDF && !isImage) {
        return NextResponse.json(
          {
            success: false,
            error: "Only PDF and image files are supported for OCR",
          },
          { status: 400 }
        );
      }

      // Get API key from config or environment
      const apiKey =
        configApiKey ||
        process.env.LYZR_API_KEY ||
        process.env.NEXT_PUBLIC_LYZR_API_KEY;

      if (!apiKey) {
        console.error("[OCR] No Lyzr API key configured");
        return NextResponse.json(
          { success: false, error: "OCR service not configured" },
          { status: 500 }
        );
      }

      // Create FormData for Lyzr OCR API
      const ocrFormData = new FormData();
      ocrFormData.append("file", file);

      console.log(
        `[OCR] Processing file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`
      );

      // Call Lyzr OCR API
      const response = await fetch(`${LYZR_OCR_API}?api_key=${apiKey}`, {
        method: "POST",
        body: ocrFormData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[OCR] API error: ${response.status} - ${errorText}`);
        return NextResponse.json(
          { success: false, error: `OCR service error: ${response.status}` },
          { status: response.status }
        );
      }

      const data = await response.json();

      if (data.status !== "success") {
        return NextResponse.json(
          { success: false, error: "OCR extraction failed" },
          { status: 500 }
        );
      }

      // Combine all pages into a single text
      const pages = data.data as Record<
        string,
        { page: number; content: string }
      >;
      const pageNumbers = Object.keys(pages)
        .map(Number)
        .sort((a, b) => a - b);

      const combinedText = pageNumbers
        .map((pageNum) => {
          const pageData = pages[String(pageNum)];
          return pageData?.content || "";
        })
        .join(pageSeparator);

      console.log(
        `[OCR] Extracted ${pageNumbers.length} pages, ${combinedText.length} chars`
      );

      const result: OCRResult = {
        success: true,
        text: combinedText,
        pages: pages,
        totalPages: pageNumbers.length,
        actionsUsed: data.total_actions,
      };

      return NextResponse.json(result);
    } catch (error) {
      console.error("[OCR] Error processing file:", error);
      return NextResponse.json(
        { success: false, error: "Failed to process file" },
        { status: 500 }
      );
    }
  };
}

/**
 * Default OCR handler (uses environment variables for config)
 *
 * @example
 * // In app's app/api/ocr/route.ts:
 * import { handleOCR } from "@tasco/api";
 * export const POST = handleOCR;
 * export const dynamic = "force-dynamic";
 */
export const handleOCR = createOCRHandler();

/**
 * OCR handler for PDF files only
 */
export const handlePDFOCR = createOCRHandler({ allowedTypes: ["pdf"] });

/**
 * OCR handler for image files only
 */
export const handleImageOCR = createOCRHandler({ allowedTypes: ["image"] });
