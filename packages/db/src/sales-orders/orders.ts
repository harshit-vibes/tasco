/**
 * Sales Order CRUD operations
 */

import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "../client";
import { TABLES } from "../tables";
import { generateOrderId } from "./utils";
import type {
  Order,
  CreateOrderInput,
  UpdateOrderInput,
  PaginatedResult,
  OrderStatus,
} from "./types";

/**
 * Create a new order
 */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const orderId = generateOrderId();
  const now = new Date().toISOString();

  const order: Order = {
    orderId,
    entityId: input.entityId,
    status: "pending",
    sourceType: input.sourceType,
    sourceUrl: input.sourceUrl,
    fileName: input.fileName,
    fileSize: input.fileSize,
    confidence: input.confidence,
    extractedData: input.extractedData,
    processingTime: input.processingTime,
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
    extractionAgentId: input.extractionAgentId,
    validationAgentId: input.validationAgentId,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.SALES_ORDERS,
      Item: order,
    })
  );

  return order;
}

/**
 * Get an order by ID
 */
export async function getOrder(orderId: string): Promise<Order | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.SALES_ORDERS,
      Key: { orderId },
    })
  );

  return result.Item ? (result.Item as Order) : null;
}

/**
 * Update an order
 */
export async function updateOrder(
  orderId: string,
  updates: UpdateOrderInput
): Promise<Order | null> {
  const updateExpressions: string[] = ["#updatedAt = :updatedAt"];
  const expressionAttributeNames: Record<string, string> = {
    "#updatedAt": "updatedAt",
  };
  const expressionAttributeValues: Record<string, unknown> = {
    ":updatedAt": new Date().toISOString(),
  };

  // Dynamically build update expression
  if (updates.status !== undefined) {
    updateExpressions.push("#status = :status");
    expressionAttributeNames["#status"] = "status";
    expressionAttributeValues[":status"] = updates.status;
  }

  if (updates.extractedData !== undefined) {
    updateExpressions.push("#extractedData = :extractedData");
    expressionAttributeNames["#extractedData"] = "extractedData";
    expressionAttributeValues[":extractedData"] = updates.extractedData;
  }

  if (updates.confidence !== undefined) {
    updateExpressions.push("#confidence = :confidence");
    expressionAttributeNames["#confidence"] = "confidence";
    expressionAttributeValues[":confidence"] = updates.confidence;
  }

  if (updates.validation !== undefined) {
    updateExpressions.push("#validation = :validation");
    expressionAttributeNames["#validation"] = "validation";
    expressionAttributeValues[":validation"] = updates.validation;
  }

  if (updates.reviewedBy !== undefined) {
    updateExpressions.push("#reviewedBy = :reviewedBy");
    expressionAttributeNames["#reviewedBy"] = "reviewedBy";
    expressionAttributeValues[":reviewedBy"] = updates.reviewedBy;
  }

  if (updates.reviewedAt !== undefined) {
    updateExpressions.push("#reviewedAt = :reviewedAt");
    expressionAttributeNames["#reviewedAt"] = "reviewedAt";
    expressionAttributeValues[":reviewedAt"] = updates.reviewedAt;
  }

  if (updates.exportedAt !== undefined) {
    updateExpressions.push("#exportedAt = :exportedAt");
    expressionAttributeNames["#exportedAt"] = "exportedAt";
    expressionAttributeValues[":exportedAt"] = updates.exportedAt;
  }

  if (updates.exportedBy !== undefined) {
    updateExpressions.push("#exportedBy = :exportedBy");
    expressionAttributeNames["#exportedBy"] = "exportedBy";
    expressionAttributeValues[":exportedBy"] = updates.exportedBy;
  }

  if (updates.validationAgentId !== undefined) {
    updateExpressions.push("#validationAgentId = :validationAgentId");
    expressionAttributeNames["#validationAgentId"] = "validationAgentId";
    expressionAttributeValues[":validationAgentId"] = updates.validationAgentId;
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLES.SALES_ORDERS,
      Key: { orderId },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes ? (result.Attributes as Order) : null;
}

/**
 * Delete an order
 */
export async function deleteOrder(orderId: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLES.SALES_ORDERS,
      Key: { orderId },
    })
  );
}

/**
 * List orders by status
 */
export async function listOrdersByStatus(
  status: OrderStatus,
  limit: number = 20,
  lastKey?: Record<string, unknown>
): Promise<PaginatedResult<Order>> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.SALES_ORDERS,
      IndexName: "status-createdAt-index",
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
    items: (result.Items || []) as Order[],
    lastEvaluatedKey: result.LastEvaluatedKey,
    hasMore: !!result.LastEvaluatedKey,
  };
}

/**
 * List orders by entity
 */
export async function listOrdersByEntity(
  entityId: string,
  limit: number = 20,
  lastKey?: Record<string, unknown>
): Promise<PaginatedResult<Order>> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.SALES_ORDERS,
      IndexName: "entityId-createdAt-index",
      KeyConditionExpression: "entityId = :entityId",
      ExpressionAttributeValues: {
        ":entityId": entityId,
      },
      Limit: limit,
      ExclusiveStartKey: lastKey,
      ScanIndexForward: false, // Newest first
    })
  );

  return {
    items: (result.Items || []) as Order[],
    lastEvaluatedKey: result.LastEvaluatedKey,
    hasMore: !!result.LastEvaluatedKey,
  };
}

/**
 * List orders by entity and status
 */
export async function listOrdersByEntityAndStatus(
  entityId: string,
  status: OrderStatus,
  limit: number = 20,
  lastKey?: Record<string, unknown>
): Promise<PaginatedResult<Order>> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.SALES_ORDERS,
      IndexName: "entityId-createdAt-index",
      KeyConditionExpression: "entityId = :entityId",
      FilterExpression: "#status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":entityId": entityId,
        ":status": status,
      },
      Limit: limit,
      ExclusiveStartKey: lastKey,
      ScanIndexForward: false, // Newest first
    })
  );

  return {
    items: (result.Items || []) as Order[],
    lastEvaluatedKey: result.LastEvaluatedKey,
    hasMore: !!result.LastEvaluatedKey,
  };
}

/**
 * List all orders with pagination
 */
export async function listAllOrders(
  limit: number = 20,
  lastKey?: Record<string, unknown>
): Promise<PaginatedResult<Order>> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.SALES_ORDERS,
      Limit: limit,
      ExclusiveStartKey: lastKey,
    })
  );

  // Sort by createdAt descending (newest first)
  const items = (result.Items || []) as Order[];
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    items,
    lastEvaluatedKey: result.LastEvaluatedKey,
    hasMore: !!result.LastEvaluatedKey,
  };
}

/**
 * Get order count by status
 */
export async function getOrderCountByStatus(
  status: OrderStatus
): Promise<number> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.SALES_ORDERS,
      IndexName: "status-createdAt-index",
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": status,
      },
      Select: "COUNT",
    })
  );

  return result.Count || 0;
}

/**
 * Get order count by entity
 */
export async function getOrderCountByEntity(entityId: string): Promise<number> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.SALES_ORDERS,
      IndexName: "entityId-createdAt-index",
      KeyConditionExpression: "entityId = :entityId",
      ExpressionAttributeValues: {
        ":entityId": entityId,
      },
      Select: "COUNT",
    })
  );

  return result.Count || 0;
}

/**
 * Get recent orders (last N orders)
 */
export async function getRecentOrders(
  entityId: string,
  limit: number = 5
): Promise<Order[]> {
  const result = await listOrdersByEntity(entityId, limit);
  return result.items;
}

/**
 * Search orders by customer name or code
 */
export async function searchOrders(
  entityId: string,
  searchTerm: string,
  limit: number = 20
): Promise<Order[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.SALES_ORDERS,
      IndexName: "entityId-createdAt-index",
      KeyConditionExpression: "entityId = :entityId",
      FilterExpression:
        "contains(extractedData.customerName.#value, :searchTerm) OR contains(extractedData.customerCode.#value, :searchTerm)",
      ExpressionAttributeNames: {
        "#value": "value",
      },
      ExpressionAttributeValues: {
        ":entityId": entityId,
        ":searchTerm": searchTerm,
      },
      Limit: limit,
      ScanIndexForward: false,
    })
  );

  return (result.Items || []) as Order[];
}
