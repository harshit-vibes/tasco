import { NextRequest, NextResponse } from "next/server";
import {
  getOrder,
  updateOrder,
  deleteOrder,
  logActivity,
  type OrderStatus,
} from "@tasco/db";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Default entity ID (TODO: Get from auth session)
const DEFAULT_ENTITY_ID = "inochi";

/**
 * GET - Get a single order by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await params;

    // Query database
    const order = await getOrder(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("[Orders API] Error getting order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get order" },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update an order
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      extractedData,
      status,
      reviewedBy,
      validation,
      confidence,
      entityId = DEFAULT_ENTITY_ID,
    } = body;

    // Check if order exists
    const existingOrder = await getOrder(id);
    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updates: Parameters<typeof updateOrder>[1] = {};

    if (extractedData !== undefined) {
      updates.extractedData = extractedData;
    }

    if (confidence !== undefined) {
      updates.confidence = confidence;
    }

    if (validation !== undefined) {
      updates.validation = validation;
    }

    if (status !== undefined) {
      updates.status = status as OrderStatus;
    }

    if (reviewedBy !== undefined) {
      updates.reviewedBy = reviewedBy;
      updates.reviewedAt = new Date().toISOString();
    }

    if (status === "exported") {
      updates.exportedAt = new Date().toISOString();
      updates.exportedBy = reviewedBy || "system";
    }

    // Update order in database
    const updatedOrder = await updateOrder(id, updates);

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: "Failed to update order" },
        { status: 500 }
      );
    }

    // Log activity
    const action = status
      ? status === "approved"
        ? "approved"
        : status === "rejected"
        ? "rejected"
        : status === "exported"
        ? "exported"
        : "updated"
      : "updated";

    await logActivity({
      orderId: id,
      entityId: updatedOrder.entityId,
      action,
      details: {
        userId: reviewedBy || "system",
        changes: {
          status: status || existingOrder.status,
          ...updates,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error("[Orders API] Error updating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete an order
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await params;
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get("userId") || "system";
    const entityId = searchParams.get("entityId") || DEFAULT_ENTITY_ID;

    // Check if order exists
    const order = await getOrder(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Log activity before deletion
    await logActivity({
      orderId: id,
      entityId: order.entityId,
      action: "deleted",
      details: {
        userId,
        reason: "Order deleted by user",
      },
    });

    // Delete from database
    await deleteOrder(id);

    return NextResponse.json({
      success: true,
      message: `Order ${id} deleted successfully`,
    });
  } catch (error) {
    console.error("[Orders API] Error deleting order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
