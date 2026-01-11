/**
 * Data layer abstraction for Customer Lifecycle app
 *
 * Uses DynamoDB tables for:
 * - Entities (showrooms)
 * - Chat conversations & messages
 * - Notifications
 * - Leads
 * - Customers
 * - Interactions
 * - Purchases
 * - Campaigns
 * - AI Recommendations
 */

import {
  // Entities
  listEntities,
  getEntity,
  type Entity,
  // Chat
  createConversation,
  getConversation,
  listConversations,
  createMessage,
  listMessages,
  type Conversation,
  type Message,
  type CreateConversationInput,
  type CreateMessageInput,
  // Notifications
  createNotification,
  getNotifications,
  markNotificationAsRead,
  getUnreadNotificationCount,
  type Notification,
  type CreateNotificationInput,
  // Users
  getUserById,
  getUserByEmail,
  getAllUsers,
  getUsersByEntity,
  getUsersByRole,
  getActiveUsers,
  type User,
  // Customer Lifecycle
  getAllLeads as dbGetAllLeads,
  getLeadById as dbGetLeadById,
  getLeadsByEntity,
  getLeadsByPriority,
  getLeadsByStatus,
  getLeadStats as dbGetLeadStats,
  type Lead,
  getAllCustomers as dbGetAllCustomers,
  getCustomerById as dbGetCustomerById,
  getCustomersByEntity,
  getCustomersBySegment,
  getAtRiskCustomers as dbGetAtRiskCustomers,
  getCustomerStats as dbGetCustomerStats,
  type Customer,
  getInteractionsByLeadId as dbGetInteractionsByLeadId,
  getInteractionsByCustomerId as dbGetInteractionsByCustomerId,
  getInteractionsBySentiment,
  type Interaction,
  getPurchasesByCustomerId as dbGetPurchasesByCustomerId,
  getPurchasesByEntity,
  getPurchaseStats,
  type Purchase,
  getAllCampaigns as dbGetAllCampaigns,
  getCampaignById as dbGetCampaignById,
  getActiveCampaigns as dbGetActiveCampaigns,
  getCampaignsByEntity,
  getCampaignStats as dbGetCampaignStats,
  type Campaign,
  getRecommendationsByTargetId,
  getHighConfidenceRecommendations as dbGetHighConfidenceRecommendations,
  getRecommendationsByType,
  type AIRecommendation,
  // Enums
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
  // Enum helpers
  LEAD_SOURCES,
  LEAD_STATUSES,
  LEAD_PRIORITIES,
  CUSTOMER_STAGES,
  CUSTOMER_SEGMENTS,
  INTERACTION_TYPES,
  INTERACTION_CHANNELS,
  SENTIMENTS,
  PAYMENT_METHODS,
  CAMPAIGN_TYPES,
  CAMPAIGN_STATUSES,
  TARGET_TYPES,
  RECOMMENDATION_TYPES,
  RECOMMENDATION_PRIORITIES,
  RECOMMENDATION_STATUSES,
} from "@tasco/db";

// ============================================
// CONSTANTS
// ============================================

const APP_ID = "customer-lifecycle";

// ============================================
// ENTITIES (from DynamoDB)
// ============================================

/**
 * Get all entities (showrooms/locations)
 */
export async function getAllEntities(limit = 100): Promise<Entity[]> {
  const result = await listEntities(limit);
  return result.items;
}

/**
 * Get a single entity by ID
 */
export async function getEntityById(entityId: string): Promise<Entity | null> {
  return await getEntity(entityId);
}

// ============================================
// CHAT (from DynamoDB)
// ============================================

/**
 * Create a new conversation
 */
export async function createChatConversation(
  entityId: string,
  userId: string,
  title?: string
): Promise<Conversation> {
  const input: CreateConversationInput = {
    appId: APP_ID,
    entityId,
    userId,
    title: title || "Customer Lifecycle Chat",
  };
  return await createConversation(input);
}

/**
 * Get a conversation by ID
 */
export async function getChatConversation(
  conversationId: string,
  appId: string = "customer-lifecycle",
  entityId: string = "default"
): Promise<Conversation | null> {
  return await getConversation(appId, entityId, conversationId);
}

/**
 * List conversations for entity
 */
export async function listChatConversations(
  entityId: string,
  limit = 20
): Promise<Conversation[]> {
  const result = await listConversations(APP_ID, entityId, limit);
  return result.items;
}

/**
 * Add message to conversation
 */
export async function addChatMessage(
  conversationId: string,
  role: "user" | "assistant" | "system",
  content: string,
  metadata?: Record<string, unknown>
): Promise<Message> {
  const input: CreateMessageInput = {
    conversationId,
    role,
    content,
    metadata,
  };
  return await createMessage(input);
}

/**
 * Get messages for conversation
 */
export async function getChatMessages(
  conversationId: string,
  limit = 50
): Promise<Message[]> {
  const result = await listMessages(conversationId, limit);
  return result.items;
}

// ============================================
// NOTIFICATIONS (from DynamoDB)
// ============================================

/**
 * Create a notification
 */
export async function createAppNotification(
  input: Omit<CreateNotificationInput, "appId">
): Promise<Notification> {
  return await createNotification({
    ...input,
    appId: APP_ID,
  });
}

/**
 * Get notifications for app
 */
export async function getAppNotifications(
  limit = 20
): Promise<Notification[]> {
  return await getNotifications(APP_ID, limit);
}

/**
 * Mark notification as read
 */
export async function markAppNotificationAsRead(
  timestamp: string,
  id: string
): Promise<boolean> {
  return await markNotificationAsRead(APP_ID, timestamp, id);
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCountForApp(): Promise<number> {
  return await getUnreadNotificationCount(APP_ID);
}

// ============================================
// LEADS (from DynamoDB)
// ============================================

/**
 * Get all leads
 */
export async function getAllLeads(): Promise<Lead[]> {
  const result = await dbGetAllLeads();
  return result.items;
}

/**
 * Get leads by entity (showroom)
 */
export async function getLeadsByEntityId(entityId: string): Promise<Lead[]> {
  return await getLeadsByEntity(entityId);
}

/**
 * Get leads by status
 */
export async function getLeadsByStatusType(
  status: Lead["status"]
): Promise<Lead[]> {
  return await getLeadsByStatus(status);
}

/**
 * Get leads by priority
 */
export async function getLeadsByPriorityLevel(
  priority: Lead["priority"]
): Promise<Lead[]> {
  return await getLeadsByPriority(priority);
}

/**
 * Get single lead by ID
 */
export async function getLeadById(leadId: string): Promise<Lead | null> {
  return await dbGetLeadById(leadId);
}

/**
 * Get lead statistics
 */
export async function getLeadStats() {
  return await dbGetLeadStats();
}

// ============================================
// CUSTOMERS (from DynamoDB)
// ============================================

/**
 * Get all customers
 */
export async function getAllCustomers(): Promise<Customer[]> {
  const result = await dbGetAllCustomers();
  return result.items;
}

/**
 * Get customers by entity (showroom)
 */
export async function getCustomersByEntityId(
  entityId: string
): Promise<Customer[]> {
  return await getCustomersByEntity(entityId);
}

/**
 * Get customers by segment
 */
export async function getCustomersBySegmentType(
  segment: Customer["insights"]["segment"]
): Promise<Customer[]> {
  return await getCustomersBySegment(segment);
}

/**
 * Get single customer by ID
 */
export async function getCustomerById(
  customerId: string
): Promise<Customer | null> {
  return await dbGetCustomerById(customerId);
}

/**
 * Get at-risk customers (churn risk > 0.7)
 */
export async function getAtRiskCustomers(): Promise<Customer[]> {
  return await dbGetAtRiskCustomers();
}

/**
 * Get VIP customers
 */
export async function getVIPCustomers(): Promise<Customer[]> {
  return await getCustomersBySegment("vip");
}

/**
 * Get customer statistics
 */
export async function getCustomerStats() {
  return await dbGetCustomerStats();
}

// ============================================
// INTERACTIONS (from DynamoDB)
// ============================================

/**
 * Get interactions by customer
 */
export async function getInteractionsByCustomerId(
  customerId: string
): Promise<Interaction[]> {
  return await dbGetInteractionsByCustomerId(customerId);
}

/**
 * Get interactions by lead
 */
export async function getInteractionsByLeadId(
  leadId: string
): Promise<Interaction[]> {
  return await dbGetInteractionsByLeadId(leadId);
}

/**
 * Get negative sentiment interactions
 */
export async function getNegativeSentimentInteractions(): Promise<
  Interaction[]
> {
  return await getInteractionsBySentiment("negative");
}

// ============================================
// PURCHASES (from DynamoDB)
// ============================================

/**
 * Get purchases by customer
 */
export async function getPurchasesByCustomerId(
  customerId: string
): Promise<Purchase[]> {
  return await dbGetPurchasesByCustomerId(customerId);
}

/**
 * Get purchases by entity (showroom)
 */
export async function getPurchasesByEntityId(
  entityId: string
): Promise<Purchase[]> {
  return await getPurchasesByEntity(entityId);
}

/**
 * Get purchase statistics
 */
export async function getPurchaseStatsData() {
  return await getPurchaseStats();
}

// ============================================
// CAMPAIGNS (from DynamoDB)
// ============================================

/**
 * Get all campaigns
 */
export async function getAllCampaigns(): Promise<Campaign[]> {
  return await dbGetAllCampaigns();
}

/**
 * Get campaigns by entity (showroom)
 */
export async function getCampaignsByEntityId(
  entityId: string
): Promise<Campaign[]> {
  return await getCampaignsByEntity(entityId);
}

/**
 * Get active campaigns
 */
export async function getActiveCampaigns(): Promise<Campaign[]> {
  return await dbGetActiveCampaigns();
}

/**
 * Get campaign by ID
 */
export async function getCampaignById(
  campaignId: string
): Promise<Campaign | null> {
  return await dbGetCampaignById(campaignId);
}

/**
 * Get campaign statistics
 */
export async function getCampaignStats() {
  return await dbGetCampaignStats();
}

// ============================================
// AI RECOMMENDATIONS (from DynamoDB)
// ============================================

/**
 * Get recommendations by target (lead or customer)
 */
export async function getRecommendationsByTargetIdAndType(
  targetId: string
): Promise<AIRecommendation[]> {
  return await getRecommendationsByTargetId(targetId);
}

/**
 * Get high-confidence recommendations (confidence > 0.7)
 */
export async function getHighConfidenceRecommendations(): Promise<
  AIRecommendation[]
> {
  return await dbGetHighConfidenceRecommendations();
}

/**
 * Get recommendations by type
 */
export async function getRecommendationsByTypeFilter(
  type: AIRecommendation["type"]
): Promise<AIRecommendation[]> {
  return await getRecommendationsByType(type);
}

// ============================================
// DASHBOARD STATISTICS
// ============================================

/**
 * Get comprehensive dashboard statistics
 */
export async function getDashboardStats() {
  const [leadStats, customerStats, campaignStats] = await Promise.all([
    getLeadStats(),
    getCustomerStats(),
    getCampaignStats(),
  ]);

  return {
    leads: leadStats,
    customers: customerStats,
    campaigns: campaignStats,
  };
}

// ============================================
// USER OPERATIONS
// ============================================

/**
 * Get user by ID
 */
export { getUserById, getUserByEmail, getAllUsers, getUsersByEntity, getUsersByRole, getActiveUsers };

// ============================================
// TYPES RE-EXPORTS
// ============================================

export type {
  // DynamoDB types
  Entity,
  Conversation,
  Message,
  Notification,
  User,
  // Customer Lifecycle types
  Lead,
  Customer,
  Interaction,
  Purchase,
  Campaign,
  AIRecommendation,
};

// ============================================
// ENUMS RE-EXPORTS
// ============================================

export {
  // Lead Enums
  LeadSource,
  LeadStatus,
  LeadPriority,
  // Customer Enums
  CustomerStage,
  CustomerSegment,
  // Interaction Enums
  InteractionType,
  InteractionChannel,
  Sentiment,
  // Purchase Enums
  PaymentMethod,
  // Campaign Enums
  CampaignType,
  CampaignStatus,
  // Recommendation Enums
  TargetType,
  RecommendationType,
  RecommendationPriority,
  RecommendationStatus,
  // Enum value arrays
  LEAD_SOURCES,
  LEAD_STATUSES,
  LEAD_PRIORITIES,
  CUSTOMER_STAGES,
  CUSTOMER_SEGMENTS,
  INTERACTION_TYPES,
  INTERACTION_CHANNELS,
  SENTIMENTS,
  PAYMENT_METHODS,
  CAMPAIGN_TYPES,
  CAMPAIGN_STATUSES,
  TARGET_TYPES,
  RECOMMENDATION_TYPES,
  RECOMMENDATION_PRIORITIES,
  RECOMMENDATION_STATUSES,
};

// ============================================
// CONFIG RE-EXPORT
// ============================================

export * from "./config";
