"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  cn,
  Card,
  Badge,
  Button,
  Input,
  Select,
  Skeleton,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@tasco/ui";
import {
  Car,
  Search,
  Filter,
  Package,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Calendar,
  DollarSign,
  LayoutGrid,
  List,
  RefreshCw,
  ChevronRight,
  Sparkles,
  Truck,
  Warehouse,
  Ship,
  Factory,
  X,
  ExternalLink,
  Users,
  Eye,
  Activity,
  Zap,
  Tag,
  Copy,
  Check,
} from "@tasco/ui/icons";
import { useEntityFilter } from "../../lib/entity-filter-context";
import { useBrands, getBrandStyleStatic } from "../../lib/brands-context";
import { useTranslation } from "@tasco/i18n";

// Types
interface Vehicle {
  id: string;
  vin: string;
  brand: "GWM" | "GAC" | "Lotus";
  model: string;
  variant: string;
  color: string;
  configuration?: string;
  year: number;
  status: string;
  listPrice: number;
  importPrice: number;
  dealerPrice?: number;
  assignedShowroom: string;
  currentLocation?: string;
  daysInInventory: number;
  ageAlert: "none" | "warning" | "critical";
  expectedArrival: string;
  arrivedAt?: string;
  orderedAt: string;
  importOrderId?: string;
  soldToCustomerId?: string;
  reservedForLeadId?: string;
}

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

// Status configuration with full pipeline
const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: typeof Car; step: number }> = {
  ordered: { label: "Ordered", color: "bg-slate-500", bgColor: "bg-slate-500/10", icon: Package, step: 1 },
  in_production: { label: "Production", color: "bg-violet-500", bgColor: "bg-violet-500/10", icon: Factory, step: 2 },
  shipped: { label: "Shipped", color: "bg-cyan-500", bgColor: "bg-cyan-500/10", icon: Ship, step: 3 },
  at_port: { label: "At Port", color: "bg-teal-500", bgColor: "bg-teal-500/10", icon: MapPin, step: 4 },
  customs: { label: "Customs", color: "bg-amber-500", bgColor: "bg-amber-500/10", icon: Clock, step: 5 },
  inspection: { label: "Inspection", color: "bg-orange-500", bgColor: "bg-orange-500/10", icon: Eye, step: 6 },
  in_warehouse: { label: "Warehouse", color: "bg-indigo-500", bgColor: "bg-indigo-500/10", icon: Warehouse, step: 7 },
  in_transit: { label: "In Transit", color: "bg-blue-500", bgColor: "bg-blue-500/10", icon: Truck, step: 8 },
  at_showroom: { label: "At Showroom", color: "bg-emerald-500", bgColor: "bg-emerald-500/10", icon: Car, step: 9 },
  reserved: { label: "Reserved", color: "bg-purple-500", bgColor: "bg-purple-500/10", icon: Users, step: 10 },
  sold: { label: "Sold", color: "bg-green-600", bgColor: "bg-green-600/10", icon: DollarSign, step: 11 },
  delivered: { label: "Delivered", color: "bg-green-700", bgColor: "bg-green-700/10", icon: CheckCircle2, step: 12 },
};

// Brand styling - now fetched from database via useBrands() or getBrandStyleStatic()

// Format currency
function formatCurrency(value: number, style: "short" | "full" = "short"): string {
  if (style === "short") {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(0)}M`;
    return value.toLocaleString();
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

// Copy to clipboard hook
function useCopyToClipboard() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return { copiedText, copy };
}

// Vehicle Card Component
function VehicleCard({ vehicle, onClick }: { vehicle: Vehicle; onClick: () => void }) {
  const statusConfig = STATUS_CONFIG[vehicle.status] || STATUS_CONFIG.ordered;
  const brandStyle = getBrandStyleStatic(vehicle.brand);
  const StatusIcon = statusConfig.icon;

  return (
    <div
      onClick={onClick}
      className={cn(
        "vehicle-showroom-card cursor-pointer",
        "bg-gradient-to-br",
        brandStyle.gradient,
        brandStyle.border
      )}
    >
      {/* Brand accent line */}
      <div className={cn("vehicle-brand-accent", vehicle.brand.toLowerCase())} />

      {/* Image placeholder / Status badge area */}
      <div className="vehicle-image">
        <Car className={cn("h-16 w-16 opacity-20", brandStyle.text)} />

        {/* Status badge */}
        <div className={cn(
          "vehicle-status-badge",
          statusConfig.color,
          "text-white"
        )}>
          <StatusIcon className="h-3 w-3 inline mr-1" />
          {statusConfig.label}
        </div>

        {/* Age alert */}
        {vehicle.ageAlert !== "none" && (
          <div className={cn(
            "absolute top-3 left-3 z-10 age-alert",
            vehicle.ageAlert
          )}>
            <AlertTriangle className="h-3 w-3" />
            {vehicle.daysInInventory}d
          </div>
        )}
      </div>

      {/* Details */}
      <div className="vehicle-details">
        <div className="flex items-start justify-between mb-2">
          <div>
            <span className={cn("brand-pill", vehicle.brand.toLowerCase())}>
              {vehicle.brand}
            </span>
          </div>
          <span className="vin-display">{vehicle.vin.slice(-8)}</span>
        </div>

        <h3 className="font-display text-lg font-semibold mb-1">{vehicle.model}</h3>
        <p className="text-sm text-muted-foreground mb-3">{vehicle.variant} · {vehicle.color}</p>

        <div className="flex items-end justify-between">
          <div className="vehicle-price">
            {formatCurrency(vehicle.listPrice)}
            <span className="text-xs font-normal text-muted-foreground ml-1">₫</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {vehicle.year}
          </div>
        </div>
      </div>
    </div>
  );
}

// Vehicle Detail Sheet
function VehicleDetailSheet({ vehicle, open, onClose }: { vehicle: Vehicle | null; open: boolean; onClose: () => void }) {
  const { copiedText, copy } = useCopyToClipboard();

  if (!vehicle) return null;

  const statusConfig = STATUS_CONFIG[vehicle.status] || STATUS_CONFIG.ordered;
  const brandStyle = getBrandStyleStatic(vehicle.brand);
  const currentStep = statusConfig.step;

  // Pipeline steps
  const pipelineSteps = [
    { key: "ordered", label: "Ordered" },
    { key: "in_production", label: "Production" },
    { key: "shipped", label: "Shipped" },
    { key: "in_transit", label: "Transit" },
    { key: "at_showroom", label: "Showroom" },
  ];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        {/* Header with brand accent */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-1",
          brandStyle.accent
        )} />

        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl",
                brandStyle.accent
              )}>
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <SheetTitle className="font-display text-xl">{vehicle.model}</SheetTitle>
                <p className="text-sm text-muted-foreground">{vehicle.variant}</p>
              </div>
            </div>
            <span className={cn("brand-pill", vehicle.brand.toLowerCase())}>
              {vehicle.brand}
            </span>
          </div>
        </SheetHeader>

        {/* Status Pipeline */}
        <div className="mb-6">
          <div className="order-progress">
            {pipelineSteps.map((step, index) => {
              const stepConfig = STATUS_CONFIG[step.key];
              const isCompleted = stepConfig.step < currentStep;
              const isActive = stepConfig.step === currentStep;

              return (
                <div
                  key={step.key}
                  className={cn(
                    "order-progress-step",
                    isCompleted && "completed",
                    isActive && "active"
                  )}
                >
                  <div className="order-progress-dot">
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </div>
                  <span className="order-progress-label">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Tabs */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            {/* VIN */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">VIN</p>
                <p className="font-mono text-sm mt-0.5">{vehicle.vin}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copy(vehicle.vin)}
                className="h-8 w-8 p-0"
              >
                {copiedText === vehicle.vin ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Color</p>
                <p className="font-medium mt-0.5">{vehicle.color}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Year</p>
                <p className="font-medium mt-0.5">{vehicle.year}</p>
              </div>
              {vehicle.configuration && (
                <div className="p-3 rounded-lg bg-muted/30 col-span-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Configuration</p>
                  <p className="font-medium mt-0.5">{vehicle.configuration}</p>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <MapPin className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Current Location</p>
                  <p className="font-medium">{vehicle.currentLocation || vehicle.assignedShowroom}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Expected: {new Date(vehicle.expectedArrival).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
            </div>

            {/* Age Alert */}
            {vehicle.ageAlert !== "none" && (
              <div className={cn(
                "p-4 rounded-xl border",
                vehicle.ageAlert === "critical"
                  ? "bg-red-500/10 border-red-500/30"
                  : "bg-amber-500/10 border-amber-500/30"
              )}>
                <div className="flex items-center gap-3">
                  <AlertTriangle className={cn(
                    "h-5 w-5",
                    vehicle.ageAlert === "critical" ? "text-red-500" : "text-amber-500"
                  )} />
                  <div>
                    <p className={cn(
                      "font-medium",
                      vehicle.ageAlert === "critical" ? "text-red-700 dark:text-red-400" : "text-amber-700 dark:text-amber-400"
                    )}>
                      {vehicle.ageAlert === "critical" ? "Critical Aging" : "Aging Warning"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {vehicle.daysInInventory} days in inventory
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            {/* Main Price */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-violet-500/20">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">List Price (MSRP)</p>
              <p className="font-display text-3xl font-bold text-gradient">
                {formatCurrency(vehicle.listPrice, "full")}
              </p>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground">Import Price (USD)</span>
                <span className="font-medium">${vehicle.importPrice.toLocaleString()}</span>
              </div>
              {vehicle.dealerPrice && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Dealer Price</span>
                  <span className="font-medium">{formatCurrency(vehicle.dealerPrice, "full")}</span>
                </div>
              )}
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Estimated Margin</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {((vehicle.listPrice - vehicle.importPrice * 23000) / vehicle.listPrice * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="activity-feed">
              <div className="activity-item success">
                <div className="flex-1">
                  <p className="font-medium">Order Placed</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(vehicle.orderedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
              {vehicle.arrivedAt && (
                <div className="activity-item success">
                  <div className="flex-1">
                    <p className="font-medium">Arrived at Showroom</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(vehicle.arrivedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
              )}
              {vehicle.reservedForLeadId && (
                <div className="activity-item warning">
                  <div className="flex-1">
                    <p className="font-medium">Reserved for Lead</p>
                    <p className="text-sm text-muted-foreground">Lead ID: {vehicle.reservedForLeadId}</p>
                  </div>
                </div>
              )}
            </div>

            {vehicle.importOrderId && (
              <Link
                href={`/inventory/orders/${vehicle.importOrderId}`}
                className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                    <Package className="h-5 w-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="font-medium">View Import Order</p>
                    <p className="text-sm text-muted-foreground">Track shipment details</p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </Link>
            )}
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="mt-6 pt-6 border-t flex gap-3">
          <Button variant="outline" className="flex-1">
            <Users className="h-4 w-4 mr-2" />
            Assign Lead
          </Button>
          <Button className="flex-1 bg-gradient-brand">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Match
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Stats Card Component
function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: typeof Car;
  trend?: string;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="hero-metric">
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="hero-metric-value mt-1" style={{ fontSize: "2.5rem" }}>{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl shadow-lg", color)}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        {trend && (
          <div className="mt-3">
            <span className="hero-metric-change positive">
              <TrendingUp className="h-3.5 w-3.5" />
              {trend}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const { t } = useTranslation("app");
  const { selectedEntityIds } = useEntityFilter();
  const { brands, getBrandStyle } = useBrands();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState<VehicleStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch data
  async function fetchData(showRefresh = false) {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const entityParam = selectedEntityIds.length > 0
        ? `entityIds=${selectedEntityIds.join(",")}`
        : "";

      const [vehiclesRes, statsRes] = await Promise.all([
        fetch(`/api/inventory${entityParam ? `?${entityParam}` : ""}`),
        fetch(`/api/inventory/stats${entityParam ? `?${entityParam}` : ""}`),
      ]);

      const vehiclesData = await vehiclesRes.json();
      const statsData = await statsRes.json();

      if (vehiclesData.success) setVehicles(vehiclesData.vehicles);
      if (statsData.success) setStats(statsData.stats);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [selectedEntityIds]);

  // Filter vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      if (brandFilter !== "all" && v.brand !== brandFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          v.vin.toLowerCase().includes(query) ||
          v.model.toLowerCase().includes(query) ||
          v.color.toLowerCase().includes(query) ||
          v.variant.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [vehicles, statusFilter, brandFilter, searchQuery]);

  // Group by status for tabs
  const statusGroups = useMemo(() => ({
    all: vehicles.length,
    at_showroom: stats?.atShowroom || 0,
    in_transit: stats?.inTransit || 0,
    reserved: stats?.reserved || 0,
    aging: (stats?.agingWarning || 0) + (stats?.agingCritical || 0),
  }), [vehicles, stats]);

  return (
    <div className="min-h-screen bg-mesh">
      <div className="p-6 md:p-8 space-y-6">
        {/* Hero Header */}
        <div className="inventory-hero p-8 md:p-10">
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand shadow-xl">
                    <Car className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-display font-bold text-white">Vehicle Inventory</h1>
                    <p className="text-white/60">GWM · GAC · Lotus</p>
                  </div>
                </div>
                <p className="text-white/80 max-w-xl">
                  Real-time tracking of {vehicles.length} vehicles across all stages from factory to showroom.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchData(true)}
                  disabled={isRefreshing}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
                  Refresh
                </Button>
                <Link href="/inventory/orders">
                  <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Package className="h-4 w-4 mr-2" />
                    Import Orders
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Vehicles"
            value={stats?.total || 0}
            icon={Car}
            color="bg-gradient-to-br from-violet-500 to-violet-600"
            subtitle={stats ? `${formatCurrency(stats.totalValue)} ₫ total value` : undefined}
          />
          <StatsCard
            title="At Showroom"
            value={stats?.atShowroom || 0}
            icon={Warehouse}
            color="bg-gradient-to-br from-emerald-500 to-emerald-600"
            trend="Ready for sale"
          />
          <StatsCard
            title="In Transit"
            value={stats?.inTransit || 0}
            icon={Truck}
            color="bg-gradient-to-br from-blue-500 to-cyan-500"
          />
          <StatsCard
            title="Aging Alert"
            value={(stats?.agingWarning || 0) + (stats?.agingCritical || 0)}
            icon={AlertTriangle}
            color="bg-gradient-to-br from-amber-500 to-orange-500"
            subtitle={stats?.agingCritical ? `${stats.agingCritical} critical (>90d)` : undefined}
          />
        </div>

        {/* Filters & Search */}
        <div className="dashboard-widget">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="search-input-fancy flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by VIN, model, color, or variant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}>
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
              {[
                { value: "all", label: "All", count: statusGroups.all },
                { value: "at_showroom", label: "Showroom", count: statusGroups.at_showroom },
                { value: "in_transit", label: "Transit", count: statusGroups.in_transit },
                { value: "reserved", label: "Reserved", count: statusGroups.reserved },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value === "all" ? "all" : tab.value)}
                  className={cn("filter-tab", statusFilter === tab.value && "active")}
                >
                  {tab.label}
                  <span className="badge">{tab.count}</span>
                </button>
              ))}
            </div>

            {/* Brand Filter */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBrandFilter("all")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  brandFilter === "all"
                    ? "bg-foreground text-background"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                All
              </button>
              {brands.map((brand) => {
                const style = getBrandStyle(brand.id);
                return (
                  <button
                    key={brand.id}
                    onClick={() => setBrandFilter(brand.shortName)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                      brandFilter === brand.shortName
                        ? cn("text-white", style.accent)
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {brand.shortName}
                  </button>
                );
              })}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-8 w-8 p-0", viewMode === "grid" && "bg-background shadow-sm")}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-8 w-8 p-0", viewMode === "list" && "bg-background shadow-sm")}
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Vehicle Grid/List */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="empty-state-premium">
            <div className="empty-state-icon">
              <Car className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="empty-state-title">No vehicles found</h3>
            <p className="empty-state-description">
              Try adjusting your filters or search query to find what you're looking for.
            </p>
            <Button variant="outline" onClick={() => { setSearchQuery(""); setStatusFilter("all"); setBrandFilter("all"); }}>
              Clear Filters
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredVehicles.map((vehicle, index) => (
              <div
                key={vehicle.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
              >
                <VehicleCard
                  vehicle={vehicle}
                  onClick={() => setSelectedVehicle(vehicle)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="dashboard-widget overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vehicle</th>
                    <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">VIN</th>
                    <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price</th>
                    <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Age</th>
                    <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((vehicle) => {
                    const statusConfig = STATUS_CONFIG[vehicle.status] || STATUS_CONFIG.ordered;
                    const brandStyle = getBrandStyle(vehicle.brand);
                    return (
                      <tr
                        key={vehicle.id}
                        onClick={() => setSelectedVehicle(vehicle)}
                        className="table-row-hover cursor-pointer border-b"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-lg",
                              brandStyle.accent
                            )}>
                              <Car className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
                              <p className="text-sm text-muted-foreground">{vehicle.variant} · {vehicle.color}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <code className="vin-display">{vehicle.vin}</code>
                        </td>
                        <td className="p-4">
                          <Badge className={cn(statusConfig.color, "text-white")}>
                            {statusConfig.label}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className="font-display font-semibold">{formatCurrency(vehicle.listPrice)}</span>
                          <span className="text-xs text-muted-foreground ml-1">₫</span>
                        </td>
                        <td className="p-4">
                          {vehicle.daysInInventory > 0 ? (
                            <span className={cn(
                              "days-counter",
                              vehicle.ageAlert === "critical" ? "critical" :
                              vehicle.ageAlert === "warning" ? "warning" : "normal"
                            )}>
                              <Clock className="h-3.5 w-3.5" />
                              {vehicle.daysInInventory}d
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-4">
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Results count */}
        {!isLoading && filteredVehicles.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Showing {filteredVehicles.length} of {vehicles.length} vehicles
          </div>
        )}
      </div>

      {/* Vehicle Detail Sheet */}
      <VehicleDetailSheet
        vehicle={selectedVehicle}
        open={!!selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
      />
    </div>
  );
}
