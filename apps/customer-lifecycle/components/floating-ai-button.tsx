"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, X, MessageSquare, Zap, ArrowRight } from "@tasco/ui/icons";
import { cn } from "@tasco/ui/lib/utils";

interface FloatingAIButtonProps {
  onOpenCommand?: () => void;
}

export function FloatingAIButton({ onOpenCommand }: FloatingAIButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* Quick Actions (shown when expanded) */}
      {isExpanded && (
        <div className="flex flex-col gap-2 animate-fade-in-up">
          <button
            onClick={() => {
              onOpenCommand?.();
              setIsExpanded(false);
            }}
            className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-all shadow-lg"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">Quick Ask</p>
              <p className="text-xs text-muted-foreground">⌘K to search</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>

          <Link href="/chat">
            <button className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-all shadow-lg w-full">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                <MessageSquare className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">AI Chat</p>
                <p className="text-xs text-muted-foreground">Full conversation</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </Link>
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "group relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-200",
          "bg-primary shadow-lg hover:shadow-xl",
          "hover:scale-105 active:scale-95",
          isExpanded && "rotate-45"
        )}
      >
        {/* Icon */}
        <div className="relative z-10">
          {isExpanded ? (
            <X className="w-6 h-6 text-primary-foreground transition-transform" />
          ) : (
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          )}
        </div>
      </button>
    </div>
  );
}
