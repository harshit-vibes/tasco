// Customer Lifecycle Enums

// Re-export enums from types for backward compatibility
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

// Re-export all enums
export {
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
};

// Helper arrays for validation and dropdowns (Lead)
export const LEAD_SOURCES = Object.values(LeadSource);
export const LEAD_STATUSES = Object.values(LeadStatus);
export const LEAD_PRIORITIES = Object.values(LeadPriority);

// Helper arrays for validation and dropdowns (Customer)
export const CUSTOMER_STAGES = Object.values(CustomerStage);
export const CUSTOMER_SEGMENTS = Object.values(CustomerSegment);

// Helper arrays for validation and dropdowns (Interaction)
export const INTERACTION_TYPES = Object.values(InteractionType);
export const INTERACTION_CHANNELS = Object.values(InteractionChannel);
export const SENTIMENTS = Object.values(Sentiment);

// Helper arrays for validation and dropdowns (Purchase)
export const PAYMENT_METHODS = Object.values(PaymentMethod);

// Helper arrays for validation and dropdowns (Campaign)
export const CAMPAIGN_TYPES = Object.values(CampaignType);
export const CAMPAIGN_STATUSES = Object.values(CampaignStatus);

// Helper arrays for validation and dropdowns (Recommendation)
export const TARGET_TYPES = Object.values(TargetType);
export const RECOMMENDATION_TYPES = Object.values(RecommendationType);
export const RECOMMENDATION_PRIORITIES = Object.values(RecommendationPriority);
export const RECOMMENDATION_STATUSES = Object.values(RecommendationStatus);

// ============================================
// Vehicle Enums (Inventory Module)
// ============================================

export enum VehicleStatusEnum {
  ORDERED = "ordered",
  IN_PRODUCTION = "in_production",
  SHIPPED = "shipped",
  AT_PORT = "at_port",
  CUSTOMS = "customs",
  INSPECTION = "inspection",
  IN_WAREHOUSE = "in_warehouse",
  IN_TRANSIT = "in_transit",
  AT_SHOWROOM = "at_showroom",
  RESERVED = "reserved",
  SOLD = "sold",
  DELIVERED = "delivered",
}

export enum VehicleBrandEnum {
  GWM = "GWM",
  GAC = "GAC",
  LOTUS = "Lotus",
}

export enum AgeAlertEnum {
  NONE = "none",
  WARNING = "warning",
  CRITICAL = "critical",
}

// Helper arrays for validation and dropdowns
export const VEHICLE_STATUSES = Object.values(VehicleStatusEnum);
export const VEHICLE_BRANDS = Object.values(VehicleBrandEnum);
export const AGE_ALERTS = Object.values(AgeAlertEnum);

// Status display labels (for UI)
export const VEHICLE_STATUS_LABELS: Record<VehicleStatusEnum, string> = {
  [VehicleStatusEnum.ORDERED]: "Ordered",
  [VehicleStatusEnum.IN_PRODUCTION]: "In Production",
  [VehicleStatusEnum.SHIPPED]: "Shipped",
  [VehicleStatusEnum.AT_PORT]: "At Port",
  [VehicleStatusEnum.CUSTOMS]: "Customs",
  [VehicleStatusEnum.INSPECTION]: "Inspection",
  [VehicleStatusEnum.IN_WAREHOUSE]: "In Warehouse",
  [VehicleStatusEnum.IN_TRANSIT]: "In Transit",
  [VehicleStatusEnum.AT_SHOWROOM]: "At Showroom",
  [VehicleStatusEnum.RESERVED]: "Reserved",
  [VehicleStatusEnum.SOLD]: "Sold",
  [VehicleStatusEnum.DELIVERED]: "Delivered",
};

// Status categories for filtering
export const VEHICLE_STATUS_GROUPS = {
  preArrival: [
    "ordered",
    "in_production",
    "shipped",
    "at_port",
    "customs",
    "inspection",
  ],
  inStock: ["in_warehouse", "in_transit", "at_showroom", "reserved"],
  sold: ["sold", "delivered"],
};

// ============================================
// Import Order Enums (Inventory Module)
// ============================================

export enum OrderStatusEnum {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  CONFIRMED = "confirmed",
  IN_PRODUCTION = "in_production",
  SHIPPED = "shipped",
  ARRIVED = "arrived",
  COMPLETED = "completed",
}

export const ORDER_STATUSES = Object.values(OrderStatusEnum);

export const ORDER_STATUS_LABELS: Record<OrderStatusEnum, string> = {
  [OrderStatusEnum.DRAFT]: "Draft",
  [OrderStatusEnum.SUBMITTED]: "Submitted",
  [OrderStatusEnum.CONFIRMED]: "Confirmed",
  [OrderStatusEnum.IN_PRODUCTION]: "In Production",
  [OrderStatusEnum.SHIPPED]: "Shipped",
  [OrderStatusEnum.ARRIVED]: "Arrived",
  [OrderStatusEnum.COMPLETED]: "Completed",
};
