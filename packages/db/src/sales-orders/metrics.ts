/**
 * Sales Order Metrics operations
 */

import { PutCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../client";
import { TABLES, buildMetricsPK, buildMetricsSK } from "../tables";
import type {
  OrderMetrics,
  MetricType,
  MetricsItem_DB,
  Order,
} from "./types";
import { calculateTimeSaved } from "./utils";

/**
 * Convert DynamoDB item to OrderMetrics
 */
function itemToMetrics(item: MetricsItem_DB): OrderMetrics {
  return {
    metricType: item.metricType,
    date: item.date,
    entityId: item.entityId,
    metrics: item.metrics,
    updatedAt: item.updatedAt,
  };
}

/**
 * Update metrics for a given date and entity
 */
export async function updateMetrics(
  metricType: MetricType,
  date: string,
  entityId: string,
  orders: Order[]
): Promise<OrderMetrics> {
  // Calculate metrics from orders
  const totalOrders = orders.length;
  const approvedOrders = orders.filter((o) => o.status === "approved").length;
  const rejectedOrders = orders.filter((o) => o.status === "rejected").length;
  const exportedOrders = orders.filter((o) => o.status === "exported").length;

  const avgConfidence =
    orders.length > 0
      ? orders.reduce((sum, o) => sum + o.confidence, 0) / orders.length
      : 0;

  const avgProcessingTimeMs =
    orders.length > 0
      ? orders.reduce((sum, o) => sum + o.processingTime.totalMs, 0) /
        orders.length
      : 0;

  const timeSaved = calculateTimeSaved(orders.length, avgProcessingTimeMs);

  const pk = buildMetricsPK(metricType, date);
  const sk = buildMetricsSK(entityId);

  const metricsItem: MetricsItem_DB = {
    pk,
    sk,
    metricType,
    date,
    entityId,
    metrics: {
      totalOrders,
      approvedOrders,
      rejectedOrders,
      exportedOrders,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      avgProcessingTimeMs: Math.round(avgProcessingTimeMs),
      totalTimeSavedHours: Math.round(timeSaved.savedHours * 100) / 100,
    },
    updatedAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.SALES_ORDER_METRICS,
      Item: metricsItem,
    })
  );

  return itemToMetrics(metricsItem);
}

/**
 * Get metrics for a specific date and entity
 */
export async function getMetrics(
  metricType: MetricType,
  date: string,
  entityId: string
): Promise<OrderMetrics | null> {
  const pk = buildMetricsPK(metricType, date);
  const sk = buildMetricsSK(entityId);

  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.SALES_ORDER_METRICS,
      Key: { pk, sk },
    })
  );

  return result.Item ? itemToMetrics(result.Item as MetricsItem_DB) : null;
}

/**
 * Get metrics for a date range
 */
export async function getMetricsRange(
  metricType: MetricType,
  startDate: string,
  endDate: string,
  entityId: string
): Promise<OrderMetrics[]> {
  const sk = buildMetricsSK(entityId);

  // Generate all dates between startDate and endDate
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);

    // Increment based on metric type
    if (metricType === "daily") {
      current.setDate(current.getDate() + 1);
    } else if (metricType === "weekly") {
      current.setDate(current.getDate() + 7);
    } else if (metricType === "monthly") {
      current.setMonth(current.getMonth() + 1);
    }
  }

  // Query each date
  const metricsPromises = dates.map((date) =>
    getMetrics(metricType, date, entityId)
  );

  const results = await Promise.all(metricsPromises);

  // Filter out null results
  return results.filter((m): m is OrderMetrics => m !== null);
}

/**
 * Get today's metrics for dashboard
 */
export async function getTodayMetrics(
  entityId: string
): Promise<OrderMetrics | null> {
  const today = new Date().toISOString().split("T")[0];
  return getMetrics("daily", today, entityId);
}

/**
 * Get this week's metrics
 */
export async function getWeekMetrics(
  entityId: string
): Promise<OrderMetrics[]> {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  const startDate = weekAgo.toISOString().split("T")[0];
  const endDate = today.toISOString().split("T")[0];

  return getMetricsRange("daily", startDate, endDate, entityId);
}

/**
 * Get this month's metrics
 */
export async function getMonthMetrics(
  entityId: string
): Promise<OrderMetrics[]> {
  const today = new Date();
  const monthAgo = new Date(today);
  monthAgo.setMonth(today.getMonth() - 1);

  const startDate = monthAgo.toISOString().split("T")[0];
  const endDate = today.toISOString().split("T")[0];

  return getMetricsRange("daily", startDate, endDate, entityId);
}

/**
 * Calculate aggregated metrics from a list of OrderMetrics
 */
export function aggregateMetrics(metricsArray: OrderMetrics[]): {
  totalOrders: number;
  approvedOrders: number;
  rejectedOrders: number;
  exportedOrders: number;
  avgConfidence: number;
  avgProcessingTimeMs: number;
  totalTimeSavedHours: number;
} {
  if (metricsArray.length === 0) {
    return {
      totalOrders: 0,
      approvedOrders: 0,
      rejectedOrders: 0,
      exportedOrders: 0,
      avgConfidence: 0,
      avgProcessingTimeMs: 0,
      totalTimeSavedHours: 0,
    };
  }

  const totalOrders = metricsArray.reduce(
    (sum, m) => sum + m.metrics.totalOrders,
    0
  );
  const approvedOrders = metricsArray.reduce(
    (sum, m) => sum + m.metrics.approvedOrders,
    0
  );
  const rejectedOrders = metricsArray.reduce(
    (sum, m) => sum + m.metrics.rejectedOrders,
    0
  );
  const exportedOrders = metricsArray.reduce(
    (sum, m) => sum + m.metrics.exportedOrders,
    0
  );
  const totalTimeSavedHours = metricsArray.reduce(
    (sum, m) => sum + m.metrics.totalTimeSavedHours,
    0
  );

  const avgConfidence =
    metricsArray.reduce((sum, m) => sum + m.metrics.avgConfidence, 0) /
    metricsArray.length;

  const avgProcessingTimeMs =
    metricsArray.reduce((sum, m) => sum + m.metrics.avgProcessingTimeMs, 0) /
    metricsArray.length;

  return {
    totalOrders,
    approvedOrders,
    rejectedOrders,
    exportedOrders,
    avgConfidence: Math.round(avgConfidence * 100) / 100,
    avgProcessingTimeMs: Math.round(avgProcessingTimeMs),
    totalTimeSavedHours: Math.round(totalTimeSavedHours * 100) / 100,
  };
}
