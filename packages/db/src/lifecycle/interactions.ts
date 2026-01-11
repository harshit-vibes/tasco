import { PutCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../client";
import {
  TABLES,
  buildInteractionPK,
  buildInteractionSK,
} from "../tables";
import type {
  Interaction,
  InteractionItem,
  CreateInteractionInput,
} from "./types";

/**
 * Generate a unique interaction ID
 */
const generateId = (): string => {
  return `int_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Convert DynamoDB item to Interaction
 */
const itemToInteraction = (item: InteractionItem): Interaction => {
  const { pk, sk, ...interaction } = item;
  return interaction as Interaction;
};

/**
 * Create a new interaction
 */
export async function createInteraction(
  input: CreateInteractionInput
): Promise<Interaction> {
  const id = input.id || generateId();
  const now = new Date().toISOString();

  if (!input.leadId && !input.customerId) {
    throw new Error("Either leadId or customerId must be provided");
  }

  const relatedId = input.leadId || input.customerId!;

  const item: InteractionItem = {
    pk: buildInteractionPK(relatedId),
    sk: buildInteractionSK(now, id),
    id,
    leadId: input.leadId,
    customerId: input.customerId,
    type: input.type,
    channel: input.channel,
    notes: input.notes,
    sentiment: input.sentiment,
    timestamp: now,
    performedBy: input.performedBy,
    entityId: input.entityId,
    createdAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.INTERACTIONS,
      Item: item,
    })
  );

  return itemToInteraction(item);
}

/**
 * Get interactions by lead ID
 */
export async function getInteractionsByLeadId(
  leadId: string
): Promise<Interaction[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.INTERACTIONS,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": buildInteractionPK(leadId),
      },
      ScanIndexForward: false, // Most recent first
    })
  );

  return (result.Items || []).map((item) =>
    itemToInteraction(item as InteractionItem)
  );
}

/**
 * Get interactions by customer ID
 */
export async function getInteractionsByCustomerId(
  customerId: string
): Promise<Interaction[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.INTERACTIONS,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": buildInteractionPK(customerId),
      },
      ScanIndexForward: false, // Most recent first
    })
  );

  return (result.Items || []).map((item) =>
    itemToInteraction(item as InteractionItem)
  );
}

/**
 * Get all interactions by entity
 */
export async function getInteractionsByEntity(
  entityId: string
): Promise<Interaction[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.INTERACTIONS,
      FilterExpression: "entityId = :entityId",
      ExpressionAttributeValues: {
        ":entityId": entityId,
      },
    })
  );

  return (result.Items || []).map((item) =>
    itemToInteraction(item as InteractionItem)
  );
}

/**
 * Get interactions by sentiment
 */
export async function getInteractionsBySentiment(
  sentiment: "positive" | "neutral" | "negative"
): Promise<Interaction[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.INTERACTIONS,
      FilterExpression: "sentiment = :sentiment",
      ExpressionAttributeValues: {
        ":sentiment": sentiment,
      },
    })
  );

  return (result.Items || []).map((item) =>
    itemToInteraction(item as InteractionItem)
  );
}
