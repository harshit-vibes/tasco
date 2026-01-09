"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "../button";
import { Textarea } from "../textarea";
import { Send, Paperclip, Loader2 } from "lucide-react";

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  /** Show attachment button */
  showAttachment?: boolean;
  /** Footer disclaimer text */
  disclaimer?: string;
}

export function ChatInput({
  onSendMessage,
  isLoading = false,
  placeholder = "Type a message...",
  showAttachment = true,
  disclaimer = "AI-powered search. Always verify critical information.",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-border/50 bg-muted/20 px-4 py-3">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2 rounded-lg border border-border/50 bg-card p-1.5 transition-all focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20">
          {showAttachment && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8 rounded-md text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          )}

          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className="min-h-[36px] max-h-[160px] resize-none border-0 bg-transparent px-1.5 py-2 text-[13px] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
            rows={1}
          />

          <Button
            onClick={handleSubmit}
            disabled={!message.trim() || isLoading}
            size="icon"
            className="shrink-0 h-8 w-8 rounded-md"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {disclaimer && (
          <p className="mt-2 text-center text-[10px] text-muted-foreground/50">
            {disclaimer}
          </p>
        )}
      </div>
    </div>
  );
}
