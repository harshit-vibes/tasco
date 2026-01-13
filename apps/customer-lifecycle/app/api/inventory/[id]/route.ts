/**
 * Vehicle Detail API Route
 * Handles individual vehicle operations by ID
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getVehicleById,
  getVehiclesByImportOrder,
  updateVehicle,
  deleteVehicle,
  createNotification,
  type Vehicle,
  type UpdateVehicleInput,
} from "@tasco/db";
import { syncVehicleToRAG } from "../../../../lib/rag-sync";

export const dynamic = "force-dynamic";

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

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  try {
    const { id: vehicleId } = await params;
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section");

    const vehicle = await getVehicleById(vehicleId);

    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: "Vehicle not found" },
        { status: 404 }
      );
    }

    // Return sibling vehicles from same import order
    if (section === "siblings" && vehicle.importOrderId) {
      const siblings = await getVehiclesByImportOrder(vehicle.importOrderId);
      return NextResponse.json({
        success: true,
        siblings: siblings
          .filter((v) => v.id !== vehicleId)
          .map(toFrontendVehicle),
      });
    }

    return NextResponse.json({
      success: true,
      vehicle: toFrontendVehicle(vehicle),
    });
  } catch (error) {
    console.error("[API /inventory/[id] GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch vehicle" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  try {
    const { id: vehicleId } = await params;
    const body = await request.json();

    const existingVehicle = await getVehicleById(vehicleId);
    if (!existingVehicle) {
      return NextResponse.json(
        { success: false, error: "Vehicle not found" },
        { status: 404 }
      );
    }

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

    const updatedVehicle = await updateVehicle(vehicleId, updates);

    if (!updatedVehicle) {
      return NextResponse.json(
        { success: false, error: "Failed to update vehicle" },
        { status: 500 }
      );
    }

    // Background sync to RAG
    syncVehicleToRAG(updatedVehicle).catch((err) =>
      console.error("[RAG Sync] Background sync failed:", err)
    );

    // Status change notification
    const statusChanged =
      body.status && body.status !== existingVehicle.status;
    if (statusChanged) {
      const notifType =
        updatedVehicle.status === "sold" ? "completed" : "updated";
      createNotification({
        type: notifType,
        category: "inventory",
        title: `Vehicle ${updatedVehicle.status}: ${updatedVehicle.brand} ${updatedVehicle.model}`,
        message: `Status changed from "${existingVehicle.status}" to "${updatedVehicle.status}"`,
        appId: APP_ID,
        priority: updatedVehicle.status === "sold" ? "high" : "medium",
        actionUrl: `/inventory?id=${updatedVehicle.id}`,
        metadata: { vehicleId: updatedVehicle.id },
      }).catch((err) => console.error("[Notification] Failed:", err));
    }

    return NextResponse.json({
      success: true,
      vehicle: toFrontendVehicle(updatedVehicle),
    });
  } catch (error) {
    console.error("[API /inventory/[id] PATCH] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update vehicle" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  try {
    const { id: vehicleId } = await params;

    const vehicle = await getVehicleById(vehicleId);
    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: "Vehicle not found" },
        { status: 404 }
      );
    }

    await deleteVehicle(vehicleId);

    // Create notification
    createNotification({
      type: "deleted",
      category: "inventory",
      title: `Vehicle removed: ${vehicle.brand} ${vehicle.model}`,
      message: `VIN: ${vehicle.vin}`,
      appId: APP_ID,
      priority: "low",
      actionUrl: `/inventory`,
      metadata: { vehicleId },
    }).catch((err) => console.error("[Notification] Failed:", err));

    return NextResponse.json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    console.error("[API /inventory/[id] DELETE] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete vehicle" },
      { status: 500 }
    );
  }
}
