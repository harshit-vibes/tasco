/**
 * MongoDB Order Operations for Sales Order App
 */

import { getCollection, toObjectId } from "../client";
import type {
  OrderDocument,
  Order,
  CreateOrderInput,
  UpdateOrderInput,
  OrderStatus,
  PaginatedResult,
} from "./types";

const COLLECTION = "salesOrders";

// ============================================
// Helper Functions
// ============================================

export function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

function orderToResponse(doc: OrderDocument): Order {
  return {
    id: doc._id?.toHexString() || "",
    orderId: doc.orderId,
    entityId: doc.entityId,
    status: doc.status,
    sourceType: doc.sourceType,
    sourceUrl: doc.sourceUrl,
    fileName: doc.fileName,
    fileSize: doc.fileSize,
    confidence: doc.confidence,
    extractedData: doc.extractedData,
    validation: doc.validation,
    processingTime: doc.processingTime,
    createdBy: doc.createdBy,
    reviewedBy: doc.reviewedBy,
    reviewedAt: doc.reviewedAt?.toISOString(),
    exportedAt: doc.exportedAt?.toISOString(),
    exportedBy: doc.exportedBy,
    assignedTo: doc.assignedTo,
    assignedAt: doc.assignedAt?.toISOString(),
    tags: doc.tags,
    internalNotes: doc.internalNotes,
    extractionAgentId: doc.extractionAgentId,
    validationAgentId: doc.validationAgentId,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

// ============================================
// CRUD Operations
// ============================================

/**
 * Create a new order
 */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const collection = await getCollection<OrderDocument>(COLLECTION);
  const now = new Date();

  const doc: OrderDocument = {
    orderId: generateOrderId(),
    entityId: input.entityId,
    status: "pending",
    sourceType: input.sourceType,
    sourceUrl: input.sourceUrl,
    fileName: input.fileName,
    fileSize: input.fileSize,
    confidence: input.confidence,
    extractedData: input.extractedData,
    validation: input.validation,
    processingTime: input.processingTime,
    createdBy: input.createdBy,
    extractionAgentId: input.extractionAgentId,
    validationAgentId: input.validationAgentId,
    tags: input.tags,
    internalNotes: input.internalNotes,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(doc);
  return orderToResponse({ ...doc, _id: result.insertedId });
}

/**
 * Get order by ID (MongoDB _id or orderId)
 */
export async function getOrder(id: string): Promise<Order | null> {
  const collection = await getCollection<OrderDocument>(COLLECTION);

  // Try to find by orderId first, then by _id
  let doc = await collection.findOne({ orderId: id });
  if (!doc && id.length === 24) {
    try {
      doc = await collection.findOne({ _id: toObjectId(id) });
    } catch {
      // Invalid ObjectId format
    }
  }

  return doc ? orderToResponse(doc) : null;
}

/**
 * Update an order
 */
export async function updateOrder(
  id: string,
  updates: UpdateOrderInput
): Promise<Order | null> {
  const collection = await getCollection<OrderDocument>(COLLECTION);
  const now = new Date();

  const updateDoc: Record<string, unknown> = {
    updatedAt: now,
  };

  if (updates.status !== undefined) {
    updateDoc.status = updates.status;
    // Set timestamps based on status change
    if (updates.status === "approved" || updates.status === "rejected") {
      updateDoc.reviewedAt = now;
      if (updates.reviewedBy) updateDoc.reviewedBy = updates.reviewedBy;
    }
    if (updates.status === "exported") {
      updateDoc.exportedAt = now;
      if (updates.exportedBy) updateDoc.exportedBy = updates.exportedBy;
    }
  }

  if (updates.confidence !== undefined) updateDoc.confidence = updates.confidence;
  if (updates.extractedData !== undefined) updateDoc.extractedData = updates.extractedData;
  if (updates.validation !== undefined) updateDoc.validation = updates.validation;
  if (updates.reviewedBy !== undefined) updateDoc.reviewedBy = updates.reviewedBy;
  if (updates.exportedBy !== undefined) updateDoc.exportedBy = updates.exportedBy;
  if (updates.assignedTo !== undefined) {
    updateDoc.assignedTo = updates.assignedTo;
    updateDoc.assignedAt = now;
  }
  if (updates.tags !== undefined) updateDoc.tags = updates.tags;
  if (updates.internalNotes !== undefined) updateDoc.internalNotes = updates.internalNotes;
  if (updates.validationAgentId !== undefined) updateDoc.validationAgentId = updates.validationAgentId;

  // Find by orderId or _id
  const filter = id.startsWith("ORD-")
    ? { orderId: id }
    : { _id: toObjectId(id) };

  const result = await collection.findOneAndUpdate(
    filter,
    { $set: updateDoc },
    { returnDocument: "after" }
  );

  return result ? orderToResponse(result) : null;
}

/**
 * Delete an order
 */
export async function deleteOrder(id: string): Promise<boolean> {
  const collection = await getCollection<OrderDocument>(COLLECTION);

  const filter = id.startsWith("ORD-")
    ? { orderId: id }
    : { _id: toObjectId(id) };

  const result = await collection.deleteOne(filter);
  return result.deletedCount > 0;
}

// ============================================
// List Operations
// ============================================

/**
 * List orders by entity with optional status filter
 */
export async function listOrdersByEntity(
  entityId: string,
  options?: {
    status?: OrderStatus;
    limit?: number;
    offset?: number;
  }
): Promise<PaginatedResult<Order>> {
  const collection = await getCollection<OrderDocument>(COLLECTION);
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;

  const filter: Record<string, unknown> = { entityId };
  if (options?.status) filter.status = options.status;

  const [docs, total] = await Promise.all([
    collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray(),
    collection.countDocuments(filter),
  ]);

  return {
    items: docs.map(orderToResponse),
    hasMore: offset + docs.length < total,
    total,
  };
}

/**
 * List orders by status
 */
export async function listOrdersByStatus(
  status: OrderStatus,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<PaginatedResult<Order>> {
  const collection = await getCollection<OrderDocument>(COLLECTION);
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;

  const filter = { status };

  const [docs, total] = await Promise.all([
    collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray(),
    collection.countDocuments(filter),
  ]);

  return {
    items: docs.map(orderToResponse),
    hasMore: offset + docs.length < total,
    total,
  };
}

/**
 * List all orders
 */
export async function listAllOrders(options?: {
  limit?: number;
  offset?: number;
}): Promise<PaginatedResult<Order>> {
  const collection = await getCollection<OrderDocument>(COLLECTION);
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;

  const [docs, total] = await Promise.all([
    collection
      .find({})
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray(),
    collection.countDocuments({}),
  ]);

  return {
    items: docs.map(orderToResponse),
    hasMore: offset + docs.length < total,
    total,
  };
}

/**
 * Get recent orders for entity
 */
export async function getRecentOrders(
  entityId: string,
  limit: number = 10
): Promise<Order[]> {
  const collection = await getCollection<OrderDocument>(COLLECTION);

  const docs = await collection
    .find({ entityId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  return docs.map(orderToResponse);
}

/**
 * Search orders by customer name/code
 */
export async function searchOrders(
  entityId: string,
  searchTerm: string,
  limit: number = 20
): Promise<Order[]> {
  const collection = await getCollection<OrderDocument>(COLLECTION);

  const searchRegex = new RegExp(searchTerm, "i");

  const docs = await collection
    .find({
      entityId,
      $or: [
        { "extractedData.customerName.value": searchRegex },
        { "extractedData.customerCode.value": searchRegex },
        { orderId: searchRegex },
      ],
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  return docs.map(orderToResponse);
}

// ============================================
// Count Operations
// ============================================

/**
 * Get order count by status
 */
export async function getOrderCountByStatus(status: OrderStatus): Promise<number> {
  const collection = await getCollection<OrderDocument>(COLLECTION);
  return collection.countDocuments({ status });
}

/**
 * Get order count by entity
 */
export async function getOrderCountByEntity(entityId: string): Promise<number> {
  const collection = await getCollection<OrderDocument>(COLLECTION);
  return collection.countDocuments({ entityId });
}

/**
 * Get orders created today
 */
export async function getOrdersCreatedToday(entityId: string): Promise<Order[]> {
  const collection = await getCollection<OrderDocument>(COLLECTION);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const docs = await collection
    .find({
      entityId,
      createdAt: { $gte: today },
    })
    .sort({ createdAt: -1 })
    .toArray();

  return docs.map(orderToResponse);
}

/**
 * Get pipeline status counts
 */
export async function getPipelineStatus(entityId: string): Promise<Record<OrderStatus, number>> {
  const collection = await getCollection<OrderDocument>(COLLECTION);

  const pipeline = [
    { $match: { entityId } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ];

  const results = await collection.aggregate(pipeline).toArray();

  const counts: Record<OrderStatus, number> = {
    pending: 0,
    reviewing: 0,
    approved: 0,
    rejected: 0,
    exported: 0,
  };

  for (const result of results) {
    counts[result._id as OrderStatus] = result.count;
  }

  return counts;
}
