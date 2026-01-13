import { NextResponse, type NextRequest } from "next/server";
import { getEntity, updateEntity } from "@tasco/db/entities";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET handler - returns a single entity by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  try {
    const { id } = await params;
    const entity = await getEntity(id);

    if (!entity) {
      return NextResponse.json(
        { success: false, error: "Entity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      entity,
    });
  } catch (error) {
    console.error("[entities/id] Error fetching entity:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch entity" },
      { status: 500 }
    );
  }
}

/**
 * PATCH handler - updates a single entity
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if entity exists
    const existing = await getEntity(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Entity not found" },
        { status: 404 }
      );
    }

    // Update the entity
    const updated = await updateEntity(id, {
      name: body.name,
      shortName: body.shortName,
      type: body.type,
      category: body.category,
      parentId: body.parentId,
      metadata: body.metadata,
    });

    return NextResponse.json({
      success: true,
      entity: updated,
    });
  } catch (error) {
    console.error("[entities/id] Error updating entity:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update entity" },
      { status: 500 }
    );
  }
}
