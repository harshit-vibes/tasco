/**
 * Chat data types for DynamoDB persistence
 */

export interface Conversation {
  id: string;
  appId: string;
  entityId: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
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
}

export interface Citation {
  id: string;
  documentName: string;
  page?: number;
  excerpt: string;
}

/**
 * Location information for precise citation references
 */
export interface CitationLocation {
  /** Document section number (e.g., "4.2") */
  section?: string;
  /** Page number in the original document */
  page?: number;
  /** Start line number for text documents */
  lineStart?: number;
  /** End line number for text documents */
  lineEnd?: number;
  /** Character position start (for highlighting) */
  charStart?: number;
  /** Character position end (for highlighting) */
  charEnd?: number;
}

/**
 * Enhanced citation with document linking and metadata
 * Extends basic Citation for backward compatibility
 */
export interface EnhancedCitation extends Citation {
  /** Document ID for linking to knowledge base */
  documentId: string;
  /** Filename in storage */
  filename?: string;
  /** Location information for deep linking */
  location?: CitationLocation;
  /** Text before the excerpt for context */
  contextBefore?: string;
  /** Text after the excerpt for context */
  contextAfter?: string;
  /** Citation metadata */
  metadata?: {
    /** Relevance score from RAG (0-1) */
    relevanceScore?: number;
    /** Document category */
    category?: string;
    /** Entity the document belongs to */
    entityId?: string;
  };
  /** Deep link to knowledge base page */
  href?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: Citation[];
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface CreateMessageInput {
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: Citation[];
  metadata?: Record<string, unknown>;
}

export interface PaginatedResult<T> {
  items: T[];
  lastEvaluatedKey?: Record<string, unknown>;
  hasMore: boolean;
}

// DynamoDB item types (internal)
export interface ConversationItem {
  pk: string;
  sk: string;
  id: string;
  appId: string;
  entityId: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface MessageItem {
  pk: string;
  sk: string;
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: Citation[];
  createdAt: string;
  metadata?: Record<string, unknown>;
}
