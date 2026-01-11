/**
 * Notifications API Route - Uses global @tasco/api handler
 *
 * Manages notifications for the e-learning application.
 * Use cases: New course available, quiz completion, progress milestones.
 */

import { NextRequest } from "next/server";
import { createNotificationsHandler } from "@tasco/api";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Create handlers configured for this app
const { handleGet, handlePost } = createNotificationsHandler({
  appId: "e-learning",
  defaultLimit: 20,
});

// Export route handlers
export function GET(request: NextRequest) {
  return handleGet(request);
}

export function POST(request: NextRequest) {
  return handlePost(request);
}
