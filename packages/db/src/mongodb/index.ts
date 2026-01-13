/**
 * MongoDB Module Exports for compliance-qa
 *
 * This module provides MongoDB operations for the compliance-qa app,
 * as part of the migration from DynamoDB.
 */

// Client exports
export {
  getMongoClient,
  getDb,
  getCollection,
  closeConnection,
  healthCheck,
  generateId,
  toObjectId,
  ObjectId,
} from "./client";

// Collection exports
export {
  COLLECTIONS,
  getConversationsCollection,
  getMessagesCollection,
  getDocumentsCollection,
  getEntitiesCollection,
  getNotificationsCollection,
  getAppGuidesCollection,
} from "./collections";

// Type exports
export type {
  // Conversation types
  ConversationDocument,
  CreateConversationInput,
  UpdateConversationInput,
  // Message types
  MessageDocument,
  CreateMessageInput,
  Citation,
  CitationLocation,
  EnhancedCitation,
  ValidationResult,
  // Document types
  DocumentDocument,
  DocumentVersion,
  CreateDocumentInput as CreateDocInput,
  UpdateDocumentInput as UpdateDocInput,
  // Entity types
  EntityDocument,
  EntityType,
  EntityCategory,
  CreateEntityInput,
  // Notification types
  NotificationDocument,
  NotificationType,
  NotificationCategory,
  CreateNotificationInput,
  // Guide types
  AppGuideDocument,
  GuideSlide,
  GuideIconColor,
  OnePagerSection,
  AppOnePager,
  CreateAppGuideInput,
  // Pagination types
  PaginatedResult,
  PaginationOptions,
} from "./types";

// Conversation operations
export {
  createConversation,
  getConversation,
  listConversations,
  updateConversation,
  deleteConversation,
  incrementMessageCount,
  getConversationCount,
  type Conversation,
} from "./conversations";

// Message operations
export {
  createMessage,
  getMessage,
  listMessages,
  getAllMessages,
  deleteMessage,
  deleteConversationMessages,
  getMessageCount,
  getLastMessage,
  type Message,
} from "./messages";

// Document operations
export {
  createDocument,
  getDocumentById,
  getDocumentByFilename,
  listDocuments,
  listDocumentsByCategory,
  updateDocument,
  addDocumentVersion,
  deleteDocument,
  markDocumentSynced,
  getDocumentsPendingSync,
  getDocumentCount,
  type Document,
} from "./documents";

// Guide operations
export {
  getAppGuide,
  getAppGuides,
  putAppGuide,
  deleteAppGuide,
  appGuideExists,
  type AppGuide,
} from "./guides";
