/**
 * Data Sync database operations
 */

import {
  PutCommand,
  QueryCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "../client";
import { TABLES, buildSyncSystemPK, buildSyncSystemSK, buildSyncMetricPK, buildSyncMetricSK, SYNC_METRIC_GLOBAL_PK } from "../tables";
import type {
  SyncSystem,
  SyncSystemItem,
  CreateSyncSystemInput,
  UpdateSyncSystemInput,
  SyncMetrics,
  SyncMetricsItem,
  CreateSyncMetricsInput,
  SystemStatusSummary,
} from "./types";

const APP_ID = "data-sync";

// ============================================
// Sync System Operations
// ============================================

/**
 * Create a new sync system
 */
export async function createSyncSystem(input: CreateSyncSystemInput): Promise<SyncSystem> {
  const appId = input.appId || APP_ID;
  const now = new Date().toISOString();

  const system: SyncSystem = {
    id: input.id,
    appId,
    entityId: input.entityId,
    name: input.name,
    type: input.type,
    status: "disconnected",
    apiEndpoint: input.apiEndpoint,
    lastConnectedAt: now,
    lastSyncAt: now,
    latencyMs: input.config.latencyMs || 0,
    recordsSyncedToday: 0,
    pendingRecords: 0,
    failedRecords: 0,
    config: input.config,
    createdAt: now,
    updatedAt: now,
  };

  const item: SyncSystemItem = {
    pk: buildSyncSystemPK(appId),
    sk: buildSyncSystemSK(input.id),
    ...system,
  };

  await docClient.send(new PutCommand({
    TableName: TABLES.SYNC_SYSTEMS,
    Item: item,
  }));

  return system;
}

/**
 * Get a sync system by ID
 */
export async function getSyncSystem(systemId: string, appId: string = APP_ID): Promise<SyncSystem | null> {
  const result = await docClient.send(new GetCommand({
    TableName: TABLES.SYNC_SYSTEMS,
    Key: {
      pk: buildSyncSystemPK(appId),
      sk: buildSyncSystemSK(systemId),
    },
  }));

  if (!result.Item) return null;

  const { pk, sk, ...system } = result.Item as SyncSystemItem;
  return system;
}

/**
 * List all sync systems for an app
 */
export async function listSyncSystems(appId: string = APP_ID): Promise<SyncSystem[]> {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLES.SYNC_SYSTEMS,
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: {
      ":pk": buildSyncSystemPK(appId),
    },
  }));

  return (result.Items || []).map((item) => {
    const { pk, sk, ...system } = item as SyncSystemItem;
    return system;
  });
}

/**
 * Update a sync system
 */
export async function updateSyncSystem(
  systemId: string,
  updates: UpdateSyncSystemInput,
  appId: string = APP_ID
): Promise<SyncSystem | null> {
  const now = new Date().toISOString();

  // Build update expression dynamically
  const updateParts: string[] = ["#updatedAt = :updatedAt"];
  const expressionNames: Record<string, string> = { "#updatedAt": "updatedAt" };
  const expressionValues: Record<string, unknown> = { ":updatedAt": now };

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      const attrName = `#${key}`;
      const attrValue = `:${key}`;
      updateParts.push(`${attrName} = ${attrValue}`);
      expressionNames[attrName] = key;
      expressionValues[attrValue] = value;
    }
  });

  const result = await docClient.send(new UpdateCommand({
    TableName: TABLES.SYNC_SYSTEMS,
    Key: {
      pk: buildSyncSystemPK(appId),
      sk: buildSyncSystemSK(systemId),
    },
    UpdateExpression: `SET ${updateParts.join(", ")}`,
    ExpressionAttributeNames: expressionNames,
    ExpressionAttributeValues: expressionValues,
    ReturnValues: "ALL_NEW",
  }));

  if (!result.Attributes) return null;

  const { pk, sk, ...system } = result.Attributes as SyncSystemItem;
  return system;
}

/**
 * Delete a sync system
 */
export async function deleteSyncSystem(systemId: string, appId: string = APP_ID): Promise<boolean> {
  try {
    await docClient.send(new DeleteCommand({
      TableName: TABLES.SYNC_SYSTEMS,
      Key: {
        pk: buildSyncSystemPK(appId),
        sk: buildSyncSystemSK(systemId),
      },
    }));
    return true;
  } catch (error) {
    console.error("Error deleting sync system:", error);
    return false;
  }
}

/**
 * Batch create sync systems
 */
export async function batchCreateSyncSystems(
  systems: CreateSyncSystemInput[],
  appId: string = APP_ID
): Promise<SyncSystem[]> {
  const now = new Date().toISOString();
  const createdSystems: SyncSystem[] = [];

  const items = systems.map((input) => {
    const system: SyncSystem = {
      id: input.id,
      appId,
      entityId: input.entityId,
      name: input.name,
      type: input.type,
      status: "disconnected",
      apiEndpoint: input.apiEndpoint,
      lastConnectedAt: now,
      lastSyncAt: now,
      latencyMs: input.config.latencyMs || 0,
      recordsSyncedToday: 0,
      pendingRecords: 0,
      failedRecords: 0,
      config: input.config,
      createdAt: now,
      updatedAt: now,
    };

    createdSystems.push(system);

    return {
      PutRequest: {
        Item: {
          pk: buildSyncSystemPK(appId),
          sk: buildSyncSystemSK(input.id),
          ...system,
        },
      },
    };
  });

  // DynamoDB BatchWrite allows max 25 items per request
  const batches = [];
  for (let i = 0; i < items.length; i += 25) {
    batches.push(items.slice(i, i + 25));
  }

  for (const batch of batches) {
    await docClient.send(new BatchWriteCommand({
      RequestItems: {
        [TABLES.SYNC_SYSTEMS]: batch,
      },
    }));
  }

  return createdSystems;
}

/**
 * Get system status summary
 */
export async function getSystemStatusSummary(appId: string = APP_ID): Promise<SystemStatusSummary> {
  const systems = await listSyncSystems(appId);

  return {
    total: systems.length,
    connected: systems.filter((s) => s.status === "connected").length,
    delayed: systems.filter((s) => s.status === "delayed").length,
    disconnected: systems.filter((s) => s.status === "disconnected").length,
    error: systems.filter((s) => s.status === "error").length,
  };
}

// ============================================
// Sync Metrics Operations
// ============================================

/**
 * Create or update sync metrics
 */
export async function upsertSyncMetrics(input: CreateSyncMetricsInput): Promise<SyncMetrics> {
  const now = new Date().toISOString();
  const id = `metric-${input.systemId}-${input.date}${input.hour ? `-${input.hour}` : ""}`;

  const metrics: SyncMetrics = {
    id,
    systemId: input.systemId,
    date: input.date,
    hour: input.hour,
    recordsSynced: input.recordsSynced,
    pendingRecords: input.pendingRecords,
    failedRecords: input.failedRecords,
    averageLatencyMs: input.averageLatencyMs,
    maxLatencyMs: input.maxLatencyMs,
    minLatencyMs: input.minLatencyMs,
    throughputPerMinute: input.throughputPerMinute,
    errorRate: input.errorRate,
    uptimePercentage: input.uptimePercentage,
    lastSuccessfulSync: input.lastSuccessfulSync,
    createdAt: now,
    updatedAt: now,
  };

  const item: SyncMetricsItem = {
    pk: buildSyncMetricPK(input.systemId),
    sk: buildSyncMetricSK(input.date, input.hour),
    ...metrics,
  };

  await docClient.send(new PutCommand({
    TableName: TABLES.SYNC_METRICS,
    Item: item,
  }));

  return metrics;
}

/**
 * Get metrics for a system on a specific date
 */
export async function getSyncMetrics(
  systemId: string,
  date: string,
  hour?: string
): Promise<SyncMetrics | null> {
  const result = await docClient.send(new GetCommand({
    TableName: TABLES.SYNC_METRICS,
    Key: {
      pk: buildSyncMetricPK(systemId),
      sk: buildSyncMetricSK(date, hour),
    },
  }));

  if (!result.Item) return null;

  const { pk, sk, ...metrics } = result.Item as SyncMetricsItem;
  return metrics;
}

/**
 * List metrics for a system over a date range
 */
export async function listSyncMetrics(
  systemId: string,
  startDate: string,
  endDate: string
): Promise<SyncMetrics[]> {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLES.SYNC_METRICS,
    KeyConditionExpression: "pk = :pk AND sk BETWEEN :start AND :end",
    ExpressionAttributeValues: {
      ":pk": buildSyncMetricPK(systemId),
      ":start": startDate,
      ":end": endDate + "~", // Include all hours on end date
    },
    ScanIndexForward: true, // Oldest first
  }));

  return (result.Items || []).map((item) => {
    const { pk, sk, ...metrics } = item as SyncMetricsItem;
    return metrics;
  });
}

/**
 * Get global metrics for a date
 */
export async function getGlobalMetrics(date: string): Promise<SyncMetrics | null> {
  return getSyncMetrics("GLOBAL", date);
}

/**
 * Get today's global metrics
 */
export async function getTodayGlobalMetrics(): Promise<SyncMetrics | null> {
  const today = new Date().toISOString().split("T")[0];
  return getGlobalMetrics(today);
}

/**
 * Delete old metrics (cleanup)
 */
export async function deleteOldMetrics(systemId: string, beforeDate: string): Promise<number> {
  const metrics = await listSyncMetrics(systemId, "2000-01-01", beforeDate);
  let deleted = 0;

  for (const metric of metrics) {
    try {
      await docClient.send(new DeleteCommand({
        TableName: TABLES.SYNC_METRICS,
        Key: {
          pk: buildSyncMetricPK(systemId),
          sk: buildSyncMetricSK(metric.date, metric.hour),
        },
      }));
      deleted++;
    } catch (error) {
      console.error("Error deleting metric:", error);
    }
  }

  return deleted;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Generate a unique metric ID
 */
export function generateMetricId(): string {
  return `smet-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Generate a unique system ID
 */
export function generateSystemId(): string {
  return `ssys-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Get current hour in HH format
 */
export function getCurrentHour(): string {
  return new Date().toISOString().split("T")[1].slice(0, 2);
}
