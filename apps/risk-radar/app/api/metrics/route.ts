/**
 * Risk Metrics API Route
 * Serves dashboard metrics, product performance, and regional data
 */

import { NextRequest, NextResponse } from "next/server";
import {
  listRiskMetricsByEntity,
  listRiskMetricsByProduct,
  getRiskMetric,
  getRiskAlertStats,
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

// Calculate status based on metric values
function getMetricStatus(
  key: string,
  value: number
): "healthy" | "warning" | "critical" {
  switch (key) {
    case "lossRatio":
      if (value > 75) return "critical";
      if (value > 65) return "warning";
      return "healthy";
    case "combinedRatio":
      if (value > 105) return "critical";
      if (value > 100) return "warning";
      return "healthy";
    default:
      return "healthy";
  }
}

// Transform metrics to hero format
function toHeroMetrics(summary: RiskMetric | null, alertStats: { new: number }) {
  if (!summary) {
    // Return fallback defaults
    return [
      {
        key: "lossRatio",
        value: "N/A",
        target: "< 65%",
        trend: "stable",
        change: "0%",
        status: "healthy",
      },
      {
        key: "combinedRatio",
        value: "N/A",
        target: "< 100%",
        trend: "stable",
        change: "0%",
        status: "healthy",
      },
      {
        key: "premiums",
        value: "N/A",
        target: "N/A",
        trend: "stable",
        change: "0%",
        status: "healthy",
      },
      {
        key: "claims",
        value: "N/A",
        target: "N/A",
        trend: "stable",
        change: "0%",
        status: "healthy",
      },
    ];
  }

  const lossRatioChange = summary.lossRatioChange ?? 0;
  const premiumsChange = summary.premiumsChange ?? 0;
  const claimsChange = summary.claimsChange ?? 0;

  return [
    {
      key: "lossRatio",
      value: `${summary.lossRatio.toFixed(1)}%`,
      target: "< 65%",
      trend: lossRatioChange > 0 ? "up" : lossRatioChange < 0 ? "down" : "stable",
      change: `${lossRatioChange >= 0 ? "+" : ""}${lossRatioChange.toFixed(1)}%`,
      status: getMetricStatus("lossRatio", summary.lossRatio),
    },
    {
      key: "combinedRatio",
      value: summary.combinedRatio ? `${summary.combinedRatio.toFixed(1)}%` : "N/A",
      target: "< 100%",
      trend: "stable",
      change: "+0%",
      status: summary.combinedRatio
        ? getMetricStatus("combinedRatio", summary.combinedRatio)
        : "healthy",
    },
    {
      key: "premiums",
      value: formatCurrency(summary.premiumsEarned),
      target: "₫45B",
      trend: premiumsChange > 0 ? "up" : premiumsChange < 0 ? "down" : "stable",
      change: `${premiumsChange >= 0 ? "+" : ""}${premiumsChange.toFixed(1)}%`,
      status: "healthy",
    },
    {
      key: "claims",
      value: formatCurrency(summary.claimsPaid),
      target: "< ₫32B",
      trend: claimsChange > 0 ? "up" : claimsChange < 0 ? "down" : "stable",
      change: `${claimsChange >= 0 ? "+" : ""}${claimsChange.toFixed(1)}%`,
      status: claimsChange > 10 ? "warning" : "healthy",
    },
  ];
}

// Transform metrics to product performance format
function toProductPerformance(metrics: RiskMetric[]) {
  return metrics
    .filter((m) => m.productType !== "ALL")
    .map((m) => {
      const config = PRODUCT_CONFIG[m.productType] || {
        color: "hsl(200, 50%, 50%)",
        icon: "Activity",
      };
      return {
        name: m.productType,
        icon: config.icon,
        lossRatio: m.lossRatio,
        premiums: formatCurrency(m.premiumsEarned),
        claims: formatCurrency(m.claimsPaid),
        policies: m.policiesActive,
        trend:
          (m.lossRatioChange ?? 0) > 0
            ? "up"
            : (m.lossRatioChange ?? 0) < 0
            ? "down"
            : "stable",
        color: config.color,
      };
    });
}

// Transform metrics to bottom stats format
function toBottomStats(summary: RiskMetric | null, alertStats: { new: number }) {
  if (!summary) {
    return {
      policies: 0,
      profitMargin: "N/A",
      riskExposure: "N/A",
      openAlerts: alertStats.new,
    };
  }

  return {
    policies: summary.policiesActive,
    profitMargin: summary.profitMargin
      ? formatCurrency(summary.profitMargin)
      : formatCurrency(summary.premiumsEarned - summary.claimsPaid),
    riskExposure: summary.riskExposure
      ? formatCurrency(summary.riskExposure)
      : formatCurrency(summary.premiumsEarned * 5),
    openAlerts: alertStats.new,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get("entityId") || "risk-radar";
    const period = searchParams.get("period") || "CURRENT";
    const type = searchParams.get("type") || "all"; // all, hero, products, summary

    // Get summary metric (ALL products for the period)
    const summaryMetric = await getRiskMetric(entityId, period, "ALL");

    // Get product-specific metrics
    const productMetrics = await listRiskMetricsByEntity(entityId, 20);
    const currentProductMetrics = productMetrics.filter(
      (m) => m.period === period && m.productType !== "ALL"
    );

    // Get alert stats
    const alertStats = await getRiskAlertStats(entityId);

    // Build response based on type
    let response: Record<string, unknown> = {};

    if (type === "all" || type === "hero") {
      response.heroMetrics = toHeroMetrics(summaryMetric, {
        new: alertStats.byStatus.new,
      });
    }

    if (type === "all" || type === "products") {
      response.productPerformance = toProductPerformance(currentProductMetrics);
    }

    if (type === "all" || type === "summary") {
      response.bottomStats = toBottomStats(summaryMetric, {
        new: alertStats.byStatus.new,
      });
    }

    if (type === "all") {
      response.alertStats = alertStats;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("[API /metrics] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
