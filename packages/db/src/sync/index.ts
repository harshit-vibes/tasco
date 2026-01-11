/**
 * Data Sync module for DynamoDB
 *
 * Tables:
 * - tasco-sync-systems: Sync system configurations and status
 * - tasco-sync-metrics: Sync performance metrics over time
 *
 * Alerts use the shared notifications table with sync-specific types.
 */

// Types
export type {
  SystemType,
  ConnectionStatus,
  SystemConfig,
  SyncSystem,
  CreateSyncSystemInput,
  UpdateSyncSystemInput,
  SyncSystemItem,
  SyncMetrics,
  CreateSyncMetricsInput,
  SyncMetricsItem,
  SystemStatusSummary,
  SyncSummary,
  DataFlow,
} from "./types";

// Enum arrays
export {
  SYSTEM_TYPES,
  CONNECTION_STATUSES,
} from "./types";

// System operations
export {
  createSyncSystem,
  getSyncSystem,
  listSyncSystems,
  updateSyncSystem,
  deleteSyncSystem,
  batchCreateSyncSystems,
  getSystemStatusSummary,
} from "./operations";

// Metrics operations
export {
  upsertSyncMetrics,
  getSyncMetrics,
  listSyncMetrics,
  getGlobalMetrics,
  getTodayGlobalMetrics,
  deleteOldMetrics,
} from "./operations";

// Utilities
export {
  generateMetricId,
  generateSystemId,
  getTodayDate,
  getCurrentHour,
} from "./operations";
