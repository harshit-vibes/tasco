/**
 * Content Type Utilities
 * Shared utilities for document MIME types, binary detection, and ID generation
 */

/**
 * Map of file extensions to MIME content types
 */
export const CONTENT_TYPE_MAP: Record<string, string> = {
  // Text formats
  md: "text/markdown",
  txt: "text/plain",
  html: "text/html",
  htm: "text/html",
  css: "text/css",
  csv: "text/csv",
  json: "application/json",
  xml: "application/xml",

  // Documents
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  // Images
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",

  // Archives
  zip: "application/zip",
  rar: "application/vnd.rar",
  "7z": "application/x-7z-compressed",
};

/**
 * File extensions that should be treated as binary (not text)
 */
export const BINARY_EXTENSIONS = [
  // Documents
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  // Images
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "bmp",
  "ico",
  // Archives
  "zip",
  "rar",
  "7z",
  "tar",
  "gz",
] as const;

/**
 * Get the MIME content type for a file extension
 */
export function getContentType(extension: string): string {
  const ext = extension.toLowerCase().replace(/^\./, "");
  return CONTENT_TYPE_MAP[ext] || "application/octet-stream";
}

/**
 * Check if a file is binary based on its extension
 */
export function isBinaryFile(filename: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return BINARY_EXTENSIONS.includes(ext as typeof BINARY_EXTENSIONS[number]);
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

/**
 * Generate a unique document ID from a name
 */
export function generateDocumentId(name: string): string {
  const timestamp = Date.now();
  const sanitized = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
  return `doc-${timestamp}-${sanitized}`;
}

/**
 * Sanitize a filename for storage
 */
export function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Generate storage path for a document
 */
export function generateDocumentPath(
  name: string,
  extension: string = "md",
  folder: string = "documents"
): string {
  const sanitized = sanitizeFilename(name);
  const ext = extension.toLowerCase().replace(/^\./, "");
  return `${folder}/${sanitized}.${ext}`;
}

/**
 * Estimate page count based on content length
 * Uses ~3000 characters per page as rough estimate
 */
export function estimatePageCount(content: string, charsPerPage: number = 3000): number {
  return Math.max(1, Math.ceil(content.length / charsPerPage));
}
