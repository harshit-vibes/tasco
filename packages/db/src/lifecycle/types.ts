// Customer Lifecycle Types

// ============================================
// Enums
// ============================================

// Lead Enums
export enum LeadSource {
  WEBSITE = "website",
  REFERRAL = "referral",
  WALK_IN = "walk-in",
  EVENT = "event",
  SOCIAL = "social",
  OTHER = "other",
}

export enum LeadStatus {
  NEW = "new",
  CONTACTED = "contacted",
  QUALIFIED = "qualified",
  NURTURING = "nurturing",
  CONVERTED = "converted",
  LOST = "lost",
}

export enum LeadPriority {
  HOT = "hot",
  WARM = "warm",
  COLD = "cold",
}

// Customer Enums
export enum CustomerStage {
  PROSPECT = "prospect",
  ACTIVE = "active",
  LOYAL = "loyal",
  AT_RISK = "at-risk",
  CHURNED = "churned",
}

export enum CustomerSegment {
  VIP = "vip",
  REGULAR = "regular",
  AT_RISK = "at-risk",
  NEW = "new",
}

// Interaction Enums
export enum InteractionType {
  CALL = "call",
  EMAIL = "email",
  MEETING = "meeting",
  NOTE = "note",
  SUPPORT = "support",
  OTHER = "other",
}

export enum InteractionChannel {
  PHONE = "phone",
  EMAIL = "email",
  IN_PERSON = "in-person",
  CHAT = "chat",
}

export enum Sentiment {
  POSITIVE = "positive",
  NEUTRAL = "neutral",
  NEGATIVE = "negative",
}

// Purchase Enums
export enum PaymentMethod {
  CASH = "cash",
  FINANCE = "finance",
  LEASE = "lease",
}

// Campaign Enums
export enum CampaignType {
  EMAIL = "email",
  SMS = "sms",
  SOCIAL = "social",
  EVENT = "event",
  DIRECT_MAIL = "direct-mail",
}

export enum CampaignStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  PAUSED = "paused",
  COMPLETED = "completed",
}

// AI Recommendation Enums
export enum TargetType {
  LEAD = "lead",
  CUSTOMER = "customer",
}

export enum RecommendationType {
  NEXT_BEST_ACTION = "next_best_action",
  CHURN_PREVENTION = "churn_prevention",
  UPSELL = "upsell",
  CROSS_SELL = "cross_sell",
  LEAD_NURTURING = "lead_nurturing",
  SERVICE_REMINDER = "service_reminder",
}

export enum RecommendationPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export enum RecommendationStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  DISMISSED = "dismissed",
}

// ============================================
// Lead Types
// ============================================

// AI Lead Score - output from Lead Scoring Agent
export interface AILeadScore {
  overallScore: number; // 0-100 weighted average
  factors: {
    budgetScore: number; // 0-100 - Budget fit
    timelineScore: number; // 0-100 - Timeline urgency
    brandScore: number; // 0-100 - Brand interest match
    engagementScore: number; // 0-100 - Engagement signals
  };
  recommendation: "Hot" | "Warm" | "Cold";
  insights: string; // 1-2 sentence analysis
  analyzedAt: string; // ISO timestamp
}

export interface Lead {
  id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  source: "website" | "referral" | "walk-in" | "event" | "social" | "other";
  status: "new" | "contacted" | "qualified" | "nurturing" | "converted" | "lost";
  priority: "hot" | "warm" | "cold";
  score: number; // 0-100 (basic score, may be updated by AI)
  aiScore?: AILeadScore; // AI-generated score with factor breakdown
  interest: {
    brands: string[];
    vehicleTypes: string[];
    budget: string;
    timeline: string;
  };
  assignedTo?: string;
  lastContactedAt?: string;
  entityId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadItem extends Lead {
  pk: string; // LEAD#{leadId}
  sk: string; // METADATA
}

export interface CreateLeadInput {
  id?: string;
  customer: Lead["customer"];
  source: Lead["source"];
  status?: Lead["status"];
  priority?: Lead["priority"];
  score?: number;
  interest: Lead["interest"];
  assignedTo?: string;
  entityId: string;
}

export interface UpdateLeadInput {
  customer?: Partial<Lead["customer"]>;
  source?: Lead["source"];
  status?: Lead["status"];
  priority?: Lead["priority"];
  score?: number;
  aiScore?: AILeadScore;
  interest?: Partial<Lead["interest"]>;
  assignedTo?: string;
  lastContactedAt?: string;
}

// ============================================
// Customer Types
// ============================================

export interface Customer {
  id: string;
  profile: {
    name: string;
    email: string;
    phone: string;
    location: string;
    dateOfBirth: string;
  };
  lifecycle: {
    stage: "prospect" | "active" | "loyal" | "at-risk" | "churned";
    firstPurchaseDate: string;
    lastPurchaseDate?: string;
  };
  insights: {
    lifetimeValue: number;
    totalPurchases: number;
    averageOrderValue: number;
    segment: "vip" | "regular" | "at-risk" | "new";
    churnRisk: number; // 0-1
    satisfactionScore: number; // 0-100
    recommendedActions?: string[];
  };
  preferences: {
    brands: string[];
    communicationChannels: string[];
    serviceInterests: string[];
  };
  entityId: string;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerItem extends Customer {
  pk: string; // CUST#{customerId}
  sk: string; // METADATA
}

export interface CreateCustomerInput {
  id?: string;
  profile: Customer["profile"];
  lifecycle: {
    stage?: Customer["lifecycle"]["stage"];
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
// Interaction Types
// ============================================

export interface Interaction {
  id: string;
  leadId?: string;
  customerId?: string;
  type: "call" | "email" | "meeting" | "note" | "support" | "other";
  channel: "phone" | "email" | "in-person" | "chat";
  notes: string;
  sentiment?: "positive" | "neutral" | "negative";
  timestamp: string;
  performedBy?: string;
  entityId: string;
  createdAt: string;
}

export interface InteractionItem extends Interaction {
  pk: string; // INT#{leadId or customerId}
  sk: string; // {timestamp}#{interactionId}
}

export interface CreateInteractionInput {
  id?: string;
  leadId?: string;
  customerId?: string;
  type: Interaction["type"];
  channel: Interaction["channel"];
  notes: string;
  sentiment?: Interaction["sentiment"];
  performedBy?: string;
  entityId: string;
}

// ============================================
// Purchase Types
// ============================================

export interface Purchase {
  id: string;
  customerId: string;
  brand: string;
  vehicleModel: string;
  year: number;
  amount: number;
  paymentMethod: "cash" | "finance" | "lease";
  salesRep?: string;
  purchaseDate: string;
  entityId: string;
  createdAt: string;
}

export interface PurchaseItem extends Purchase {
  pk: string; // CUST#{customerId}
  sk: string; // PUR#{timestamp}#{purchaseId}
}

export interface CreatePurchaseInput {
  id?: string;
  customerId: string;
  brand: string;
  vehicleModel: string;
  year: number;
  amount: number;
  paymentMethod: Purchase["paymentMethod"];
  salesRep?: string;
  purchaseDate?: string;
  entityId: string;
}

// ============================================
// Campaign Types
// ============================================

export interface Campaign {
  id: string;
  name: string;
  type: "email" | "sms" | "social" | "event" | "direct-mail";
  status: "draft" | "active" | "paused" | "completed";
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
  createdBy?: string; // userId of campaign creator
  entityId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignItem extends Campaign {
  pk: string; // CAMP#{campaignId}
  sk: string; // METADATA
}

export interface CreateCampaignInput {
  id?: string;
  name: string;
  type: Campaign["type"];
  status?: Campaign["status"];
  targetSegment?: string;
  budget?: number;
  startDate: string;
  endDate?: string;
  createdBy?: string;
  entityId: string;
}

export interface UpdateCampaignInput {
  name?: string;
  status?: Campaign["status"];
  targetSegment?: string;
  budget?: number;
  endDate?: string;
  metrics?: Partial<Campaign["metrics"]>;
}

// ============================================
// AI Recommendation Types
// ============================================

export interface AIRecommendation {
  id: string;
  targetId: string; // leadId or customerId
  targetType: "lead" | "customer";
  type:
    | "next_best_action"
    | "churn_prevention"
    | "upsell"
    | "cross_sell"
    | "lead_nurturing"
    | "service_reminder";
  title: string;
  description: string;
  confidence: number; // 0-1
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "completed" | "dismissed";
  entityId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIRecommendationItem extends AIRecommendation {
  pk: string; // REC#{targetId}
  sk: string; // {timestamp}#{recommendationId}
}

export interface CreateAIRecommendationInput {
  id?: string;
  targetId: string;
  targetType: AIRecommendation["targetType"];
  type: AIRecommendation["type"];
  title: string;
  description: string;
  confidence: number;
  priority?: AIRecommendation["priority"];
  entityId: string;
}

export interface UpdateAIRecommendationInput {
  status?: AIRecommendation["status"];
}

// ============================================
// Utility Types
// ============================================

export interface PaginatedResult<T> {
  items: T[];
  lastEvaluatedKey?: Record<string, any>;
  count: number;
}

// ============================================
// Vehicle Types (Inventory Module)
// ============================================

export type VehicleBrand = "GWM" | "GAC" | "Lotus";

export type VehicleStatus =
  | "ordered" // PO placed with OEM
  | "in_production" // OEM manufacturing
  | "shipped" // On vessel
  | "at_port" // Arrived at Vietnam port
  | "customs" // Customs clearance
  | "inspection" // Quality inspection
  | "in_warehouse" // Central warehouse
  | "in_transit" // Being delivered to showroom
  | "at_showroom" // Available for sale
  | "reserved" // Reserved for customer
  | "sold" // Sold
  | "delivered"; // Delivered to customer

export type AgeAlert = "none" | "warning" | "critical";

export interface Vehicle {
  id: string;
  vin: string; // Vehicle Identification Number (unique)

  // Vehicle Details
  brand: VehicleBrand;
  model: string; // e.g., "Haval H6", "Lynk & Co 01"
  variant: string; // e.g., "Premium", "Sport"
  color: string;
  configuration?: string; // e.g., "4WD", "Sunroof Package"
  year: number;

  // Pricing (all in VND unless noted)
  importPrice: number; // Cost price (USD)
  listPrice: number; // MSRP (VND)
  dealerPrice?: number; // Price to dealer (VND)

  // Status & Location
  status: VehicleStatus;
  currentLocation?: string; // Showroom ID or warehouse ID
  assignedShowroom: string; // Target showroom for delivery

  // Timeline
  orderedAt: string; // ISO date - when PO was placed
  expectedArrival: string; // ISO date - expected at showroom
  arrivedAt?: string; // ISO date - actual arrival at showroom
  soldAt?: string; // ISO date - when sold

  // Age Tracking (computed on read)
  daysInInventory: number; // Days since arrivedAt (or 0 if not arrived)
  ageAlert: AgeAlert; // none | warning (>60d) | critical (>90d)

  // Linking
  importOrderId?: string; // Parent import order
  soldToCustomerId?: string; // Customer who purchased
  reservedForLeadId?: string; // Lead with reservation

  // Multi-tenant
  entityId: string; // Showroom/entity
  createdAt: string;
  updatedAt: string;
}

export interface VehicleItem extends Vehicle {
  pk: string; // VEH#{vehicleId}
  sk: string; // METADATA
}

export interface CreateVehicleInput {
  id?: string; // Auto-generated if not provided
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
  status?: VehicleStatus; // Default: "ordered"
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

// Vehicle Stats type
export interface VehicleStats {
  total: number;
  byStatus: Partial<Record<VehicleStatus, number>>;
  byBrand: Partial<Record<VehicleBrand, number>>;
  atShowroom: number;
  inTransit: number;
  reserved: number;
  sold: number;
  agingWarning: number; // >60 days
  agingCritical: number; // >90 days
  totalValue: number; // Sum of listPrice for unsold
}

// ============================================
// Import Order Types (Inventory Module)
// ============================================

export type OrderStatus =
  | "draft"
  | "submitted"
  | "confirmed"
  | "in_production"
  | "shipped"
  | "arrived"
  | "completed";

export interface VehicleOrderLine {
  model: string;
  variant: string;
  color: string;
  quantity: number;
  unitPrice: number; // USD per unit
}

export interface ImportOrder {
  id: string;
  orderNumber: string; // PO number (e.g., "PO-2025-001")

  // Order Details
  brand: VehicleBrand;
  totalUnits: number; // Sum of all line quantities
  vehicles: VehicleOrderLine[];

  // Timeline
  orderedAt: string; // ISO date - PO submission
  expectedProductionComplete: string; // ISO date - OEM production done
  expectedShipDate: string; // ISO date - leaves factory
  expectedArrivalDate: string; // ISO date - arrives Vietnam
  actualArrivalDate?: string; // ISO date - actual arrival

  // Status
  status: OrderStatus;

  // Financials
  totalValue: number; // Total order value (USD)
  lcNumber?: string; // Letter of Credit number
  lcOpenedAt?: string; // LC opening date
  lcExpiryAt?: string; // LC expiry date

  // Notes
  notes?: string;

  // Multi-tenant
  entityId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImportOrderItem extends ImportOrder {
  pk: string; // IORD#{orderId}
  sk: string; // METADATA
}

export interface CreateImportOrderInput {
  id?: string;
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

export interface ImportOrderStats {
  total: number;
  byStatus: Partial<Record<OrderStatus, number>>;
  byBrand: Partial<Record<VehicleBrand, number>>;
  totalUnits: number;
  totalValue: number;
  pendingArrival: number; // Not yet arrived
  arrivedThisMonth: number;
}
