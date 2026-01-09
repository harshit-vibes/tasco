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
  Users,
  TrendingUp,
  Building2,
  Bot,
  Database,
  ChevronRight,
  Loader2,
  Trash2,
  Clock,
} from "@tasco/ui/icons";
import {
  type Notification,
  getNotifications,
  subscribe,
  formatTime,
} from "@/lib/notifications";

interface EntitySummary {
  total: number;
  parents: number;
  holdings: number;
  subsidiaries: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [entitySummary, setEntitySummary] = useState<EntitySummary | null>(null);
  const [isLoadingEntities, setIsLoadingEntities] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>(getNotifications());

  // Subscribe to notification changes
  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setNotifications(getNotifications());
    });
    return unsubscribe;
  }, []);

  // Fetch entity summary
  useEffect(() => {
    async function fetchEntities() {
      try {
        const response = await fetch("/api/entities");
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

  const stats = [
    { label: "Total Documents", value: "156", icon: FileText, change: "+12%" },
    { label: "Conversations", value: "48", icon: MessageSquare, change: "+8%" },
    { label: "Active Users", value: "23", icon: Users, change: "+3%" },
    { label: "Queries Today", value: "142", icon: TrendingUp, change: "+24%" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Compliance QA overview and analytics</p>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <CardTitle className="text-base">Entities</CardTitle>
                  <p className="text-xs text-muted-foreground">Manage company hierarchy</p>
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

        {/* Agents Card */}
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow group"
          onClick={() => router.push("/agents")}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <CardTitle className="text-base">Agents</CardTitle>
                  <p className="text-xs text-muted-foreground">Configure AI agents</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              View and manage AI agent configuration
            </p>
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
                  <CardTitle className="text-base">Knowledge Base</CardTitle>
                  <p className="text-xs text-muted-foreground">Manage documents & sources</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Upload and manage compliance documents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center justify-between">
              <stat.icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-emerald-600 font-medium">{stat.change}</span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity - Powered by notifications */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="py-6 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Conversation activity will appear here
              </p>
            </div>
          ) : (
            notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                      notification.type === "created"
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-red-100 dark:bg-red-900/30"
                    }`}
                  >
                    {notification.type === "created" ? (
                      <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {notification.type === "created"
                        ? "New conversation started"
                        : "Conversation deleted"}
                    </p>
                    <p className="text-xs text-muted-foreground">{notification.title}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatTime(notification.timestamp)}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
