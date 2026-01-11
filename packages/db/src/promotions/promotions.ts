/**
 * Promotion CRUD operations
 */

import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "../client";
import { TABLES } from "../tables";
import { generatePromotionId, getEffectiveStatus } from "./utils";
import type {
  Promotion,
  CreatePromotionInput,
  UpdatePromotionInput,
  PaginatedResult,
  PromotionStatus,
  PromotionStats,
} from "./types";

/**
 * Create a new promotion
 */
export async function createPromotion(input: CreatePromotionInput): Promise<Promotion> {
  const promotionId = generatePromotionId();
  const now = new Date().toISOString();

  const promotion: Promotion = {
    promotionId,
    entityId: input.entityId,
    name: input.name,
    description: input.description,
    type: input.type,
    status: input.status || "draft",
    targetSegments: input.targetSegments,
    targetProducts: input.targetProducts,
    targetChannels: input.targetChannels,
    startDate: input.startDate,
    endDate: input.endDate,
    discountType: input.discountType,
    discountValue: input.discountValue,
    stackable: input.stackable,
    excludePromotionIds: input.excludePromotionIds || [],
    minPurchaseAmount: input.minPurchaseAmount,
    maxDiscountAmount: input.maxDiscountAmount,
    priority: input.priority || 1,
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.PROMOTIONS,
      Item: promotion,
    })
  );

  return promotion;
}

/**
 * Get a promotion by ID
 */
export async function getPromotion(promotionId: string): Promise<Promotion | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.PROMOTIONS,
      Key: { promotionId },
    })
  );

  if (!result.Item) {
    return null;
  }

  const promotion = result.Item as Promotion;
  // Update effective status based on dates
  promotion.status = getEffectiveStatus(promotion);
  return promotion;
}

/**
 * Update a promotion
 */
export async function updatePromotion(
  promotionId: string,
  updates: UpdatePromotionInput
): Promise<Promotion | null> {
  const updateExpressions: string[] = ["#updatedAt = :updatedAt"];
  const expressionAttributeNames: Record<string, string> = {
    "#updatedAt": "updatedAt",
  };
  const expressionAttributeValues: Record<string, unknown> = {
    ":updatedAt": new Date().toISOString(),
  };

  // Dynamically build update expression for each field
  const fields: Array<{ key: keyof UpdatePromotionInput; name: string }> = [
    { key: "name", name: "name" },
    { key: "description", name: "description" },
    { key: "type", name: "type" },
    { key: "status", name: "status" },
    { key: "targetSegments", name: "targetSegments" },
    { key: "targetProducts", name: "targetProducts" },
    { key: "targetChannels", name: "targetChannels" },
    { key: "startDate", name: "startDate" },
    { key: "endDate", name: "endDate" },
    { key: "discountType", name: "discountType" },
    { key: "discountValue", name: "discountValue" },
    { key: "stackable", name: "stackable" },
    { key: "excludePromotionIds", name: "excludePromotionIds" },
    { key: "minPurchaseAmount", name: "minPurchaseAmount" },
    { key: "maxDiscountAmount", name: "maxDiscountAmount" },
    { key: "priority", name: "priority" },
  ];

  for (const field of fields) {
    if (updates[field.key] !== undefined) {
      updateExpressions.push(`#${field.name} = :${field.name}`);
      expressionAttributeNames[`#${field.name}`] = field.name;
      expressionAttributeValues[`:${field.name}`] = updates[field.key];
    }
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLES.PROMOTIONS,
      Key: { promotionId },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes ? (result.Attributes as Promotion) : null;
}

/**
 * Delete a promotion
 */
export async function deletePromotion(promotionId: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLES.PROMOTIONS,
      Key: { promotionId },
    })
  );
}

/**
 * List all promotions with pagination
 */
export async function listAllPromotions(
  limit: number = 50,
  lastKey?: Record<string, unknown>
): Promise<PaginatedResult<Promotion>> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.PROMOTIONS,
      Limit: limit,
      ExclusiveStartKey: lastKey,
    })
  );

  const items = (result.Items || []) as Promotion[];
  // Sort by start date descending (newest first)
  items.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  // Update effective status for each promotion
  items.forEach(p => {
    p.status = getEffectiveStatus(p);
  });

  return {
    items,
    lastEvaluatedKey: result.LastEvaluatedKey,
    hasMore: !!result.LastEvaluatedKey,
  };
}

/**
 * List promotions by entity
 */
export async function listPromotionsByEntity(
  entityId: string,
  limit: number = 50,
  lastKey?: Record<string, unknown>
): Promise<PaginatedResult<Promotion>> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.PROMOTIONS,
      IndexName: "entityId-startDate-index",
      KeyConditionExpression: "entityId = :entityId",
      ExpressionAttributeValues: {
        ":entityId": entityId,
      },
      Limit: limit,
      ExclusiveStartKey: lastKey,
      ScanIndexForward: false, // Newest first
    })
  );

  const items = (result.Items || []) as Promotion[];
  items.forEach(p => {
    p.status = getEffectiveStatus(p);
  });

  return {
    items,
    lastEvaluatedKey: result.LastEvaluatedKey,
    hasMore: !!result.LastEvaluatedKey,
  };
}

/**
 * List promotions by status
 */
export async function listPromotionsByStatus(
  status: PromotionStatus,
  limit: number = 50,
  lastKey?: Record<string, unknown>
): Promise<PaginatedResult<Promotion>> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.PROMOTIONS,
      IndexName: "status-startDate-index",
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": status,
      },
      Limit: limit,
      ExclusiveStartKey: lastKey,
      ScanIndexForward: false, // Newest first
    })
  );

  return {
    items: (result.Items || []) as Promotion[],
    lastEvaluatedKey: result.LastEvaluatedKey,
    hasMore: !!result.LastEvaluatedKey,
  };
}

/**
 * Get active promotions (status=active and within date range)
 */
export async function getActivePromotions(
  entityId?: string
): Promise<Promotion[]> {
  const now = new Date().toISOString().split('T')[0];

  let result;

  if (entityId) {
    result = await docClient.send(
      new QueryCommand({
        TableName: TABLES.PROMOTIONS,
        IndexName: "entityId-startDate-index",
        KeyConditionExpression: "entityId = :entityId",
        FilterExpression: "#status = :status AND startDate <= :now AND endDate >= :now",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":entityId": entityId,
          ":status": "active",
          ":now": now,
        },
      })
    );
  } else {
    result = await docClient.send(
      new ScanCommand({
        TableName: TABLES.PROMOTIONS,
        FilterExpression: "#status = :status AND startDate <= :now AND endDate >= :now",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":status": "active",
          ":now": now,
        },
      })
    );
  }

  return (result.Items || []) as Promotion[];
}

/**
 * Get promotions within a date range (for calendar view)
 */
export async function getPromotionsInDateRange(
  startDate: string,
  endDate: string,
  entityId?: string
): Promise<Promotion[]> {
  let result;

  if (entityId) {
    result = await docClient.send(
      new QueryCommand({
        TableName: TABLES.PROMOTIONS,
        IndexName: "entityId-startDate-index",
        KeyConditionExpression: "entityId = :entityId AND startDate <= :endDate",
        FilterExpression: "endDate >= :startDate",
        ExpressionAttributeValues: {
          ":entityId": entityId,
          ":startDate": startDate,
          ":endDate": endDate,
        },
      })
    );
  } else {
    result = await docClient.send(
      new ScanCommand({
        TableName: TABLES.PROMOTIONS,
        FilterExpression: "startDate <= :endDate AND endDate >= :startDate",
        ExpressionAttributeValues: {
          ":startDate": startDate,
          ":endDate": endDate,
        },
      })
    );
  }

  const items = (result.Items || []) as Promotion[];
  items.forEach(p => {
    p.status = getEffectiveStatus(p);
  });

  return items;
}

/**
 * Search promotions by name
 */
export async function searchPromotions(
  searchTerm: string,
  entityId?: string,
  limit: number = 20
): Promise<Promotion[]> {
  const filterExpression = entityId
    ? "contains(#name, :searchTerm) AND entityId = :entityId"
    : "contains(#name, :searchTerm)";

  const expressionAttributeValues: Record<string, unknown> = {
    ":searchTerm": searchTerm.toLowerCase(),
  };

  if (entityId) {
    expressionAttributeValues[":entityId"] = entityId;
  }

  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.PROMOTIONS,
      FilterExpression: filterExpression,
      ExpressionAttributeNames: {
        "#name": "name",
      },
      ExpressionAttributeValues: expressionAttributeValues,
      Limit: limit,
    })
  );

  const items = (result.Items || []) as Promotion[];
  items.forEach(p => {
    p.status = getEffectiveStatus(p);
  });

  return items;
}

/**
 * Get promotion statistics
 */
export async function getPromotionStats(entityId?: string): Promise<PromotionStats> {
  const result = entityId
    ? await listPromotionsByEntity(entityId, 1000)
    : await listAllPromotions(1000);

  const promotions = result.items;

  const stats: PromotionStats = {
    total: promotions.length,
    active: 0,
    draft: 0,
    paused: 0,
    expired: 0,
    byType: {
      discount: 0,
      bundle: 0,
      "free-item": 0,
      loyalty: 0,
      coupon: 0,
    },
    bySegment: {
      all: 0,
      vip: 0,
      regular: 0,
      new: 0,
      wholesale: 0,
      retail: 0,
    },
  };

  for (const promo of promotions) {
    // Count by status
    const effectiveStatus = getEffectiveStatus(promo);
    stats[effectiveStatus]++;

    // Count by type
    stats.byType[promo.type]++;

    // Count by segment (a promotion can target multiple segments)
    for (const segment of promo.targetSegments) {
      stats.bySegment[segment]++;
    }
  }

  return stats;
}

/**
 * Clone a promotion (create a copy with new ID)
 */
export async function clonePromotion(
  promotionId: string,
  createdBy: string,
  overrides?: Partial<CreatePromotionInput>
): Promise<Promotion | null> {
  const original = await getPromotion(promotionId);
  if (!original) {
    return null;
  }

  const input: CreatePromotionInput = {
    entityId: overrides?.entityId || original.entityId,
    name: overrides?.name || `${original.name} (Copy)`,
    description: overrides?.description || original.description,
    type: overrides?.type || original.type,
    status: "draft", // Always start as draft
    targetSegments: overrides?.targetSegments || original.targetSegments,
    targetProducts: overrides?.targetProducts || original.targetProducts,
    targetChannels: overrides?.targetChannels || original.targetChannels,
    startDate: overrides?.startDate || original.startDate,
    endDate: overrides?.endDate || original.endDate,
    discountType: overrides?.discountType || original.discountType,
    discountValue: overrides?.discountValue || original.discountValue,
    stackable: overrides?.stackable ?? original.stackable,
    excludePromotionIds: overrides?.excludePromotionIds || original.excludePromotionIds,
    minPurchaseAmount: overrides?.minPurchaseAmount || original.minPurchaseAmount,
    maxDiscountAmount: overrides?.maxDiscountAmount || original.maxDiscountAmount,
    priority: overrides?.priority || original.priority,
    createdBy,
  };

  return createPromotion(input);
}
