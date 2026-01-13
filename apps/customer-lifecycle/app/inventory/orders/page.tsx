"use client";

import { useState, useEffect } from "react";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Separator,
} from "@tasco/ui";
import {
  Package,
  Search,
  ArrowLeft,
  Ship,
  Factory,
  Clock,
  CheckCircle2,
  TrendingUp,
  Calendar,
  DollarSign,
  FileText,
  ChevronRight,
  Sparkles,
  Truck,
  AlertCircle,
  MapPin,
  Car,
  Anchor,
  X,
  Eye,
  Globe,
  Warehouse,
  Building2,
  Shield,
  CreditCard,
  BarChart3,
  ArrowUpRight,
  Copy,
  Check,
} from "@tasco/ui/icons";
import { useEntityFilter } from "../../../lib/entity-filter-context";
import { getBrandStyleStatic } from "../../../lib/brands-context";

// Types
interface VehicleOrderLine {
  model: string;
  variant: string;
  color: string;
  quantity: number;
  unitPrice: number;
}

interface ImportOrder {
  id: string;
  orderNumber: string;
  brand: "GWM" | "GAC" | "Lotus";
  totalUnits: number;
  vehicles: VehicleOrderLine[];
  status: string;
  orderedAt: string;
  expectedProductionComplete: string;
  expectedShipDate: string;
  expectedArrivalDate: string;
  actualArrivalDate?: string;
  totalValue: number;
  totalValueFormatted: string;
  lcNumber?: string;
  lcOpenedAt?: string;
  lcExpiryAt?: string;
  notes?: string;
  entityId: string;
  createdAt: string;
  updatedAt: string;
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

// Status configuration with order pipeline stages
const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: typeof Package; step: number; description: string }> = {
  draft: { label: "Draft", color: "bg-slate-500", bgColor: "bg-slate-500/10", icon: FileText, step: 0, description: "Order drafted, awaiting submission" },
  submitted: { label: "Submitted", color: "bg-blue-500", bgColor: "bg-blue-500/10", icon: FileText, step: 1, description: "Submitted to OEM for confirmation" },
  confirmed: { label: "Confirmed", color: "bg-indigo-500", bgColor: "bg-indigo-500/10", icon: CheckCircle2, step: 2, description: "OEM confirmed, awaiting production" },
  in_production: { label: "Production", color: "bg-violet-500", bgColor: "bg-violet-500/10", icon: Factory, step: 3, description: "Vehicles being manufactured" },
  shipped: { label: "Shipped", color: "bg-cyan-500", bgColor: "bg-cyan-500/10", icon: Ship, step: 4, description: "On vessel, in transit to Vietnam" },
  arrived: { label: "Arrived", color: "bg-emerald-500", bgColor: "bg-emerald-500/10", icon: Anchor, step: 5, description: "Arrived at port, processing" },
  completed: { label: "Completed", color: "bg-green-600", bgColor: "bg-green-600/10", icon: CheckCircle2, step: 6, description: "All vehicles received" },
};

// Brand colors - now fetched from database via getBrandStyleStatic()

// Format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Format currency
function formatCurrency(value: number, short = false): string {
  if (short) {
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
    return `$${value}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

// Calculate days until arrival
function getDaysUntil(dateString: string): number {
  const target = new Date(dateString);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ============================================
// Supply Chain Timeline Component
// ============================================
function SupplyChainTimeline({ order }: { order: ImportOrder }) {
  const currentStep = STATUS_CONFIG[order.status]?.step || 0;

  const stages = [
    { key: "ordered", label: "Ordered", icon: FileText, date: order.orderedAt },
    { key: "confirmed", label: "Confirmed", icon: CheckCircle2, date: null },
    { key: "production", label: "Production", icon: Factory, date: order.expectedProductionComplete },
    { key: "shipped", label: "Shipped", icon: Ship, date: order.expectedShipDate },
    { key: "arrived", label: "Arrived", icon: Anchor, date: order.actualArrivalDate || order.expectedArrivalDate },
  ];

  return (
    <div className="relative">
      {/* Background line */}
      <div className="absolute top-6 left-0 right-0 h-1 bg-muted rounded-full" />

      {/* Progress line */}
      <div
        className="absolute top-6 left-0 h-1 bg-gradient-to-r from-violet-500 via-cyan-500 to-emerald-500 rounded-full transition-all duration-500"
        style={{ width: `${Math.min((currentStep / 5) * 100, 100)}%` }}
      />

      {/* Stage markers */}
      <div className="relative flex justify-between">
        {stages.map((stage, index) => {
          const StageIcon = stage.icon;
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep - 1;
          const isUpcoming = index >= currentStep;

          return (
            <div key={stage.key} className="flex flex-col items-center">
              <div className={cn(
                "relative flex h-12 w-12 items-center justify-center rounded-full border-4 transition-all duration-300",
                isCompleted ? "bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-500/50" :
                isCurrent ? "bg-gradient-to-br from-cyan-500 to-cyan-600 border-cyan-500/50 animate-pulse" :
                "bg-muted border-muted-foreground/20"
              )}>
                <StageIcon className={cn(
                  "h-5 w-5",
                  isCompleted || isCurrent ? "text-white" : "text-muted-foreground"
                )} />
                {isCurrent && (
                  <div className="absolute -inset-2 rounded-full bg-cyan-500/20 animate-ping" />
                )}
              </div>
              <p className={cn(
                "mt-3 text-sm font-medium",
                isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
              )}>
                {stage.label}
              </p>
              {stage.date && (
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(stage.date)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// Order Pipeline Mini Visualization
// ============================================
function OrderPipeline({ status }: { status: string }) {
  const currentStep = STATUS_CONFIG[status]?.step || 0;
  const stages = 5;

  return (
    <div className="flex items-center gap-1 w-full">
      {Array.from({ length: stages }).map((_, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep - 1;
        return (
          <div key={index} className="flex-1 flex items-center">
            <div className={cn(
              "h-1.5 flex-1 rounded-full transition-all",
              isCompleted || isCurrent
                ? "bg-gradient-to-r from-violet-500 to-cyan-500"
                : "bg-muted-foreground/20"
            )} />
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// Order Card Component
// ============================================
function OrderCard({
  order,
  onSelect
}: {
  order: ImportOrder;
  onSelect: (order: ImportOrder) => void;
}) {
  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.draft;
  const brandStyle = getBrandStyleStatic(order.brand);
  const StatusIcon = statusConfig.icon;
  const daysUntil = getDaysUntil(order.expectedArrivalDate);
  const isOverdue = daysUntil < 0 && order.status !== "completed" && order.status !== "arrived";

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-2 transition-all duration-300 cursor-pointer",
        "hover:shadow-2xl hover:scale-[1.02]",
        "bg-gradient-to-br",
        brandStyle.gradient,
        brandStyle.border
      )}
      onClick={() => onSelect(order)}
    >
      {/* Brand accent line */}
      <div className={cn("absolute top-0 left-0 right-0 h-1.5", brandStyle.accent)} />

      {/* Floating brand badge */}
      <div className="absolute top-4 right-4">
        <div className={cn(
          "px-3 py-1 rounded-full text-xs font-bold",
          brandStyle.accent,
          "text-white shadow-lg"
        )}>
          {order.brand}
        </div>
      </div>

      <div className="p-6 pt-8">
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl",
            "bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm",
            "ring-1 ring-white/30 shadow-lg"
          )}>
            <Package className={cn("h-7 w-7", brandStyle.text)} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-foreground">{order.orderNumber}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={cn(statusConfig.color, "text-white text-xs")}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {Math.abs(daysUntil)}d overdue
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Pipeline Progress */}
        <div className="mb-5">
          <OrderPipeline status={order.status} />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {statusConfig.description}
          </p>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Car className="h-3 w-3" /> Units
            </p>
            <p className="font-bold text-xl">{order.totalUnits}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> Value
            </p>
            <p className="font-bold text-xl">{formatCurrency(order.totalValue, true)}</p>
          </div>
        </div>

        {/* ETA Section */}
        <div className={cn(
          "rounded-xl p-3",
          "bg-gradient-to-br from-black/5 to-black/10",
          "border border-white/10"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Expected Arrival</span>
            </div>
            <span className={cn(
              "font-semibold",
              isOverdue ? "text-red-500" : daysUntil <= 7 ? "text-amber-500" : ""
            )}>
              {formatDate(order.expectedArrivalDate)}
            </span>
          </div>
          {!isOverdue && order.status !== "completed" && order.status !== "arrived" && (
            <div className="mt-2 text-center">
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                daysUntil <= 7 ? "bg-amber-500/20 text-amber-600" : "bg-cyan-500/20 text-cyan-600"
              )}>
                {daysUntil} days remaining
              </span>
            </div>
          )}
        </div>

        {/* Vehicle Breakdown */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Vehicle Manifest</p>
          <div className="space-y-1.5">
            {order.vehicles.slice(0, 2).map((v, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="font-medium">{v.model} {v.variant}</span>
                <span className="text-muted-foreground bg-black/10 px-2 py-0.5 rounded text-xs">
                  {v.quantity}x @ {formatCurrency(v.unitPrice, true)}
                </span>
              </div>
            ))}
            {order.vehicles.length > 2 && (
              <p className="text-xs text-muted-foreground">
                +{order.vehicles.length - 2} more configurations
              </p>
            )}
          </div>
        </div>
      </div>

      {/* View Details Button */}
      <div className="px-6 pb-6">
        <Button
          size="sm"
          variant="outline"
          className="w-full bg-white/5 border-white/20 hover:bg-white/10 group-hover:border-white/40"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
          <ChevronRight className="h-4 w-4 ml-auto transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </Card>
  );
}

// ============================================
// Order Detail Sheet Component
// ============================================
function OrderDetailSheet({
  order,
  open,
  onClose,
}: {
  order: ImportOrder | null;
  open: boolean;
  onClose: () => void;
}) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!order) return null;

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.draft;
  const brandStyle = getBrandStyleStatic(order.brand);
  const daysUntil = getDaysUntil(order.expectedArrivalDate);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
        {/* Header with brand gradient */}
        <div className={cn(
          "relative p-6 pb-8",
          "bg-gradient-to-br",
          brandStyle.gradient
        )}>
          <div className={cn("absolute top-0 left-0 right-0 h-1", brandStyle.accent)} />

          <SheetHeader className="relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-2xl",
                  "bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm",
                  "ring-2 ring-white/30"
                )}>
                  <Package className={cn("h-8 w-8", brandStyle.text)} />
                </div>
                <div>
                  <SheetTitle className="text-2xl font-bold">{order.orderNumber}</SheetTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={cn("px-3 py-1 rounded-full text-xs font-bold text-white", brandStyle.accent)}>
                      {order.brand}
                    </div>
                    <Badge className={cn(statusConfig.color, "text-white")}>
                      {statusConfig.label}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </SheetHeader>
        </div>

        {/* Supply Chain Timeline */}
        <div className="p-6 bg-muted/30">
          <h3 className="text-sm font-semibold text-muted-foreground mb-6">SUPPLY CHAIN STATUS</h3>
          <SupplyChainTimeline order={order} />
        </div>

        {/* Content */}
        <div className="p-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-500/20">
                  <Car className="h-6 w-6 mx-auto text-violet-500 mb-2" />
                  <p className="text-2xl font-bold">{order.totalUnits}</p>
                  <p className="text-xs text-muted-foreground">Total Units</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
                  <DollarSign className="h-6 w-6 mx-auto text-emerald-500 mb-2" />
                  <p className="text-2xl font-bold">{formatCurrency(order.totalValue, true)}</p>
                  <p className="text-xs text-muted-foreground">Total Value</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20">
                  <Clock className="h-6 w-6 mx-auto text-cyan-500 mb-2" />
                  <p className="text-2xl font-bold">{Math.abs(daysUntil)}</p>
                  <p className="text-xs text-muted-foreground">
                    {daysUntil >= 0 ? "Days to ETA" : "Days Overdue"}
                  </p>
                </div>
              </div>

              {/* Order Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground">ORDER INFORMATION</h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-muted">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Order Number
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">{order.orderNumber}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(order.orderNumber, "po")}
                      >
                        {copiedField === "po" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-muted">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Order Date
                    </span>
                    <span className="font-medium">{formatDate(order.orderedAt)}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-muted">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Ship className="h-4 w-4" /> Expected Arrival
                    </span>
                    <span className={cn(
                      "font-medium",
                      daysUntil < 0 && "text-red-500"
                    )}>
                      {formatDate(order.expectedArrivalDate)}
                    </span>
                  </div>

                  {order.actualArrivalDate && (
                    <div className="flex items-center justify-between py-2 border-b border-muted">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Anchor className="h-4 w-4" /> Actual Arrival
                      </span>
                      <span className="font-medium text-emerald-500">{formatDate(order.actualArrivalDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* L/C Information */}
              {order.lcNumber && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground">LETTER OF CREDIT</h4>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <CreditCard className="h-4 w-4" /> L/C Number
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium">{order.lcNumber}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(order.lcNumber!, "lc")}
                        >
                          {copiedField === "lc" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                    {order.lcExpiryAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">Expiry Date</span>
                        <span className="text-sm font-medium">{formatDate(order.lcExpiryAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {order.notes && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground">NOTES</h4>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-xl">
                    {order.notes}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Vehicles Tab */}
            <TabsContent value="vehicles" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-muted-foreground">VEHICLE MANIFEST</h4>
                <Badge variant="secondary">{order.totalUnits} units</Badge>
              </div>

              <div className="space-y-3">
                {order.vehicles.map((vehicle, index) => (
                  <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-xl",
                          brandStyle.bg
                        )}>
                          <Car className={cn("h-6 w-6", brandStyle.text)} />
                        </div>
                        <div>
                          <h5 className="font-semibold">{vehicle.model}</h5>
                          <p className="text-sm text-muted-foreground">{vehicle.variant} - {vehicle.color}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{vehicle.quantity} units</p>
                        <p className="text-sm text-muted-foreground">
                          @ {formatCurrency(vehicle.unitPrice)} each
                        </p>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Line Total</span>
                      <span className="font-semibold">{formatCurrency(vehicle.quantity * vehicle.unitPrice)}</span>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Total Summary */}
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Total Order Value</span>
                  <span className="text-2xl font-bold">{formatCurrency(order.totalValue)}</span>
                </div>
              </div>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-4">
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h4 className="font-semibold mb-2">Documents Coming Soon</h4>
                <p className="text-sm text-muted-foreground">
                  Document management for import orders will be available in a future update.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ============================================
// Stats Card Component
// ============================================
function StatsCard({
  title,
  value,
  icon: Icon,
  gradient,
  subtitle,
  trend,
}: {
  title: string;
  value: string | number;
  icon: typeof Package;
  gradient: string;
  subtitle?: string;
  trend?: { value: number; positive: boolean };
}) {
  return (
    <Card className={cn(
      "relative overflow-hidden border-0",
      "bg-gradient-to-br",
      gradient
    )}>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-white/70">{title}</p>
            <p className="text-3xl font-bold text-white mt-2">{value}</p>
            {subtitle && (
              <p className="text-sm text-white/60 mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className={cn(
                "inline-flex items-center gap-1 mt-2 text-xs px-2 py-0.5 rounded-full",
                trend.positive ? "bg-white/20 text-white" : "bg-red-500/20 text-red-200"
              )}>
                <TrendingUp className={cn("h-3 w-3", !trend.positive && "rotate-180")} />
                {trend.value}%
              </div>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </Card>
  );
}

// ============================================
// Main Page Component
// ============================================
export default function ImportOrdersPage() {
  const { selectedEntityIds } = useEntityFilter();
  const [orders, setOrders] = useState<ImportOrder[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<ImportOrder | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const entityParam = selectedEntityIds.length > 0
          ? `entityIds=${selectedEntityIds.join(",")}`
          : "";

        const [ordersRes, statsRes] = await Promise.all([
          fetch(`/api/orders${entityParam ? `?${entityParam}` : ""}`),
          fetch(`/api/orders?stats=true${entityParam ? `&${entityParam}` : ""}`),
        ]);

        const ordersData = await ordersRes.json();
        const statsData = await statsRes.json();

        if (ordersData.success) setOrders(ordersData.orders || []);
        if (statsData.success) setStats(statsData.stats);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [selectedEntityIds]);

  // Handle order selection
  const handleSelectOrder = (order: ImportOrder) => {
    setSelectedOrder(order);
    setDetailSheetOpen(true);
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (brandFilter !== "all" && o.brand !== brandFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(query) ||
        o.brand.toLowerCase().includes(query) ||
        (o.lcNumber && o.lcNumber.toLowerCase().includes(query))
      );
    }
    return true;
  });

  // Group by status for section display
  const ordersByStatus = {
    active: filteredOrders.filter(o => !["completed", "arrived"].includes(o.status)),
    arrived: filteredOrders.filter(o => o.status === "arrived"),
    completed: filteredOrders.filter(o => o.status === "completed"),
  };

  return (
    <div className="min-h-screen bg-mesh">
      <div className="p-6 md:p-8 space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-10">
          {/* Background effects */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/20 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px]" />

          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <Link
                  href="/inventory"
                  className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors group"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  Back to Inventory
                </Link>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-xl shadow-cyan-500/30">
                    <Ship className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-white">Import Orders</h1>
                    <p className="text-slate-400 text-lg">OEM Supply Chain Management</p>
                  </div>
                </div>
                <p className="text-slate-300 max-w-xl">
                  Track {orders.length} purchase orders through the global supply chain - from factory floor to showroom arrival.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
                <Button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 shadow-lg shadow-cyan-500/25">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Forecast
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="Total Orders"
            value={stats?.total || 0}
            icon={Package}
            gradient="from-violet-600 to-violet-700"
          />
          <StatsCard
            title="Total Units"
            value={stats?.totalUnits || 0}
            icon={Car}
            gradient="from-cyan-600 to-cyan-700"
            subtitle={stats ? formatCurrency(stats.totalValue) : undefined}
          />
          <StatsCard
            title="In Transit"
            value={stats?.pendingArrival || 0}
            icon={Ship}
            gradient="from-amber-500 to-amber-600"
          />
          <StatsCard
            title="Arrived This Month"
            value={stats?.arrivedThisMonth || 0}
            icon={CheckCircle2}
            gradient="from-emerald-500 to-emerald-600"
          />
        </div>

        {/* Filters */}
        <Card className="card-glass p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by PO number, brand, or L/C..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-full md:w-[180px] bg-background/50"
              options={[
                { value: "all", label: "All Status" },
                ...Object.entries(STATUS_CONFIG).map(([key, config]) => ({
                  value: key,
                  label: config.label,
                })),
              ]}
            />

            {/* Brand Filter */}
            <Select
              value={brandFilter}
              onChange={setBrandFilter}
              className="w-full md:w-[140px] bg-background/50"
              options={[
                { value: "all", label: "All Brands" },
                { value: "GWM", label: "GWM" },
                { value: "GAC", label: "GAC" },
                { value: "Lotus", label: "Lotus" },
              ]}
            />
          </div>
        </Card>

        {/* Orders Display */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[420px] rounded-xl" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card className="card-glass p-16 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">No orders found</h3>
                <p className="text-muted-foreground mt-2">
                  Try adjusting your filters or search query
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-10">
            {/* Active Orders */}
            {ordersByStatus.active.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-3 w-3 rounded-full bg-amber-500 animate-pulse" />
                  <h2 className="text-xl font-bold">Active Orders</h2>
                  <Badge variant="secondary" className="text-sm">{ordersByStatus.active.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ordersByStatus.active.map((order, index) => (
                    <div
                      key={order.id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <OrderCard order={order} onSelect={handleSelectOrder} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Arrived Orders */}
            {ordersByStatus.arrived.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-3 w-3 rounded-full bg-emerald-500" />
                  <h2 className="text-xl font-bold">Recently Arrived</h2>
                  <Badge variant="secondary" className="text-sm">{ordersByStatus.arrived.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ordersByStatus.arrived.map((order, index) => (
                    <div
                      key={order.id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <OrderCard order={order} onSelect={handleSelectOrder} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Completed Orders */}
            {ordersByStatus.completed.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-3 w-3 rounded-full bg-green-600" />
                  <h2 className="text-xl font-bold">Completed</h2>
                  <Badge variant="secondary" className="text-sm">{ordersByStatus.completed.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ordersByStatus.completed.map((order, index) => (
                    <div
                      key={order.id}
                      className="animate-fade-in-up opacity-80"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <OrderCard order={order} onSelect={handleSelectOrder} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Results count */}
        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </div>

      {/* Order Detail Sheet */}
      <OrderDetailSheet
        order={selectedOrder}
        open={detailSheetOpen}
        onClose={() => setDetailSheetOpen(false)}
      />
    </div>
  );
}
