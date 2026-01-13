/**
 * App Guide API Route - Uses global @tasco/api handler
 *
 * Provides feature showcase / help carousel content for the sales-pricing app.
 */

import { NextRequest } from "next/server";
import { createGuideHandler } from "@tasco/api";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Create handlers configured for this app
const { handleGet, handlePut, handleDelete } = createGuideHandler({
  appId: "sales-pricing",
  defaultLanguage: "en",
});

// Export route handlers
export function GET(request: NextRequest) {
  return handleGet(request);
}

export function PUT(request: NextRequest) {
  return handlePut(request);
}

export function DELETE(request: NextRequest) {
  return handleDelete(request);
}
