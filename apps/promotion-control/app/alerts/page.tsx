"use client";

import { useEffect, useState } from "react";
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
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Clock,
  Users,
  Package,
  Shield,
  Sparkles,
  Eye,
  Lightbulb,
  Calendar,
  Target,
  XCircle,
} from "@tasco/ui/icons";
import { useTranslation } from "@tasco/i18n";
import { toast } from "sonner";
import type { ConflictDetectionResult, PromotionConflict } from "@tasco/db";

// Conflict type icons
const TYPE_ICONS = {
  "time-overlap": Clock,
  "segment-overlap": Users,
  "stacking-violation": XCircle,
  "exclusion-rule": Package,
} as const;

// Resolution step guides for each conflict type
const RESOLUTION_GUIDES: Record<string, { icon: React.ReactNode; steps: string[] }> = {
  "time-overlap": {
    icon: <Calendar className="h-4 w-4" />,
    steps: [
      "Review the overlapping date ranges",
      "Adjust start/end dates of one promotion",
      "Consider if overlap is intentional",
      "Set priority levels if overlap is needed",
    ],
  },
  "segment-overlap": {
    icon: <Target className="h-4 w-4" />,
    steps: [
      "Check which customer segments overlap",
      "Decide which promotion takes priority",
      "Consider creating exclusive segments",
      "Enable stacking if discounts can combine",
    ],
  },
  "stacking-violation": {
    icon: <Ban className="h-4 w-4" />,
    steps: [
      "Review stacking rules on both promotions",
      "Enable 'Stackable' if combination is allowed",
      "Add to exclusion list if not allowed",
      "Set priority to determine which applies first",
    ],
  },
  "exclusion-rule": {
    icon: <XCircle className="h-4 w-4" />,
    steps: [
      "Check exclusion rules on each promotion",
      "Remove from exclusion list if intended",
      "Verify product/category exclusions",
      "Update rules to allow combination",
    ],
  },
};

export default function AlertsPage() {
  const { t } = useTranslation("app");
  const router = useRouter();
  const [result, setResult] = useState<ConflictDetectionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchConflicts();
  }, []);

  async function fetchConflicts() {
    try {
      const res = await fetch("/api/conflicts?includeInactive=true");
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (error) {
      console.error("Error fetching conflicts:", error);
      toast.error(t("common.error", "Failed to load conflicts"));
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/conflicts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ includeInactive: true }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        toast.success(t("common.success", "Analysis complete"));
      }
    } catch (error) {
      toast.error(t("common.error", "Failed to run analysis"));
    } finally {
      setRefreshing(false);
    }
  }

  const toggleExpanded = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <main className="flex h-full flex-col p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 shimmer" />
            <Skeleton className="h-4 w-96 shimmer" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 shimmer" />
            ))}
          </div>
          <Skeleton className="h-96 shimmer" />
        </div>
      </main>
    );
  }

  const conflicts = result?.conflicts || [];
  const criticalConflicts = conflicts.filter((c) => c.severity === "critical");
  const warningConflicts = conflicts.filter((c) => c.severity === "warning");
  const infoConflicts = conflicts.filter((c) => c.severity === "info");

  return (
    <main className="flex h-full flex-col overflow-auto">
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              {t("alerts.title", "Conflict Alerts")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("alerts.subtitle", "Review and resolve promotion conflicts")}
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
            variant={refreshing ? "outline" : "default"}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {t("alerts.runAnalysis", "Run Analysis")}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className={`stat-card group transition-all ${
            criticalConflicts.length > 0
              ? "ring-2 ring-red-200 bg-red-50/50"
              : ""
          }`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className={`stat-icon ${
                  criticalConflicts.length > 0
                    ? "bg-red-100 text-red-600"
                    : "bg-slate-100 text-slate-400"
                }`}>
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <span className={`text-xs font-medium uppercase tracking-wide ${
                  criticalConflicts.length > 0 ? "text-red-600" : "text-slate-400"
                }`}>
                  {t("alerts.severity.critical", "Critical")}
                </span>
              </div>
              <div className="mt-4">
                <div className="stat-value text-3xl">{criticalConflicts.length}</div>
                <p className="stat-label mt-1">
                  {t("alerts.requireAttention", "Require immediate attention")}
                </p>
              </div>
              {criticalConflicts.length > 0 && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-500/5 to-transparent" />
              )}
            </CardContent>
          </Card>

          <Card className={`stat-card group transition-all ${
            warningConflicts.length > 0
              ? "ring-2 ring-amber-200 bg-amber-50/50"
              : ""
          }`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className={`stat-icon ${
                  warningConflicts.length > 0
                    ? "bg-amber-100 text-amber-600"
                    : "bg-slate-100 text-slate-400"
                }`}>
                  <Clock className="h-5 w-5" />
                </div>
                <span className={`text-xs font-medium uppercase tracking-wide ${
                  warningConflicts.length > 0 ? "text-amber-600" : "text-slate-400"
                }`}>
                  {t("alerts.severity.warning", "Warning")}
                </span>
              </div>
              <div className="mt-4">
                <div className="stat-value text-3xl">{warningConflicts.length}</div>
                <p className="stat-label mt-1">
                  {t("alerts.shouldReview", "Should be reviewed")}
                </p>
              </div>
              {warningConflicts.length > 0 && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500/5 to-transparent" />
              )}
            </CardContent>
          </Card>

          <Card className="stat-card group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="stat-icon bg-blue-100 text-blue-600">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                  {t("alerts.severity.info", "Info")}
                </span>
              </div>
              <div className="mt-4">
                <div className="stat-value text-3xl">{infoConflicts.length}</div>
                <p className="stat-label mt-1">
                  {t("alerts.forInfo", "For your information")}
                </p>
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardContent>
          </Card>
        </div>

        {/* Last Analyzed */}
        {result?.analyzedAt && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {t("alerts.lastAnalyzed", "Last analyzed")}:{" "}
            <span className="font-medium">{new Date(result.analyzedAt).toLocaleString()}</span>
          </div>
        )}

        {/* Conflict List */}
        {conflicts.length === 0 ? (
          <Card className="empty-state py-16">
            <div className="empty-state-icon bg-emerald-100 text-emerald-600">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="empty-state-title text-emerald-900">
              {t("empty.alerts.title", "All Clear!")}
            </h3>
            <p className="empty-state-description">
              {t("empty.alerts.description", "No conflicts detected. Your promotions are configured correctly.")}
            </p>
            <Button
              className="mt-6 gap-2"
              variant="outline"
              onClick={() => router.push("/promotions")}
            >
              {t("empty.alerts.action", "View Promotions")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Critical Conflicts */}
            {criticalConflicts.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-red-900">
                    {t("alerts.criticalIssues", "Critical Issues")} ({criticalConflicts.length})
                  </h2>
                </div>
                {criticalConflicts.map((conflict, index) => (
                  <ConflictCard
                    key={conflict.conflictId}
                    conflict={conflict}
                    router={router}
                    t={t}
                    isExpanded={expandedCards.has(conflict.conflictId)}
                    onToggle={() => toggleExpanded(conflict.conflictId)}
                    index={index}
                  />
                ))}
              </div>
            )}

            {/* Warning Conflicts */}
            {warningConflicts.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-amber-900">
                    {t("alerts.warnings", "Warnings")} ({warningConflicts.length})
                  </h2>
                </div>
                {warningConflicts.map((conflict, index) => (
                  <ConflictCard
                    key={conflict.conflictId}
                    conflict={conflict}
                    router={router}
                    t={t}
                    isExpanded={expandedCards.has(conflict.conflictId)}
                    onToggle={() => toggleExpanded(conflict.conflictId)}
                    index={index}
                  />
                ))}
              </div>
            )}

            {/* Info Conflicts */}
            {infoConflicts.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-blue-900">
                    {t("alerts.information", "Information")} ({infoConflicts.length})
                  </h2>
                </div>
                {infoConflicts.map((conflict, index) => (
                  <ConflictCard
                    key={conflict.conflictId}
                    conflict={conflict}
                    router={router}
                    t={t}
                    isExpanded={expandedCards.has(conflict.conflictId)}
                    onToggle={() => toggleExpanded(conflict.conflictId)}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

// Conflict Card Component
function ConflictCard({
  conflict,
  router,
  t,
  isExpanded,
  onToggle,
  index,
}: {
  conflict: PromotionConflict;
  router: ReturnType<typeof useRouter>;
  t: (key: string, fallback?: string) => string;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}) {
  const TypeIcon = TYPE_ICONS[conflict.type] || AlertTriangle;
  const guide = RESOLUTION_GUIDES[conflict.type];

  const severityConfig = {
    critical: {
      border: "border-l-red-500",
      bg: "bg-red-50/50",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      badge: "badge-status-critical",
      ring: "ring-red-200",
    },
    warning: {
      border: "border-l-amber-500",
      bg: "bg-amber-50/50",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      badge: "badge-status-warning",
      ring: "ring-amber-200",
    },
    info: {
      border: "border-l-blue-500",
      bg: "bg-blue-50/30",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      badge: "badge-status-info",
      ring: "ring-blue-200",
    },
  };

  const config = severityConfig[conflict.severity];

  return (
    <Card
      className={`conflict-card border-l-4 ${config.border} overflow-hidden transition-all hover:shadow-md`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardHeader
        className={`pb-3 cursor-pointer transition-colors hover:${config.bg}`}
        onClick={onToggle}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`rounded-lg p-2.5 ${config.iconBg}`}>
              <TypeIcon className={`h-5 w-5 ${config.iconColor}`} />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-base flex items-center gap-2">
                <span className={config.badge}>
                  {t(`alerts.type.${conflict.type}`, conflict.type.replace("-", " "))}
                </span>
                <span className="text-xs text-muted-foreground font-normal">
                  #{conflict.conflictId.slice(0, 8)}
                </span>
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {conflict.description}
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4 pt-0 animate-in slide-in-from-top-2 duration-200">
          {/* Involved Promotions */}
          <div className="rounded-lg border bg-card p-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              {t("alerts.involvedPromotions", "Involved Promotions")}
            </h4>
            <div className="flex flex-wrap gap-2">
              {conflict.promotionNames.map((name, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 hover:bg-primary/5 hover:border-primary"
                  onClick={() => router.push(`/promotions/${conflict.promotionIds[i]}`)}
                >
                  <Eye className="h-3 w-3" />
                  {name}
                  <ChevronRight className="h-3 w-3" />
                </Button>
              ))}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Affected Segments */}
            {conflict.affectedSegments.length > 0 && (
              <div className="rounded-lg border bg-card p-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {t("alerts.affectedSegments", "Affected Segments")}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {conflict.affectedSegments.map((seg) => (
                    <span key={seg} className="badge-status-draft text-xs">
                      {t(`segments.${seg}`, seg)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Overlap Period */}
            {conflict.overlapStart && conflict.overlapEnd && (
              <div className="rounded-lg border bg-card p-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {t("alerts.overlapPeriod", "Overlap Period")}
                </h4>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{conflict.overlapStart}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">{conflict.overlapEnd}</span>
                </div>
              </div>
            )}
          </div>

          {/* Recommendation */}
          <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-primary">
              <Lightbulb className="h-4 w-4" />
              {t("alerts.recommendation", "Recommendation")}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {conflict.recommendation}
            </p>
          </div>

          {/* Resolution Guide */}
          {guide && (
            <div className="rounded-lg bg-muted/50 border p-4">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                {guide.icon}
                Resolution Steps
              </h4>
              <ol className="space-y-2">
                {guide.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Conflict acknowledged")}
            >
              {t("alerts.acknowledge", "Acknowledge")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Conflict dismissed")}
            >
              {t("alerts.dismiss", "Dismiss")}
            </Button>
            <Button
              size="sm"
              className="gap-1"
              onClick={() => router.push(`/promotions/${conflict.promotionIds[0]}`)}
            >
              {t("alerts.resolve", "Resolve")}
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
