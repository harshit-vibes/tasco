/**
 * Data layer for Sales & Pricing app
 * Provides abstraction over @tasco/db functions and quote-specific operations
 */

import {
  listEntities,
  getEntity,
  createConversation,
  listConversationsByEntity,
  getConversation,
  updateConversation,
  deleteConversation,
  listMessages,
  createMessage,
  createNotification,
  getNotifications,
  type Entity,
  type Conversation,
  type Message,
  type Notification,
} from "@tasco/db";

// Re-export common types
export type { Entity, Conversation, Message, Notification };

// Quote Types
export type QuoteStatus = "draft" | "pending" | "approved" | "rejected" | "accepted" | "expired";
export type RiskLevel = "low" | "standard" | "high";
export type UsageType = "personal" | "commercial";

export interface VehicleData {
  make: string;
  model: string;
  year: number;
  registrationNo?: string;
  usage: UsageType;
  estimatedValue: number;
  engineCapacity?: number;
}

export interface CustomerData {
  name: string;
  phone: string;
  email?: string;
  idNumber?: string;
  driverAge: number;
  drivingExperience: number;
}

export interface RiskFactor {
  name: string;
  impact: "positive" | "negative" | "neutral";
  weight: number;
  description: string;
  confidence: number;
}

export interface RiskAssessment {
  score: number;
  level: RiskLevel;
  factors: RiskFactor[];
}

export interface PricingAdjustment {
  type: "discount" | "surcharge";
  reason: string;
  percentage: number;
  amount: number;
}

export interface Quote {
  id: string;
  entityId: string;
  vehicleData: VehicleData;
  customerData: CustomerData;
  riskAssessment: RiskAssessment;
  basePremium: number;
  adjustments: PricingAdjustment[];
  finalPremium: number;
  status: QuoteStatus;
  validUntil: string;
  createdBy: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// App ID constant
const APP_ID = "sales-pricing";

// Entity Operations
export async function getAllEntities(): Promise<Entity[]> {
  const result = await listEntities();
  return result.items;
}

export async function getEntityById(entityId: string): Promise<Entity | null> {
  return getEntity(entityId);
}

// Conversation Operations
export async function getConversations(entityId: string): Promise<Conversation[]> {
  const result = await listConversationsByEntity(APP_ID, entityId);
  return result.items;
}

export async function getConversationById(conversationId: string): Promise<Conversation | null> {
  return getConversation(APP_ID, conversationId);
}

export async function createNewConversation(
  entityId: string,
  userId: string,
  title?: string
): Promise<Conversation> {
  return createConversation({
    appId: APP_ID,
    entityId,
    userId,
    title: title || "New Conversation",
  });
}

export async function updateConversationTitle(
  conversationId: string,
  title: string
): Promise<Conversation> {
  return updateConversation(APP_ID, conversationId, { title });
}

export async function deleteConversationById(conversationId: string): Promise<void> {
  return deleteConversation(APP_ID, conversationId);
}

// Message Operations
export async function getMessagesByConversation(conversationId: string): Promise<Message[]> {
  const result = await listMessages(conversationId);
  return result.items;
}

export async function sendMessage(
  conversationId: string,
  content: string,
  role: "user" | "assistant" = "user"
): Promise<Message> {
  return createMessage({
    conversationId,
    role,
    content,
  });
}

// Notification Operations
export async function getAppNotifications(limit?: number): Promise<Notification[]> {
  const result = await getNotifications(APP_ID, { limit });
  return result.items;
}

export async function createQuoteNotification(
  entityId: string,
  type: "created" | "approved" | "rejected" | "accepted",
  quoteId: string,
  customerName: string
): Promise<Notification> {
  const titles = {
    created: "New Quote Created",
    approved: "Quote Approved",
    rejected: "Quote Rejected",
    accepted: "Quote Accepted by Customer",
  };

  const messages = {
    created: `Quote ${quoteId} created for ${customerName}`,
    approved: `Quote ${quoteId} for ${customerName} has been approved`,
    rejected: `Quote ${quoteId} for ${customerName} has been rejected`,
    accepted: `Customer ${customerName} accepted quote ${quoteId}`,
  };

  return createNotification({
    appId: APP_ID,
    entityId,
    type,
    category: "quote",
    title: titles[type],
    message: messages[type],
    priority: type === "rejected" ? "high" : "medium",
    metadata: { quoteId, customerName },
  });
}

// Premium Calculation Utilities
export function calculateBasePremium(vehicleData: VehicleData): number {
  const baseRates: Record<UsageType, number> = {
    personal: 0.018,
    commercial: 0.025,
  };

  return vehicleData.estimatedValue * baseRates[vehicleData.usage];
}

export function assessRisk(
  vehicleData: VehicleData,
  customerData: CustomerData
): RiskAssessment {
  const factors: RiskFactor[] = [];
  let totalWeight = 0;

  // Driver age factor
  const driverAge = customerData.driverAge;
  if (driverAge < 25) {
    factors.push({
      name: "Driver Age",
      impact: "negative",
      weight: 15,
      description: "Young drivers have higher accident rates",
      confidence: 0.92,
    });
    totalWeight += 15;
  } else if (driverAge > 60) {
    factors.push({
      name: "Driver Age",
      impact: "negative",
      weight: 10,
      description: "Senior drivers may have slower reaction times",
      confidence: 0.88,
    });
    totalWeight += 10;
  } else {
    factors.push({
      name: "Driver Age",
      impact: "positive",
      weight: -5,
      description: "Experienced age group with lower risk",
      confidence: 0.92,
    });
    totalWeight -= 5;
  }

  // Driving experience factor
  const experience = customerData.drivingExperience;
  if (experience < 3) {
    factors.push({
      name: "Driving Experience",
      impact: "negative",
      weight: 12,
      description: "Less than 3 years of driving experience",
      confidence: 0.88,
    });
    totalWeight += 12;
  } else if (experience > 10) {
    factors.push({
      name: "Driving Experience",
      impact: "positive",
      weight: -8,
      description: "Over 10 years of safe driving assumed",
      confidence: 0.85,
    });
    totalWeight -= 8;
  } else {
    factors.push({
      name: "Driving Experience",
      impact: "neutral",
      weight: 0,
      description: "Average driving experience",
      confidence: 0.90,
    });
  }

  // Vehicle age factor
  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - vehicleData.year;
  if (vehicleAge > 7) {
    factors.push({
      name: "Vehicle Age",
      impact: "negative",
      weight: 8,
      description: "Older vehicles may have higher maintenance issues",
      confidence: 0.95,
    });
    totalWeight += 8;
  } else if (vehicleAge < 2) {
    factors.push({
      name: "Vehicle Age",
      impact: "positive",
      weight: -3,
      description: "New vehicle with modern safety features",
      confidence: 0.95,
    });
    totalWeight -= 3;
  } else {
    factors.push({
      name: "Vehicle Age",
      impact: "neutral",
      weight: 0,
      description: "Vehicle in standard age range",
      confidence: 0.95,
    });
  }

  // Usage type factor
  if (vehicleData.usage === "commercial") {
    factors.push({
      name: "Usage Type",
      impact: "negative",
      weight: 20,
      description: "Commercial use increases exposure and risk",
      confidence: 0.98,
    });
    totalWeight += 20;
  } else {
    factors.push({
      name: "Usage Type",
      impact: "positive",
      weight: -5,
      description: "Personal use with lower mileage expected",
      confidence: 0.98,
    });
    totalWeight -= 5;
  }

  // Calculate risk score
  const riskScore = Math.min(100, Math.max(0, 50 + totalWeight));
  const riskLevel: RiskLevel =
    riskScore < 40 ? "low" : riskScore > 70 ? "high" : "standard";

  return {
    score: riskScore,
    level: riskLevel,
    factors,
  };
}

export function calculateFinalPremium(
  basePremium: number,
  riskAssessment: RiskAssessment
): { finalPremium: number; adjustments: PricingAdjustment[] } {
  const totalRiskAdjustment = riskAssessment.factors.reduce(
    (sum, factor) => sum + factor.weight,
    0
  );
  const riskAdjustmentAmount = basePremium * (totalRiskAdjustment / 100);

  const adjustments: PricingAdjustment[] = [
    {
      type: riskAdjustmentAmount >= 0 ? "surcharge" : "discount",
      reason: "Risk factors adjustment",
      percentage: totalRiskAdjustment,
      amount: riskAdjustmentAmount,
    },
    {
      type: "discount",
      reason: "No claims discount (assumed)",
      percentage: -10,
      amount: -basePremium * 0.1,
    },
  ];

  const finalPremium =
    basePremium + adjustments.reduce((sum, adj) => sum + adj.amount, 0);

  return { finalPremium, adjustments };
}

// Format utilities
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
