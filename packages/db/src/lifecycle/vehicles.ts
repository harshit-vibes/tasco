import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "../client";
import { TABLES, buildVehiclePK, VEHICLE_METADATA_SK } from "../tables";
import type {
  Vehicle,
  VehicleItem,
  VehicleStatus,
  VehicleBrand,
  AgeAlert,
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleStats,
} from "./types";

// ============================================
// Helper Functions
// ============================================

const generateVehicleId = (): string =>
  `veh_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const calculateDaysInInventory = (arrivedAt?: string): number => {
  if (!arrivedAt) return 0;
  const arrived = new Date(arrivedAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - arrived.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const calculateAgeAlert = (daysInInventory: number): AgeAlert => {
  if (daysInInventory >= 90) return "critical";
  if (daysInInventory >= 60) return "warning";
  return "none";
};

const itemToVehicle = (item: VehicleItem): Vehicle => {
  const { pk, sk, ...vehicle } = item;
  // Recalculate age fields on read
  const daysInInventory = calculateDaysInInventory(vehicle.arrivedAt);
  const ageAlert = calculateAgeAlert(daysInInventory);
  return {
    ...vehicle,
    daysInInventory,
    ageAlert,
  } as Vehicle;
};

// ============================================
// CREATE
// ============================================

export async function createVehicle(input: CreateVehicleInput): Promise<Vehicle> {
  const id = input.id || generateVehicleId();
  const now = new Date().toISOString();

  const item: VehicleItem = {
    pk: buildVehiclePK(id),
    sk: VEHICLE_METADATA_SK,
    id,
    vin: input.vin,
    brand: input.brand,
    model: input.model,
    variant: input.variant,
    color: input.color,
    configuration: input.configuration,
    year: input.year,
    importPrice: input.importPrice,
    listPrice: input.listPrice,
    dealerPrice: input.dealerPrice,
    status: input.status || "ordered",
    currentLocation: input.currentLocation,
    assignedShowroom: input.assignedShowroom,
    orderedAt: input.orderedAt,
    expectedArrival: input.expectedArrival,
    importOrderId: input.importOrderId,
    daysInInventory: 0,
    ageAlert: "none",
    entityId: input.entityId,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.VEHICLES,
      Item: item,
    })
  );

  return itemToVehicle(item);
}

// ============================================
// READ
// ============================================

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.VEHICLES,
      Key: {
        pk: buildVehiclePK(id),
        sk: VEHICLE_METADATA_SK,
      },
    })
  );

  return result.Item ? itemToVehicle(result.Item as VehicleItem) : null;
}

export async function getVehicleByVin(vin: string): Promise<Vehicle | null> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.VEHICLES,
      FilterExpression: "vin = :vin",
      ExpressionAttributeValues: {
        ":vin": vin,
      },
      Limit: 1,
    })
  );

  return result.Items && result.Items.length > 0
    ? itemToVehicle(result.Items[0] as VehicleItem)
    : null;
}

export async function getAllVehicles(): Promise<{ items: Vehicle[] }> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.VEHICLES,
    })
  );

  const items = (result.Items || []).map((item) =>
    itemToVehicle(item as VehicleItem)
  );

  return { items };
}

export async function getVehiclesByEntity(entityId: string): Promise<Vehicle[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.VEHICLES,
      FilterExpression: "entityId = :entityId",
      ExpressionAttributeValues: {
        ":entityId": entityId,
      },
    })
  );

  return (result.Items || []).map((item) => itemToVehicle(item as VehicleItem));
}

export async function getVehiclesByStatus(status: VehicleStatus): Promise<Vehicle[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.VEHICLES,
      FilterExpression: "#status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": status,
      },
    })
  );

  return (result.Items || []).map((item) => itemToVehicle(item as VehicleItem));
}

export async function getVehiclesByBrand(brand: VehicleBrand): Promise<Vehicle[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.VEHICLES,
      FilterExpression: "brand = :brand",
      ExpressionAttributeValues: {
        ":brand": brand,
      },
    })
  );

  return (result.Items || []).map((item) => itemToVehicle(item as VehicleItem));
}

export async function getVehiclesByImportOrder(importOrderId: string): Promise<Vehicle[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.VEHICLES,
      FilterExpression: "importOrderId = :importOrderId",
      ExpressionAttributeValues: {
        ":importOrderId": importOrderId,
      },
    })
  );

  return (result.Items || []).map((item) => itemToVehicle(item as VehicleItem));
}

export async function getAgingVehicles(minDays: number = 60): Promise<Vehicle[]> {
  const result = await getAllVehicles();
  return result.items.filter(
    (v) => v.daysInInventory >= minDays && !["sold", "delivered"].includes(v.status)
  );
}

export async function getAvailableVehicles(): Promise<Vehicle[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.VEHICLES,
      FilterExpression: "#status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": "at_showroom",
      },
    })
  );

  return (result.Items || []).map((item) => itemToVehicle(item as VehicleItem));
}

// ============================================
// UPDATE
// ============================================

export async function updateVehicle(
  id: string,
  updates: UpdateVehicleInput
): Promise<Vehicle | null> {
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

  if (updates.currentLocation !== undefined) {
    updateExpressions.push("currentLocation = :currentLocation");
    expressionAttributeValues[":currentLocation"] = updates.currentLocation;
  }

  if (updates.assignedShowroom !== undefined) {
    updateExpressions.push("assignedShowroom = :assignedShowroom");
    expressionAttributeValues[":assignedShowroom"] = updates.assignedShowroom;
  }

  if (updates.expectedArrival !== undefined) {
    updateExpressions.push("expectedArrival = :expectedArrival");
    expressionAttributeValues[":expectedArrival"] = updates.expectedArrival;
  }

  if (updates.arrivedAt !== undefined) {
    updateExpressions.push("arrivedAt = :arrivedAt");
    expressionAttributeValues[":arrivedAt"] = updates.arrivedAt;
  }

  if (updates.soldAt !== undefined) {
    updateExpressions.push("soldAt = :soldAt");
    expressionAttributeValues[":soldAt"] = updates.soldAt;
  }

  if (updates.soldToCustomerId !== undefined) {
    updateExpressions.push("soldToCustomerId = :soldToCustomerId");
    expressionAttributeValues[":soldToCustomerId"] = updates.soldToCustomerId;
  }

  if (updates.reservedForLeadId !== undefined) {
    updateExpressions.push("reservedForLeadId = :reservedForLeadId");
    expressionAttributeValues[":reservedForLeadId"] = updates.reservedForLeadId;
  }

  if (updates.listPrice !== undefined) {
    updateExpressions.push("listPrice = :listPrice");
    expressionAttributeValues[":listPrice"] = updates.listPrice;
  }

  if (updates.dealerPrice !== undefined) {
    updateExpressions.push("dealerPrice = :dealerPrice");
    expressionAttributeValues[":dealerPrice"] = updates.dealerPrice;
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLES.VEHICLES,
      Key: {
        pk: buildVehiclePK(id),
        sk: VEHICLE_METADATA_SK,
      },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes
    ? itemToVehicle(result.Attributes as VehicleItem)
    : null;
}

// ============================================
// DELETE
// ============================================

export async function deleteVehicle(id: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLES.VEHICLES,
      Key: {
        pk: buildVehiclePK(id),
        sk: VEHICLE_METADATA_SK,
      },
    })
  );
}

// ============================================
// STATS
// ============================================

export async function getVehicleStats(entityIds?: string[]): Promise<VehicleStats> {
  let vehicles: Vehicle[];

  if (entityIds && entityIds.length > 0) {
    const promises = entityIds.map((id) => getVehiclesByEntity(id));
    const results = await Promise.all(promises);
    vehicles = results.flat();
  } else {
    const result = await getAllVehicles();
    vehicles = result.items;
  }

  const byStatus: Partial<Record<VehicleStatus, number>> = {};
  const byBrand: Partial<Record<VehicleBrand, number>> = {};
  let totalValue = 0;
  let agingWarning = 0;
  let agingCritical = 0;

  for (const v of vehicles) {
    // Count by status
    byStatus[v.status] = (byStatus[v.status] || 0) + 1;
    // Count by brand
    byBrand[v.brand] = (byBrand[v.brand] || 0) + 1;
    // Sum value for unsold vehicles
    if (!["sold", "delivered"].includes(v.status)) {
      totalValue += v.listPrice;
    }
    // Count aging
    if (v.ageAlert === "warning") agingWarning++;
    if (v.ageAlert === "critical") agingCritical++;
  }

  return {
    total: vehicles.length,
    byStatus,
    byBrand,
    atShowroom: byStatus["at_showroom"] || 0,
    inTransit: byStatus["in_transit"] || 0,
    reserved: byStatus["reserved"] || 0,
    sold: (byStatus["sold"] || 0) + (byStatus["delivered"] || 0),
    agingWarning,
    agingCritical,
    totalValue,
  };
}
