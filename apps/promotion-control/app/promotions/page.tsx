"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Input,
  Select,
  Skeleton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@tasco/ui";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Play,
  Circle,
  Filter,
  List,
  Tag,
  Gift,
  Percent,
  Sparkles,
  Zap,
  Calendar,
  Users,
  ChevronRight,
  Eye,
  RefreshCw,
} from "@tasco/ui/icons";
import { useTranslation } from "@tasco/i18n";
import { toast } from "sonner";
import type { Promotion, PromotionStatus } from "@tasco/db";

// Promotion type icons
const TYPE_ICONS: Record<string, React.ReactNode> = {
  discount: <Percent className="h-4 w-4" />,
  bundle: <Gift className="h-4 w-4" />,
  "free-item": <Tag className="h-4 w-4" />,
  loyalty: <Sparkles className="h-4 w-4" />,
  coupon: <Zap className="h-4 w-4" />,
};

// Promotion type gradient colors
const TYPE_GRADIENTS: Record<string, string> = {
  discount: "from-emerald-500 to-emerald-600",
  bundle: "from-blue-500 to-blue-600",
  "free-item": "from-purple-500 to-purple-600",
  loyalty: "from-amber-500 to-amber-600",
  coupon: "from-rose-500 to-rose-600",
};

export default function PromotionsPage() {
  const { t } = useTranslation("app");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get("status") || "all"
  );

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
      toast.error(t("common.error", "Failed to load promotions"));
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

  async function handleStatusChange(promotionId: string, newStatus: PromotionStatus) {
    try {
      const res = await fetch(`/api/promotions/${promotionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success(
          newStatus === "active"
            ? t("promotions.activated", "Promotion activated")
            : t("common.success", "Promotion updated")
        );
        fetchPromotions();
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      toast.error(t("common.error", "Failed to update promotion"));
    }
  }

  async function handleDelete(promotionId: string) {
    if (!confirm("Are you sure you want to delete this promotion?")) {
      return;
    }

    try {
      const res = await fetch(`/api/promotions/${promotionId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success(t("common.success", "Promotion deleted"));
        fetchPromotions();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      toast.error(t("common.error", "Failed to delete promotion"));
    }
  }

  // Filter promotions
  const filteredPromotions = promotions.filter((p) => {
    const matchesSearch =
      searchQuery === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: promotions.length,
    active: promotions.filter((p) => p.status === "active").length,
    draft: promotions.filter((p) => p.status === "draft").length,
    paused: promotions.filter((p) => p.status === "paused").length,
  };

  if (loading) {
    return (
      <main className="flex h-full flex-col p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 shimmer" />
            <Skeleton className="h-4 w-96 shimmer" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-10 w-64 shimmer" />
            <Skeleton className="h-10 w-32 shimmer" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-56 shimmer" />
            ))}
          </div>
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
              <List className="h-6 w-6 text-primary" />
              {t("promotions.title", "Promotions")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("promotions.subtitle", "Manage your promotion rules")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
            <Button className="btn-premium gap-2" onClick={() => router.push("/promotions/new")}>
              <Plus className="h-4 w-4" />
              {t("promotions.create", "Create Promotion")}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: t("common.all", "All"), value: stats.total, color: "bg-slate-100 text-slate-700" },
            { label: t("promotions.status.active", "Active"), value: stats.active, color: "bg-emerald-100 text-emerald-700" },
            { label: t("promotions.status.draft", "Draft"), value: stats.draft, color: "bg-slate-100 text-slate-600" },
            { label: t("promotions.status.paused", "Paused"), value: stats.paused, color: "bg-amber-100 text-amber-700" },
          ].map((stat) => (
            <button
              key={stat.label}
              onClick={() => setStatusFilter(stat.label === t("common.all", "All") ? "all" : stat.label.toLowerCase())}
              className={`rounded-xl p-3 text-left transition-all hover:scale-[1.02] ${
                (statusFilter === "all" && stat.label === t("common.all", "All")) ||
                statusFilter === stat.label.toLowerCase()
                  ? "ring-2 ring-primary ring-offset-2"
                  : ""
              } ${stat.color}`}
            >
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs font-medium opacity-80">{stat.label}</div>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("common.searchPlaceholder", "Search promotions...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            options={[
              { value: "all", label: t("common.allStatus", "All Status") },
              { value: "active", label: t("promotions.status.active", "Active") },
              { value: "draft", label: t("promotions.status.draft", "Draft") },
              { value: "paused", label: t("promotions.status.paused", "Paused") },
              { value: "expired", label: t("promotions.status.expired", "Expired") },
            ]}
            className="w-[180px]"
          />
        </div>

        {/* Promotion Grid */}
        {filteredPromotions.length === 0 ? (
          <Card className="empty-state py-16">
            <div className="empty-state-icon">
              <Tag className="h-8 w-8" />
            </div>
            <h3 className="empty-state-title">
              {searchQuery || statusFilter !== "all"
                ? t("promotions.noPromotions", "No promotions found")
                : t("empty.promotions.title", "No promotions yet")}
            </h3>
            <p className="empty-state-description">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filter"
                : t("empty.promotions.description", "Create your first promotion to start managing campaigns and detecting conflicts.")}
            </p>
            <Button className="btn-premium mt-6 gap-2" onClick={() => router.push("/promotions/new")}>
              <Plus className="h-4 w-4" />
              {t("empty.promotions.action", "Create Promotion")}
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPromotions.map((promo, index) => (
              <Card
                key={promo.promotionId}
                className="promotion-card group cursor-pointer overflow-hidden"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => router.push(`/promotions/${promo.promotionId}`)}
              >
                {/* Type indicator bar */}
                <div className={`h-1 bg-gradient-to-r ${TYPE_GRADIENTS[promo.type] || "from-slate-400 to-slate-500"}`} />

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${
                        TYPE_GRADIENTS[promo.type] || "from-slate-500 to-slate-600"
                      } text-white shadow-sm`}>
                        {TYPE_ICONS[promo.type] || <Tag className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base truncate group-hover:text-primary transition-colors">
                          {promo.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-1 mt-0.5 text-xs">
                          {promo.description}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/promotions/${promo.promotionId}`);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          {t("common.view", "View")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/promotions/${promo.promotionId}/edit`);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          {t("common.edit", "Edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.info("Clone feature coming soon");
                          }}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          {t("promotions.clone", "Clone")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {promo.status === "active" && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(promo.promotionId, "paused");
                            }}
                          >
                            <Circle className="mr-2 h-4 w-4" />
                            {t("promotions.pause", "Pause")}
                          </DropdownMenuItem>
                        )}
                        {(promo.status === "draft" || promo.status === "paused") && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(promo.promotionId, "active");
                            }}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            {t("promotions.activate", "Activate")}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(promo.promotionId);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("common.delete", "Delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Status and Type badges */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className={`badge-status-${promo.status}`}>
                      {t(`promotions.status.${promo.status}`, promo.status)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                      {TYPE_ICONS[promo.type]}
                      {t(`promotions.type.${promo.type}`, promo.type)}
                    </span>
                  </div>

                  {/* Discount value - prominent display */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">
                      {promo.discountType === "percentage"
                        ? `${promo.discountValue}%`
                        : `${(promo.discountValue / 1000).toFixed(0)}K`}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {promo.discountType === "percentage"
                        ? t("common.off", "off")
                        : "VND " + t("common.off", "off")}
                    </span>
                  </div>

                  {/* Date range */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(promo.startDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      {" "}{t("common.to", "to")}{" "}
                      {new Date(promo.endDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </div>

                  {/* Target segments */}
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex flex-wrap gap-1 min-w-0">
                      {promo.targetSegments.slice(0, 2).map((seg) => (
                        <span key={seg} className="badge-status-draft text-xs truncate">
                          {t(`segments.${seg}`, seg)}
                        </span>
                      ))}
                      {promo.targetSegments.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{promo.targetSegments.length - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* View details link */}
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {promo.stackable ? "Stackable" : "Non-stackable"}
                      </span>
                      <span className="flex items-center gap-1 text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        {t("common.view", "View")}
                        <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results count */}
        {filteredPromotions.length > 0 && (
          <div className="text-center text-sm text-muted-foreground py-4">
            Showing {filteredPromotions.length} of {promotions.length} promotions
          </div>
        )}
      </div>
    </main>
  );
}
