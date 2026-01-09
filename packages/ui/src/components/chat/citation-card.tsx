"use client";

import { useState } from "react";
import { cn } from "../../lib/utils";
import { FileText, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import type { EnhancedCitation } from "@tasco/db";

export interface CitationCardProps {
  citation: EnhancedCitation;
  /** Handler when clicking the link to navigate */
  onNavigate?: (href: string) => void;
  /** Handler when clicking to preview the document */
  onPreview?: (citation: EnhancedCitation) => void;
  /** Show expanded preview by default */
  defaultExpanded?: boolean;
  /** Compact mode - minimal UI */
  compact?: boolean;
}

/**
 * Get relevance color based on score
 */
function getRelevanceColor(score?: number): string {
  if (!score) return "bg-muted text-muted-foreground";
  if (score >= 0.8) return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  if (score >= 0.6) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
  return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
}

/**
 * Format relevance score as percentage
 */
function formatRelevance(score?: number): string {
  if (!score) return "";
  return `${Math.round(score * 100)}%`;
}

/**
 * Citation Card - displays a single citation with document info, relevance, and expandable preview
 */
export function CitationCard({
  citation,
  onNavigate,
  onPreview,
  defaultExpanded = false,
  compact = false,
}: CitationCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const relevanceScore = citation.metadata?.relevanceScore;
  const category = citation.metadata?.category;

  const handleClick = () => {
    if (onNavigate && citation.href) {
      onNavigate(citation.href);
    } else if (onPreview) {
      onPreview(citation);
    }
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  if (compact) {
    return (
      <button
        onClick={handleClick}
        className="group flex items-center gap-1.5 rounded-md border border-border/50 bg-card px-2 py-1.5 text-[11px] transition-all hover:border-primary/30 hover:bg-accent"
      >
        <FileText className="h-2.5 w-2.5 text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="font-medium truncate max-w-[150px]">
          {citation.documentName}
        </span>
        {citation.location?.page && (
          <span className="text-muted-foreground">(pg {citation.location.page})</span>
        )}
        {citation.location?.section && (
          <span className="text-muted-foreground">{citation.location.section}</span>
        )}
        {relevanceScore !== undefined && (
          <span className={cn("px-1 rounded text-[9px] font-medium", getRelevanceColor(relevanceScore))}>
            {formatRelevance(relevanceScore)}
          </span>
        )}
        <ExternalLink className="h-2.5 w-2.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-border/60 bg-card overflow-hidden transition-all hover:border-primary/30 hover:shadow-sm">
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent/50"
        onClick={handleClick}
      >
        <FileText className="h-4 w-4 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{citation.documentName}</p>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            {citation.location?.section && (
              <span>Section {citation.location.section}</span>
            )}
            {citation.location?.page && (
              <span>Page {citation.location.page}</span>
            )}
            {category && (
              <span className="px-1.5 py-0.5 rounded bg-muted">{category}</span>
            )}
          </div>
        </div>

        {/* Relevance badge */}
        {relevanceScore !== undefined && (
          <span
            className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0",
              getRelevanceColor(relevanceScore)
            )}
          >
            {formatRelevance(relevanceScore)} match
          </span>
        )}

        {/* Expand button */}
        <button
          onClick={toggleExpand}
          className="p-1 rounded hover:bg-muted transition-colors shrink-0"
          aria-label={isExpanded ? "Collapse preview" : "Expand preview"}
        >
          {isExpanded ? (
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Expandable excerpt preview */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-border/40">
          <div className="mt-2 p-2 rounded bg-muted/40 text-xs leading-relaxed">
            {citation.contextBefore && (
              <span className="text-muted-foreground">{citation.contextBefore} </span>
            )}
            <mark className="bg-yellow-200 dark:bg-yellow-800/50 px-0.5 rounded">
              {citation.excerpt}
            </mark>
            {citation.contextAfter && (
              <span className="text-muted-foreground"> {citation.contextAfter}</span>
            )}
          </div>

          {/* View in Knowledge Base link */}
          {citation.href && (
            <button
              onClick={handleClick}
              className="mt-2 flex items-center gap-1 text-[11px] text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              View in Knowledge Base
            </button>
          )}
        </div>
      )}
    </div>
  );
}
