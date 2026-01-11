/**
 * Risk Radar DynamoDB operations
 * CRUD operations for risk metrics and alerts
 */

import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "../client";
import {
  TABLES,
  buildRiskMetricPK,
  buildRiskMetricSK,
  buildRiskAlertPK,
  buildRiskAlertSK,
  RISK_ALERT_ALL_PK,
} from "../tables";
import type {
  RiskMetric,
  RiskMetricItem,
  CreateRiskMetricInput,
  UpdateRiskMetricInput,
  RiskAlert,
  RiskAlertItem,
  CreateRiskAlertInput,
  UpdateRiskAlertInput,
  AlertSeverity,
  AlertStatus,
  AlertType,
  ProductType,
  AlertStats,
} from "./types";

// ============================================
// Utility Functions
// ============================================

/** Generate a unique metric ID */
export const generateMetricId = (
  entityId: string,
  period: string,
  productType: string
): string => `${entityId}-${period}-${productType}`;

/** Generate a unique alert ID */
export const generateAlertId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `alt-${timestamp}-${random}`;
};

/** Convert DynamoDB item to RiskMetric */
const itemToMetric = (item: RiskMetricItem): RiskMetric => {
  const { pk, sk, ...metric } = item;
  return metric;
};

/** Convert DynamoDB item to RiskAlert */
const itemToAlert = (item: RiskAlertItem): RiskAlert => {
  const { pk, sk, gsi1pk, gsi1sk, ...alert } = item;
  return alert;
};

// ============================================
// Risk Metrics Operations
// ============================================

/**
 * Create or update a risk metric
 */
export async function upsertRiskMetric(
  input: CreateRiskMetricInput
): Promise<RiskMetric> {
  const now = new Date().toISOString();
  const id = generateMetricId(input.entityId, input.period, input.productType);

  const item: RiskMetricItem = {
    pk: buildRiskMetricPK(input.entityId),
    sk: buildRiskMetricSK(input.period, input.productType),
    id,
    ...input,
    calculatedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.RISK_METRICS,
      Item: item,
    })
  );

  return itemToMetric(item);
}

/**
 * Get a specific risk metric
 */
export async function getRiskMetric(
  entityId: string,
  period: string,
  productType: ProductType
): Promise<RiskMetric | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.RISK_METRICS,
      Key: {
        pk: buildRiskMetricPK(entityId),
        sk: buildRiskMetricSK(period, productType),
      },
    })
  );

  if (!result.Item) {
    return null;
  }

  return itemToMetric(result.Item as RiskMetricItem);
}

/**
 * List all metrics for an entity (all periods and products)
 */
export async function listRiskMetricsByEntity(
  entityId: string,
  limit: number = 100
): Promise<RiskMetric[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.RISK_METRICS,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": buildRiskMetricPK(entityId),
      },
      ScanIndexForward: false, // Most recent first
      Limit: limit,
    })
  );

  const items = (result.Items || []) as RiskMetricItem[];
  return items.map(itemToMetric);
}

/**
 * List metrics for an entity filtered by period prefix
 * e.g., "2024-Q" for all quarters in 2024
 */
export async function listRiskMetricsByPeriod(
  entityId: string,
  periodPrefix: string,
  limit: number = 100
): Promise<RiskMetric[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.RISK_METRICS,
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)",
      ExpressionAttributeValues: {
        ":pk": buildRiskMetricPK(entityId),
        ":prefix": periodPrefix,
      },
      ScanIndexForward: false,
      Limit: limit,
    })
  );

  const items = (result.Items || []) as RiskMetricItem[];
  return items.map(itemToMetric);
}

/**
 * List metrics for an entity filtered by product type
 */
export async function listRiskMetricsByProduct(
  entityId: string,
  productType: ProductType,
  limit: number = 100
): Promise<RiskMetric[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.RISK_METRICS,
      KeyConditionExpression: "pk = :pk",
      FilterExpression: "productType = :productType",
      ExpressionAttributeValues: {
        ":pk": buildRiskMetricPK(entityId),
        ":productType": productType,
      },
      ScanIndexForward: false,
      Limit: limit,
    })
  );

  const items = (result.Items || []) as RiskMetricItem[];
  return items.map(itemToMetric);
}

/**
 * Update a risk metric
 */
export async function updateRiskMetric(
  entityId: string,
  period: string,
  productType: ProductType,
  updates: UpdateRiskMetricInput
): Promise<RiskMetric | null> {
  const updateExpressions: string[] = ["#updatedAt = :updatedAt"];
  const expressionAttributeNames: Record<string, string> = {
    "#updatedAt": "updatedAt",
  };
  const expressionAttributeValues: Record<string, unknown> = {
    ":updatedAt": new Date().toISOString(),
  };

  // Build update expressions for each field
  const fields = Object.entries(updates);
  for (const [key, value] of fields) {
    if (value !== undefined) {
      updateExpressions.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = value;
    }
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLES.RISK_METRICS,
      Key: {
        pk: buildRiskMetricPK(entityId),
        sk: buildRiskMetricSK(period, productType),
      },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    })
  );

  if (!result.Attributes) {
    return null;
  }

  return itemToMetric(result.Attributes as RiskMetricItem);
}

/**
 * Delete a risk metric
 */
export async function deleteRiskMetric(
  entityId: string,
  period: string,
  productType: ProductType
): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLES.RISK_METRICS,
      Key: {
        pk: buildRiskMetricPK(entityId),
        sk: buildRiskMetricSK(period, productType),
      },
    })
  );
}

/**
 * Batch create risk metrics (for seeding)
 */
export async function batchCreateRiskMetrics(
  metrics: CreateRiskMetricInput[]
): Promise<RiskMetric[]> {
  const results: RiskMetric[] = [];

  // Process in batches of 25 (DynamoDB limit)
  for (let i = 0; i < metrics.length; i += 25) {
    const batch = metrics.slice(i, i + 25);
    const now = new Date().toISOString();

    const items = batch.map((input) => {
      const id = generateMetricId(input.entityId, input.period, input.productType);
      return {
        pk: buildRiskMetricPK(input.entityId),
        sk: buildRiskMetricSK(input.period, input.productType),
        id,
        ...input,
        calculatedAt: now,
        createdAt: now,
        updatedAt: now,
      };
    });

    await docClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [TABLES.RISK_METRICS]: items.map((item) => ({
            PutRequest: { Item: item },
          })),
        },
      })
    );

    results.push(...items.map(itemToMetric));
  }

  return results;
}

// ============================================
// Risk Alerts Operations
// ============================================

/**
 * Create a new risk alert
 */
export async function createRiskAlert(
  input: CreateRiskAlertInput
): Promise<RiskAlert> {
  const now = new Date().toISOString();
  const alertId = generateAlertId();

  const item: RiskAlertItem = {
    pk: buildRiskAlertPK(input.entityId),
    sk: buildRiskAlertSK(now, alertId),
    gsi1pk: RISK_ALERT_ALL_PK,
    gsi1sk: buildRiskAlertSK(now, alertId),
    alertId,
    status: "new",
    ...input,
    detectedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.RISK_ALERTS,
      Item: item,
    })
  );

  return itemToAlert(item);
}

/**
 * Get an alert by entity and timestamp/alertId
 */
export async function getRiskAlert(
  entityId: string,
  timestamp: string,
  alertId: string
): Promise<RiskAlert | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.RISK_ALERTS,
      Key: {
        pk: buildRiskAlertPK(entityId),
        sk: buildRiskAlertSK(timestamp, alertId),
      },
    })
  );

  if (!result.Item) {
    return null;
  }

  return itemToAlert(result.Item as RiskAlertItem);
}

/**
 * List alerts for an entity
 */
export async function listRiskAlertsByEntity(
  entityId: string,
  limit: number = 50
): Promise<RiskAlert[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.RISK_ALERTS,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": buildRiskAlertPK(entityId),
      },
      ScanIndexForward: false, // Most recent first
      Limit: limit,
    })
  );

  const items = (result.Items || []) as RiskAlertItem[];
  return items.map(itemToAlert);
}

/**
 * List alerts by status
 */
export async function listRiskAlertsByStatus(
  entityId: string,
  status: AlertStatus,
  limit: number = 50
): Promise<RiskAlert[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.RISK_ALERTS,
      KeyConditionExpression: "pk = :pk",
      FilterExpression: "#status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":pk": buildRiskAlertPK(entityId),
        ":status": status,
      },
      ScanIndexForward: false,
      Limit: limit,
    })
  );

  const items = (result.Items || []) as RiskAlertItem[];
  return items.map(itemToAlert);
}

/**
 * List alerts by severity
 */
export async function listRiskAlertsBySeverity(
  entityId: string,
  severity: AlertSeverity,
  limit: number = 50
): Promise<RiskAlert[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.RISK_ALERTS,
      KeyConditionExpression: "pk = :pk",
      FilterExpression: "severity = :severity",
      ExpressionAttributeValues: {
        ":pk": buildRiskAlertPK(entityId),
        ":severity": severity,
      },
      ScanIndexForward: false,
      Limit: limit,
    })
  );

  const items = (result.Items || []) as RiskAlertItem[];
  return items.map(itemToAlert);
}

/**
 * List open (unresolved) alerts
 */
export async function listOpenRiskAlerts(
  entityId: string,
  limit: number = 50
): Promise<RiskAlert[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.RISK_ALERTS,
      KeyConditionExpression: "pk = :pk",
      FilterExpression: "#status IN (:new, :ack, :inv)",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":pk": buildRiskAlertPK(entityId),
        ":new": "new",
        ":ack": "acknowledged",
        ":inv": "investigating",
      },
      ScanIndexForward: false,
      Limit: limit,
    })
  );

  const items = (result.Items || []) as RiskAlertItem[];
  return items.map(itemToAlert);
}

/**
 * Update a risk alert
 */
export async function updateRiskAlert(
  entityId: string,
  timestamp: string,
  alertId: string,
  updates: UpdateRiskAlertInput
): Promise<RiskAlert | null> {
  const updateExpressions: string[] = ["#updatedAt = :updatedAt"];
  const expressionAttributeNames: Record<string, string> = {
    "#updatedAt": "updatedAt",
  };
  const expressionAttributeValues: Record<string, unknown> = {
    ":updatedAt": new Date().toISOString(),
  };

  // Build update expressions for each field
  const fields = Object.entries(updates);
  for (const [key, value] of fields) {
    if (value !== undefined) {
      // Handle reserved words
      if (key === "status") {
        updateExpressions.push("#status = :status");
        expressionAttributeNames["#status"] = "status";
        expressionAttributeValues[":status"] = value;
      } else {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    }
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLES.RISK_ALERTS,
      Key: {
        pk: buildRiskAlertPK(entityId),
        sk: buildRiskAlertSK(timestamp, alertId),
      },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    })
  );

  if (!result.Attributes) {
    return null;
  }

  return itemToAlert(result.Attributes as RiskAlertItem);
}

/**
 * Acknowledge an alert
 */
export async function acknowledgeRiskAlert(
  entityId: string,
  timestamp: string,
  alertId: string,
  assignedTo?: string
): Promise<RiskAlert | null> {
  return updateRiskAlert(entityId, timestamp, alertId, {
    status: "acknowledged",
    acknowledgedAt: new Date().toISOString(),
    assignedTo,
  });
}

/**
 * Resolve an alert
 */
export async function resolveRiskAlert(
  entityId: string,
  timestamp: string,
  alertId: string,
  resolution: string
): Promise<RiskAlert | null> {
  return updateRiskAlert(entityId, timestamp, alertId, {
    status: "resolved",
    resolvedAt: new Date().toISOString(),
    resolution,
  });
}

/**
 * Dismiss an alert
 */
export async function dismissRiskAlert(
  entityId: string,
  timestamp: string,
  alertId: string,
  resolution?: string
): Promise<RiskAlert | null> {
  return updateRiskAlert(entityId, timestamp, alertId, {
    status: "dismissed",
    resolvedAt: new Date().toISOString(),
    resolution: resolution || "Dismissed by user",
  });
}

/**
 * Delete a risk alert
 */
export async function deleteRiskAlert(
  entityId: string,
  timestamp: string,
  alertId: string
): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLES.RISK_ALERTS,
      Key: {
        pk: buildRiskAlertPK(entityId),
        sk: buildRiskAlertSK(timestamp, alertId),
      },
    })
  );
}

/**
 * Get alert statistics for an entity
 */
export async function getRiskAlertStats(entityId: string): Promise<AlertStats> {
  const alerts = await listRiskAlertsByEntity(entityId, 500);

  const stats: AlertStats = {
    total: alerts.length,
    bySeverity: { info: 0, warning: 0, critical: 0 },
    byStatus: {
      new: 0,
      acknowledged: 0,
      investigating: 0,
      resolved: 0,
      dismissed: 0,
    },
    byType: {
      loss_ratio_spike: 0,
      claim_surge: 0,
      premium_drop: 0,
      profitability_decline: 0,
      concentration_risk: 0,
      fraud_suspected: 0,
      threshold_breach: 0,
    },
    recentCount: 0,
  };

  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

  for (const alert of alerts) {
    stats.bySeverity[alert.severity]++;
    stats.byStatus[alert.status]++;
    stats.byType[alert.alertType]++;

    if (new Date(alert.detectedAt).getTime() > oneDayAgo) {
      stats.recentCount++;
    }
  }

  return stats;
}

/**
 * Batch create alerts (for testing/seeding)
 */
export async function batchCreateRiskAlerts(
  alerts: CreateRiskAlertInput[]
): Promise<RiskAlert[]> {
  const results: RiskAlert[] = [];

  for (const alert of alerts) {
    const created = await createRiskAlert(alert);
    results.push(created);
  }

  return results;
}
