/**
 * Promotion conflict detection (computed on-demand)
 *
 * Detects conflicts between promotions:
 * - Time overlap with same customer segments
 * - Stacking rule violations
 * - Explicit exclusion rules
 */

import { getActivePromotions, listAllPromotions } from "./promotions";
import {
  generateConflictId,
  dateRangesOverlap,
  getOverlapPeriod,
  hasCommonElements,
  getCommonElements,
} from "./utils";
import type {
  Promotion,
  PromotionConflict,
  ConflictDetectionResult,
  ConflictType,
  ConflictSeverity,
  PromotionCustomerSegment,
} from "./types";

/**
 * Detect all conflicts between promotions
 */
export async function detectConflicts(
  entityId?: string,
  includeInactive: boolean = false
): Promise<ConflictDetectionResult> {
  // Get promotions to analyze
  let promotions: Promotion[];

  if (includeInactive) {
    const result = await listAllPromotions(1000);
    promotions = entityId
      ? result.items.filter(p => p.entityId === entityId)
      : result.items;
  } else {
    promotions = await getActivePromotions(entityId);
  }

  const conflicts: PromotionConflict[] = [];

  // Compare each pair of promotions
  for (let i = 0; i < promotions.length; i++) {
    for (let j = i + 1; j < promotions.length; j++) {
      const p1 = promotions[i];
      const p2 = promotions[j];

      // Skip if same promotion
      if (p1.promotionId === p2.promotionId) continue;

      // Check for various conflict types
      const detectedConflicts = checkPromotionPair(p1, p2);
      conflicts.push(...detectedConflicts);
    }
  }

  // Sort conflicts by severity (critical first)
  conflicts.sort((a, b) => {
    const severityOrder: Record<ConflictSeverity, number> = {
      critical: 0,
      warning: 1,
      info: 2,
    };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  return {
    totalPromotions: promotions.length,
    activePromotions: promotions.filter(p => p.status === "active").length,
    conflictsFound: conflicts.length,
    criticalCount: conflicts.filter(c => c.severity === "critical").length,
    warningCount: conflicts.filter(c => c.severity === "warning").length,
    infoCount: conflicts.filter(c => c.severity === "info").length,
    conflicts,
    analyzedAt: new Date().toISOString(),
  };
}

/**
 * Check a pair of promotions for conflicts
 */
function checkPromotionPair(p1: Promotion, p2: Promotion): PromotionConflict[] {
  const conflicts: PromotionConflict[] = [];

  // Check time overlap first
  const hasTimeOverlap = dateRangesOverlap(
    p1.startDate,
    p1.endDate,
    p2.startDate,
    p2.endDate
  );

  if (!hasTimeOverlap) {
    return conflicts;
  }

  const overlapPeriod = getOverlapPeriod(p1.startDate, p1.endDate, p2.startDate, p2.endDate);

  // 1. Check explicit exclusion rules (critical)
  if (p1.excludePromotionIds.includes(p2.promotionId)) {
    conflicts.push(createConflict(
      "exclusion-rule",
      "critical",
      [p1, p2],
      [],
      [],
      overlapPeriod,
      `"${p1.name}" explicitly excludes "${p2.name}" from being applied together.`,
      `Adjust the date ranges so they don't overlap, or remove the exclusion rule if the promotions can coexist.`
    ));
  }

  if (p2.excludePromotionIds.includes(p1.promotionId)) {
    conflicts.push(createConflict(
      "exclusion-rule",
      "critical",
      [p1, p2],
      [],
      [],
      overlapPeriod,
      `"${p2.name}" explicitly excludes "${p1.name}" from being applied together.`,
      `Adjust the date ranges so they don't overlap, or remove the exclusion rule if the promotions can coexist.`
    ));
  }

  // 2. Check segment overlap
  const segmentOverlap = hasCommonElements(p1.targetSegments, p2.targetSegments);
  const commonSegments = getCommonElements(p1.targetSegments, p2.targetSegments);

  if (!segmentOverlap) {
    return conflicts;
  }

  // 3. Check product overlap
  const productOverlap = hasCommonElements(p1.targetProducts, p2.targetProducts);
  const commonProducts = getCommonElements(p1.targetProducts, p2.targetProducts);

  if (!productOverlap) {
    return conflicts;
  }

  // 4. Check stacking violations (warning/critical)
  if (!p1.stackable || !p2.stackable) {
    const severity: ConflictSeverity = (!p1.stackable && !p2.stackable) ? "critical" : "warning";

    conflicts.push(createConflict(
      "stacking-violation",
      severity,
      [p1, p2],
      commonSegments as PromotionCustomerSegment[],
      commonProducts,
      overlapPeriod,
      `${!p1.stackable ? `"${p1.name}"` : ""} ${!p1.stackable && !p2.stackable ? "and" : ""} ${!p2.stackable ? `"${p2.name}"` : ""} ${(!p1.stackable && !p2.stackable) ? "are" : "is"} not stackable. Customers in ${formatSegments(commonSegments as PromotionCustomerSegment[])} may be confused about which discount applies.`,
      severity === "critical"
        ? `Only one promotion should be active at a time for the overlapping segments and products. Consider adjusting dates or making one promotion stackable.`
        : `Review the priority settings to ensure the correct promotion takes precedence.`
    ));
  }

  // 5. Check time + segment + product overlap (warning)
  if (p1.stackable && p2.stackable) {
    // Both stackable but still overlapping - informational
    conflicts.push(createConflict(
      "time-overlap",
      "info",
      [p1, p2],
      commonSegments as PromotionCustomerSegment[],
      commonProducts,
      overlapPeriod,
      `"${p1.name}" and "${p2.name}" are both active for ${formatSegments(commonSegments as PromotionCustomerSegment[])} during ${formatDateRange(overlapPeriod)}.`,
      `These promotions can stack. Verify this is intentional and check the combined discount doesn't exceed business rules.`
    ));
  }

  return conflicts;
}

/**
 * Create a conflict object
 */
function createConflict(
  type: ConflictType,
  severity: ConflictSeverity,
  promotions: Promotion[],
  affectedSegments: PromotionCustomerSegment[],
  affectedProducts: string[],
  overlapPeriod: { start: string; end: string } | null,
  description: string,
  recommendation: string
): PromotionConflict {
  return {
    conflictId: generateConflictId(),
    type,
    severity,
    promotionIds: promotions.map(p => p.promotionId),
    promotionNames: promotions.map(p => p.name),
    affectedSegments,
    affectedProducts,
    overlapStart: overlapPeriod?.start,
    overlapEnd: overlapPeriod?.end,
    description,
    recommendation,
    detectedAt: new Date().toISOString(),
  };
}

/**
 * Format customer segments for display
 */
function formatSegments(segments: PromotionCustomerSegment[]): string {
  if (segments.length === 0 || segments.includes("all")) {
    return "all customers";
  }
  if (segments.length === 1) {
    return `${segments[0]} customers`;
  }
  return `${segments.slice(0, -1).join(", ")} and ${segments[segments.length - 1]} customers`;
}

/**
 * Format date range for display
 */
function formatDateRange(period: { start: string; end: string } | null): string {
  if (!period) {
    return "the overlapping period";
  }
  if (period.start === period.end) {
    return period.start;
  }
  return `${period.start} to ${period.end}`;
}

/**
 * Check conflicts for a specific promotion
 */
export async function checkConflictsForPromotion(
  promotionId: string,
  entityId?: string
): Promise<PromotionConflict[]> {
  const result = await detectConflicts(entityId, true);
  return result.conflicts.filter(c => c.promotionIds.includes(promotionId));
}

/**
 * Validate a new/updated promotion before saving
 */
export async function validatePromotionRules(
  promotion: Partial<Promotion>,
  entityId: string
): Promise<{ isValid: boolean; issues: string[] }> {
  const issues: string[] = [];

  // Basic validation
  if (!promotion.name?.trim()) {
    issues.push("Promotion name is required");
  }

  if (!promotion.startDate || !promotion.endDate) {
    issues.push("Start date and end date are required");
  } else if (new Date(promotion.startDate) > new Date(promotion.endDate)) {
    issues.push("Start date must be before end date");
  }

  if (promotion.discountValue === undefined || promotion.discountValue <= 0) {
    issues.push("Discount value must be greater than 0");
  }

  if (promotion.discountType === "percentage" && promotion.discountValue && promotion.discountValue > 100) {
    issues.push("Percentage discount cannot exceed 100%");
  }

  if (!promotion.targetSegments?.length) {
    issues.push("At least one target segment is required");
  }

  // Check for potential conflicts with existing promotions
  if (promotion.startDate && promotion.endDate) {
    const existingPromotions = await getActivePromotions(entityId);

    for (const existing of existingPromotions) {
      if (promotion.promotionId && existing.promotionId === promotion.promotionId) {
        continue; // Skip self when editing
      }

      const hasOverlap = dateRangesOverlap(
        promotion.startDate,
        promotion.endDate,
        existing.startDate,
        existing.endDate
      );

      if (hasOverlap) {
        const segmentOverlap = hasCommonElements(
          promotion.targetSegments || [],
          existing.targetSegments
        );

        if (segmentOverlap && !promotion.stackable && !existing.stackable) {
          issues.push(
            `Potential conflict with "${existing.name}" - both promotions are non-stackable and overlap in time and segments`
          );
        }
      }
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}
