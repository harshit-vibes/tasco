"use client";

import { Card, CardContent } from "@tasco/ui";
import { Badge } from "@tasco/ui";
import { Button } from "@tasco/ui";
import {
  AlertCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
  Eye,
} from "@tasco/ui/icons";
import type { SyncAlert, AlertType, AlertSeverity } from "../lib/types";
import { SEVERITY_COLORS } from "../lib/types";
import { formatTimeAgo } from "../lib/mock-data";

interface AlertCardProps {
  alert: SyncAlert;
  onInvestigate?: (alert: SyncAlert) => void;
  onDismiss?: (alert: SyncAlert) => void;
  onResolve?: (alert: SyncAlert) => void;
  showActions?: boolean;
  compact?: boolean;
}

const TYPE_ICONS: Record<AlertType, React.ReactNode> = {
  missing: <XCircle className="h-4 w-4" />,
  mismatch: <AlertTriangle className="h-4 w-4" />,
  delayed: <Clock className="h-4 w-4" />,
  connection: <AlertCircle className="h-4 w-4" />,
};

const TYPE_LABELS: Record<AlertType, string> = {
  missing: "Missing Data",
  mismatch: "Data Mismatch",
  delayed: "Sync Delayed",
  connection: "Connection Issue",
};

const SEVERITY_LABELS: Record<AlertSeverity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function AlertCard({
  alert,
  onInvestigate,
  onDismiss,
  onResolve,
  showActions = true,
  compact = false,
}: AlertCardProps) {
  const severityColors = SEVERITY_COLORS[alert.severity];

  if (compact) {
    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-lg border ${severityColors.border} ${severityColors.bg}`}
      >
        <div className={severityColors.text}>{TYPE_ICONS[alert.type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{alert.title}</p>
          <p className="text-xs text-muted-foreground">
            {formatTimeAgo(alert.detectedAt)}
          </p>
        </div>
        <Badge variant="outline" className={`${severityColors.text} text-xs`}>
          {SEVERITY_LABELS[alert.severity]}
        </Badge>
      </div>
    );
  }

  return (
    <Card className={`border-l-4 ${severityColors.border}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div
              className={`p-2 rounded-lg ${severityColors.bg} ${severityColors.text}`}
            >
              {TYPE_ICONS[alert.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-medium">{alert.title}</h4>
                <Badge
                  variant="outline"
                  className={`${severityColors.bg} ${severityColors.text} text-xs`}
                >
                  {SEVERITY_LABELS[alert.severity]}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {TYPE_LABELS[alert.type]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {alert.message}
              </p>

              {/* System flow indicator */}
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span className="font-medium">{alert.sourceSystem}</span>
                <ArrowRight className="h-3 w-3" />
                <span className="font-medium">{alert.targetSystem}</span>
              </div>

              {/* Data comparison if available */}
              {(alert.expectedValue || alert.actualValue) && (
                <div className="mt-3 p-2 bg-muted/50 rounded-md text-xs">
                  {alert.expectedValue && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Expected:</span>
                      <span className="font-mono">{alert.expectedValue}</span>
                    </div>
                  )}
                  {alert.actualValue && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Actual:</span>
                      <span className="font-mono">{alert.actualValue}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Timestamp and status */}
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span>Detected {formatTimeAgo(alert.detectedAt)}</span>
                {alert.assignedTo && (
                  <span>Assigned to: {alert.assignedTo}</span>
                )}
                <Badge
                  variant={alert.status === "open" ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {alert.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Actions */}
          {showActions && alert.status === "open" && (
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onInvestigate?.(alert)}
              >
                <Eye className="h-3 w-3 mr-1" />
                Investigate
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDismiss?.(alert)}
              >
                Dismiss
              </Button>
            </div>
          )}

          {showActions && alert.status === "investigating" && (
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => onResolve?.(alert)}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Resolve
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
