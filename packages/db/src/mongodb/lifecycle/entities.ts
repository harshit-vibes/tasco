/**
 * MongoDB Entities Operations for Customer Lifecycle
 */

import { ObjectId, type Collection, type Filter } from "mongodb";
import { getCollection } from "../client";
import type {
  EntityDocument,
  Entity,
  CreateEntityInput,
  PaginatedResult,
} from "./types";

const COLLECTION_NAME = "entities";

// ============================================
// Collection Accessor
// ============================================

async function getEntitiesCollection(): Promise<Collection<EntityDocument>> {
  return getCollection<EntityDocument>(COLLECTION_NAME);
}

// ============================================
// Helper Functions
// ============================================

function documentToEntity(doc: EntityDocument): Entity {
  return {
    id: doc._id.toHexString(),
    entityId: doc.entityId,
    name: doc.name,
    shortName: doc.shortName,
    type: doc.type,
    category: doc.category,
    parentId: doc.parentId,
    metadata: doc.metadata,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

// ============================================
// CRUD Operations
// ============================================

/**
 * Create a new entity
 */
export async function createEntity(input: CreateEntityInput): Promise<Entity> {
  const collection = await getEntitiesCollection();
  const now = new Date();

  const entityId = input.id || new ObjectId().toHexString();

  const doc: Omit<EntityDocument, "_id"> = {
    entityId,
    name: input.name,
    shortName: input.shortName,
    type: input.type,
    category: input.category,
    parentId: input.parentId,
    metadata: input.metadata,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(doc as EntityDocument);
  const inserted = await collection.findOne({ _id: result.insertedId });

  if (!inserted) {
    throw new Error("Failed to create entity");
  }

  return documentToEntity(inserted);
}

/**
 * Get an entity by ID
 */
export async function getEntityById(id: string): Promise<Entity | null> {
  const collection = await getEntitiesCollection();

  // Try by ObjectId first, then by entityId
  try {
    const doc = await collection.findOne({ _id: new ObjectId(id) });
    if (doc) return documentToEntity(doc);
  } catch {
    // Not a valid ObjectId, try entityId
  }

  const doc = await collection.findOne({ entityId: id });
  return doc ? documentToEntity(doc) : null;
}

/**
 * Get all entities with pagination
 */
export async function listEntities(
  limit = 100,
  skip = 0
): Promise<PaginatedResult<Entity>> {
  const collection = await getEntitiesCollection();

  const [docs, total] = await Promise.all([
    collection
      .find({})
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    collection.countDocuments({}),
  ]);

  return {
    items: docs.map(documentToEntity),
    total,
    hasMore: skip + docs.length < total,
  };
}

/**
 * Get entities by category
 */
export async function listEntitiesByCategory(categories: string[]): Promise<Entity[]> {
  const collection = await getEntitiesCollection();
  const docs = await collection
    .find({ category: { $in: categories } })
    .sort({ name: 1 })
    .toArray();
  return docs.map(documentToEntity);
}

/**
 * Get entities by type
 */
export async function listEntitiesByType(type: Entity["type"]): Promise<Entity[]> {
  const collection = await getEntitiesCollection();
  const docs = await collection
    .find({ type })
    .sort({ name: 1 })
    .toArray();
  return docs.map(documentToEntity);
}

/**
 * Get entities by parent ID
 */
export async function getEntitiesByParent(parentId: string): Promise<Entity[]> {
  const collection = await getEntitiesCollection();
  const docs = await collection
    .find({ parentId })
    .sort({ name: 1 })
    .toArray();
  return docs.map(documentToEntity);
}

/**
 * Update an entity
 */
export async function updateEntity(
  id: string,
  input: Partial<CreateEntityInput>
): Promise<Entity | null> {
  const collection = await getEntitiesCollection();

  const updateDoc: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (input.name !== undefined) updateDoc.name = input.name;
  if (input.shortName !== undefined) updateDoc.shortName = input.shortName;
  if (input.type !== undefined) updateDoc.type = input.type;
  if (input.category !== undefined) updateDoc.category = input.category;
  if (input.parentId !== undefined) updateDoc.parentId = input.parentId;
  if (input.metadata !== undefined) updateDoc.metadata = input.metadata;

  // Try by ObjectId first
  try {
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: "after" }
    );
    if (result) return documentToEntity(result);
  } catch {
    // Not a valid ObjectId, try entityId
  }

  const result = await collection.findOneAndUpdate(
    { entityId: id },
    { $set: updateDoc },
    { returnDocument: "after" }
  );

  return result ? documentToEntity(result) : null;
}

/**
 * Delete an entity
 */
export async function deleteEntity(id: string): Promise<boolean> {
  const collection = await getEntitiesCollection();

  // Try by ObjectId first
  try {
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount > 0) return true;
  } catch {
    // Not a valid ObjectId, try entityId
  }

  const result = await collection.deleteOne({ entityId: id });
  return result.deletedCount > 0;
}

/**
 * Check if entities collection is empty
 */
export async function isEntitiesEmpty(): Promise<boolean> {
  const collection = await getEntitiesCollection();
  const count = await collection.countDocuments({});
  return count === 0;
}

/**
 * Batch create entities
 */
export async function batchCreateEntities(inputs: CreateEntityInput[]): Promise<Entity[]> {
  const collection = await getEntitiesCollection();
  const now = new Date();

  const docs = inputs.map((input) => ({
    entityId: input.id || new ObjectId().toHexString(),
    name: input.name,
    shortName: input.shortName,
    type: input.type,
    category: input.category,
    parentId: input.parentId,
    metadata: input.metadata,
    createdAt: now,
    updatedAt: now,
  }));

  const result = await collection.insertMany(docs as EntityDocument[]);
  const insertedIds = Object.values(result.insertedIds);

  const insertedDocs = await collection
    .find({ _id: { $in: insertedIds } })
    .toArray();

  return insertedDocs.map(documentToEntity);
}

/**
 * Search entities by name
 */
export async function searchEntities(query: string): Promise<Entity[]> {
  const collection = await getEntitiesCollection();

  const filter: Filter<EntityDocument> = {
    $or: [
      { name: { $regex: query, $options: "i" } },
      { shortName: { $regex: query, $options: "i" } },
    ],
  };

  const docs = await collection.find(filter).sort({ name: 1 }).toArray();
  return docs.map(documentToEntity);
}

/**
 * Get entity count
 */
export async function getEntityCount(): Promise<number> {
  const collection = await getEntitiesCollection();
  return collection.countDocuments({});
}

/**
 * Get entity hierarchy (parent with children)
 */
export async function getEntityHierarchy(): Promise<{
  parents: Entity[];
  holdings: Entity[];
  subsidiaries: Entity[];
}> {
  const collection = await getEntitiesCollection();

  const [parents, holdings, subsidiaries] = await Promise.all([
    collection.find({ type: "parent" }).sort({ name: 1 }).toArray(),
    collection.find({ type: "holding" }).sort({ name: 1 }).toArray(),
    collection.find({ type: "subsidiary" }).sort({ name: 1 }).toArray(),
  ]);

  return {
    parents: parents.map(documentToEntity),
    holdings: holdings.map(documentToEntity),
    subsidiaries: subsidiaries.map(documentToEntity),
  };
}
