/**
 * Enum Utilities for Customer Lifecycle
 *
 * Provides helper functions to work with lifecycle enums
 */

import {
  LeadSource,
  LeadStatus,
  LeadPriority,
  CustomerStage,
  CustomerSegment,
  InteractionType,
  InteractionChannel,
  Sentiment,
  PaymentMethod,
  CampaignType,
  CampaignStatus,
  TargetType,
  RecommendationType,
  RecommendationPriority,
  RecommendationStatus,
} from "./types";

/**
 * Get all values from an enum
 */
export function getEnumValues<T extends Record<string, string>>(
  enumObj: T
): string[] {
  return Object.values(enumObj);
}

/**
 * Get all keys from an enum
 */
export function getEnumKeys<T extends Record<string, string>>(
  enumObj: T
): string[] {
  return Object.keys(enumObj);
}

/**
 * Check if value is valid for enum
 */
export function isValidEnumValue<T extends Record<string, string>>(
  enumObj: T,
  value: string
): boolean {
  return Object.values(enumObj).includes(value);
}

/**
 * Format enum value for display (replace underscores and capitalize)
 */
export function formatEnumValue(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// ============================================
// Lead Enum Helpers
// ============================================

export const LEAD_SOURCES = getEnumValues(LeadSource);
export const LEAD_STATUSES = getEnumValues(LeadStatus);
export const LEAD_PRIORITIES = getEnumValues(LeadPriority);

export function isValidLeadSource(value: string): value is LeadSource {
  return isValidEnumValue(LeadSource, value);
}

export function isValidLeadStatus(value: string): value is LeadStatus {
  return isValidEnumValue(LeadStatus, value);
}

export function isValidLeadPriority(value: string): value is LeadPriority {
  return isValidEnumValue(LeadPriority, value);
}

// ============================================
// Customer Enum Helpers
// ============================================

export const CUSTOMER_STAGES = getEnumValues(CustomerStage);
export const CUSTOMER_SEGMENTS = getEnumValues(CustomerSegment);

export function isValidCustomerStage(value: string): value is CustomerStage {
  return isValidEnumValue(CustomerStage, value);
}

export function isValidCustomerSegment(
  value: string
): value is CustomerSegment {
  return isValidEnumValue(CustomerSegment, value);
}

// ============================================
// Interaction Enum Helpers
// ============================================

export const INTERACTION_TYPES = getEnumValues(InteractionType);
export const INTERACTION_CHANNELS = getEnumValues(InteractionChannel);
export const SENTIMENTS = getEnumValues(Sentiment);

export function isValidInteractionType(
  value: string
): value is InteractionType {
  return isValidEnumValue(InteractionType, value);
}

export function isValidInteractionChannel(
  value: string
): value is InteractionChannel {
  return isValidEnumValue(InteractionChannel, value);
}

export function isValidSentiment(value: string): value is Sentiment {
  return isValidEnumValue(Sentiment, value);
}

// ============================================
// Purchase Enum Helpers
// ============================================

export const PAYMENT_METHODS = getEnumValues(PaymentMethod);

export function isValidPaymentMethod(value: string): value is PaymentMethod {
  return isValidEnumValue(PaymentMethod, value);
}

// ============================================
// Campaign Enum Helpers
// ============================================

export const CAMPAIGN_TYPES = getEnumValues(CampaignType);
export const CAMPAIGN_STATUSES = getEnumValues(CampaignStatus);

export function isValidCampaignType(value: string): value is CampaignType {
  return isValidEnumValue(CampaignType, value);
}

export function isValidCampaignStatus(value: string): value is CampaignStatus {
  return isValidEnumValue(CampaignStatus, value);
}

// ============================================
// AI Recommendation Enum Helpers
// ============================================

export const TARGET_TYPES = getEnumValues(TargetType);
export const RECOMMENDATION_TYPES = getEnumValues(RecommendationType);
export const RECOMMENDATION_PRIORITIES = getEnumValues(RecommendationPriority);
export const RECOMMENDATION_STATUSES = getEnumValues(RecommendationStatus);

export function isValidTargetType(value: string): value is TargetType {
  return isValidEnumValue(TargetType, value);
}

export function isValidRecommendationType(
  value: string
): value is RecommendationType {
  return isValidEnumValue(RecommendationType, value);
}

export function isValidRecommendationPriority(
  value: string
): value is RecommendationPriority {
  return isValidEnumValue(RecommendationPriority, value);
}

export function isValidRecommendationStatus(
  value: string
): value is RecommendationStatus {
  return isValidEnumValue(RecommendationStatus, value);
}
