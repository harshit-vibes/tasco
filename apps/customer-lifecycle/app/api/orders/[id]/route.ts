/**
 * Import Order Detail API Route
 * Handles individual import order operations by ID
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getImportOrderById,
  getVehiclesByImportOrder,
  updateImportOrder,
  deleteImportOrder,
  createNotification,
  type ImportOrder,
  type UpdateImportOrderInput,
  ORDER_STATUS_LABELS,
} from "@tasco/db";
import { syncImportOrderToRAG } from "../../../../lib/rag-sync";

export const dynamic = "force-dynamic";

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
    statusLabel:
      ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] ||
      order.status,
    vehicles: order.vehicles.map((v) => ({
      ...v,
      unitPriceFormatted: formatCurrency(v.unitPrice),
      totalFormatted: formatCurrency(v.unitPrice * v.quantity),
    })),
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
    const { id: orderId } = await params;
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section");

    const order = await getImportOrderById(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Import order not found" },
        { status: 404 }
      );
    }

    // Return just the vehicles for this order
    if (section === "vehicles") {
      const vehicles = await getVehiclesByImportOrder(orderId);
      return NextResponse.json({
        success: true,
        vehicles: vehicles.map((v) => ({
          ...v,
          listPriceFormatted: formatCurrency(v.listPrice, "VND"),
          importPriceFormatted: formatCurrency(v.importPrice),
        })),
      });
    }

    // Default: return order with vehicles
    const vehicles = await getVehiclesByImportOrder(orderId);

    return NextResponse.json({
      success: true,
      order: toFrontendOrder(order),
      vehicles: vehicles.map((v) => ({
        ...v,
        listPriceFormatted: formatCurrency(v.listPrice, "VND"),
        importPriceFormatted: formatCurrency(v.importPrice),
      })),
    });
  } catch (error) {
    console.error("[API /orders/[id] GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch import order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  try {
    const { id: orderId } = await params;
    const body = await request.json();

    const existingOrder = await getImportOrderById(orderId);
    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "Import order not found" },
        { status: 404 }
      );
    }

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

    const updatedOrder = await updateImportOrder(orderId, updates);

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: "Failed to update import order" },
        { status: 500 }
      );
    }

    // Background sync to RAG
    syncImportOrderToRAG(updatedOrder).catch((err) =>
      console.error("[RAG Sync] Background sync failed:", err)
    );

    // Status change notification
    const statusChanged =
      body.status && body.status !== existingOrder.status;
    if (statusChanged) {
      createNotification({
        type: "updated",
        category: "order",
        title: `Order ${updatedOrder.status}: ${updatedOrder.orderNumber}`,
        message: `Status changed from "${existingOrder.status}" to "${updatedOrder.status}"`,
        appId: APP_ID,
        priority: updatedOrder.status === "arrived" ? "high" : "medium",
        actionUrl: `/inventory/orders?id=${updatedOrder.id}`,
        metadata: { orderId: updatedOrder.id },
      }).catch((err) => console.error("[Notification] Failed:", err));
    }

    return NextResponse.json({
      success: true,
      order: toFrontendOrder(updatedOrder),
    });
  } catch (error) {
    console.error("[API /orders/[id] PATCH] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update import order" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  try {
    const { id: orderId } = await params;

    const order = await getImportOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Import order not found" },
        { status: 404 }
      );
    }

    await deleteImportOrder(orderId);

    // Create notification
    createNotification({
      type: "deleted",
      category: "order",
      title: `Import order removed: ${order.orderNumber}`,
      message: `${order.brand} - ${order.totalUnits} units`,
      appId: APP_ID,
      priority: "low",
      actionUrl: `/inventory/orders`,
      metadata: { orderId },
    }).catch((err) => console.error("[Notification] Failed:", err));

    return NextResponse.json({
      success: true,
      message: "Import order deleted successfully",
    });
  } catch (error) {
    console.error("[API /orders/[id] DELETE] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete import order" },
      { status: 500 }
    );
  }
}
