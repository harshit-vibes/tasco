/**
 * Risk Radar data types for DynamoDB persistence
 * Used by the risk-radar app for Tasco Insurance
 */

// ============================================
// Enums
// ============================================

/** Product types for insurance */
export type ProductType =
  | "motor"
  | "health"
  | "property"
  | "life"
  | "liability"
  | "marine"
  | "ALL";

/** Period types for metrics aggregation */
export type PeriodType = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

/** Alert types for risk monitoring */
export type AlertType =
  | "loss_ratio_spike"
  | "claim_surge"
  | "premium_drop"
  | "profitability_decline"
  | "concentration_risk"
  | "fraud_suspected"
  | "threshold_breach";

/** Alert severity levels */
export type AlertSeverity = "info" | "warning" | "critical";

/** Alert status */
export type AlertStatus = "new" | "acknowledged" | "investigating" | "resolved" | "dismissed";

// Enum arrays for validation
export const PRODUCT_TYPES: ProductType[] = [
  "motor",
  "health",
  "property",
  "life",
  "liability",
  "marine",
  "ALL",
];

export const PERIOD_TYPES: PeriodType[] = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
];

export const ALERT_TYPES: AlertType[] = [
  "loss_ratio_spike",
  "claim_surge",
  "premium_drop",
  "profitability_decline",
  "concentration_risk",
  "fraud_suspected",
  "threshold_breach",
];

export const ALERT_SEVERITIES: AlertSeverity[] = ["info", "warning", "critical"];

export const ALERT_STATUSES: AlertStatus[] = [
  "new",
  "acknowledged",
  "investigating",
  "resolved",
  "dismissed",
];

// ============================================
// Risk Metrics Types
// ============================================

/** Risk metric record for a specific entity/period/product */
export interface RiskMetric {
  id: string;
  entityId: string;
  period: string; // e.g., "2024-Q3", "2024-12", "2024-W52"
  periodType: PeriodType;
  productType: ProductType;
  // Core metrics
  lossRatio: number; // Claims paid / Premiums earned (%)
  combinedRatio?: number; // Loss ratio + expense ratio (%)
  premiumsEarned: number;
  claimsPaid: number;
  claimsCount: number;
  // Policy metrics
  policiesActive: number;
  policiesNew?: number;
  policiesCancelled?: number;
  policiesRenewed?: number;
  // Financial metrics
  profitMargin?: number; // Profit margin %
  averageClaimSize?: number;
  averagePremium?: number;
  riskExposure?: number; // Total coverage exposure
  // Comparison to previous period
  lossRatioChange?: number; // % change from previous period
  premiumsChange?: number;
  claimsChange?: number;
  // Metadata
  region?: string;
  calculatedAt: string;
  createdAt: string;
  updatedAt: string;
}

/** Input for creating a risk metric */
export interface CreateRiskMetricInput {
  entityId: string;
  period: string;
  periodType: PeriodType;
  productType: ProductType;
  lossRatio: number;
  combinedRatio?: number;
  premiumsEarned: number;
  claimsPaid: number;
  claimsCount: number;
  policiesActive: number;
  policiesNew?: number;
  policiesCancelled?: number;
  policiesRenewed?: number;
  profitMargin?: number;
  averageClaimSize?: number;
  averagePremium?: number;
  riskExposure?: number;
  lossRatioChange?: number;
  premiumsChange?: number;
  claimsChange?: number;
  region?: string;
}

/** Input for updating a risk metric */
export interface UpdateRiskMetricInput {
  lossRatio?: number;
  combinedRatio?: number;
  premiumsEarned?: number;
  claimsPaid?: number;
  claimsCount?: number;
  policiesActive?: number;
  policiesNew?: number;
  policiesCancelled?: number;
  policiesRenewed?: number;
  profitMargin?: number;
  averageClaimSize?: number;
  averagePremium?: number;
  riskExposure?: number;
  lossRatioChange?: number;
  premiumsChange?: number;
  claimsChange?: number;
}

/** DynamoDB item for risk metrics */
export interface RiskMetricItem extends RiskMetric {
  pk: string; // RMET#{entityId}
  sk: string; // {period}#{productType}
}

// ============================================
// Risk Alerts Types
// ============================================

/** Risk alert/anomaly record */
export interface RiskAlert {
  alertId: string;
  entityId: string;
  alertType: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  // Alert content
  title: string;
  description: string;
  // Metric details
  metricName: string;
  currentValue: number;
  threshold: number; // Expected/threshold value
  deviation: number; // % deviation from expected
  // Context
  period?: string;
  productType?: ProductType;
  region?: string;
  // Related entities
  relatedClaimIds?: string[];
  relatedPolicyIds?: string[];
  // Assignment
  assignedTo?: string;
  resolution?: string;
  // Timestamps
  detectedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** Input for creating a risk alert */
export interface CreateRiskAlertInput {
  entityId: string;
  alertType: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  metricName: string;
  currentValue: number;
  threshold: number;
  deviation: number;
  period?: string;
  productType?: ProductType;
  region?: string;
  relatedClaimIds?: string[];
  relatedPolicyIds?: string[];
}

/** Input for updating a risk alert */
export interface UpdateRiskAlertInput {
  status?: AlertStatus;
  severity?: AlertSeverity;
  title?: string;
  description?: string;
  assignedTo?: string;
  resolution?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

/** DynamoDB item for risk alerts */
export interface RiskAlertItem extends RiskAlert {
  pk: string; // RALT#{entityId}
  sk: string; // {timestamp}#{alertId}
  // Additional pk for global index
  gsi1pk?: string; // RALT#ALL (for listing all alerts)
  gsi1sk?: string; // {timestamp}#{alertId}
}

// ============================================
// Aggregation Types
// ============================================

/** Summary stats for dashboard */
export interface RiskSummary {
  entityId: string;
  period: string;
  totalPremiums: number;
  totalClaims: number;
  overallLossRatio: number;
  totalPolicies: number;
  alertsCount: {
    total: number;
    critical: number;
    warning: number;
    info: number;
    new: number;
  };
  topRisks: Array<{
    productType: ProductType;
    lossRatio: number;
    trend: "up" | "down" | "stable";
  }>;
}

/** Metrics trend over time */
export interface MetricsTrend {
  entityId: string;
  productType: ProductType;
  periods: Array<{
    period: string;
    lossRatio: number;
    premiums: number;
    claims: number;
  }>;
}

/** Alert statistics */
export interface AlertStats {
  total: number;
  bySeverity: Record<AlertSeverity, number>;
  byStatus: Record<AlertStatus, number>;
  byType: Record<AlertType, number>;
  recentCount: number; // Last 24 hours
}
