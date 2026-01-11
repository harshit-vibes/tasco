import type {
  SyncSystem,
  SyncAlert,
  SyncMetrics,
  SystemMetrics,
} from "./types";

// ============================================
// Mock Systems
// ============================================

export const MOCK_SYSTEMS: SyncSystem[] = [
  {
    id: "haravan",
    name: "Haravan",
    type: "sales",
    status: "connected",
    apiEndpoint: "https://api.haravan.com/v1",
    lastConnectedAt: new Date(Date.now() - 60000).toISOString(), // 1 min ago
    lastSyncAt: new Date(Date.now() - 120000).toISOString(), // 2 min ago
    latencyMs: 245,
    recordsSyncedToday: 1247,
    pendingRecords: 12,
    config: {
      syncFrequency: 5,
      retryAttempts: 3,
      timeout: 30000,
    },
  },
  {
    id: "shopee",
    name: "Shopee",
    type: "marketplace",
    status: "connected",
    apiEndpoint: "https://partner.shopeemobile.com/api/v2",
    lastConnectedAt: new Date(Date.now() - 30000).toISOString(),
    lastSyncAt: new Date(Date.now() - 180000).toISOString(), // 3 min ago
    latencyMs: 312,
    recordsSyncedToday: 856,
    pendingRecords: 5,
    config: {
      syncFrequency: 10,
      retryAttempts: 3,
      timeout: 45000,
    },
  },
  {
    id: "bravo",
    name: "Bravo ERP",
    type: "accounting",
    status: "delayed",
    apiEndpoint: "https://bravo.inochi.vn/api",
    lastConnectedAt: new Date(Date.now() - 300000).toISOString(), // 5 min ago
    lastSyncAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    latencyMs: 1850,
    recordsSyncedToday: 423,
    pendingRecords: 89,
    config: {
      syncFrequency: 15,
      retryAttempts: 5,
      timeout: 60000,
    },
  },
  {
    id: "fulfillment",
    name: "Fulfillment",
    type: "logistics",
    status: "connected",
    apiEndpoint: "https://fulfill.inochi.vn/api",
    lastConnectedAt: new Date(Date.now() - 45000).toISOString(),
    lastSyncAt: new Date(Date.now() - 90000).toISOString(),
    latencyMs: 178,
    recordsSyncedToday: 1089,
    pendingRecords: 3,
    config: {
      syncFrequency: 5,
      retryAttempts: 3,
      timeout: 30000,
    },
  },
];

// ============================================
// Mock Alerts
// ============================================

export const MOCK_ALERTS: SyncAlert[] = [
  {
    id: "alert-001",
    type: "missing",
    severity: "high",
    title: "Order #INO-12345 missing in Bravo",
    message:
      "Order exists in Haravan but has not been synced to Bravo ERP after 2 hours",
    sourceSystem: "haravan",
    targetSystem: "bravo",
    affectedRecordId: "INO-12345",
    affectedRecordType: "order",
    expectedValue: "Order Total: 2,450,000 VND",
    detectedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    status: "open",
  },
  {
    id: "alert-002",
    type: "mismatch",
    severity: "medium",
    title: "Revenue mismatch detected",
    message:
      "Daily revenue totals do not match between Haravan and Bravo for today",
    sourceSystem: "haravan",
    targetSystem: "bravo",
    expectedValue: "45,670,000 VND",
    actualValue: "44,220,000 VND",
    detectedAt: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
    status: "investigating",
    assignedTo: "finance@inochi.vn",
  },
  {
    id: "alert-003",
    type: "delayed",
    severity: "high",
    title: "Bravo sync delayed by 2 hours",
    message:
      "Last successful sync was 2 hours ago. 89 records pending synchronization.",
    sourceSystem: "haravan",
    targetSystem: "bravo",
    detectedAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    status: "open",
  },
  {
    id: "alert-004",
    type: "missing",
    severity: "medium",
    title: "Order #INO-12298 missing in Bravo",
    message: "Shopee order not found in Bravo ERP system",
    sourceSystem: "shopee",
    targetSystem: "bravo",
    affectedRecordId: "INO-12298",
    affectedRecordType: "order",
    expectedValue: "Order Total: 890,000 VND",
    detectedAt: new Date(Date.now() - 5400000).toISOString(), // 1.5 hours ago
    status: "open",
  },
  {
    id: "alert-005",
    type: "mismatch",
    severity: "low",
    title: "Customer phone number mismatch",
    message: "Customer contact info differs between Haravan and Fulfillment",
    sourceSystem: "haravan",
    targetSystem: "fulfillment",
    affectedRecordId: "CUST-8891",
    affectedRecordType: "customer",
    expectedValue: "0912-345-678",
    actualValue: "0912-345-679",
    detectedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    status: "dismissed",
  },
  {
    id: "alert-006",
    type: "connection",
    severity: "critical",
    title: "Bravo API connection timeout",
    message:
      "Failed to connect to Bravo API after 5 retry attempts. Last error: Connection timeout after 60s",
    sourceSystem: "data-sync",
    targetSystem: "bravo",
    detectedAt: new Date(Date.now() - 900000).toISOString(), // 15 min ago
    status: "open",
  },
  {
    id: "alert-007",
    type: "missing",
    severity: "high",
    title: "Invoice #INV-7823 not generated",
    message:
      "Order completed in Fulfillment but invoice not created in Bravo",
    sourceSystem: "fulfillment",
    targetSystem: "bravo",
    affectedRecordId: "INV-7823",
    affectedRecordType: "invoice",
    detectedAt: new Date(Date.now() - 2700000).toISOString(), // 45 min ago
    status: "open",
  },
];

// ============================================
// Mock Metrics
// ============================================

export const MOCK_OVERALL_METRICS: SyncMetrics = {
  totalRecordsSynced: 3615,
  pendingRecords: 109,
  failedRecords: 23,
  averageLatencyMs: 646,
  throughputPerMinute: 42,
  errorRate: 0.64,
  lastSuccessfulSync: new Date(Date.now() - 90000).toISOString(),
  uptimePercentage: 99.2,
};

export const MOCK_SYSTEM_METRICS: SystemMetrics[] = [
  {
    systemId: "haravan",
    recordsSynced: 1247,
    pendingRecords: 12,
    failedRecords: 3,
    latencyMs: 245,
    lastSync: new Date(Date.now() - 120000).toISOString(),
  },
  {
    systemId: "shopee",
    recordsSynced: 856,
    pendingRecords: 5,
    failedRecords: 2,
    latencyMs: 312,
    lastSync: new Date(Date.now() - 180000).toISOString(),
  },
  {
    systemId: "bravo",
    recordsSynced: 423,
    pendingRecords: 89,
    failedRecords: 15,
    latencyMs: 1850,
    lastSync: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    systemId: "fulfillment",
    recordsSynced: 1089,
    pendingRecords: 3,
    failedRecords: 3,
    latencyMs: 178,
    lastSync: new Date(Date.now() - 90000).toISOString(),
  },
];

// ============================================
// Helper Functions
// ============================================

export const getSystemById = (id: string): SyncSystem | undefined => {
  return MOCK_SYSTEMS.find((s) => s.id === id);
};

export const getOpenAlerts = (): SyncAlert[] => {
  return MOCK_ALERTS.filter((a) => a.status === "open");
};

export const getAlertsBySystem = (systemId: string): SyncAlert[] => {
  return MOCK_ALERTS.filter(
    (a) => a.sourceSystem === systemId || a.targetSystem === systemId
  );
};

export const getAlertsBySeverity = (severity: string): SyncAlert[] => {
  return MOCK_ALERTS.filter((a) => a.severity === severity);
};

export const getAlertsByType = (type: string): SyncAlert[] => {
  return MOCK_ALERTS.filter((a) => a.type === type);
};

export const formatTimeAgo = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export const formatLatency = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

export const getSystemStatusSummary = () => {
  const connected = MOCK_SYSTEMS.filter((s) => s.status === "connected").length;
  const delayed = MOCK_SYSTEMS.filter((s) => s.status === "delayed").length;
  const error = MOCK_SYSTEMS.filter(
    (s) => s.status === "error" || s.status === "disconnected"
  ).length;

  return { connected, delayed, error, total: MOCK_SYSTEMS.length };
};

export const getAlertSummary = () => {
  const open = MOCK_ALERTS.filter((a) => a.status === "open").length;
  const investigating = MOCK_ALERTS.filter(
    (a) => a.status === "investigating"
  ).length;
  const critical = MOCK_ALERTS.filter(
    (a) => a.severity === "critical" && a.status === "open"
  ).length;
  const high = MOCK_ALERTS.filter(
    (a) => a.severity === "high" && a.status === "open"
  ).length;

  return { open, investigating, critical, high, total: MOCK_ALERTS.length };
};
