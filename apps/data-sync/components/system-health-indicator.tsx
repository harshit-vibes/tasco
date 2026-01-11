"use client";

import { Badge } from "@tasco/ui";
import { CheckCircle, AlertTriangle, XCircle, Clock } from "@tasco/ui/icons";
import type { ConnectionStatus } from "../lib/types";
import { CONNECTION_STATUS_COLORS } from "../lib/types";

interface SystemHealthIndicatorProps {
  status: ConnectionStatus;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const STATUS_CONFIG: Record<
  ConnectionStatus,
  { icon: React.ReactNode; label: string }
> = {
  connected: {
    icon: <CheckCircle className="h-4 w-4" />,
    label: "Connected",
  },
  delayed: {
    icon: <Clock className="h-4 w-4" />,
    label: "Delayed",
  },
  disconnected: {
    icon: <XCircle className="h-4 w-4" />,
    label: "Disconnected",
  },
  error: {
    icon: <AlertTriangle className="h-4 w-4" />,
    label: "Error",
  },
};

const SIZE_CLASSES = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-base px-3 py-1.5",
};

export function SystemHealthIndicator({
  status,
  showLabel = true,
  size = "md",
}: SystemHealthIndicatorProps) {
  const { icon, label } = STATUS_CONFIG[status];
  const colors = CONNECTION_STATUS_COLORS[status];

  return (
    <Badge
      variant="outline"
      className={`
        ${colors.bg} ${colors.text} ${colors.border}
        ${SIZE_CLASSES[size]}
        flex items-center gap-1.5
      `}
    >
      {icon}
      {showLabel && <span>{label}</span>}
    </Badge>
  );
}

// Dot-only indicator for compact displays
export function StatusDot({ status }: { status: ConnectionStatus }) {
  const dotColors: Record<ConnectionStatus, string> = {
    connected: "bg-green-500",
    delayed: "bg-yellow-500",
    disconnected: "bg-gray-400",
    error: "bg-red-500",
  };

  return (
    <span className="relative flex h-3 w-3">
      <span
        className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
          status === "connected"
            ? "bg-green-400"
            : status === "error"
              ? "bg-red-400"
              : ""
        }`}
      />
      <span
        className={`relative inline-flex rounded-full h-3 w-3 ${dotColors[status]}`}
      />
    </span>
  );
}
