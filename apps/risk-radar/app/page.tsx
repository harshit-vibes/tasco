"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@tasco/i18n";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Skeleton,
} from "@tasco/ui";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  DollarSign,
  FileText,
  Shield,
  ArrowRight,
  Car,
  Heart,
  Home,
  Users,
  Info,
  Anchor,
} from "@tasco/ui/icons";
import Link from "next/link";
import { useDemoContext } from "@/components/demo-controls";
import { cn } from "@tasco/ui/lib/utils";

// Icon mapping for products
const productIcons: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  motor: Car,
  health: Heart,
  property: Home,
  life: Users,
  liability: Shield,
  marine: Anchor,
};

// Hero metric icon mapping
const heroMetricIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  lossRatio: Activity,
  combinedRatio: TrendingUp,
  premiums: DollarSign,
  claims: FileText,
};

// Types for API response
interface HeroMetric {
  key: string;
  value: string;
  target: string;
  trend: "up" | "down" | "stable";
  change: string;
  status: "healthy" | "warning" | "critical";
}

interface ProductPerformance {
  name: string;
  icon: string;
  lossRatio: number;
  premiums: string;
  claims: string;
  policies: number;
  trend: "up" | "down" | "stable";
  color: string;
}

interface RecentAlert {
  id: string;
  type: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  detectedAt: string;
  currentValue: string;
}

interface BottomStats {
  policies: number;
  profitMargin: string;
  riskExposure: string;
  openAlerts: number;
}

interface DashboardData {
  heroMetrics: HeroMetric[];
  productPerformance: ProductPerformance[];
  bottomStats: BottomStats;
  alertStats: {
    total: number;
    bySeverity: { critical: number; warning: number; info: number };
    byStatus: { new: number };
  };
}

// Delay classes for staggered animations
const delayClasses = ["delay-100", "delay-200", "delay-300", "delay-400"];

export default function DashboardPage() {
  const { t } = useTranslation("app");
  const demoContext = useDemoContext();

  // State for API data
  const [data, setData] = useState<DashboardData | null>(null);
  const [alerts, setAlerts] = useState<RecentAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch metrics and alerts in parallel
        const [metricsRes, alertsRes] = await Promise.all([
          fetch("/api/metrics?entityId=risk-radar&type=all"),
          fetch("/api/alerts?entityId=risk-radar&limit=3"),
        ]);

        if (!metricsRes.ok || !alertsRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const metricsData = await metricsRes.json();
        const alertsData = await alertsRes.json();

        setData(metricsData);
        setAlerts(alertsData.alerts || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Get live data from demo context if available
  const getLiveMetricValue = (key: string) => {
    if (!demoContext) return null;
    const { demoState } = demoContext;
    switch (key) {
      case "lossRatio":
        return demoState.lossRatio;
      case "combinedRatio":
        return demoState.combinedRatio;
      case "premiums":
        return demoState.premiums;
      case "claims":
        return demoState.claims;
      default:
        return null;
    }
  };

  const getStatusColor = (status: "healthy" | "warning" | "critical") => {
    switch (status) {
      case "healthy":
        return "text-[hsl(152,60%,40%)]";
      case "warning":
        return "text-[hsl(45,90%,50%)]";
      case "critical":
        return "text-[hsl(0,72%,51%)]";
    }
  };

  const getStatusBg = (status: "healthy" | "warning" | "critical") => {
    switch (status) {
      case "healthy":
        return "bg-[hsl(152,60%,92%)] dark:bg-[hsl(152,60%,15%)]";
      case "warning":
        return "bg-[hsl(45,90%,92%)] dark:bg-[hsl(45,70%,15%)]";
      case "critical":
        return "bg-[hsl(0,72%,95%)] dark:bg-[hsl(0,72%,15%)]";
    }
  };

  const getSeverityClass = (severity: "critical" | "warning" | "info") => {
    switch (severity) {
      case "critical":
        return "alert-card-critical";
      case "warning":
        return "alert-card-warning";
      default:
        return "alert-card-info";
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium">Failed to load dashboard</p>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  const heroMetrics = data?.heroMetrics || [];
  const productPerformance = data?.productPerformance || [];
  const bottomStats = data?.bottomStats || { policies: 0, profitMargin: "N/A", riskExposure: "N/A", openAlerts: 0 };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("dashboard.subtitle")}</p>
      </div>

      {/* Hero Metrics Grid */}
      <TooltipProvider>
        <div className="hero-metrics">
          {heroMetrics.map((metric, index) => {
            // Get live data if available (demo override)
            const liveData = getLiveMetricValue(metric.key);
            const displayValue = liveData?.value || metric.value;
            const displayChange = liveData?.change || metric.change;
            const displayTrend = liveData?.trend || metric.trend;
            const displayStatus = liveData?.status || metric.status;
            const MetricIcon = heroMetricIcons[metric.key] || Activity;

            return (
              <div
                key={metric.key}
                className={cn(
                  "hero-metric relative overflow-hidden hover-lift cursor-default",
                  "animate-stagger animate-slide-in-up",
                  delayClasses[index]
                )}
              >
                {/* Background decoration */}
                <div
                  className={cn(
                    "absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl transition-colors duration-500",
                    displayStatus === "healthy"
                      ? "bg-[hsl(152,60%,50%)]"
                      : displayStatus === "critical"
                      ? "bg-[hsl(0,72%,51%)]"
                      : "bg-[hsl(45,90%,55%)]"
                  )}
                />

                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg transition-colors duration-300",
                        getStatusBg(displayStatus)
                      )}
                    >
                      <MetricIcon
                        className={cn("h-4 w-4 transition-colors duration-300", getStatusColor(displayStatus))}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[200px]">
                          <p className="text-xs">{t(`dashboard.metrics.${metric.key}Tooltip`)}</p>
                        </TooltipContent>
                      </Tooltip>
                      <div
                        className={cn(
                          "flex items-center gap-1 text-xs font-medium transition-colors duration-300",
                          displayTrend === "down"
                            ? "text-[hsl(152,60%,50%)]"
                            : displayStatus === "warning"
                            ? "text-[hsl(45,90%,55%)]"
                            : displayStatus === "critical"
                            ? "text-[hsl(0,72%,51%)]"
                            : "text-[hsl(152,60%,50%)]"
                        )}
                      >
                        {displayTrend === "up" ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {displayChange}
                      </div>
                    </div>
                  </div>

                  <div className={cn(
                    "hero-metric-value transition-all duration-300",
                    displayStatus === "critical" && "text-[hsl(0,72%,70%)]"
                  )}>
                    {displayValue}
                  </div>
                  <div className="hero-metric-label">
                    {t(`dashboard.metrics.${metric.key}`)}
                  </div>
                  <div className="text-xs text-[hsl(210,20%,50%)] mt-1">
                    {t("dashboard.metrics.target")}: {metric.target}
                  </div>
                </div>

                {/* Critical pulse indicator */}
                {displayStatus === "critical" && (
                  <div className="absolute top-3 right-3">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(0,72%,51%)] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(0,72%,51%)]"></span>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </TooltipProvider>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Performance - 2 columns */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {t("dashboard.products.title")}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("dashboard.products.subtitle")}
                </p>
              </div>
              <Link
                href="/analysis"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                {t("dashboard.viewAll")}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productPerformance.slice(0, 4).map((product) => {
                  const ProductIcon = productIcons[product.name] || Activity;
                  return (
                    <div
                      key={product.name}
                      className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                    >
                      <div
                        className="p-2.5 rounded-lg"
                        style={{ backgroundColor: `${product.color}15` }}
                      >
                        <ProductIcon
                          className="h-5 w-5"
                          style={{ color: product.color }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">
                            {t(`dashboard.products.${product.name}`)}
                          </span>
                          <span
                            className={`text-sm font-mono ${
                              product.lossRatio > 65
                                ? "text-[hsl(0,72%,51%)]"
                                : product.lossRatio > 55
                                ? "text-[hsl(45,90%,50%)]"
                                : "text-[hsl(152,60%,40%)]"
                            }`}
                          >
                            {product.lossRatio}%
                          </span>
                        </div>

                        {/* Loss Ratio Progress Bar */}
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(product.lossRatio, 100)}%`,
                              backgroundColor:
                                product.lossRatio > 65
                                  ? "hsl(0, 72%, 51%)"
                                  : product.lossRatio > 55
                                  ? "hsl(45, 90%, 55%)"
                                  : "hsl(152, 60%, 40%)",
                            }}
                          />
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>
                            {t("dashboard.metrics.premiums")}: {product.premiums}
                          </span>
                          <span>
                            {t("dashboard.metrics.claims")}: {product.claims}
                          </span>
                          <span>
                            {t("dashboard.metrics.policies")}:{" "}
                            {product.policies.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Alerts - 1 column */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-[hsl(0,72%,51%)]" />
                  {t("dashboard.alerts.title")}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("dashboard.alerts.subtitle")}
                </p>
              </div>
              <Link
                href="/alerts"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                {t("dashboard.alerts.viewAll")}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`alert-card ${getSeverityClass(alert.severity)}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`alert-badge ${
                              alert.severity === "critical"
                                ? "alert-badge-critical"
                                : "alert-badge-warning"
                            }`}
                          >
                            {t(`dashboard.alerts.${alert.severity}`)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {alert.detectedAt}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{alert.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {alert.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-mono font-bold ${
                            alert.severity === "critical"
                              ? "text-[hsl(0,72%,51%)]"
                              : "text-[hsl(45,90%,50%)]"
                          }`}
                        >
                          {alert.currentValue}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="metric-value text-xl">
                  {bottomStats.policies.toLocaleString()}
                </div>
                <div className="metric-label text-xs">
                  {t("dashboard.metrics.policies")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[hsl(152,60%,92%)] dark:bg-[hsl(152,60%,15%)]">
                <DollarSign className="h-4 w-4 text-[hsl(152,60%,40%)]" />
              </div>
              <div>
                <div className="metric-value text-xl">{bottomStats.profitMargin}</div>
                <div className="metric-label text-xs">
                  {t("dashboard.metrics.profitMargin")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[hsl(45,90%,92%)] dark:bg-[hsl(45,70%,15%)]">
                <Activity className="h-4 w-4 text-[hsl(45,90%,50%)]" />
              </div>
              <div>
                <div className="metric-value text-xl">{bottomStats.riskExposure}</div>
                <div className="metric-label text-xs">
                  {t("dashboard.metrics.riskExposure")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[hsl(0,72%,95%)] dark:bg-[hsl(0,72%,15%)]">
                <AlertTriangle className="h-4 w-4 text-[hsl(0,72%,51%)]" />
              </div>
              <div>
                <div className="metric-value text-xl">{bottomStats.openAlerts}</div>
                <div className="metric-label text-xs">
                  {t("alerts.openAlerts")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
