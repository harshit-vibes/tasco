/**
 * MongoDB Metrics Operations for Sales Order App
 */

import { getCollection } from "../client";
import type {
  OrderMetricsDocument,
  OrderMetrics,
  MetricType,
  MetricValues,
  AggregatedMetrics,
  Order,
} from "./types";

const COLLECTION = "salesOrderMetrics";

// ============================================
// Helper Functions
// ============================================

function metricsToResponse(doc: OrderMetricsDocument): OrderMetrics {
  return {
    id: doc._id?.toHexString() || "",
    metricType: doc.metricType,
    date: doc.date,
    entityId: doc.entityId,
    metrics: doc.metrics,
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// ============================================
// Metrics CRUD Operations
// ============================================

/**
 * Get or create metrics for a specific period
 */
export async function getOrCreateMetrics(
  metricType: MetricType,
  date: string,
  entityId: string
): Promise<OrderMetrics> {
  const collection = await getCollection<OrderMetricsDocument>(COLLECTION);
  const now = new Date();

  const existing = await collection.findOne({ metricType, date, entityId });
  if (existing) {
    return metricsToResponse(existing);
  }

  const doc: OrderMetricsDocument = {
    metricType,
    date,
    entityId,
    metrics: {
      totalOrders: 0,
      approvedOrders: 0,
      rejectedOrders: 0,
      exportedOrders: 0,
      avgConfidence: 0,
      avgProcessingTimeMs: 0,
      totalTimeSavedHours: 0,
    },
    updatedAt: now,
  };

  const result = await collection.insertOne(doc);
  return metricsToResponse({ ...doc, _id: result.insertedId });
}

/**
 * Update metrics for a period based on orders
 */
export async function updateMetrics(
  metricType: MetricType,
  date: string,
  entityId: string,
  orders: Order[]
): Promise<OrderMetrics> {
  const collection = await getCollection<OrderMetricsDocument>(COLLECTION);
  const now = new Date();

  const totalOrders = orders.length;
  const approvedOrders = orders.filter((o) => o.status === "approved").length;
  const rejectedOrders = orders.filter((o) => o.status === "rejected").length;
  const exportedOrders = orders.filter((o) => o.status === "exported").length;

  const avgConfidence =
    totalOrders > 0
      ? orders.reduce((sum, o) => sum + o.confidence, 0) / totalOrders
      : 0;

  const avgProcessingTimeMs =
    totalOrders > 0
      ? orders.reduce((sum, o) => sum + o.processingTime.totalMs, 0) / totalOrders
      : 0;

  // Estimate time saved: manual processing ~5 minutes per order, AI ~30 seconds
  const manualTimeMinutes = totalOrders * 5;
  const aiTimeMinutes = totalOrders * 0.5;
  const totalTimeSavedHours = (manualTimeMinutes - aiTimeMinutes) / 60;

  const metrics: MetricValues = {
    totalOrders,
    approvedOrders,
    rejectedOrders,
    exportedOrders,
    avgConfidence: Math.round(avgConfidence * 100) / 100,
    avgProcessingTimeMs: Math.round(avgProcessingTimeMs),
    totalTimeSavedHours: Math.round(totalTimeSavedHours * 10) / 10,
  };

  const result = await collection.findOneAndUpdate(
    { metricType, date, entityId },
    {
      $set: { metrics, updatedAt: now },
      $setOnInsert: { metricType, date, entityId },
    },
    { upsert: true, returnDocument: "after" }
  );

  return metricsToResponse(result!);
}

/**
 * Get metrics for a specific period
 */
export async function getMetrics(
  metricType: MetricType,
  date: string,
  entityId: string
): Promise<OrderMetrics | null> {
  const collection = await getCollection<OrderMetricsDocument>(COLLECTION);
  const doc = await collection.findOne({ metricType, date, entityId });
  return doc ? metricsToResponse(doc) : null;
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
  const collection = await getCollection<OrderMetricsDocument>(COLLECTION);

  const docs = await collection
    .find({
      metricType,
      entityId,
      date: { $gte: startDate, $lte: endDate },
    })
    .sort({ date: 1 })
    .toArray();

  return docs.map(metricsToResponse);
}

// ============================================
// Convenience Methods
// ============================================

/**
 * Get today's metrics
 */
export async function getTodayMetrics(entityId: string): Promise<OrderMetrics | null> {
  const today = formatDate(new Date());
  return getMetrics("daily", today, entityId);
}

/**
 * Get current week's daily metrics
 */
export async function getWeekMetrics(entityId: string): Promise<OrderMetrics[]> {
  const now = new Date();
  const weekStart = getWeekStart(now);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    if (date <= now) {
      dates.push(formatDate(date));
    }
  }

  const collection = await getCollection<OrderMetricsDocument>(COLLECTION);

  const docs = await collection
    .find({
      metricType: "daily",
      entityId,
      date: { $in: dates },
    })
    .sort({ date: 1 })
    .toArray();

  return docs.map(metricsToResponse);
}

/**
 * Get current month's daily metrics
 */
export async function getMonthMetrics(entityId: string): Promise<OrderMetrics[]> {
  const now = new Date();
  const monthStart = getMonthStart(now);

  return getMetricsRange(
    "daily",
    formatDate(monthStart),
    formatDate(now),
    entityId
  );
}

/**
 * Aggregate multiple metrics records
 */
export function aggregateMetrics(metricsArray: OrderMetrics[]): AggregatedMetrics {
  if (metricsArray.length === 0) {
    return {
      totalOrders: 0,
      approvedOrders: 0,
      rejectedOrders: 0,
      exportedOrders: 0,
      avgConfidence: 0,
      avgProcessingTimeMs: 0,
      totalTimeSavedHours: 0,
      approvalRate: 0,
      rejectionRate: 0,
    };
  }

  const totals = metricsArray.reduce(
    (acc, m) => ({
      totalOrders: acc.totalOrders + m.metrics.totalOrders,
      approvedOrders: acc.approvedOrders + m.metrics.approvedOrders,
      rejectedOrders: acc.rejectedOrders + m.metrics.rejectedOrders,
      exportedOrders: acc.exportedOrders + m.metrics.exportedOrders,
      totalConfidence: acc.totalConfidence + m.metrics.avgConfidence * m.metrics.totalOrders,
      totalProcessingTime: acc.totalProcessingTime + m.metrics.avgProcessingTimeMs * m.metrics.totalOrders,
      totalTimeSavedHours: acc.totalTimeSavedHours + m.metrics.totalTimeSavedHours,
    }),
    {
      totalOrders: 0,
      approvedOrders: 0,
      rejectedOrders: 0,
      exportedOrders: 0,
      totalConfidence: 0,
      totalProcessingTime: 0,
      totalTimeSavedHours: 0,
    }
  );

  const decidedOrders = totals.approvedOrders + totals.rejectedOrders;

  return {
    totalOrders: totals.totalOrders,
    approvedOrders: totals.approvedOrders,
    rejectedOrders: totals.rejectedOrders,
    exportedOrders: totals.exportedOrders,
    avgConfidence:
      totals.totalOrders > 0
        ? Math.round((totals.totalConfidence / totals.totalOrders) * 100) / 100
        : 0,
    avgProcessingTimeMs:
      totals.totalOrders > 0
        ? Math.round(totals.totalProcessingTime / totals.totalOrders)
        : 0,
    totalTimeSavedHours: Math.round(totals.totalTimeSavedHours * 10) / 10,
    approvalRate:
      decidedOrders > 0
        ? Math.round((totals.approvedOrders / decidedOrders) * 10000) / 100
        : 0,
    rejectionRate:
      decidedOrders > 0
        ? Math.round((totals.rejectedOrders / decidedOrders) * 10000) / 100
        : 0,
  };
}
