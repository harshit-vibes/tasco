/**
 * MongoDB Message Operations
 */

import { ObjectId, type Filter, type Sort } from "mongodb";
import { getMessagesCollection } from "./collections";
import { incrementMessageCount } from "./conversations";
import type {
  MessageDocument,
  CreateMessageInput,
  Citation,
  EnhancedCitation,
  ValidationResult,
  PaginatedResult,
  PaginationOptions,
} from "./types";

// Response type (mirrors DynamoDB response)
export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: Citation[];
  enhancedCitations?: EnhancedCitation[];
  validation?: ValidationResult;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

// Transform document to response
function toMessage(doc: MessageDocument): Message {
  return {
    id: doc._id?.toHexString() || "",
    conversationId: doc.conversationId,
    role: doc.role,
    content: doc.content,
    citations: doc.citations,
    enhancedCitations: doc.enhancedCitations,
    validation: doc.validation,
    createdAt: doc.createdAt.toISOString(),
    metadata: doc.metadata,
  };
}

/**
 * Create a new message
 */
export async function createMessage(input: CreateMessageInput): Promise<Message> {
  const collection = await getMessagesCollection();
  const now = new Date();

  const doc: MessageDocument = {
    conversationId: input.conversationId,
    role: input.role,
    content: input.content,
    citations: input.citations,
    enhancedCitations: input.enhancedCitations,
    validation: input.validation,
    createdAt: now,
    metadata: input.metadata,
  };

  const result = await collection.insertOne(doc);
  doc._id = result.insertedId;

  // Increment conversation message count
  await incrementMessageCount(input.conversationId);

  return toMessage(doc);
}

/**
 * Get message by ID
 */
export async function getMessage(messageId: string): Promise<Message | null> {
  const collection = await getMessagesCollection();

  try {
    const doc = await collection.findOne({
      _id: new ObjectId(messageId),
    });

    return doc ? toMessage(doc) : null;
  } catch (error) {
    console.error("[MongoDB] Error getting message:", error);
    return null;
  }
}

/**
 * List messages for a conversation
 */
export async function listMessages(
  conversationId: string,
  options?: PaginationOptions
): Promise<PaginatedResult<Message>> {
  const collection = await getMessagesCollection();

  const page = options?.page || 1;
  const pageSize = options?.pageSize || 100;
  const sortOrder = options?.sortOrder === "desc" ? -1 : 1;

  const filter: Filter<MessageDocument> = { conversationId };
  const sort: Sort = { createdAt: sortOrder };

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
    items: items.map(toMessage),
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  };
}

/**
 * Get all messages for a conversation (no pagination)
 */
export async function getAllMessages(conversationId: string): Promise<Message[]> {
  const collection = await getMessagesCollection();

  const items = await collection
    .find({ conversationId })
    .sort({ createdAt: 1 })
    .toArray();

  return items.map(toMessage);
}

/**
 * Delete message
 */
export async function deleteMessage(messageId: string): Promise<boolean> {
  const collection = await getMessagesCollection();

  const result = await collection.deleteOne({
    _id: new ObjectId(messageId),
  });

  return result.deletedCount > 0;
}

/**
 * Delete all messages for a conversation
 */
export async function deleteConversationMessages(
  conversationId: string
): Promise<number> {
  const collection = await getMessagesCollection();

  const result = await collection.deleteMany({ conversationId });
  return result.deletedCount;
}

/**
 * Get message count for a conversation
 */
export async function getMessageCount(conversationId: string): Promise<number> {
  const collection = await getMessagesCollection();
  return collection.countDocuments({ conversationId });
}

/**
 * Get last message for a conversation
 */
export async function getLastMessage(
  conversationId: string
): Promise<Message | null> {
  const collection = await getMessagesCollection();

  const doc = await collection.findOne(
    { conversationId },
    { sort: { createdAt: -1 } }
  );

  return doc ? toMessage(doc) : null;
}
