/**
 * MongoDB Document Types for compliance-qa
 *
 * These types map DynamoDB structures to MongoDB documents.
 */

import { ObjectId } from "mongodb";

// ============================================
// Conversation Types
// ============================================

export interface ConversationDocument {
  _id?: ObjectId;
  appId: string;
  entityId: string;
  userId: string;
  title: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface CreateConversationInput {
  appId: string;
  entityId: string;
  userId: string;
  title?: string;
}

export interface UpdateConversationInput {
  title?: string;
  messageCount?: number;
  metadata?: Record<string, unknown>;
}

// ============================================
// Message Types
// ============================================

export interface CitationLocation {
  section?: string;
  page?: number;
  lineStart?: number;
  lineEnd?: number;
  charStart?: number;
  charEnd?: number;
}

export interface Citation {
  id: string;
  documentName: string;
  page?: number;
  excerpt: string;
}

export interface EnhancedCitation extends Citation {
  documentId: string;
  filename?: string;
  location?: CitationLocation;
  contextBefore?: string;
  contextAfter?: string;
  metadata?: {
    relevanceScore?: number;
    category?: string;
    entityId?: string;
  };
  href?: string;
}

export interface ValidationResult {
  score: number;
  rationale: string;
  hasCitations: boolean;
  citationQuality: number;
  responseCompleteness: number;
  isGrounded: boolean;
  confidence: "high" | "medium" | "low";
  complianceRisk?: "high" | "medium" | "low";
  potentialConflicts?: string[];
  missingClauses?: string[];
  lawArticlesCited?: string[];
}

export interface MessageDocument {
  _id?: ObjectId;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: Citation[];
  enhancedCitations?: EnhancedCitation[];
  validation?: ValidationResult;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

export interface CreateMessageInput {
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: Citation[];
  enhancedCitations?: EnhancedCitation[];
  validation?: ValidationResult;
  metadata?: Record<string, unknown>;
}

// ============================================
// Document (Knowledge Base) Types
// ============================================

export interface DocumentVersion {
  version: number;
  blobUrl: string;
  blobPathname: string;
  uploadedAt: Date;
  uploadedBy?: string;
  size?: number;
}

export interface DocumentDocument {
  _id?: ObjectId;
  appId: string;
  entityId: string;
  name: string;
  filename: string;
  category: string;
  description?: string;
  blobUrl: string;
  blobPathname: string;
  size?: number;
  mimeType?: string;
  versions: DocumentVersion[];
  currentVersion: number;
  ragDocumentId?: string;
  syncedToKB: boolean;
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface CreateDocumentInput {
  appId: string;
  entityId: string;
  name: string;
  filename: string;
  category: string;
  description?: string;
  blobUrl: string;
  blobPathname: string;
  size?: number;
  mimeType?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateDocumentInput {
  name?: string;
  category?: string;
  description?: string;
  blobUrl?: string;
  blobPathname?: string;
  ragDocumentId?: string;
  syncedToKB?: boolean;
  lastSyncedAt?: Date;
  metadata?: Record<string, unknown>;
}

// ============================================
// Entity Types
// ============================================

export type EntityType = "parent" | "holding" | "subsidiary";
export type EntityCategory = "auto" | "insurance" | "inochi" | "general";

export interface EntityDocument {
  _id?: ObjectId;
  entityId: string;
  name: string;
  shortName?: string;
  type: EntityType;
  category: EntityCategory;
  parentId?: string;
  logo?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEntityInput {
  entityId: string;
  name: string;
  shortName?: string;
  type: EntityType;
  category: EntityCategory;
  parentId?: string;
  logo?: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// Notification Types
// ============================================

export type NotificationType = "info" | "success" | "warning" | "error";
export type NotificationCategory =
  | "document"
  | "sync"
  | "chat"
  | "system"
  | "compliance";

export interface NotificationDocument {
  _id?: ObjectId;
  appId: string;
  entityId: string;
  userId?: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface CreateNotificationInput {
  appId: string;
  entityId: string;
  userId?: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

// ============================================
// App Guide Types
// ============================================

export type GuideIconColor = "blue" | "green" | "purple" | "orange" | "red";

export interface GuideSlide {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: GuideIconColor;
  features?: string[];
}

export interface OnePagerSection {
  title: string;
  content: string;
  icon?: string;
}

export interface AppOnePager {
  title: string;
  subtitle: string;
  sections: OnePagerSection[];
}

export interface AppGuideDocument {
  _id?: ObjectId;
  appId: string;
  slides: GuideSlide[];
  onePager?: AppOnePager;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAppGuideInput {
  appId: string;
  slides: GuideSlide[];
  onePager?: AppOnePager;
}

// ============================================
// Pagination Types
// ============================================

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
