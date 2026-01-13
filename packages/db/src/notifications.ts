import { PutCommand, QueryCommand, DeleteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "./client";
import { TABLES } from "./tables";

// Types
export type NotificationType =
  | "created"
  | "updated"
  | "deleted"
  | "assigned"     // Lead assigned to rep
  | "converted"    // Lead converted to customer
  | "alert"        // General alert (sentiment, churn risk)
  | "launched"     // Campaign launched
  | "completed"    // Campaign completed
  | "sentiment"    // Negative sentiment detected
  // Data Sync specific types
  | "sync_missing"     // Record missing in target system
  | "sync_mismatch"    // Data mismatch between systems
  | "sync_delayed"     // Sync delayed beyond threshold
  | "sync_connection"  // Connection error
  | "sync_resolved";   // Sync issue resolved

export type NotificationCategory =
  | "conversation"
  | "entity"
  | "document"
  | "lead"         // Lead-related notifications
  | "customer"     // Customer-related notifications
  | "campaign"     // Campaign-related notifications
  | "interaction"  // Interaction-related notifications
  | "inventory"    // Vehicle inventory notifications
  | "order"        // Import order notifications
  | "system"       // System notifications
  | "sync";        // Data sync notifications

export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export interface NotificationMetadata {
  leadId?: string;
  customerId?: string;
  campaignId?: string;
  interactionId?: string;
  score?: number;
  sentiment?: string;
  // Data Sync specific metadata
  sourceSystem?: string;
  targetSystem?: string;
  affectedRecordId?: string;
  affectedRecordType?: string;
  expectedValue?: string;
  actualValue?: string;
  affectedRecords?: number;
  [key: string]: unknown;
}

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message?: string;          // Optional detailed message
  timestamp: string;          // ISO string
  read: boolean;
  appId?: string;
  entityId?: string;          // Showroom/entity context
  priority?: NotificationPriority;
  actionUrl?: string;         // Deep link to relevant page
  metadata?: NotificationMetadata;
}

export interface CreateNotificationInput {
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message?: string;
  appId?: string;
  entityId?: string;
  priority?: NotificationPriority;
  actionUrl?: string;
  metadata?: NotificationMetadata;
}

// Constants
const APP_ID = "compliance-qa";

/**
 * Create a new notification
 */
export async function createNotification(input: CreateNotificationInput): Promise<Notification> {
  const appId = input.appId || APP_ID;
  const timestamp = new Date().toISOString();
  const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const notification: Notification = {
    id,
    type: input.type,
    category: input.category,
    title: input.title,
    message: input.message,
    timestamp,
    read: false,
    appId,
    entityId: input.entityId,
    priority: input.priority,
    actionUrl: input.actionUrl,
    metadata: input.metadata,
  };

  const command = new PutCommand({
    TableName: TABLES.NOTIFICATIONS,
    Item: {
      pk: `APP#${appId}`,
      sk: `${timestamp}#${id}`,
      ...notification,
    },
  });

  await docClient.send(command);
  return notification;
}

/**
 * Get notifications for an app (most recent first)
 */
export async function getNotifications(appId: string = APP_ID, limit: number = 20): Promise<Notification[]> {
  const command = new QueryCommand({
    TableName: TABLES.NOTIFICATIONS,
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: {
      ":pk": `APP#${appId}`,
    },
    ScanIndexForward: false, // Most recent first
    Limit: limit,
  });

  const result = await docClient.send(command);

  return (result.Items || []).map((item) => ({
    id: item.id,
    type: item.type,
    category: item.category,
    title: item.title,
    message: item.message,
    timestamp: item.timestamp,
    read: item.read,
    appId: item.appId,
    entityId: item.entityId,
    priority: item.priority,
    actionUrl: item.actionUrl,
    metadata: item.metadata,
  }));
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(appId: string, timestamp: string, id: string): Promise<boolean> {
  const command = new UpdateCommand({
    TableName: TABLES.NOTIFICATIONS,
    Key: {
      pk: `APP#${appId}`,
      sk: `${timestamp}#${id}`,
    },
    UpdateExpression: "SET #read = :read",
    ExpressionAttributeNames: {
      "#read": "read",
    },
    ExpressionAttributeValues: {
      ":read": true,
    },
  });

  try {
    await docClient.send(command);
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
}

/**
 * Mark all notifications as read for an app
 */
export async function markAllNotificationsAsRead(appId: string = APP_ID): Promise<boolean> {
  // First get all unread notifications
  const notifications = await getNotifications(appId, 50);
  const unread = notifications.filter((n) => !n.read);

  // Update each one
  const updatePromises = unread.map((n) =>
    markNotificationAsRead(appId, n.timestamp, n.id)
  );

  try {
    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(appId: string, timestamp: string, id: string): Promise<boolean> {
  const command = new DeleteCommand({
    TableName: TABLES.NOTIFICATIONS,
    Key: {
      pk: `APP#${appId}`,
      sk: `${timestamp}#${id}`,
    },
  });

  try {
    await docClient.send(command);
    return true;
  } catch (error) {
    console.error("Error deleting notification:", error);
    return false;
  }
}

/**
 * Clear all notifications for an app (delete all)
 */
export async function clearAllNotifications(appId: string = APP_ID): Promise<boolean> {
  // Get all notifications
  const notifications = await getNotifications(appId, 100);

  // Delete each one
  const deletePromises = notifications.map((n) =>
    deleteNotification(appId, n.timestamp, n.id)
  );

  try {
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error("Error clearing notifications:", error);
    return false;
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(appId: string = APP_ID): Promise<number> {
  const notifications = await getNotifications(appId, 50);
  return notifications.filter((n) => !n.read).length;
}
