// RAG Configuration
export interface RAGConfig {
  apiKey: string;
  baseUrl?: string;
}

// Knowledge Base
export interface KnowledgeBase {
  id: string;
  name: string;
  collectionName: string;
  description?: string;
  vectorStoreProvider: string;
  embeddingModel: string;
  documentCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateKnowledgeBaseInput {
  name: string;
  description?: string;
  vectorStoreProvider?: string;
  embeddingModel?: string;
}

// Document
export interface Document {
  id: string;
  knowledgeBaseId: string;
  name: string;
  source: string;
  type: "pdf" | "docx" | "txt" | "md";
  size?: number;
  status: "processing" | "ready" | "error";
  chunkCount?: number;
  createdAt?: string;
}

export interface UploadDocumentInput {
  file: File;
  knowledgeBaseId: string;
}

export interface UploadTextInput {
  text: string;
  source: string;
  knowledgeBaseId: string;
}

// RAG Retrieval
export interface RAGQueryInput {
  query: string;
  knowledgeBaseId: string;
  topK?: number;
  retrievalType?: "basic" | "mmr" | "hyde" | "rrf";
  scoreThreshold?: number;
}

export interface RAGResult {
  content: string;
  score: number;
  source: string;
  metadata?: Record<string, unknown>;
}

export interface RAGQueryResponse {
  results: RAGResult[];
  query: string;
  knowledgeBaseId: string;
}

// API Response types
export interface ListKnowledgeBasesResponse {
  items: KnowledgeBase[];
  total: number;
}

export interface ListDocumentsResponse {
  items: Document[];
  total: number;
}

// Hook return types
export interface UseKnowledgeBaseReturn {
  knowledgeBases: KnowledgeBase[];
  isLoading: boolean;
  error: Error | null;
  createKnowledgeBase: (input: CreateKnowledgeBaseInput) => Promise<KnowledgeBase>;
  deleteKnowledgeBase: (id: string) => Promise<void>;
  refreshKnowledgeBases: () => Promise<void>;
}

export interface UseDocumentsReturn {
  documents: Document[];
  isLoading: boolean;
  isUploading: boolean;
  error: Error | null;
  uploadDocument: (input: UploadDocumentInput) => Promise<Document>;
  uploadText: (input: UploadTextInput) => Promise<Document>;
  deleteDocument: (id: string) => Promise<void>;
  refreshDocuments: () => Promise<void>;
}

export interface UseRAGQueryReturn {
  results: RAGResult[];
  isLoading: boolean;
  error: Error | null;
  query: (input: RAGQueryInput) => Promise<RAGQueryResponse>;
  clearResults: () => void;
}
