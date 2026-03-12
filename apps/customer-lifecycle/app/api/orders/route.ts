/**
 * Import Orders API Route
 * Manages import orders for vehicle supply chain tracking
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getAllImportOrders,
  getImportOrderById,
  getImportOrdersByEntity,
  getImportOrdersByEntities,
  getImportOrdersByStatus,
  createImportOrder,
  updateImportOrder,
  deleteImportOrder,
  type ImportOrder,
  type OrderStatus,
  type CreateImportOrderInput,
  type UpdateImportOrderInput,
} from "@tasco/db/mongodb/lifecycle";
import { syncImportOrderToRAG } from "../../../lib/rag-sync";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const APP_ID = "customer-lifecycle";

// Format currency for display
function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

// Transform DB order to frontend format
function toFrontendOrder(order: ImportOrder) {
  return {
    ...order,
    totalValueFormatted: formatCurrency(order.totalValue),
    vehicles: order.vehicles.map((v) => ({
      ...v,
      unitPriceFormatted: formatCurrency(v.unitPrice),
      totalFormatted: formatCurrency(v.unitPrice * v.quantity),
    })),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const entityId = searchParams.get("entityId");
    const entityIds = searchParams.get("entityIds");
    const status = searchParams.get("status") as OrderStatus | null;

    console.log("[orders] GET request", { id, entityId, entityIds, status });

    // Single order by ID
    if (id) {
      const order = await getImportOrderById(id);
      if (!order) {
        return NextResponse.json(
          { success: false, error: "Import order not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        order: toFrontendOrder(order),
        source: "mongodb",
      });
    }

    let orders: ImportOrder[] = [];

    // Filter by status
    if (status) {
      orders = await getImportOrdersByStatus(status);
      // Apply entity filter if provided
      if (entityIds) {
        const entityIdList = entityIds.split(",").filter(Boolean);
        orders = orders.filter((o) => entityIdList.includes(o.entityId));
      }
    }
    // Filter by single entity
    else if (entityId) {
      orders = await getImportOrdersByEntity(entityId);
    }
    // Filter by multiple entities
    else if (entityIds) {
      const entityIdList = entityIds.split(",").filter(Boolean);
      orders = await getImportOrdersByEntities(entityIdList);
    }
    // All orders
    else {
      const result = await getAllImportOrders();
      orders = result.items;
    }

    return NextResponse.json({
      success: true,
      orders: orders.map(toFrontendOrder),
      count: orders.length,
      source: "mongodb",
    });
  } catch (error) {
    console.error("[API /orders GET] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch import orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const {
      orderNumber,
      brand,
      vehicles,
      orderedAt,
      expectedProductionComplete,
      expectedShipDate,
      expectedArrivalDate,
      totalValue,
      entityId,
    } = body;

    if (
      !orderNumber ||
      !brand ||
      !vehicles ||
      !Array.isArray(vehicles) ||
      vehicles.length === 0 ||
      !orderedAt ||
      !expectedArrivalDate ||
      !totalValue ||
      !entityId
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const input: CreateImportOrderInput = {
      orderNumber,
      brand,
      vehicles,
      orderedAt,
      expectedProductionComplete: expectedProductionComplete || orderedAt,
      expectedShipDate: expectedShipDate || expectedArrivalDate,
      expectedArrivalDate,
      totalValue,
      lcNumber: body.lcNumber,
      lcOpenedAt: body.lcOpenedAt,
      lcExpiryAt: body.lcExpiryAt,
      notes: body.notes,
      entityId,
    };

    const order = await createImportOrder(input);

    // Background sync to RAG
    syncImportOrderToRAG(order).catch((err) =>
      console.error("[RAG Sync] Background sync failed:", err)
    );

    console.log("[orders] Created import order:", order.id);

    return NextResponse.json(
      {
        success: true,
        order: toFrontendOrder(order),
        message: "Import order created successfully",
        source: "mongodb",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API /orders POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create import order" },
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
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    const existingOrder = await getImportOrderById(id);
    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "Import order not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Build update object
    const updates: UpdateImportOrderInput = {};
    if (body.status !== undefined) updates.status = body.status;
    if (body.expectedProductionComplete !== undefined)
      updates.expectedProductionComplete = body.expectedProductionComplete;
    if (body.expectedShipDate !== undefined)
      updates.expectedShipDate = body.expectedShipDate;
    if (body.expectedArrivalDate !== undefined)
      updates.expectedArrivalDate = body.expectedArrivalDate;
    if (body.actualArrivalDate !== undefined)
      updates.actualArrivalDate = body.actualArrivalDate;
    if (body.lcNumber !== undefined) updates.lcNumber = body.lcNumber;
    if (body.lcOpenedAt !== undefined) updates.lcOpenedAt = body.lcOpenedAt;
    if (body.lcExpiryAt !== undefined) updates.lcExpiryAt = body.lcExpiryAt;
    if (body.notes !== undefined) updates.notes = body.notes;

    const order = await updateImportOrder(id, updates);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Failed to update import order" },
        { status: 500 }
      );
    }

    // Background sync to RAG
    syncImportOrderToRAG(order).catch((err) =>
      console.error("[RAG Sync] Background sync failed:", err)
    );

    console.log("[orders] Updated import order:", order.id);

    return NextResponse.json({
      success: true,
      order: toFrontendOrder(order),
      source: "mongodb",
    });
  } catch (error) {
    console.error("[API /orders PUT] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update import order" },
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
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    const order = await getImportOrderById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Import order not found" },
        { status: 404 }
      );
    }

    await deleteImportOrder(id);

    console.log("[orders] Deleted import order:", id);

    return NextResponse.json({
      success: true,
      message: "Import order deleted successfully",
      source: "mongodb",
    });
  } catch (error) {
    console.error("[API /orders DELETE] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete import order" },
      { status: 500 }
    );
  }
}
