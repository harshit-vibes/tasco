"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, Button, Badge, cn } from "@tasco/ui";
import {
  Users,
  UserCircle,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  Target,
  Activity,
  Zap,
  ChevronRight,
  Clock,
  Car,
  ArrowUpRight,
  MessageSquare,
  Package,
  Ship,
  Warehouse,
  Calendar,
  DollarSign,
  Truck,
  Factory,
  Flame,
  Eye,
  CheckCircle,
  XCircle,
  BarChart3,
  RefreshCw,
} from "@tasco/ui/icons";
import type { Lead, Customer, AIRecommendation } from "../lib/data-layer";
import { useTranslation } from "@tasco/i18n";
import { useEntityFilter, buildEntityFilterParams } from "../lib/entity-filter-context";
import { getBrandStyleStatic } from "../lib/brands-context";

// ============================================
// TYPE DEFINITIONS
// ============================================

interface VehicleStats {
  total: number;
  byStatus: Record<string, number>;
  byBrand: Record<string, number>;
  atShowroom: number;
  inTransit: number;
  reserved: number;
  sold: number;
  agingWarning: number;
  agingCritical: number;
  totalValue: number;
}

interface OrderStats {
  total: number;
  byStatus: Record<string, number>;
  byBrand: Record<string, number>;
  totalUnits: number;
  totalValue: number;
  pendingArrival: number;
  arrivedThisMonth: number;
}

interface LeadStats {
  total: number;
  hot: number;
  warm: number;
  cold: number;
  new: number;
  contacted: number;
  qualified: number;
  conversionRate: number;
}

interface CustomerStats {
  total: number;
  vip: number;
  regular: number;
  atRisk: number;
  new: number;
  totalLifetimeValue: number;
  averageLifetimeValue: number;
}

interface DashboardStats {
  leads: LeadStats;
  customers: CustomerStats;
  campaigns: {
    total: number;
    active: number;
    completed: number;
  };
}

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  variant: string;
  vin: string;
  status: string;
  daysInInventory: number;
  ageAlert: string;
  listPrice: number;
  assignedShowroom: string;
}

interface ImportOrder {
  id: string;
  orderNumber: string;
  brand: string;
  status: string;
  totalUnits: number;
  totalValue: number;
  expectedArrivalDate: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatCurrency(value: number, currency: "VND" | "USD" = "VND"): string {
  if (!value || isNaN(value)) return "0";

  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(0)}M`;
  }
  return value.toLocaleString();
}

// ============================================
// SKELETON COMPONENTS
// ============================================

function MetricSkeleton() {
  return (
    <div className="hero-metric animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-10 w-10 bg-muted rounded-xl" />
      </div>
      <div className="h-12 w-32 bg-muted rounded mt-2" />
      <div className="h-4 w-20 bg-muted rounded mt-3" />
    </div>
  );
}

function WidgetSkeleton() {
  return (
    <div className="dashboard-widget animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 w-32 bg-muted rounded" />
        <div className="h-8 w-16 bg-muted rounded" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted/50 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ============================================
// DASHBOARD PAGE COMPONENT
// ============================================

export default function DashboardPage() {
  const { t } = useTranslation("dashboard");
  const { t: tApp } = useTranslation("app");

  // Entity filter
  const { selectedEntityIds, isLoading: isEntitiesLoading } = useEntityFilter();

  // State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [atRiskCustomers, setAtRiskCustomers] = useState<Customer[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [vehicleStats, setVehicleStats] = useState<VehicleStats | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [agingVehicles, setAgingVehicles] = useState<Vehicle[]>([]);
  const [recentOrders, setRecentOrders] = useState<ImportOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch data
  const fetchDashboardData = async (showRefreshState = false) => {
    if (showRefreshState) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const entityParam = buildEntityFilterParams(selectedEntityIds);
      const separator = entityParam ? "&" : "";
      const prefix = entityParam ? `?${entityParam}` : "";

      const endpoints = [
        `/api/dashboard${prefix}`,
        `/api/dashboard?section=leads${separator}${entityParam}`,
        `/api/dashboard?section=atRisk${separator}${entityParam}`,
        `/api/dashboard?section=recommendations${separator}${entityParam}`,
        `/api/inventory/stats${prefix}`,
        `/api/orders?stats=true${separator}${entityParam}`,
        `/api/inventory?aging=true&minDays=60${separator}${entityParam}`,
        `/api/orders?active=true${separator}${entityParam}`,
      ];

      const responses = await Promise.all(endpoints.map((url) => fetch(url)));
      const data = await Promise.all(responses.map((res) => res.json()));

      const [
        statsData,
        leadsData,
        atRiskData,
        recsData,
        vehicleStatsData,
        orderStatsData,
        agingData,
        ordersData,
      ] = data;

      if (statsData?.success) setStats(statsData.stats);
      if (leadsData?.success && Array.isArray(leadsData.leads)) {
        setRecentLeads(leadsData.leads.slice(0, 5));
      }
      if (atRiskData?.success && Array.isArray(atRiskData.customers)) {
        setAtRiskCustomers(atRiskData.customers.slice(0, 3));
      }
      if (recsData?.success && Array.isArray(recsData.recommendations)) {
        setRecommendations(recsData.recommendations.slice(0, 4));
      }
      if (vehicleStatsData?.success) setVehicleStats(vehicleStatsData.stats);
      if (orderStatsData?.success) setOrderStats(orderStatsData.stats);
      if (agingData?.success && Array.isArray(agingData.vehicles)) {
        setAgingVehicles(agingData.vehicles.slice(0, 5));
      }
      if (ordersData?.success && Array.isArray(ordersData.orders)) {
        setRecentOrders(ordersData.orders.slice(0, 4));
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isEntitiesLoading) {
      fetchDashboardData();
    }
  }, [selectedEntityIds, isEntitiesLoading]);

  // Open command bar
  const openCommandBar = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
    );
  };

  // Computed values
  const totalAgingIssues = (vehicleStats?.agingWarning || 0) + (vehicleStats?.agingCritical || 0);

  // Sample queries for AI
  const sampleQueries = [
    "Show aging vehicles over 60 days",
    "Which leads are interested in GWM?",
    "List import orders arriving this month",
    "Match customers to available inventory",
  ];

  // ============================================
  // LOADING STATE
  // ============================================

  if (isLoading) {
    return (
      <div className="flex h-full flex-col bg-mesh">
        <div className="flex-1 overflow-auto">
          {/* Hero skeleton */}
          <div className="relative border-b">
            <div className="mx-auto max-w-7xl px-6 py-10 md:px-8">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="h-16 w-16 bg-muted rounded-2xl animate-pulse mb-5" />
                <div className="h-8 w-64 bg-muted rounded animate-pulse mb-3" />
                <div className="h-4 w-96 bg-muted rounded animate-pulse" />
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <MetricSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>

          {/* Content skeleton */}
          <div className="mx-auto max-w-7xl px-6 py-8 md:px-8">
            <div className="grid gap-6 lg:grid-cols-3 mb-8">
              <WidgetSkeleton />
              <div className="lg:col-span-2">
                <div className="h-64 bg-muted/30 rounded-2xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="flex h-full flex-col bg-mesh">
      <div className="flex-1 overflow-auto">
        {/* ============================================
           HERO SECTION
           ============================================ */}
        <div className="relative overflow-hidden border-b">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-cyan-500/5" />
          <div className="absolute inset-0 bg-grid opacity-40" />

          <div className="relative mx-auto max-w-7xl px-6 py-8 md:px-8 md:py-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand shadow-xl">
                    <Car className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                      Tasco Auto Command Center
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Real-time inventory, leads, and supply chain overview
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchDashboardData(true)}
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                Refresh
              </Button>
            </div>

            {/* AI Command Bar */}
            <div className="flex justify-center mb-6">
              <button
                onClick={openCommandBar}
                className="search-input-fancy w-full max-w-2xl"
              >
                <Sparkles className="h-5 w-5 text-violet-500" />
                <span className="flex-1 text-left text-muted-foreground">
                  Ask AI about inventory, leads, or customers...
                </span>
                <kbd>⌘K</kbd>
              </button>
            </div>

            {/* Sample Queries */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {sampleQueries.map((query) => (
                <button
                  key={query}
                  onClick={openCommandBar}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/50 border border-border/50 text-xs text-muted-foreground hover:bg-card hover:border-violet-500/30 hover:text-foreground transition-all"
                >
                  <Sparkles className="h-3 w-3 text-violet-500" />
                  <span>{query}</span>
                </button>
              ))}
            </div>

            {/* ============================================
               HERO KPI CARDS
               ============================================ */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Inventory Value */}
              <div className="hero-metric group">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      Inventory Value
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg group-hover:scale-110 transition-transform">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="hero-metric-value gradient">
                    {formatCurrency(vehicleStats?.totalValue || 0)}
                    <span className="text-lg text-muted-foreground ml-1">₫</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="secondary" className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Car className="h-3 w-3" />
                      {vehicleStats?.total || 0} vehicles
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Available Stock */}
              <div className="hero-metric group">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      At Showroom
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg group-hover:scale-110 transition-transform">
                      <Warehouse className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="hero-metric-value">
                    {vehicleStats?.atShowroom || 0}
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="font-semibold text-foreground">{vehicleStats?.reserved || 0}</span> reserved
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="font-semibold text-foreground">{vehicleStats?.inTransit || 0}</span> transit
                    </span>
                  </div>
                </div>
              </div>

              {/* Import Orders */}
              <div className="hero-metric group">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      Pending Arrivals
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg group-hover:scale-110 transition-transform">
                      <Ship className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="hero-metric-value">
                    {orderStats?.pendingArrival || 0}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="secondary" className="gap-1 bg-violet-500/10 text-violet-600 dark:text-violet-400">
                      <Package className="h-3 w-3" />
                      {orderStats?.totalUnits || 0} units expected
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Hot Leads */}
              <div className="hero-metric group">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      Hot Leads
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg group-hover:scale-110 transition-transform">
                      <Flame className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="hero-metric-value">
                    {stats?.leads?.hot || 0}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="secondary" className="gap-1 bg-orange-500/10 text-orange-600 dark:text-orange-400">
                      <TrendingUp className="h-3 w-3" />
                      {(stats?.leads?.conversionRate || 0).toFixed(1)}% conversion
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================
           MAIN CONTENT
           ============================================ */}
        <div className="mx-auto max-w-7xl px-6 py-8 md:px-8">
          {/* ============================================
             BRAND DISTRIBUTION & SUPPLY CHAIN
             ============================================ */}
          <div className="grid gap-6 lg:grid-cols-3 mb-8">
            {/* Brand Distribution */}
            <div className="dashboard-widget">
              <div className="dashboard-widget-header">
                <div className="flex items-center gap-2">
                  <div className="dashboard-widget-icon">
                    <BarChart3 className="h-4 w-4 text-violet-500" />
                  </div>
                  <h3 className="dashboard-widget-title">Inventory by Brand</h3>
                </div>
                <Link href="/inventory">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    View All <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {Object.entries(vehicleStats?.byBrand || {}).length > 0 ? (
                  Object.entries(vehicleStats?.byBrand || {}).map(([brand, count]) => {
                    const brandStyle = getBrandStyleStatic(brand);
                    const percentage = ((count as number) / (vehicleStats?.total || 1)) * 100;
                    return (
                      <div key={brand} className="flex items-center gap-3">
                        <div className={cn("brand-pill", brand.toLowerCase())}>
                          {brand}
                        </div>
                        <div className="flex-1">
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn("h-full rounded-full transition-all duration-700", brandStyle.accent)}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <span className="font-display text-lg font-bold w-10 text-right">
                          {count as number}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Car className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No vehicles in inventory</p>
                    <Link href="/inventory">
                      <Button variant="link" size="sm" className="mt-2">
                        Add vehicles
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Supply Chain Tracker */}
            <div className="lg:col-span-2 supply-chain-tracker">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display text-lg font-semibold">
                      Supply Chain Pipeline
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Track vehicles from factory to showroom
                    </p>
                  </div>
                  <Link href="/inventory/orders">
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      View Orders <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {[
                    { label: "Ordered", icon: Package, count: vehicleStats?.byStatus?.ordered || 0, color: "from-slate-500 to-slate-600" },
                    { label: "Production", icon: Factory, count: vehicleStats?.byStatus?.in_production || 0, color: "from-violet-500 to-purple-600" },
                    { label: "Shipped", icon: Ship, count: vehicleStats?.byStatus?.shipped || 0, color: "from-cyan-500 to-blue-600" },
                    { label: "In Transit", icon: Truck, count: vehicleStats?.byStatus?.in_transit || 0, color: "from-blue-500 to-indigo-600" },
                    { label: "Showroom", icon: Warehouse, count: vehicleStats?.atShowroom || 0, color: "from-emerald-500 to-teal-600" },
                  ].map((stage, index) => {
                    const Icon = stage.icon;
                    return (
                      <div key={stage.label} className="relative">
                        <div className={cn(
                          "supply-chain-node flex-col text-center",
                          stage.count > 0 && "active"
                        )}>
                          <div className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg mb-2",
                            stage.color
                          )}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <span className="font-display text-xl font-bold">
                            {stage.count}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {stage.label}
                          </span>
                        </div>
                        {index < 4 && (
                          <ChevronRight className="absolute -right-1 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ============================================
             AGING INVENTORY ALERT
             ============================================ */}
          {totalAgingIssues > 0 && (
            <div className="mb-8">
              <div className="rounded-2xl border-2 border-amber-200 dark:border-amber-900/50 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-amber-900 dark:text-amber-400">
                        Aging Inventory Alert
                      </h3>
                      <p className="text-sm text-amber-700/80 dark:text-amber-400/80">
                        <span className="font-semibold">{vehicleStats?.agingCritical || 0}</span> critical (&gt;90 days)
                        <span className="mx-2">•</span>
                        <span className="font-semibold">{vehicleStats?.agingWarning || 0}</span> warning (&gt;60 days)
                      </p>
                    </div>
                  </div>
                  <Link href="/inventory?filter=aging">
                    <Button
                      variant="outline"
                      className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-400"
                    >
                      View All Aging
                    </Button>
                  </Link>
                </div>

                {agingVehicles.length > 0 && (
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {agingVehicles.slice(0, 3).map((vehicle) => {
                      const brandStyle = getBrandStyleStatic(vehicle.brand);
                      return (
                        <Link
                          key={vehicle.id}
                          href={`/inventory/${vehicle.id}`}
                          className="flex items-center gap-3 p-4 rounded-xl bg-card border border-amber-200 dark:border-amber-800/50 hover:shadow-lg transition-all group"
                        >
                          <div className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-lg",
                            brandStyle.bg, brandStyle.text
                          )}>
                            <Car className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                              {vehicle.brand} {vehicle.model}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {vehicle.variant}
                            </p>
                          </div>
                          <div className={cn(
                            "days-counter",
                            vehicle.ageAlert === "critical" ? "critical" : "warning"
                          )}>
                            <Clock className="h-3.5 w-3.5" />
                            {vehicle.daysInInventory}d
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================
             ACTIVE IMPORT ORDERS
             ============================================ */}
          {recentOrders.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display text-xl font-semibold">Active Import Orders</h2>
                  <p className="text-sm text-muted-foreground">Track incoming shipments from OEM</p>
                </div>
                <Link href="/inventory/orders">
                  <Button variant="outline" size="sm" className="gap-2">
                    View All Orders
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {recentOrders.map((order) => {
                  return (
                    <Link
                      key={order.id}
                      href={`/inventory/orders/${order.id}`}
                      className="dashboard-widget group cursor-pointer hover:shadow-lg hover:border-violet-500/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={cn("brand-pill", order.brand.toLowerCase())}>
                          {order.brand}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">
                          {order.orderNumber}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="font-display text-2xl font-bold">
                          {order.totalUnits}
                        </span>
                        <span className="text-sm text-muted-foreground">units</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          ETA: {new Date(order.expectedArrivalDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                      <div className="mt-3 pt-3 border-t flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {order.status.replace("_", " ")}
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================
             QUICK ACTIONS
             ============================================ */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5 mb-8">
            {[
              { href: "/inventory", title: "Vehicle Inventory", count: vehicleStats?.total || 0, icon: Car, gradient: "from-emerald-500 to-teal-500" },
              { href: "/inventory/orders", title: "Import Orders", count: orderStats?.total || 0, icon: Package, gradient: "from-violet-500 to-purple-500" },
              { href: "/leads", title: "Lead Inbox", count: stats?.leads?.total || 0, icon: Users, gradient: "from-blue-500 to-cyan-500" },
              { href: "/customers", title: "Customers", count: stats?.customers?.total || 0, icon: UserCircle, gradient: "from-pink-500 to-rose-500" },
              { href: "/chat", title: "AI Assistant", count: null, icon: MessageSquare, gradient: "from-amber-500 to-orange-500" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <div className="quick-stat-item group cursor-pointer">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg transition-transform group-hover:scale-105",
                      item.gradient
                    )}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      {item.count !== null && (
                        <p className="quick-stat-value">{item.count}</p>
                      )}
                      <p className={cn("text-sm", item.count === null && "font-medium")}>
                        {item.title}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* ============================================
             AI INSIGHTS & HOT LEADS
             ============================================ */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* AI Recommendations */}
            <div className="dashboard-widget">
              <div className="dashboard-widget-header">
                <div className="flex items-center gap-3">
                  <div className="dashboard-widget-icon">
                    <Sparkles className="h-5 w-5 text-violet-500" />
                  </div>
                  <div>
                    <h3 className="dashboard-widget-title">AI Insights</h3>
                    <p className="text-xs text-muted-foreground">Powered by Lyzr AI</p>
                  </div>
                </div>
                <Link href="/chat">
                  <Button variant="ghost" size="sm">Chat</Button>
                </Link>
              </div>

              <div className="space-y-3">
                {recommendations.length > 0 ? (
                  recommendations.slice(0, 3).map((rec) => (
                    <div
                      key={rec.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0",
                        rec.priority === "urgent"
                          ? "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400"
                          : rec.priority === "high"
                          ? "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400"
                          : "bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400"
                      )}>
                        <Activity className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">{rec.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {rec.description}
                        </p>
                      </div>
                      <Badge variant="outline" className="flex-shrink-0 text-[10px]">
                        {(rec.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No recommendations yet</p>
                    <p className="text-xs mt-1">AI insights will appear as data grows</p>
                  </div>
                )}
              </div>
            </div>

            {/* Hot Leads */}
            <div className="dashboard-widget">
              <div className="dashboard-widget-header">
                <div className="flex items-center gap-3">
                  <div className="dashboard-widget-icon">
                    <Target className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="dashboard-widget-title">Hot Leads</h3>
                    <p className="text-xs text-muted-foreground">Awaiting follow-up</p>
                  </div>
                </div>
                <Link href="/leads">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>

              <div className="space-y-3">
                {recentLeads.length > 0 ? (
                  recentLeads.slice(0, 4).map((lead) => (
                    <Link
                      key={lead.id}
                      href={`/leads/${lead.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                    >
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full font-semibold text-white text-sm",
                        lead.priority === "hot"
                          ? "bg-gradient-to-br from-red-500 to-orange-500"
                          : lead.priority === "warm"
                          ? "bg-gradient-to-br from-amber-500 to-yellow-500"
                          : "bg-gradient-to-br from-blue-500 to-cyan-500"
                      )}>
                        {lead.customer?.name?.charAt(0) || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                            {lead.customer?.name || "Unknown"}
                          </p>
                          <span className={cn("priority-badge", lead.priority)}>
                            {lead.priority}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {lead.interest?.brands?.join(", ") || "No brand preference"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Zap className="h-3.5 w-3.5 text-amber-500" />
                        <span className="font-semibold">{lead.score || 0}</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No leads yet</p>
                    <Link href="/leads">
                      <Button variant="link" size="sm" className="mt-2">
                        Add your first lead
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ============================================
             AT-RISK CUSTOMERS
             ============================================ */}
          {atRiskCustomers.length > 0 && (
            <div className="mt-8">
              <div className="rounded-2xl border-2 border-orange-200 dark:border-orange-900/50 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-orange-900 dark:text-orange-400">
                      Customers at Risk
                    </h3>
                    <p className="text-sm text-orange-700/80 dark:text-orange-400/80">
                      High churn probability - immediate attention needed
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {atRiskCustomers.map((customer) => (
                    <Link
                      key={customer.id}
                      href={`/customers/${customer.id}`}
                      className="flex items-center justify-between p-4 rounded-xl bg-card border border-orange-200 dark:border-orange-800/50 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 font-semibold">
                          {customer.profile?.name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="font-medium group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                            {customer.profile?.name || "Unknown"}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-16 h-1.5 rounded-full bg-orange-200 dark:bg-orange-800 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-orange-500"
                                style={{ width: `${(customer.insights?.churnRisk || 0) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                              {((customer.insights?.churnRisk || 0) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                        Engage
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
