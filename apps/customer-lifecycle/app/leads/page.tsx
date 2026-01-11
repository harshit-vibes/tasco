"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent, Button, Badge } from "@tasco/ui";
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
} from "@tasco/ui/icons";
import {
  getAllLeads,
  type Lead,
} from "../../lib/data-layer";
import { useTranslation } from "@tasco/i18n";

type FilterType = "all" | "hot" | "warm" | "cold";
type StatusFilter = "all" | "new" | "contacted" | "qualified" | "nurturing";
type SourceFilter = "all" | "website" | "referral" | "walk-in" | "event" | "social";
type SortField = "score" | "createdAt" | "name";
type ViewMode = "list" | "kanban";

export default function LeadsPage() {
  const { t } = useTranslation("app");
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

  useEffect(() => {
    async function loadLeads() {
      try {
        const leadsData = await getAllLeads();
        setLeads(leadsData);
        setFilteredLeads(leadsData);
      } catch (error) {
        console.error("Error loading leads:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadLeads();
  }, []);

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
    { key: "new", label: "New", color: "from-emerald-500 to-teal-500" },
    { key: "contacted", label: "Contacted", color: "from-blue-500 to-cyan-500" },
    { key: "qualified", label: "Qualified", color: "from-violet-500 to-purple-500" },
    { key: "nurturing", label: "Nurturing", color: "from-amber-500 to-orange-500" },
  ];

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-brand animate-pulse" />
            <Users className="absolute inset-0 m-auto h-8 w-8 text-white" />
          </div>
          <p className="mt-6 text-sm font-medium text-muted-foreground">Loading leads...</p>
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
                <h1 className="font-display text-3xl font-bold tracking-tight">Lead Inbox</h1>
                <p className="mt-1 text-muted-foreground">
                  {filteredLeads.length} leads • {stats.hot} hot prospects ready to convert
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
                    List
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
                    Kanban
                  </button>
                </div>
                <Button className="gap-2 bg-gradient-brand shadow-lg hover:opacity-90">
                  <Plus className="h-4 w-4" />
                  Add Lead
                </Button>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="mt-6 grid gap-4 md:grid-cols-4 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
              {[
                { label: "Total Leads", value: stats.total, icon: Users, color: "from-blue-500 to-cyan-500" },
                { label: "Hot Prospects", value: stats.hot, icon: Flame, color: "from-red-500 to-orange-500" },
                { label: "New Today", value: stats.new, icon: Sparkles, color: "from-emerald-500 to-teal-500" },
                { label: "Avg Score", value: stats.avgScore, icon: Target, color: "from-violet-500 to-purple-500" },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="flex items-center gap-4 rounded-xl border bg-card/50 p-4 transition-all hover:shadow-md"
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
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
                  placeholder="Search leads by name, email, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 rounded-xl border-0 bg-muted/50 pl-10 pr-4 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground mr-2">Priority:</span>
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
                    {priority === "all" ? "All" : priority.charAt(0).toUpperCase() + priority.slice(1)}
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
                    Lead
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </div>
                  <div className="w-28 px-4 text-center">Priority</div>
                  <div className="w-28 px-4 text-center">Status</div>
                  <div
                    className="w-24 cursor-pointer px-4 hover:text-primary flex items-center gap-2"
                    onClick={() => toggleSort("score")}
                  >
                    Score
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </div>
                  <div className="w-40 px-4">Interest</div>
                  <div className="w-28 px-4 hidden lg:block">Source</div>
                  <div
                    className="w-28 cursor-pointer px-4 hover:text-primary flex items-center gap-2"
                    onClick={() => toggleSort("createdAt")}
                  >
                    Date
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Leads List */}
                {filteredLeads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="mt-4 font-medium">No leads found</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Try adjusting your filters or search query
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredLeads.map((lead, index) => (
                      <Link
                        key={lead.id}
                        href={`/leads/${lead.id}`}
                        className="flex items-center px-4 py-4 transition-all hover:bg-muted/50 animate-fade-in-up"
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
                            {lead.priority}
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
                            {lead.status}
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
                        <div className="w-28 px-4 hidden lg:block">
                          <span className="text-sm text-muted-foreground capitalize">
                            {lead.source}
                          </span>
                        </div>
                        <div className="w-28 px-4">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(lead.createdAt).toLocaleDateString("vi-VN")}
                          </div>
                        </div>
                      </Link>
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
                        <h3 className="font-semibold">{column.label}</h3>
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium">
                          {columnLeads.length}
                        </span>
                      </div>
                    </div>

                    {/* Column Cards */}
                    <div className="flex-1 space-y-3">
                      {columnLeads.map((lead, index) => (
                        <Link
                          key={lead.id}
                          href={`/leads/${lead.id}`}
                          className="block animate-fade-in-up"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <Card className="card-elevated transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold text-white text-sm shadow-md ${
                                  lead.priority === "hot"
                                    ? "bg-gradient-to-br from-red-500 to-orange-500"
                                    : lead.priority === "warm"
                                      ? "bg-gradient-to-br from-amber-500 to-yellow-500"
                                      : "bg-gradient-to-br from-blue-500 to-cyan-500"
                                }`}>
                                  {lead.customer.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="font-medium truncate">{lead.customer.name}</p>
                                    <span className={`priority-badge ${lead.priority}`}>
                                      {lead.priority}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                    {lead.customer.email}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <Car className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground truncate">
                                    {lead.interest.brands[0]}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                                  <span className="text-sm font-semibold">{lead.score}</span>
                                </div>
                              </div>

                              <div className="mt-3 flex items-center justify-between pt-3 border-t">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {new Date(lead.createdAt).toLocaleDateString("vi-VN")}
                                </div>
                                <span className="text-xs text-muted-foreground capitalize">
                                  {lead.source}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}

                      {columnLeads.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-center rounded-xl border-2 border-dashed">
                          <p className="text-sm text-muted-foreground">No leads</p>
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
    </div>
  );
}
