/**
 * MongoDB Activity Operations for Sales Order App
 */

import { getCollection } from "../client";
import type {
  OrderActivityDocument,
  OrderActivity,
  CreateActivityInput,
  PaginatedResult,
} from "./types";

const COLLECTION = "salesOrderActivity";

// ============================================
// Helper Functions
// ============================================

function generateActivityId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ACT-${timestamp}-${random}`;
}

function activityToResponse(doc: OrderActivityDocument): OrderActivity {
  return {
    id: doc._id?.toHexString() || "",
    activityId: doc.activityId,
    orderId: doc.orderId,
    entityId: doc.entityId,
    action: doc.action,
    details: doc.details,
    timestamp: doc.timestamp.toISOString(),
  };
}

// ============================================
// CRUD Operations
// ============================================

/**
 * Log an activity for an order
 */
export async function logActivity(input: CreateActivityInput): Promise<OrderActivity> {
  const collection = await getCollection<OrderActivityDocument>(COLLECTION);
  const now = new Date();

  const doc: OrderActivityDocument = {
    activityId: generateActivityId(),
    orderId: input.orderId,
    entityId: input.entityId,
    action: input.action,
    details: input.details || {},
    timestamp: now,
  };

  const result = await collection.insertOne(doc);
  return activityToResponse({ ...doc, _id: result.insertedId });
}

/**
 * Get activity for an order
 */
export async function getOrderActivity(
  orderId: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<PaginatedResult<OrderActivity>> {
  const collection = await getCollection<OrderActivityDocument>(COLLECTION);
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;

  const filter = { orderId };

  const [docs, total] = await Promise.all([
    collection
      .find(filter)
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .toArray(),
    collection.countDocuments(filter),
  ]);

  return {
    items: docs.map(activityToResponse),
    hasMore: offset + docs.length < total,
    total,
  };
}

/**
 * Get recent activity for an order
 */
export async function getRecentActivity(
  orderId: string,
  limit: number = 10
): Promise<OrderActivity[]> {
  const collection = await getCollection<OrderActivityDocument>(COLLECTION);

  const docs = await collection
    .find({ orderId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();

  return docs.map(activityToResponse);
}

/**
 * Get all recent activity for an entity
 */
export async function getEntityActivity(
  entityId: string,
  limit: number = 20
): Promise<OrderActivity[]> {
  const collection = await getCollection<OrderActivityDocument>(COLLECTION);

  const docs = await collection
    .find({ entityId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();

  return docs.map(activityToResponse);
}

/**
 * Delete activity for an order (cleanup)
 */
export async function deleteOrderActivity(orderId: string): Promise<number> {
  const collection = await getCollection<OrderActivityDocument>(COLLECTION);
  const result = await collection.deleteMany({ orderId });
  return result.deletedCount;
}
