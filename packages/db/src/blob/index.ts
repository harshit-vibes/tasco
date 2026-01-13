/**
 * Vercel Blob Module Exports
 *
 * Provides document storage using Vercel Blob as a replacement for S3.
 */

export {
  // Upload operations
  uploadDocument,
  uploadDocumentVersion,
  putJsonDocument,
  updateDocumentsIndex,
  // Read operations
  getDocument,
  getDocumentBuffer,
  getJsonDocument,
  getDocumentInfo,
  getDocumentsIndex,
  documentExists,
  // List operations
  listDocuments,
  listDocumentVersions,
  // Delete operations
  deleteDocument,
  deleteDocuments,
  // Copy operations
  copyDocument,
  // Types
  type BlobDocumentInfo,
  type BlobVersion,
} from "./client";
