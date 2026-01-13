"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Sparkles,
  Command,
  ArrowRight,
  X,
  Check,
} from "@tasco/ui/icons";
import { cn } from "@tasco/ui/lib/utils";
import { useMultiAgent, type AgentDefinition, type AgentSuggestion } from "../lib/multi-agent-context";

interface AICommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (query: string) => void;
}

export function AICommandBar({ isOpen, onClose, onSubmit }: AICommandBarProps) {
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Multi-agent context - now fetches from DB
  const { agents, selectedAgent, selectAgent, isMultiAgentEnabled, allSuggestions, isLoading } = useMultiAgent();

  // Filter suggestions based on query
  const filteredSuggestions = query.length > 0
    ? allSuggestions.filter(s =>
        s.query.toLowerCase().includes(query.toLowerCase()) ||
        s.category.toLowerCase().includes(query.toLowerCase())
      )
    : allSuggestions.slice(0, 8); // Show first 8 suggestions when no query

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredSuggestions.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && filteredSuggestions.length > 0) {
        e.preventDefault();
        const suggestion = filteredSuggestions[selectedIndex];
        handleSubmit(suggestion?.query || query, suggestion?.agentKey);
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, filteredSuggestions, selectedIndex, query, onClose]);

  const handleSubmit = (q: string, suggestedAgentKey?: string) => {
    if (!q.trim()) return;
    setIsProcessing(true);

    // If suggestion has a recommended agent, select it
    if (suggestedAgentKey && isMultiAgentEnabled) {
      const suggestedAgent = agents.find(a => a.key === `customer-lifecycle:${suggestedAgentKey}` || a.key === suggestedAgentKey);
      if (suggestedAgent) {
        selectAgent(suggestedAgent);
      }
    }

    // Navigate to chat with the query
    setTimeout(() => {
      router.push(`/chat?q=${encodeURIComponent(q)}`);
      onClose();
      setIsProcessing(false);
      setQuery("");
    }, 500);
  };

  const handleAgentSelect = (agent: AgentDefinition) => {
    selectAgent(agent);
  };

  // Get agent for a suggestion
  const getAgentForSuggestion = (suggestion: AgentSuggestion): AgentDefinition | undefined => {
    return agents.find(a => a.key === `customer-lifecycle:${suggestion.agentKey}` || a.key === suggestion.agentKey);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Command Bar */}
      <div className="relative w-full max-w-2xl mx-4 animate-scale-in">
        <div className="relative bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-4 p-4 border-b border-border">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Ask anything about your customers..."
                className="w-full bg-transparent text-foreground text-lg placeholder:text-muted-foreground outline-none"
                disabled={isProcessing}
              />
            </div>
            <div className="flex items-center gap-2">
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground bg-muted rounded-md border border-border">
                <Command className="w-3 h-3" />K
              </kbd>
              <button
                onClick={onClose}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Agent Selector */}
          {isMultiAgentEnabled && !isProcessing && (
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground mb-2">Chat with:</p>
              <div className="flex flex-wrap gap-2">
                {agents.map((agent) => {
                  const Icon = agent.icon;
                  const isSelected = selectedAgent.key === agent.key;

                  return (
                    <button
                      key={agent.key}
                      onClick={() => handleAgentSelect(agent)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                        isSelected
                          ? cn(agent.bgClass, agent.colorClass, "ring-2 ring-offset-1 ring-offset-background")
                          : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                      style={isSelected ? {
                        ringColor: agent.colorClass.includes('violet') ? '#8b5cf6' :
                                   agent.colorClass.includes('amber') ? '#f59e0b' :
                                   agent.colorClass.includes('emerald') ? '#10b981' :
                                   agent.colorClass.includes('blue') ? '#3b82f6' :
                                   agent.colorClass.includes('pink') ? '#ec4899' :
                                   agent.colorClass.includes('red') ? '#ef4444' : '#8b5cf6'
                      } : undefined}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{agent.shortName}</span>
                      {isSelected && <Check className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="p-6 flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <div className="text-muted-foreground">
                <p className="font-medium text-foreground">Analyzing your request...</p>
                <p className="text-sm">
                  {selectedAgent.name} is processing your query
                </p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && !isProcessing && (
            <div className="p-6 flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Loading suggestions...</p>
            </div>
          )}

          {/* Suggestions */}
          {!isProcessing && !isLoading && (
            <div className="max-h-[280px] overflow-y-auto">
              <div className="p-2">
                <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {query ? "Suggestions" : "Try asking..."}
                </p>
                {filteredSuggestions.length === 0 && query && (
                  <p className="px-3 py-4 text-sm text-muted-foreground text-center">
                    No suggestions found. Press Enter to search.
                  </p>
                )}
                {filteredSuggestions.map((suggestion, index) => {
                  const Icon = suggestion.icon;
                  const recommendedAgent = getAgentForSuggestion(suggestion);

                  return (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSubmit(suggestion.query, suggestion.agentKey)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left group",
                        selectedIndex === index
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <div className={cn(
                        "flex items-center justify-center w-9 h-9 rounded-lg transition-all",
                        selectedIndex === index
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground group-hover:bg-accent"
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{suggestion.query}</p>
                        {isMultiAgentEnabled && recommendedAgent && (
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <recommendedAgent.icon className="w-3 h-3" />
                            Best answered by {recommendedAgent.shortName}
                          </p>
                        )}
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        {suggestion.category}
                      </span>
                      <ArrowRight className={cn(
                        "w-4 h-4 opacity-0 -translate-x-2 transition-all",
                        selectedIndex === index && "opacity-100 translate-x-0"
                      )} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/50">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border">↵</kbd>
                to select
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-muted-foreground">Powered by Lyzr AI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Trigger button to open command bar
export function AICommandTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 px-4 py-2.5 rounded-xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg"
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary group-hover:scale-105 transition-transform">
        <Sparkles className="w-4 h-4 text-primary-foreground" />
      </div>
      <span className="text-muted-foreground group-hover:text-foreground transition-colors">
        Ask AI anything...
      </span>
      <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground bg-muted rounded-md border border-border ml-8">
        <Command className="w-3 h-3" />K
      </kbd>
    </button>
  );
}
