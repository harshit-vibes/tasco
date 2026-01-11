"use client";

import { useTranslation } from "@tasco/i18n";
import { Card, CardContent, CardHeader, CardTitle, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@tasco/ui";
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
} from "@tasco/ui/icons";
import Link from "next/link";
import { useDemoContext } from "@/components/demo-controls";
import { cn } from "@tasco/ui/lib/utils";

// Demo data - In production, this would come from the API
const heroMetrics = [
  {
    key: "lossRatio",
    value: "62.4%",
    target: "< 65%",
    trend: "down",
    change: "-2.3%",
    status: "healthy" as const,
    icon: Activity,
  },
  {
    key: "combinedRatio",
    value: "95.2%",
    target: "< 100%",
    trend: "up",
    change: "+1.8%",
    status: "warning" as const,
    icon: TrendingUp,
  },
  {
    key: "premiums",
    value: "₫48.2B",
    target: "₫45B",
    trend: "up",
    change: "+12.5%",
    status: "healthy" as const,
    icon: DollarSign,
  },
  {
    key: "claims",
    value: "₫30.1B",
    target: "< ₫32B",
    trend: "up",
    change: "+8.2%",
    status: "warning" as const,
    icon: FileText,
  },
];

const productPerformance = [
  {
    name: "motor",
    icon: Car,
    lossRatio: 68.5,
    premiums: "₫18.2B",
    claims: "₫12.5B",
    policies: 45230,
    trend: "up",
    color: "hsl(215, 70%, 50%)",
  },
  {
    name: "health",
    icon: Heart,
    lossRatio: 58.2,
    premiums: "₫15.8B",
    claims: "₫9.2B",
    policies: 32150,
    trend: "down",
    color: "hsl(152, 60%, 40%)",
  },
  {
    name: "property",
    icon: Home,
    lossRatio: 42.1,
    premiums: "₫8.5B",
    claims: "₫3.6B",
    policies: 12890,
    trend: "stable",
    color: "hsl(25, 80%, 50%)",
  },
  {
    name: "life",
    icon: Users,
    lossRatio: 71.8,
    premiums: "₫5.7B",
    claims: "₫4.1B",
    policies: 8920,
    trend: "up",
    color: "hsl(270, 60%, 50%)",
  },
];

const recentAlerts = [
  {
    id: 1,
    type: "loss_ratio_spike",
    severity: "critical" as const,
    title: "Loss Ratio Spike - Motor Insurance",
    description: "Ho Chi Minh region showing 15% increase in claims",
    time: "15m ago",
    metric: "78.5%",
  },
  {
    id: 2,
    type: "claim_surge",
    severity: "warning" as const,
    title: "Claims Surge - Health Insurance",
    description: "Unusual volume detected in Hanoi district",
    time: "1h ago",
    metric: "+45%",
  },
  {
    id: 3,
    type: "profitability_decline",
    severity: "warning" as const,
    title: "Profitability Decline - Life Insurance",
    description: "Q4 margins below target threshold",
    time: "3h ago",
    metric: "-8.2%",
  },
];

// Delay classes for staggered animations
const delayClasses = ["delay-100", "delay-200", "delay-300", "delay-400"];

export default function DashboardPage() {
  const { t } = useTranslation("app");
  const demoContext = useDemoContext();

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
            // Get live data if available
            const liveData = getLiveMetricValue(metric.key);
            const displayValue = liveData?.value || metric.value;
            const displayChange = liveData?.change || metric.change;
            const displayTrend = liveData?.trend || metric.trend;
            const displayStatus = liveData?.status || metric.status;

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
                      <metric.icon
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
                {productPerformance.map((product) => (
                  <div
                    key={product.name}
                    className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                  >
                    <div
                      className="p-2.5 rounded-lg"
                      style={{ backgroundColor: `${product.color}15` }}
                    >
                      <product.icon
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
                ))}
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
                {recentAlerts.map((alert) => (
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
                            {alert.time}
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
                          {alert.metric}
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
                <div className="metric-value text-xl">124,190</div>
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
                <div className="metric-value text-xl">18.1B</div>
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
                <div className="metric-value text-xl">₫285B</div>
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
                <div className="metric-value text-xl">12</div>
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
