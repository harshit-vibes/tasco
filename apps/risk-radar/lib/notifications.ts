// Notification store for Risk Radar

export type NotificationType = "alert" | "metric_change" | "info";
export type NotificationCategory = "risk" | "alert" | "system";
export type AlertSeverity = "critical" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  category?: NotificationCategory;
  severity?: AlertSeverity;
  title: string;
  description?: string;
  metric?: string;
  value?: string;
  timestamp: Date;
  read: boolean;
}

// Local cache (for UI responsiveness)
let notificationsCache: Notification[] = [
  // Demo notifications
  {
    id: "demo-1",
    type: "alert",
    category: "risk",
    severity: "critical",
    title: "Loss Ratio Spike Detected",
    description: "Motor insurance loss ratio increased by 15% in Ho Chi Minh region",
    metric: "Loss Ratio",
    value: "78.5%",
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
    read: false,
  },
  {
    id: "demo-2",
    type: "alert",
    category: "alert",
    severity: "warning",
    title: "Claims Surge - Health Insurance",
    description: "Unusual claims volume detected in Hanoi district",
    metric: "Claims Count",
    value: "+45%",
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
    read: false,
  },
  {
    id: "demo-3",
    type: "metric_change",
    category: "risk",
    severity: "info",
    title: "Combined Ratio Improved",
    description: "Overall combined ratio improved by 2.3 points",
    metric: "Combined Ratio",
    value: "95.2%",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: true,
  },
];
let listeners: Set<() => void> = new Set();

/**
 * Get notifications (from local cache)
 */
export function getNotifications(): Notification[] {
  return [...notificationsCache];
}

/**
 * Add notification
 */
export function addNotification(notification: Notification): void {
  notificationsCache = [notification, ...notificationsCache].slice(0, 20);
  notifyListeners();
}

/**
 * Mark all notifications as read
 */
export function markAllAsRead(): void {
  notificationsCache = notificationsCache.map((n) => ({ ...n, read: true }));
  notifyListeners();
}

/**
 * Clear all notifications
 */
export function clearNotifications(): void {
  notificationsCache = [];
  notifyListeners();
}

/**
 * Get unread count
 */
export function getUnreadCount(): number {
  return notificationsCache.filter((n) => !n.read).length;
}

/**
 * Get critical alerts count
 */
export function getCriticalCount(): number {
  return notificationsCache.filter((n) => n.severity === "critical" && !n.read).length;
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
 * Get severity color class
 */
export function getSeverityColor(severity: AlertSeverity | undefined): string {
  switch (severity) {
    case "critical":
      return "text-[hsl(0,72%,51%)]";
    case "warning":
      return "text-[hsl(25,95%,55%)]";
    case "info":
    default:
      return "text-[hsl(185,70%,50%)]";
  }
}

/**
 * Get severity background class
 */
export function getSeverityBg(severity: AlertSeverity | undefined): string {
  switch (severity) {
    case "critical":
      return "bg-[hsl(0,72%,95%)] dark:bg-[hsl(0,72%,15%)]";
    case "warning":
      return "bg-[hsl(25,95%,92%)] dark:bg-[hsl(25,80%,15%)]";
    case "info":
    default:
      return "bg-[hsl(185,70%,92%)] dark:bg-[hsl(185,50%,12%)]";
  }
}
