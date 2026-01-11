"use client";

import { useState } from "react";
import { cn } from "../../lib/utils";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Shield,
  FileCheck,
  Target,
  Sparkles,
} from "lucide-react";

export interface ValidationResult {
  /** Overall validation score (0-100) */
  score: number;
  /** Human-readable rationale for the score */
  rationale: string;
  /** Whether the response includes citations */
  hasCitations: boolean;
  /** Quality of citations (0-100) */
  citationQuality: number;
  /** How complete the response is (0-100) */
  responseCompleteness: number;
  /** Whether the response is grounded in documents */
  isGrounded: boolean;
  /** Confidence level: high, medium, low */
  confidence: "high" | "medium" | "low";
  // Compliance-specific fields (optional)
  /** Compliance risk level: high, medium, low */
  complianceRisk?: "high" | "medium" | "low";
  /** Potential conflicts between documents and regulations */
  potentialConflicts?: string[];
  /** Required clauses that may be missing */
  missingClauses?: string[];
  /** Law articles cited in the response */
  lawArticlesCited?: string[];
}

export interface ValidationBadgeProps {
  validation: ValidationResult;
  className?: string;
}

function getScoreColor(score: number) {
  if (score >= 90) return "text-green-600 dark:text-green-400";
  if (score >= 70) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function getScoreBgColor(score: number) {
  if (score >= 90) return "bg-green-100 dark:bg-green-900/30";
  if (score >= 70) return "bg-emerald-100 dark:bg-emerald-900/30";
  if (score >= 50) return "bg-yellow-100 dark:bg-yellow-900/30";
  return "bg-red-100 dark:bg-red-900/30";
}

function getScoreIcon(score: number) {
  if (score >= 70) return CheckCircle2;
  if (score >= 50) return AlertCircle;
  return XCircle;
}

function getConfidenceBadge(confidence: "high" | "medium" | "low") {
  const styles = {
    high: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    low: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return styles[confidence];
}

export function ValidationBadge({ validation, className }: ValidationBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const ScoreIcon = getScoreIcon(validation.score);

  return (
    <div className={cn("text-xs", className)}>
      {/* Compact Badge */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all",
          "border border-border/50 hover:border-border",
          getScoreBgColor(validation.score)
        )}
      >
        <Shield className={cn("h-3.5 w-3.5", getScoreColor(validation.score))} />
        <span className={cn("font-semibold", getScoreColor(validation.score))}>
          {validation.score}
        </span>
        <span className="text-muted-foreground">/100</span>
        <span className={cn(
          "ml-1 px-1.5 py-0.5 rounded text-[10px] font-medium",
          getConfidenceBadge(validation.confidence)
        )}>
          {validation.confidence}
        </span>
        {isExpanded ? (
          <ChevronUp className="h-3 w-3 text-muted-foreground ml-1" />
        ) : (
          <ChevronDown className="h-3 w-3 text-muted-foreground ml-1" />
        )}
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-2 p-3 rounded-lg border border-border/50 bg-card/50 space-y-3">
          {/* Rationale */}
          <div className="flex items-start gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
            <p className="text-muted-foreground leading-relaxed">
              {validation.rationale}
            </p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-2">
            {/* Citation Quality */}
            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
              <FileCheck className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground">Citations</p>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        validation.citationQuality >= 70 ? "bg-green-500" :
                        validation.citationQuality >= 50 ? "bg-yellow-500" : "bg-red-500"
                      )}
                      style={{ width: `${validation.citationQuality}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium">{validation.citationQuality}%</span>
                </div>
              </div>
            </div>

            {/* Response Completeness */}
            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
              <Target className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground">Completeness</p>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        validation.responseCompleteness >= 70 ? "bg-green-500" :
                        validation.responseCompleteness >= 50 ? "bg-yellow-500" : "bg-red-500"
                      )}
                      style={{ width: `${validation.responseCompleteness}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium">{validation.responseCompleteness}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-3 text-[10px]">
            <span className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full",
              validation.hasCitations
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            )}>
              {validation.hasCitations ? (
                <CheckCircle2 className="h-2.5 w-2.5" />
              ) : (
                <XCircle className="h-2.5 w-2.5" />
              )}
              Citations
            </span>
            <span className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full",
              validation.isGrounded
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            )}>
              {validation.isGrounded ? (
                <CheckCircle2 className="h-2.5 w-2.5" />
              ) : (
                <XCircle className="h-2.5 w-2.5" />
              )}
              Grounded
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
