/**
 * App Guide API Route - Uses local MongoDB handlers
 *
 * Provides feature showcase / help carousel content for the compliance-qa app.
 */

import { NextRequest } from "next/server";
// Using MongoDB handlers for pilot migration
import { handleGetGuide, handlePutGuide, handleDeleteGuide } from "@/lib/handlers";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Export route handlers
export function GET(request: NextRequest) {
  return handleGetGuide(request);
}

export function PUT(request: NextRequest) {
  return handlePutGuide(request);
}

export function DELETE(request: NextRequest) {
  return handleDeleteGuide(request);
}
