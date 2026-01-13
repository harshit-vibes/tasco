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

export interface ValidationResult {
  /** Overall validation score (0-100) */
  score: number;
  /** Human-readable rationale for the score */
  rationale: string;
  /** Whether the response includes citations */
  hasCitations: boolean;
  /** Quality of citations (0-100) */
  citationQuality: number;
  /** How complete the response is (0-100) */
  responseCompleteness: number;
  /** Whether the response is grounded in documents */
  isGrounded: boolean;
  /** Confidence level: high, medium, low */
  confidence: "high" | "medium" | "low";
  // Compliance-specific fields (optional)
  /** Compliance risk level: high, medium, low */
  complianceRisk?: "high" | "medium" | "low";
  /** Potential conflicts between documents and regulations */
  potentialConflicts?: string[];
  /** Required clauses that may be missing */
  missingClauses?: string[];
  /** Law articles cited in the response */
  lawArticlesCited?: string[];
}

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: Citation[];
  /** Enhanced citations with document linking and metadata */
  enhancedCitations?: EnhancedCitation[];
  /** Validation result from validation agent */
  validation?: ValidationResult;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface UsePersistentChatOptions {
  appId: string;
  entityId: string;
  userId: string;
  conversationId?: string | null;
  agentId?: string;
  /** Validation agent ID for response scoring */
  validationAgentId?: string;
  apiKey?: string;
  baseUrl?: string;
  /** Auto-generate title from first user message */
  autoGenerateTitle?: boolean;
  /** Max messages to load initially */
  initialLoadLimit?: number;
  /** Delay initial load until first interaction (improves page load) */
  lazyLoad?: boolean;
  /** Enable response validation (requires validationAgentId) */
  enableValidation?: boolean;
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

// Track if conversations have been loaded per app (prevents refetch on every navigation)
// Keyed by `${appId}#${entityId}` to separate cache per app
const conversationCache = new Map<string, { loaded: boolean; conversations: Conversation[] }>();

const getCacheKey = (appId: string, entityId: string) => `${appId}#${entityId}`;

const getCache = (appId: string, entityId: string) => {
  const key = getCacheKey(appId, entityId);
  if (!conversationCache.has(key)) {
    conversationCache.set(key, { loaded: false, conversations: [] });
  }
  return conversationCache.get(key)!;
};

const setCache = (appId: string, entityId: string, conversations: Conversation[]) => {
  const key = getCacheKey(appId, entityId);
  conversationCache.set(key, { loaded: true, conversations });
};

export function usePersistentChat(
  options: UsePersistentChatOptions
): UsePersistentChatReturn {
  const {
    appId,
    entityId,
    userId,
    conversationId: initialConversationId,
    agentId,
    validationAgentId,
    apiKey,
    baseUrl,
    autoGenerateTitle = true,
    initialLoadLimit = 50,
    lazyLoad = false,
    enableValidation = false,
  } = options;

  // Get app-specific cache
  const cache = getCache(appId, entityId);

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>(cache.conversations);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(!cache.loaded);
  const [error, setError] = useState<Error | null>(null);

  // Lyzr client (only if agentId and apiKey provided)
  const client =
    agentId && apiKey ? createLyzrClient({ apiKey, baseUrl }) : null;

  // Load conversations list via API (with caching)
  const refreshConversations = useCallback(async (force = false) => {
    // Get current app-specific cache
    const currentCache = getCache(appId, entityId);

    // Skip if already loaded and not forcing refresh
    if (currentCache.loaded && !force) {
      setConversations(currentCache.conversations);
      setIsLoadingConversations(false);
      return;
    }

    setIsLoadingConversations(true);
    setError(null);
    try {
      const data = await apiGet<{ conversations: Conversation[] }>(
        `/api/conversations?appId=${appId}&entityId=${entityId}`
      );
      // Update app-specific cache
      setCache(appId, entityId, data.conversations);
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
      // Update both local state and app-specific cache
      const newConversations = [conv, ...conversations];
      setCache(appId, entityId, newConversations);
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
    // Update both local state and app-specific cache
    const filteredConversations = conversations.filter((c) => c.id !== conversationId);
    setCache(appId, entityId, filteredConversations);
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

      // Update both local state and app-specific cache
      const filteredConversations = conversations.filter((c) => c.id !== conversationId);
      setCache(appId, entityId, filteredConversations);
      setConversations(filteredConversations);
    },
    [appId, entityId, conversation?.id, conversations]
  );

  // Update conversation title via API
  const updateConversationTitle = useCallback(
    async (title: string, targetConversationId?: string) => {
      // Use provided conversationId or fall back to current conversation
      const convId = targetConversationId || conversation?.id;
      console.log("[usePersistentChat] updateConversationTitle called, convId:", convId);

      if (!convId) {
        console.log("[usePersistentChat] No conversation to update!");
        return;
      }

      await apiPatch("/api/conversations", {
        appId,
        entityId,
        conversationId: convId,
        title,
      });

      // Update local state
      setConversation(prev => {
        if (prev?.id === convId) {
          return { ...prev, title, updatedAt: new Date().toISOString() };
        }
        return prev;
      });

      // Update conversations list and app-specific cache
      setConversations(prev => {
        const updated = prev.map((c) =>
          c.id === convId ? { ...c, title, updatedAt: new Date().toISOString() } : c
        );
        setCache(appId, entityId, updated);
        return updated;
      });
    },
    [appId, entityId, conversation?.id]
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
        console.log("[usePersistentChat] Title check:", {
          autoGenerateTitle,
          messageCount: currentConversation.messageCount,
          title: currentConversation.title,
          shouldUpdate: autoGenerateTitle && currentConversation.messageCount === 0 && currentConversation.title === "New conversation"
        });
        if (
          autoGenerateTitle &&
          currentConversation.messageCount === 0 &&
          currentConversation.title === "New conversation"
        ) {
          const newTitle = content.slice(0, 50) + (content.length > 50 ? "..." : "");
          console.log("[usePersistentChat] Updating title to:", newTitle, "for conversation:", currentConversation.id);
          await updateConversationTitle(newTitle, currentConversation.id);
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

            console.log("[usePersistentChat] Lyzr response citations:", response.citations?.length || 0);

            // Run validation if enabled and validation agent is configured
            let validationResult: ValidationResult | undefined;
            if (enableValidation && validationAgentId) {
              console.log("[usePersistentChat] Running validation with", response.citations?.length || 0, "citations");
              try {
                validationResult = await client.validateResponse(
                  validationAgentId,
                  content,
                  response.message,
                  response.citations, // Pass actual citations, not just boolean
                  userId
                );
                console.log("[usePersistentChat] Validation result:", validationResult);
              } catch (validationErr) {
                console.error("[usePersistentChat] Validation error:", validationErr);
                // Continue without validation on error
              }
            }

            // Create assistant message via API with enhanced citations and validation
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
              validation: validationResult,
              appId,
              entityId,
            });

            console.log("[usePersistentChat] Stored message enhancedCitations:", assistantMsgData.message.enhancedCitations?.length || 0);
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

        // Update conversations list with new timestamp and app-specific cache
        const updatedConversations = conversations.map((c) =>
          c.id === currentConversation!.id
            ? { ...c, updatedAt: new Date().toISOString(), messageCount: c.messageCount + 1 }
            : c
        );
        setCache(appId, entityId, updatedConversations);
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
