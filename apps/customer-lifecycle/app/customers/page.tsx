"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, Button, Badge } from "@tasco/ui";
import {
  Search,
  Plus,
  ArrowUpDown,
  Mail,
  Phone,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  UserCircle,
  Crown,
  Star,
  Clock,
  Activity,
  Users,
  Sparkles,
  Car,
} from "@tasco/ui/icons";
import type { Customer } from "../../lib/data-layer";
import { useTranslation } from "@tasco/i18n";
import { CustomerDetailSheet } from "../../components/customer-detail-sheet";
import { useEntityFilter, buildEntityFilterParams } from "../../lib/entity-filter-context";

type SegmentFilter = "all" | "vip" | "regular" | "at-risk" | "new";
type SortField = "name" | "ltv" | "lastActivity" | "purchases";

export default function CustomersPage() {
  const { t } = useTranslation("customers");
  const { t: tApp } = useTranslation("app");
  const searchParams = useSearchParams();
  const router = useRouter();

  // Entity filter from context
  const { selectedEntityIds, isLoading: isEntitiesLoading } = useEntityFilter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<SegmentFilter>("all");
  const [sortField, setSortField] = useState<SortField>("ltv");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Sheet overlay state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [sheetMode, setSheetMode] = useState<"view" | "create" | "edit">("view");

  // Handle URL deep linking
  useEffect(() => {
    const idParam = searchParams.get("id");
    if (idParam) {
      setSelectedCustomerId(idParam);
    }
  }, [searchParams]);

  // Update URL when sheet opens/closes
  const handleCustomerSelect = (customerId: string | null) => {
    setSelectedCustomerId(customerId);
    setSheetMode("view");
    if (customerId) {
      router.push(`/customers?id=${customerId}`, { scroll: false });
    } else {
      router.push("/customers", { scroll: false });
    }
  };

  // Open sheet in create mode
  const handleCreateCustomer = () => {
    setSelectedCustomerId(null);
    setSheetMode("create");
  };

  // Close sheet
  const handleCloseSheet = () => {
    setSelectedCustomerId(null);
    setSheetMode("view");
    router.push("/customers", { scroll: false });
  };

  useEffect(() => {
    // Wait for entities to load before fetching customers
    if (isEntitiesLoading) return;

    async function loadCustomers() {
      setIsLoading(true);
      try {
        // Build entity filter query param
        const entityParam = buildEntityFilterParams(selectedEntityIds);
        const url = entityParam ? `/api/customers?${entityParam}` : "/api/customers";

        // Fetch customers from API route with entity filter
        const response = await fetch(url);
        const data = await response.json();
        if (data.success && Array.isArray(data.customers)) {
          setCustomers(data.customers);
          setFilteredCustomers(data.customers);
        } else {
          // Ensure arrays are set even if API returns empty/invalid data
          setCustomers([]);
          setFilteredCustomers([]);
        }
      } catch (error) {
        console.error("Error loading customers:", error);
        setCustomers([]);
        setFilteredCustomers([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadCustomers();
  }, [selectedEntityIds, isEntitiesLoading]);

  useEffect(() => {
    let filtered = [...customers];

    if (searchQuery) {
      filtered = filtered.filter(
        (customer) =>
          customer.profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.profile.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.profile.phone.includes(searchQuery)
      );
    }

    if (segmentFilter !== "all") {
      filtered = filtered.filter(
        (customer) => customer.insights.segment === segmentFilter
      );
    }

    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case "name":
          aValue = a.profile.name;
          bValue = b.profile.name;
          break;
        case "ltv":
          aValue = a.insights.lifetimeValue;
          bValue = b.insights.lifetimeValue;
          break;
        case "lastActivity":
          aValue = new Date(a.lastActivityAt).getTime();
          bValue = new Date(b.lastActivityAt).getTime();
          break;
        case "purchases":
          aValue = a.insights.totalPurchases;
          bValue = b.insights.totalPurchases;
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCustomers(filtered);
  }, [customers, searchQuery, segmentFilter, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)}M`;
    }
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const stats = {
    total: customers.length,
    vip: customers.filter((c) => c.insights.segment === "vip").length,
    regular: customers.filter((c) => c.insights.segment === "regular").length,
    atRisk: customers.filter((c) => c.insights.segment === "at-risk").length,
    new: customers.filter((c) => c.insights.segment === "new").length,
    totalLTV: customers.reduce((sum, c) => sum + c.insights.lifetimeValue, 0),
    avgLTV: customers.length > 0 ? customers.reduce((sum, c) => sum + c.insights.lifetimeValue, 0) / customers.length : 0,
    avgSatisfaction: customers.length > 0 ? (customers.reduce((sum, c) => sum + c.insights.satisfactionScore, 0) / customers.length).toFixed(1) : 0,
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-brand animate-pulse" />
            <UserCircle className="absolute inset-0 m-auto h-8 w-8 text-white" />
          </div>
          <p className="mt-6 text-sm font-medium text-muted-foreground">{tApp("actions.loading")}</p>
        </div>
      </div>
    );
  }

  const segmentConfig = {
    all: { labelKey: "segment.all", color: "bg-primary" },
    vip: { labelKey: "segment.vip", color: "bg-gradient-to-r from-violet-500 to-purple-500", icon: Crown },
    regular: { labelKey: "segment.regular", color: "bg-gradient-to-r from-blue-500 to-cyan-500", icon: Users },
    "at-risk": { labelKey: "segment.at-risk", color: "bg-gradient-to-r from-red-500 to-orange-500", icon: AlertTriangle },
    new: { labelKey: "segment.new", color: "bg-gradient-to-r from-emerald-500 to-teal-500", icon: Sparkles },
  };

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
                  {filteredCustomers.length} {tApp("navigation.customers").toLowerCase()} • {formatCurrency(stats.totalLTV)} VND
                </p>
              </div>
              <Button
                className="gap-2 bg-gradient-brand shadow-lg hover:opacity-90 animate-fade-in-up"
                style={{ animationDelay: "100ms" }}
                onClick={handleCreateCustomer}
              >
                <Plus className="h-4 w-4" />
                {t("actions.add_customer")}
              </Button>
            </div>

            {/* Stats Summary */}
            <div className="mt-6 grid gap-4 md:grid-cols-5 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
              <div className="flex items-center gap-4 rounded-xl border bg-card/50 p-4 transition-all hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("stats.total")}</p>
                  <p className="font-display text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl border bg-card/50 p-4 transition-all hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("stats.vip")}</p>
                  <p className="font-display text-2xl font-bold">{stats.vip}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl border bg-card/50 p-4 transition-all hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("stats.at_risk")}</p>
                  <p className="font-display text-2xl font-bold">{stats.atRisk}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl border bg-card/50 p-4 transition-all hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("stats.avg_ltv")}</p>
                  <p className="font-display text-lg font-bold">{formatCurrency(stats.avgLTV)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl border bg-card/50 p-4 transition-all hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("stats.satisfaction")}</p>
                  <p className="font-display text-2xl font-bold">{stats.avgSatisfaction}/5</p>
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
                  placeholder={tApp("search.placeholder_customers")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 rounded-xl border-0 bg-muted/50 pl-10 pr-4 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Segment Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground mr-2">{t("filters.segment")}:</span>
                {(["all", "vip", "regular", "at-risk", "new"] as SegmentFilter[]).map((segment) => {
                  const config = segmentConfig[segment];
                  const count = segment === "all" ? stats.total : stats[segment === "at-risk" ? "atRisk" : segment as keyof typeof stats] as number;
                  return (
                    <button
                      key={segment}
                      onClick={() => setSegmentFilter(segment)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                        segmentFilter === segment
                          ? segment === "all"
                            ? "bg-primary text-primary-foreground shadow-md"
                            : `${config.color} text-white shadow-md`
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {t(config.labelKey)}
                      <span className={`${segmentFilter === segment ? "opacity-80" : "opacity-60"}`}>
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
          <Card className="card-glass overflow-hidden animate-fade-in-up">
            <CardContent className="p-0">
              {/* Column Headers */}
              <div className="flex items-center border-b bg-muted/30 px-4 py-3 text-sm font-medium">
                <div
                  className="min-w-0 flex-1 cursor-pointer hover:text-primary flex items-center gap-2"
                  onClick={() => toggleSort("name")}
                >
                  {t("columns.customer")}
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </div>
                <div className="w-28 px-4 text-center">{t("columns.segment")}</div>
                <div
                  className="w-36 cursor-pointer px-4 hover:text-primary flex items-center gap-2"
                  onClick={() => toggleSort("ltv")}
                >
                  {t("columns.lifetime_value")}
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </div>
                <div
                  className="w-28 cursor-pointer px-4 hover:text-primary flex items-center gap-2"
                  onClick={() => toggleSort("purchases")}
                >
                  {t("columns.purchases")}
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </div>
                <div className="w-32 px-4">{t("columns.churn_risk")}</div>
                <div
                  className="w-32 cursor-pointer px-4 hover:text-primary flex items-center gap-2"
                  onClick={() => toggleSort("lastActivity")}
                >
                  {t("columns.last_active")}
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Customers List */}
              {filteredCustomers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                    <UserCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="mt-4 font-medium">{t("empty.no_customers")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("empty.no_customers_hint")}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredCustomers.map((customer, index) => (
                    <div
                      key={customer.id}
                      onClick={() => handleCustomerSelect(customer.id)}
                      className="flex items-center px-4 py-4 transition-all hover:bg-muted/50 animate-fade-in-up cursor-pointer"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-11 w-11 items-center justify-center rounded-full font-semibold text-white shadow-md ${
                            customer.insights.segment === "vip"
                              ? "bg-gradient-to-br from-violet-500 to-purple-500"
                              : customer.insights.segment === "at-risk"
                                ? "bg-gradient-to-br from-red-500 to-orange-500"
                                : customer.insights.segment === "new"
                                  ? "bg-gradient-to-br from-emerald-500 to-teal-500"
                                  : "bg-gradient-to-br from-blue-500 to-cyan-500"
                          }`}>
                            {customer.profile.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">{customer.profile.name}</p>
                              {customer.insights.segment === "vip" && (
                                <Crown className="h-4 w-4 text-violet-500 flex-shrink-0" />
                              )}
                              {customer.insights.churnRisk > 0.7 && (
                                <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                              )}
                            </div>
                            <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1 truncate">
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                {customer.profile.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3 flex-shrink-0" />
                                {customer.profile.phone}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="w-28 px-4 text-center">
                        <span className={`segment-badge ${customer.insights.segment}`}>
                          {t(`segment.${customer.insights.segment}`)}
                        </span>
                      </div>
                      <div className="w-36 px-4">
                        <p className="font-semibold">{formatCurrency(customer.insights.lifetimeValue)} VND</p>
                      </div>
                      <div className="w-28 px-4">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{customer.insights.totalPurchases}</span>
                        </div>
                      </div>
                      <div className="w-32 px-4">
                        <div className="flex items-center gap-2">
                          <div className="churn-bar">
                            <div
                              className="churn-bar-fill"
                              style={{ width: `${customer.insights.churnRisk * 100}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${
                            customer.insights.churnRisk > 0.7
                              ? "text-red-600"
                              : customer.insights.churnRisk > 0.4
                                ? "text-amber-600"
                                : "text-emerald-600"
                          }`}>
                            {(customer.insights.churnRisk * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-32 px-4">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(customer.lastActivityAt).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Customer Detail Sheet */}
      <CustomerDetailSheet
        open={!!selectedCustomerId || sheetMode === "create"}
        onOpenChange={(open) => !open && handleCloseSheet()}
        customerId={selectedCustomerId}
        mode={sheetMode}
        onModeChange={setSheetMode}
        onCustomerUpdated={() => {
          // Refresh customers list when a customer is updated
          const entityParam = buildEntityFilterParams(selectedEntityIds);
          const url = entityParam ? `/api/customers?${entityParam}` : "/api/customers";
          fetch(url)
            .then((res) => res.json())
            .then((data) => {
              if (data.success && Array.isArray(data.customers)) {
                setCustomers(data.customers);
              }
            });
        }}
        onCustomerCreated={(newCustomer) => {
          // Add new customer to list and close sheet
          setCustomers([newCustomer, ...customers]);
          handleCloseSheet();
        }}
      />
    </div>
  );
}
