/**
 * Promotions module - Public exports
 */

// Export all types
export type {
  Promotion,
  PromotionStatus,
  PromotionType,
  DiscountType,
  PromotionCustomerSegment,
  SalesChannel,
  CreatePromotionInput,
  UpdatePromotionInput,
  PromotionConflict,
  ConflictType,
  ConflictSeverity,
  ConflictDetectionResult,
  PaginatedResult,
  PromotionStats,
} from "./types";

// Export promotion CRUD operations
export {
  createPromotion,
  getPromotion,
  updatePromotion,
  deletePromotion,
  listAllPromotions,
  listPromotionsByEntity,
  listPromotionsByStatus,
  getActivePromotions,
  getPromotionsInDateRange,
  searchPromotions,
  getPromotionStats,
  clonePromotion,
} from "./promotions";

// Export conflict detection
export {
  detectConflicts,
  checkConflictsForPromotion,
  validatePromotionRules,
} from "./conflict-detection";

// Export utilities
export {
  generatePromotionId,
  generateConflictId,
  dateRangesOverlap,
  getOverlapPeriod,
  hasCommonElements,
  getCommonElements,
  isPromotionActive,
  getEffectiveStatus,
  formatPromotionDiscount,
  getDaysUntil,
  getPromotionDuration,
  sortPromotionsByPriority,
} from "./utils";
