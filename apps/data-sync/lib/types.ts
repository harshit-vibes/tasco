// ============================================
// System Types
// ============================================

export type SystemType = "sales" | "marketplace" | "accounting" | "logistics";
export type ConnectionStatus = "connected" | "delayed" | "disconnected" | "error";

export interface SystemConfig {
  syncFrequency: number; // Minutes between syncs
  retryAttempts: number;
  timeout: number; // API timeout in ms
}

export interface SyncSystem {
  id: string;
  name: string;
  type: SystemType;
  status: ConnectionStatus;
  apiEndpoint?: string;
  lastConnectedAt: string;
  lastSyncAt: string;
  latencyMs?: number;
  recordsSyncedToday: number;
  pendingRecords: number;
  config: SystemConfig;
}

// ============================================
// Alert Types
// ============================================

export type AlertType = "missing" | "mismatch" | "delayed" | "connection";
export type AlertSeverity = "critical" | "high" | "medium" | "low";
export type AlertStatus = "open" | "investigating" | "resolved" | "dismissed";

export interface SyncAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  sourceSystem: string;
  targetSystem: string;
  affectedRecordId?: string;
  affectedRecordType?: string;
  expectedValue?: string;
  actualValue?: string;
  detectedAt: string;
  resolvedAt?: string;
  status: AlertStatus;
  assignedTo?: string;
}

// ============================================
// Metrics Types
// ============================================

export interface SyncMetrics {
  totalRecordsSynced: number;
  pendingRecords: number;
  failedRecords: number;
  averageLatencyMs: number;
  throughputPerMinute: number;
  errorRate: number;
  lastSuccessfulSync: string;
  uptimePercentage: number;
}

export interface SystemMetrics {
  systemId: string;
  recordsSynced: number;
  pendingRecords: number;
  failedRecords: number;
  latencyMs: number;
  lastSync: string;
}

// ============================================
// Sync Record Types
// ============================================

export type RecordType = "order" | "invoice" | "payment" | "customer" | "product";
export type SyncRecordStatus = "pending" | "synced" | "failed" | "skipped";

export interface SyncRecord {
  id: string;
  sourceSystem: string;
  targetSystem: string;
  recordType: RecordType;
  sourceRecordId: string;
  targetRecordId?: string;
  status: SyncRecordStatus;
  syncedAt?: string;
  errorMessage?: string;
  retryCount: number;
}

// ============================================
// Mapping helpers for Notifications table
// ============================================

export const mapSeverityToPriority = (
  severity: AlertSeverity
): "low" | "medium" | "high" | "urgent" => {
  const map: Record<AlertSeverity, "low" | "medium" | "high" | "urgent"> = {
    low: "low",
    medium: "medium",
    high: "high",
    critical: "urgent",
  };
  return map[severity];
};

export const mapPriorityToSeverity = (
  priority: "low" | "medium" | "high" | "urgent"
): AlertSeverity => {
  const map: Record<"low" | "medium" | "high" | "urgent", AlertSeverity> = {
    low: "low",
    medium: "medium",
    high: "high",
    urgent: "critical",
  };
  return map[priority];
};

// ============================================
// UI Helper Types
// ============================================

export interface StatusColors {
  bg: string;
  text: string;
  border: string;
}

export const CONNECTION_STATUS_COLORS: Record<ConnectionStatus, StatusColors> = {
  connected: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-400",
    border: "border-green-200 dark:border-green-800",
  },
  delayed: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-700 dark:text-yellow-400",
    border: "border-yellow-200 dark:border-yellow-800",
  },
  disconnected: {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-700 dark:text-gray-400",
    border: "border-gray-200 dark:border-gray-700",
  },
  error: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
  },
};

export const SEVERITY_COLORS: Record<AlertSeverity, StatusColors> = {
  critical: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
  },
  high: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-800",
  },
  medium: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-700 dark:text-yellow-400",
    border: "border-yellow-200 dark:border-yellow-800",
  },
  low: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
  },
};
