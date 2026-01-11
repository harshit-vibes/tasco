/**
 * Promotion utility functions
 */

import type { Promotion, PromotionStatus } from "./types";

/**
 * Generate a unique promotion ID
 */
export function generatePromotionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `PROMO-${timestamp}-${random}`.toUpperCase();
}

/**
 * Generate a unique conflict ID
 */
export function generateConflictId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `CONF-${timestamp}-${random}`.toUpperCase();
}

/**
 * Check if two date ranges overlap
 */
export function dateRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = new Date(start1).getTime();
  const e1 = new Date(end1).getTime();
  const s2 = new Date(start2).getTime();
  const e2 = new Date(end2).getTime();

  return s1 <= e2 && e1 >= s2;
}

/**
 * Get the overlap period between two date ranges
 */
export function getOverlapPeriod(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): { start: string; end: string } | null {
  if (!dateRangesOverlap(start1, end1, start2, end2)) {
    return null;
  }

  const overlapStart = new Date(Math.max(
    new Date(start1).getTime(),
    new Date(start2).getTime()
  ));

  const overlapEnd = new Date(Math.min(
    new Date(end1).getTime(),
    new Date(end2).getTime()
  ));

  return {
    start: overlapStart.toISOString().split('T')[0],
    end: overlapEnd.toISOString().split('T')[0],
  };
}

/**
 * Check if two arrays have common elements
 */
export function hasCommonElements<T>(arr1: T[], arr2: T[]): boolean {
  // Handle "all" wildcard
  if (arr1.includes("all" as T) || arr2.includes("all" as T)) {
    return true;
  }
  return arr1.some(item => arr2.includes(item));
}

/**
 * Get common elements between two arrays
 */
export function getCommonElements<T>(arr1: T[], arr2: T[]): T[] {
  // Handle "all" wildcard
  if (arr1.includes("all" as T)) {
    return arr2.filter(item => item !== "all");
  }
  if (arr2.includes("all" as T)) {
    return arr1.filter(item => item !== "all");
  }
  return arr1.filter(item => arr2.includes(item));
}

/**
 * Check if a promotion is currently active based on dates and status
 */
export function isPromotionActive(promotion: Promotion): boolean {
  if (promotion.status !== "active") {
    return false;
  }

  const now = new Date();
  const startDate = new Date(promotion.startDate);
  const endDate = new Date(promotion.endDate);

  return now >= startDate && now <= endDate;
}

/**
 * Determine promotion status based on dates
 */
export function getEffectiveStatus(promotion: Promotion): PromotionStatus {
  if (promotion.status === "draft" || promotion.status === "paused") {
    return promotion.status;
  }

  const now = new Date();
  const endDate = new Date(promotion.endDate);

  if (now > endDate) {
    return "expired";
  }

  return promotion.status;
}

/**
 * Format promotion for display
 */
export function formatPromotionDiscount(promotion: Promotion): string {
  if (promotion.discountType === "percentage") {
    return `${promotion.discountValue}% off`;
  }
  return `$${promotion.discountValue} off`;
}

/**
 * Calculate days until promotion starts or ends
 */
export function getDaysUntil(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get promotion duration in days
 */
export function getPromotionDuration(promotion: Promotion): number {
  const start = new Date(promotion.startDate);
  const end = new Date(promotion.endDate);
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Sort promotions by priority (higher first) then by start date
 */
export function sortPromotionsByPriority(promotions: Promotion[]): Promotion[] {
  return [...promotions].sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });
}
