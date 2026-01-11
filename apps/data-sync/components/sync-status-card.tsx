"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@tasco/ui";
import { Badge } from "@tasco/ui";
import {
  Activity,
  Clock,
  Database,
  ShoppingCart,
  Truck,
  Calculator,
} from "@tasco/ui/icons";
import type { SyncSystem, ConnectionStatus } from "../lib/types";
import { CONNECTION_STATUS_COLORS } from "../lib/types";
import { formatTimeAgo, formatLatency } from "../lib/mock-data";

interface SyncStatusCardProps {
  system: SyncSystem;
  onClick?: () => void;
}

const SYSTEM_ICONS: Record<string, React.ReactNode> = {
  haravan: <ShoppingCart className="h-5 w-5" />,
  shopee: <ShoppingCart className="h-5 w-5" />,
  bravo: <Calculator className="h-5 w-5" />,
  fulfillment: <Truck className="h-5 w-5" />,
};

const STATUS_LABELS: Record<ConnectionStatus, string> = {
  connected: "Connected",
  delayed: "Delayed",
  disconnected: "Disconnected",
  error: "Error",
};

export function SyncStatusCard({ system, onClick }: SyncStatusCardProps) {
  const statusColors = CONNECTION_STATUS_COLORS[system.status];
  const icon = SYSTEM_ICONS[system.id] || <Database className="h-5 w-5" />;

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${onClick ? "hover:border-primary" : ""}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${statusColors.bg}`}>{icon}</div>
          <CardTitle className="text-base font-medium">{system.name}</CardTitle>
        </div>
        <Badge
          variant="outline"
          className={`${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
        >
          {STATUS_LABELS[system.status]}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Synced Today</p>
            <p className="text-xl font-semibold">
              {system.recordsSyncedToday.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Pending</p>
            <p className="text-xl font-semibold">
              {system.pendingRecords.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Last sync: {formatTimeAgo(system.lastSyncAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            <span>{formatLatency(system.latencyMs || 0)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
