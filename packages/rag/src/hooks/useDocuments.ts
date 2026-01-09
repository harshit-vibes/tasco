"use client";

import { useState, useCallback, useEffect } from "react";
import { createRAGService } from "../service";
import type {
  Document,
  UploadDocumentInput,
  UploadTextInput,
  UseDocumentsReturn,
  RAGConfig,
} from "../types";

export interface UseDocumentsOptions extends RAGConfig {
  /** Knowledge Base ID to manage documents for */
  knowledgeBaseId: string;
  /** Auto-load documents on mount */
  autoLoad?: boolean;
}

export function useDocuments(options: UseDocumentsOptions): UseDocumentsReturn {
  const { apiKey, baseUrl, knowledgeBaseId, autoLoad = true } = options;

  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const service = createRAGService({ apiKey, baseUrl });

  const refreshDocuments = useCallback(async () => {
    if (!knowledgeBaseId) return;

    setIsLoading(true);
    setError(null);
    try {
      const docs = await service.listDocuments(knowledgeBaseId);
      setDocuments(docs);
    } catch (err) {
      console.error("Failed to load documents:", err);
      setError(err instanceof Error ? err : new Error("Failed to load documents"));
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, baseUrl, knowledgeBaseId]);

  const uploadDocument = useCallback(
    async (input: UploadDocumentInput): Promise<Document> => {
      setIsUploading(true);
      setError(null);
      try {
        const result = await service.uploadDocument(input.knowledgeBaseId, input.file);

        // Create a document record from the upload result
        const doc: Document = {
          id: `doc_${Date.now()}`,
          knowledgeBaseId: input.knowledgeBaseId,
          name: input.file.name,
          source: input.file.name,
          type: input.file.name.split(".").pop()?.toLowerCase() as Document["type"] || "txt",
          size: input.file.size,
          status: "ready",
          chunkCount: result.documents.length,
          createdAt: new Date().toISOString(),
        };

        setDocuments((prev) => [doc, ...prev]);
        return doc;
      } catch (err) {
        console.error("Failed to upload document:", err);
        const error = err instanceof Error ? err : new Error("Failed to upload document");
        setError(error);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [apiKey, baseUrl]
  );

  const uploadText = useCallback(
    async (input: UploadTextInput): Promise<Document> => {
      setIsUploading(true);
      setError(null);
      try {
        const result = await service.uploadText(
          input.knowledgeBaseId,
          input.text,
          input.source
        );

        // Create a document record from the upload result
        const doc: Document = {
          id: `doc_${Date.now()}`,
          knowledgeBaseId: input.knowledgeBaseId,
          name: input.source,
          source: input.source,
          type: "txt",
          size: input.text.length,
          status: "ready",
          chunkCount: result.documents.length,
          createdAt: new Date().toISOString(),
        };

        setDocuments((prev) => [doc, ...prev]);
        return doc;
      } catch (err) {
        console.error("Failed to upload text:", err);
        const error = err instanceof Error ? err : new Error("Failed to upload text");
        setError(error);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [apiKey, baseUrl]
  );

  const deleteDocument = useCallback(
    async (id: string): Promise<void> => {
      setError(null);
      try {
        await service.deleteDocument(knowledgeBaseId, id);
        setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      } catch (err) {
        console.error("Failed to delete document:", err);
        const error = err instanceof Error ? err : new Error("Failed to delete document");
        setError(error);
        throw error;
      }
    },
    [apiKey, baseUrl, knowledgeBaseId]
  );

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad && apiKey && knowledgeBaseId) {
      refreshDocuments();
    }
  }, [autoLoad, apiKey, knowledgeBaseId, refreshDocuments]);

  return {
    documents,
    isLoading,
    isUploading,
    error,
    uploadDocument,
    uploadText,
    deleteDocument,
    refreshDocuments,
  };
}
