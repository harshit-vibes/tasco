/**
 * Inventory Statistics API Route
 * Provides aggregated statistics for vehicle inventory
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getVehicleStats,
  getAgingVehicles,
  VEHICLE_STATUS_LABELS,
  type VehicleStats,
} from "@tasco/db";

export const dynamic = "force-dynamic";

// Format currency for display
function formatCurrency(value: number, currency = "VND"): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

// Transform stats to frontend format with labels
function toFrontendStats(stats: VehicleStats) {
  // Add labels to status counts
  const byStatusWithLabels: Record<
    string,
    { count: number; label: string }
  > = {};
  for (const [status, count] of Object.entries(stats.byStatus)) {
    byStatusWithLabels[status] = {
      count: count as number,
      label:
        VEHICLE_STATUS_LABELS[status as keyof typeof VEHICLE_STATUS_LABELS] ||
        status,
    };
  }

  return {
    ...stats,
    byStatusWithLabels,
    totalValueFormatted: formatCurrency(stats.totalValue),
    summary: {
      total: stats.total,
      atShowroom: stats.atShowroom,
      inTransit: stats.inTransit,
      reserved: stats.reserved,
      sold: stats.sold,
      agingWarning: stats.agingWarning,
      agingCritical: stats.agingCritical,
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get("entityId");
    const entityIds = searchParams.get("entityIds");
    const alertsOnly = searchParams.get("alertsOnly");
    const minDays = parseInt(searchParams.get("minDays") || "60", 10);

    // Just alerts (aging vehicles)
    if (alertsOnly === "true") {
      const agingVehicles = await getAgingVehicles(minDays);

      // Group by alert level
      const warningVehicles = agingVehicles.filter(
        (v) => v.ageAlert === "warning"
      );
      const criticalVehicles = agingVehicles.filter(
        (v) => v.ageAlert === "critical"
      );

      return NextResponse.json({
        success: true,
        alerts: {
          total: agingVehicles.length,
          warning: warningVehicles.length,
          critical: criticalVehicles.length,
          vehicles: agingVehicles.map((v) => ({
            id: v.id,
            vin: v.vin,
            brand: v.brand,
            model: v.model,
            variant: v.variant,
            daysInInventory: v.daysInInventory,
            ageAlert: v.ageAlert,
            assignedShowroom: v.assignedShowroom,
            listPrice: v.listPrice,
            listPriceFormatted: formatCurrency(v.listPrice),
          })),
        },
      });
    }

    // Build entity filter
    let entityIdList: string[] | undefined;
    if (entityIds) {
      entityIdList = entityIds.split(",").filter(Boolean);
    } else if (entityId) {
      entityIdList = [entityId];
    }

    // Get full stats
    const stats = await getVehicleStats(entityIdList);

    return NextResponse.json({
      success: true,
      stats: toFrontendStats(stats),
    });
  } catch (error) {
    console.error("[API /inventory/stats GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch inventory stats" },
      { status: 500 }
    );
  }
}
