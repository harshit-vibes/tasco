"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslation } from "@tasco/i18n";
import { cn } from "../../lib/utils";
import { Bot, User, FileText, ExternalLink, CheckCircle, MessageSquare, XCircle } from "lucide-react";
import { CitationList } from "./citation-list";
import { ValidationBadge, type ValidationResult } from "./validation-badge";
import type { EnhancedCitation } from "@tasco/db";

export interface Citation {
  id: string;
  documentName: string;
  page?: number;
  excerpt: string;
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

export type ReviewAction = "approve" | "request-revision" | "reject";

export interface ChatMessageProps {
  message: Message;
  /** Custom user icon */
  userIcon?: React.ReactNode;
  /** Custom assistant icon */
  assistantIcon?: React.ReactNode;
  /** Handler for citation clicks (legacy) */
  onCitationClick?: (citation: Citation) => void;
  /** Handler for navigating to citation in Knowledge Base */
  onCitationNavigate?: (href: string) => void;
  /** Handler for previewing citation */
  onCitationPreview?: (citation: EnhancedCitation) => void;
  /** Handler for review actions (approve, request revision, reject) */
  onReviewAction?: (messageId: string, action: ReviewAction) => void;
  /** Whether to show review actions */
  showReviewActions?: boolean;
}

export function ChatMessage({
  message,
  userIcon,
  assistantIcon,
  onCitationClick,
  onCitationNavigate,
  onCitationPreview,
  onReviewAction,
  showReviewActions = true,
}: ChatMessageProps) {
  const { t } = useTranslation("chat");
  const isUser = message.role === "user";

  // Determine if review actions should be shown (low validation score or not grounded)
  const needsReview = message.validation && (
    message.validation.score < 70 || !message.validation.isGrounded
  );

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
        isUser ? "bg-primary" : "bg-muted"
      )}>
        {isUser ? (
          userIcon || <User className="h-4 w-4 text-primary-foreground" />
        ) : (
          assistantIcon || <Bot className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-1.5",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-sm"
          )}
        >
          <div className={cn(
            "prose prose-sm max-w-none text-[13px] leading-relaxed",
            isUser
              ? "prose-invert"
              : "prose-slate dark:prose-invert"
          )}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
                li: ({ children }) => <li>{children}</li>,
                code: ({ className, children, ...props }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code className="bg-foreground/10 px-1 py-0.5 rounded text-xs font-mono" {...props}>
                      {children}
                    </code>
                  ) : (
                    <code className="block bg-foreground/10 p-2.5 rounded-lg text-xs font-mono overflow-x-auto" {...props}>
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => <pre className="mb-2">{children}</pre>,
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:no-underline">
                    {children}
                  </a>
                ),
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                h1: ({ children }) => <h1 className="text-base font-semibold mb-1.5 mt-2 first:mt-0">{children}</h1>,
                h2: ({ children }) => <h2 className="text-sm font-semibold mb-1.5 mt-2 first:mt-0">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-1.5 first:mt-0">{children}</h3>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-primary/40 pl-2.5 italic mb-2 text-muted-foreground">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-2">
                    <table className="border-collapse border border-border/50 text-xs w-full">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-border/50 px-2 py-1.5 bg-muted/50 font-semibold text-left">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-border/50 px-2 py-1.5">{children}</td>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Validation Badge - show for assistant messages with validation */}
        {!isUser && message.validation && (
          <div className="mt-2">
            <ValidationBadge validation={message.validation} />
          </div>
        )}

        {/* Review Actions - show when validation needs human review */}
        {!isUser && showReviewActions && needsReview && onReviewAction && (
          <div className="mt-2 flex items-center gap-2 p-2 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20">
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium mr-1">
              {t("review.needsReview")}
            </span>
            <button
              onClick={() => onReviewAction(message.id, "approve")}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 transition-colors"
            >
              <CheckCircle className="h-3 w-3" />
              {t("review.approve")}
            </button>
            <button
              onClick={() => onReviewAction(message.id, "request-revision")}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
            >
              <MessageSquare className="h-3 w-3" />
              {t("review.requestRevision")}
            </button>
            <button
              onClick={() => onReviewAction(message.id, "reject")}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
            >
              <XCircle className="h-3 w-3" />
              {t("review.reject")}
            </button>
          </div>
        )}

        {/* Enhanced Citations - preferred display */}
        {message.enhancedCitations && message.enhancedCitations.length > 0 && (
          <div className="mt-2">
            <CitationList
              citations={message.enhancedCitations}
              onNavigate={onCitationNavigate}
              onPreview={onCitationPreview}
              compact
            />
          </div>
        )}

        {/* Legacy Citations - fallback for backward compatibility */}
        {!message.enhancedCitations && message.citations && message.citations.length > 0 && (
          <div className="space-y-1.5 mt-1">
            <p className="text-[10px] font-medium text-muted-foreground flex items-center gap-1 uppercase tracking-wide">
              <FileText className="h-2.5 w-2.5" />
              {t("message.sources")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {message.citations.map((citation) => (
                <button
                  key={citation.id}
                  onClick={() => onCitationClick?.(citation)}
                  className="group flex items-center gap-1.5 rounded-md border border-border/50 bg-card px-2 py-1.5 text-[11px] transition-all hover:border-primary/30 hover:bg-accent"
                >
                  <FileText className="h-2.5 w-2.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-medium">{citation.documentName}</span>
                  {citation.page && (
                    <span className="text-muted-foreground">(pg {citation.page})</span>
                  )}
                  <ExternalLink className="h-2.5 w-2.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        <span className="text-[10px] text-muted-foreground/50">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
