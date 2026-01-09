"use client";

import { useState } from "react";
import { cn } from "../../lib/utils";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { CitationCard } from "./citation-card";
import type { EnhancedCitation } from "@tasco/db";

export interface CitationListProps {
  citations: EnhancedCitation[];
  /** Number of citations to show initially */
  initialCount?: number;
  /** Handler when clicking to navigate to a document */
  onNavigate?: (href: string) => void;
  /** Handler when clicking to preview a citation */
  onPreview?: (citation: EnhancedCitation) => void;
  /** Use compact mode for inline display */
  compact?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * Citation List - displays a list of citations with show more/less functionality
 */
export function CitationList({
  citations,
  initialCount = 3,
  onNavigate,
  onPreview,
  compact = false,
  className,
}: CitationListProps) {
  const [showAll, setShowAll] = useState(false);

  if (!citations || citations.length === 0) {
    return null;
  }

  // Sort by relevance score (highest first)
  const sortedCitations = [...citations].sort((a, b) => {
    const scoreA = a.metadata?.relevanceScore ?? 0;
    const scoreB = b.metadata?.relevanceScore ?? 0;
    return scoreB - scoreA;
  });

  const visibleCitations = showAll
    ? sortedCitations
    : sortedCitations.slice(0, initialCount);
  const hiddenCount = sortedCitations.length - initialCount;
  const hasMore = hiddenCount > 0;

  if (compact) {
    return (
      <div className={cn("space-y-1.5", className)}>
        <p className="text-[10px] font-medium text-muted-foreground flex items-center gap-1 uppercase tracking-wide">
          <FileText className="h-2.5 w-2.5" />
          Sources ({citations.length})
        </p>
        <div className="flex flex-wrap gap-1.5">
          {visibleCitations.map((citation) => (
            <CitationCard
              key={citation.id}
              citation={citation}
              onNavigate={onNavigate}
              onPreview={onPreview}
              compact
            />
          ))}
          {hasMore && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="flex items-center gap-1 rounded-md border border-dashed border-border/50 px-2 py-1.5 text-[11px] text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors"
            >
              +{hiddenCount} more
              <ChevronDown className="h-2.5 w-2.5" />
            </button>
          )}
          {showAll && hasMore && (
            <button
              onClick={() => setShowAll(false)}
              className="flex items-center gap-1 rounded-md border border-dashed border-border/50 px-2 py-1.5 text-[11px] text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors"
            >
              Show less
              <ChevronUp className="h-2.5 w-2.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          Sources ({citations.length})
        </p>
        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {showAll ? (
              <>
                Show less
                <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                Show all ({hiddenCount} more)
                <ChevronDown className="h-3 w-3" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Citation cards */}
      <div className="space-y-2">
        {visibleCitations.map((citation) => (
          <CitationCard
            key={citation.id}
            citation={citation}
            onNavigate={onNavigate}
            onPreview={onPreview}
          />
        ))}
      </div>
    </div>
  );
}
