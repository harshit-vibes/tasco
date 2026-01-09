"use client";

import { useRef, useEffect } from "react";
import { ChatMessage, type Message, type Citation } from "./chat-message";
import { ChatInput } from "./chat-input";
import { Bot, Sparkles } from "lucide-react";

export interface ChatContainerProps {
  /** Messages to display */
  messages: Message[];
  /** Whether a message is being sent */
  isLoading?: boolean;
  /** Handler for sending messages */
  onSendMessage: (content: string) => void;
  /** Error to display */
  error?: Error | null;
  /** App title shown in empty state */
  appTitle?: string;
  /** App description shown in empty state */
  appDescription?: string;
  /** Suggested questions for empty state */
  suggestedQuestions?: string[];
  /** Custom icon for empty state */
  emptyIcon?: React.ReactNode;
  /** Input placeholder */
  inputPlaceholder?: string;
  /** Handler for citation clicks */
  onCitationClick?: (citation: Citation) => void;
}

export function ChatContainer({
  messages = [],
  isLoading = false,
  onSendMessage,
  error,
  appTitle = "AI Assistant",
  appDescription = "Ask me anything and I'll help you find answers.",
  suggestedQuestions = [],
  emptyIcon,
  inputPlaceholder,
  onCitationClick,
}: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 py-12">
            {/* Hero Icon */}
            <div className="relative mb-5">
              {emptyIcon || (
                <>
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-sm">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-lg bg-primary shadow-sm">
                    <Sparkles className="h-3 w-3 text-primary-foreground" />
                  </div>
                </>
              )}
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold tracking-tight mb-1.5">{appTitle}</h2>
            <p className="text-center text-sm text-muted-foreground max-w-sm mb-8 leading-relaxed">
              {appDescription}
            </p>

            {/* Sample Questions */}
            {suggestedQuestions.length > 0 && (
              <div className="w-full max-w-md space-y-2">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Suggested questions
                </p>
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    onClick={() => onSendMessage(question)}
                    className="group flex w-full items-center gap-2 text-left rounded-lg border border-border/50 bg-card px-3 py-2.5 text-[13px] transition-all duration-200 hover:border-primary/30 hover:bg-accent"
                  >
                    <span className="flex-1 text-foreground/80">{question}</span>
                    <span className="text-muted-foreground/40 group-hover:text-primary transition-colors text-xs">→</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onCitationClick={onCitationClick}
              />
            ))}
            {isLoading && (
              <div className="flex gap-3 px-4 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-1 pt-2">
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:-0.3s]" />
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:-0.15s]" />
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput
        onSendMessage={onSendMessage}
        isLoading={isLoading}
        placeholder={inputPlaceholder}
      />
    </div>
  );
}
