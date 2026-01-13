"use client";

/**
 * TourTrigger - Button to start/replay a tour.
 */

import { Button } from "@tasco/ui";
import { Play, HelpCircle, RotateCcw } from "@tasco/ui/icons";
import { useTour } from "../provider";

interface TourTriggerProps {
  /** Tour ID to start (default: "onboarding") */
  tourId?: string;
  /** Button variant: "icon" for icon-only, "button" for full button */
  variant?: "button" | "icon";
  /** Button label */
  label?: string;
  /** Additional CSS classes */
  className?: string;
}

export function TourTrigger({
  tourId = "onboarding",
  variant = "icon",
  label = "Take a Tour",
  className,
}: TourTriggerProps) {
  const { startTour, isActive, hasSeenTour } = useTour();

  const hasSeen = hasSeenTour(tourId);
  const Icon = hasSeen ? RotateCcw : Play;
  const buttonLabel = hasSeen ? "Replay Tour" : label;

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => startTour(tourId)}
        disabled={isActive}
        title={buttonLabel}
        className={className}
      >
        <Icon className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => startTour(tourId)}
      disabled={isActive}
      className={className}
    >
      <HelpCircle className="mr-2 h-4 w-4" />
      {buttonLabel}
    </Button>
  );
}
