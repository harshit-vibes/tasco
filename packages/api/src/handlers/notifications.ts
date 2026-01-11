/**
 * Notifications API Handlers
 *
 * Global handlers for notification management.
 * Uses @tasco/db notifications layer.
 *
 * @example
 * // In app's app/api/notifications/route.ts:
 * import { handleGetNotifications, handleCreateNotification, handleNotificationActions } from "@tasco/api";
 *
 * export async function GET(request: NextRequest) {
 *   return handleGetNotifications(request, { appId: "my-app" });
 * }
 *
 * export async function POST(request: NextRequest) {
 *   return handleNotificationActions(request, { appId: "my-app" });
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createNotification,
  getNotifications,
  markAllNotificationsAsRead,
  clearAllNotifications,
  getUnreadNotificationCount,
  type Notification,
  type CreateNotificationInput,
  type NotificationType,
  type NotificationCategory,
} from "@tasco/db";

/**
 * Handler configuration
 */
export interface NotificationsHandlerConfig {
  /** App ID for notifications (required) */
  appId: string;
  /** Default limit for fetching notifications */
  defaultLimit?: number;
}

/**
 * Create notification request body
 */
export interface CreateNotificationBody {
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message?: string;
  entityId?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Notification action request body
 */
export interface NotificationActionBody {
  action: "markAllRead" | "clearAll";
}

/**
 * GET - List notifications for an app
 *
 * Query params:
 * - limit: number (default: 20)
 *
 * @example
 * import { handleGetNotifications } from "@tasco/api";
 * export async function GET(request: NextRequest) {
 *   return handleGetNotifications(request, { appId: "compliance-qa" });
 * }
 */
export async function handleGetNotifications(
  request: NextRequest,
  config: NotificationsHandlerConfig
): Promise<NextResponse> {
  const { appId, defaultLimit = 20 } = config;

  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || String(defaultLimit), 10);

    const notifications = await getNotifications(appId, limit);
    const unreadCount = await getUnreadNotificationCount(appId);

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
      total: notifications.length,
    });
  } catch (error) {
    console.error("[Notifications] Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a notification or perform actions
 *
 * Body can be:
 * 1. CreateNotificationBody - Creates a new notification
 * 2. NotificationActionBody - Performs an action (markAllRead, clearAll)
 *
 * @example
 * import { handleNotificationActions } from "@tasco/api";
 * export async function POST(request: NextRequest) {
 *   return handleNotificationActions(request, { appId: "compliance-qa" });
 * }
 */
export async function handleNotificationActions(
  request: NextRequest,
  config: NotificationsHandlerConfig
): Promise<NextResponse> {
  const { appId } = config;

  try {
    const body = await request.json();

    // Check if this is an action request
    if (body.action) {
      const action = body.action as string;

      switch (action) {
        case "markAllRead": {
          const success = await markAllNotificationsAsRead(appId);
          return NextResponse.json({ success, action: "markAllRead" });
        }

        case "clearAll": {
          const success = await clearAllNotifications(appId);
          return NextResponse.json({ success, action: "clearAll" });
        }

        default:
          return NextResponse.json(
            { success: false, error: `Unknown action: ${action}` },
            { status: 400 }
          );
      }
    }

    // Otherwise, create a new notification
    const { type, category, title, message, entityId, priority, actionUrl, metadata } =
      body as CreateNotificationBody;

    if (!type || !category || !title) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: type, category, title" },
        { status: 400 }
      );
    }

    const input: CreateNotificationInput = {
      type,
      category,
      title,
      message,
      appId,
      entityId,
      priority,
      actionUrl,
      metadata,
    };

    const notification = await createNotification(input);

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("[Notifications] Error handling notification action:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process notification request" },
      { status: 500 }
    );
  }
}

/**
 * Create notification handler factory
 *
 * Returns handlers pre-configured for a specific app.
 *
 * @example
 * import { createNotificationsHandler } from "@tasco/api";
 *
 * const { handleGet, handlePost } = createNotificationsHandler({
 *   appId: "compliance-qa"
 * });
 *
 * export const GET = handleGet;
 * export const POST = handlePost;
 */
export function createNotificationsHandler(config: NotificationsHandlerConfig) {
  return {
    handleGet: (request: NextRequest) => handleGetNotifications(request, config),
    handlePost: (request: NextRequest) => handleNotificationActions(request, config),
  };
}

// Re-export types from db for convenience
export type {
  Notification,
  NotificationType,
  NotificationCategory,
  CreateNotificationInput,
} from "@tasco/db";
