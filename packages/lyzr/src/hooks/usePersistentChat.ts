"use client";

import { useState, useCallback, useEffect } from "react";
import { createLyzrClient, type ChatResponse } from "../client";

// Types (matching @tasco/db but without importing)
export interface Conversation {
  id: string;
  appId: string;
  entityId: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface Citation {
  id: string;
  documentName: string;
  page?: number;
  excerpt: string;
}

export interface EnhancedCitation {
  id: string;
  documentId: string;
  documentName: string;
  filename?: string;
  location?: {
    section?: string;
    page?: number;
    lineStart?: number;
    lineEnd?: number;
    charStart?: number;
    charEnd?: number;
  };
  excerpt: string;
  contextBefore?: string;
  contextAfter?: string;
  metadata?: {
    relevanceScore?: number;
    category?: string;
    entityId?: string;
  };
  href?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: Citation[];
  /** Enhanced citations with document linking and metadata */
  enhancedCitations?: EnhancedCitation[];
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface UsePersistentChatOptions {
  appId: string;
  entityId: string;
  userId: string;
  conversationId?: string | null;
  agentId?: string;
  apiKey?: string;
  baseUrl?: string;
  /** Auto-generate title from first user message */
  autoGenerateTitle?: boolean;
  /** Max messages to load initially */
  initialLoadLimit?: number;
  /** Delay initial load until first interaction (improves page load) */
  lazyLoad?: boolean;
}

export interface UsePersistentChatReturn {
  // State
  messages: Message[];
  conversation: Conversation | null;
  conversations: Conversation[];
  isLoading: boolean;
  isLoadingMessages: boolean;
  isLoadingConversations: boolean;
  error: Error | null;

  // Actions
  sendMessage: (content: string, citations?: Citation[]) => Promise<void>;
  createNewConversation: (title?: string) => Promise<Conversation>;
  selectConversation: (conversationId: string) => Promise<void>;
  deleteCurrentConversation: () => Promise<void>;
  deleteConversationById: (conversationId: string) => Promise<void>;
  updateConversationTitle: (title: string) => Promise<void>;
  refreshConversations: (force?: boolean) => Promise<void>;
  clearError: () => void;
}

// API helpers
async function apiGet<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const data = await response.json();
  if (!data.success) throw new Error(data.error || "API request failed");
  return data;
}

async function apiPost<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || "API request failed");
  return data;
}

async function apiPatch<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || "API request failed");
  return data;
}

async function apiDelete(url: string): Promise<void> {
  const response = await fetch(url, { method: "DELETE" });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || "API request failed");
}

// Track if conversations have been loaded (prevents refetch on every navigation)
let hasLoadedConversations = false;
let cachedConversations: Conversation[] = [];

export function usePersistentChat(
  options: UsePersistentChatOptions
): UsePersistentChatReturn {
  const {
    appId,
    entityId,
    userId,
    conversationId: initialConversationId,
    agentId,
    apiKey,
    baseUrl,
    autoGenerateTitle = true,
    initialLoadLimit = 50,
    lazyLoad = false,
  } = options;

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>(cachedConversations);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(!hasLoadedConversations);
  const [error, setError] = useState<Error | null>(null);

  // Lyzr client (only if agentId and apiKey provided)
  const client =
    agentId && apiKey ? createLyzrClient({ apiKey, baseUrl }) : null;

  // Load conversations list via API (with caching)
  const refreshConversations = useCallback(async (force = false) => {
    // Skip if already loaded and not forcing refresh
    if (hasLoadedConversations && !force) {
      setConversations(cachedConversations);
      setIsLoadingConversations(false);
      return;
    }

    setIsLoadingConversations(true);
    setError(null);
    try {
      const data = await apiGet<{ conversations: Conversation[] }>(
        `/api/conversations?appId=${appId}&entityId=${entityId}`
      );
      // Update cache
      cachedConversations = data.conversations;
      hasLoadedConversations = true;
      setConversations(data.conversations);
    } catch (err) {
      console.error("Failed to load conversations:", err);
      setError(err instanceof Error ? err : new Error("Failed to load conversations"));
    } finally {
      setIsLoadingConversations(false);
    }
  }, [appId, entityId]);

  // Load messages for a conversation via API
  const loadMessages = useCallback(async (convId: string) => {
    setIsLoadingMessages(true);
    try {
      const data = await apiGet<{ messages: Message[] }>(
        `/api/messages?conversationId=${convId}&limit=${initialLoadLimit}`
      );
      setMessages(data.messages);
    } catch (err) {
      console.error("Failed to load messages:", err);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [initialLoadLimit]);

  // Select a conversation
  const selectConversation = useCallback(
    async (convId: string) => {
      // Find in current conversations list first
      const conv = conversations.find(c => c.id === convId);
      if (conv) {
        setConversation(conv);
        await loadMessages(convId);
        return;
      }

      // Not found locally - just load messages
      try {
        await loadMessages(convId);
      } catch (err) {
        console.error("Failed to select conversation:", err);
      }
    },
    [conversations, loadMessages]
  );

  // Create new conversation via API
  const createNewConversation = useCallback(
    async (title?: string): Promise<Conversation> => {
      const data = await apiPost<{ conversation: Conversation }>(
        "/api/conversations",
        {
          appId,
          entityId,
          userId,
          title: title || "New conversation",
        }
      );

      const conv = data.conversation;
      setConversation(conv);
      setMessages([]);
      // Update both local state and cache
      const newConversations = [conv, ...conversations];
      cachedConversations = newConversations;
      setConversations(newConversations);

      return conv;
    },
    [appId, entityId, userId, conversations]
  );

  // Delete current conversation via API
  const deleteCurrentConversation = useCallback(async () => {
    if (!conversation) return;

    const conversationId = conversation.id;
    await apiDelete(
      `/api/conversations?appId=${appId}&entityId=${entityId}&conversationId=${conversationId}`
    );

    setConversation(null);
    setMessages([]);
    // Update both local state and cache
    const filteredConversations = conversations.filter((c) => c.id !== conversationId);
    cachedConversations = filteredConversations;
    setConversations(filteredConversations);
  }, [appId, entityId, conversation, conversations]);

  // Delete a conversation by ID via API
  const deleteConversationById = useCallback(
    async (conversationId: string) => {
      await apiDelete(
        `/api/conversations?appId=${appId}&entityId=${entityId}&conversationId=${conversationId}`
      );

      // If deleting the current conversation, clear it
      if (conversation?.id === conversationId) {
        setConversation(null);
        setMessages([]);
      }

      // Update both local state and cache
      const filteredConversations = conversations.filter((c) => c.id !== conversationId);
      cachedConversations = filteredConversations;
      setConversations(filteredConversations);
    },
    [appId, entityId, conversation?.id, conversations]
  );

  // Update conversation title via API
  const updateConversationTitle = useCallback(
    async (title: string) => {
      if (!conversation) return;

      await apiPatch("/api/conversations", {
        appId,
        entityId,
        conversationId: conversation.id,
        title,
      });

      const updatedConv = { ...conversation, title, updatedAt: new Date().toISOString() };
      setConversation(updatedConv);
      // Update both local state and cache
      const updatedConversations = conversations.map((c) =>
        (c.id === conversation.id ? updatedConv : c)
      );
      cachedConversations = updatedConversations;
      setConversations(updatedConversations);
    },
    [appId, entityId, conversation, conversations]
  );

  // Send message via API
  const sendMessage = useCallback(
    async (content: string) => {
      let currentConversation = conversation;

      // Create conversation if none exists
      if (!currentConversation) {
        currentConversation = await createNewConversation(
          autoGenerateTitle ? content.slice(0, 50) : undefined
        );
      }

      setIsLoading(true);
      setError(null);

      try {
        // Create user message via API
        const userMsgData = await apiPost<{ message: Message }>("/api/messages", {
          conversationId: currentConversation.id,
          role: "user",
          content,
          appId,
          entityId,
        });

        const userMessage = userMsgData.message;
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);

        // Update conversation title if first message
        if (
          autoGenerateTitle &&
          currentConversation.messageCount === 0 &&
          currentConversation.title === "New conversation"
        ) {
          const newTitle = content.slice(0, 50) + (content.length > 50 ? "..." : "");
          await updateConversationTitle(newTitle);
        }

        // Update message count in conversation
        const updatedConv = {
          ...currentConversation,
          messageCount: currentConversation.messageCount + 1,
          updatedAt: new Date().toISOString(),
        };
        setConversation(updatedConv);

        // Call Lyzr API if client is available
        if (client && agentId) {
          try {
            const response: ChatResponse = await client.chat(
              agentId,
              [{ role: "user", content }],
              userId
            );

            // Create assistant message via API with enhanced citations
            const assistantMsgData = await apiPost<{ message: Message }>("/api/messages", {
              conversationId: currentConversation.id,
              role: "assistant",
              content: response.message,
              // Use enhanced citations if available, fallback to legacy format
              enhancedCitations: response.citations,
              citations: response.citations?.map((c) => ({
                id: c.id,
                documentName: c.documentName,
                page: c.location?.page,
                excerpt: c.excerpt,
              })) || response.sources?.map((source, index) => ({
                id: `citation_${index}`,
                documentName: source.title || "Unknown",
                excerpt: source.content || "",
              })),
              appId,
              entityId,
            });

            setMessages(prev => [...prev, assistantMsgData.message]);
            setConversation(prev => prev ? {
              ...prev,
              messageCount: prev.messageCount + 1,
            } : null);
          } catch (apiErr) {
            console.error("Lyzr API error:", apiErr);
            setError(apiErr instanceof Error ? apiErr : new Error("Failed to get AI response"));
          }
        }

        // Update conversations list with new timestamp
        const updatedConversations = conversations.map((c) =>
          c.id === currentConversation!.id
            ? { ...c, updatedAt: new Date().toISOString(), messageCount: c.messageCount + 1 }
            : c
        );
        cachedConversations = updatedConversations;
        setConversations(updatedConversations);
      } catch (err) {
        console.error("Failed to send message:", err);
        setError(err instanceof Error ? err : new Error("Failed to send message"));
      } finally {
        setIsLoading(false);
      }
    },
    [
      appId,
      entityId,
      userId,
      conversation,
      messages,
      client,
      agentId,
      autoGenerateTitle,
      createNewConversation,
      updateConversationTitle,
    ]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial load
  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  // Load initial conversation if provided
  useEffect(() => {
    if (initialConversationId) {
      selectConversation(initialConversationId);
    }
  }, [initialConversationId, selectConversation]);

  return {
    messages,
    conversation,
    conversations,
    isLoading,
    isLoadingMessages,
    isLoadingConversations,
    error,
    sendMessage,
    createNewConversation,
    selectConversation,
    deleteCurrentConversation,
    deleteConversationById,
    updateConversationTitle,
    refreshConversations,
    clearError,
  };
}
