/**
 * MongoDB Leads Operations for Customer Lifecycle
 */

import { ObjectId, type Collection, type Filter } from "mongodb";
import { getCollection } from "../client";
import type {
  LeadDocument,
  Lead,
  CreateLeadInput,
  UpdateLeadInput,
  LeadStats,
  LeadPriority,
  LeadStatus,
  PaginatedResult,
} from "./types";

const COLLECTION_NAME = "leads";

// ============================================
// Collection Accessor
// ============================================

async function getLeadsCollection(): Promise<Collection<LeadDocument>> {
  return getCollection<LeadDocument>(COLLECTION_NAME);
}

// ============================================
// Helper Functions
// ============================================

function documentToLead(doc: LeadDocument): Lead {
  return {
    id: doc._id.toHexString(),
    customer: doc.customer,
    source: doc.source,
    status: doc.status,
    priority: doc.priority,
    score: doc.score,
    aiScore: doc.aiScore,
    interest: doc.interest,
    assignedTo: doc.assignedTo,
    lastContactedAt: doc.lastContactedAt?.toISOString(),
    entityId: doc.entityId,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

// ============================================
// CRUD Operations
// ============================================

/**
 * Create a new lead
 */
export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const collection = await getLeadsCollection();
  const now = new Date();

  const doc: Omit<LeadDocument, "_id"> = {
    customer: input.customer,
    source: input.source,
    status: input.status || "new",
    priority: input.priority || "warm",
    score: input.score ?? 50,
    interest: input.interest,
    assignedTo: input.assignedTo,
    entityId: input.entityId,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(doc as LeadDocument);
  const inserted = await collection.findOne({ _id: result.insertedId });

  if (!inserted) {
    throw new Error("Failed to create lead");
  }

  return documentToLead(inserted);
}

/**
 * Get a lead by ID
 */
export async function getLeadById(id: string): Promise<Lead | null> {
  const collection = await getLeadsCollection();

  try {
    const doc = await collection.findOne({ _id: new ObjectId(id) });
    return doc ? documentToLead(doc) : null;
  } catch {
    return null;
  }
}

/**
 * Get all leads with pagination
 */
export async function getAllLeads(
  limit = 100,
  skip = 0
): Promise<PaginatedResult<Lead>> {
  const collection = await getLeadsCollection();

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
    items: docs.map(documentToLead),
    total,
    hasMore: skip + docs.length < total,
  };
}

/**
 * Get leads by entity ID
 */
export async function getLeadsByEntity(entityId: string): Promise<Lead[]> {
  const collection = await getLeadsCollection();
  const docs = await collection
    .find({ entityId })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(documentToLead);
}

/**
 * Get leads by multiple entity IDs
 */
export async function getLeadsByEntities(entityIds: string[]): Promise<Lead[]> {
  const collection = await getLeadsCollection();
  const docs = await collection
    .find({ entityId: { $in: entityIds } })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(documentToLead);
}

/**
 * Get leads by priority
 */
export async function getLeadsByPriority(priority: LeadPriority): Promise<Lead[]> {
  const collection = await getLeadsCollection();
  const docs = await collection
    .find({ priority })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(documentToLead);
}

/**
 * Get leads by status
 */
export async function getLeadsByStatus(status: LeadStatus): Promise<Lead[]> {
  const collection = await getLeadsCollection();
  const docs = await collection
    .find({ status })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(documentToLead);
}

/**
 * Update a lead
 */
export async function updateLead(
  id: string,
  input: UpdateLeadInput
): Promise<Lead | null> {
  const collection = await getLeadsCollection();

  const updateDoc: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  // Handle nested customer updates
  if (input.customer) {
    for (const [key, value] of Object.entries(input.customer)) {
      if (value !== undefined) {
        updateDoc[`customer.${key}`] = value;
      }
    }
  }

  // Handle nested interest updates
  if (input.interest) {
    for (const [key, value] of Object.entries(input.interest)) {
      if (value !== undefined) {
        updateDoc[`interest.${key}`] = value;
      }
    }
  }

  // Handle top-level fields
  if (input.source !== undefined) updateDoc.source = input.source;
  if (input.status !== undefined) updateDoc.status = input.status;
  if (input.priority !== undefined) updateDoc.priority = input.priority;
  if (input.score !== undefined) updateDoc.score = input.score;
  if (input.aiScore !== undefined) updateDoc.aiScore = input.aiScore;
  if (input.assignedTo !== undefined) updateDoc.assignedTo = input.assignedTo;
  if (input.lastContactedAt !== undefined) {
    updateDoc.lastContactedAt = new Date(input.lastContactedAt);
  }

  try {
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: "after" }
    );

    return result ? documentToLead(result) : null;
  } catch {
    return null;
  }
}

/**
 * Delete a lead
 */
export async function deleteLead(id: string): Promise<boolean> {
  const collection = await getLeadsCollection();

  try {
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  } catch {
    return false;
  }
}

/**
 * Get lead statistics
 */
export async function getLeadStats(entityIds?: string[]): Promise<LeadStats> {
  const collection = await getLeadsCollection();

  const filter: Filter<LeadDocument> = entityIds
    ? { entityId: { $in: entityIds } }
    : {};

  const pipeline = [
    { $match: filter },
    {
      $facet: {
        total: [{ $count: "count" }],
        byPriority: [{ $group: { _id: "$priority", count: { $sum: 1 } } }],
        byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
      },
    },
  ];

  const [result] = await collection.aggregate(pipeline).toArray();

  const total = result.total[0]?.count || 0;
  const priorityCounts = Object.fromEntries(
    result.byPriority.map((p: { _id: string; count: number }) => [p._id, p.count])
  );
  const statusCounts = Object.fromEntries(
    result.byStatus.map((s: { _id: string; count: number }) => [s._id, s.count])
  );

  return {
    total,
    hot: priorityCounts.hot || 0,
    warm: priorityCounts.warm || 0,
    cold: priorityCounts.cold || 0,
    new: statusCounts.new || 0,
    contacted: statusCounts.contacted || 0,
    qualified: statusCounts.qualified || 0,
    conversionRate: total > 0 ? ((statusCounts.converted || 0) / total) * 100 : 0,
  };
}

/**
 * Search leads by customer name or email
 */
export async function searchLeads(query: string, entityIds?: string[]): Promise<Lead[]> {
  const collection = await getLeadsCollection();

  const filter: Filter<LeadDocument> = {
    $or: [
      { "customer.name": { $regex: query, $options: "i" } },
      { "customer.email": { $regex: query, $options: "i" } },
      { "customer.phone": { $regex: query, $options: "i" } },
    ],
  };

  if (entityIds && entityIds.length > 0) {
    filter.entityId = { $in: entityIds };
  }

  const docs = await collection.find(filter).sort({ createdAt: -1 }).toArray();
  return docs.map(documentToLead);
}

/**
 * Get hot leads (priority = hot, status not converted/lost)
 */
export async function getHotLeads(entityIds?: string[]): Promise<Lead[]> {
  const collection = await getLeadsCollection();

  const filter: Filter<LeadDocument> = {
    priority: "hot",
    status: { $nin: ["converted", "lost"] },
  };

  if (entityIds && entityIds.length > 0) {
    filter.entityId = { $in: entityIds };
  }

  const docs = await collection.find(filter).sort({ score: -1 }).toArray();
  return docs.map(documentToLead);
}

/**
 * Get leads count by entity
 */
export async function getLeadsCountByEntity(
  entityId: string
): Promise<number> {
  const collection = await getLeadsCollection();
  return collection.countDocuments({ entityId });
}

/**
 * Bulk create leads
 */
export async function bulkCreateLeads(inputs: CreateLeadInput[]): Promise<Lead[]> {
  const collection = await getLeadsCollection();
  const now = new Date();

  const docs = inputs.map((input) => ({
    customer: input.customer,
    source: input.source,
    status: input.status || "new",
    priority: input.priority || "warm",
    score: input.score ?? 50,
    interest: input.interest,
    assignedTo: input.assignedTo,
    entityId: input.entityId,
    createdAt: now,
    updatedAt: now,
  }));

  const result = await collection.insertMany(docs as LeadDocument[]);
  const insertedIds = Object.values(result.insertedIds);

  const insertedDocs = await collection
    .find({ _id: { $in: insertedIds } })
    .toArray();

  return insertedDocs.map(documentToLead);
}
