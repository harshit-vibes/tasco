"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  cn,
  Card,
  CardContent,
  Button,
  Badge,
  Input,
  Select,
} from "@tasco/ui";
import {
  Search,
  RefreshCw,
  Building2,
  Building,
  Network,
  Globe,
  MapPin,
  Users,
  ChevronRight,
  Loader2,
} from "@tasco/ui/icons";
import { useTranslation } from "@tasco/i18n";
import { EntityDetailSheet } from "../../components/entity-detail-sheet";
import type { Entity } from "../../lib/entity-filter-context";

type CategoryFilter = "all" | "automotive-showroom" | "automotive-b2b" | "automotive-brand";

export default function EntitiesPage() {
  const { t } = useTranslation("entities");
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  // Detail sheet state
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"view" | "edit">("view");

  // Fetch entities (only automotive entities - showrooms, B2B, brands)
  const fetchEntities = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch only automotive entities (excludes tasco-group)
      const response = await fetch("/api/entities");
      const data = await response.json();
      if (data.success) {
        setEntities(data.entities || []);
      }
    } catch (error) {
      console.error("Error fetching entities:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  // Handle URL params for deep linking
  useEffect(() => {
    const entityId = searchParams.get("id");
    if (entityId && entities.length > 0) {
      const entity = entities.find(e => e.id === entityId);
      if (entity) {
        setSelectedEntity(entity);
        setSheetOpen(true);
      }
    }
  }, [searchParams, entities]);

  // Update URL when selecting entity
  const handleEntityClick = (entity: Entity) => {
    setSelectedEntity(entity);
    setSheetMode("view");
    setSheetOpen(true);
    router.push(`/entities?id=${entity.id}`, { scroll: false });
  };

  // Handle sheet close
  const handleSheetClose = (open: boolean) => {
    setSheetOpen(open);
    if (!open) {
      router.push("/entities", { scroll: false });
    }
  };

  // Handle entity updated
  const handleEntityUpdated = () => {
    fetchEntities();
  };

  // Filter entities
  const filteredEntities = entities.filter(entity => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !entity.name.toLowerCase().includes(query) &&
        !(entity.shortName?.toLowerCase().includes(query)) &&
        !(entity.metadata?.location?.toLowerCase().includes(query))
      ) {
        return false;
      }
    }

    // Category filter
    if (categoryFilter !== "all" && entity.category !== categoryFilter) {
      return false;
    }

    return true;
  });

  // Stats by category
  const stats = {
    total: entities.length,
    showrooms: entities.filter(e => e.category === "automotive-showroom").length,
    b2bClients: entities.filter(e => e.category === "automotive-b2b").length,
    brands: entities.filter(e => e.category === "automotive-brand").length,
  };

  // Category config
  const getCategoryConfig = (category?: Entity["category"]) => {
    switch (category) {
      case "tasco-group":
        return { label: t("category.tasco-group"), color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" };
      case "automotive-showroom":
        return { label: t("category.automotive-showroom"), color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" };
      case "automotive-b2b":
        return { label: t("category.automotive-b2b"), color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" };
      case "automotive-brand":
        return { label: t("category.automotive-brand"), color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" };
      default:
        return { label: category || "—", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" };
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 border-b bg-card/50 backdrop-blur-sm">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchEntities}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              {t("refresh")}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <Card className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/30 border-slate-200/50 dark:border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-500 shadow">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">{t("stats.total")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/50 dark:to-emerald-800/30 border-emerald-200/50 dark:border-emerald-700/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 shadow">
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.showrooms}</p>
                    <p className="text-xs text-muted-foreground">{t("stats.showrooms")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/50 dark:to-blue-800/30 border-blue-200/50 dark:border-blue-700/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 shadow">
                    <Network className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.b2bClients}</p>
                    <p className="text-xs text-muted-foreground">{t("stats.b2b_clients")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/50 dark:to-amber-800/30 border-amber-200/50 dark:border-amber-700/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 shadow">
                    <Building className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.brands}</p>
                    <p className="text-xs text-muted-foreground">{t("stats.brands")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 pb-4 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <Select
            value={categoryFilter}
            onChange={(value) => setCategoryFilter(value as CategoryFilter)}
            className="w-44"
            options={[
              { value: "all", label: t("filter.all_categories") },
              { value: "automotive-showroom", label: t("category.automotive-showroom") },
              { value: "automotive-b2b", label: t("category.automotive-b2b") },
              { value: "automotive-brand", label: t("category.automotive-brand") },
            ]}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="mt-4 text-sm text-muted-foreground">Loading entities...</p>
            </div>
          </div>
        ) : filteredEntities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-4 font-medium">{t("empty.title")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("empty.description")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div className="col-span-5">{t("columns.name")}</div>
              <div className="col-span-2">{t("columns.category")}</div>
              <div className="col-span-3">{t("columns.location")}</div>
              <div className="col-span-2">{t("columns.employees")}</div>
            </div>

            {/* Entity Rows */}
            {filteredEntities.map((entity) => {
              const categoryConfig = getCategoryConfig(entity.category);
              // Use category-based icon styling
              const getCategoryIcon = () => {
                switch (entity.category) {
                  case "automotive-showroom": return { icon: Globe, bg: "bg-emerald-500" };
                  case "automotive-b2b": return { icon: Network, bg: "bg-blue-500" };
                  case "automotive-brand": return { icon: Building, bg: "bg-amber-500" };
                  default: return { icon: Building2, bg: "bg-slate-500" };
                }
              };
              const iconConfig = getCategoryIcon();
              const CategoryIcon = iconConfig.icon;

              return (
                <Card
                  key={entity.id}
                  className="group cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
                  onClick={() => handleEntityClick(entity)}
                >
                  <CardContent className="p-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Name */}
                      <div className="col-span-5 flex items-center gap-3">
                        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", iconConfig.bg)}>
                          <CategoryIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{entity.name}</p>
                          {entity.shortName && (
                            <p className="text-xs text-muted-foreground truncate">{entity.shortName}</p>
                          )}
                        </div>
                      </div>

                      {/* Category */}
                      <div className="col-span-2">
                        <Badge variant="secondary" className={cn("text-xs", categoryConfig.color)}>
                          {categoryConfig.label}
                        </Badge>
                      </div>

                      {/* Location */}
                      <div className="col-span-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{entity.metadata?.location || "—"}</span>
                      </div>

                      {/* Employees */}
                      <div className="col-span-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Users className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>{entity.metadata?.employeeCount?.toLocaleString() || "—"}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Entity Detail Sheet */}
      <EntityDetailSheet
        open={sheetOpen}
        onOpenChange={handleSheetClose}
        entity={selectedEntity}
        entities={entities}
        mode={sheetMode}
        onEntityUpdated={handleEntityUpdated}
        onModeChange={setSheetMode}
      />
    </div>
  );
}
