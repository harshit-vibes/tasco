import { PutCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../client";
import { TABLES, buildMessagePK, buildMessageSK } from "../tables";
import type {
  Message,
  MessageItem,
  CreateMessageInput,
  PaginatedResult,
} from "./types";

/**
 * Generate a unique message ID
 */
const generateId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Convert DynamoDB item to Message
 */
const itemToMessage = (item: MessageItem): Message => ({
  id: item.id,
  conversationId: item.conversationId,
  role: item.role,
  content: item.content,
  citations: item.citations,
  createdAt: item.createdAt,
  metadata: item.metadata,
});

/**
 * Create a new message
 */
export async function createMessage(input: CreateMessageInput): Promise<Message> {
  const id = generateId();
  const now = new Date().toISOString();

  const item: MessageItem = {
    pk: buildMessagePK(input.conversationId),
    sk: buildMessageSK(now, id),
    id,
    conversationId: input.conversationId,
    role: input.role,
    content: input.content,
    citations: input.citations,
    createdAt: now,
    metadata: input.metadata,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.MESSAGES,
      Item: item,
    })
  );

  return itemToMessage(item);
}

/**
 * Get a single message by conversation and message ID
 */
export async function getMessage(
  conversationId: string,
  timestamp: string,
  messageId: string
): Promise<Message | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.MESSAGES,
      Key: {
        pk: buildMessagePK(conversationId),
        sk: buildMessageSK(timestamp, messageId),
      },
    })
  );

  if (!result.Item) {
    return null;
  }

  return itemToMessage(result.Item as MessageItem);
}

/**
 * List messages for a conversation (oldest first by default)
 */
export async function listMessages(
  conversationId: string,
  limit: number = 100,
  lastKey?: Record<string, unknown>,
  newestFirst: boolean = false
): Promise<PaginatedResult<Message>> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.MESSAGES,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": buildMessagePK(conversationId),
      },
      ScanIndexForward: !newestFirst, // true = oldest first (chronological)
      Limit: limit,
      ExclusiveStartKey: lastKey,
    })
  );

  const items = (result.Items || []) as MessageItem[];

  return {
    items: items.map(itemToMessage),
    lastEvaluatedKey: result.LastEvaluatedKey,
    hasMore: !!result.LastEvaluatedKey,
  };
}

/**
 * Get all messages for a conversation (for smaller conversations)
 */
export async function getAllMessages(conversationId: string): Promise<Message[]> {
  const messages: Message[] = [];
  let lastKey: Record<string, unknown> | undefined;

  do {
    const result = await listMessages(conversationId, 100, lastKey);
    messages.push(...result.items);
    lastKey = result.lastEvaluatedKey;
  } while (lastKey);

  return messages;
}

/**
 * Get the latest N messages for a conversation
 */
export async function getLatestMessages(
  conversationId: string,
  limit: number = 50
): Promise<Message[]> {
  const result = await listMessages(conversationId, limit, undefined, true);
  // Reverse to get chronological order
  return result.items.reverse();
}
