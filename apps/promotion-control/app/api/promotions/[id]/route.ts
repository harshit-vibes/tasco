import { NextRequest, NextResponse } from "next/server";
import {
  getPromotion,
  updatePromotion,
  deletePromotion,
  type UpdatePromotionInput,
} from "@tasco/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/promotions/[id]
 * Get a single promotion by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const promotion = await getPromotion(id);

    if (!promotion) {
      return NextResponse.json(
        { error: "Promotion not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(promotion);
  } catch (error) {
    console.error("Error getting promotion:", error);
    return NextResponse.json(
      { error: "Failed to get promotion" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/promotions/[id]
 * Update a promotion
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if promotion exists
    const existing = await getPromotion(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Promotion not found" },
        { status: 404 }
      );
    }

    const updates: UpdatePromotionInput = {};

    // Only include fields that are provided
    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.type !== undefined) updates.type = body.type;
    if (body.status !== undefined) updates.status = body.status;
    if (body.targetSegments !== undefined) updates.targetSegments = body.targetSegments;
    if (body.targetProducts !== undefined) updates.targetProducts = body.targetProducts;
    if (body.targetChannels !== undefined) updates.targetChannels = body.targetChannels;
    if (body.startDate !== undefined) updates.startDate = body.startDate;
    if (body.endDate !== undefined) updates.endDate = body.endDate;
    if (body.discountType !== undefined) updates.discountType = body.discountType;
    if (body.discountValue !== undefined) updates.discountValue = body.discountValue;
    if (body.stackable !== undefined) updates.stackable = body.stackable;
    if (body.excludePromotionIds !== undefined) updates.excludePromotionIds = body.excludePromotionIds;
    if (body.minPurchaseAmount !== undefined) updates.minPurchaseAmount = body.minPurchaseAmount;
    if (body.maxDiscountAmount !== undefined) updates.maxDiscountAmount = body.maxDiscountAmount;
    if (body.priority !== undefined) updates.priority = body.priority;

    const promotion = await updatePromotion(id, updates);

    return NextResponse.json(promotion);
  } catch (error) {
    console.error("Error updating promotion:", error);
    return NextResponse.json(
      { error: "Failed to update promotion" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/promotions/[id]
 * Delete a promotion
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    // Check if promotion exists
    const existing = await getPromotion(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Promotion not found" },
        { status: 404 }
      );
    }

    await deletePromotion(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting promotion:", error);
    return NextResponse.json(
      { error: "Failed to delete promotion" },
      { status: 500 }
    );
  }
}
