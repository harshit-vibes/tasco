import { NextRequest, NextResponse } from "next/server";
import {
  listAllPromotions,
  createPromotion,
  type CreatePromotionInput,
} from "@tasco/db";

/**
 * GET /api/promotions
 * List all promotions with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const status = searchParams.get("status");
    const entityId = searchParams.get("entityId");

    const result = await listAllPromotions(limit);

    // Apply client-side filtering if needed
    let items = result.items;

    if (status) {
      items = items.filter((p) => p.status === status);
    }

    if (entityId) {
      items = items.filter((p) => p.entityId === entityId);
    }

    return NextResponse.json({
      items,
      hasMore: result.hasMore,
      total: items.length,
    });
  } catch (error) {
    console.error("Error listing promotions:", error);
    return NextResponse.json(
      { error: "Failed to list promotions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/promotions
 * Create a new promotion
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "name",
      "description",
      "type",
      "targetSegments",
      "targetProducts",
      "targetChannels",
      "startDate",
      "endDate",
      "discountType",
      "discountValue",
    ];

    for (const field of requiredFields) {
      if (body[field] === undefined) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Default entityId for demo
    const input: CreatePromotionInput = {
      entityId: body.entityId || "ent-inochi",
      name: body.name,
      description: body.description,
      type: body.type,
      status: body.status || "draft",
      targetSegments: body.targetSegments,
      targetProducts: body.targetProducts,
      targetChannels: body.targetChannels,
      startDate: body.startDate,
      endDate: body.endDate,
      discountType: body.discountType,
      discountValue: body.discountValue,
      stackable: body.stackable ?? true,
      excludePromotionIds: body.excludePromotionIds || [],
      minPurchaseAmount: body.minPurchaseAmount,
      maxDiscountAmount: body.maxDiscountAmount,
      priority: body.priority || 1,
      createdBy: body.createdBy || "system",
    };

    const promotion = await createPromotion(input);

    return NextResponse.json(promotion, { status: 201 });
  } catch (error) {
    console.error("Error creating promotion:", error);
    return NextResponse.json(
      { error: "Failed to create promotion" },
      { status: 500 }
    );
  }
}
