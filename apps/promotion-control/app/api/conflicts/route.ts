import { NextRequest, NextResponse } from "next/server";
import { detectConflicts } from "@tasco/db";

/**
 * GET /api/conflicts
 * Detect and return all promotion conflicts
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get("entityId") || undefined;
    const includeInactive = searchParams.get("includeInactive") === "true";

    const result = await detectConflicts(entityId, includeInactive);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error detecting conflicts:", error);
    return NextResponse.json(
      { error: "Failed to detect conflicts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conflicts
 * Force re-detection of conflicts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const entityId = body.entityId || undefined;
    const includeInactive = body.includeInactive || false;

    const result = await detectConflicts(entityId, includeInactive);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error detecting conflicts:", error);
    return NextResponse.json(
      { error: "Failed to detect conflicts" },
      { status: 500 }
    );
  }
}
