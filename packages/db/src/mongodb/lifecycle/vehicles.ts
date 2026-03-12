/**
 * MongoDB Vehicles/Inventory Operations for Customer Lifecycle
 */

import { ObjectId, type Collection, type Filter } from "mongodb";
import { getCollection } from "../client";
import type {
  VehicleDocument,
  Vehicle,
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleStats,
  VehicleBrand,
  VehicleStatus,
  PaginatedResult,
  ImportOrderDocument,
  ImportOrder,
  CreateImportOrderInput,
  UpdateImportOrderInput,
  OrderStatus,
} from "./types";

const VEHICLES_COLLECTION = "vehicles";
const IMPORT_ORDERS_COLLECTION = "importOrders";

// ============================================
// Collection Accessors
// ============================================

async function getVehiclesCollection(): Promise<Collection<VehicleDocument>> {
  return getCollection<VehicleDocument>(VEHICLES_COLLECTION);
}

async function getImportOrdersCollection(): Promise<Collection<ImportOrderDocument>> {
  return getCollection<ImportOrderDocument>(IMPORT_ORDERS_COLLECTION);
}

// ============================================
// Helper Functions
// ============================================

function calculateAgeAlert(arrivedAt?: string): { daysInInventory: number; ageAlert: "none" | "warning" | "critical" } {
  if (!arrivedAt) {
    return { daysInInventory: 0, ageAlert: "none" };
  }

  const arrived = new Date(arrivedAt);
  const now = new Date();
  const daysInInventory = Math.floor((now.getTime() - arrived.getTime()) / (1000 * 60 * 60 * 24));

  let ageAlert: "none" | "warning" | "critical" = "none";
  if (daysInInventory > 90) {
    ageAlert = "critical";
  } else if (daysInInventory > 60) {
    ageAlert = "warning";
  }

  return { daysInInventory, ageAlert };
}

function documentToVehicle(doc: VehicleDocument): Vehicle {
  const { daysInInventory, ageAlert } = calculateAgeAlert(doc.arrivedAt);

  return {
    id: doc._id.toHexString(),
    vin: doc.vin,
    brand: doc.brand,
    model: doc.model,
    variant: doc.variant,
    color: doc.color,
    configuration: doc.configuration,
    year: doc.year,
    importPrice: doc.importPrice,
    listPrice: doc.listPrice,
    dealerPrice: doc.dealerPrice,
    status: doc.status,
    currentLocation: doc.currentLocation,
    assignedShowroom: doc.assignedShowroom,
    orderedAt: doc.orderedAt,
    expectedArrival: doc.expectedArrival,
    arrivedAt: doc.arrivedAt,
    soldAt: doc.soldAt,
    daysInInventory,
    ageAlert,
    importOrderId: doc.importOrderId,
    soldToCustomerId: doc.soldToCustomerId,
    reservedForLeadId: doc.reservedForLeadId,
    entityId: doc.entityId,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function documentToImportOrder(doc: ImportOrderDocument): ImportOrder {
  return {
    id: doc._id.toHexString(),
    orderNumber: doc.orderNumber,
    brand: doc.brand,
    totalUnits: doc.totalUnits,
    vehicles: doc.vehicles,
    orderedAt: doc.orderedAt,
    expectedProductionComplete: doc.expectedProductionComplete,
    expectedShipDate: doc.expectedShipDate,
    expectedArrivalDate: doc.expectedArrivalDate,
    actualArrivalDate: doc.actualArrivalDate,
    status: doc.status,
    totalValue: doc.totalValue,
    lcNumber: doc.lcNumber,
    lcOpenedAt: doc.lcOpenedAt,
    lcExpiryAt: doc.lcExpiryAt,
    notes: doc.notes,
    entityId: doc.entityId,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

// ============================================
// Vehicle CRUD Operations
// ============================================

/**
 * Create a new vehicle
 */
export async function createVehicle(input: CreateVehicleInput): Promise<Vehicle> {
  const collection = await getVehiclesCollection();
  const now = new Date();
  const { daysInInventory, ageAlert } = calculateAgeAlert();

  const doc: Omit<VehicleDocument, "_id"> = {
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
    daysInInventory,
    ageAlert,
    importOrderId: input.importOrderId,
    entityId: input.entityId,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(doc as VehicleDocument);
  const inserted = await collection.findOne({ _id: result.insertedId });

  if (!inserted) {
    throw new Error("Failed to create vehicle");
  }

  return documentToVehicle(inserted);
}

/**
 * Get a vehicle by ID
 */
export async function getVehicleById(id: string): Promise<Vehicle | null> {
  const collection = await getVehiclesCollection();

  try {
    const doc = await collection.findOne({ _id: new ObjectId(id) });
    return doc ? documentToVehicle(doc) : null;
  } catch {
    return null;
  }
}

/**
 * Get a vehicle by VIN
 */
export async function getVehicleByVin(vin: string): Promise<Vehicle | null> {
  const collection = await getVehiclesCollection();
  const doc = await collection.findOne({ vin });
  return doc ? documentToVehicle(doc) : null;
}

/**
 * Get all vehicles with pagination
 */
export async function getAllVehicles(
  limit = 100,
  skip = 0
): Promise<PaginatedResult<Vehicle>> {
  const collection = await getVehiclesCollection();

  const [docs, total] = await Promise.all([
    collection
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    collection.countDocuments({}),
  ]);

  return {
    items: docs.map(documentToVehicle),
    total,
    hasMore: skip + docs.length < total,
  };
}

/**
 * Get vehicles by entity ID
 */
export async function getVehiclesByEntity(entityId: string): Promise<Vehicle[]> {
  const collection = await getVehiclesCollection();
  const docs = await collection
    .find({ entityId })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(documentToVehicle);
}

/**
 * Get vehicles by multiple entity IDs
 */
export async function getVehiclesByEntities(entityIds: string[]): Promise<Vehicle[]> {
  const collection = await getVehiclesCollection();
  const docs = await collection
    .find({ entityId: { $in: entityIds } })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(documentToVehicle);
}

/**
 * Get vehicles by status
 */
export async function getVehiclesByStatus(status: VehicleStatus): Promise<Vehicle[]> {
  const collection = await getVehiclesCollection();
  const docs = await collection
    .find({ status })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(documentToVehicle);
}

/**
 * Get vehicles by brand
 */
export async function getVehiclesByBrand(brand: VehicleBrand): Promise<Vehicle[]> {
  const collection = await getVehiclesCollection();
  const docs = await collection
    .find({ brand })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(documentToVehicle);
}

/**
 * Get in-stock vehicles (at showroom, available for sale)
 */
export async function getInStockVehicles(entityIds?: string[]): Promise<Vehicle[]> {
  const collection = await getVehiclesCollection();

  const filter: Filter<VehicleDocument> = {
    status: { $in: ["at_showroom", "in_warehouse"] },
  };

  if (entityIds && entityIds.length > 0) {
    filter.entityId = { $in: entityIds };
  }

  const docs = await collection.find(filter).sort({ arrivedAt: 1 }).toArray();
  return docs.map(documentToVehicle);
}

/**
 * Get aging vehicles (warning or critical)
 */
export async function getAgingVehicles(entityIds?: string[]): Promise<Vehicle[]> {
  const collection = await getVehiclesCollection();

  // Get vehicles that arrived more than 60 days ago
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const filter: Filter<VehicleDocument> = {
    arrivedAt: { $lte: sixtyDaysAgo.toISOString() },
    status: { $nin: ["sold", "delivered"] },
  };

  if (entityIds && entityIds.length > 0) {
    filter.entityId = { $in: entityIds };
  }

  const docs = await collection.find(filter).sort({ arrivedAt: 1 }).toArray();
  return docs.map(documentToVehicle);
}

/**
 * Update a vehicle
 */
export async function updateVehicle(
  id: string,
  input: UpdateVehicleInput
): Promise<Vehicle | null> {
  const collection = await getVehiclesCollection();

  const updateDoc: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (input.status !== undefined) updateDoc.status = input.status;
  if (input.currentLocation !== undefined) updateDoc.currentLocation = input.currentLocation;
  if (input.assignedShowroom !== undefined) updateDoc.assignedShowroom = input.assignedShowroom;
  if (input.expectedArrival !== undefined) updateDoc.expectedArrival = input.expectedArrival;
  if (input.arrivedAt !== undefined) updateDoc.arrivedAt = input.arrivedAt;
  if (input.soldAt !== undefined) updateDoc.soldAt = input.soldAt;
  if (input.soldToCustomerId !== undefined) updateDoc.soldToCustomerId = input.soldToCustomerId;
  if (input.reservedForLeadId !== undefined) updateDoc.reservedForLeadId = input.reservedForLeadId;
  if (input.listPrice !== undefined) updateDoc.listPrice = input.listPrice;
  if (input.dealerPrice !== undefined) updateDoc.dealerPrice = input.dealerPrice;

  try {
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: "after" }
    );

    return result ? documentToVehicle(result) : null;
  } catch {
    return null;
  }
}

/**
 * Delete a vehicle
 */
export async function deleteVehicle(id: string): Promise<boolean> {
  const collection = await getVehiclesCollection();

  try {
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  } catch {
    return false;
  }
}

/**
 * Get vehicle statistics
 */
export async function getVehicleStats(entityIds?: string[]): Promise<VehicleStats> {
  const collection = await getVehiclesCollection();

  const filter: Filter<VehicleDocument> = entityIds
    ? { entityId: { $in: entityIds } }
    : {};

  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const pipeline = [
    { $match: filter },
    {
      $facet: {
        total: [{ $count: "count" }],
        byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
        byBrand: [{ $group: { _id: "$brand", count: { $sum: 1 } } }],
        atShowroom: [{ $match: { status: "at_showroom" } }, { $count: "count" }],
        inTransit: [{ $match: { status: "in_transit" } }, { $count: "count" }],
        reserved: [{ $match: { status: "reserved" } }, { $count: "count" }],
        sold: [{ $match: { status: { $in: ["sold", "delivered"] } } }, { $count: "count" }],
        agingWarning: [
          {
            $match: {
              arrivedAt: { $lte: sixtyDaysAgo.toISOString(), $gt: ninetyDaysAgo.toISOString() },
              status: { $nin: ["sold", "delivered"] },
            },
          },
          { $count: "count" },
        ],
        agingCritical: [
          {
            $match: {
              arrivedAt: { $lte: ninetyDaysAgo.toISOString() },
              status: { $nin: ["sold", "delivered"] },
            },
          },
          { $count: "count" },
        ],
        totalValue: [
          { $match: { status: { $nin: ["sold", "delivered"] } } },
          { $group: { _id: null, total: { $sum: "$listPrice" } } },
        ],
      },
    },
  ];

  const [result] = await collection.aggregate(pipeline).toArray();

  return {
    total: result.total[0]?.count || 0,
    byStatus: Object.fromEntries(
      result.byStatus.map((s: { _id: string; count: number }) => [s._id, s.count])
    ),
    byBrand: Object.fromEntries(
      result.byBrand.map((b: { _id: string; count: number }) => [b._id, b.count])
    ),
    atShowroom: result.atShowroom[0]?.count || 0,
    inTransit: result.inTransit[0]?.count || 0,
    reserved: result.reserved[0]?.count || 0,
    sold: result.sold[0]?.count || 0,
    agingWarning: result.agingWarning[0]?.count || 0,
    agingCritical: result.agingCritical[0]?.count || 0,
    totalValue: result.totalValue[0]?.total || 0,
  };
}

// ============================================
// Import Order CRUD Operations
// ============================================

/**
 * Create a new import order
 */
export async function createImportOrder(input: CreateImportOrderInput): Promise<ImportOrder> {
  const collection = await getImportOrdersCollection();
  const now = new Date();

  const totalUnits = input.vehicles.reduce((sum, v) => sum + v.quantity, 0);

  const doc: Omit<ImportOrderDocument, "_id"> = {
    orderNumber: input.orderNumber,
    brand: input.brand,
    totalUnits,
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

  const result = await collection.insertOne(doc as ImportOrderDocument);
  const inserted = await collection.findOne({ _id: result.insertedId });

  if (!inserted) {
    throw new Error("Failed to create import order");
  }

  return documentToImportOrder(inserted);
}

/**
 * Get an import order by ID
 */
export async function getImportOrderById(id: string): Promise<ImportOrder | null> {
  const collection = await getImportOrdersCollection();

  try {
    const doc = await collection.findOne({ _id: new ObjectId(id) });
    return doc ? documentToImportOrder(doc) : null;
  } catch {
    return null;
  }
}

/**
 * Get all import orders
 */
export async function getAllImportOrders(
  limit = 100,
  skip = 0
): Promise<PaginatedResult<ImportOrder>> {
  const collection = await getImportOrdersCollection();

  const [docs, total] = await Promise.all([
    collection
      .find({})
      .sort({ orderedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    collection.countDocuments({}),
  ]);

  return {
    items: docs.map(documentToImportOrder),
    total,
    hasMore: skip + docs.length < total,
  };
}

/**
 * Get import orders by entity
 */
export async function getImportOrdersByEntity(entityId: string): Promise<ImportOrder[]> {
  const collection = await getImportOrdersCollection();
  const docs = await collection
    .find({ entityId })
    .sort({ orderedAt: -1 })
    .toArray();
  return docs.map(documentToImportOrder);
}

/**
 * Get import orders by multiple entity IDs
 */
export async function getImportOrdersByEntities(entityIds: string[]): Promise<ImportOrder[]> {
  const collection = await getImportOrdersCollection();
  const docs = await collection
    .find({ entityId: { $in: entityIds } })
    .sort({ orderedAt: -1 })
    .toArray();
  return docs.map(documentToImportOrder);
}

/**
 * Get import orders by status
 */
export async function getImportOrdersByStatus(status: OrderStatus): Promise<ImportOrder[]> {
  const collection = await getImportOrdersCollection();
  const docs = await collection
    .find({ status })
    .sort({ orderedAt: -1 })
    .toArray();
  return docs.map(documentToImportOrder);
}

/**
 * Update an import order
 */
export async function updateImportOrder(
  id: string,
  input: UpdateImportOrderInput
): Promise<ImportOrder | null> {
  const collection = await getImportOrdersCollection();

  const updateDoc: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (input.status !== undefined) updateDoc.status = input.status;
  if (input.expectedProductionComplete !== undefined) updateDoc.expectedProductionComplete = input.expectedProductionComplete;
  if (input.expectedShipDate !== undefined) updateDoc.expectedShipDate = input.expectedShipDate;
  if (input.expectedArrivalDate !== undefined) updateDoc.expectedArrivalDate = input.expectedArrivalDate;
  if (input.actualArrivalDate !== undefined) updateDoc.actualArrivalDate = input.actualArrivalDate;
  if (input.lcNumber !== undefined) updateDoc.lcNumber = input.lcNumber;
  if (input.lcOpenedAt !== undefined) updateDoc.lcOpenedAt = input.lcOpenedAt;
  if (input.lcExpiryAt !== undefined) updateDoc.lcExpiryAt = input.lcExpiryAt;
  if (input.notes !== undefined) updateDoc.notes = input.notes;

  try {
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: "after" }
    );

    return result ? documentToImportOrder(result) : null;
  } catch {
    return null;
  }
}

/**
 * Delete an import order
 */
export async function deleteImportOrder(id: string): Promise<boolean> {
  const collection = await getImportOrdersCollection();

  try {
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  } catch {
    return false;
  }
}
