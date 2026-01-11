"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Skeleton,
} from "@tasco/ui";
import {
  Calendar as CalendarIcon,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  ChevronRight,
  Plus,
  Sparkles,
  Tag,
  Gift,
  Percent,
  Zap,
} from "@tasco/ui/icons";
import { useTranslation } from "@tasco/i18n";
import type { Promotion, ConflictDetectionResult } from "@tasco/db";

// Promotion type icons
const TYPE_ICONS: Record<string, React.ReactNode> = {
  discount: <Percent className="h-4 w-4" />,
  bundle: <Gift className="h-4 w-4" />,
  "free-item": <Tag className="h-4 w-4" />,
  loyalty: <Sparkles className="h-4 w-4" />,
  coupon: <Zap className="h-4 w-4" />,
};

// Promotion type colors for timeline bars
const TYPE_COLORS: Record<string, string> = {
  discount: "from-emerald-500 to-emerald-600",
  bundle: "from-blue-500 to-blue-600",
  "free-item": "from-purple-500 to-purple-600",
  loyalty: "from-amber-500 to-amber-600",
  coupon: "from-rose-500 to-rose-600",
};

export default function CalendarPage() {
  const { t } = useTranslation("app");
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [conflicts, setConflicts] = useState<ConflictDetectionResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [promoRes, conflictRes] = await Promise.all([
          fetch("/api/promotions"),
          fetch("/api/conflicts"),
        ]);

        if (promoRes.ok) {
          const data = await promoRes.json();
          setPromotions(data.items || []);
        }

        if (conflictRes.ok) {
          const data = await conflictRes.json();
          setConflicts(data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Categorize promotions
  const now = new Date();
  const activePromotions = promotions.filter(
    (p) => p.status === "active" && new Date(p.startDate) <= now && new Date(p.endDate) >= now
  );
  const upcomingPromotions = promotions.filter(
    (p) => p.status === "active" && new Date(p.startDate) > now
  );
  const draftPromotions = promotions.filter((p) => p.status === "draft");

  // Get next 30 days range for timeline
  const timelineStart = useMemo(() => new Date(), []);
  const timelineEnd = useMemo(() => {
    const end = new Date();
    end.setDate(end.getDate() + 30);
    return end;
  }, []);

  // Generate timeline days
  const timelineDays = useMemo(() => {
    const days = [];
    const current = new Date(timelineStart);
    while (current <= timelineEnd) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [timelineStart, timelineEnd]);

  // Filter promotions for timeline
  const timelinePromotions = promotions.filter((p) => {
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);
    return (
      (p.status === "active" || p.status === "draft") &&
      start <= timelineEnd &&
      end >= timelineStart
    );
  });

  // Calculate timeline position and width for a promotion
  const getTimelinePosition = (promo: Promotion) => {
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);
    const totalDays = 30;

    const startDay = Math.max(0, Math.floor((start.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)));
    const endDay = Math.min(totalDays, Math.ceil((end.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)));

    const left = (startDay / totalDays) * 100;
    const width = ((endDay - startDay) / totalDays) * 100;

    return { left: `${left}%`, width: `${Math.max(width, 3)}%` };
  };

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
              <Skeleton key={i} className="h-32 shimmer" />
            ))}
          </div>
          <Skeleton className="h-96 shimmer" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-full flex-col overflow-auto">
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <CalendarIcon className="h-6 w-6 text-primary" />
              {t("calendar.title", "Promotion Calendar")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("calendar.subtitle", "View all promotions on a timeline")}
            </p>
          </div>
          <Button
            className="btn-premium gap-2"
            onClick={() => router.push("/promotions/new")}
          >
            <Plus className="h-4 w-4" />
            {t("newPromotion", "New Promotion")}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="stat-card group cursor-pointer" onClick={() => router.push("/promotions?status=active")}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="stat-icon bg-emerald-100 text-emerald-600">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                  {t("calendar.activeNow", "Active Now")}
                </span>
              </div>
              <div className="mt-4">
                <div className="stat-value text-3xl">{activePromotions.length}</div>
                <p className="stat-label mt-1">
                  {t("promotions.status.active", "Active promotions")}
                </p>
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardContent>
          </Card>

          <Card className="stat-card group cursor-pointer" onClick={() => router.push("/promotions?status=upcoming")}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="stat-icon bg-blue-100 text-blue-600">
                  <Clock className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                  {t("calendar.upcoming", "Upcoming")}
                </span>
              </div>
              <div className="mt-4">
                <div className="stat-value text-3xl">{upcomingPromotions.length}</div>
                <p className="stat-label mt-1">
                  {t("promotions.status.upcoming", "Starting soon")}
                </p>
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardContent>
          </Card>

          <Card className="stat-card group cursor-pointer" onClick={() => router.push("/promotions?status=draft")}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="stat-icon bg-slate-100 text-slate-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                  {t("calendar.drafts", "Drafts")}
                </span>
              </div>
              <div className="mt-4">
                <div className="stat-value text-3xl">{draftPromotions.length}</div>
                <p className="stat-label mt-1">
                  {t("promotions.status.pending", "Pending approval")}
                </p>
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-slate-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardContent>
          </Card>

          <Card
            className={`stat-card group cursor-pointer transition-all ${
              conflicts && conflicts.conflictsFound > 0
                ? "ring-2 ring-red-200 bg-red-50/50"
                : ""
            }`}
            onClick={() => router.push("/alerts")}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className={`stat-icon ${
                  conflicts && conflicts.conflictsFound > 0
                    ? "bg-red-100 text-red-600"
                    : "bg-slate-100 text-slate-400"
                }`}>
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <span className={`text-xs font-medium uppercase tracking-wide ${
                  conflicts && conflicts.conflictsFound > 0
                    ? "text-red-600"
                    : "text-slate-400"
                }`}>
                  {t("calendar.conflicts", "Conflicts")}
                </span>
              </div>
              <div className="mt-4">
                <div className="stat-value text-3xl">{conflicts?.conflictsFound || 0}</div>
                <div className="flex gap-1.5 mt-2">
                  {conflicts && conflicts.criticalCount > 0 && (
                    <span className="badge-status-critical text-xs">
                      {conflicts.criticalCount} {t("alerts.severity.critical", "Critical")}
                    </span>
                  )}
                  {conflicts && conflicts.warningCount > 0 && (
                    <span className="badge-status-warning text-xs">
                      {conflicts.warningCount} {t("alerts.severity.warning", "Warning")}
                    </span>
                  )}
                </div>
              </div>
              {conflicts && conflicts.conflictsFound > 0 && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Visual Timeline */}
        <Card className="card-premium overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                  </span>
                  {t("calendar.timeline", "Timeline")} — {t("calendar.next30Days", "Next 30 Days")}
                </CardTitle>
                <CardDescription className="mt-1">
                  {t("calendar.subtitle", "View all promotions on a timeline")}
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => router.push("/promotions")} className="gap-1">
                {t("calendar.viewAll", "View All")}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {timelinePromotions.length === 0 ? (
              <div className="empty-state py-16">
                <div className="empty-state-icon">
                  <CalendarIcon className="h-8 w-8" />
                </div>
                <h3 className="empty-state-title">
                  {t("empty.calendar.title", "No promotions scheduled")}
                </h3>
                <p className="empty-state-description">
                  {t("empty.calendar.description", "Your promotion calendar is empty. Create a promotion to see it on the timeline.")}
                </p>
                <Button className="btn-premium mt-6 gap-2" onClick={() => router.push("/promotions/new")}>
                  <Plus className="h-4 w-4" />
                  {t("empty.calendar.action", "Create Promotion")}
                </Button>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline header with days */}
                <div className="sticky top-0 z-10 border-b bg-muted/50 backdrop-blur-sm">
                  <div className="flex h-12 items-end px-4">
                    <div className="w-48 shrink-0" />
                    <div className="relative flex-1">
                      <div className="flex justify-between text-xs text-muted-foreground pb-2">
                        {[0, 7, 14, 21, 28].map((day) => {
                          const date = new Date(timelineStart);
                          date.setDate(date.getDate() + day);
                          return (
                            <span key={day} className="font-medium">
                              {date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div className="w-24 shrink-0" />
                  </div>
                </div>

                {/* Timeline rows */}
                <div className="divide-y">
                  {timelinePromotions.map((promo, index) => {
                    const start = new Date(promo.startDate);
                    const end = new Date(promo.endDate);
                    const isActive = start <= now && end >= now;
                    const hasConflict = conflicts?.conflicts.some(
                      (c) => c.promotionIds.includes(promo.promotionId)
                    );
                    const position = getTimelinePosition(promo);

                    return (
                      <div
                        key={promo.promotionId}
                        className={`promotion-card flex items-center gap-4 px-4 py-4 cursor-pointer transition-all ${
                          hasConflict ? "bg-red-50/50" : ""
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => router.push(`/promotions/${promo.promotionId}`)}
                      >
                        {/* Promotion info */}
                        <div className="w-48 shrink-0">
                          <div className="flex items-center gap-2">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${
                              TYPE_COLORS[promo.type] || "from-slate-500 to-slate-600"
                            } text-white`}>
                              {TYPE_ICONS[promo.type] || <Tag className="h-4 w-4" />}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium truncate text-sm">{promo.name}</div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`badge-status-${promo.status} text-xs`}>
                                  {t(`promotions.status.${promo.status}`, promo.status)}
                                </span>
                                {hasConflict && (
                                  <span className="badge-status-critical text-xs flex items-center gap-0.5">
                                    <AlertTriangle className="h-3 w-3" />
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Timeline bar */}
                        <div className="relative flex-1 h-10">
                          <div className="absolute inset-0 flex items-center">
                            {/* Background grid lines */}
                            <div className="absolute inset-0 flex">
                              {[0, 1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex-1 border-l border-dashed border-muted first:border-l-0" />
                              ))}
                            </div>

                            {/* Promotion bar */}
                            <div
                              className={`absolute h-7 rounded-full bg-gradient-to-r ${
                                TYPE_COLORS[promo.type] || "from-slate-500 to-slate-600"
                              } ${isActive ? "ring-2 ring-offset-1 ring-primary/30" : ""} ${
                                hasConflict ? "ring-2 ring-offset-1 ring-red-400" : ""
                              } shadow-sm transition-all hover:scale-y-110 hover:shadow-md`}
                              style={{ left: position.left, width: position.width }}
                            >
                              {/* Active indicator */}
                              {isActive && (
                                <div className="absolute -left-1 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white border-2 border-primary animate-pulse" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Discount value */}
                        <div className="w-24 shrink-0 text-right">
                          <div className="font-semibold text-primary">
                            {promo.discountType === "percentage"
                              ? `${promo.discountValue}%`
                              : `${(promo.discountValue / 1000).toFixed(0)}K`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {t("common.off", "off")}
                          </div>
                        </div>

                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="border-t bg-muted/30 px-4 py-3">
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <span className="text-muted-foreground font-medium">{t("promotions.form.type", "Type")}:</span>
                    {Object.entries(TYPE_COLORS).map(([type, color]) => (
                      <div key={type} className="flex items-center gap-1.5">
                        <div className={`h-3 w-3 rounded-full bg-gradient-to-r ${color}`} />
                        <span className="capitalize">{t(`promotions.type.${type}`, type)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Critical Conflict Alert Banner */}
        {conflicts && conflicts.criticalCount > 0 && (
          <Card className="conflict-card animate-pulse-slow overflow-hidden">
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 ring-4 ring-red-50">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-900 text-lg">
                    {conflicts.criticalCount} {t("alerts.criticalIssues", "Critical Issues")} {t("alerts.requireAttention", "Require immediate attention")}
                  </h3>
                  <p className="text-sm text-red-700 mt-0.5">
                    {t("alerts.subtitle", "Review and resolve promotion conflicts")}
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                className="gap-2 shadow-lg"
                onClick={() => router.push("/alerts")}
              >
                <AlertTriangle className="h-4 w-4" />
                {t("alerts.resolve", "Resolve")}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats Summary */}
        {promotions.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{promotions.length}</div>
                    <div className="text-sm text-muted-foreground">{t("analytics.totalPromotions", "Total Promotions")}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/5 to-transparent border-amber-200/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                    <Percent className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {promotions.filter(p => p.discountType === "percentage").length > 0
                        ? `${Math.round(
                            promotions
                              .filter(p => p.discountType === "percentage")
                              .reduce((sum, p) => sum + p.discountValue, 0) /
                            promotions.filter(p => p.discountType === "percentage").length
                          )}%`
                        : "—"
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">{t("analytics.avgDiscount", "Avg. Discount")}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-200/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                    <Sparkles className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {new Set(promotions.flatMap(p => p.targetSegments || [])).size}
                    </div>
                    <div className="text-sm text-muted-foreground">{t("analytics.segmentsCovered", "Segments Covered")}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
