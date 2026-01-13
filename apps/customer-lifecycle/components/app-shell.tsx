"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Sheet, SheetContent } from "@tasco/ui";
import { ChatProvider, useChatContext } from "@tasco/lyzr";
import { AICommandBar } from "./ai-command-bar";
import { FloatingAIButton } from "./floating-ai-button";
import {
  MultiAgentProvider,
  useMultiAgent,
} from "../lib/multi-agent-context";

interface AppShellProps {
  children: React.ReactNode;
}

// Lyzr API key (from environment variables)
const LYZR_API_KEY = process.env.NEXT_PUBLIC_LYZR_API_KEY;

// Inner component that can use useChatContext (inside ChatProvider)
function AppShellInner({ children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandBarOpen, setCommandBarOpen] = useState(false);

  // Get chat context for conversation management
  const {
    conversations,
    conversation,
    selectConversation,
    createNewConversation,
    deleteConversationById,
    isLoadingConversations,
  } = useChatContext();

  // Global keyboard shortcut for command bar (⌘K / Ctrl+K)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setCommandBarOpen(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleCreateConversation = useCallback(async () => {
    await createNewConversation();
  }, [createNewConversation]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={conversation?.id}
        onSelectConversation={selectConversation}
        onCreateConversation={handleCreateConversation}
        onDeleteConversation={deleteConversationById}
        isLoadingConversations={isLoadingConversations}
        onOpenCommand={() => setCommandBarOpen(true)}
      />

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <Sidebar
            conversations={conversations}
            activeConversationId={conversation?.id}
            onSelectConversation={selectConversation}
            onCreateConversation={handleCreateConversation}
            onDeleteConversation={deleteConversationById}
            isLoadingConversations={isLoadingConversations}
            onOpenCommand={() => setCommandBarOpen(true)}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setMobileMenuOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* AI Command Bar (Global) */}
      <AICommandBar
        isOpen={commandBarOpen}
        onClose={() => setCommandBarOpen(false)}
      />

      {/* Floating AI Button (Global) */}
      <FloatingAIButton onOpenCommand={() => setCommandBarOpen(true)} />
    </div>
  );
}

// Wrapper that connects MultiAgent context to ChatProvider
function MultiAgentChatWrapper({ children }: AppShellProps) {
  const { currentAgentId } = useMultiAgent();

  return (
    <ChatProvider
      appId="customer-lifecycle"
      entityId="customer-lifecycle"
      agentId={currentAgentId}
      apiKey={LYZR_API_KEY}
    >
      <AppShellInner>{children}</AppShellInner>
    </ChatProvider>
  );
}

export function AppShell({ children }: AppShellProps) {
  return (
    <MultiAgentProvider>
      <MultiAgentChatWrapper>{children}</MultiAgentChatWrapper>
    </MultiAgentProvider>
  );
}
