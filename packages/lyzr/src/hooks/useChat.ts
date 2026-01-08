"use client";

import { useState, useCallback } from "react";
import { createLyzrClient, type ChatMessage, type ChatResponse } from "../client";

interface UseChatOptions {
  agentId: string;
  apiKey: string;
  baseUrl?: string;
  sessionId?: string;
  initialMessages?: ChatMessage[];
}

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

export function useChat(options: UseChatOptions): UseChatReturn {
  const { agentId, apiKey, baseUrl, sessionId, initialMessages = [] } = options;

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const client = createLyzrClient({ apiKey, baseUrl });

  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: ChatMessage = { role: "user", content };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const response: ChatResponse = await client.chat(
          agentId,
          [...messages, userMessage],
          sessionId
        );

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: response.message,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    },
    [agentId, client, messages, sessionId]
  );

  const clearMessages = useCallback(() => {
    setMessages(initialMessages);
    setError(null);
  }, [initialMessages]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
