"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  ChatContainer,
  ChatHistory,
  Skeleton,
} from "@tasco/ui";
import { usePersistentChat } from "@tasco/lyzr";
import {
  MessageSquare,
  Plus,
  DollarSign,
  Shield,
  TrendingUp,
  FileText,
  PanelLeftClose,
  PanelLeft,
} from "@tasco/ui/icons";

// Suggested questions for the pricing assistant
const suggestedQuestions = [
  "What's the base rate for motor vehicle insurance?",
  "How does driver age affect premium pricing?",
  "What discounts can I apply for fleet policies?",
  "Show me loss ratio trends for commercial vehicles",
  "What risk factors should I consider for SUVs?",
  "Explain the pricing rules for new vs used vehicles",
];

// Quick prompts for common pricing scenarios
const quickPrompts = [
  {
    icon: DollarSign,
    label: "Premium Calculation",
    prompt: "Help me calculate a premium for a 2023 Toyota Camry with personal use",
  },
  {
    icon: Shield,
    label: "Risk Assessment",
    prompt: "What are the key risk factors for a commercial vehicle policy?",
  },
  {
    icon: TrendingUp,
    label: "Market Analysis",
    prompt: "What are the current market trends for motor insurance pricing?",
  },
  {
    icon: FileText,
    label: "Policy Rules",
    prompt: "Explain the pricing guidelines for comprehensive motor insurance",
  },
];

export default function ChatPage() {
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedEntityId, setSelectedEntityId] = useState<string>("default-entity");

  // Use the persistent chat hook
  const {
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
  } = usePersistentChat({
    appId: "sales-pricing",
    entityId: selectedEntityId,
    userId: "demo-user",
    agentId: process.env.NEXT_PUBLIC_LYZR_AGENT_ID,
    apiKey: process.env.NEXT_PUBLIC_LYZR_API_KEY,
    autoGenerateTitle: true,
    lazyLoad: true,
  });

  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleNewConversation = async () => {
    await createNewConversation();
  };

  const handleSelectConversation = async (id: string) => {
    await selectConversation(id);
  };

  const handleDeleteConversation = async (id: string) => {
    if (conversation?.id === id) {
      await deleteCurrentConversation();
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar - Conversation History */}
      {showSidebar && (
        <div className="w-72 flex-shrink-0 border-r bg-muted/20">
          <div className="flex h-14 items-center justify-between border-b px-4">
            <h2 className="font-semibold">Conversations</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNewConversation}
              title="New conversation"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-[calc(100%-3.5rem)] overflow-auto">
            <ChatHistory
              conversations={conversations}
              activeConversationId={conversation?.id}
              onSelectConversation={handleSelectConversation}
              onDeleteConversation={handleDeleteConversation}
              isLoading={isLoadingConversations}
              emptyTitle="No conversations yet"
              emptySubtitle="Start a new conversation to ask pricing questions"
            />
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Chat Header */}
        <div className="flex h-14 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              {showSidebar ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeft className="h-4 w-4" />
              )}
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <MessageSquare className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-sm font-semibold">Pricing Assistant</h1>
                <p className="text-xs text-muted-foreground">
                  AI-powered pricing guidance
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewConversation}
            className="hidden md:flex"
          >
            <Plus className="mr-1 h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Chat Container or Empty State */}
        {messages.length === 0 && !isLoadingMessages ? (
          <div className="flex-1 overflow-auto p-6">
            {/* Welcome Section */}
            <div className="mx-auto max-w-2xl space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <DollarSign className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold">Pricing Assistant</h2>
                <p className="mt-2 text-muted-foreground">
                  Ask questions about pricing rules, risk assessment, or get help
                  calculating premiums
                </p>
              </div>

              {/* Quick Prompts */}
              <div className="grid gap-3 md:grid-cols-2">
                {quickPrompts.map((prompt, index) => {
                  const Icon = prompt.icon;
                  return (
                    <Card
                      key={index}
                      className="cursor-pointer transition-colors hover:bg-muted/50"
                      onClick={() => handleQuickPrompt(prompt.prompt)}
                    >
                      <CardContent className="flex items-center gap-3 p-4">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                          <Icon className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{prompt.label}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {prompt.prompt}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Suggested Questions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Suggested Questions</CardTitle>
                  <CardDescription>
                    Click any question to get started
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="h-auto whitespace-normal text-left"
                        onClick={() => handleQuickPrompt(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <ChatContainer
              messages={messages}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              appTitle="Pricing Assistant"
              appDescription="Ask questions about pricing, risk assessment, and insurance policies"
              suggestedQuestions={suggestedQuestions}
              inputPlaceholder="Ask about pricing rules, risk factors, or premium calculations..."
              emptyIcon={<DollarSign className="h-12 w-12 text-emerald-600" />}
            />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="border-t bg-red-50 p-4 dark:bg-red-900/10">
            <p className="text-sm text-red-600 dark:text-red-400">
              Error: {error.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
