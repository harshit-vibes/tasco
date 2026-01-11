import { createUploadHandler } from "@tasco/api";

// Force dynamic rendering - no caching
export const dynamic = "force-dynamic";

/**
 * Document upload handler using the factory pattern
 * Handles multipart form data uploads including binary files
 * Entities are fetched from the database automatically
 */
export const { POST } = createUploadHandler({
  defaultEntity: "tasco-group",
  defaultDocumentType: "policy",
  syncApiPath: "/api/documents/sync",
});
