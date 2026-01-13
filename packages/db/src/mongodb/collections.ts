/**
 * MongoDB Collection Names and Accessors
 */

import { Collection } from "mongodb";
import { getCollection } from "./client";
import type {
  ConversationDocument,
  MessageDocument,
  DocumentDocument,
  EntityDocument,
  NotificationDocument,
  AppGuideDocument,
} from "./types";

// Collection names
export const COLLECTIONS = {
  CONVERSATIONS: "conversations",
  MESSAGES: "messages",
  DOCUMENTS: "documents",
  ENTITIES: "entities",
  NOTIFICATIONS: "notifications",
  APP_GUIDES: "appGuides",
} as const;

// Typed collection accessors
export async function getConversationsCollection(): Promise<
  Collection<ConversationDocument>
> {
  return getCollection<ConversationDocument>(COLLECTIONS.CONVERSATIONS);
}

export async function getMessagesCollection(): Promise<
  Collection<MessageDocument>
> {
  return getCollection<MessageDocument>(COLLECTIONS.MESSAGES);
}

export async function getDocumentsCollection(): Promise<
  Collection<DocumentDocument>
> {
  return getCollection<DocumentDocument>(COLLECTIONS.DOCUMENTS);
}

export async function getEntitiesCollection(): Promise<
  Collection<EntityDocument>
> {
  return getCollection<EntityDocument>(COLLECTIONS.ENTITIES);
}

export async function getNotificationsCollection(): Promise<
  Collection<NotificationDocument>
> {
  return getCollection<NotificationDocument>(COLLECTIONS.NOTIFICATIONS);
}

export async function getAppGuidesCollection(): Promise<
  Collection<AppGuideDocument>
> {
  return getCollection<AppGuideDocument>(COLLECTIONS.APP_GUIDES);
}
