"use client";

import React from "react";
import { Button } from "@tasco/ui";
import { Check, ChevronRight, GraduationCap, X } from "@tasco/ui/icons";
import { cn } from "@tasco/ui/lib/utils";
import type { CreatorStage } from "../../../lib/types/creator";

interface StageHeaderProps {
  currentStage: CreatorStage;
  designSubStep?: number;
  totalModules?: number;
  onStageClick?: (stage: CreatorStage) => void;
  onClose?: () => void;
}

const stages: { id: CreatorStage; label: string }[] = [
  { id: "describe", label: "Describe" },
  { id: "design", label: "Design" },
  { id: "publish", label: "Publish" },
];

export function StageHeader({
  currentStage,
  designSubStep = 0,
  totalModules = 0,
  onStageClick,
  onClose,
}: StageHeaderProps) {
  const currentIndex = stages.findIndex((s) => s.id === currentStage);

  const getStageState = (index: number) => {
    if (index < currentIndex) return "completed";
    if (index === currentIndex) return "current";
    return "upcoming";
  };

  const handleClick = (stage: CreatorStage, index: number) => {
    // Only allow clicking on completed stages
    if (index < currentIndex && onStageClick) {
      onStageClick(stage);
    }
  };

  return (
    <header className="flex-shrink-0 px-3 sm:px-6 py-3 sm:py-4 border-b bg-orange-50 dark:bg-orange-950/30">
      <div className="flex items-center justify-between">
        {/* Left: Logo/Brand */}
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-orange-600" />
          <span className="hidden sm:inline font-semibold text-sm">Course Creator</span>
        </div>

        {/* Center: Step Breadcrumb */}
        <nav className="flex items-center gap-1 sm:gap-2 text-sm">
          {stages.map((stage, index) => {
            const state = getStageState(index);
            const isClickable = index < currentIndex && onStageClick;
            const isActive = state === "current";
            const isCompleted = state === "completed";

            return (
              <React.Fragment key={stage.id}>
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <button
                  onClick={() => handleClick(stage.id, index)}
                  disabled={!isClickable}
                  className={cn(
                    "px-2 py-1 rounded transition-colors text-xs sm:text-sm font-medium",
                    isClickable && "cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/30",
                    !isClickable && "cursor-default",
                    isActive && "bg-orange-500 text-white",
                    isCompleted && "text-orange-600 dark:text-orange-400",
                    !isActive && !isCompleted && "text-muted-foreground"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {isCompleted && (
                      <Check className="h-3 w-3" />
                    )}
                    {stage.label}
                    {stage.id === "design" &&
                      currentStage === "design" &&
                      totalModules > 0 &&
                      designSubStep > 0 && (
                        <span className="text-orange-200">
                          ({designSubStep}/{totalModules})
                        </span>
                      )}
                  </span>
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Right: Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Sub-step progress bar (Design stage only, when building modules) */}
      {currentStage === "design" && totalModules > 0 && designSubStep > 0 && (
        <div className="mt-3 flex items-center gap-1.5">
          {Array.from({ length: totalModules }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                i < designSubStep
                  ? "bg-orange-500"
                  : "bg-orange-200 dark:bg-orange-900"
              )}
            />
          ))}
        </div>
      )}
    </header>
  );
}
