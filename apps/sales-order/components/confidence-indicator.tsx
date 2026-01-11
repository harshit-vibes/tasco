"use client";

import { cn } from "@tasco/ui";
import { Badge } from "@tasco/ui";
import { AlertCircle, CheckCircle, AlertTriangle } from "@tasco/ui/icons";

interface ConfidenceIndicatorProps {
  confidence: number; // 0-100
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ConfidenceIndicator({
  confidence,
  showLabel = true,
  size = "md",
  className,
}: ConfidenceIndicatorProps) {
  // Determine confidence level and styling
  const getConfidenceLevel = () => {
    if (confidence >= 90) return { level: "high", color: "text-green-600", bg: "bg-green-50", icon: CheckCircle };
    if (confidence >= 70) return { level: "medium", color: "text-yellow-600", bg: "bg-yellow-50", icon: AlertTriangle };
    return { level: "low", color: "text-red-600", bg: "bg-red-50", icon: AlertCircle };
  };

  const { level, color, bg, icon: Icon } = getConfidenceLevel();

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      {/* Visual Ring Indicator */}
      <div className="relative inline-flex items-center justify-center">
        {/* Background circle */}
        <svg
          className={cn(sizeClasses[size], "transform -rotate-90")}
          viewBox="0 0 36 36"
        >
          {/* Background ring */}
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted"
            opacity="0.2"
          />
          {/* Confidence ring */}
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={`${confidence * 0.974} 100`}
            className={cn(
              "transition-all duration-500",
              confidence >= 90 && "text-green-600",
              confidence >= 70 && confidence < 90 && "text-yellow-600",
              confidence < 70 && "text-red-600"
            )}
          />
        </svg>
        {/* Center icon */}
        <Icon
          className={cn(
            "absolute",
            size === "sm" && "h-2 w-2",
            size === "md" && "h-2.5 w-2.5",
            size === "lg" && "h-3 w-3",
            color
          )}
        />
      </div>

      {/* Label */}
      {showLabel && (
        <span className={cn("text-xs font-medium", color)}>
          {confidence}%
        </span>
      )}
    </div>
  );
}

interface ConfidenceBadgeProps {
  confidence: number;
  className?: string;
}

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  const variant =
    confidence >= 90
      ? "default"
      : confidence >= 70
      ? "secondary"
      : "destructive";

  const label =
    confidence >= 90
      ? "High Confidence"
      : confidence >= 70
      ? "Medium Confidence"
      : "Low Confidence";

  return (
    <Badge variant={variant} className={cn("gap-1.5", className)}>
      <ConfidenceIndicator confidence={confidence} showLabel={false} size="sm" />
      <span>{label}</span>
    </Badge>
  );
}

interface FieldConfidenceProps {
  label: string;
  confidence: number;
  value: string | number;
  onChange?: (value: string) => void;
  className?: string;
}

export function FieldWithConfidence({
  label,
  confidence,
  value,
  onChange,
  className,
}: FieldConfidenceProps) {
  const needsReview = confidence < 90;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <ConfidenceIndicator confidence={confidence} size="sm" />
      </div>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            "w-full rounded-md border px-3 py-2 text-sm",
            needsReview &&
              "border-yellow-300 bg-yellow-50 focus:border-yellow-500 focus:ring-yellow-500",
            !needsReview && "border-input bg-background"
          )}
        />
        {needsReview && (
          <div className="mt-1 flex items-center gap-1 text-xs text-yellow-700">
            <AlertTriangle className="h-3 w-3" />
            <span>Please review this field</span>
          </div>
        )}
      </div>
    </div>
  );
}
