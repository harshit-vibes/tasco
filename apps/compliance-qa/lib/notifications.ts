// Shared notification store for app-wide activity tracking

export interface Notification {
  id: string;
  type: "created" | "deleted";
  title: string;
  timestamp: Date;
  read: boolean;
}

// Store notifications in memory (persists across re-renders but not page refresh)
let notificationsStore: Notification[] = [];
let previousConversationIds: Set<string> = new Set();
let listeners: Set<() => void> = new Set();

export function getNotifications(): Notification[] {
  return [...notificationsStore];
}

export function getPreviousConversationIds(): Set<string> {
  return previousConversationIds;
}

export function setPreviousConversationIds(ids: Set<string>): void {
  previousConversationIds = ids;
}

export function addNotification(notification: Notification): void {
  notificationsStore = [notification, ...notificationsStore].slice(0, 20);
  notifyListeners();
}

export function markAllAsRead(): void {
  notificationsStore = notificationsStore.map((n) => ({ ...n, read: true }));
  notifyListeners();
}

export function clearNotifications(): void {
  notificationsStore = [];
  notifyListeners();
}

export function getUnreadCount(): number {
  return notificationsStore.filter((n) => !n.read).length;
}

// Subscribe to notification changes
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

// Format relative time
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
