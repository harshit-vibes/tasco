/**
 * Entity [id] API Route - Uses local MongoDB handlers
 */

import { NextRequest } from "next/server";
import { handleGetEntity } from "@/lib/handlers";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  const { id } = await params;
  return handleGetEntity(id);
}
