/**
 * MongoDB Campaigns Operations for Customer Lifecycle
 */

import { ObjectId, type Collection, type Filter } from "mongodb";
import { getCollection } from "../client";
import type {
  CampaignDocument,
  Campaign,
  CreateCampaignInput,
  UpdateCampaignInput,
  CampaignStatus,
  CampaignType,
  PaginatedResult,
} from "./types";

const COLLECTION_NAME = "campaigns";

// ============================================
// Collection Accessor
// ============================================

async function getCampaignsCollection(): Promise<Collection<CampaignDocument>> {
  return getCollection<CampaignDocument>(COLLECTION_NAME);
}

// ============================================
// Helper Functions
// ============================================

function documentToCampaign(doc: CampaignDocument): Campaign {
  return {
    id: doc._id.toHexString(),
    name: doc.name,
    type: doc.type,
    status: doc.status,
    targetSegment: doc.targetSegment,
    budget: doc.budget,
    startDate: doc.startDate,
    endDate: doc.endDate,
    metrics: doc.metrics,
    createdBy: doc.createdBy,
    entityId: doc.entityId,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

// ============================================
// CRUD Operations
// ============================================

/**
 * Create a new campaign
 */
export async function createCampaign(input: CreateCampaignInput): Promise<Campaign> {
  const collection = await getCampaignsCollection();
  const now = new Date();

  const doc: Omit<CampaignDocument, "_id"> = {
    name: input.name,
    type: input.type,
    status: input.status || "draft",
    targetSegment: input.targetSegment,
    budget: input.budget,
    startDate: input.startDate,
    endDate: input.endDate,
    metrics: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
      revenue: 0,
    },
    createdBy: input.createdBy,
    entityId: input.entityId,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(doc as CampaignDocument);
  const inserted = await collection.findOne({ _id: result.insertedId });

  if (!inserted) {
    throw new Error("Failed to create campaign");
  }

  return documentToCampaign(inserted);
}

/**
 * Get a campaign by ID
 */
export async function getCampaignById(id: string): Promise<Campaign | null> {
  const collection = await getCampaignsCollection();

  try {
    const doc = await collection.findOne({ _id: new ObjectId(id) });
    return doc ? documentToCampaign(doc) : null;
  } catch {
    return null;
  }
}

/**
 * Get all campaigns with pagination
 */
export async function getAllCampaigns(
  limit = 100,
  skip = 0
): Promise<PaginatedResult<Campaign>> {
  const collection = await getCampaignsCollection();

  const [docs, total] = await Promise.all([
    collection
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    collection.countDocuments({}),
  ]);

  return {
    items: docs.map(documentToCampaign),
    total,
    hasMore: skip + docs.length < total,
  };
}

/**
 * Get campaigns by entity ID
 */
export async function getCampaignsByEntity(entityId: string): Promise<Campaign[]> {
  const collection = await getCampaignsCollection();
  const docs = await collection
    .find({ entityId })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(documentToCampaign);
}

/**
 * Get campaigns by multiple entity IDs
 */
export async function getCampaignsByEntities(entityIds: string[]): Promise<Campaign[]> {
  const collection = await getCampaignsCollection();
  const docs = await collection
    .find({ entityId: { $in: entityIds } })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(documentToCampaign);
}

/**
 * Get campaigns by status
 */
export async function getCampaignsByStatus(status: CampaignStatus): Promise<Campaign[]> {
  const collection = await getCampaignsCollection();
  const docs = await collection
    .find({ status })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(documentToCampaign);
}

/**
 * Get campaigns by type
 */
export async function getCampaignsByType(type: CampaignType): Promise<Campaign[]> {
  const collection = await getCampaignsCollection();
  const docs = await collection
    .find({ type })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(documentToCampaign);
}

/**
 * Get active campaigns
 */
export async function getActiveCampaigns(entityIds?: string[]): Promise<Campaign[]> {
  const collection = await getCampaignsCollection();

  const filter: Filter<CampaignDocument> = {
    status: "active",
  };

  if (entityIds && entityIds.length > 0) {
    filter.entityId = { $in: entityIds };
  }

  const docs = await collection.find(filter).sort({ startDate: -1 }).toArray();
  return docs.map(documentToCampaign);
}

/**
 * Update a campaign
 */
export async function updateCampaign(
  id: string,
  input: UpdateCampaignInput
): Promise<Campaign | null> {
  const collection = await getCampaignsCollection();

  const updateDoc: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  // Handle top-level fields
  if (input.name !== undefined) updateDoc.name = input.name;
  if (input.status !== undefined) updateDoc.status = input.status;
  if (input.targetSegment !== undefined) updateDoc.targetSegment = input.targetSegment;
  if (input.budget !== undefined) updateDoc.budget = input.budget;
  if (input.endDate !== undefined) updateDoc.endDate = input.endDate;

  // Handle nested metrics updates
  if (input.metrics) {
    for (const [key, value] of Object.entries(input.metrics)) {
      if (value !== undefined) {
        updateDoc[`metrics.${key}`] = value;
      }
    }
  }

  try {
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: "after" }
    );

    return result ? documentToCampaign(result) : null;
  } catch {
    return null;
  }
}

/**
 * Delete a campaign
 */
export async function deleteCampaign(id: string): Promise<boolean> {
  const collection = await getCampaignsCollection();

  try {
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  } catch {
    return false;
  }
}

/**
 * Get campaign statistics
 */
export async function getCampaignStats(entityIds?: string[]): Promise<{
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  totalBudget: number;
  totalRevenue: number;
}> {
  const collection = await getCampaignsCollection();

  const filter: Filter<CampaignDocument> = entityIds
    ? { entityId: { $in: entityIds } }
    : {};

  const pipeline = [
    { $match: filter },
    {
      $facet: {
        total: [{ $count: "count" }],
        byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
        byType: [{ $group: { _id: "$type", count: { $sum: 1 } } }],
        budget: [{ $group: { _id: null, total: { $sum: "$budget" } } }],
        revenue: [{ $group: { _id: null, total: { $sum: "$metrics.revenue" } } }],
      },
    },
  ];

  const [result] = await collection.aggregate(pipeline).toArray();

  return {
    total: result.total[0]?.count || 0,
    byStatus: Object.fromEntries(
      result.byStatus.map((s: { _id: string; count: number }) => [s._id, s.count])
    ),
    byType: Object.fromEntries(
      result.byType.map((t: { _id: string; count: number }) => [t._id, t.count])
    ),
    totalBudget: result.budget[0]?.total || 0,
    totalRevenue: result.revenue[0]?.total || 0,
  };
}

/**
 * Increment campaign metrics
 */
export async function incrementCampaignMetric(
  id: string,
  metric: keyof Campaign["metrics"],
  amount = 1
): Promise<Campaign | null> {
  const collection = await getCampaignsCollection();

  try {
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $inc: { [`metrics.${metric}`]: amount },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" }
    );

    return result ? documentToCampaign(result) : null;
  } catch {
    return null;
  }
}
