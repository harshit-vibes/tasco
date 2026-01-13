/**
 * Risk Alerts API Route
 * Serves alerts data for the alerts page
 */

import { NextRequest, NextResponse } from "next/server";
import {
  listRiskAlertsByEntity,
  listRiskAlertsByStatus,
  listRiskAlertsBySeverity,
  listOpenRiskAlerts,
  getRiskAlertStats,
  createRiskAlert,
  updateRiskAlert,
  acknowledgeRiskAlert,
  resolveRiskAlert,
  dismissRiskAlert,
  type RiskAlert,
  type CreateRiskAlertInput,
  type AlertStatus,
  type AlertSeverity,
} from "@tasco/db";

export const dynamic = "force-dynamic";

// Transform DB alert to frontend format
function toFrontendAlert(alert: RiskAlert) {
  return {
    id: alert.alertId,
    type: alert.alertType,
    severity: alert.severity,
    status: alert.status,
    title: alert.title,
    description: alert.description,
    metric: alert.metricName,
    currentValue: String(alert.currentValue),
    expectedValue: String(alert.threshold),
    deviation: `${alert.deviation >= 0 ? "+" : ""}${alert.deviation.toFixed(1)}%`,
    product: alert.productType || "unknown",
    region: alert.region || "All Regions",
    detectedAt: formatRelativeTime(new Date(alert.detectedAt)),
    affectedPeriod: alert.period || "Current",
    // Additional metadata
    _raw: {
      timestamp: alert.detectedAt,
      alertId: alert.alertId,
      entityId: alert.entityId,
    },
  };
}

// Format time as relative string
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get("entityId") || "risk-radar";
    const status = searchParams.get("status") as AlertStatus | null;
    const severity = searchParams.get("severity") as AlertSeverity | null;
    const openOnly = searchParams.get("openOnly") === "true";
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    let alerts: RiskAlert[];

    if (openOnly) {
      alerts = await listOpenRiskAlerts(entityId, limit);
    } else if (status) {
      alerts = await listRiskAlertsByStatus(entityId, status, limit);
    } else if (severity) {
      alerts = await listRiskAlertsBySeverity(entityId, severity, limit);
    } else {
      alerts = await listRiskAlertsByEntity(entityId, limit);
    }

    // Get stats for summary
    const stats = await getRiskAlertStats(entityId);

    return NextResponse.json({
      alerts: alerts.map(toFrontendAlert),
      stats: {
        total: stats.total,
        open: stats.byStatus.new + stats.byStatus.acknowledged + stats.byStatus.investigating,
        critical: stats.bySeverity.critical,
        warning: stats.bySeverity.warning,
        info: stats.bySeverity.info,
        recentCount: stats.recentCount,
      },
    });
  } catch (error) {
    console.error("[API /alerts GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      entityId = "risk-radar",
      alertType,
      severity,
      title,
      description,
      metricName,
      currentValue,
      threshold,
      deviation,
      period,
      productType,
      region,
    } = body;

    const input: CreateRiskAlertInput = {
      entityId,
      alertType,
      severity,
      title,
      description,
      metricName,
      currentValue: Number(currentValue),
      threshold: Number(threshold),
      deviation: Number(deviation),
      period,
      productType,
      region,
    };

    const alert = await createRiskAlert(input);

    return NextResponse.json({ alert: toFrontendAlert(alert) }, { status: 201 });
  } catch (error) {
    console.error("[API /alerts POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to create alert" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      entityId = "risk-radar",
      alertId,
      timestamp,
      action, // acknowledge, resolve, dismiss, update
      ...updates
    } = body;

    if (!alertId || !timestamp) {
      return NextResponse.json(
        { error: "alertId and timestamp are required" },
        { status: 400 }
      );
    }

    let result: RiskAlert | null = null;

    switch (action) {
      case "acknowledge":
        result = await acknowledgeRiskAlert(
          entityId,
          timestamp,
          alertId,
          updates.assignedTo
        );
        break;
      case "resolve":
        result = await resolveRiskAlert(
          entityId,
          timestamp,
          alertId,
          updates.resolution || "Resolved"
        );
        break;
      case "dismiss":
        result = await dismissRiskAlert(
          entityId,
          timestamp,
          alertId,
          updates.resolution
        );
        break;
      default:
        result = await updateRiskAlert(entityId, timestamp, alertId, updates);
    }

    if (!result) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    return NextResponse.json({ alert: toFrontendAlert(result) });
  } catch (error) {
    console.error("[API /alerts PUT] Error:", error);
    return NextResponse.json(
      { error: "Failed to update alert" },
      { status: 500 }
    );
  }
}
