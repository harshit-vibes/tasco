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
  score: number; // 0-100
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
  status?: Lead["status"];
  priority?: Lead["priority"];
  score?: number;
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
  lifecycle?: Partial<Customer["lifecycle"]>;
  insights?: Partial<Customer["insights"]>;
  preferences?: Partial<Customer["preferences"]>;
  lastActivityAt?: string;
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
