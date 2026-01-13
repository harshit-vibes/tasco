/**
 * MongoDB Conversation Operations
 */

import { ObjectId, type Filter, type Sort } from "mongodb";
import { getConversationsCollection } from "./collections";
import { generateId } from "./client";
import type {
  ConversationDocument,
  CreateConversationInput,
  UpdateConversationInput,
  PaginatedResult,
  PaginationOptions,
} from "./types";

// Response type (mirrors DynamoDB response)
export interface Conversation {
  id: string;
  appId: string;
  entityId: string;
  userId: string;
  title: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

// Transform document to response
function toConversation(doc: ConversationDocument): Conversation {
  return {
    id: doc._id?.toHexString() || "",
    appId: doc.appId,
    entityId: doc.entityId,
    userId: doc.userId,
    title: doc.title,
    messageCount: doc.messageCount,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    metadata: doc.metadata,
  };
}

/**
 * Create a new conversation
 */
export async function createConversation(
  input: CreateConversationInput
): Promise<Conversation> {
  const collection = await getConversationsCollection();
  const now = new Date();

  const doc: ConversationDocument = {
    appId: input.appId,
    entityId: input.entityId,
    userId: input.userId,
    title: input.title || "New Conversation",
    messageCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(doc);
  doc._id = result.insertedId;

  return toConversation(doc);
}

/**
 * Get conversation by ID
 */
export async function getConversation(
  conversationId: string
): Promise<Conversation | null> {
  const collection = await getConversationsCollection();

  try {
    const doc = await collection.findOne({
      _id: new ObjectId(conversationId),
    });

    return doc ? toConversation(doc) : null;
  } catch (error) {
    console.error("[MongoDB] Error getting conversation:", error);
    return null;
  }
}

/**
 * List conversations by app and entity
 */
export async function listConversations(
  appId: string,
  entityId: string,
  options?: PaginationOptions
): Promise<PaginatedResult<Conversation>> {
  const collection = await getConversationsCollection();

  const page = options?.page || 1;
  const pageSize = options?.pageSize || 50;
  const sortOrder = options?.sortOrder === "asc" ? 1 : -1;
  const sortBy = options?.sortBy || "updatedAt";

  const filter: Filter<ConversationDocument> = { appId, entityId };
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
    items: items.map(toConversation),
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  };
}

/**
 * Update conversation
 */
export async function updateConversation(
  conversationId: string,
  input: UpdateConversationInput
): Promise<Conversation | null> {
  const collection = await getConversationsCollection();

  const updateDoc: Partial<ConversationDocument> = {
    updatedAt: new Date(),
  };

  if (input.title !== undefined) {
    updateDoc.title = input.title;
  }
  if (input.messageCount !== undefined) {
    updateDoc.messageCount = input.messageCount;
  }
  if (input.metadata !== undefined) {
    updateDoc.metadata = input.metadata;
  }

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(conversationId) },
    { $set: updateDoc },
    { returnDocument: "after" }
  );

  return result ? toConversation(result) : null;
}

/**
 * Delete conversation
 */
export async function deleteConversation(
  conversationId: string
): Promise<boolean> {
  const collection = await getConversationsCollection();

  const result = await collection.deleteOne({
    _id: new ObjectId(conversationId),
  });

  return result.deletedCount > 0;
}

/**
 * Increment message count
 */
export async function incrementMessageCount(
  conversationId: string
): Promise<void> {
  const collection = await getConversationsCollection();

  await collection.updateOne(
    { _id: new ObjectId(conversationId) },
    {
      $inc: { messageCount: 1 },
      $set: { updatedAt: new Date() },
    }
  );
}

/**
 * Get conversation count for an app/entity
 */
export async function getConversationCount(
  appId: string,
  entityId: string
): Promise<number> {
  const collection = await getConversationsCollection();
  return collection.countDocuments({ appId, entityId });
}
