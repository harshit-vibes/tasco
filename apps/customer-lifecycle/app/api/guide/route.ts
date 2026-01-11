/**
 * App Guide API Route - Uses global @tasco/api handler
 *
 * Provides feature showcase / help carousel content for the customer-lifecycle app.
 */

import { NextRequest } from "next/server";
import { createGuideHandler } from "@tasco/api";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Create handlers configured for this app
const { handleGet, handlePut, handleDelete } = createGuideHandler({
  appId: "customer-lifecycle",
  defaultLanguage: "en",
});

// Export route handlers - using 'any' to avoid Next.js version incompatibility
export function GET(request: NextRequest) {
  return handleGet(request as any);
}

export function PUT(request: NextRequest) {
  return handlePut(request as any);
}

export function DELETE(request: NextRequest) {
  return handleDelete(request as any);
}
