"use client";

import { ScrollArea } from "@tasco/ui";
import { AlertCard } from "./alert-card";
import type { SyncAlert } from "../lib/types";

interface AlertTimelineProps {
  alerts: SyncAlert[];
  onInvestigate?: (alert: SyncAlert) => void;
  onDismiss?: (alert: SyncAlert) => void;
  onResolve?: (alert: SyncAlert) => void;
  maxHeight?: string;
  showActions?: boolean;
  compact?: boolean;
}

export function AlertTimeline({
  alerts,
  onInvestigate,
  onDismiss,
  onResolve,
  maxHeight = "400px",
  showActions = true,
  compact = false,
}: AlertTimelineProps) {
  // Sort alerts by detectedAt (most recent first)
  const sortedAlerts = [...alerts].sort(
    (a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
  );

  if (sortedAlerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
          <svg
            className="h-8 w-8 text-green-600 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="font-medium">No Active Alerts</h3>
        <p className="text-sm text-muted-foreground mt-1">
          All systems are syncing normally
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className={`pr-4`} style={{ maxHeight }}>
      <div className="space-y-3">
        {sortedAlerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onInvestigate={onInvestigate}
            onDismiss={onDismiss}
            onResolve={onResolve}
            showActions={showActions}
            compact={compact}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
