/**
 * Sales Order Activity logging operations
 */

import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../client";
import { TABLES, buildActivityPK, buildActivitySK } from "../tables";
import { generateActivityId, getTTL } from "./utils";
import type {
  OrderActivity,
  CreateActivityInput,
  PaginatedResult,
  ActivityItem_DB,
} from "./types";

/**
 * Convert DynamoDB item to OrderActivity
 */
function itemToActivity(item: ActivityItem_DB): OrderActivity {
  return {
    activityId: item.activityId,
    orderId: item.orderId,
    entityId: item.entityId,
    action: item.action,
    details: item.details,
    timestamp: item.timestamp,
    ttl: item.ttl,
  };
}

/**
 * Log an activity for an order
 */
export async function logActivity(
  input: CreateActivityInput
): Promise<OrderActivity> {
  const activityId = generateActivityId();
  const timestamp = new Date().toISOString();
  const pk = buildActivityPK(input.orderId);
  const sk = buildActivitySK(timestamp, activityId);

  const activity: ActivityItem_DB = {
    pk,
    sk,
    activityId,
    orderId: input.orderId,
    entityId: input.entityId,
    action: input.action,
    details: input.details,
    timestamp,
    ttl: getTTL(90), // Keep activity logs for 90 days
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.SALES_ORDER_ACTIVITY,
      Item: activity,
    })
  );

  return itemToActivity(activity);
}

/**
 * Get activity history for an order
 */
export async function getOrderActivity(
  orderId: string,
  limit: number = 50,
  lastKey?: Record<string, unknown>
): Promise<PaginatedResult<OrderActivity>> {
  const pk = buildActivityPK(orderId);

  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.SALES_ORDER_ACTIVITY,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": pk,
      },
      Limit: limit,
      ExclusiveStartKey: lastKey,
      ScanIndexForward: false, // Newest first
    })
  );

  const items = (result.Items || []) as ActivityItem_DB[];

  return {
    items: items.map(itemToActivity),
    lastEvaluatedKey: result.LastEvaluatedKey,
    hasMore: !!result.LastEvaluatedKey,
  };
}

/**
 * Get recent activity for an order (last N activities)
 */
export async function getRecentActivity(
  orderId: string,
  limit: number = 10
): Promise<OrderActivity[]> {
  const result = await getOrderActivity(orderId, limit);
  return result.items;
}
