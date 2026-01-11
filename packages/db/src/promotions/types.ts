/**
 * Promotion data types for DynamoDB persistence
 * Simplified schema for Inochi Promotion Control demo
 */

export type PromotionStatus = "active" | "draft" | "paused" | "expired";

export type PromotionType = "discount" | "bundle" | "free-item" | "loyalty" | "coupon";

export type DiscountType = "percentage" | "fixed";

export type ConflictType = "time-overlap" | "segment-overlap" | "stacking-violation" | "exclusion-rule";

export type ConflictSeverity = "critical" | "warning" | "info";

/**
 * Customer segment for targeting promotions
 */
export type PromotionCustomerSegment = "all" | "vip" | "regular" | "new" | "wholesale" | "retail";

/**
 * Sales channel
 */
export type SalesChannel = "all" | "ecommerce" | "retail" | "wholesale" | "direct";

/**
 * Main Promotion entity (simplified)
 */
export interface Promotion {
  // Primary identifier
  promotionId: string;
  entityId: string;

  // Basic info
  name: string;
  description: string;
  type: PromotionType;
  status: PromotionStatus;

  // Targeting (simplified)
  targetSegments: PromotionCustomerSegment[];
  targetProducts: string[]; // Product categories or "all"
  targetChannels: SalesChannel[];

  // Timing
  startDate: string; // ISO 8601
  endDate: string;

  // Discount
  discountType: DiscountType;
  discountValue: number;

  // Rules (simplified)
  stackable: boolean;
  excludePromotionIds: string[]; // Cannot combine with these
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  priority: number; // Higher = applied first

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

/**
 * Create promotion input
 */
export interface CreatePromotionInput {
  entityId: string;
  name: string;
  description: string;
  type: PromotionType;
  status?: PromotionStatus;
  targetSegments: PromotionCustomerSegment[];
  targetProducts: string[];
  targetChannels: SalesChannel[];
  startDate: string;
  endDate: string;
  discountType: DiscountType;
  discountValue: number;
  stackable: boolean;
  excludePromotionIds?: string[];
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  priority?: number;
  createdBy: string;
}

/**
 * Update promotion input
 */
export interface UpdatePromotionInput {
  name?: string;
  description?: string;
  type?: PromotionType;
  status?: PromotionStatus;
  targetSegments?: PromotionCustomerSegment[];
  targetProducts?: string[];
  targetChannels?: SalesChannel[];
  startDate?: string;
  endDate?: string;
  discountType?: DiscountType;
  discountValue?: number;
  stackable?: boolean;
  excludePromotionIds?: string[];
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  priority?: number;
}

/**
 * Detected conflict between promotions (computed on-demand, not stored)
 */
export interface PromotionConflict {
  conflictId: string;
  type: ConflictType;
  severity: ConflictSeverity;
  promotionIds: string[];
  promotionNames: string[];
  affectedSegments: PromotionCustomerSegment[];
  affectedProducts: string[];
  overlapStart?: string;
  overlapEnd?: string;
  description: string;
  recommendation: string;
  detectedAt: string;
}

/**
 * Conflict detection result
 */
export interface ConflictDetectionResult {
  totalPromotions: number;
  activePromotions: number;
  conflictsFound: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  conflicts: PromotionConflict[];
  analyzedAt: string;
}

/**
 * Pagination result
 */
export interface PaginatedResult<T> {
  items: T[];
  lastEvaluatedKey?: Record<string, unknown>;
  hasMore: boolean;
}

/**
 * Promotion statistics
 */
export interface PromotionStats {
  total: number;
  active: number;
  draft: number;
  paused: number;
  expired: number;
  byType: Record<PromotionType, number>;
  bySegment: Record<PromotionCustomerSegment, number>;
}
