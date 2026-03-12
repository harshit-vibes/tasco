/**
 * Vehicle Inventory API Route
 * Manages vehicle inventory with filtering by status, brand, entity, and age alerts
 * Migrated to MongoDB
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getAllVehicles,
  getVehicleById,
  getVehicleByVin,
  getVehiclesByEntity,
  getVehiclesByEntities,
  getVehiclesByStatus,
  getVehiclesByBrand,
  getAgingVehicles,
  getInStockVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  type Vehicle,
  type VehicleStatus,
  type VehicleBrand,
  type CreateVehicleInput,
  type UpdateVehicleInput,
} from "@tasco/db/mongodb/lifecycle";
import { syncVehicleToRAG } from "../../../lib/rag-sync";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const APP_ID = "customer-lifecycle";

// Format currency for display
function formatCurrency(value: number, currency = "VND"): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

// Transform DB vehicle to frontend format
function toFrontendVehicle(vehicle: Vehicle) {
  return {
    ...vehicle,
    listPriceFormatted: formatCurrency(vehicle.listPrice),
    importPriceFormatted: formatCurrency(vehicle.importPrice, "USD"),
    dealerPriceFormatted: vehicle.dealerPrice
      ? formatCurrency(vehicle.dealerPrice)
      : null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const vin = searchParams.get("vin");
    const entityId = searchParams.get("entityId");
    const entityIds = searchParams.get("entityIds");
    const status = searchParams.get("status") as VehicleStatus | null;
    const brand = searchParams.get("brand") as VehicleBrand | null;
    const aging = searchParams.get("aging");
    const available = searchParams.get("available");

    console.log("[inventory] GET request", { id, vin, entityId, entityIds, status, brand, aging, available });

    // Single vehicle by ID
    if (id) {
      const vehicle = await getVehicleById(id);
      if (!vehicle) {
        return NextResponse.json(
          { success: false, error: "Vehicle not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        vehicle: toFrontendVehicle(vehicle),
        source: "mongodb",
      });
    }

    // Single vehicle by VIN
    if (vin) {
      const vehicle = await getVehicleByVin(vin);
      if (!vehicle) {
        return NextResponse.json(
          { success: false, error: "Vehicle not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        vehicle: toFrontendVehicle(vehicle),
        source: "mongodb",
      });
    }

    // Aging vehicles (>60 days by default)
    if (aging === "true") {
      const entityIdList = entityIds ? entityIds.split(",").filter(Boolean) : undefined;
      const vehicles = await getAgingVehicles(entityIdList);
      return NextResponse.json({
        success: true,
        vehicles: vehicles.map(toFrontendVehicle),
        count: vehicles.length,
        filter: { aging: true },
        source: "mongodb",
      });
    }

    // Available vehicles (in stock at showroom)
    if (available === "true") {
      const entityIdList = entityIds ? entityIds.split(",").filter(Boolean) : undefined;
      const vehicles = await getInStockVehicles(entityIdList);
      return NextResponse.json({
        success: true,
        vehicles: vehicles.map(toFrontendVehicle),
        count: vehicles.length,
        filter: { available: true },
        source: "mongodb",
      });
    }

    let vehicles: Vehicle[] = [];

    // Filter by status
    if (status) {
      vehicles = await getVehiclesByStatus(status);
    }
    // Filter by brand
    else if (brand) {
      vehicles = await getVehiclesByBrand(brand);
    }
    // Filter by single entity
    else if (entityId) {
      vehicles = await getVehiclesByEntity(entityId);
    }
    // Filter by multiple entities
    else if (entityIds) {
      const entityIdList = entityIds.split(",").filter(Boolean);
      vehicles = await getVehiclesByEntities(entityIdList);
    }
    // All vehicles
    else {
      const result = await getAllVehicles();
      vehicles = result.items;
    }

    // Apply additional filters if combined with status/brand
    if (entityIds && (status || brand)) {
      const entityIdList = entityIds.split(",").filter(Boolean);
      vehicles = vehicles.filter((v) => entityIdList.includes(v.entityId));
    }

    return NextResponse.json({
      success: true,
      vehicles: vehicles.map(toFrontendVehicle),
      count: vehicles.length,
      source: "mongodb",
    });
  } catch (error) {
    console.error("[API /inventory GET] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const {
      vin,
      brand,
      model,
      variant,
      color,
      year,
      importPrice,
      listPrice,
      assignedShowroom,
      orderedAt,
      expectedArrival,
      entityId,
    } = body;

    if (
      !vin ||
      !brand ||
      !model ||
      !variant ||
      !color ||
      !year ||
      !importPrice ||
      !listPrice ||
      !assignedShowroom ||
      !orderedAt ||
      !expectedArrival ||
      !entityId
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check for duplicate VIN
    const existing = await getVehicleByVin(vin);
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Vehicle with this VIN already exists" },
        { status: 400 }
      );
    }

    const input: CreateVehicleInput = {
      vin,
      brand,
      model,
      variant,
      color,
      configuration: body.configuration,
      year,
      importPrice,
      listPrice,
      dealerPrice: body.dealerPrice,
      status: body.status || "ordered",
      currentLocation: body.currentLocation,
      assignedShowroom,
      orderedAt,
      expectedArrival,
      importOrderId: body.importOrderId,
      entityId,
    };

    const vehicle = await createVehicle(input);

    // Background sync to RAG
    syncVehicleToRAG(vehicle).catch((err) =>
      console.error("[RAG Sync] Background sync failed:", err)
    );

    console.log("[inventory] Created vehicle:", vehicle.id);

    return NextResponse.json(
      {
        success: true,
        vehicle: toFrontendVehicle(vehicle),
        message: "Vehicle created successfully",
        source: "mongodb",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API /inventory POST] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create vehicle" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Vehicle ID is required" },
        { status: 400 }
      );
    }

    const existingVehicle = await getVehicleById(id);
    if (!existingVehicle) {
      return NextResponse.json(
        { success: false, error: "Vehicle not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Build update object
    const updates: UpdateVehicleInput = {};
    if (body.status !== undefined) updates.status = body.status;
    if (body.currentLocation !== undefined)
      updates.currentLocation = body.currentLocation;
    if (body.assignedShowroom !== undefined)
      updates.assignedShowroom = body.assignedShowroom;
    if (body.expectedArrival !== undefined)
      updates.expectedArrival = body.expectedArrival;
    if (body.arrivedAt !== undefined) updates.arrivedAt = body.arrivedAt;
    if (body.soldAt !== undefined) updates.soldAt = body.soldAt;
    if (body.soldToCustomerId !== undefined)
      updates.soldToCustomerId = body.soldToCustomerId;
    if (body.reservedForLeadId !== undefined)
      updates.reservedForLeadId = body.reservedForLeadId;
    if (body.listPrice !== undefined) updates.listPrice = body.listPrice;
    if (body.dealerPrice !== undefined) updates.dealerPrice = body.dealerPrice;

    const vehicle = await updateVehicle(id, updates);

    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: "Failed to update vehicle" },
        { status: 500 }
      );
    }

    // Background sync to RAG
    syncVehicleToRAG(vehicle).catch((err) =>
      console.error("[RAG Sync] Background sync failed:", err)
    );

    console.log("[inventory] Updated vehicle:", vehicle.id);

    return NextResponse.json({
      success: true,
      vehicle: toFrontendVehicle(vehicle),
      source: "mongodb",
    });
  } catch (error) {
    console.error("[API /inventory PUT] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update vehicle" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Vehicle ID is required" },
        { status: 400 }
      );
    }

    const vehicle = await getVehicleById(id);
    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: "Vehicle not found" },
        { status: 404 }
      );
    }

    const deleted = await deleteVehicle(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Failed to delete vehicle" },
        { status: 500 }
      );
    }

    console.log("[inventory] Deleted vehicle:", id);

    return NextResponse.json({
      success: true,
      message: "Vehicle deleted successfully",
      source: "mongodb",
    });
  } catch (error) {
    console.error("[API /inventory DELETE] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete vehicle" },
      { status: 500 }
    );
  }
}
