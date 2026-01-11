"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@tasco/ui";
import {
  Users,
  UserCircle,
  TrendingUp,
  TrendingDown,
  Megaphone,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  Target,
  DollarSign,
  Activity,
  Phone,
  Mail,
  Calendar,
  Zap,
  ChevronRight,
  Clock,
  Car,
  ArrowUpRight,
} from "@tasco/ui/icons";
import {
  getDashboardStats,
  getAllLeads,
  getAtRiskCustomers,
  getHighConfidenceRecommendations,
  getActiveCampaigns,
  type Lead,
  type Customer,
  type AIRecommendation,
  type Campaign,
} from "../lib/data-layer";
import { useTranslation } from "@tasco/i18n";

export default function DashboardPage() {
  const { t } = useTranslation("app");
  const [stats, setStats] = useState<any>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [atRiskCustomers, setAtRiskCustomers] = useState<Customer[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const dashboardStats = await getDashboardStats();
        const leads = await getAllLeads();
        const atRisk = await getAtRiskCustomers();
        const recs = await getHighConfidenceRecommendations();
        const campaigns = await getActiveCampaigns();

        setStats(dashboardStats);
        setRecentLeads(leads.slice(0, 5));
        setAtRiskCustomers(atRisk.slice(0, 3));
        setRecommendations(recs.slice(0, 4));
        setActiveCampaigns(campaigns);
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-brand animate-pulse" />
            <Car className="absolute inset-0 m-auto h-8 w-8 text-white" />
          </div>
          <p className="mt-6 text-sm font-medium text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Pipeline data for visualization
  const pipelineStages = [
    { name: "New", count: stats?.leads.new || 0, color: "from-blue-500 to-blue-600" },
    { name: "Contacted", count: stats?.leads.contacted || 0, color: "from-cyan-500 to-cyan-600" },
    { name: "Qualified", count: stats?.leads.qualified || 0, color: "from-violet-500 to-violet-600" },
    { name: "Converted", count: stats?.leads.converted || 0, color: "from-emerald-500 to-emerald-600" },
  ];

  const totalPipeline = pipelineStages.reduce((sum, stage) => sum + stage.count, 0);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto">
        {/* Hero Section */}
        <div className="relative overflow-hidden border-b bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 px-6 py-10 md:px-8">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

          <div className="relative mx-auto max-w-7xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="animate-fade-in-up">
                <div className="flex items-center gap-2 text-white/70">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" })}
                  </span>
                </div>
                <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
                  Customer Lifecycle Dashboard
                </h1>
                <p className="mt-2 max-w-xl text-white/80">
                  AI-powered insights for your sales pipeline. Track leads, nurture customers, and maximize conversions.
                </p>
              </div>

              {/* Quick Stats Pills */}
              <div className="flex flex-wrap gap-3 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-white">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-medium">{stats?.leads.hot || 0} Hot Leads</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-white">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-medium">{recommendations.length} AI Insights</span>
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Total Leads",
                  value: stats?.leads.total || 0,
                  change: `${stats?.leads.conversionRate?.toFixed(1) || 0}%`,
                  changeLabel: "conversion",
                  icon: Users,
                  gradient: "from-blue-500/20 to-cyan-500/20",
                  iconBg: "bg-blue-500",
                  trending: "up",
                },
                {
                  title: "Hot Prospects",
                  value: stats?.leads.hot || 0,
                  change: `${stats?.leads.new || 0} new`,
                  changeLabel: "today",
                  icon: Target,
                  gradient: "from-orange-500/20 to-amber-500/20",
                  iconBg: "bg-gradient-to-br from-orange-500 to-amber-500",
                  trending: "up",
                },
                {
                  title: "Active Customers",
                  value: stats?.customers.total || 0,
                  change: `${stats?.customers.vip || 0} VIP`,
                  changeLabel: "members",
                  icon: UserCircle,
                  gradient: "from-emerald-500/20 to-teal-500/20",
                  iconBg: "bg-gradient-to-br from-emerald-500 to-teal-500",
                  trending: "up",
                },
                {
                  title: "At-Risk",
                  value: stats?.customers.atRisk || 0,
                  change: "Needs attention",
                  changeLabel: "",
                  icon: AlertTriangle,
                  gradient: "from-rose-500/20 to-pink-500/20",
                  iconBg: "bg-gradient-to-br from-rose-500 to-pink-500",
                  trending: "down",
                },
              ].map((card, index) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-5 transition-all hover:bg-white/15 hover:scale-[1.02] animate-fade-in-up"
                    style={{ animationDelay: `${(index + 2) * 100}ms` }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 transition-opacity group-hover:opacity-100`} />
                    <div className="relative">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-white/70">{card.title}</p>
                          <p className="mt-2 font-display text-4xl font-bold text-white">{card.value}</p>
                        </div>
                        <div className={`rounded-xl ${card.iconBg} p-2.5 shadow-lg`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        {card.trending === "up" ? (
                          <TrendingUp className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-rose-400" />
                        )}
                        <span className="text-sm font-medium text-white">{card.change}</span>
                        {card.changeLabel && (
                          <span className="text-sm text-white/60">{card.changeLabel}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-6 py-8 md:px-8">
          {/* Pipeline Visualization */}
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-xl font-semibold">Sales Pipeline</h2>
                <p className="text-sm text-muted-foreground">Track leads through your conversion funnel</p>
              </div>
              <Link href="/leads">
                <Button variant="outline" size="sm" className="gap-2">
                  View All Leads
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="card-glass p-6">
              <div className="flex items-center gap-2 mb-6">
                {pipelineStages.map((stage, index) => (
                  <div key={stage.name} className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 flex-1 rounded-full bg-gradient-to-r ${stage.color}`} />
                      {index < pipelineStages.length - 1 && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-4">
                {pipelineStages.map((stage, index) => (
                  <div
                    key={stage.name}
                    className="text-center p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <p className="text-3xl font-bold font-display">{stage.count}</p>
                    <p className="text-sm text-muted-foreground mt-1">{stage.name}</p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">
                      {totalPipeline > 0 ? ((stage.count / totalPipeline) * 100).toFixed(0) : 0}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            {[
              {
                href: "/leads",
                title: "Lead Inbox",
                value: `${stats?.leads.new || 0} new`,
                subtitle: `${stats?.leads.hot || 0} hot leads awaiting contact`,
                icon: Users,
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                href: "/customers",
                title: "Customer 360",
                value: `${stats?.customers.total || 0} profiles`,
                subtitle: "Complete lifecycle tracking",
                icon: UserCircle,
                gradient: "from-emerald-500 to-teal-500",
              },
              {
                href: "/marketing",
                title: "Campaigns",
                value: `${activeCampaigns.length} active`,
                subtitle: `${stats?.campaigns?.avgROI?.toFixed(1) || 0}x avg ROI`,
                icon: Megaphone,
                gradient: "from-violet-500 to-purple-500",
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Card className="card-elevated group cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: `${(index + 3) * 100}ms` }}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className={`inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg mb-4`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                          <p className="mt-1 font-display text-2xl font-bold">{item.value}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{item.subtitle}</p>
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Two Column Layout */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Leads */}
            <Card className="card-glass animate-fade-in-up" style={{ animationDelay: "400ms" }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="font-display">Recent Leads</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Latest prospects in your pipeline</p>
                </div>
                <Link href="/leads">
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentLeads.map((lead, index) => (
                    <Link
                      key={lead.id}
                      href={`/leads/${lead.id}`}
                      className="flex items-center gap-4 rounded-xl border p-4 transition-all hover:bg-muted/50 hover:shadow-md hover:-translate-x-1 animate-fade-in-up"
                      style={{ animationDelay: `${(index + 5) * 50}ms` }}
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold text-white ${
                        lead.priority === "hot"
                          ? "bg-gradient-to-br from-red-500 to-orange-500"
                          : lead.priority === "warm"
                            ? "bg-gradient-to-br from-amber-500 to-yellow-500"
                            : "bg-gradient-to-br from-blue-500 to-cyan-500"
                      }`}>
                        {lead.customer.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{lead.customer.name}</p>
                          <span className={`priority-badge ${lead.priority}`}>
                            {lead.priority}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground truncate">
                          {lead.interest.brands.join(", ")} • {lead.source}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Zap className="h-3.5 w-3.5 text-amber-500" />
                          {lead.score}
                        </div>
                        <p className="text-xs text-muted-foreground capitalize">{lead.status}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card className="ai-insight-card animate-fade-in-up" style={{ animationDelay: "450ms" }}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand shadow-lg">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="font-display">AI Recommendations</CardTitle>
                      <p className="text-sm text-muted-foreground">Powered by Lyzr AI</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-violet-100 dark:bg-violet-900/30 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-400">
                    {recommendations.length} active
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <div
                      key={rec.id}
                      className="group rounded-xl border border-violet-200/50 dark:border-violet-800/30 bg-gradient-to-r from-violet-50/50 to-transparent dark:from-violet-950/20 p-4 transition-all hover:shadow-md hover:border-violet-300 dark:hover:border-violet-700 animate-fade-in-up"
                      style={{ animationDelay: `${(index + 6) * 50}ms` }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 flex-shrink-0">
                          <Activity className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium leading-tight">{rec.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {rec.description}
                          </p>
                          <div className="mt-2 flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                                  style={{ width: `${rec.confidence * 100}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                {(rec.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                              {rec.type.replace(/_/g, " ")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* At-Risk Customers Alert */}
          {atRiskCustomers.length > 0 && (
            <Card className="mt-6 border-2 border-orange-200 dark:border-orange-900/50 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 overflow-hidden animate-fade-in-up" style={{ animationDelay: "500ms" }}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-3 text-orange-900 dark:text-orange-400">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="font-display">At-Risk Customers</span>
                    <p className="text-sm font-normal text-orange-700/80 dark:text-orange-400/80">
                      {atRiskCustomers.length} customers need immediate attention
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-3">
                  {atRiskCustomers.map((customer, index) => (
                    <Link
                      key={customer.id}
                      href={`/customers/${customer.id}`}
                      className="flex items-center justify-between rounded-xl border-2 border-orange-200 dark:border-orange-800/50 bg-card p-4 transition-all hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-700 hover:-translate-y-1 animate-fade-in-up"
                      style={{ animationDelay: `${(index + 7) * 50}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 font-semibold">
                          {customer.profile.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{customer.profile.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="churn-bar">
                              <div
                                className="churn-bar-fill"
                                style={{ width: `${customer.insights.churnRisk * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                              {(customer.insights.churnRisk * 100).toFixed(0)}% risk
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white shadow-md">
                        Engage
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
