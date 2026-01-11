// Types
export * from "./types";

// Service
export { RAGService, createRAGService } from "./service";

// Sync utilities
export {
  syncDocumentToRAG,
  resyncDocumentToRAG,
  unsyncDocumentFromRAG,
  type DocumentSyncConfig,
  type SyncDocument,
  type SyncResult,
} from "./sync";

// Hooks
export {
  useKnowledgeBase,
  useDocuments,
  useRAGQuery,
  type UseKnowledgeBaseOptions,
  type UseDocumentsOptions,
  type UseRAGQueryOptions,
} from "./hooks";
