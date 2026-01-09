"use client";

import { useState, useCallback } from "react";
import { createRAGService } from "../service";
import type {
  RAGResult,
  RAGQueryInput,
  RAGQueryResponse,
  UseRAGQueryReturn,
  RAGConfig,
} from "../types";

export interface UseRAGQueryOptions extends RAGConfig {}

export function useRAGQuery(options: UseRAGQueryOptions): UseRAGQueryReturn {
  const { apiKey, baseUrl } = options;

  const [results, setResults] = useState<RAGResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const service = createRAGService({ apiKey, baseUrl });

  const query = useCallback(
    async (input: RAGQueryInput): Promise<RAGQueryResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await service.query(input);
        setResults(response.results);
        return response;
      } catch (err) {
        console.error("Failed to query RAG:", err);
        const error = err instanceof Error ? err : new Error("Failed to query RAG");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey, baseUrl]
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    isLoading,
    error,
    query,
    clearResults,
  };
}
