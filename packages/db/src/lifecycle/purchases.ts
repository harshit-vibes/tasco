import { PutCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../client";
import { TABLES, buildPurchasePK, buildPurchaseSK } from "../tables";
import type {
  Purchase,
  PurchaseItem,
  CreatePurchaseInput,
} from "./types";

/**
 * Generate a unique purchase ID
 */
const generateId = (): string => {
  return `pur_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Convert DynamoDB item to Purchase
 */
const itemToPurchase = (item: PurchaseItem): Purchase => {
  const { pk, sk, ...purchase } = item;
  return purchase as Purchase;
};

/**
 * Create a new purchase
 */
export async function createPurchase(
  input: CreatePurchaseInput
): Promise<Purchase> {
  const id = input.id || generateId();
  const purchaseDate = input.purchaseDate || new Date().toISOString();
  const now = new Date().toISOString();

  const item: PurchaseItem = {
    pk: buildPurchasePK(input.customerId),
    sk: buildPurchaseSK(purchaseDate, id),
    id,
    customerId: input.customerId,
    brand: input.brand,
    vehicleModel: input.vehicleModel,
    year: input.year,
    amount: input.amount,
    paymentMethod: input.paymentMethod,
    salesRep: input.salesRep,
    purchaseDate,
    entityId: input.entityId,
    createdAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.PURCHASES,
      Item: item,
    })
  );

  return itemToPurchase(item);
}

/**
 * Get purchases by customer ID
 */
export async function getPurchasesByCustomerId(
  customerId: string
): Promise<Purchase[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.PURCHASES,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": buildPurchasePK(customerId),
      },
      ScanIndexForward: false, // Most recent first
    })
  );

  return (result.Items || []).map((item) =>
    itemToPurchase(item as PurchaseItem)
  );
}

/**
 * Get purchases by entity
 */
export async function getPurchasesByEntity(
  entityId: string
): Promise<Purchase[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.PURCHASES,
      FilterExpression: "entityId = :entityId",
      ExpressionAttributeValues: {
        ":entityId": entityId,
      },
    })
  );

  return (result.Items || []).map((item) =>
    itemToPurchase(item as PurchaseItem)
  );
}

/**
 * Get purchases by brand
 */
export async function getPurchasesByBrand(brand: string): Promise<Purchase[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.PURCHASES,
      FilterExpression: "brand = :brand",
      ExpressionAttributeValues: {
        ":brand": brand,
      },
    })
  );

  return (result.Items || []).map((item) =>
    itemToPurchase(item as PurchaseItem)
  );
}

/**
 * Get purchase stats
 */
export async function getPurchaseStats(): Promise<{
  total: number;
  totalRevenue: number;
  averagePurchaseValue: number;
  topBrands: { brand: string; count: number }[];
}> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.PURCHASES,
    })
  );

  const purchases = (result.Items || []).map((item) =>
    itemToPurchase(item as PurchaseItem)
  );

  const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0);

  // Calculate top brands
  const brandCounts = purchases.reduce(
    (acc, p) => {
      acc[p.brand] = (acc[p.brand] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const topBrands = Object.entries(brandCounts)
    .map(([brand, count]) => ({ brand, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    total: purchases.length,
    totalRevenue,
    averagePurchaseValue:
      purchases.length > 0 ? totalRevenue / purchases.length : 0,
    topBrands,
  };
}
