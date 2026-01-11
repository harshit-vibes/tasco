import { NextRequest, NextResponse } from "next/server";
import {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  type Notification,
  type NotificationType,
} from "@tasco/db";

const APP_ID = "data-sync";

// Map notification types to sync alert types
const SYNC_ALERT_TYPES: Record<string, NotificationType> = {
  missing: "sync_missing",
  mismatch: "sync_mismatch",
  delayed: "sync_delayed",
  connection: "sync_connection",
};

// Map severity to priority
const SEVERITY_TO_PRIORITY: Record<string, "low" | "medium" | "high" | "urgent"> = {
  low: "low",
  medium: "medium",
  high: "high",
  critical: "urgent",
};

// Map priority back to severity
const PRIORITY_TO_SEVERITY: Record<string, string> = {
  low: "low",
  medium: "medium",
  high: "high",
  urgent: "critical",
};

/**
 * Convert notification to sync alert format
 */
function notificationToAlert(notification: Notification) {
  const metadata = notification.metadata || {};

  return {
    id: notification.id,
    type: metadata.alertType || notification.type.replace("sync_", "") || "connection",
    severity: PRIORITY_TO_SEVERITY[notification.priority || "medium"] || "medium",
    title: notification.title,
    message: notification.message || "",
    sourceSystem: metadata.sourceSystem || "unknown",
    targetSystem: metadata.targetSystem || "unknown",
    affectedRecordId: metadata.affectedRecordId,
    affectedRecordType: metadata.affectedRecordType,
    expectedValue: metadata.expectedValue,
    actualValue: metadata.actualValue,
    affectedRecords: metadata.affectedRecords,
    detectedAt: notification.timestamp,
    status: notification.read ? "resolved" : "open",
  };
}

// GET /api/alerts - List alerts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");
    const system = searchParams.get("system");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Fetch notifications from database
    const notifications = await getNotifications(APP_ID, 100);

    // Filter to only sync-related notifications
    let alerts = notifications
      .filter((n) => n.category === "sync" || n.type.startsWith("sync_"))
      .map(notificationToAlert);

    // Apply filters
    if (status && status !== "all") {
      alerts = alerts.filter((a) => a.status === status);
    }
    if (severity && severity !== "all") {
      alerts = alerts.filter((a) => a.severity === severity);
    }
    if (system && system !== "all") {
      alerts = alerts.filter(
        (a) => a.sourceSystem === system || a.targetSystem === system
      );
    }

    // Sort by detectedAt (most recent first)
    alerts.sort(
      (a, b) =>
        new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
    );

    // Apply limit
    alerts = alerts.slice(0, limit);

    // Calculate summary
    const allAlerts = notifications
      .filter((n) => n.category === "sync" || n.type.startsWith("sync_"))
      .map(notificationToAlert);

    const summary = {
      open: allAlerts.filter((a) => a.status === "open").length,
      investigating: allAlerts.filter((a) => a.status === "investigating").length,
      critical: allAlerts.filter(
        (a) => a.severity === "critical" && a.status === "open"
      ).length,
      high: allAlerts.filter(
        (a) => a.severity === "high" && a.status === "open"
      ).length,
      total: allAlerts.length,
    };

    return NextResponse.json({
      success: true,
      data: {
        alerts,
        summary,
        total: allAlerts.length,
        filtered: alerts.length,
      },
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

// POST /api/alerts - Create a new alert (sync alert → notification)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { alert } = body;

    if (!alert) {
      return NextResponse.json(
        { success: false, error: "Alert data required" },
        { status: 400 }
      );
    }

    // Map alert type to notification type
    const notificationType = SYNC_ALERT_TYPES[alert.type] || "sync_connection";

    // Create notification from sync alert
    const notification = await createNotification({
      type: notificationType,
      category: "sync",
      title: alert.title,
      message: alert.message,
      appId: APP_ID,
      entityId: "inochi",
      priority: SEVERITY_TO_PRIORITY[alert.severity] || "medium",
      actionUrl: `/alerts?id=${alert.id}`,
      metadata: {
        alertType: alert.type,
        severity: alert.severity,
        sourceSystem: alert.sourceSystem,
        targetSystem: alert.targetSystem,
        affectedRecordId: alert.affectedRecordId,
        affectedRecordType: alert.affectedRecordType,
        expectedValue: alert.expectedValue,
        actualValue: alert.actualValue,
        affectedRecords: alert.affectedRecords,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        notification,
        alert: notificationToAlert(notification),
      },
    });
  } catch (error) {
    console.error("Error creating alert:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create alert" },
      { status: 500 }
    );
  }
}

// PATCH /api/alerts - Update alert status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { alertId, timestamp, action } = body;

    if (!alertId || !action) {
      return NextResponse.json(
        { success: false, error: "alertId and action required" },
        { status: 400 }
      );
    }

    // Map actions to notification updates
    let newStatus = "open";
    if (action === "investigate") newStatus = "investigating";
    if (action === "resolve" || action === "dismiss") {
      // Mark as read when resolved or dismissed
      if (timestamp) {
        await markNotificationAsRead(APP_ID, timestamp, alertId);
      }
      newStatus = action === "resolve" ? "resolved" : "dismissed";
    }

    return NextResponse.json({
      success: true,
      data: {
        alertId,
        action,
        newStatus,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating alert:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update alert" },
      { status: 500 }
    );
  }
}
