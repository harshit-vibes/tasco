/**
 * OCR API Route - Uses global @tasco/api handler
 *
 * Extracts text from PDF files using Lyzr OCR service.
 */

import { handlePDFOCR } from "@tasco/api";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Use the global PDF-only OCR handler
export const POST = handlePDFOCR;

// Re-export the type for consumers
export type { OCRResult } from "@tasco/api";
