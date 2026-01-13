import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "../client";
import { TABLES, buildImportOrderPK, IMPORT_ORDER_METADATA_SK } from "../tables";
import type {
  ImportOrder,
  ImportOrderItem,
  OrderStatus,
  VehicleBrand,
  CreateImportOrderInput,
  UpdateImportOrderInput,
  ImportOrderStats,
} from "./types";

// ============================================
// Helper Functions
// ============================================

const generateOrderId = (): string =>
  `ord_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const calculateTotalUnits = (vehicles: { quantity: number }[]): number =>
  vehicles.reduce((sum, v) => sum + v.quantity, 0);

const itemToImportOrder = (item: ImportOrderItem): ImportOrder => {
  const { pk, sk, ...order } = item;
  return order as ImportOrder;
};

// ============================================
// CREATE
// ============================================

export async function createImportOrder(
  input: CreateImportOrderInput
): Promise<ImportOrder> {
  const id = input.id || generateOrderId();
  const now = new Date().toISOString();

  const item: ImportOrderItem = {
    pk: buildImportOrderPK(id),
    sk: IMPORT_ORDER_METADATA_SK,
    id,
    orderNumber: input.orderNumber,
    brand: input.brand,
    totalUnits: calculateTotalUnits(input.vehicles),
    vehicles: input.vehicles,
    orderedAt: input.orderedAt,
    expectedProductionComplete: input.expectedProductionComplete,
    expectedShipDate: input.expectedShipDate,
    expectedArrivalDate: input.expectedArrivalDate,
    status: "draft",
    totalValue: input.totalValue,
    lcNumber: input.lcNumber,
    lcOpenedAt: input.lcOpenedAt,
    lcExpiryAt: input.lcExpiryAt,
    notes: input.notes,
    entityId: input.entityId,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.IMPORT_ORDERS,
      Item: item,
    })
  );

  return itemToImportOrder(item);
}

// ============================================
// READ
// ============================================

export async function getImportOrderById(id: string): Promise<ImportOrder | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.IMPORT_ORDERS,
      Key: {
        pk: buildImportOrderPK(id),
        sk: IMPORT_ORDER_METADATA_SK,
      },
    })
  );

  return result.Item ? itemToImportOrder(result.Item as ImportOrderItem) : null;
}

export async function getImportOrderByNumber(orderNumber: string): Promise<ImportOrder | null> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.IMPORT_ORDERS,
      FilterExpression: "orderNumber = :orderNumber",
      ExpressionAttributeValues: {
        ":orderNumber": orderNumber,
      },
      Limit: 1,
    })
  );

  return result.Items && result.Items.length > 0
    ? itemToImportOrder(result.Items[0] as ImportOrderItem)
    : null;
}

export async function getAllImportOrders(): Promise<{ items: ImportOrder[] }> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.IMPORT_ORDERS,
    })
  );

  const items = (result.Items || []).map((item) =>
    itemToImportOrder(item as ImportOrderItem)
  );

  return { items };
}

export async function getImportOrdersByEntity(entityId: string): Promise<ImportOrder[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.IMPORT_ORDERS,
      FilterExpression: "entityId = :entityId",
      ExpressionAttributeValues: {
        ":entityId": entityId,
      },
    })
  );

  return (result.Items || []).map((item) =>
    itemToImportOrder(item as ImportOrderItem)
  );
}

export async function getImportOrdersByStatus(status: OrderStatus): Promise<ImportOrder[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.IMPORT_ORDERS,
      FilterExpression: "#status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": status,
      },
    })
  );

  return (result.Items || []).map((item) =>
    itemToImportOrder(item as ImportOrderItem)
  );
}

export async function getImportOrdersByBrand(brand: VehicleBrand): Promise<ImportOrder[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.IMPORT_ORDERS,
      FilterExpression: "brand = :brand",
      ExpressionAttributeValues: {
        ":brand": brand,
      },
    })
  );

  return (result.Items || []).map((item) =>
    itemToImportOrder(item as ImportOrderItem)
  );
}

export async function getActiveImportOrders(): Promise<ImportOrder[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.IMPORT_ORDERS,
      FilterExpression: "#status <> :completed",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":completed": "completed",
      },
    })
  );

  return (result.Items || []).map((item) =>
    itemToImportOrder(item as ImportOrderItem)
  );
}

// ============================================
// UPDATE
// ============================================

export async function updateImportOrder(
  id: string,
  updates: UpdateImportOrderInput
): Promise<ImportOrder | null> {
  const updateExpressions: string[] = ["#updatedAt = :updatedAt"];
  const expressionAttributeNames: Record<string, string> = {
    "#updatedAt": "updatedAt",
  };
  const expressionAttributeValues: Record<string, unknown> = {
    ":updatedAt": new Date().toISOString(),
  };

  if (updates.status !== undefined) {
    updateExpressions.push("#status = :status");
    expressionAttributeNames["#status"] = "status";
    expressionAttributeValues[":status"] = updates.status;
  }

  if (updates.expectedProductionComplete !== undefined) {
    updateExpressions.push("expectedProductionComplete = :expectedProductionComplete");
    expressionAttributeValues[":expectedProductionComplete"] = updates.expectedProductionComplete;
  }

  if (updates.expectedShipDate !== undefined) {
    updateExpressions.push("expectedShipDate = :expectedShipDate");
    expressionAttributeValues[":expectedShipDate"] = updates.expectedShipDate;
  }

  if (updates.expectedArrivalDate !== undefined) {
    updateExpressions.push("expectedArrivalDate = :expectedArrivalDate");
    expressionAttributeValues[":expectedArrivalDate"] = updates.expectedArrivalDate;
  }

  if (updates.actualArrivalDate !== undefined) {
    updateExpressions.push("actualArrivalDate = :actualArrivalDate");
    expressionAttributeValues[":actualArrivalDate"] = updates.actualArrivalDate;
  }

  if (updates.lcNumber !== undefined) {
    updateExpressions.push("lcNumber = :lcNumber");
    expressionAttributeValues[":lcNumber"] = updates.lcNumber;
  }

  if (updates.lcOpenedAt !== undefined) {
    updateExpressions.push("lcOpenedAt = :lcOpenedAt");
    expressionAttributeValues[":lcOpenedAt"] = updates.lcOpenedAt;
  }

  if (updates.lcExpiryAt !== undefined) {
    updateExpressions.push("lcExpiryAt = :lcExpiryAt");
    expressionAttributeValues[":lcExpiryAt"] = updates.lcExpiryAt;
  }

  if (updates.notes !== undefined) {
    updateExpressions.push("notes = :notes");
    expressionAttributeValues[":notes"] = updates.notes;
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLES.IMPORT_ORDERS,
      Key: {
        pk: buildImportOrderPK(id),
        sk: IMPORT_ORDER_METADATA_SK,
      },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes
    ? itemToImportOrder(result.Attributes as ImportOrderItem)
    : null;
}

// ============================================
// DELETE
// ============================================

export async function deleteImportOrder(id: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLES.IMPORT_ORDERS,
      Key: {
        pk: buildImportOrderPK(id),
        sk: IMPORT_ORDER_METADATA_SK,
      },
    })
  );
}

// ============================================
// STATS
// ============================================

export async function getImportOrderStats(entityIds?: string[]): Promise<ImportOrderStats> {
  let orders: ImportOrder[];

  if (entityIds && entityIds.length > 0) {
    const promises = entityIds.map((id) => getImportOrdersByEntity(id));
    const results = await Promise.all(promises);
    orders = results.flat();
  } else {
    const result = await getAllImportOrders();
    orders = result.items;
  }

  const byStatus: Partial<Record<OrderStatus, number>> = {};
  const byBrand: Partial<Record<VehicleBrand, number>> = {};
  let totalUnits = 0;
  let totalValue = 0;
  let pendingArrival = 0;
  let arrivedThisMonth = 0;

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  for (const o of orders) {
    byStatus[o.status] = (byStatus[o.status] || 0) + 1;
    byBrand[o.brand] = (byBrand[o.brand] || 0) + 1;
    totalUnits += o.totalUnits;
    totalValue += o.totalValue;

    if (!o.actualArrivalDate) {
      pendingArrival++;
    } else if (o.actualArrivalDate.startsWith(thisMonth)) {
      arrivedThisMonth++;
    }
  }

  return {
    total: orders.length,
    byStatus,
    byBrand,
    totalUnits,
    totalValue,
    pendingArrival,
    arrivedThisMonth,
  };
}
