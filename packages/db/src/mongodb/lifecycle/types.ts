/**
 * MongoDB Document Types for Customer Lifecycle
 * Migrated from DynamoDB - removes pk/sk fields, uses MongoDB native types
 */

import { ObjectId } from "mongodb";

// ============================================
// Enums (same as DynamoDB)
// ============================================

export type LeadSource = "website" | "referral" | "walk-in" | "event" | "social" | "other";
export type LeadStatus = "new" | "contacted" | "qualified" | "nurturing" | "converted" | "lost";
export type LeadPriority = "hot" | "warm" | "cold";
export type CustomerStage = "prospect" | "active" | "loyal" | "at-risk" | "churned";
export type CustomerSegment = "vip" | "regular" | "at-risk" | "new";
export type CampaignType = "email" | "sms" | "social" | "event" | "direct-mail";
export type CampaignStatus = "draft" | "active" | "paused" | "completed";
export type VehicleBrand = "GWM" | "GAC" | "Lotus";
export type VehicleStatus =
  | "ordered" | "in_production" | "shipped" | "at_port"
  | "customs" | "inspection" | "in_warehouse" | "in_transit"
  | "at_showroom" | "reserved" | "sold" | "delivered";
export type AgeAlert = "none" | "warning" | "critical";
export type OrderStatus = "draft" | "submitted" | "confirmed" | "in_production" | "shipped" | "arrived" | "completed";

// ============================================
// Lead Types
// ============================================

export interface AILeadScore {
  overallScore: number;
  factors: {
    budgetScore: number;
    timelineScore: number;
    brandScore: number;
    engagementScore: number;
  };
  recommendation: "Hot" | "Warm" | "Cold";
  insights: string;
  analyzedAt: string;
}

export interface LeadDocument {
  _id: ObjectId;
  customer: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  score: number;
  aiScore?: AILeadScore;
  interest: {
    brands: string[];
    vehicleTypes: string[];
    budget: string;
    timeline: string;
  };
  assignedTo?: string;
  lastContactedAt?: Date;
  entityId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lead {
  id: string;
  customer: LeadDocument["customer"];
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  score: number;
  aiScore?: AILeadScore;
  interest: LeadDocument["interest"];
  assignedTo?: string;
  lastContactedAt?: string;
  entityId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadInput {
  customer: Lead["customer"];
  source: LeadSource;
  status?: LeadStatus;
  priority?: LeadPriority;
  score?: number;
  interest: Lead["interest"];
  assignedTo?: string;
  entityId: string;
}

export interface UpdateLeadInput {
  customer?: Partial<Lead["customer"]>;
  source?: LeadSource;
  status?: LeadStatus;
  priority?: LeadPriority;
  score?: number;
  aiScore?: AILeadScore;
  interest?: Partial<Lead["interest"]>;
  assignedTo?: string;
  lastContactedAt?: string;
}

// ============================================
// Customer Types
// ============================================

export interface CustomerDocument {
  _id: ObjectId;
  profile: {
    name: string;
    email: string;
    phone: string;
    location: string;
    dateOfBirth: string;
  };
  lifecycle: {
    stage: CustomerStage;
    firstPurchaseDate: string;
    lastPurchaseDate?: string;
  };
  insights: {
    lifetimeValue: number;
    totalPurchases: number;
    averageOrderValue: number;
    segment: CustomerSegment;
    churnRisk: number;
    satisfactionScore: number;
    recommendedActions?: string[];
  };
  preferences: {
    brands: string[];
    communicationChannels: string[];
    serviceInterests: string[];
  };
  entityId: string;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  profile: CustomerDocument["profile"];
  lifecycle: CustomerDocument["lifecycle"];
  insights: CustomerDocument["insights"];
  preferences: CustomerDocument["preferences"];
  entityId: string;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerInput {
  profile: Customer["profile"];
  lifecycle: {
    stage?: CustomerStage;
    firstPurchaseDate: string;
  };
  insights?: Partial<Customer["insights"]>;
  preferences?: Partial<Customer["preferences"]>;
  entityId: string;
}

export interface UpdateCustomerInput {
  profile?: Partial<Customer["profile"]>;
  lifecycle?: Partial<Customer["lifecycle"]>;
  insights?: Partial<Customer["insights"]>;
  preferences?: Partial<Customer["preferences"]>;
  lastActivityAt?: string;
  entityId?: string;
}

// ============================================
// Campaign Types
// ============================================

export interface CampaignDocument {
  _id: ObjectId;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  targetSegment?: string;
  budget?: number;
  startDate: string;
  endDate?: string;
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    revenue?: number;
  };
  createdBy?: string;
  entityId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  targetSegment?: string;
  budget?: number;
  startDate: string;
  endDate?: string;
  metrics: CampaignDocument["metrics"];
  createdBy?: string;
  entityId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignInput {
  name: string;
  type: CampaignType;
  status?: CampaignStatus;
  targetSegment?: string;
  budget?: number;
  startDate: string;
  endDate?: string;
  createdBy?: string;
  entityId: string;
}

export interface UpdateCampaignInput {
  name?: string;
  status?: CampaignStatus;
  targetSegment?: string;
  budget?: number;
  endDate?: string;
  metrics?: Partial<CampaignDocument["metrics"]>;
}

// ============================================
// Vehicle Types
// ============================================

export interface VehicleDocument {
  _id: ObjectId;
  vin: string;
  brand: VehicleBrand;
  model: string;
  variant: string;
  color: string;
  configuration?: string;
  year: number;
  importPrice: number;
  listPrice: number;
  dealerPrice?: number;
  status: VehicleStatus;
  currentLocation?: string;
  assignedShowroom: string;
  orderedAt: string;
  expectedArrival: string;
  arrivedAt?: string;
  soldAt?: string;
  daysInInventory: number;
  ageAlert: AgeAlert;
  importOrderId?: string;
  soldToCustomerId?: string;
  reservedForLeadId?: string;
  entityId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vehicle {
  id: string;
  vin: string;
  brand: VehicleBrand;
  model: string;
  variant: string;
  color: string;
  configuration?: string;
  year: number;
  importPrice: number;
  listPrice: number;
  dealerPrice?: number;
  status: VehicleStatus;
  currentLocation?: string;
  assignedShowroom: string;
  orderedAt: string;
  expectedArrival: string;
  arrivedAt?: string;
  soldAt?: string;
  daysInInventory: number;
  ageAlert: AgeAlert;
  importOrderId?: string;
  soldToCustomerId?: string;
  reservedForLeadId?: string;
  entityId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleInput {
  vin: string;
  brand: VehicleBrand;
  model: string;
  variant: string;
  color: string;
  configuration?: string;
  year: number;
  importPrice: number;
  listPrice: number;
  dealerPrice?: number;
  status?: VehicleStatus;
  currentLocation?: string;
  assignedShowroom: string;
  orderedAt: string;
  expectedArrival: string;
  importOrderId?: string;
  entityId: string;
}

export interface UpdateVehicleInput {
  status?: VehicleStatus;
  currentLocation?: string;
  assignedShowroom?: string;
  expectedArrival?: string;
  arrivedAt?: string;
  soldAt?: string;
  soldToCustomerId?: string;
  reservedForLeadId?: string;
  listPrice?: number;
  dealerPrice?: number;
}

export interface VehicleStats {
  total: number;
  byStatus: Partial<Record<VehicleStatus, number>>;
  byBrand: Partial<Record<VehicleBrand, number>>;
  atShowroom: number;
  inTransit: number;
  reserved: number;
  sold: number;
  agingWarning: number;
  agingCritical: number;
  totalValue: number;
}

// ============================================
// Import Order Types
// ============================================

export interface VehicleOrderLine {
  model: string;
  variant: string;
  color: string;
  quantity: number;
  unitPrice: number;
}

export interface ImportOrderDocument {
  _id: ObjectId;
  orderNumber: string;
  brand: VehicleBrand;
  totalUnits: number;
  vehicles: VehicleOrderLine[];
  orderedAt: string;
  expectedProductionComplete: string;
  expectedShipDate: string;
  expectedArrivalDate: string;
  actualArrivalDate?: string;
  status: OrderStatus;
  totalValue: number;
  lcNumber?: string;
  lcOpenedAt?: string;
  lcExpiryAt?: string;
  notes?: string;
  entityId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImportOrder {
  id: string;
  orderNumber: string;
  brand: VehicleBrand;
  totalUnits: number;
  vehicles: VehicleOrderLine[];
  orderedAt: string;
  expectedProductionComplete: string;
  expectedShipDate: string;
  expectedArrivalDate: string;
  actualArrivalDate?: string;
  status: OrderStatus;
  totalValue: number;
  lcNumber?: string;
  lcOpenedAt?: string;
  lcExpiryAt?: string;
  notes?: string;
  entityId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateImportOrderInput {
  orderNumber: string;
  brand: VehicleBrand;
  vehicles: VehicleOrderLine[];
  orderedAt: string;
  expectedProductionComplete: string;
  expectedShipDate: string;
  expectedArrivalDate: string;
  totalValue: number;
  lcNumber?: string;
  lcOpenedAt?: string;
  lcExpiryAt?: string;
  notes?: string;
  entityId: string;
}

export interface UpdateImportOrderInput {
  status?: OrderStatus;
  expectedProductionComplete?: string;
  expectedShipDate?: string;
  expectedArrivalDate?: string;
  actualArrivalDate?: string;
  lcNumber?: string;
  lcOpenedAt?: string;
  lcExpiryAt?: string;
  notes?: string;
}

// ============================================
// Entity Types
// ============================================

export interface EntityDocument {
  _id: ObjectId;
  entityId: string;
  name: string;
  shortName: string;
  type: "parent" | "holding" | "subsidiary";
  category: string;
  parentId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Entity {
  id: string;
  entityId: string;
  name: string;
  shortName: string;
  type: "parent" | "holding" | "subsidiary";
  category: string;
  parentId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntityInput {
  id?: string;
  name: string;
  shortName: string;
  type: Entity["type"];
  category: string;
  parentId?: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// Utility Types
// ============================================

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

export interface LeadStats {
  total: number;
  hot: number;
  warm: number;
  cold: number;
  new: number;
  contacted: number;
  qualified: number;
  conversionRate: number;
}
