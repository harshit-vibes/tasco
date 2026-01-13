"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  cn,
  Card,
  CardContent,
  Button,
  Badge,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Separator,
} from "@tasco/ui";
import {
  Filter,
  Search,
  Plus,
  ArrowUpDown,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Users,
  Target,
  Zap,
  LayoutGrid,
  List,
  ChevronDown,
  Clock,
  ArrowRight,
  Flame,
  Sparkles,
  Car,
  ChevronRight,
  MapPin,
  DollarSign,
  Package,
  CheckCircle2,
  Link2,
  Eye,
  X,
} from "@tasco/ui/icons";
import type { Lead } from "../../lib/data-layer";
import { useTranslation } from "@tasco/i18n";
import { LeadDetailSheet } from "../../components/lead-detail-sheet";
import { useEntityFilter, buildEntityFilterParams } from "../../lib/entity-filter-context";
import { getBrandStyleStatic } from "../../lib/brands-context";

// Vehicle type for matching
interface Vehicle {
  id: string;
  vin: string;
  brand: string;
  model: string;
  variant: string;
  color: string;
  year: number;
  listPrice: number;
  status: string;
  daysInInventory: number;
  ageAlert: string;
  assignedShowroom: string;
  reservedForLeadId?: string;
}

type FilterType = "all" | "hot" | "warm" | "cold";
type StatusFilter = "all" | "new" | "contacted" | "qualified" | "nurturing";
type SourceFilter = "all" | "website" | "referral" | "walk-in" | "event" | "social";
type SortField = "score" | "createdAt" | "name";
type ViewMode = "list" | "kanban";

// Brand configuration - now fetched from database via getBrandStyleStatic()

// Format currency
function formatCurrency(value: number, locale = "vi-VN"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

// Vehicle Match Card Component
function VehicleMatchCard({
  vehicle,
  lead,
  onReserve,
  onView,
}: {
  vehicle: Vehicle;
  lead: Lead;
  onReserve: (vehicleId: string, leadId: string) => void;
  onView: (vehicleId: string) => void;
}) {
  const brandStyle = getBrandStyleStatic(vehicle.brand);
  const isReserved = vehicle.reservedForLeadId === lead.id;
  const isReservedByOther = vehicle.reservedForLeadId && vehicle.reservedForLeadId !== lead.id;

  return (
    <div
      className={cn(
        "group relative rounded-xl border p-4 transition-all",
        isReserved
          ? "border-emerald-500/50 bg-emerald-500/5"
          : isReservedByOther
            ? "border-amber-500/30 bg-amber-500/5 opacity-60"
            : "border-border bg-card hover:border-primary/30 hover:shadow-md"
      )}
    >
      {/* Reserved Badge */}
      {isReserved && (
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-emerald-500 text-white text-[10px] px-2 py-0.5">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Reserved
          </Badge>
        </div>
      )}
      {isReservedByOther && (
        <div className="absolute -top-2 -right-2">
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
            Reserved by other
          </Badge>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Brand Icon */}
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", brandStyle.bg)}>
          <span className={cn("text-xs font-bold", brandStyle.text)}>{vehicle.brand}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm truncate">
              {vehicle.brand} {vehicle.model}
            </h4>
            {vehicle.ageAlert === "warning" && (
              <Badge variant="outline" className="text-amber-600 border-amber-300 text-[10px]">
                {vehicle.daysInInventory}d
              </Badge>
            )}
            {vehicle.ageAlert === "critical" && (
              <Badge variant="outline" className="text-red-600 border-red-300 text-[10px]">
                {vehicle.daysInInventory}d
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{vehicle.variant} • {vehicle.color}</p>

          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {formatCurrency(vehicle.listPrice)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {vehicle.assignedShowroom.split("_").pop()}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-xs h-8"
          onClick={() => onView(vehicle.id)}
        >
          <Eye className="h-3 w-3 mr-1" />
          View
        </Button>
        {!isReservedByOther && (
          <Button
            size="sm"
            className={cn(
              "flex-1 text-xs h-8",
              isReserved
                ? "bg-emerald-500 hover:bg-emerald-600"
                : "bg-gradient-to-r from-primary to-primary/80"
            )}
            onClick={() => onReserve(vehicle.id, lead.id)}
          >
            <Link2 className="h-3 w-3 mr-1" />
            {isReserved ? "Unreserve" : "Reserve"}
          </Button>
        )}
      </div>
    </div>
  );
}

// Vehicle Match Panel Component
function VehicleMatchPanel({
  lead,
  open,
  onClose,
}: {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
}) {
  const [matchingVehicles, setMatchingVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!lead || !open) return;

    const currentLead = lead; // Capture lead in a const for closure

    async function loadMatchingVehicles() {
      setIsLoading(true);
      try {
        // Fetch available vehicles that match lead's brand interests
        const response = await fetch("/api/inventory?available=true");
        const data = await response.json();

        if (data.success && Array.isArray(data.vehicles)) {
          // Filter by lead's brand interests
          const matches = data.vehicles.filter((v: Vehicle) =>
            currentLead.interest.brands.some(
              (brand) => v.brand.toLowerCase().includes(brand.toLowerCase()) ||
                brand.toLowerCase().includes(v.brand.toLowerCase())
            )
          );

          // Sort by relevance (exact match first, then by days in inventory)
          matches.sort((a: Vehicle, b: Vehicle) => {
            // Priority: reserved for this lead > exact brand match > days in inventory
            if (a.reservedForLeadId === currentLead.id) return -1;
            if (b.reservedForLeadId === currentLead.id) return 1;
            return b.daysInInventory - a.daysInInventory;
          });

          setMatchingVehicles(matches);
        }
      } catch (error) {
        console.error("Error loading matching vehicles:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadMatchingVehicles();
  }, [lead, open]);

  const handleReserve = async (vehicleId: string, leadId: string) => {
    try {
      const vehicle = matchingVehicles.find((v) => v.id === vehicleId);
      const isCurrentlyReserved = vehicle?.reservedForLeadId === leadId;

      const response = await fetch(`/api/inventory/${vehicleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservedForLeadId: isCurrentlyReserved ? null : leadId,
          status: isCurrentlyReserved ? "at_showroom" : "reserved",
        }),
      });

      if (response.ok) {
        // Refresh vehicles
        const refreshResponse = await fetch("/api/inventory?available=true");
        const data = await refreshResponse.json();
        if (data.success && Array.isArray(data.vehicles)) {
          const matches = data.vehicles.filter((v: Vehicle) =>
            lead?.interest.brands.some(
              (brand) => v.brand.toLowerCase().includes(brand.toLowerCase()) ||
                brand.toLowerCase().includes(v.brand.toLowerCase())
            )
          );
          setMatchingVehicles(matches);
        }
      }
    } catch (error) {
      console.error("Error reserving vehicle:", error);
    }
  };

  const handleViewVehicle = (vehicleId: string) => {
    router.push(`/inventory?id=${vehicleId}`);
  };

  if (!lead) return null;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="w-[420px] sm:w-[480px] p-0 overflow-hidden">
        <div className="flex h-full flex-col">
          {/* Header */}
          <SheetHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-lg font-display">Vehicle Matches</SheetTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  For {lead.customer.name}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Lead Interests Summary */}
            <div className="mt-4 flex flex-wrap gap-2">
              {lead.interest.brands.map((brand) => {
                const style = getBrandStyleStatic(brand);
                return (
                  <Badge key={brand} className={cn("text-xs", style.bg, style.text)}>
                    {brand}
                  </Badge>
                );
              })}
              <Badge variant="outline" className="text-xs">
                Budget: {lead.interest.budget}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Timeline: {lead.interest.timeline}
              </Badge>
            </div>
          </SheetHeader>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Car className="mx-auto h-8 w-8 text-muted-foreground animate-pulse" />
                  <p className="mt-2 text-sm text-muted-foreground">Finding matches...</p>
                </div>
              </div>
            ) : matchingVehicles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <Car className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="mt-4 font-medium">No matching vehicles</p>
                <p className="mt-1 text-sm text-muted-foreground text-center">
                  No vehicles available matching {lead.customer.name}'s brand preferences
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {matchingVehicles.length} vehicles available
                  </span>
                  <span className="text-muted-foreground">
                    {matchingVehicles.filter((v) => v.reservedForLeadId === lead.id).length} reserved
                  </span>
                </div>

                {matchingVehicles.map((vehicle) => (
                  <VehicleMatchCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    lead={lead}
                    onReserve={handleReserve}
                    onView={handleViewVehicle}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t bg-muted/30 p-4">
            <Button
              className="w-full bg-gradient-brand"
              onClick={() => router.push("/inventory")}
            >
              <Package className="h-4 w-4 mr-2" />
              View All Inventory
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function LeadsPage() {
  const { t } = useTranslation("leads");
  const { t: tApp } = useTranslation("app");
  const searchParams = useSearchParams();
  const router = useRouter();

  // Entity filter from context
  const { selectedEntityIds, isLoading: isEntitiesLoading } = useEntityFilter();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<FilterType>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [sortField, setSortField] = useState<SortField>("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Sheet overlay state
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [sheetMode, setSheetMode] = useState<"view" | "create" | "edit">("view");

  // Vehicle match panel state
  const [matchPanelLead, setMatchPanelLead] = useState<Lead | null>(null);

  // Handle URL deep linking
  useEffect(() => {
    const idParam = searchParams.get("id");
    if (idParam) {
      setSelectedLeadId(idParam);
    }
  }, [searchParams]);

  // Update URL when sheet opens/closes
  const handleLeadSelect = (leadId: string | null) => {
    setSelectedLeadId(leadId);
    setSheetMode("view");
    if (leadId) {
      router.push(`/leads?id=${leadId}`, { scroll: false });
    } else {
      router.push("/leads", { scroll: false });
    }
  };

  // Open sheet in create mode
  const handleCreateLead = () => {
    setSelectedLeadId(null);
    setSheetMode("create");
  };

  // Close sheet
  const handleCloseSheet = () => {
    setSelectedLeadId(null);
    setSheetMode("view");
    router.push("/leads", { scroll: false });
  };

  // Open vehicle match panel
  const handleOpenMatchPanel = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    setMatchPanelLead(lead);
  };

  useEffect(() => {
    // Wait for entities to load before fetching leads
    if (isEntitiesLoading) return;

    async function loadLeads() {
      setIsLoading(true);
      try {
        // Build entity filter query param
        const entityParam = buildEntityFilterParams(selectedEntityIds);
        const url = entityParam ? `/api/leads?${entityParam}` : "/api/leads";

        // Fetch leads from API route with entity filter
        const response = await fetch(url);
        const data = await response.json();
        if (data.success && Array.isArray(data.leads)) {
          setLeads(data.leads);
          setFilteredLeads(data.leads);
        } else {
          // Ensure arrays are set even if API returns empty/invalid data
          setLeads([]);
          setFilteredLeads([]);
        }
      } catch (error) {
        console.error("Error loading leads:", error);
        setLeads([]);
        setFilteredLeads([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadLeads();
  }, [selectedEntityIds, isEntitiesLoading]);

  useEffect(() => {
    let filtered = [...leads];

    if (searchQuery) {
      filtered = filtered.filter(
        (lead) =>
          lead.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.customer.phone.includes(searchQuery)
      );
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((lead) => lead.priority === priorityFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((lead) => lead.status === statusFilter);
    }

    if (sourceFilter !== "all") {
      filtered = filtered.filter((lead) => lead.source === sourceFilter);
    }

    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case "score":
          aValue = a.score;
          bValue = b.score;
          break;
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "name":
          aValue = a.customer.name;
          bValue = b.customer.name;
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredLeads(filtered);
  }, [
    leads,
    searchQuery,
    priorityFilter,
    statusFilter,
    sourceFilter,
    sortField,
    sortOrder,
  ]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Stats calculation
  const stats = {
    total: leads.length,
    hot: leads.filter((l) => l.priority === "hot").length,
    new: leads.filter((l) => l.status === "new").length,
    qualified: leads.filter((l) => l.status === "qualified").length,
    avgScore: leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length) : 0,
  };

  // Kanban columns
  const kanbanColumns = [
    { key: "new", labelKey: "status.new", color: "from-emerald-500 to-teal-500" },
    { key: "contacted", labelKey: "status.contacted", color: "from-blue-500 to-cyan-500" },
    { key: "qualified", labelKey: "status.qualified", color: "from-violet-500 to-purple-500" },
    { key: "nurturing", labelKey: "status.nurturing", color: "from-amber-500 to-orange-500" },
  ];

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-brand animate-pulse" />
            <Users className="absolute inset-0 m-auto h-8 w-8 text-white" />
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
                  {filteredLeads.length} {tApp("navigation.leads").toLowerCase()} • {stats.hot} {t("priority.hot").toLowerCase()}
                </p>
              </div>
              <div className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                {/* View Mode Toggle */}
                <div className="flex items-center rounded-lg border bg-muted/30 p-1">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                      viewMode === "list"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <List className="h-4 w-4" />
                    {t("view.list")}
                  </button>
                  <button
                    onClick={() => setViewMode("kanban")}
                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                      viewMode === "kanban"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    {t("view.kanban")}
                  </button>
                </div>
                <Button
                  className="gap-2 bg-gradient-brand shadow-lg hover:opacity-90"
                  onClick={handleCreateLead}
                >
                  <Plus className="h-4 w-4" />
                  {t("actions.create_lead")}
                </Button>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="mt-6 grid gap-4 md:grid-cols-4 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
              {[
                { labelKey: "stats.total_leads", value: stats.total, icon: Users, color: "from-blue-500 to-cyan-500" },
                { labelKey: "stats.hot_prospects", value: stats.hot, icon: Flame, color: "from-red-500 to-orange-500" },
                { labelKey: "stats.new_today", value: stats.new, icon: Sparkles, color: "from-emerald-500 to-teal-500" },
                { labelKey: "stats.avg_score", value: stats.avgScore, icon: Target, color: "from-violet-500 to-purple-500" },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.labelKey}
                    className="flex items-center gap-4 rounded-xl border bg-card/50 p-4 transition-all hover:shadow-md"
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t(stat.labelKey)}</p>
                      <p className="font-display text-2xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                );
              })}
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
                  placeholder={tApp("search.placeholder_leads")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 rounded-xl border-0 bg-muted/50 pl-10 pr-4 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground mr-2">{t("filters.priority")}:</span>
                {(["all", "hot", "warm", "cold"] as FilterType[]).map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setPriorityFilter(priority)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      priorityFilter === priority
                        ? priority === "hot"
                          ? "bg-red-500 text-white shadow-md"
                          : priority === "warm"
                            ? "bg-amber-500 text-white shadow-md"
                            : priority === "cold"
                              ? "bg-blue-500 text-white shadow-md"
                              : "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {t(`priority.${priority}`)}
                    {priority !== "all" && (
                      <span className="ml-1.5 opacity-70">
                        {leads.filter((l) => l.priority === priority).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="mx-auto max-w-7xl px-6 py-6 md:px-8">
          {viewMode === "list" ? (
            /* List View */
            <Card className="card-glass overflow-hidden animate-fade-in-up">
              <CardContent className="p-0">
                {/* Column Headers */}
                <div className="flex items-center border-b bg-muted/30 px-4 py-3 text-sm font-medium">
                  <div
                    className="min-w-0 flex-1 cursor-pointer hover:text-primary flex items-center gap-2"
                    onClick={() => toggleSort("name")}
                  >
                    {t("columns.lead")}
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </div>
                  <div className="w-28 px-4 text-center">{t("columns.priority")}</div>
                  <div className="w-28 px-4 text-center">{t("columns.status")}</div>
                  <div
                    className="w-24 cursor-pointer px-4 hover:text-primary flex items-center gap-2"
                    onClick={() => toggleSort("score")}
                  >
                    {t("columns.score")}
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </div>
                  <div className="w-40 px-4">{t("columns.interest")}</div>
                  <div className="w-24 px-4 text-center">Vehicles</div>
                  <div
                    className="w-28 cursor-pointer px-4 hover:text-primary flex items-center gap-2"
                    onClick={() => toggleSort("createdAt")}
                  >
                    {t("columns.date")}
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Leads List */}
                {filteredLeads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="mt-4 font-medium">{t("empty.no_leads")}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("empty.no_leads_hint")}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredLeads.map((lead, index) => (
                      <div
                        key={lead.id}
                        onClick={() => handleLeadSelect(lead.id)}
                        className="flex items-center px-4 py-4 transition-all hover:bg-muted/50 animate-fade-in-up cursor-pointer"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-11 w-11 items-center justify-center rounded-full font-semibold text-white shadow-md ${
                              lead.priority === "hot"
                                ? "bg-gradient-to-br from-red-500 to-orange-500"
                                : lead.priority === "warm"
                                  ? "bg-gradient-to-br from-amber-500 to-yellow-500"
                                  : "bg-gradient-to-br from-blue-500 to-cyan-500"
                            }`}>
                              {lead.customer.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{lead.customer.name}</p>
                              <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1 truncate">
                                  <Mail className="h-3 w-3 flex-shrink-0" />
                                  {lead.customer.email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3 flex-shrink-0" />
                                  {lead.customer.phone}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="w-28 px-4 text-center">
                          <span className={`priority-badge ${lead.priority}`}>
                            {t(`priority.${lead.priority}`)}
                          </span>
                        </div>
                        <div className="w-28 px-4 text-center">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            lead.status === "new"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : lead.status === "contacted"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                : lead.status === "qualified"
                                  ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          }`}>
                            {t(`status.${lead.status}`)}
                          </span>
                        </div>
                        <div className="w-24 px-4">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  lead.score >= 80
                                    ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                                    : lead.score >= 50
                                      ? "bg-gradient-to-r from-amber-500 to-yellow-500"
                                      : "bg-gradient-to-r from-blue-500 to-cyan-500"
                                }`}
                                style={{ width: `${lead.score}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold">{lead.score}</span>
                          </div>
                        </div>
                        <div className="w-40 px-4">
                          <div className="flex items-center gap-1.5">
                            <Car className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            <p className="text-sm text-muted-foreground truncate">
                              {lead.interest.brands.slice(0, 2).join(", ")}
                            </p>
                          </div>
                        </div>
                        <div className="w-24 px-4 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                            onClick={(e) => handleOpenMatchPanel(lead, e)}
                          >
                            <Link2 className="h-3 w-3" />
                            Match
                          </Button>
                        </div>
                        <div className="w-28 px-4">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(lead.createdAt).toLocaleDateString("vi-VN")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            /* Kanban View */
            <div className="grid grid-cols-4 gap-4 overflow-x-auto pb-4 animate-fade-in-up">
              {kanbanColumns.map((column) => {
                const columnLeads = filteredLeads.filter((l) => l.status === column.key);
                return (
                  <div key={column.key} className="flex flex-col min-w-[280px]">
                    {/* Column Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full bg-gradient-to-r ${column.color}`} />
                        <h3 className="font-semibold">{t(column.labelKey)}</h3>
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium">
                          {columnLeads.length}
                        </span>
                      </div>
                    </div>

                    {/* Column Cards */}
                    <div className="flex-1 space-y-2">
                      {columnLeads.map((lead, index) => (
                        <div
                          key={lead.id}
                          onClick={() => handleLeadSelect(lead.id)}
                          className="block animate-fade-in-up relative z-0 hover:z-10"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <Card className="card-elevated transition-all hover:shadow-md cursor-pointer">
                            <CardContent className="p-3">
                              <div className="flex items-center gap-2">
                                <div className={`flex h-8 w-8 items-center justify-center rounded-full font-medium text-white text-xs shadow-sm flex-shrink-0 ${
                                  lead.priority === "hot"
                                    ? "bg-gradient-to-br from-red-500 to-orange-500"
                                    : lead.priority === "warm"
                                      ? "bg-gradient-to-br from-amber-500 to-yellow-500"
                                      : "bg-gradient-to-br from-blue-500 to-cyan-500"
                                }`}>
                                  {lead.customer.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{lead.customer.name}</p>
                                  <p className="text-[10px] text-muted-foreground truncate">
                                    {lead.customer.email}
                                  </p>
                                </div>
                                <span className={`priority-badge ${lead.priority} text-[10px] px-1.5 py-0.5`}>
                                  {t(`priority.${lead.priority}`)}
                                </span>
                              </div>

                              <div className="mt-2 flex items-center justify-between text-[10px]">
                                <span className="text-muted-foreground truncate">
                                  {lead.interest.brands[0]}
                                </span>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-5 w-5 p-0"
                                    onClick={(e) => handleOpenMatchPanel(lead, e)}
                                  >
                                    <Link2 className="h-3 w-3" />
                                  </Button>
                                  <div className="flex items-center gap-1">
                                    <Zap className="h-3 w-3 text-amber-500" />
                                    <span className="font-semibold">{lead.score}</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}

                      {columnLeads.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-center rounded-xl border-2 border-dashed">
                          <p className="text-sm text-muted-foreground">{t("empty.no_leads_column")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Lead Detail Sheet */}
      <LeadDetailSheet
        open={!!selectedLeadId || sheetMode === "create"}
        onOpenChange={(open) => !open && handleCloseSheet()}
        leadId={selectedLeadId}
        mode={sheetMode}
        onModeChange={setSheetMode}
        onLeadUpdated={() => {
          // Refresh leads list when a lead is updated
          const entityParam = buildEntityFilterParams(selectedEntityIds);
          const url = entityParam ? `/api/leads?${entityParam}` : "/api/leads";
          fetch(url)
            .then((res) => res.json())
            .then((data) => {
              if (data.success && Array.isArray(data.leads)) {
                setLeads(data.leads);
              }
            });
        }}
        onLeadCreated={(newLead) => {
          // Add new lead to list and close sheet
          setLeads([newLead, ...leads]);
          handleCloseSheet();
        }}
      />

      {/* Vehicle Match Panel */}
      <VehicleMatchPanel
        lead={matchPanelLead}
        open={!!matchPanelLead}
        onClose={() => setMatchPanelLead(null)}
      />
    </div>
  );
}
