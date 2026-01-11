import { handleFileGet } from "@tasco/api";

// Force dynamic rendering - no caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Document file handler using the shared handler
 * Supports both signed URLs and base64 content
 */
export { handleFileGet as GET };
