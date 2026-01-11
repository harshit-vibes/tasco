import { handlePdfGet } from "@tasco/api";

// Force dynamic rendering
export const dynamic = "force-dynamic";

/**
 * PDF document handler using the shared handler
 * Streams PDF content with proper headers for inline viewing
 */
export { handlePdfGet as GET };
