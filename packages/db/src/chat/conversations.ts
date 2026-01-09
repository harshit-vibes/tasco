import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "../client";
import { TABLES, buildConversationPK } from "../tables";
import type {
  Conversation,
  ConversationItem,
  CreateConversationInput,
  UpdateConversationInput,
  PaginatedResult,
} from "./types";

/**
 * Generate a unique conversation ID
 */
const generateId = (): string => {
  return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Convert DynamoDB item to Conversation
 */
const itemToConversation = (item: ConversationItem): Conversation => ({
  id: item.id,
  appId: item.appId,
  entityId: item.entityId,
  userId: item.userId,
  title: item.title,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
  messageCount: item.messageCount,
});

/**
 * Create a new conversation
 */
export async function createConversation(
  input: CreateConversationInput
): Promise<Conversation> {
  const id = generateId();
  const now = new Date().toISOString();

  const item: ConversationItem = {
    pk: buildConversationPK(input.appId, input.entityId),
    sk: id,
    id,
    appId: input.appId,
    entityId: input.entityId,
    userId: input.userId,
    title: input.title || "New conversation",
    createdAt: now,
    updatedAt: now,
    messageCount: 0,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.CONVERSATIONS,
      Item: item,
    })
  );

  return itemToConversation(item);
}

/**
 * Get a single conversation by ID
 */
export async function getConversation(
  appId: string,
  entityId: string,
  conversationId: string
): Promise<Conversation | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.CONVERSATIONS,
      Key: {
        pk: buildConversationPK(appId, entityId),
        sk: conversationId,
      },
    })
  );

  if (!result.Item) {
    return null;
  }

  return itemToConversation(result.Item as ConversationItem);
}

/**
 * List conversations for an app and entity
 */
export async function listConversations(
  appId: string,
  entityId: string,
  limit: number = 50,
  lastKey?: Record<string, unknown>
): Promise<PaginatedResult<Conversation>> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.CONVERSATIONS,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": buildConversationPK(appId, entityId),
      },
      ScanIndexForward: false, // Most recent first
      Limit: limit,
      ExclusiveStartKey: lastKey,
    })
  );

  const items = (result.Items || []) as ConversationItem[];

  return {
    items: items.map(itemToConversation),
    lastEvaluatedKey: result.LastEvaluatedKey,
    hasMore: !!result.LastEvaluatedKey,
  };
}

/**
 * Update a conversation
 */
export async function updateConversation(
  appId: string,
  entityId: string,
  conversationId: string,
  updates: UpdateConversationInput
): Promise<Conversation | null> {
  const updateExpressions: string[] = ["#updatedAt = :updatedAt"];
  const expressionAttributeNames: Record<string, string> = {
    "#updatedAt": "updatedAt",
  };
  const expressionAttributeValues: Record<string, unknown> = {
    ":updatedAt": new Date().toISOString(),
  };

  if (updates.title !== undefined) {
    updateExpressions.push("#title = :title");
    expressionAttributeNames["#title"] = "title";
    expressionAttributeValues[":title"] = updates.title;
  }

  if (updates.messageCount !== undefined) {
    updateExpressions.push("#messageCount = :messageCount");
    expressionAttributeNames["#messageCount"] = "messageCount";
    expressionAttributeValues[":messageCount"] = updates.messageCount;
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLES.CONVERSATIONS,
      Key: {
        pk: buildConversationPK(appId, entityId),
        sk: conversationId,
      },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    })
  );

  if (!result.Attributes) {
    return null;
  }

  return itemToConversation(result.Attributes as ConversationItem);
}

/**
 * Delete a conversation
 */
export async function deleteConversation(
  appId: string,
  entityId: string,
  conversationId: string
): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLES.CONVERSATIONS,
      Key: {
        pk: buildConversationPK(appId, entityId),
        sk: conversationId,
      },
    })
  );
}

/**
 * Increment message count for a conversation
 */
export async function incrementMessageCount(
  appId: string,
  entityId: string,
  conversationId: string,
  increment: number = 1
): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: TABLES.CONVERSATIONS,
      Key: {
        pk: buildConversationPK(appId, entityId),
        sk: conversationId,
      },
      UpdateExpression:
        "SET #messageCount = if_not_exists(#messageCount, :zero) + :inc, #updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#messageCount": "messageCount",
        "#updatedAt": "updatedAt",
      },
      ExpressionAttributeValues: {
        ":inc": increment,
        ":zero": 0,
        ":updatedAt": new Date().toISOString(),
      },
    })
  );
}
