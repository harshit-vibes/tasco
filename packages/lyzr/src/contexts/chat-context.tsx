"use client";

import { createContext, useContext, ReactNode } from "react";
import { usePersistentChat, type UsePersistentChatReturn } from "../hooks/usePersistentChat";

export interface ChatProviderProps {
  children: ReactNode;
  /** Unique app identifier */
  appId: string;
  /** Entity identifier (can be same as appId for app-level scope) */
  entityId?: string;
  /** User identifier */
  userId?: string;
  /** Lyzr agent ID (from env) */
  agentId?: string;
  /** Lyzr API key (from env) */
  apiKey?: string;
  /** Auto-generate title from first message */
  autoGenerateTitle?: boolean;
  /** Max messages to load initially */
  initialLoadLimit?: number;
}

const ChatContext = createContext<UsePersistentChatReturn | undefined>(undefined);

const DEFAULT_USER_ID = "demo-user-001";

export function ChatProvider({
  children,
  appId,
  entityId,
  userId = DEFAULT_USER_ID,
  agentId,
  apiKey,
  autoGenerateTitle = true,
  initialLoadLimit = 50,
}: ChatProviderProps) {
  const chat = usePersistentChat({
    appId,
    entityId: entityId || appId, // Default to app-level scope
    userId,
    autoGenerateTitle,
    initialLoadLimit,
    agentId,
    apiKey,
  });

  return (
    <ChatContext.Provider value={chat}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}

// Re-export types for convenience
export type { UsePersistentChatReturn } from "../hooks/usePersistentChat";
