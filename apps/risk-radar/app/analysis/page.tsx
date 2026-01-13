"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@tasco/i18n";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Skeleton,
} from "@tasco/ui";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Car,
  Heart,
  Home,
  Users,
  Anchor,
  Shield,
  Info,
  RefreshCw,
  AlertTriangle,
} from "@tasco/ui/icons";
import { cn } from "@tasco/ui/lib/utils";

// Types for API responses
interface MonthlyTrend {
  month: string;
  period: string;
  lossRatio: number;
  premiums: number;
  claims: number;
}

interface ProductMetric {
  name: string;
  icon: string;
  color: string;
  lossRatio: number;
  premiums: number;
  claims: number;
  policies: number;
  claimsCount: number;
  avgClaimSize: number;
}

interface RegionMetric {
  region: string;
  premiums: number;
  claims: number;
  lossRatio: number;
  policies: number;
}

interface AnalysisSummary {
  avgLossRatio: number;
  totalPremiums: string;
  totalClaims: string;
  totalPolicies: number;
  totalClaimsCount: number;
  avgClaimSize: number;
}

interface AnalysisData {
  monthlyTrends: MonthlyTrend[];
  productMetrics: ProductMetric[];
  regionMetrics: RegionMetric[];
  summary: AnalysisSummary;
}

// Icon mapping for products
const productIconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  motor: Car,
  health: Heart,
  property: Home,
  life: Users,
  liability: Shield,
  marine: Anchor,
};

export default function AnalysisPage() {
  const { t } = useTranslation("app");
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [data, setData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/trends?entityId=risk-radar&type=all");
        if (!res.ok) throw new Error("Failed to fetch analysis data");
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Error fetching analysis data:", err);
        setError("Failed to load analysis data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Refresh function
  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/trends?entityId=risk-radar&type=all");
      if (!res.ok) throw new Error("Failed to fetch analysis data");
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Error refreshing analysis data:", err);
      setError("Failed to refresh data.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000) return `₫${(value / 1000).toFixed(1)}B`;
    return `₫${value}M`;
  };

  // Calculate totals from product data (or use API summary)
  const productMetrics = data?.productMetrics || [];
  const monthlyTrends = data?.monthlyTrends || [];
  const regionMetrics = data?.regionMetrics || [];

  const totalPremiums = data?.summary?.totalPremiums
    ? parseFloat(data.summary.totalPremiums.replace(/[₫BM,]/g, "")) * (data.summary.totalPremiums.includes("B") ? 1000 : 1)
    : productMetrics.reduce((sum, p) => sum + p.premiums, 0);
  const totalClaims = data?.summary?.totalClaims
    ? parseFloat(data.summary.totalClaims.replace(/[₫BM,]/g, "")) * (data.summary.totalClaims.includes("B") ? 1000 : 1)
    : productMetrics.reduce((sum, p) => sum + p.claims, 0);
  const avgLossRatio = data?.summary?.avgLossRatio ?? (totalClaims && totalPremiums ? (totalClaims / totalPremiums) * 100 : 0);
  const totalPolicies = data?.summary?.totalPolicies ?? productMetrics.reduce((sum, p) => sum + p.policies, 0);
  const totalClaimsCount = data?.summary?.totalClaimsCount ?? productMetrics.reduce((sum, p) => sum + p.claimsCount, 0);
  const avgClaimSize = data?.summary?.avgClaimSize ?? (totalClaimsCount ? totalClaims / totalClaimsCount : 0);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("analysis.title")}</h1>
            <p className="text-muted-foreground mt-1">{t("analysis.subtitle")}</p>
          </div>
          <Skeleton className="h-9 w-24" />
        </div>

        {/* Summary Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="metric-card">
              <CardContent className="p-4">
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <Skeleton className="h-10 w-80" />

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-6" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <div className="space-y-2 text-right">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold">{t("analysis.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("analysis.subtitle")}</p>
        </div>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-semibold">Error Loading Data</h3>
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
          <h1 className="text-2xl font-bold">{t("analysis.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("analysis.subtitle")}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            Q4 2024
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <TooltipProvider>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="metric-card animate-stagger animate-slide-in-up delay-100 hover-lift">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                {t("analysis.metrics.averageLossRatio")}
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px]">
                    <p className="text-xs">{t("analysis.metrics.averageLossRatioTooltip")}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className={cn(
                "text-2xl font-bold font-mono mt-1 animate-count-up",
                avgLossRatio > 65 ? "text-[hsl(0,72%,51%)]" :
                avgLossRatio > 55 ? "text-[hsl(45,90%,50%)]" :
                "text-[hsl(152,60%,40%)]"
              )}>
                {avgLossRatio.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
          <Card className="metric-card animate-stagger animate-slide-in-up delay-150 hover-lift">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                {t("analysis.metrics.totalPremiums")}
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px]">
                    <p className="text-xs">{t("analysis.metrics.totalPremiumsTooltip")}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-2xl font-bold font-mono mt-1 text-[hsl(152,60%,40%)] animate-count-up">
                {formatCurrency(totalPremiums)}
              </div>
            </CardContent>
          </Card>
          <Card className="metric-card animate-stagger animate-slide-in-up delay-200 hover-lift">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                {t("analysis.metrics.totalClaims")}
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px]">
                    <p className="text-xs">{t("analysis.metrics.totalClaimsTooltip")}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-2xl font-bold font-mono mt-1 text-[hsl(0,72%,51%)] animate-count-up">
                {formatCurrency(totalClaims)}
              </div>
            </CardContent>
          </Card>
          <Card className="metric-card animate-stagger animate-slide-in-up delay-300 hover-lift">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                {t("analysis.metrics.claimsCount")}
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px]">
                    <p className="text-xs">{t("analysis.metrics.claimsCountTooltip")}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-2xl font-bold font-mono mt-1 animate-count-up">
                {totalClaimsCount.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="metric-card animate-stagger animate-slide-in-up delay-400 hover-lift">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                {t("analysis.metrics.avgClaimSize")}
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px]">
                    <p className="text-xs">{t("analysis.metrics.avgClaimSizeTooltip")}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-2xl font-bold font-mono mt-1 animate-count-up">
                ₫{avgClaimSize.toFixed(1)}M
              </div>
            </CardContent>
          </Card>
          <Card className="metric-card animate-stagger animate-slide-in-up delay-500 hover-lift">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                {t("analysis.metrics.policyCount")}
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px]">
                    <p className="text-xs">{t("analysis.metrics.policyCountTooltip")}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-2xl font-bold font-mono mt-1 animate-count-up">
                {totalPolicies.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            {t("analysis.sections.overview")}
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            {t("analysis.sections.trends")}
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="gap-2">
            <PieChart className="h-4 w-4" />
            {t("analysis.sections.breakdown")}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Performance */}
            <Card className="animate-stagger animate-slide-in-up delay-100">
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("analysis.charts.productPerformance")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productMetrics.map((product, index) => {
                    const ProductIcon = productIconMap[product.name] || TrendingUp;
                    return (
                      <div
                        key={product.name}
                        className={cn(
                          "flex items-center gap-4 p-2 -m-2 rounded-lg transition-all duration-200",
                          "hover:bg-muted/30 cursor-default"
                        )}
                      >
                        <div
                          className="p-2 rounded-lg transition-transform duration-200 hover:scale-110"
                          style={{ backgroundColor: `${product.color}15` }}
                        >
                          <ProductIcon className="h-4 w-4" style={{ color: product.color }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">
                              {t(`dashboard.products.${product.name}`)}
                            </span>
                            <span
                              className={cn(
                                "text-sm font-mono font-semibold transition-colors duration-300",
                                product.lossRatio > 65
                                  ? "text-[hsl(0,72%,51%)]"
                                  : product.lossRatio > 55
                                  ? "text-[hsl(45,90%,50%)]"
                                  : "text-[hsl(152,60%,40%)]"
                              )}
                            >
                              {product.lossRatio}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <div
                              className="h-2 rounded-full transition-all duration-700 ease-out"
                              style={{
                                width: `${Math.min(product.lossRatio, 100)}%`,
                                backgroundColor: product.color,
                                animationDelay: `${index * 100}ms`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Regional Breakdown */}
            <Card className="animate-stagger animate-slide-in-up delay-200">
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("analysis.charts.regionBreakdown")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {regionMetrics.map((region, idx) => (
                    <div
                      key={region.region}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-all duration-200",
                        "hover:bg-muted/30 hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-sm cursor-default"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "text-lg font-bold w-6 transition-colors duration-200",
                          idx === 0 ? "text-[hsl(45,90%,50%)]" : "text-muted-foreground"
                        )}>
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-medium">{region.region}</div>
                          <div className="text-xs text-muted-foreground">
                            {region.policies.toLocaleString()} {t("dashboard.metrics.policies")}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-semibold">
                          {formatCurrency(region.premiums)}
                        </div>
                        <div
                          className={cn(
                            "text-xs font-mono font-medium",
                            region.lossRatio > 62
                              ? "text-[hsl(0,72%,51%)]"
                              : "text-[hsl(152,60%,40%)]"
                          )}
                        >
                          LR: {region.lossRatio}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {t("analysis.charts.lossRatioTrend")}
              </CardTitle>
              <div className="flex gap-2">
                {["daily", "weekly", "monthly", "quarterly"].map((period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPeriod(period)}
                  >
                    {t(`dashboard.trends.${period}`)}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {/* Simple bar chart visualization */}
              <div className="h-64 flex items-end gap-4 px-4">
                {monthlyTrends.map((data, idx) => (
                  <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-lg bg-primary transition-all duration-500"
                      style={{ height: `${(data.lossRatio / 70) * 100}%` }}
                    />
                    <span className="text-xs text-muted-foreground">{data.month}</span>
                    <span className="text-xs font-mono font-medium">{data.lossRatio}%</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-primary" />
                  {t("dashboard.metrics.lossRatio")}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premiums vs Claims */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("analysis.charts.premiumVsClaims")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end gap-2 px-4">
                {monthlyTrends.map((data) => (
                  <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex gap-1">
                      <div
                        className="flex-1 rounded-t-lg bg-[hsl(152,60%,40%)] transition-all duration-500"
                        style={{ height: `${(data.premiums / 50) * 100}px` }}
                      />
                      <div
                        className="flex-1 rounded-t-lg bg-[hsl(0,72%,51%)] transition-all duration-500"
                        style={{ height: `${(data.claims / 50) * 100}px` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{data.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[hsl(152,60%,40%)]" />
                  {t("dashboard.metrics.premiums")}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[hsl(0,72%,51%)]" />
                  {t("dashboard.metrics.claims")}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Breakdown Tab */}
        <TabsContent value="breakdown" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productMetrics.map((product, index) => {
              const ProductIcon = productIconMap[product.name] || TrendingUp;
              return (
                <Card
                  key={product.name}
                  className={cn(
                    "metric-card hover-lift animate-stagger animate-slide-in-up",
                    index === 0 && "delay-100",
                    index === 1 && "delay-150",
                    index === 2 && "delay-200",
                    index === 3 && "delay-300",
                    index === 4 && "delay-400",
                    index >= 5 && "delay-500"
                  )}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2.5 rounded-lg transition-transform duration-200 hover:scale-110"
                        style={{ backgroundColor: `${product.color}15` }}
                      >
                        <ProductIcon className="h-5 w-5" style={{ color: product.color }} />
                      </div>
                      <CardTitle className="text-base">
                        {t(`dashboard.products.${product.name}`)}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          {t("dashboard.metrics.lossRatio")}
                        </span>
                        <span
                          className={`font-mono font-semibold ${
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
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          {t("dashboard.metrics.premiums")}
                        </span>
                        <span className="font-mono">{formatCurrency(product.premiums)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          {t("dashboard.metrics.claims")}
                        </span>
                        <span className="font-mono">{formatCurrency(product.claims)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          {t("analysis.metrics.claimsCount")}
                        </span>
                        <span className="font-mono">{product.claimsCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          {t("analysis.metrics.avgClaimSize")}
                        </span>
                        <span className="font-mono">₫{product.avgClaimSize.toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          {t("analysis.metrics.policyCount")}
                        </span>
                        <span className="font-mono">{product.policies.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
