// DynamoDB Table Names
export const TABLES = {
  CONVERSATIONS: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-conversations`
    : "tasco-conversations",
  MESSAGES: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-messages`
    : "tasco-messages",
  ENTITIES: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-entities`
    : "tasco-entities",
  DOCUMENTS: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-documents`
    : "tasco-documents",
  NOTIFICATIONS: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-notifications`
    : "tasco-notifications",
  COURSES: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-courses`
    : "tasco-courses",
  SALES_ORDERS: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-sales-orders`
    : "tasco-sales-orders",
  SALES_ORDER_ACTIVITY: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-sales-order-activity`
    : "tasco-sales-order-activity",
  SALES_ORDER_METRICS: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-sales-order-metrics`
    : "tasco-sales-order-metrics",
  // Customer Lifecycle tables
  LEADS: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-leads`
    : "tasco-leads",
  CUSTOMERS: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-customers`
    : "tasco-customers",
  INTERACTIONS: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-interactions`
    : "tasco-interactions",
  PURCHASES: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-purchases`
    : "tasco-purchases",
  CAMPAIGNS: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-campaigns`
    : "tasco-campaigns",
  AI_RECOMMENDATIONS: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-ai-recommendations`
    : "tasco-ai-recommendations",
  // Users table
  USERS: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-users`
    : "tasco-users",
  // App guides table (feature showcase / help carousel)
  APP_GUIDES: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-app-guides`
    : "tasco-app-guides",
  // Promotions table (promotion-control app)
  PROMOTIONS: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-promotions`
    : "tasco-promotions",
  // Risk Radar tables (risk-radar app)
  RISK_METRICS: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-risk-metrics`
    : "tasco-risk-metrics",
  RISK_ALERTS: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-risk-alerts`
    : "tasco-risk-alerts",
  // Data Sync tables (data-sync app)
  SYNC_SYSTEMS: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-sync-systems`
    : "tasco-sync-systems",
  SYNC_METRICS: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-sync-metrics`
    : "tasco-sync-metrics",
} as const;

// Key prefixes for composite keys
export const KEY_PREFIXES = {
  CONVERSATION: "CONV",
  MESSAGE: "MSG",
  ENTITY: "ENT",
  DOCUMENT: "DOC",
  // Course-related prefixes
  COURSE: "COURSE",
  MODULE: "MODULE",
  LESSON: "LESSON",
  QUIZ: "QUIZ",
  QUESTION: "QUESTION",
  PROGRESS: "PROGRESS",
  ATTEMPT: "ATTEMPT",
  // Sales order prefixes
  ORDER: "ORD",
  ACTIVITY: "ACT",
  METRIC: "MET",
  // Customer lifecycle prefixes
  LEAD: "LEAD",
  CUSTOMER: "CUST",
  INTERACTION: "INT",
  PURCHASE: "PUR",
  CAMPAIGN: "CAMP",
  RECOMMENDATION: "REC",
  // User prefix
  USER: "USER",
  // Promotion prefix
  PROMOTION: "PROMO",
  // Risk Radar prefixes
  RISK_METRIC: "RMET",
  RISK_ALERT: "RALT",
  // Data Sync prefixes
  SYNC_SYSTEM: "SSYS",
  SYNC_METRIC: "SMET",
} as const;

// Helper to build partition keys
export const buildConversationPK = (appId: string, entityId: string): string =>
  `${KEY_PREFIXES.CONVERSATION}#${appId}#${entityId}`;

export const buildMessagePK = (conversationId: string): string =>
  `${KEY_PREFIXES.MESSAGE}#${conversationId}`;

export const buildMessageSK = (timestamp: string, messageId: string): string =>
  `${timestamp}#${messageId}`;

// Entity key builders (simple key structure - pk is type, sk is id)
export const buildEntityPK = (type: string): string =>
  `${KEY_PREFIXES.ENTITY}#${type}`;

export const ENTITY_ALL_PK = `${KEY_PREFIXES.ENTITY}#ALL`;

// ============================================
// Course key builders
// ============================================

// Course: pk = APP#{appId}#{entityId}, sk = COURSE#{courseId}
export const buildCourseListPK = (appId: string, entityId: string): string =>
  `APP#${appId}#${entityId}`;

export const buildCourseSK = (courseId: string): string =>
  `${KEY_PREFIXES.COURSE}#${courseId}`;

// Module: pk = COURSE#{courseId}, sk = MODULE#{order}#{moduleId}
export const buildModulePK = (courseId: string): string =>
  `${KEY_PREFIXES.COURSE}#${courseId}`;

export const buildModuleSK = (order: number, moduleId: string): string =>
  `${KEY_PREFIXES.MODULE}#${String(order).padStart(3, "0")}#${moduleId}`;

// Lesson: pk = MODULE#{moduleId}, sk = LESSON#{order}#{lessonId}
export const buildLessonPK = (moduleId: string): string =>
  `${KEY_PREFIXES.MODULE}#${moduleId}`;

export const buildLessonSK = (order: number, lessonId: string): string =>
  `${KEY_PREFIXES.LESSON}#${String(order).padStart(3, "0")}#${lessonId}`;

// Quiz: pk = MODULE#{moduleId}, sk = QUIZ#{quizId}
export const buildQuizPK = (moduleId: string): string =>
  `${KEY_PREFIXES.MODULE}#${moduleId}`;

export const buildQuizSK = (quizId: string): string =>
  `${KEY_PREFIXES.QUIZ}#${quizId}`;

// QuizQuestion: pk = QUIZ#{quizId}, sk = QUESTION#{order}#{questionId}
export const buildQuestionPK = (quizId: string): string =>
  `${KEY_PREFIXES.QUIZ}#${quizId}`;

export const buildQuestionSK = (order: number, questionId: string): string =>
  `${KEY_PREFIXES.QUESTION}#${String(order).padStart(3, "0")}#${questionId}`;

// ============================================
// Progress key builders (userId-based)
// ============================================

// UserCourseProgress: pk = USER#{userId}, sk = PROGRESS#COURSE#{courseId}
export const buildUserProgressPK = (userId: string): string =>
  `USER#${userId}`;

export const buildCourseProgressSK = (courseId: string): string =>
  `${KEY_PREFIXES.PROGRESS}#${KEY_PREFIXES.COURSE}#${courseId}`;

// UserModuleProgress: pk = USER#{userId}, sk = PROGRESS#MODULE#{moduleId}
export const buildModuleProgressSK = (moduleId: string): string =>
  `${KEY_PREFIXES.PROGRESS}#${KEY_PREFIXES.MODULE}#${moduleId}`;

// UserLessonProgress: pk = USER#{userId}, sk = PROGRESS#LESSON#{lessonId}
export const buildLessonProgressSK = (lessonId: string): string =>
  `${KEY_PREFIXES.PROGRESS}#${KEY_PREFIXES.LESSON}#${lessonId}`;

// QuizAttempt: pk = USER#{userId}, sk = ATTEMPT#QUIZ#{quizId}#{attemptId}
export const buildQuizAttemptSK = (quizId: string, attemptId: string): string =>
  `${KEY_PREFIXES.ATTEMPT}#${KEY_PREFIXES.QUIZ}#${quizId}#${attemptId}`;

// ============================================
// Sales Order key builders
// ============================================

// Activity: pk = ORDER#{orderId}, sk = {timestamp}#{activityId}
export const buildActivityPK = (orderId: string): string =>
  `${KEY_PREFIXES.ORDER}#${orderId}`;

export const buildActivitySK = (timestamp: string, activityId: string): string =>
  `${timestamp}#${activityId}`;

// Metrics: pk = {metricType}#{date}, sk = {entityId}
export const buildMetricsPK = (metricType: string, date: string): string =>
  `${KEY_PREFIXES.METRIC}#${metricType}#${date}`;

export const buildMetricsSK = (entityId: string): string =>
  entityId;

// ============================================
// Customer Lifecycle key builders
// ============================================

// Lead: pk = LEAD#{leadId}, sk = METADATA
export const buildLeadPK = (leadId: string): string =>
  `${KEY_PREFIXES.LEAD}#${leadId}`;

export const LEAD_METADATA_SK = "METADATA";

// Customer: pk = CUST#{customerId}, sk = METADATA
export const buildCustomerPK = (customerId: string): string =>
  `${KEY_PREFIXES.CUSTOMER}#${customerId}`;

export const CUSTOMER_METADATA_SK = "METADATA";

// Interaction: pk = INT#{leadId or customerId}, sk = {timestamp}#{interactionId}
export const buildInteractionPK = (relatedId: string): string =>
  `${KEY_PREFIXES.INTERACTION}#${relatedId}`;

export const buildInteractionSK = (timestamp: string, interactionId: string): string =>
  `${timestamp}#${interactionId}`;

// Purchase: pk = CUST#{customerId}, sk = PUR#{timestamp}#{purchaseId}
export const buildPurchasePK = (customerId: string): string =>
  `${KEY_PREFIXES.CUSTOMER}#${customerId}`;

export const buildPurchaseSK = (timestamp: string, purchaseId: string): string =>
  `${KEY_PREFIXES.PURCHASE}#${timestamp}#${purchaseId}`;

// Campaign: pk = CAMP#{campaignId}, sk = METADATA
export const buildCampaignPK = (campaignId: string): string =>
  `${KEY_PREFIXES.CAMPAIGN}#${campaignId}`;

export const CAMPAIGN_METADATA_SK = "METADATA";

// AI Recommendation: pk = REC#{targetId}, sk = {timestamp}#{recommendationId}
export const buildRecommendationPK = (targetId: string): string =>
  `${KEY_PREFIXES.RECOMMENDATION}#${targetId}`;

export const buildRecommendationSK = (timestamp: string, recommendationId: string): string =>
  `${timestamp}#${recommendationId}`;

// ============================================
// User key builders
// ============================================

// User: pk = USER#{userId}, sk = METADATA
export const buildUserPK = (userId: string): string =>
  `${KEY_PREFIXES.USER}#${userId}`;

export const USER_METADATA_SK = "METADATA";

// ============================================
// Risk Radar key builders
// ============================================

// Risk Metric: pk = RMET#{entityId}, sk = {period}#{productType}
export const buildRiskMetricPK = (entityId: string): string =>
  `${KEY_PREFIXES.RISK_METRIC}#${entityId}`;

export const buildRiskMetricSK = (period: string, productType: string): string =>
  `${period}#${productType}`;

// Risk Alert: pk = RALT#{entityId}, sk = {timestamp}#{alertId}
export const buildRiskAlertPK = (entityId: string): string =>
  `${KEY_PREFIXES.RISK_ALERT}#${entityId}`;

export const buildRiskAlertSK = (timestamp: string, alertId: string): string =>
  `${timestamp}#${alertId}`;

// All alerts index: pk = RALT#ALL, sk = {timestamp}#{alertId}
export const RISK_ALERT_ALL_PK = `${KEY_PREFIXES.RISK_ALERT}#ALL`;

// ============================================
// Data Sync key builders
// ============================================

// Sync System: pk = SSYS#{appId}, sk = {systemId}
export const buildSyncSystemPK = (appId: string): string =>
  `${KEY_PREFIXES.SYNC_SYSTEM}#${appId}`;

export const buildSyncSystemSK = (systemId: string): string =>
  systemId;

// All systems for an app: pk = SSYS#{appId}
export const SYNC_SYSTEM_ALL_PK = (appId: string) =>
  `${KEY_PREFIXES.SYNC_SYSTEM}#${appId}`;

// Sync Metric: pk = SMET#{systemId}, sk = {date}#{hour}
export const buildSyncMetricPK = (systemId: string): string =>
  `${KEY_PREFIXES.SYNC_METRIC}#${systemId}`;

export const buildSyncMetricSK = (date: string, hour?: string): string =>
  hour ? `${date}#${hour}` : date;

// Global metrics: pk = SMET#GLOBAL, sk = {date}
export const SYNC_METRIC_GLOBAL_PK = `${KEY_PREFIXES.SYNC_METRIC}#GLOBAL`;
