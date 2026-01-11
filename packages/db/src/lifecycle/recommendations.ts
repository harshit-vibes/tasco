import {
  PutCommand,
  QueryCommand,
  UpdateCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "../client";
import {
  TABLES,
  buildRecommendationPK,
  buildRecommendationSK,
} from "../tables";
import type {
  AIRecommendation,
  AIRecommendationItem,
  CreateAIRecommendationInput,
  UpdateAIRecommendationInput,
} from "./types";

/**
 * Generate a unique recommendation ID
 */
const generateId = (): string => {
  return `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Convert DynamoDB item to AIRecommendation
 */
const itemToRecommendation = (item: AIRecommendationItem): AIRecommendation => {
  const { pk, sk, ...recommendation } = item;
  return recommendation as AIRecommendation;
};

/**
 * Create a new AI recommendation
 */
export async function createAIRecommendation(
  input: CreateAIRecommendationInput
): Promise<AIRecommendation> {
  const id = input.id || generateId();
  const now = new Date().toISOString();

  const item: AIRecommendationItem = {
    pk: buildRecommendationPK(input.targetId),
    sk: buildRecommendationSK(now, id),
    id,
    targetId: input.targetId,
    targetType: input.targetType,
    type: input.type,
    title: input.title,
    description: input.description,
    confidence: input.confidence,
    priority: input.priority || "medium",
    status: "pending",
    entityId: input.entityId,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.AI_RECOMMENDATIONS,
      Item: item,
    })
  );

  return itemToRecommendation(item);
}

/**
 * Get recommendations by target ID (lead or customer)
 */
export async function getRecommendationsByTargetId(
  targetId: string
): Promise<AIRecommendation[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.AI_RECOMMENDATIONS,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": buildRecommendationPK(targetId),
      },
      ScanIndexForward: false, // Most recent first
    })
  );

  return (result.Items || []).map((item) =>
    itemToRecommendation(item as AIRecommendationItem)
  );
}

/**
 * Get high-confidence recommendations (confidence > 0.7)
 */
export async function getHighConfidenceRecommendations(): Promise<
  AIRecommendation[]
> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.AI_RECOMMENDATIONS,
      FilterExpression:
        "confidence > :threshold AND #status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":threshold": 0.7,
        ":status": "pending",
      },
    })
  );

  return (result.Items || []).map((item) =>
    itemToRecommendation(item as AIRecommendationItem)
  );
}

/**
 * Get recommendations by entity
 */
export async function getRecommendationsByEntity(
  entityId: string
): Promise<AIRecommendation[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.AI_RECOMMENDATIONS,
      FilterExpression: "entityId = :entityId",
      ExpressionAttributeValues: {
        ":entityId": entityId,
      },
    })
  );

  return (result.Items || []).map((item) =>
    itemToRecommendation(item as AIRecommendationItem)
  );
}

/**
 * Get recommendations by type
 */
export async function getRecommendationsByType(
  type: AIRecommendation["type"]
): Promise<AIRecommendation[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.AI_RECOMMENDATIONS,
      FilterExpression: "#type = :type",
      ExpressionAttributeNames: {
        "#type": "type",
      },
      ExpressionAttributeValues: {
        ":type": type,
      },
    })
  );

  return (result.Items || []).map((item) =>
    itemToRecommendation(item as AIRecommendationItem)
  );
}

/**
 * Update a recommendation
 */
export async function updateAIRecommendation(
  targetId: string,
  recommendationId: string,
  updates: UpdateAIRecommendationInput
): Promise<AIRecommendation | null> {
  // First, get the existing recommendation to find its SK
  const existing = await getRecommendationsByTargetId(targetId);
  const recommendation = existing.find((r) => r.id === recommendationId);

  if (!recommendation) {
    return null;
  }

  const updateExpressions: string[] = ["#updatedAt = :updatedAt"];
  const expressionAttributeNames: Record<string, string> = {
    "#updatedAt": "updatedAt",
  };
  const expressionAttributeValues: Record<string, any> = {
    ":updatedAt": new Date().toISOString(),
  };

  if (updates.status !== undefined) {
    updateExpressions.push("#status = :status");
    expressionAttributeNames["#status"] = "status";
    expressionAttributeValues[":status"] = updates.status;
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLES.AI_RECOMMENDATIONS,
      Key: {
        pk: buildRecommendationPK(targetId),
        sk: buildRecommendationSK(recommendation.createdAt, recommendationId),
      },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes
    ? itemToRecommendation(result.Attributes as AIRecommendationItem)
    : null;
}

/**
 * Get recommendation stats
 */
export async function getRecommendationStats(): Promise<{
  total: number;
  pending: number;
  completed: number;
  dismissed: number;
  highConfidence: number;
  averageConfidence: number;
}> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.AI_RECOMMENDATIONS,
    })
  );

  const recommendations = (result.Items || []).map((item) =>
    itemToRecommendation(item as AIRecommendationItem)
  );

  const pending = recommendations.filter((r) => r.status === "pending").length;
  const completed = recommendations.filter((r) => r.status === "completed")
    .length;
  const dismissed = recommendations.filter((r) => r.status === "dismissed")
    .length;
  const highConfidence = recommendations.filter((r) => r.confidence > 0.7)
    .length;

  const averageConfidence =
    recommendations.length > 0
      ? recommendations.reduce((sum, r) => sum + r.confidence, 0) /
        recommendations.length
      : 0;

  return {
    total: recommendations.length,
    pending,
    completed,
    dismissed,
    highConfidence,
    averageConfidence,
  };
}
