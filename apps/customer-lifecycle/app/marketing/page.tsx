"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from "@tasco/ui";
import {
  Plus,
  Search,
  Megaphone,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Calendar,
  ArrowUpRight,
  BarChart3,
  Mail,
  MessageSquare,
  Sparkles,
  Clock,
  CheckCircle,
  PauseCircle,
  Car,
} from "@tasco/ui/icons";
import type { Campaign } from "../../lib/data-layer";
import { CampaignDetailSheet } from "../../components/campaign-detail-sheet";
import { useTranslation } from "@tasco/i18n";
import { useEntityFilter, buildEntityFilterParams } from "../../lib/entity-filter-context";

type CampaignFilter = "all" | "active" | "paused" | "completed" | "draft";

export default function MarketingPage() {
  const { t } = useTranslation("marketing");
  const { t: tApp } = useTranslation("app");
  const searchParams = useSearchParams();
  const router = useRouter();

  // Entity filter from context
  const { selectedEntityIds, isLoading: isEntitiesLoading } = useEntityFilter();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CampaignFilter>("all");
  const [stats, setStats] = useState<any>(null);

  // Sheet overlay state
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [sheetMode, setSheetMode] = useState<"view" | "create" | "edit">("view");

  // Handle URL deep linking
  useEffect(() => {
    const idParam = searchParams.get("id");
    if (idParam) {
      setSelectedCampaignId(idParam);
    }
  }, [searchParams]);

  // Update URL when sheet opens/closes
  const handleCampaignSelect = (campaignId: string | null) => {
    setSelectedCampaignId(campaignId);
    setSheetMode("view");
    if (campaignId) {
      router.push(`/marketing?id=${campaignId}`, { scroll: false });
    } else {
      router.push("/marketing", { scroll: false });
    }
  };

  // Open sheet in create mode
  const handleCreateCampaign = () => {
    setSelectedCampaignId(null);
    setSheetMode("create");
  };

  // Close sheet
  const handleCloseSheet = () => {
    setSelectedCampaignId(null);
    setSheetMode("view");
    router.push("/marketing", { scroll: false });
  };

  useEffect(() => {
    // Wait for entities to load before fetching campaigns
    if (isEntitiesLoading) return;

    async function loadCampaigns() {
      setIsLoading(true);
      try {
        // Build entity filter query param
        const entityParam = buildEntityFilterParams(selectedEntityIds);
        const separator = entityParam ? "&" : "";

        // Fetch campaigns and stats from API routes with entity filter
        const [campaignsRes, statsRes] = await Promise.all([
          fetch(`/api/campaigns${entityParam ? `?${entityParam}` : ""}`),
          fetch(`/api/campaigns?stats=true${separator}${entityParam}`),
        ]);
        const [campaignsData, statsData] = await Promise.all([
          campaignsRes.json(),
          statsRes.json(),
        ]);
        if (campaignsData.success) {
          setCampaigns(campaignsData.campaigns || []);
          setFilteredCampaigns(campaignsData.campaigns || []);
        }
        if (statsData.success) {
          setStats(statsData.stats);
        }
      } catch (error) {
        console.error("Error loading campaigns:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCampaigns();
  }, [selectedEntityIds, isEntitiesLoading]);

  useEffect(() => {
    let filtered = [...campaigns];

    if (searchQuery) {
      filtered = filtered.filter(
        (campaign) =>
          campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          campaign.targetSegment?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((campaign) => campaign.status === statusFilter);
    }

    setFilteredCampaigns(filtered);
  }, [campaigns, searchQuery, statusFilter]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)}M`;
    }
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const getCampaignTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return Mail;
      case "sms":
        return MessageSquare;
      case "social":
        return Users;
      case "display":
        return BarChart3;
      default:
        return Megaphone;
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          labelKey: "status.active",
          icon: CheckCircle,
          gradient: "from-emerald-500 to-teal-500",
          textColor: "text-emerald-600 dark:text-emerald-400",
          bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
        };
      case "paused":
        return {
          labelKey: "status.paused",
          icon: PauseCircle,
          gradient: "from-amber-500 to-orange-500",
          textColor: "text-amber-600 dark:text-amber-400",
          bgColor: "bg-amber-100 dark:bg-amber-900/30",
        };
      case "completed":
        return {
          labelKey: "status.completed",
          icon: CheckCircle,
          gradient: "from-blue-500 to-cyan-500",
          textColor: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-100 dark:bg-blue-900/30",
        };
      case "draft":
        return {
          labelKey: "status.draft",
          icon: Clock,
          gradient: "from-gray-500 to-slate-500",
          textColor: "text-gray-600 dark:text-gray-400",
          bgColor: "bg-gray-100 dark:bg-gray-900/30",
        };
      default:
        return {
          labelKey: `status.${status}`,
          icon: Megaphone,
          gradient: "from-violet-500 to-purple-500",
          textColor: "text-violet-600 dark:text-violet-400",
          bgColor: "bg-violet-100 dark:bg-violet-900/30",
        };
    }
  };

  const campaignStats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === "active").length,
    paused: campaigns.filter((c) => c.status === "paused").length,
    completed: campaigns.filter((c) => c.status === "completed").length,
    draft: campaigns.filter((c) => c.status === "draft").length,
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-brand animate-pulse" />
            <Megaphone className="absolute inset-0 m-auto h-8 w-8 text-white" />
          </div>
          <p className="mt-6 text-sm font-medium text-muted-foreground">{tApp("actions.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="border-b bg-card/50 backdrop-blur-xl px-6 py-6 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="animate-fade-in-up">
                <h1 className="font-display text-3xl font-bold tracking-tight">{t("title")}</h1>
                <p className="mt-1 text-muted-foreground">
                  {campaignStats.active} {t("status.active").toLowerCase()} • {formatCurrency(stats?.totalBudget || 0)} VND
                </p>
              </div>
              <Button
                className="gap-2 bg-gradient-brand shadow-lg hover:opacity-90 animate-fade-in-up"
                style={{ animationDelay: "100ms" }}
                onClick={handleCreateCampaign}
              >
                <Plus className="h-4 w-4" />
                {t("actions.create_campaign")}
              </Button>
            </div>

            {/* Stats Summary */}
            <div className="mt-6 grid gap-4 md:grid-cols-4 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
              <div className="flex items-center gap-4 rounded-xl border bg-card/50 p-4 transition-all hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg">
                  <Megaphone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("stats.total_campaigns")}</p>
                  <p className="font-display text-2xl font-bold">{campaignStats.total}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl border bg-card/50 p-4 transition-all hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("stats.avg_roi")}</p>
                  <p className="font-display text-2xl font-bold">{stats?.avgROI?.toFixed(1) || 0}x</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl border bg-card/50 p-4 transition-all hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("stats.total_reach")}</p>
                  <p className="font-display text-2xl font-bold">{stats?.totalReach?.toLocaleString() || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl border bg-card/50 p-4 transition-all hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("stats.conversion_rate")}</p>
                  <p className="font-display text-2xl font-bold">{stats?.avgConversionRate?.toFixed(1) || 0}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="border-b bg-card/30 px-6 py-4 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("filters.search_placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 rounded-xl border-0 bg-muted/50 pl-10 pr-4 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Status Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground mr-2">{t("filters.status")}:</span>
                {(["all", "active", "paused", "completed", "draft"] as CampaignFilter[]).map((status) => {
                  const config = status !== "all" ? getStatusConfig(status) : null;
                  const count = status === "all" ? campaignStats.total : campaignStats[status as keyof typeof campaignStats];
                  return (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                        statusFilter === status
                          ? status === "all"
                            ? "bg-primary text-primary-foreground shadow-md"
                            : `bg-gradient-to-r ${config?.gradient} text-white shadow-md`
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {t(`status.${status}`)}
                      <span className={`${statusFilter === status ? "opacity-80" : "opacity-60"}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="mx-auto max-w-7xl px-6 py-6 md:px-8">
          {filteredCampaigns.length === 0 ? (
            <Card className="card-glass">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <Megaphone className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="mt-4 font-medium">{t("empty.no_campaigns")}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("empty.no_campaigns_hint")}
                </p>
                <Button
                  className="mt-6 gap-2 bg-gradient-brand"
                  onClick={handleCreateCampaign}
                >
                  <Plus className="h-4 w-4" />
                  {t("actions.create_campaign")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCampaigns.map((campaign, index) => {
                const TypeIcon = getCampaignTypeIcon(campaign.type);
                const statusConfig = getStatusConfig(campaign.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <Card
                    key={campaign.id}
                    onClick={() => handleCampaignSelect(campaign.id)}
                    className="card-elevated group cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${statusConfig.gradient} shadow-lg`}>
                          <TypeIcon className="h-6 w-6 text-white" />
                        </div>
                        <span className={`inline-flex items-center gap-1 rounded-full ${statusConfig.bgColor} px-3 py-1 text-xs font-medium ${statusConfig.textColor}`}>
                          <StatusIcon className="h-3 w-3" />
                          {t(statusConfig.labelKey)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-display font-semibold text-lg line-clamp-1">{campaign.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {t("labels.target")}: {campaign.targetSegment ? t(`segments.${campaign.targetSegment}`) : t("segments.all")}
                      </p>

                      {/* Target Segment */}
                      <div className="mt-4 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{t("labels.target")}:</span>
                        <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium">
                          {campaign.targetSegment ? t(`segments.${campaign.targetSegment}`) : t("segments.all")}
                        </span>
                      </div>

                      {/* Metrics */}
                      <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground">{t("labels.budget")}</p>
                          <p className="font-semibold">{formatCurrency(campaign.budget || 0)} VND</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t("labels.roi")}</p>
                          <p className="font-semibold text-emerald-600">{((campaign.metrics?.revenue || 0) / (campaign.budget || 1) * 100 / 100).toFixed(1)}x</p>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(campaign.startDate).toLocaleDateString("vi-VN")} {campaign.endDate ? `- ${new Date(campaign.endDate).toLocaleDateString("vi-VN")}` : `- ${t("labels.ongoing")}`}
                      </div>

                      {/* Hover Arrow */}
                      <ArrowUpRight className="absolute top-4 right-4 h-5 w-5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* AI Insights Section */}
          <Card className="ai-insight-card mt-8 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand shadow-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="font-display">{t("ai_insights.title")}</CardTitle>
                  <p className="text-sm text-muted-foreground">{t("ai_insights.powered_by")}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-violet-200/50 dark:border-violet-800/30 bg-gradient-to-r from-violet-50/50 to-transparent dark:from-violet-950/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-violet-600" />
                    <span className="text-sm font-medium">{t("ai_insights.recommendation")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("ai_insights.recommendation_text")}
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-200/50 dark:border-emerald-800/30 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-950/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium">{t("ai_insights.performance")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("ai_insights.performance_text")}
                  </p>
                </div>
                <div className="rounded-xl border border-blue-200/50 dark:border-blue-800/30 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">{t("ai_insights.audience")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("ai_insights.audience_text")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Campaign Detail Sheet */}
      <CampaignDetailSheet
        open={!!selectedCampaignId || sheetMode === "create"}
        onOpenChange={(open) => !open && handleCloseSheet()}
        campaignId={selectedCampaignId}
        mode={sheetMode}
        onModeChange={setSheetMode}
        onCampaignUpdated={() => {
          // Refresh campaigns list when a campaign is updated
          const entityParam = buildEntityFilterParams(selectedEntityIds);
          const url = entityParam ? `/api/campaigns?${entityParam}` : "/api/campaigns";
          fetch(url)
            .then((res) => res.json())
            .then((data) => {
              if (data.success) {
                setCampaigns(data.campaigns || []);
              }
            });
        }}
        onCampaignCreated={(newCampaign) => {
          // Add new campaign to list and close sheet
          setCampaigns([newCampaign, ...campaigns]);
          handleCloseSheet();
        }}
      />
    </div>
  );
}
