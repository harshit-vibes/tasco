"use client";

import { ReactNode } from "react";
import { StageHeader } from "./stage-header";
import { StageFooter } from "./stage-footer";
import type { CreatorStage } from "../../../lib/types/creator";

type ActionMode = "submit" | "approve" | "publish" | "loading";

interface CreatorShellProps {
  children: ReactNode;
  // Header props
  currentStage: CreatorStage;
  designSubStep?: number;
  totalModules?: number;
  onStageClick?: (stage: CreatorStage) => void;
  onClose?: () => void;
  // Footer props
  actionMode: ActionMode;
  onBack?: () => void;
  onNext?: () => void;
  onRevise?: () => void;
  onApprove?: () => void;
  onPublish?: () => void;
  canGoBack?: boolean;
  canGoNext?: boolean;
  isLoading?: boolean;
  nextLabel?: string;
  // Error display
  error?: string | null;
}

export function CreatorShell({
  children,
  // Header
  currentStage,
  designSubStep,
  totalModules,
  onStageClick,
  onClose,
  // Footer
  actionMode,
  onBack,
  onNext,
  onRevise,
  onApprove,
  onPublish,
  canGoBack,
  canGoNext,
  isLoading,
  nextLabel,
  // Error
  error,
}: CreatorShellProps) {
  return (
    <div className="flex flex-col h-full max-h-full bg-background overflow-hidden">
      {/* Header with stage indicator (flex-shrink-0) */}
      <StageHeader
        currentStage={currentStage}
        designSubStep={designSubStep}
        totalModules={totalModules}
        onStageClick={onStageClick}
        onClose={onClose}
      />

      {/* Main content area - flex-1 with min-h-0 to enable shrinking */}
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6">
          {children}
        </div>

        {/* Error display */}
        {error && (
          <div className="flex-shrink-0 mx-3 sm:mx-6 mb-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}
      </main>

      {/* Footer with actions (flex-shrink-0) */}
      <StageFooter
        mode={actionMode}
        onBack={onBack}
        onNext={onNext}
        onRevise={onRevise}
        onApprove={onApprove}
        onPublish={onPublish}
        canGoBack={canGoBack}
        canGoNext={canGoNext}
        isLoading={isLoading}
        nextLabel={nextLabel}
      />
    </div>
  );
}
