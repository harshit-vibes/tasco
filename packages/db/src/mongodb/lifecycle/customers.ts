/**
 * MongoDB Customers Operations for Customer Lifecycle
 */

import { ObjectId, type Collection, type Filter } from "mongodb";
import { getCollection } from "../client";
import type {
  CustomerDocument,
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerSegment,
  CustomerStage,
  PaginatedResult,
} from "./types";

const COLLECTION_NAME = "customers";

// ============================================
// Collection Accessor
// ============================================

async function getCustomersCollection(): Promise<Collection<CustomerDocument>> {
  return getCollection<CustomerDocument>(COLLECTION_NAME);
}

// ============================================
// Helper Functions
// ============================================

function documentToCustomer(doc: CustomerDocument): Customer {
  return {
    id: doc._id.toHexString(),
    profile: doc.profile,
    lifecycle: doc.lifecycle,
    insights: doc.insights,
    preferences: doc.preferences,
    entityId: doc.entityId,
    lastActivityAt: doc.lastActivityAt.toISOString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

// ============================================
// CRUD Operations
// ============================================

/**
 * Create a new customer
 */
export async function createCustomer(input: CreateCustomerInput): Promise<Customer> {
  const collection = await getCustomersCollection();
  const now = new Date();

  const doc: Omit<CustomerDocument, "_id"> = {
    profile: input.profile,
    lifecycle: {
      stage: input.lifecycle.stage || "prospect",
      firstPurchaseDate: input.lifecycle.firstPurchaseDate,
      lastPurchaseDate: undefined,
    },
    insights: {
      lifetimeValue: input.insights?.lifetimeValue || 0,
      totalPurchases: input.insights?.totalPurchases || 0,
      averageOrderValue: input.insights?.averageOrderValue || 0,
      segment: input.insights?.segment || "new",
      churnRisk: input.insights?.churnRisk || 0,
      satisfactionScore: input.insights?.satisfactionScore || 50,
      recommendedActions: input.insights?.recommendedActions,
    },
    preferences: {
      brands: input.preferences?.brands || [],
      communicationChannels: input.preferences?.communicationChannels || ["email"],
      serviceInterests: input.preferences?.serviceInterests || [],
    },
    entityId: input.entityId,
    lastActivityAt: now,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(doc as CustomerDocument);
  const inserted = await collection.findOne({ _id: result.insertedId });

  if (!inserted) {
    throw new Error("Failed to create customer");
  }

  return documentToCustomer(inserted);
}

/**
 * Get a customer by ID
 */
export async function getCustomerById(id: string): Promise<Customer | null> {
  const collection = await getCustomersCollection();

  try {
    const doc = await collection.findOne({ _id: new ObjectId(id) });
    return doc ? documentToCustomer(doc) : null;
  } catch {
    return null;
  }
}

/**
 * Get all customers with pagination
 */
export async function getAllCustomers(
  limit = 100,
  skip = 0
): Promise<PaginatedResult<Customer>> {
  const collection = await getCustomersCollection();

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
    items: docs.map(documentToCustomer),
    total,
    hasMore: skip + docs.length < total,
  };
}

/**
 * Get customers by entity ID
 */
export async function getCustomersByEntity(entityId: string): Promise<Customer[]> {
  const collection = await getCustomersCollection();
  const docs = await collection
    .find({ entityId })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(documentToCustomer);
}

/**
 * Get customers by multiple entity IDs
 */
export async function getCustomersByEntities(entityIds: string[]): Promise<Customer[]> {
  const collection = await getCustomersCollection();
  const docs = await collection
    .find({ entityId: { $in: entityIds } })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(documentToCustomer);
}

/**
 * Get customers by segment
 */
export async function getCustomersBySegment(segment: CustomerSegment): Promise<Customer[]> {
  const collection = await getCustomersCollection();
  const docs = await collection
    .find({ "insights.segment": segment })
    .sort({ "insights.lifetimeValue": -1 })
    .toArray();
  return docs.map(documentToCustomer);
}

/**
 * Get customers by stage
 */
export async function getCustomersByStage(stage: CustomerStage): Promise<Customer[]> {
  const collection = await getCustomersCollection();
  const docs = await collection
    .find({ "lifecycle.stage": stage })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(documentToCustomer);
}

/**
 * Get at-risk customers (high churn risk or at-risk segment)
 */
export async function getAtRiskCustomers(entityIds?: string[]): Promise<Customer[]> {
  const collection = await getCustomersCollection();

  const filter: Filter<CustomerDocument> = {
    $or: [
      { "insights.segment": "at-risk" },
      { "insights.churnRisk": { $gte: 0.7 } },
      { "lifecycle.stage": "at-risk" },
    ],
  };

  if (entityIds && entityIds.length > 0) {
    filter.entityId = { $in: entityIds };
  }

  const docs = await collection
    .find(filter)
    .sort({ "insights.churnRisk": -1 })
    .toArray();
  return docs.map(documentToCustomer);
}

/**
 * Get VIP customers
 */
export async function getVIPCustomers(entityIds?: string[]): Promise<Customer[]> {
  const collection = await getCustomersCollection();

  const filter: Filter<CustomerDocument> = {
    "insights.segment": "vip",
  };

  if (entityIds && entityIds.length > 0) {
    filter.entityId = { $in: entityIds };
  }

  const docs = await collection
    .find(filter)
    .sort({ "insights.lifetimeValue": -1 })
    .toArray();
  return docs.map(documentToCustomer);
}

/**
 * Update a customer
 */
export async function updateCustomer(
  id: string,
  input: UpdateCustomerInput
): Promise<Customer | null> {
  const collection = await getCustomersCollection();

  const updateDoc: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  // Handle nested profile updates
  if (input.profile) {
    for (const [key, value] of Object.entries(input.profile)) {
      if (value !== undefined) {
        updateDoc[`profile.${key}`] = value;
      }
    }
  }

  // Handle nested lifecycle updates
  if (input.lifecycle) {
    for (const [key, value] of Object.entries(input.lifecycle)) {
      if (value !== undefined) {
        updateDoc[`lifecycle.${key}`] = value;
      }
    }
  }

  // Handle nested insights updates
  if (input.insights) {
    for (const [key, value] of Object.entries(input.insights)) {
      if (value !== undefined) {
        updateDoc[`insights.${key}`] = value;
      }
    }
  }

  // Handle nested preferences updates
  if (input.preferences) {
    for (const [key, value] of Object.entries(input.preferences)) {
      if (value !== undefined) {
        updateDoc[`preferences.${key}`] = value;
      }
    }
  }

  // Handle top-level fields
  if (input.entityId !== undefined) updateDoc.entityId = input.entityId;
  if (input.lastActivityAt !== undefined) {
    updateDoc.lastActivityAt = new Date(input.lastActivityAt);
  }

  try {
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: "after" }
    );

    return result ? documentToCustomer(result) : null;
  } catch {
    return null;
  }
}

/**
 * Delete a customer
 */
export async function deleteCustomer(id: string): Promise<boolean> {
  const collection = await getCustomersCollection();

  try {
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  } catch {
    return false;
  }
}

/**
 * Search customers by name or email
 */
export async function searchCustomers(
  query: string,
  entityIds?: string[]
): Promise<Customer[]> {
  const collection = await getCustomersCollection();

  const filter: Filter<CustomerDocument> = {
    $or: [
      { "profile.name": { $regex: query, $options: "i" } },
      { "profile.email": { $regex: query, $options: "i" } },
      { "profile.phone": { $regex: query, $options: "i" } },
    ],
  };

  if (entityIds && entityIds.length > 0) {
    filter.entityId = { $in: entityIds };
  }

  const docs = await collection.find(filter).sort({ createdAt: -1 }).toArray();
  return docs.map(documentToCustomer);
}

/**
 * Get customer statistics
 */
export async function getCustomerStats(entityIds?: string[]): Promise<{
  total: number;
  bySegment: Record<string, number>;
  byStage: Record<string, number>;
  atRisk: number;
  totalLifetimeValue: number;
}> {
  const collection = await getCustomersCollection();

  const filter: Filter<CustomerDocument> = entityIds
    ? { entityId: { $in: entityIds } }
    : {};

  const pipeline = [
    { $match: filter },
    {
      $facet: {
        total: [{ $count: "count" }],
        bySegment: [{ $group: { _id: "$insights.segment", count: { $sum: 1 } } }],
        byStage: [{ $group: { _id: "$lifecycle.stage", count: { $sum: 1 } } }],
        atRisk: [
          {
            $match: {
              $or: [
                { "insights.segment": "at-risk" },
                { "insights.churnRisk": { $gte: 0.7 } },
              ],
            },
          },
          { $count: "count" },
        ],
        ltv: [{ $group: { _id: null, total: { $sum: "$insights.lifetimeValue" } } }],
      },
    },
  ];

  const [result] = await collection.aggregate(pipeline).toArray();

  return {
    total: result.total[0]?.count || 0,
    bySegment: Object.fromEntries(
      result.bySegment.map((s: { _id: string; count: number }) => [s._id, s.count])
    ),
    byStage: Object.fromEntries(
      result.byStage.map((s: { _id: string; count: number }) => [s._id, s.count])
    ),
    atRisk: result.atRisk[0]?.count || 0,
    totalLifetimeValue: result.ltv[0]?.total || 0,
  };
}

/**
 * Bulk create customers
 */
export async function bulkCreateCustomers(
  inputs: CreateCustomerInput[]
): Promise<Customer[]> {
  const collection = await getCustomersCollection();
  const now = new Date();

  const docs = inputs.map((input) => ({
    profile: input.profile,
    lifecycle: {
      stage: input.lifecycle.stage || "prospect",
      firstPurchaseDate: input.lifecycle.firstPurchaseDate,
    },
    insights: {
      lifetimeValue: input.insights?.lifetimeValue || 0,
      totalPurchases: input.insights?.totalPurchases || 0,
      averageOrderValue: input.insights?.averageOrderValue || 0,
      segment: input.insights?.segment || "new",
      churnRisk: input.insights?.churnRisk || 0,
      satisfactionScore: input.insights?.satisfactionScore || 50,
    },
    preferences: {
      brands: input.preferences?.brands || [],
      communicationChannels: input.preferences?.communicationChannels || ["email"],
      serviceInterests: input.preferences?.serviceInterests || [],
    },
    entityId: input.entityId,
    lastActivityAt: now,
    createdAt: now,
    updatedAt: now,
  }));

  const result = await collection.insertMany(docs as CustomerDocument[]);
  const insertedIds = Object.values(result.insertedIds);

  const insertedDocs = await collection
    .find({ _id: { $in: insertedIds } })
    .toArray();

  return insertedDocs.map(documentToCustomer);
}
