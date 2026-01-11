"use client";

import { Button } from "@tasco/ui";
import { ArrowLeft, ArrowRight, Check, RefreshCw, Sparkles } from "@tasco/ui/icons";

type ActionMode = "submit" | "approve" | "publish" | "loading";

interface StageFooterProps {
  mode: ActionMode;
  onBack?: () => void;
  onNext?: () => void;
  onRevise?: () => void;
  onApprove?: () => void;
  onPublish?: () => void;
  canGoBack?: boolean;
  canGoNext?: boolean;
  isLoading?: boolean;
  nextLabel?: string;
}

export function StageFooter({
  mode,
  onBack,
  onNext,
  onRevise,
  onApprove,
  onPublish,
  canGoBack = true,
  canGoNext = true,
  isLoading = false,
  nextLabel,
}: StageFooterProps) {
  const renderActions = () => {
    switch (mode) {
      case "submit":
        return (
          <Button
            onClick={onNext}
            disabled={!canGoNext || isLoading}
            className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
          >
            {nextLabel || "Generate Outline"}
            <Sparkles className="h-4 w-4" />
          </Button>
        );

      case "approve":
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onRevise}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Request Changes
            </Button>
            <Button
              onClick={onApprove}
              disabled={isLoading}
              className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Check className="h-4 w-4" />
              Approve
            </Button>
          </div>
        );

      case "publish":
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isLoading}
            >
              Create Another
            </Button>
            <Button
              onClick={onPublish}
              disabled={isLoading}
              className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Check className="h-4 w-4" />
              Publish Course
            </Button>
          </div>
        );

      case "loading":
        return (
          <Button disabled className="gap-2 bg-orange-500/70 text-white">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Generating...
          </Button>
        );

      default:
        return null;
    }
  };

  return (
    <footer className="flex-shrink-0 px-3 sm:px-6 py-3 sm:py-4 border-t bg-orange-50 dark:bg-orange-950/30">
      <div className="flex items-center justify-between">
        {/* Left: Back button */}
        <div>
          {mode !== "publish" && mode !== "loading" && (
            <Button
              variant="ghost"
              onClick={onBack}
              disabled={!canGoBack || isLoading}
              className="gap-2 text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
        </div>

        {/* Right: Primary action(s) */}
        <div>{renderActions()}</div>
      </div>
    </footer>
  );
}
