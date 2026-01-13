"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@tasco/i18n";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Skeleton,
} from "@tasco/ui";
import {
  Search,
  Filter,
  SortDesc,
  AlertTriangle,
  Clock,
  CheckCircle,
  Eye,
  MoreHorizontal,
  TrendingUp,
  Car,
  Heart,
  Home,
  Users,
  Info,
  Zap,
  RefreshCw,
} from "@tasco/ui/icons";
import { cn } from "@tasco/ui/lib/utils";

type AlertSeverity = "critical" | "warning" | "info";
type AlertStatus = "new" | "acknowledged" | "investigating" | "resolved" | "dismissed";
type AlertType = "loss_ratio_spike" | "claim_surge" | "premium_drop" | "profitability_decline" | "concentration_risk" | "fraud_suspected";

interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description: string;
  metric: string;
  currentValue: string;
  expectedValue: string;
  deviation: string;
  product: string;
  region: string;
  detectedAt: string;
  affectedPeriod: string;
  _raw?: {
    timestamp: string;
    alertId: string;
    entityId: string;
  };
}

interface AlertStats {
  total: number;
  open: number;
  critical: number;
  warning: number;
  info: number;
  recentCount: number;
}

const productIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  motor: Car,
  health: Heart,
  property: Home,
  life: Users,
  marine: TrendingUp,
};

export default function AlertsPage() {
  const { t } = useTranslation("app");
  const [alertsData, setAlertsData] = useState<Alert[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | "all">("all");
  const [statusFilter, setStatusFilter] = useState<AlertStatus | "all">("all");

  // Fetch alerts from API
  useEffect(() => {
    async function fetchAlerts() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/alerts?entityId=risk-radar&limit=50");
        if (!res.ok) throw new Error("Failed to fetch alerts");
        const data = await res.json();
        setAlertsData(data.alerts || []);
        setStats(data.stats || null);
      } catch (err) {
        console.error("Error fetching alerts:", err);
        setError("Failed to load alerts. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchAlerts();
  }, []);

  // Refresh function
  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/alerts?entityId=risk-radar&limit=50");
      if (!res.ok) throw new Error("Failed to fetch alerts");
      const data = await res.json();
      setAlertsData(data.alerts || []);
      setStats(data.stats || null);
    } catch (err) {
      console.error("Error refreshing alerts:", err);
      setError("Failed to refresh alerts.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAlerts = alertsData.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter;
    const matchesStatus = statusFilter === "all" || alert.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityClass = (severity: AlertSeverity) => {
    switch (severity) {
      case "critical":
        return "alert-badge-critical";
      case "warning":
        return "alert-badge-warning";
      default:
        return "alert-badge-info";
    }
  };

  const getStatusClass = (status: AlertStatus) => {
    switch (status) {
      case "new":
        return "bg-primary/10 text-primary";
      case "acknowledged":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
      case "investigating":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300";
      case "resolved":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
      case "dismissed":
        return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
      default:
        return "";
    }
  };

  const getAlertCardClass = (severity: AlertSeverity) => {
    switch (severity) {
      case "critical":
        return "alert-card-critical";
      case "warning":
        return "alert-card-warning";
      default:
        return "alert-card-info";
    }
  };

  // Calculate counts from local data if stats not available
  const criticalCount = stats?.critical ?? alertsData.filter((a) => a.severity === "critical").length;
  const openCount = stats?.open ?? alertsData.filter((a) => a.status !== "resolved" && a.status !== "dismissed").length;
  const totalCount = stats?.total ?? alertsData.length;

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold">{t("alerts.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("alerts.subtitle")}</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="metric-card">
              <CardContent className="p-4 flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      {[1, 2, 3, 4].map((j) => (
                        <div key={j} className="space-y-2">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-5 w-20" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold">{t("alerts.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("alerts.subtitle")}</p>
        </div>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-semibold">Error Loading Alerts</h3>
            <p className="text-muted-foreground mt-1">{error}</p>
            <Button onClick={handleRefresh} className="mt-4 gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("alerts.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("alerts.subtitle")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="metric-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono">{totalCount}</div>
              <div className="text-xs text-muted-foreground">{t("alerts.totalAlerts")}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Eye className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono">{openCount}</div>
              <div className="text-xs text-muted-foreground">{t("alerts.openAlerts")}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[hsl(0,72%,95%)] dark:bg-[hsl(0,72%,15%)]">
              <AlertTriangle className="h-4 w-4 text-[hsl(0,72%,51%)]" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-[hsl(0,72%,51%)]">
                {criticalCount}
              </div>
              <div className="text-xs text-muted-foreground">{t("alerts.criticalAlerts")}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("alerts.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              {t("alerts.severity")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSeverityFilter("all")}>
              {t("alerts.types.all")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSeverityFilter("critical")}>
              {t("dashboard.alerts.critical")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSeverityFilter("warning")}>
              {t("dashboard.alerts.warning")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSeverityFilter("info")}>
              {t("dashboard.alerts.info")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SortDesc className="h-4 w-4" />
              {t("alerts.status.all")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>
              {t("alerts.status.all")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("new")}>
              {t("alerts.status.new")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("acknowledged")}>
              {t("alerts.status.acknowledged")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("investigating")}>
              {t("alerts.status.investigating")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("resolved")}>
              {t("alerts.status.resolved")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {(severityFilter !== "all" || statusFilter !== "all" || searchQuery) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSeverityFilter("all");
              setStatusFilter("all");
              setSearchQuery("");
            }}
          >
            {t("alerts.clearFilters")}
          </Button>
        )}
      </div>

      {/* Alerts List */}
      <TooltipProvider>
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <Card className="animate-fade-in">
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-[hsl(152,60%,40%)]" />
                <h3 className="text-lg font-semibold">{t("alerts.empty.title")}</h3>
                <p className="text-muted-foreground mt-1">
                  {t("alerts.empty.description")}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredAlerts.map((alert, index) => {
              const ProductIcon = productIcons[alert.product] || AlertTriangle;
              const isCritical = alert.severity === "critical";
              const isNew = alert.status === "new";

              return (
                <Card
                  key={alert.id}
                  className={cn(
                    "alert-card relative overflow-hidden transition-all duration-300 hover-scale",
                    getAlertCardClass(alert.severity),
                    "animate-stagger animate-slide-in-up",
                    index === 0 && "delay-100",
                    index === 1 && "delay-200",
                    index === 2 && "delay-300",
                    index === 3 && "delay-400",
                    index >= 4 && "delay-500"
                  )}
                >
                  {/* Critical pulse glow effect */}
                  {isCritical && isNew && (
                    <div className="absolute inset-0 border-2 border-[hsl(0,72%,51%)] rounded-lg animate-pulse-glow pointer-events-none" />
                  )}

                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Product Icon with pulse for critical */}
                      <div className={cn(
                        "p-3 rounded-lg shrink-0 transition-colors duration-300",
                        isCritical
                          ? "bg-[hsl(0,72%,95%)] dark:bg-[hsl(0,72%,15%)]"
                          : "bg-muted"
                      )}>
                        <ProductIcon className={cn(
                          "h-5 w-5",
                          isCritical && "text-[hsl(0,72%,51%)]"
                        )} />
                        {/* Pulse indicator for critical alerts */}
                        {isCritical && isNew && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(0,72%,51%)] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-[hsl(0,72%,51%)]"></span>
                          </span>
                        )}
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={cn(
                                "alert-badge",
                                getSeverityClass(alert.severity),
                                isCritical && isNew && "animate-pulse"
                              )}>
                                {isCritical && <Zap className="h-3 w-3 mr-1" />}
                                {t(`dashboard.alerts.${alert.severity}`)}
                              </span>
                              <Badge className={getStatusClass(alert.status)}>
                                {t(`alerts.status.${alert.status}`)}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {alert.detectedAt}
                              </span>
                            </div>
                            <h3 className="font-semibold">{alert.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {alert.description}
                            </p>
                          </div>

                          {/* Actions */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/80">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>{t("alerts.actions.acknowledge")}</DropdownMenuItem>
                              <DropdownMenuItem>{t("alerts.actions.investigate")}</DropdownMenuItem>
                              <DropdownMenuItem>{t("alerts.actions.resolve")}</DropdownMenuItem>
                              <DropdownMenuItem className="text-muted-foreground">{t("alerts.actions.dismiss")}</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-3 bg-muted/50 rounded-lg">
                          <div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              {t("alerts.card.metric")}
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">The key performance indicator being monitored</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <div className="font-medium">{alert.metric}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">{t("alerts.card.current")}</div>
                            <div className={cn(
                              "font-mono font-semibold transition-colors duration-300",
                              isCritical ? "text-[hsl(0,72%,51%)]" : "text-[hsl(45,90%,50%)]"
                            )}>
                              {alert.currentValue}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">{t("alerts.card.expected")}</div>
                            <div className="font-mono text-[hsl(152,60%,40%)]">{alert.expectedValue}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">{t("alerts.card.deviation")}</div>
                            <div
                              className={cn(
                                "font-mono font-semibold",
                                alert.deviation.startsWith("+")
                                  ? "text-[hsl(0,72%,51%)]"
                                  : "text-[hsl(152,60%,40%)]"
                              )}
                            >
                              {alert.deviation}
                            </div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <ProductIcon className="h-3 w-3" />
                            {t(`dashboard.products.${alert.product}`)}
                          </span>
                          <span>•</span>
                          <span>{alert.region}</span>
                          <span>•</span>
                          <span>{t("alerts.card.affectedPeriod")}: {alert.affectedPeriod}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </TooltipProvider>
    </div>
  );
}
