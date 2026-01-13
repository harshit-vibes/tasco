/**
 * MongoDB Document (Knowledge Base) Operations
 */

import { ObjectId, type Filter, type Sort } from "mongodb";
import { getDocumentsCollection } from "./collections";
import type {
  DocumentDocument,
  CreateDocumentInput,
  UpdateDocumentInput,
  DocumentVersion,
  PaginatedResult,
  PaginationOptions,
} from "./types";

// Response type (mirrors existing document interface)
export interface Document {
  id: string;
  appId: string;
  entityId: string;
  name: string;
  filename: string;
  category: string;
  description?: string;
  blobUrl: string;
  blobPathname: string;
  size?: number;
  mimeType?: string;
  versions: DocumentVersion[];
  currentVersion: number;
  ragDocumentId?: string;
  syncedToKB: boolean;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

// Transform document to response
function toDocument(doc: DocumentDocument): Document {
  return {
    id: doc._id?.toHexString() || "",
    appId: doc.appId,
    entityId: doc.entityId,
    name: doc.name,
    filename: doc.filename,
    category: doc.category,
    description: doc.description,
    blobUrl: doc.blobUrl,
    blobPathname: doc.blobPathname,
    size: doc.size,
    mimeType: doc.mimeType,
    versions: doc.versions || [],
    currentVersion: doc.currentVersion || 1,
    ragDocumentId: doc.ragDocumentId,
    syncedToKB: doc.syncedToKB,
    lastSyncedAt: doc.lastSyncedAt?.toISOString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    metadata: doc.metadata,
  };
}

/**
 * Create a new document record
 */
export async function createDocument(
  input: CreateDocumentInput
): Promise<Document> {
  const collection = await getDocumentsCollection();
  const now = new Date();

  const firstVersion: DocumentVersion = {
    version: 1,
    blobUrl: input.blobUrl,
    blobPathname: input.blobPathname,
    uploadedAt: now,
    size: input.size,
  };

  const doc: DocumentDocument = {
    appId: input.appId,
    entityId: input.entityId,
    name: input.name,
    filename: input.filename,
    category: input.category,
    description: input.description,
    blobUrl: input.blobUrl,
    blobPathname: input.blobPathname,
    size: input.size,
    mimeType: input.mimeType,
    versions: [firstVersion],
    currentVersion: 1,
    syncedToKB: false,
    createdAt: now,
    updatedAt: now,
    metadata: input.metadata,
  };

  const result = await collection.insertOne(doc);
  doc._id = result.insertedId;

  return toDocument(doc);
}

/**
 * Get document by ID
 */
export async function getDocumentById(
  documentId: string
): Promise<Document | null> {
  const collection = await getDocumentsCollection();

  try {
    const doc = await collection.findOne({
      _id: new ObjectId(documentId),
    });

    return doc ? toDocument(doc) : null;
  } catch (error) {
    console.error("[MongoDB] Error getting document:", error);
    return null;
  }
}

/**
 * Get document by filename
 */
export async function getDocumentByFilename(
  appId: string,
  entityId: string,
  filename: string
): Promise<Document | null> {
  const collection = await getDocumentsCollection();

  const doc = await collection.findOne({
    appId,
    entityId,
    filename,
  });

  return doc ? toDocument(doc) : null;
}

/**
 * List documents by app and entity
 */
export async function listDocuments(
  appId: string,
  entityId: string,
  options?: PaginationOptions & { category?: string }
): Promise<PaginatedResult<Document>> {
  const collection = await getDocumentsCollection();

  const page = options?.page || 1;
  const pageSize = options?.pageSize || 50;
  const sortOrder = options?.sortOrder === "asc" ? 1 : -1;
  const sortBy = options?.sortBy || "updatedAt";

  const filter: Filter<DocumentDocument> = { appId, entityId };
  if (options?.category) {
    filter.category = options.category;
  }

  const sort: Sort = { [sortBy]: sortOrder };

  const [items, total] = await Promise.all([
    collection
      .find(filter)
      .sort(sort)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray(),
    collection.countDocuments(filter),
  ]);

  return {
    items: items.map(toDocument),
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  };
}

/**
 * List documents by category
 */
export async function listDocumentsByCategory(
  appId: string,
  entityId: string,
  category: string
): Promise<Document[]> {
  const collection = await getDocumentsCollection();

  const items = await collection
    .find({ appId, entityId, category })
    .sort({ name: 1 })
    .toArray();

  return items.map(toDocument);
}

/**
 * Update document
 */
export async function updateDocument(
  documentId: string,
  input: UpdateDocumentInput
): Promise<Document | null> {
  const collection = await getDocumentsCollection();

  const updateDoc: Partial<DocumentDocument> = {
    updatedAt: new Date(),
  };

  if (input.name !== undefined) updateDoc.name = input.name;
  if (input.category !== undefined) updateDoc.category = input.category;
  if (input.description !== undefined) updateDoc.description = input.description;
  if (input.blobUrl !== undefined) updateDoc.blobUrl = input.blobUrl;
  if (input.blobPathname !== undefined) updateDoc.blobPathname = input.blobPathname;
  if (input.ragDocumentId !== undefined) updateDoc.ragDocumentId = input.ragDocumentId;
  if (input.syncedToKB !== undefined) updateDoc.syncedToKB = input.syncedToKB;
  if (input.lastSyncedAt !== undefined) updateDoc.lastSyncedAt = input.lastSyncedAt;
  if (input.metadata !== undefined) updateDoc.metadata = input.metadata;

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(documentId) },
    { $set: updateDoc },
    { returnDocument: "after" }
  );

  return result ? toDocument(result) : null;
}

/**
 * Add a new version to document
 */
export async function addDocumentVersion(
  documentId: string,
  version: Omit<DocumentVersion, "version">
): Promise<Document | null> {
  const collection = await getDocumentsCollection();

  // Get current document to determine version number
  const doc = await collection.findOne({ _id: new ObjectId(documentId) });
  if (!doc) return null;

  const newVersion = doc.currentVersion + 1;
  const versionRecord: DocumentVersion = {
    ...version,
    version: newVersion,
  };

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(documentId) },
    {
      $push: { versions: versionRecord },
      $set: {
        currentVersion: newVersion,
        blobUrl: version.blobUrl,
        blobPathname: version.blobPathname,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );

  return result ? toDocument(result) : null;
}

/**
 * Delete document
 */
export async function deleteDocument(documentId: string): Promise<boolean> {
  const collection = await getDocumentsCollection();

  const result = await collection.deleteOne({
    _id: new ObjectId(documentId),
  });

  return result.deletedCount > 0;
}

/**
 * Mark document as synced to KB
 */
export async function markDocumentSynced(
  documentId: string,
  ragDocumentId: string
): Promise<void> {
  const collection = await getDocumentsCollection();

  await collection.updateOne(
    { _id: new ObjectId(documentId) },
    {
      $set: {
        ragDocumentId,
        syncedToKB: true,
        lastSyncedAt: new Date(),
        updatedAt: new Date(),
      },
    }
  );
}

/**
 * Get documents pending sync
 */
export async function getDocumentsPendingSync(
  appId: string,
  entityId: string
): Promise<Document[]> {
  const collection = await getDocumentsCollection();

  const items = await collection
    .find({
      appId,
      entityId,
      syncedToKB: false,
    })
    .toArray();

  return items.map(toDocument);
}

/**
 * Get document count
 */
export async function getDocumentCount(
  appId: string,
  entityId: string,
  category?: string
): Promise<number> {
  const collection = await getDocumentsCollection();

  const filter: Filter<DocumentDocument> = { appId, entityId };
  if (category) {
    filter.category = category;
  }

  return collection.countDocuments(filter);
}
