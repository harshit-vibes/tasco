/**
 * Seed Risk Radar Data
 *
 * Populates DynamoDB with initial risk metrics and alerts
 * matching the mock data structure from the UI.
 *
 * Run: bun run scripts/seed-risk-data.ts
 */

import {
  batchCreateRiskMetrics,
  batchCreateRiskAlerts,
  type CreateRiskMetricInput,
  type CreateRiskAlertInput,
  type ProductType,
  type PeriodType,
} from "@tasco/db";

const ENTITY_ID = "risk-radar";

// ============================================
// Product Metrics Data (from analysis/page.tsx)
// ============================================

const productMetricsData: CreateRiskMetricInput[] = [
  {
    entityId: ENTITY_ID,
    period: "CURRENT",
    periodType: "quarterly",
    productType: "motor",
    lossRatio: 68.5,
    premiumsEarned: 18200,
    claimsPaid: 12500,
    claimsCount: 3420,
    policiesActive: 45230,
    averageClaimSize: 3.65,
    lossRatioChange: 2.3,
    premiumsChange: 8.5,
    claimsChange: 10.2,
  },
  {
    entityId: ENTITY_ID,
    period: "CURRENT",
    periodType: "quarterly",
    productType: "health",
    lossRatio: 58.2,
    premiumsEarned: 15800,
    claimsPaid: 9200,
    claimsCount: 5680,
    policiesActive: 32150,
    averageClaimSize: 1.62,
    lossRatioChange: -1.5,
    premiumsChange: 12.0,
    claimsChange: 9.8,
  },
  {
    entityId: ENTITY_ID,
    period: "CURRENT",
    periodType: "quarterly",
    productType: "property",
    lossRatio: 42.1,
    premiumsEarned: 8500,
    claimsPaid: 3600,
    claimsCount: 890,
    policiesActive: 12890,
    averageClaimSize: 4.04,
    lossRatioChange: -0.5,
    premiumsChange: 5.2,
    claimsChange: 4.5,
  },
  {
    entityId: ENTITY_ID,
    period: "CURRENT",
    periodType: "quarterly",
    productType: "life",
    lossRatio: 71.8,
    premiumsEarned: 5700,
    claimsPaid: 4100,
    claimsCount: 245,
    policiesActive: 8920,
    averageClaimSize: 16.73,
    lossRatioChange: 3.2,
    premiumsChange: 6.0,
    claimsChange: 9.5,
  },
  {
    entityId: ENTITY_ID,
    period: "CURRENT",
    periodType: "quarterly",
    productType: "liability",
    lossRatio: 35.4,
    premiumsEarned: 3200,
    claimsPaid: 1130,
    claimsCount: 156,
    policiesActive: 4560,
    averageClaimSize: 7.24,
    lossRatioChange: -2.1,
    premiumsChange: 3.5,
    claimsChange: 1.2,
  },
  {
    entityId: ENTITY_ID,
    period: "CURRENT",
    periodType: "quarterly",
    productType: "marine",
    lossRatio: 48.9,
    premiumsEarned: 2800,
    claimsPaid: 1370,
    claimsCount: 89,
    policiesActive: 2180,
    averageClaimSize: 15.39,
    lossRatioChange: 1.8,
    premiumsChange: 4.2,
    claimsChange: 6.3,
  },
];

// ============================================
// Summary Metric (aggregated across products)
// ============================================

function createSummaryMetric(): CreateRiskMetricInput {
  const totalPremiums = productMetricsData.reduce((sum, p) => sum + p.premiumsEarned, 0);
  const totalClaims = productMetricsData.reduce((sum, p) => sum + p.claimsPaid, 0);
  const totalPolicies = productMetricsData.reduce((sum, p) => sum + p.policiesActive, 0);
  const totalClaimsCount = productMetricsData.reduce((sum, p) => sum + p.claimsCount, 0);

  return {
    entityId: ENTITY_ID,
    period: "CURRENT",
    periodType: "quarterly",
    productType: "ALL",
    lossRatio: (totalClaims / totalPremiums) * 100,
    combinedRatio: 95.2, // Including expense ratio
    premiumsEarned: totalPremiums,
    claimsPaid: totalClaims,
    claimsCount: totalClaimsCount,
    policiesActive: totalPolicies,
    profitMargin: totalPremiums - totalClaims,
    riskExposure: totalPremiums * 5, // Estimated exposure
    lossRatioChange: -2.3,
    premiumsChange: 12.5,
    claimsChange: 8.2,
  };
}

// ============================================
// Monthly Trends Data (from analysis/page.tsx)
// ============================================

const monthlyTrendsData = [
  { month: "2024-07", lossRatio: 58, premiums: 42000, claims: 24000 },
  { month: "2024-08", lossRatio: 61, premiums: 45000, claims: 27000 },
  { month: "2024-09", lossRatio: 59, premiums: 44000, claims: 26000 },
  { month: "2024-10", lossRatio: 63, premiums: 46000, claims: 29000 },
  { month: "2024-11", lossRatio: 65, premiums: 48000, claims: 31000 },
  { month: "2024-12", lossRatio: 62, premiums: 48200, claims: 30100 },
];

function createMonthlyMetrics(): CreateRiskMetricInput[] {
  return monthlyTrendsData.map((data, index) => ({
    entityId: ENTITY_ID,
    period: data.month,
    periodType: "monthly" as PeriodType,
    productType: "ALL" as ProductType,
    lossRatio: data.lossRatio,
    premiumsEarned: data.premiums,
    claimsPaid: data.claims,
    claimsCount: Math.floor(data.claims / 3), // Estimated
    policiesActive: 100000 + index * 5000, // Growing over time
    lossRatioChange: index > 0 ? data.lossRatio - monthlyTrendsData[index - 1].lossRatio : 0,
    premiumsChange:
      index > 0
        ? ((data.premiums - monthlyTrendsData[index - 1].premiums) / monthlyTrendsData[index - 1].premiums) * 100
        : 0,
    claimsChange:
      index > 0
        ? ((data.claims - monthlyTrendsData[index - 1].claims) / monthlyTrendsData[index - 1].claims) * 100
        : 0,
  }));
}

// ============================================
// Region Metrics Data (from analysis/page.tsx)
// ============================================

const regionMetricsData = [
  { region: "Ho Chi Minh", premiums: 22500, claims: 14200, lossRatio: 63.1, policies: 48500 },
  { region: "Hanoi", premiums: 18200, claims: 10800, lossRatio: 59.3, policies: 38200 },
  { region: "Da Nang", premiums: 6800, claims: 4100, lossRatio: 60.3, policies: 15800 },
  { region: "Hai Phong", premiums: 4200, claims: 2400, lossRatio: 57.1, policies: 9800 },
  { region: "Can Tho", premiums: 3500, claims: 2100, lossRatio: 60.0, policies: 8200 },
  { region: "Other", premiums: 3000, claims: 1700, lossRatio: 56.7, policies: 9430 },
];

function createRegionMetrics(): CreateRiskMetricInput[] {
  // Use region-specific period to avoid duplicate keys
  // Period format: "CURRENT-REGION-{regionCode}"
  const regionCodes: Record<string, string> = {
    "Ho Chi Minh": "HCM",
    "Hanoi": "HAN",
    "Da Nang": "DAN",
    "Hai Phong": "HPH",
    "Can Tho": "CTH",
    "Other": "OTH",
  };

  return regionMetricsData.map((data) => ({
    entityId: ENTITY_ID,
    period: `REGION-${regionCodes[data.region] || data.region}`,
    periodType: "quarterly" as PeriodType,
    productType: "ALL" as ProductType,
    lossRatio: data.lossRatio,
    premiumsEarned: data.premiums,
    claimsPaid: data.claims,
    claimsCount: Math.floor(data.claims / 3),
    policiesActive: data.policies,
    region: data.region,
  }));
}

// ============================================
// Alerts Data (from alerts/page.tsx)
// ============================================

const alertsData: CreateRiskAlertInput[] = [
  {
    entityId: ENTITY_ID,
    alertType: "loss_ratio_spike",
    severity: "critical",
    title: "Loss Ratio Spike - Motor Insurance",
    description:
      "Significant increase in motor insurance claims in Ho Chi Minh City region. Loss ratio exceeded threshold by 15 percentage points.",
    metricName: "Loss Ratio",
    currentValue: 78.5,
    threshold: 63,
    deviation: 24.6,
    period: "Q4 2024",
    productType: "motor",
    region: "Ho Chi Minh",
  },
  {
    entityId: ENTITY_ID,
    alertType: "claim_surge",
    severity: "critical",
    title: "Claims Surge - Health Insurance",
    description:
      "Unusual spike in health insurance claims volume in Hanoi district. Possible fraud or seasonal illness outbreak.",
    metricName: "Claims Count",
    currentValue: 2847,
    threshold: 1960,
    deviation: 45.3,
    period: "Week 48",
    productType: "health",
    region: "Hanoi",
  },
  {
    entityId: ENTITY_ID,
    alertType: "profitability_decline",
    severity: "warning",
    title: "Profitability Decline - Life Insurance",
    description:
      "Life insurance segment showing declining margins. Combined ratio approaching break-even threshold.",
    metricName: "Profit Margin",
    currentValue: 4.2,
    threshold: 12,
    deviation: -65,
    period: "Q4 2024",
    productType: "life",
    region: "All Regions",
  },
  {
    entityId: ENTITY_ID,
    alertType: "premium_drop",
    severity: "warning",
    title: "Premium Drop - Property Insurance",
    description:
      "New business premiums below target in Da Nang region. Competitive pressure from new market entrant.",
    metricName: "Premium Growth",
    currentValue: -8.5,
    threshold: 5,
    deviation: -270,
    period: "Month to Date",
    productType: "property",
    region: "Da Nang",
  },
  {
    entityId: ENTITY_ID,
    alertType: "concentration_risk",
    severity: "info",
    title: "Concentration Risk - Marine Insurance",
    description:
      "Portfolio concentration in single shipping company exceeds limit. Reinsurance review recommended.",
    metricName: "Single Risk Exposure",
    currentValue: 18,
    threshold: 15,
    deviation: 20,
    period: "Current Book",
    productType: "marine",
    region: "Hai Phong",
  },
];

// ============================================
// Main Seeding Function
// ============================================

async function seedRiskData() {
  console.log("🚀 Starting Risk Radar data seeding...\n");

  try {
    // 1. Create product metrics
    console.log("📊 Creating product metrics...");
    const productMetrics = await batchCreateRiskMetrics(productMetricsData);
    console.log(`   ✓ Created ${productMetrics.length} product metrics\n`);

    // 2. Create summary metric
    console.log("📈 Creating summary metric...");
    const summaryMetric = await batchCreateRiskMetrics([createSummaryMetric()]);
    console.log(`   ✓ Created ${summaryMetric.length} summary metric\n`);

    // 3. Create monthly trends
    console.log("📅 Creating monthly trend metrics...");
    const monthlyMetrics = await batchCreateRiskMetrics(createMonthlyMetrics());
    console.log(`   ✓ Created ${monthlyMetrics.length} monthly metrics\n`);

    // 4. Create region metrics
    console.log("🗺️  Creating region metrics...");
    const regionMetrics = await batchCreateRiskMetrics(createRegionMetrics());
    console.log(`   ✓ Created ${regionMetrics.length} region metrics\n`);

    // 5. Create alerts
    console.log("⚠️  Creating risk alerts...");
    const alerts = await batchCreateRiskAlerts(alertsData);
    console.log(`   ✓ Created ${alerts.length} alerts\n`);

    // Summary
    console.log("═".repeat(50));
    console.log("✅ Risk Radar data seeding complete!");
    console.log("═".repeat(50));
    console.log(`
Summary:
  - Product metrics: ${productMetrics.length}
  - Summary metrics: ${summaryMetric.length}
  - Monthly trends: ${monthlyMetrics.length}
  - Region metrics: ${regionMetrics.length}
  - Alerts: ${alerts.length}

Total records: ${productMetrics.length + summaryMetric.length + monthlyMetrics.length + regionMetrics.length + alerts.length}
    `);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

// Run seeding
seedRiskData();
