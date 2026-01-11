"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Separator,
} from "@tasco/ui";
import {
  FileText,
  MessageSquare,
  Building2,
  Database,
  ChevronRight,
  Loader2,
  Trash2,
  Clock,
  Pencil,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Scale,
} from "@tasco/ui/icons";
import {
  type Notification,
  getNotifications,
  subscribe,
  formatTime,
  initializeNotifications,
} from "@/lib/notifications";
import { useTranslation } from "@tasco/i18n";

interface EntitySummary {
  total: number;
  parents: number;
  holdings: number;
  subsidiaries: number;
}

interface KnowledgeBaseSummary {
  total: number;
  synced: number;
  categories: number;
}

interface ConversationSummary {
  total: number;
}

interface DocumentStats {
  total: number;
  syncedToKB: number;
  byStatus: {
    pending: number;
    approved: number;
    rejected: number;
    archived: number;
  };
  byCategory: Record<string, number>;
  byLegalType: Record<string, number>;
}

export default function DashboardPage() {
  const { t } = useTranslation("compliance");
  const router = useRouter();
  const [entitySummary, setEntitySummary] = useState<EntitySummary | null>(null);
  const [kbSummary, setKbSummary] = useState<KnowledgeBaseSummary | null>(null);
  const [conversationSummary, setConversationSummary] = useState<ConversationSummary | null>(null);
  const [docStats, setDocStats] = useState<DocumentStats | null>(null);
  const [isLoadingEntities, setIsLoadingEntities] = useState(true);
  const [isLoadingKB, setIsLoadingKB] = useState(true);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>(getNotifications());

  // Initialize and subscribe to notification changes
  useEffect(() => {
    // Initialize notifications from API
    initializeNotifications().then(() => {
      setNotifications(getNotifications());
    });

    const unsubscribe = subscribe(() => {
      setNotifications(getNotifications());
    });
    return unsubscribe;
  }, []);

  // Fetch entity summary with timeout
  useEffect(() => {
    async function fetchEntities() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout
        const response = await fetch("/api/entities", { signal: controller.signal });
        clearTimeout(timeoutId);
        const data = await response.json();
        if (data.success) {
          const entities = data.entities;
          setEntitySummary({
            total: entities.length,
            parents: entities.filter((e: { type: string }) => e.type === "parent").length,
            holdings: entities.filter((e: { type: string }) => e.type === "holding").length,
            subsidiaries: entities.filter((e: { type: string }) => e.type === "subsidiary").length,
          });
        }
      } catch (err) {
        console.error("Error fetching entities:", err);
      } finally {
        setIsLoadingEntities(false);
      }
    }
    fetchEntities();
  }, []);

  // Fetch knowledge base summary
  useEffect(() => {
    async function fetchKnowledgeBase() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const response = await fetch("/api/documents", { signal: controller.signal });
        clearTimeout(timeoutId);
        const data = await response.json();
        if (data.success) {
          const documents = data.documents || [];
          const categories = new Set(documents.map((d: { category: string }) => d.category));
          setKbSummary({
            total: documents.length,
            synced: documents.filter((d: { syncedToKB?: boolean }) => d.syncedToKB).length,
            categories: categories.size,
          });
        }
      } catch (err) {
        console.error("Error fetching documents:", err);
      } finally {
        setIsLoadingKB(false);
      }
    }
    fetchKnowledgeBase();
  }, []);

  // Fetch conversation summary
  useEffect(() => {
    async function fetchConversations() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const response = await fetch("/api/conversations", { signal: controller.signal });
        clearTimeout(timeoutId);
        const data = await response.json();
        if (data.success) {
          setConversationSummary({
            total: data.conversations?.length || 0,
          });
        }
      } catch (err) {
        console.error("Error fetching conversations:", err);
      } finally {
        setIsLoadingConversations(false);
      }
    }
    fetchConversations();
  }, []);

  // Fetch document stats for compliance metrics
  useEffect(() => {
    async function fetchDocStats() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const response = await fetch("/api/documents?stats=true", { signal: controller.signal });
        clearTimeout(timeoutId);
        const data = await response.json();
        if (data.success && data.stats) {
          setDocStats(data.stats);
        }
      } catch (err) {
        console.error("Error fetching document stats:", err);
      } finally {
        setIsLoadingStats(false);
      }
    }
    fetchDocStats();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="text-3xl">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("dashboard.subtitle")}</p>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Entities Card */}
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow group"
          onClick={() => router.push("/entities")}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{t("dashboard.entities.title")}</CardTitle>
                  <p className="text-xs text-muted-foreground">{t("dashboard.entities.description")}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoadingEntities ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading...
              </div>
            ) : entitySummary ? (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-lg">{entitySummary.total}</span>
                  <span className="text-muted-foreground">total</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{entitySummary.parents} parent</Badge>
                  <Badge className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0">{entitySummary.holdings} holding</Badge>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{entitySummary.subsidiaries} subsidiary</Badge>
                </div>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">No entities</span>
            )}
          </CardContent>
        </Card>

        {/* Knowledge Base Card */}
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow group"
          onClick={() => router.push("/knowledge-base")}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-base">{t("dashboard.knowledgeBase.title")}</CardTitle>
                  <p className="text-xs text-muted-foreground">{t("dashboard.knowledgeBase.description")}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoadingKB ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading...
              </div>
            ) : kbSummary ? (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-lg">{kbSummary.total}</span>
                  <span className="text-muted-foreground">documents</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] px-1.5 py-0">
                    {kbSummary.synced} synced
                  </Badge>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {kbSummary.categories} categories
                  </Badge>
                </div>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">No documents</span>
            )}
          </CardContent>
        </Card>

        {/* Pending Reviews Card */}
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow group"
          onClick={() => router.push("/knowledge-base?status=pending")}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-base">{t("dashboard.pendingReviews.title")}</CardTitle>
                  <p className="text-xs text-muted-foreground">{t("dashboard.pendingReviews.description")}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoadingStats ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading...
              </div>
            ) : docStats ? (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-lg">{docStats.byStatus.pending}</span>
                  <span className="text-muted-foreground">pending</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] px-1.5 py-0">
                    {docStats.byStatus.approved} approved
                  </Badge>
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] px-1.5 py-0">
                    {docStats.byStatus.rejected} rejected
                  </Badge>
                </div>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">No review data</span>
            )}
          </CardContent>
        </Card>

        {/* Laws & Regulations Card */}
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow group"
          onClick={() => router.push("/knowledge-base?category=Laws%20%26%20Regulations")}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Scale className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-base">{t("dashboard.laws.title")}</CardTitle>
                  <p className="text-xs text-muted-foreground">{t("dashboard.laws.description")}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoadingStats ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading...
              </div>
            ) : docStats ? (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-lg">
                    {(docStats.byLegalType?.law || 0) +
                     (docStats.byLegalType?.decree || 0) +
                     (docStats.byLegalType?.circular || 0)}
                  </span>
                  <span className="text-muted-foreground">documents</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] px-1.5 py-0">
                    {docStats.byLegalType?.law || 0} laws
                  </Badge>
                  <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 text-[10px] px-1.5 py-0">
                    {docStats.byLegalType?.decree || 0} decrees
                  </Badge>
                </div>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">No legal documents</span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity - Powered by notifications */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-heading">{t("dashboard.recentActivity.title")}</h2>
          {!isLoadingConversations && conversationSummary && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="font-medium">{conversationSummary.total}</span>
                <span>conversations</span>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="py-6 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">{t("dashboard.recentActivity.noActivity")}</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                {t("dashboard.recentActivity.activityHint")}
              </p>
            </div>
          ) : (
            notifications.slice(0, 5).map((notification) => {
              // Determine icon and colors based on type and category
              const getNotificationStyle = () => {
                const category = notification.category || "conversation";
                const type = notification.type;

                // Background colors by type
                const bgColors = {
                  created: "bg-green-100 dark:bg-green-900/30",
                  updated: "bg-blue-100 dark:bg-blue-900/30",
                  deleted: "bg-red-100 dark:bg-red-900/30",
                };

                // Icon colors by type
                const iconColors = {
                  created: "text-green-600 dark:text-green-400",
                  updated: "text-blue-600 dark:text-blue-400",
                  deleted: "text-red-600 dark:text-red-400",
                };

                // Icons by category and type
                const icons = {
                  conversation: {
                    created: <MessageSquare className={`h-4 w-4 ${iconColors.created}`} />,
                    updated: <MessageSquare className={`h-4 w-4 ${iconColors.updated}`} />,
                    deleted: <Trash2 className={`h-4 w-4 ${iconColors.deleted}`} />,
                  },
                  entity: {
                    created: <Building2 className={`h-4 w-4 ${iconColors.created}`} />,
                    updated: <Pencil className={`h-4 w-4 ${iconColors.updated}`} />,
                    deleted: <Trash2 className={`h-4 w-4 ${iconColors.deleted}`} />,
                  },
                  document: {
                    created: <FileText className={`h-4 w-4 ${iconColors.created}`} />,
                    updated: <RefreshCw className={`h-4 w-4 ${iconColors.updated}`} />,
                    deleted: <Trash2 className={`h-4 w-4 ${iconColors.deleted}`} />,
                  },
                };

                // Labels by category and type
                const labels = {
                  conversation: {
                    created: t("notifications.conversation.created"),
                    updated: t("notifications.conversation.updated"),
                    deleted: t("notifications.conversation.deleted"),
                  },
                  entity: {
                    created: t("notifications.entity.created"),
                    updated: t("notifications.entity.updated"),
                    deleted: t("notifications.entity.deleted"),
                  },
                  document: {
                    created: t("notifications.document.created"),
                    updated: t("notifications.document.updated"),
                    deleted: t("notifications.document.deleted"),
                  },
                };

                return {
                  bgColor: bgColors[type] || bgColors.created,
                  icon: icons[category]?.[type] || icons.conversation.created,
                  label: labels[category]?.[type] || "Activity",
                };
              };

              const style = getNotificationStyle();

              return (
                <div
                  key={notification.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${style.bgColor}`}
                    >
                      {style.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{style.label}</p>
                      <p className="text-xs text-muted-foreground">{notification.title}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(notification.timestamp)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
