/**
 * OCR API Route
 *
 * Uses the global @tasco/api handleOCR handler for consistent OCR processing across apps.
 */

import { handleOCR } from "@tasco/api";

export const POST = handleOCR;
export const dynamic = "force-dynamic";
