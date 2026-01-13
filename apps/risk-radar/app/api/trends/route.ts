/**
 * Risk Trends API Route
 * Serves time-series data for charts and analysis
 */

import { NextRequest, NextResponse } from "next/server";
import {
  listRiskMetricsByEntity,
  listRiskMetricsByPeriod,
  listRiskMetricsByProduct,
  type RiskMetric,
  type ProductType,
} from "@tasco/db";

export const dynamic = "force-dynamic";

// Product configuration for UI
const PRODUCT_CONFIG: Record<string, { color: string; icon: string }> = {
  motor: { color: "hsl(215, 70%, 50%)", icon: "Car" },
  health: { color: "hsl(152, 60%, 40%)", icon: "Heart" },
  property: { color: "hsl(25, 80%, 50%)", icon: "Home" },
  life: { color: "hsl(270, 60%, 50%)", icon: "Users" },
  liability: { color: "hsl(340, 70%, 50%)", icon: "Shield" },
  marine: { color: "hsl(190, 70%, 45%)", icon: "Anchor" },
};

// Format number to VND currency string
function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `₫${(value / 1000).toFixed(1)}B`;
  }
  return `₫${value.toFixed(1)}M`;
}

// Extract month label from period string
function getMonthLabel(period: string): string {
  // Period format: "2024-07", "2024-Q3", etc.
  const parts = period.split("-");
  if (parts.length === 2) {
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const monthNum = parseInt(parts[1], 10);
    if (monthNum >= 1 && monthNum <= 12) {
      return monthNames[monthNum - 1];
    }
  }
  return period;
}

// Transform metrics to monthly trends format
function toMonthlyTrends(metrics: RiskMetric[]) {
  // Filter for summary metrics (ALL product type) excluding region metrics and CURRENT
  const summaryMetrics = metrics
    .filter(
      (m) =>
        m.productType === "ALL" &&
        !m.period.startsWith("REGION-") &&
        m.period !== "CURRENT"
    )
    .sort((a, b) => a.period.localeCompare(b.period));

  return summaryMetrics.map((m) => ({
    month: getMonthLabel(m.period),
    period: m.period,
    lossRatio: m.lossRatio,
    premiums: m.premiumsEarned / 1000, // Convert to billions for chart
    claims: m.claimsPaid / 1000, // Convert to billions for chart
  }));
}

// Transform metrics to product breakdown format
function toProductMetrics(metrics: RiskMetric[]) {
  // Get current period product metrics
  const productMetrics = metrics.filter(
    (m) => m.productType !== "ALL" && m.period === "CURRENT"
  );

  return productMetrics.map((m) => {
    const config = PRODUCT_CONFIG[m.productType] || {
      color: "hsl(200, 50%, 50%)",
      icon: "Activity",
    };
    return {
      name: m.productType,
      icon: config.icon,
      color: config.color,
      lossRatio: m.lossRatio,
      premiums: m.premiumsEarned,
      claims: m.claimsPaid,
      policies: m.policiesActive,
      claimsCount: m.claimsCount,
      avgClaimSize: m.averageClaimSize || m.claimsPaid / m.claimsCount,
    };
  });
}

// Transform metrics to region breakdown format (using region field)
function toRegionMetrics(metrics: RiskMetric[]) {
  // Filter for metrics with region data (period starts with "REGION-")
  const regionMetrics = metrics.filter(
    (m) => m.region && m.productType === "ALL" && m.period.startsWith("REGION-")
  );

  return regionMetrics
    .map((m) => ({
      region: m.region!,
      premiums: m.premiumsEarned,
      claims: m.claimsPaid,
      lossRatio: m.lossRatio,
      policies: m.policiesActive,
    }))
    .sort((a, b) => b.premiums - a.premiums);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get("entityId") || "risk-radar";
    const type = searchParams.get("type") || "all"; // all, trends, products, regions
    const periodPrefix = searchParams.get("periodPrefix"); // e.g., "2024"

    // Get all metrics for the entity
    const metrics = periodPrefix
      ? await listRiskMetricsByPeriod(entityId, periodPrefix, 100)
      : await listRiskMetricsByEntity(entityId, 100);

    // Build response based on type
    let response: Record<string, unknown> = {};

    if (type === "all" || type === "trends") {
      response.monthlyTrends = toMonthlyTrends(metrics);
    }

    if (type === "all" || type === "products") {
      response.productMetrics = toProductMetrics(metrics);
    }

    if (type === "all" || type === "regions") {
      response.regionMetrics = toRegionMetrics(metrics);
    }

    // Calculate summary stats
    if (type === "all") {
      const currentProducts = metrics.filter(
        (m) => m.productType !== "ALL" && m.period === "CURRENT"
      );
      const totalPremiums = currentProducts.reduce(
        (sum, m) => sum + m.premiumsEarned,
        0
      );
      const totalClaims = currentProducts.reduce(
        (sum, m) => sum + m.claimsPaid,
        0
      );
      const totalPolicies = currentProducts.reduce(
        (sum, m) => sum + m.policiesActive,
        0
      );
      const totalClaimsCount = currentProducts.reduce(
        (sum, m) => sum + m.claimsCount,
        0
      );

      response.summary = {
        avgLossRatio: totalPremiums > 0 ? (totalClaims / totalPremiums) * 100 : 0,
        totalPremiums: formatCurrency(totalPremiums),
        totalClaims: formatCurrency(totalClaims),
        totalPolicies,
        totalClaimsCount,
        avgClaimSize: totalClaimsCount > 0 ? totalClaims / totalClaimsCount : 0,
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("[API /trends] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trends" },
      { status: 500 }
    );
  }
}
