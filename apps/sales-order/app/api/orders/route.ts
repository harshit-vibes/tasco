import { NextRequest, NextResponse } from "next/server";
import {
  listOrdersByEntity,
  listOrdersByEntityAndStatus,
  searchOrders,
  createOrder,
  logActivity,
  type Order,
  type OrderStatus,
} from "@tasco/db";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Default entity ID (TODO: Get from auth session)
const DEFAULT_ENTITY_ID = "inochi";

/**
 * GET - List all orders with optional filters
 */
export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status") as OrderStatus | null;
    const search = searchParams.get("search");
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10);
    const entityId = searchParams.get("entityId") || DEFAULT_ENTITY_ID;

    let orders: Order[];

    // Search by customer name/code
    if (search) {
      orders = await searchOrders(entityId, search, limit);
    }
    // Filter by status
    else if (status && status !== "all") {
      const result = await listOrdersByEntityAndStatus(entityId, status, limit);
      orders = result.items;
    }
    // List all for entity
    else {
      const result = await listOrdersByEntity(entityId, limit);
      orders = result.items;
    }

    return NextResponse.json({
      success: true,
      data: orders,
      total: orders.length,
    });
  } catch (error) {
    console.error("[Orders API] Error listing orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list orders" },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new order from extracted data
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const {
      extractedData,
      sourceType,
      sourceUrl,
      fileName,
      fileSize,
      confidence,
      processingTime,
      entityId = DEFAULT_ENTITY_ID,
      createdBy = "system",
      extractionAgentId,
      validationAgentId,
    } = body;

    // Validate required fields
    if (!extractedData) {
      return NextResponse.json(
        { success: false, error: "Missing extracted data" },
        { status: 400 }
      );
    }

    if (!sourceUrl || !fileName) {
      return NextResponse.json(
        { success: false, error: "Missing source file information" },
        { status: 400 }
      );
    }

    // Create order in database
    const order = await createOrder({
      entityId,
      sourceType: sourceType || "pdf",
      sourceUrl,
      fileName,
      fileSize: fileSize || 0,
      extractedData,
      confidence: confidence || 0,
      processingTime: processingTime || {
        ocrMs: 0,
        extractionMs: 0,
        validationMs: 0,
        totalMs: 0,
      },
      createdBy,
      extractionAgentId:
        extractionAgentId || process.env.EXTRACTION_AGENT_ID || "",
      validationAgentId,
    });

    // Log activity
    await logActivity({
      orderId: order.orderId,
      entityId,
      action: "uploaded",
      details: {
        userId: createdBy,
        changes: {
          status: "pending",
          fileName,
          confidence,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("[Orders API] Error creating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
