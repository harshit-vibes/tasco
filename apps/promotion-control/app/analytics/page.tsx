"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Skeleton,
} from "@tasco/ui";
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  Percent,
  Gift,
  CreditCard,
  Star,
  RefreshCw,
  ArrowUpRight,
  Zap,
  Tag,
  ShoppingCart,
  Store,
  Globe,
  Truck,
} from "@tasco/ui/icons";
import { useTranslation } from "@tasco/i18n";
import { toast } from "sonner";
import type { Promotion } from "@tasco/db";

// Animated chart bar component
function ChartBar({
  label,
  value,
  maxValue,
  color,
  gradient,
  showPercentage = false,
  index = 0,
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  gradient?: string;
  showPercentage?: boolean;
  index?: number;
}) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

  return (
    <div
      className="space-y-2 animate-in fade-in slide-in-from-left-2"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground">{value}</span>
          {showPercentage && maxValue > 0 && (
            <span className="text-xs text-muted-foreground">
              ({Math.round(percentage)}%)
            </span>
          )}
        </div>
      </div>
      <div className="h-3 w-full rounded-full bg-muted/50 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            gradient ? `bg-gradient-to-r ${gradient}` : color
          }`}
          style={{
            width: `${percentage}%`,
            transitionDelay: `${index * 50}ms`,
          }}
        />
      </div>
    </div>
  );
}

// Donut segment for visual pie chart
function DonutChart({
  data,
  colors,
  size = 160,
}: {
  data: { label: string; value: number }[];
  colors: string[];
  size?: number;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let cumulative = 0;

  if (total === 0) {
    return (
      <div
        className="relative rounded-full bg-muted/50 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-sm text-muted-foreground">No data</span>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="transform -rotate-90">
        {data.map((item, i) => {
          const percentage = (item.value / total) * 100;
          const strokeDasharray = `${percentage} ${100 - percentage}`;
          const strokeDashoffset = -cumulative;
          cumulative += percentage;

          return (
            <circle
              key={item.label}
              cx="50"
              cy="50"
              r="40"
              fill="none"
              strokeWidth="20"
              className={colors[i]}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: "stroke-dasharray 0.8s ease-out",
                transitionDelay: `${i * 100}ms`,
              }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{total}</span>
        <span className="text-xs text-muted-foreground">Total</span>
      </div>
    </div>
  );
}

// Type icons mapping
const TYPE_ICONS: Record<string, typeof Percent> = {
  discount: Percent,
  bundle: Package,
  "free-item": Gift,
  loyalty: Star,
  coupon: Zap,
};

// Type gradient colors
const TYPE_GRADIENTS: Record<string, string> = {
  discount: "from-emerald-500 to-emerald-600",
  bundle: "from-blue-500 to-blue-600",
  "free-item": "from-purple-500 to-purple-600",
  loyalty: "from-amber-500 to-amber-600",
  coupon: "from-rose-500 to-rose-600",
};

// Channel icons
const CHANNEL_ICONS: Record<string, typeof Store> = {
  all: Globe,
  ecommerce: ShoppingCart,
  retail: Store,
  wholesale: Truck,
  direct: Users,
};

export default function AnalyticsPage() {
  const { t } = useTranslation("app");
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPromotions();
  }, []);

  async function fetchPromotions() {
    try {
      const res = await fetch("/api/promotions");
      if (res.ok) {
        const data = await res.json();
        setPromotions(data.items || []);
      }
    } catch (error) {
      console.error("Error fetching promotions:", error);
      toast.error(t("common.error", "Failed to load data"));
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await fetchPromotions();
    setRefreshing(false);
    toast.success(t("common.refresh", "Refreshed"));
  }

  if (loading) {
    return (
      <main className="flex h-full flex-col p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 shimmer" />
            <Skeleton className="h-4 w-96 shimmer" />
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 shimmer" />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-80 shimmer" />
            <Skeleton className="h-80 shimmer" />
          </div>
        </div>
      </main>
    );
  }

  // Calculate statistics
  const statusStats = {
    active: promotions.filter((p) => p.status === "active").length,
    draft: promotions.filter((p) => p.status === "draft").length,
    paused: promotions.filter((p) => p.status === "paused").length,
    expired: promotions.filter((p) => p.status === "expired").length,
  };

  const typeStats = {
    discount: promotions.filter((p) => p.type === "discount").length,
    bundle: promotions.filter((p) => p.type === "bundle").length,
    "free-item": promotions.filter((p) => p.type === "free-item").length,
    loyalty: promotions.filter((p) => p.type === "loyalty").length,
    coupon: promotions.filter((p) => p.type === "coupon").length,
  };

  // Segment stats
  const segmentCounts: Record<string, number> = {};
  promotions.forEach((p) => {
    p.targetSegments.forEach((seg) => {
      segmentCounts[seg] = (segmentCounts[seg] || 0) + 1;
    });
  });

  // Channel stats
  const channelCounts: Record<string, number> = {};
  promotions.forEach((p) => {
    p.targetChannels.forEach((ch) => {
      channelCounts[ch] = (channelCounts[ch] || 0) + 1;
    });
  });

  // Average discount (percentage types)
  const percentagePromotions = promotions.filter((p) => p.discountType === "percentage");
  const avgDiscount =
    percentagePromotions.length > 0
      ? percentagePromotions.reduce((sum, p) => sum + p.discountValue, 0) /
        percentagePromotions.length
      : 0;

  const maxStatusCount = Math.max(...Object.values(statusStats), 1);
  const maxTypeCount = Math.max(...Object.values(typeStats), 1);
  const maxSegmentCount = Math.max(...Object.values(segmentCounts), 1);
  const maxChannelCount = Math.max(...Object.values(channelCounts), 1);

  // Donut chart data
  const statusDonutData = [
    { label: "Active", value: statusStats.active },
    { label: "Draft", value: statusStats.draft },
    { label: "Paused", value: statusStats.paused },
    { label: "Expired", value: statusStats.expired },
  ];
  const statusDonutColors = [
    "stroke-emerald-500",
    "stroke-slate-400",
    "stroke-amber-500",
    "stroke-red-400",
  ];

  return (
    <main className="flex h-full flex-col overflow-auto">
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              {t("analytics.title", "Analytics")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("analytics.subtitle", "Promotion performance and insights")}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {t("common.refresh", "Refresh")}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="stat-card group cursor-pointer" onClick={() => router.push("/promotions")}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="stat-icon bg-primary/10 text-primary">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="mt-4">
                <div className="stat-value text-3xl">{promotions.length}</div>
                <p className="stat-label mt-1">
                  {t("analytics.totalPromotions", "Total Promotions")}
                </p>
                <p className="text-xs text-emerald-600 font-medium mt-1">
                  {statusStats.active} {t("analytics.activeNow", "active now")}
                </p>
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="stat-icon bg-amber-100 text-amber-600">
                  <Percent className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-amber-600 uppercase tracking-wide">
                  Avg
                </span>
              </div>
              <div className="mt-4">
                <div className="stat-value text-3xl">{avgDiscount.toFixed(0)}%</div>
                <p className="stat-label mt-1">
                  {t("analytics.avgDiscount", "Avg. Discount")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("analytics.percentageOnly", "Percentage discounts only")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="stat-icon bg-blue-100 text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                  Coverage
                </span>
              </div>
              <div className="mt-4">
                <div className="stat-value text-3xl">
                  {Object.keys(segmentCounts).length}
                </div>
                <p className="stat-label mt-1">
                  {t("analytics.segmentsCovered", "Segments Covered")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("analytics.uniqueSegments", "Unique customer segments")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="stat-icon bg-purple-100 text-purple-600">
                  <Tag className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                  Types
                </span>
              </div>
              <div className="mt-4">
                <div className="stat-value text-3xl">
                  {Object.values(typeStats).filter((v) => v > 0).length}
                </div>
                <p className="stat-label mt-1">
                  {t("analytics.promotionTypes", "Promotion Types")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("analytics.typesInUse", "Different types in use")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* By Status */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </span>
                {t("analytics.byStatus", "By Status")}
              </CardTitle>
              <CardDescription>
                {t("analytics.statusDistribution", "Distribution of promotions by status")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8">
                <DonutChart
                  data={statusDonutData}
                  colors={statusDonutColors}
                  size={140}
                />
                <div className="flex-1 space-y-3">
                  <ChartBar
                    label={t("promotions.status.active", "Active")}
                    value={statusStats.active}
                    maxValue={maxStatusCount}
                    color=""
                    gradient="from-emerald-400 to-emerald-600"
                    showPercentage
                    index={0}
                  />
                  <ChartBar
                    label={t("promotions.status.draft", "Draft")}
                    value={statusStats.draft}
                    maxValue={maxStatusCount}
                    color=""
                    gradient="from-slate-300 to-slate-500"
                    showPercentage
                    index={1}
                  />
                  <ChartBar
                    label={t("promotions.status.paused", "Paused")}
                    value={statusStats.paused}
                    maxValue={maxStatusCount}
                    color=""
                    gradient="from-amber-400 to-amber-600"
                    showPercentage
                    index={2}
                  />
                  <ChartBar
                    label={t("promotions.status.expired", "Expired")}
                    value={statusStats.expired}
                    maxValue={maxStatusCount}
                    color=""
                    gradient="from-red-300 to-red-500"
                    showPercentage
                    index={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* By Type */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                  <Tag className="h-4 w-4 text-purple-600" />
                </span>
                {t("analytics.byType", "By Type")}
              </CardTitle>
              <CardDescription>
                {t("analytics.typeDistribution", "Distribution of promotions by type")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(typeStats).map(([type, count], index) => (
                <ChartBar
                  key={type}
                  label={t(`promotions.type.${type}`, type)}
                  value={count}
                  maxValue={maxTypeCount}
                  color=""
                  gradient={TYPE_GRADIENTS[type]}
                  showPercentage
                  index={index}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Segments and Channels Row */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* By Segment */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                  <Users className="h-4 w-4 text-blue-600" />
                </span>
                {t("analytics.bySegment", "By Customer Segment")}
              </CardTitle>
              <CardDescription>
                {t("analytics.segmentCoverage", "Promotions targeting each segment")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(segmentCounts).length > 0 ? (
                Object.entries(segmentCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([segment, count], index) => (
                    <ChartBar
                      key={segment}
                      label={t(`segments.${segment}`, segment)}
                      value={count}
                      maxValue={maxSegmentCount}
                      color=""
                      gradient="from-blue-400 to-indigo-600"
                      showPercentage
                      index={index}
                    />
                  ))
              ) : (
                <div className="py-8 text-center">
                  <Users className="h-8 w-8 mx-auto text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t("analytics.noSegments", "No segment data available")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* By Channel */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100">
                  <Store className="h-4 w-4 text-teal-600" />
                </span>
                {t("analytics.byChannel", "By Sales Channel")}
              </CardTitle>
              <CardDescription>
                {t("analytics.channelCoverage", "Promotions across sales channels")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(channelCounts).length > 0 ? (
                Object.entries(channelCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([channel, count], index) => (
                    <ChartBar
                      key={channel}
                      label={t(`channels.${channel}`, channel)}
                      value={count}
                      maxValue={maxChannelCount}
                      color=""
                      gradient="from-teal-400 to-cyan-600"
                      showPercentage
                      index={index}
                    />
                  ))
              ) : (
                <div className="py-8 text-center">
                  <Store className="h-8 w-8 mx-auto text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t("analytics.noChannels", "No channel data available")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Promotion Types Detail */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle>{t("analytics.typeBreakdown", "Promotion Type Details")}</CardTitle>
            <CardDescription>
              {t("analytics.typeDetails", "Overview of each promotion type")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              {Object.entries(TYPE_ICONS).map(([type, Icon], index) => {
                const count = typeStats[type as keyof typeof typeStats];
                const typePromotions = promotions.filter((p) => p.type === type);
                const activeCount = typePromotions.filter(
                  (p) => p.status === "active"
                ).length;
                const gradient = TYPE_GRADIENTS[type];

                return (
                  <div
                    key={type}
                    className="promotion-card flex flex-col items-center rounded-xl border p-5 text-center transition-all hover:shadow-lg cursor-pointer group"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => router.push(`/promotions?type=${type}`)}
                  >
                    <div
                      className={`rounded-xl p-3 bg-gradient-to-br ${gradient} text-white shadow-lg transform group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h4 className="mt-3 font-semibold text-sm">
                      {t(`promotions.type.${type}`, type)}
                    </h4>
                    <p className="text-3xl font-bold mt-1">{count}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <p className="text-xs text-muted-foreground">
                        {activeCount} {t("analytics.active", "active")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
