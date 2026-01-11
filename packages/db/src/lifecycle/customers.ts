import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "../client";
import { TABLES, buildCustomerPK, CUSTOMER_METADATA_SK } from "../tables";
import type {
  Customer,
  CustomerItem,
  CreateCustomerInput,
  UpdateCustomerInput,
  PaginatedResult,
} from "./types";

/**
 * Generate a unique customer ID
 */
const generateId = (): string => {
  return `cust_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Convert DynamoDB item to Customer
 */
const itemToCustomer = (item: CustomerItem): Customer => {
  const { pk, sk, ...customer } = item;
  return customer as Customer;
};

/**
 * Create a new customer
 */
export async function createCustomer(
  input: CreateCustomerInput
): Promise<Customer> {
  const id = input.id || generateId();
  const now = new Date().toISOString();

  const item: CustomerItem = {
    pk: buildCustomerPK(id),
    sk: CUSTOMER_METADATA_SK,
    id,
    profile: input.profile,
    lifecycle: {
      stage: input.lifecycle?.stage || "prospect",
      firstPurchaseDate: input.lifecycle.firstPurchaseDate,
      lastPurchaseDate: input.lifecycle.firstPurchaseDate, // Default to first purchase date
    },
    insights: {
      lifetimeValue: input.insights?.lifetimeValue || 0,
      totalPurchases: input.insights?.totalPurchases || 0,
      averageOrderValue: input.insights?.averageOrderValue || 0,
      segment: input.insights?.segment || "new",
      churnRisk: input.insights?.churnRisk || 0,
      satisfactionScore: input.insights?.satisfactionScore || 75,
      recommendedActions: input.insights?.recommendedActions || [],
    },
    preferences: {
      brands: input.preferences?.brands || [],
      communicationChannels: input.preferences?.communicationChannels || [],
      serviceInterests: input.preferences?.serviceInterests || [],
    },
    entityId: input.entityId,
    lastActivityAt: now,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.CUSTOMERS,
      Item: item,
    })
  );

  return itemToCustomer(item);
}

/**
 * Get a single customer by ID
 */
export async function getCustomerById(
  customerId: string
): Promise<Customer | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.CUSTOMERS,
      Key: {
        pk: buildCustomerPK(customerId),
        sk: CUSTOMER_METADATA_SK,
      },
    })
  );

  return result.Item ? itemToCustomer(result.Item as CustomerItem) : null;
}

/**
 * Get all customers (with optional pagination)
 */
export async function getAllCustomers(
  limit?: number,
  lastKey?: Record<string, any>
): Promise<PaginatedResult<Customer>> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.CUSTOMERS,
      Limit: limit,
      ExclusiveStartKey: lastKey,
    })
  );

  return {
    items: (result.Items || []).map((item) =>
      itemToCustomer(item as CustomerItem)
    ),
    lastEvaluatedKey: result.LastEvaluatedKey,
    count: result.Count || 0,
  };
}

/**
 * Get customers by entity ID
 */
export async function getCustomersByEntity(
  entityId: string,
  limit?: number
): Promise<Customer[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.CUSTOMERS,
      FilterExpression: "entityId = :entityId",
      ExpressionAttributeValues: {
        ":entityId": entityId,
      },
      Limit: limit,
    })
  );

  return (result.Items || []).map((item) =>
    itemToCustomer(item as CustomerItem)
  );
}

/**
 * Get customers by segment
 */
export async function getCustomersBySegment(
  segment: "vip" | "regular" | "at-risk" | "new"
): Promise<Customer[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.CUSTOMERS,
      FilterExpression: "insights.segment = :segment",
      ExpressionAttributeValues: {
        ":segment": segment,
      },
    })
  );

  return (result.Items || []).map((item) =>
    itemToCustomer(item as CustomerItem)
  );
}

/**
 * Get at-risk customers (churn risk > 0.7)
 */
export async function getAtRiskCustomers(): Promise<Customer[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.CUSTOMERS,
      FilterExpression: "insights.churnRisk > :threshold",
      ExpressionAttributeValues: {
        ":threshold": 0.7,
      },
    })
  );

  return (result.Items || []).map((item) =>
    itemToCustomer(item as CustomerItem)
  );
}

/**
 * Update a customer
 */
export async function updateCustomer(
  customerId: string,
  updates: UpdateCustomerInput
): Promise<Customer | null> {
  const updateExpressions: string[] = ["#updatedAt = :updatedAt"];
  const expressionAttributeNames: Record<string, string> = {
    "#updatedAt": "updatedAt",
  };
  const expressionAttributeValues: Record<string, any> = {
    ":updatedAt": new Date().toISOString(),
  };

  if (updates.lifecycle) {
    if (updates.lifecycle.stage !== undefined) {
      updateExpressions.push("lifecycle.stage = :stage");
      expressionAttributeValues[":stage"] = updates.lifecycle.stage;
    }
    if (updates.lifecycle.lastPurchaseDate !== undefined) {
      updateExpressions.push("lifecycle.lastPurchaseDate = :lastPurchaseDate");
      expressionAttributeValues[":lastPurchaseDate"] =
        updates.lifecycle.lastPurchaseDate;
    }
  }

  if (updates.insights) {
    if (updates.insights.lifetimeValue !== undefined) {
      updateExpressions.push("insights.lifetimeValue = :ltv");
      expressionAttributeValues[":ltv"] = updates.insights.lifetimeValue;
    }
    if (updates.insights.totalPurchases !== undefined) {
      updateExpressions.push("insights.totalPurchases = :totalPurchases");
      expressionAttributeValues[":totalPurchases"] =
        updates.insights.totalPurchases;
    }
    if (updates.insights.averageOrderValue !== undefined) {
      updateExpressions.push("insights.averageOrderValue = :aov");
      expressionAttributeValues[":aov"] = updates.insights.averageOrderValue;
    }
    if (updates.insights.segment !== undefined) {
      updateExpressions.push("insights.segment = :segment");
      expressionAttributeValues[":segment"] = updates.insights.segment;
    }
    if (updates.insights.churnRisk !== undefined) {
      updateExpressions.push("insights.churnRisk = :churnRisk");
      expressionAttributeValues[":churnRisk"] = updates.insights.churnRisk;
    }
    if (updates.insights.satisfactionScore !== undefined) {
      updateExpressions.push("insights.satisfactionScore = :satisfaction");
      expressionAttributeValues[":satisfaction"] =
        updates.insights.satisfactionScore;
    }
    if (updates.insights.recommendedActions !== undefined) {
      updateExpressions.push("insights.recommendedActions = :actions");
      expressionAttributeValues[":actions"] =
        updates.insights.recommendedActions;
    }
  }

  if (updates.preferences) {
    if (updates.preferences.brands !== undefined) {
      updateExpressions.push("preferences.brands = :brands");
      expressionAttributeValues[":brands"] = updates.preferences.brands;
    }
    if (updates.preferences.communicationChannels !== undefined) {
      updateExpressions.push(
        "preferences.communicationChannels = :channels"
      );
      expressionAttributeValues[":channels"] =
        updates.preferences.communicationChannels;
    }
    if (updates.preferences.serviceInterests !== undefined) {
      updateExpressions.push("preferences.serviceInterests = :interests");
      expressionAttributeValues[":interests"] =
        updates.preferences.serviceInterests;
    }
  }

  if (updates.lastActivityAt !== undefined) {
    updateExpressions.push("lastActivityAt = :lastActivityAt");
    expressionAttributeValues[":lastActivityAt"] = updates.lastActivityAt;
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLES.CUSTOMERS,
      Key: {
        pk: buildCustomerPK(customerId),
        sk: CUSTOMER_METADATA_SK,
      },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes
    ? itemToCustomer(result.Attributes as CustomerItem)
    : null;
}

/**
 * Delete a customer
 */
export async function deleteCustomer(customerId: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLES.CUSTOMERS,
      Key: {
        pk: buildCustomerPK(customerId),
        sk: CUSTOMER_METADATA_SK,
      },
    })
  );
}

/**
 * Get dashboard stats for customers
 */
export async function getCustomerStats(): Promise<{
  total: number;
  vip: number;
  regular: number;
  atRisk: number;
  new: number;
  totalLifetimeValue: number;
  averageLifetimeValue: number;
}> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.CUSTOMERS,
    })
  );

  const customers = (result.Items || []).map((item) =>
    itemToCustomer(item as CustomerItem)
  );

  const vip = customers.filter((c) => c.insights.segment === "vip").length;
  const regular = customers.filter((c) => c.insights.segment === "regular")
    .length;
  const atRisk = customers.filter((c) => c.insights.segment === "at-risk")
    .length;
  const newCustomers = customers.filter((c) => c.insights.segment === "new")
    .length;

  const totalLifetimeValue = customers.reduce(
    (sum, c) => sum + c.insights.lifetimeValue,
    0
  );

  return {
    total: customers.length,
    vip,
    regular,
    atRisk,
    new: newCustomers,
    totalLifetimeValue,
    averageLifetimeValue:
      customers.length > 0 ? totalLifetimeValue / customers.length : 0,
  };
}
