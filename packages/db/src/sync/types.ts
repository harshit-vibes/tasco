/**
 * Data Sync types for DynamoDB persistence
 * Used by the data-sync app for Inochi
 */

// ============================================
// Enums
// ============================================

/** System types for data sources */
export type SystemType = "sales" | "marketplace" | "accounting" | "logistics" | "erp" | "fulfillment";

/** Connection status */
export type ConnectionStatus = "connected" | "delayed" | "disconnected" | "error";

// Enum arrays for validation
export const SYSTEM_TYPES: SystemType[] = [
  "sales",
  "marketplace",
  "accounting",
  "logistics",
  "erp",
  "fulfillment",
];

export const CONNECTION_STATUSES: ConnectionStatus[] = [
  "connected",
  "delayed",
  "disconnected",
  "error",
];

// ============================================
// Sync System Types
// ============================================

/** Configuration for a sync system */
export interface SystemConfig {
  syncFrequency: number; // Minutes between syncs
  retryAttempts: number;
  timeout: number; // API timeout in ms
  latencyMs?: number; // Expected latency
}

/** Sync system record */
export interface SyncSystem {
  id: string;
  appId: string;
  entityId?: string; // Optional entity context
  name: string;
  type: SystemType;
  status: ConnectionStatus;
  apiEndpoint?: string;
  lastConnectedAt: string;
  lastSyncAt: string;
  latencyMs?: number;
  recordsSyncedToday: number;
  pendingRecords: number;
  failedRecords?: number;
  config: SystemConfig;
  createdAt: string;
  updatedAt: string;
}

/** Input for creating a sync system */
export interface CreateSyncSystemInput {
  id: string;
  appId?: string;
  entityId?: string;
  name: string;
  type: SystemType;
  apiEndpoint?: string;
  config: SystemConfig;
}

/** Input for updating a sync system */
export interface UpdateSyncSystemInput {
  name?: string;
  type?: SystemType;
  status?: ConnectionStatus;
  apiEndpoint?: string;
  lastConnectedAt?: string;
  lastSyncAt?: string;
  latencyMs?: number;
  recordsSyncedToday?: number;
  pendingRecords?: number;
  failedRecords?: number;
  config?: Partial<SystemConfig>;
}

/** DynamoDB item for sync systems */
export interface SyncSystemItem extends SyncSystem {
  pk: string; // SSYS#{appId}
  sk: string; // {systemId}
}

// ============================================
// Sync Metrics Types
// ============================================

/** Sync metrics for a specific time period */
export interface SyncMetrics {
  id: string;
  systemId: string; // "GLOBAL" for overall metrics
  date: string; // YYYY-MM-DD
  hour?: string; // HH (optional for hourly metrics)
  // Core metrics
  recordsSynced: number;
  pendingRecords: number;
  failedRecords: number;
  // Performance metrics
  averageLatencyMs: number;
  maxLatencyMs?: number;
  minLatencyMs?: number;
  throughputPerMinute: number;
  // Health metrics
  errorRate: number; // Percentage
  uptimePercentage: number;
  lastSuccessfulSync: string;
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/** Input for creating/updating sync metrics */
export interface CreateSyncMetricsInput {
  systemId: string;
  date: string;
  hour?: string;
  recordsSynced: number;
  pendingRecords: number;
  failedRecords: number;
  averageLatencyMs: number;
  maxLatencyMs?: number;
  minLatencyMs?: number;
  throughputPerMinute: number;
  errorRate: number;
  uptimePercentage: number;
  lastSuccessfulSync: string;
}

/** DynamoDB item for sync metrics */
export interface SyncMetricsItem extends SyncMetrics {
  pk: string; // SMET#{systemId}
  sk: string; // {date} or {date}#{hour}
}

// ============================================
// Summary/Dashboard Types
// ============================================

/** System status summary */
export interface SystemStatusSummary {
  total: number;
  connected: number;
  delayed: number;
  disconnected: number;
  error: number;
}

/** Overall sync summary for dashboard */
export interface SyncSummary {
  systemStatus: SystemStatusSummary;
  metrics: {
    totalRecordsSynced: number;
    pendingRecords: number;
    failedRecords: number;
    averageLatencyMs: number;
    throughputPerMinute: number;
    errorRate: number;
    uptimePercentage: number;
  };
  lastUpdated: string;
}

/** Data flow between systems */
export interface DataFlow {
  sourceSystem: string;
  targetSystem: string;
  recordsSynced: number;
  pendingRecords: number;
  failedRecords: number;
  successRate: number; // Percentage
}
