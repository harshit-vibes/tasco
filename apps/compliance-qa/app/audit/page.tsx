"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Select,
} from "@tasco/ui";
import {
  Clock,
  FileText,
  Building2,
  MessageSquare,
  Filter,
  RefreshCw,
  CheckCircle,
  Plus,
  Trash2,
  Edit,
} from "@tasco/ui/icons";
import { useTranslation } from "@tasco/i18n";
import type { Notification, NotificationCategory, NotificationType } from "@tasco/db";

// Icon mapping for categories (compliance-qa only uses a subset)
const categoryIcons: Partial<Record<NotificationCategory, React.ReactNode>> = {
  document: <FileText className="h-4 w-4" />,
  entity: <Building2 className="h-4 w-4" />,
  conversation: <MessageSquare className="h-4 w-4" />,
};

// Icon mapping for types (compliance-qa only uses a subset)
const typeIcons: Partial<Record<NotificationType, React.ReactNode>> = {
  created: <Plus className="h-3 w-3" />,
  updated: <Edit className="h-3 w-3" />,
  deleted: <Trash2 className="h-3 w-3" />,
};

// Color mapping for types (compliance-qa only uses a subset)
const typeColors: Partial<Record<NotificationType, string>> = {
  created: "bg-green-100 text-green-700",
  updated: "bg-blue-100 text-blue-700",
  deleted: "bg-red-100 text-red-700",
};

export default function AuditPage() {
  const { t } = useTranslation("compliance");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Fetch notifications
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/notifications?limit=100");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Failed to fetch audit trail:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (categoryFilter !== "all" && n.category !== categoryFilter) return false;
      if (typeFilter !== "all" && n.type !== typeFilter) return false;
      return true;
    });
  }, [notifications, categoryFilter, typeFilter]);

  // Group by date
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {};

    filteredNotifications.forEach((n) => {
      const date = new Date(n.timestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(n);
    });

    return groups;
  }, [filteredNotifications]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          {t("audit.title", "Audit Trail")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("audit.description", "Track all actions and changes in the system")}
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-center gap-4 py-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {t("audit.filters", "Filters")}:
            </span>
          </div>

          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            className="w-[180px]"
            options={[
              { value: "all", label: t("audit.allCategories", "All Categories") },
              { value: "document", label: t("audit.category.document", "Documents") },
              { value: "entity", label: t("audit.category.entity", "Entities") },
              { value: "conversation", label: t("audit.category.conversation", "Conversations") },
            ]}
          />

          <Select
            value={typeFilter}
            onChange={setTypeFilter}
            className="w-[150px]"
            options={[
              { value: "all", label: t("audit.allActions", "All Actions") },
              { value: "created", label: t("audit.type.created", "Created") },
              { value: "updated", label: t("audit.type.updated", "Updated") },
              { value: "deleted", label: t("audit.type.deleted", "Deleted") },
            ]}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotifications}
            className="ml-auto gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {t("audit.refresh", "Refresh")}
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">
              {t("audit.totalEvents", "Total Events")}
            </p>
            <p className="text-2xl font-semibold">{notifications.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">
              {t("audit.documents", "Documents")}
            </p>
            <p className="text-2xl font-semibold">
              {notifications.filter((n) => n.category === "document").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">
              {t("audit.entities", "Entities")}
            </p>
            <p className="text-2xl font-semibold">
              {notifications.filter((n) => n.category === "entity").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">
              {t("audit.conversations", "Conversations")}
            </p>
            <p className="text-2xl font-semibold">
              {notifications.filter((n) => n.category === "conversation").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Audit Trail List */}
      <Card className="flex-1 overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t("audit.activityLog", "Activity Log")}
            {filteredNotifications.length !== notifications.length && (
              <span className="text-sm font-normal text-muted-foreground">
                ({filteredNotifications.length} of {notifications.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%-4rem)] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">
                {t("audit.noEvents", "No events found")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("audit.noEventsHint", "Activity will appear here as you use the system")}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedNotifications).map(([date, items]) => (
                <div key={date}>
                  <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                    {date}
                  </h3>
                  <div className="space-y-2">
                    {items.map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/30"
                      >
                        {/* Category Icon */}
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          {categoryIcons[notification.category] || <FileText className="h-4 w-4" />}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <p className="font-medium">{notification.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(notification.timestamp)}</span>
                          </div>
                        </div>

                        {/* Type Badge */}
                        <div
                          className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${typeColors[notification.type] || "bg-gray-100 text-gray-700"}`}
                        >
                          {typeIcons[notification.type]}
                          <span className="capitalize">{notification.type}</span>
                        </div>

                        {/* Read Status */}
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
