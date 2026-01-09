"use client";

import { useState, useCallback, useEffect } from "react";
import { createRAGService } from "../service";
import type {
  KnowledgeBase,
  CreateKnowledgeBaseInput,
  UseKnowledgeBaseReturn,
  RAGConfig,
} from "../types";

export interface UseKnowledgeBaseOptions extends RAGConfig {
  /** Auto-load knowledge bases on mount */
  autoLoad?: boolean;
}

export function useKnowledgeBase(
  options: UseKnowledgeBaseOptions
): UseKnowledgeBaseReturn {
  const { apiKey, baseUrl, autoLoad = true } = options;

  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const service = createRAGService({ apiKey, baseUrl });

  const refreshKnowledgeBases = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const kbs = await service.listKnowledgeBases();
      setKnowledgeBases(kbs);
    } catch (err) {
      console.error("Failed to load knowledge bases:", err);
      setError(err instanceof Error ? err : new Error("Failed to load knowledge bases"));
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, baseUrl]);

  const createKnowledgeBase = useCallback(
    async (input: CreateKnowledgeBaseInput): Promise<KnowledgeBase> => {
      setError(null);
      try {
        const kb = await service.createKnowledgeBase(input);
        setKnowledgeBases((prev) => [kb, ...prev]);
        return kb;
      } catch (err) {
        console.error("Failed to create knowledge base:", err);
        const error = err instanceof Error ? err : new Error("Failed to create knowledge base");
        setError(error);
        throw error;
      }
    },
    [apiKey, baseUrl]
  );

  const deleteKnowledgeBase = useCallback(
    async (id: string): Promise<void> => {
      setError(null);
      try {
        await service.deleteKnowledgeBase(id);
        setKnowledgeBases((prev) => prev.filter((kb) => kb.id !== id));
      } catch (err) {
        console.error("Failed to delete knowledge base:", err);
        const error = err instanceof Error ? err : new Error("Failed to delete knowledge base");
        setError(error);
        throw error;
      }
    },
    [apiKey, baseUrl]
  );

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad && apiKey) {
      refreshKnowledgeBases();
    }
  }, [autoLoad, apiKey, refreshKnowledgeBases]);

  return {
    knowledgeBases,
    isLoading,
    error,
    createKnowledgeBase,
    deleteKnowledgeBase,
    refreshKnowledgeBases,
  };
}
