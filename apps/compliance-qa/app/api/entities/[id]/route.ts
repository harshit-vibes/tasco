import { NextRequest, NextResponse } from "next/server";
import {
  getEntity,
  updateEntity,
  deleteEntity,
} from "@tasco/db/entities";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/entities/[id]
 * Get a single entity by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const entity = await getEntity(id);

    if (!entity) {
      return NextResponse.json(
        { success: false, error: "Entity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, entity });
  } catch (error) {
    console.error("Error fetching entity:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch entity" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/entities/[id]
 * Update an entity
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const entity = await updateEntity(id, body);

    if (!entity) {
      return NextResponse.json(
        { success: false, error: "Entity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, entity });
  } catch (error) {
    console.error("Error updating entity:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update entity" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/entities/[id]
 * Delete an entity
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    await deleteEntity(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting entity:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete entity" },
      { status: 500 }
    );
  }
}
