// Notification store with DynamoDB persistence

export type NotificationType = "created" | "updated" | "deleted";
export type NotificationCategory = "conversation" | "entity" | "document";

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  timestamp: Date;
  read: boolean;
}

// Local cache (for UI responsiveness)
let notificationsCache: Notification[] = [];
let previousConversationIds: Set<string> = new Set();
let listeners: Set<() => void> = new Set();
let isInitialized = false;

/**
 * Initialize notifications from API (call once on app load)
 */
export async function initializeNotifications(): Promise<void> {
  if (isInitialized) return;

  try {
    const response = await fetch("/api/notifications");
    const data = await response.json();

    if (data.success && data.notifications) {
      notificationsCache = data.notifications.map((n: {
        id: string;
        type: NotificationType;
        category: NotificationCategory;
        title: string;
        timestamp: string;
        read: boolean;
      }) => ({
        ...n,
        timestamp: new Date(n.timestamp),
      }));
      isInitialized = true;
      notifyListeners();
    }
  } catch (error) {
    console.error("Failed to initialize notifications:", error);
  }
}

/**
 * Get notifications (from local cache)
 */
export function getNotifications(): Notification[] {
  return [...notificationsCache];
}

export function getPreviousConversationIds(): Set<string> {
  return previousConversationIds;
}

export function setPreviousConversationIds(ids: Set<string>): void {
  previousConversationIds = ids;
}

/**
 * Add notification (updates local cache and persists to API)
 */
export async function addNotification(notification: Notification): Promise<void> {
  // Update local cache immediately for responsiveness
  notificationsCache = [notification, ...notificationsCache].slice(0, 20);
  notifyListeners();

  // Persist to API in background
  try {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: notification.type,
        category: notification.category,
        title: notification.title,
      }),
    });
  } catch (error) {
    console.error("Failed to persist notification:", error);
    // Notification is still in local cache, so UI remains updated
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<void> {
  // Update local cache
  notificationsCache = notificationsCache.map((n) => ({ ...n, read: true }));
  notifyListeners();

  // Persist to API
  try {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markAllRead" }),
    });
  } catch (error) {
    console.error("Failed to mark all as read:", error);
  }
}

/**
 * Clear all notifications
 */
export async function clearNotifications(): Promise<void> {
  // Update local cache
  notificationsCache = [];
  notifyListeners();

  // Persist to API
  try {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "clearAll" }),
    });
  } catch (error) {
    console.error("Failed to clear notifications:", error);
  }
}

/**
 * Get unread count
 */
export function getUnreadCount(): number {
  return notificationsCache.filter((n) => !n.read).length;
}

/**
 * Subscribe to notification changes
 */
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

/**
 * Format relative time
 */
export function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

/**
 * Refresh notifications from API (for manual refresh)
 */
export async function refreshNotifications(): Promise<void> {
  try {
    const response = await fetch("/api/notifications");
    const data = await response.json();

    if (data.success && data.notifications) {
      notificationsCache = data.notifications.map((n: {
        id: string;
        type: NotificationType;
        category: NotificationCategory;
        title: string;
        timestamp: string;
        read: boolean;
      }) => ({
        ...n,
        timestamp: new Date(n.timestamp),
      }));
      notifyListeners();
    }
  } catch (error) {
    console.error("Failed to refresh notifications:", error);
  }
}
