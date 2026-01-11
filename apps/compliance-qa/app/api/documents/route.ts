import { createDocumentsHandler } from "@tasco/api";

// Force dynamic rendering - no caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Document CRUD handlers using the factory pattern
 * Entities are fetched from the database automatically
 */
export const { GET, POST, PATCH, DELETE } = createDocumentsHandler({
  defaultEntity: "tasco-group",
  defaultDocumentType: "policy",
  syncApiPath: "/api/documents/sync",
});
