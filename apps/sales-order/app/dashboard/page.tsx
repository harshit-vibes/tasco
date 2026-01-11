"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@tasco/ui";
import {
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  Upload,
  Target,
  Zap,
  BarChart3,
  AlertCircle,
  Activity,
  Cpu,
  Loader2,
} from "@tasco/ui/icons";
import { useTranslation } from "@tasco/i18n";

interface DashboardData {
  metrics: {
    totalOrders: number;
    totalOrdersChange: number;
    processedToday: number;
    processedTodayChange: number;
    avgAccuracy: number;
    avgAccuracyChange: number;
    timeSaved: string;
    timeSavedChange: number;
    activeProcesses: number;
    queuedOrders: number;
    systemHealth: number;
  };
  processingStages: Array<{
    name: string;
    status: string;
    count: number;
    avgTime: string;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    orderId: string;
    customer: string;
    time: string;
    type: string;
  }>;
  weeklyData: Array<{
    day: string;
    orders: number;
  }>;
}

export default function DashboardPage() {
  const { t } = useTranslation("app");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data on mount
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/dashboard?entityId=inochi");

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        if (data.success) {
          setDashboardData(data.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Keep default null state on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Extract data or use loading state
  const metrics = dashboardData?.metrics;
  const processingStages = dashboardData?.processingStages || [];
  const recentActivity = dashboardData?.recentActivity || [];
  const weeklyData = dashboardData?.weeklyData || [];

  const getStageStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "status-active";
      case "processing":
        return "status-processing";
      case "idle":
        return "status-inactive";
      default:
        return "status-inactive";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "approved":
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-status-active/20 border-2 border-status-active">
            <CheckCircle className="h-5 w-5 text-status-active" />
          </div>
        );
      case "uploaded":
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-status-processing/20 border-2 border-status-processing">
            <Upload className="h-5 w-5 text-status-processing" />
          </div>
        );
      case "exported":
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 border-2 border-accent">
            <TrendingUp className="h-5 w-5 text-accent" />
          </div>
        );
      default:
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted border-2 border-border">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
        );
    }
  };

  const maxOrders = weeklyData.length > 0
    ? Math.max(...weeklyData.map((d) => d.orders))
    : 1;

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">
            {t("common.loading", "Loading dashboard...")}
          </p>
        </div>
      </div>
    );
  }

  // Show error state if no data
  if (!metrics) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            Failed to load dashboard data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background overflow-hidden">
      {/* Control Panel Header */}
      <div className="flex-shrink-0 border-b-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 px-8 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl text-foreground">
                Order Processing Control Center
              </h1>
              <p className="mt-1 font-body text-sm text-muted-foreground">
                Real-time monitoring and performance metrics
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-lg border-2 border-status-active bg-status-active/10 px-4 py-2">
                <div className="status-indicator status-active" />
                <span className="font-mono-code text-sm font-semibold text-status-active">
                  System Operational
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Control Panel */}
      <div className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Real-time Metrics Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Active Processes */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-heading text-sm font-semibold">
                  Active Processes
                </CardTitle>
                <Activity className="h-5 w-5 text-primary animate-pulse-glow" />
              </CardHeader>
              <CardContent>
                <div className="metric-value">{metrics.activeProcesses}</div>
                <p className="metric-label">Processing now</p>
              </CardContent>
            </Card>

            {/* Queue Status */}
            <Card className="border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-heading text-sm font-semibold">
                  Queue Status
                </CardTitle>
                <Clock className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="metric-value text-accent">{metrics.queuedOrders}</div>
                <p className="metric-label">Orders pending</p>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card className="border-2 border-status-active/20 bg-gradient-to-br from-status-active/5 to-transparent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-heading text-sm font-semibold">
                  System Health
                </CardTitle>
                <Cpu className="h-5 w-5 text-status-active" />
              </CardHeader>
              <CardContent>
                <div className="metric-value text-status-active">{metrics.systemHealth}%</div>
                <p className="metric-label">Operational status</p>
              </CardContent>
            </Card>

            {/* Accuracy Rate */}
            <Card className="border-2 border-info/20 bg-gradient-to-br from-info/5 to-transparent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-heading text-sm font-semibold">
                  Accuracy Rate
                </CardTitle>
                <Target className="h-5 w-5 text-info" />
              </CardHeader>
              <CardContent>
                <div className="metric-value text-info">{metrics.avgAccuracy}%</div>
                <p className="metric-label">AI extraction quality</p>
              </CardContent>
            </Card>
          </div>

          {/* Processing Pipeline Status */}
          <Card className="border-2 border-primary/20">
            <CardHeader className="industrial-panel-header">
              <CardTitle className="font-heading flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent" />
                Processing Pipeline Status
              </CardTitle>
              <CardDescription className="font-body">
                Real-time stage monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="stage-timeline py-6">
                {processingStages.map((stage, index) => (
                  <div
                    key={stage.name}
                    className="relative z-10 flex flex-col items-center gap-3"
                  >
                    <div
                      className={`stage-node ${
                        stage.status === "active"
                          ? "active"
                          : stage.status === "processing"
                          ? "completed"
                          : "pending"
                      }`}
                    >
                      {stage.status === "active" ? (
                        <Activity className="h-6 w-6 animate-processing" />
                      ) : stage.status === "processing" ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <Clock className="h-6 w-6" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="font-heading text-sm font-semibold">
                        {stage.name}
                      </p>
                      <p className="font-mono-code text-xs text-muted-foreground">
                        {stage.count} active
                      </p>
                      <p className="font-mono-code text-xs text-accent">
                        {stage.avgTime}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Order Volume Chart */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Weekly Order Volume
                </CardTitle>
                <CardDescription className="font-body">
                  Orders processed this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-[240px] items-end gap-3">
                  {weeklyData.map((data) => (
                    <div
                      key={data.day}
                      className="flex flex-1 flex-col items-center gap-3"
                    >
                      <div className="relative w-full overflow-hidden rounded-t-lg border-2 border-primary/20 bg-gradient-to-t from-primary to-primary/60 transition-all hover:from-accent hover:to-accent/60"
                        style={{
                          height: `${(data.orders / maxOrders) * 180}px`,
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20" />
                      </div>
                      <div className="text-center">
                        <span className="font-mono-code text-xs font-semibold text-foreground">
                          {data.day}
                        </span>
                        <p className="font-mono-code text-xs text-muted-foreground">
                          {data.orders}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity Log */}
            <Card className="border-2 border-accent/20">
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-accent" />
                  Activity Log
                </CardTitle>
                <CardDescription className="font-body">
                  Latest processing events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 rounded-lg border border-border/50 bg-muted/30 p-3 transition-all hover:border-primary/30 hover:bg-muted/50"
                    >
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-heading text-sm font-semibold">
                          {activity.action}
                        </p>
                        <p className="font-mono-code text-xs text-primary">
                          {activity.orderId}
                        </p>
                        <p className="font-body text-xs text-muted-foreground truncate">
                          {activity.customer}
                        </p>
                      </div>
                      <span className="font-mono-code text-xs text-muted-foreground whitespace-nowrap">
                        {activity.time}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics Panel */}
          <Card className="border-2 border-primary/20 industrial-panel">
            <CardHeader>
              <CardTitle className="font-heading text-lg">
                Performance Metrics
              </CardTitle>
              <CardDescription className="font-body">
                AI-powered order processing efficiency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8 md:grid-cols-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-sm font-semibold text-foreground">
                      Extraction Accuracy
                    </span>
                    <span className="font-mono-code text-lg font-bold text-status-active">
                      94.5%
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-status-active to-status-active/80 transition-all"
                      style={{ width: "94.5%" }}
                    />
                  </div>
                  <p className="font-mono-code text-xs text-muted-foreground">
                    Target: 95% • On track
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-sm font-semibold text-foreground">
                      Processing Speed
                    </span>
                    <span className="font-mono-code text-lg font-bold text-status-processing">
                      28s
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-status-processing to-status-processing/80 transition-all"
                      style={{ width: "85%" }}
                    />
                  </div>
                  <p className="font-mono-code text-xs text-muted-foreground">
                    Target: &lt;30s • Excellent
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-sm font-semibold text-foreground">
                      Error Reduction
                    </span>
                    <span className="font-mono-code text-lg font-bold text-accent">
                      82%
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent to-accent/80 transition-all"
                      style={{ width: "82%" }}
                    />
                  </div>
                  <p className="font-mono-code text-xs text-muted-foreground">
                    Target: 80% • Exceeded
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
