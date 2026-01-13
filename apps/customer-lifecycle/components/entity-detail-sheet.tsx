"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Button,
  ScrollArea,
  Input,
  Label,
  Select,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@tasco/ui";
import {
  Building2,
  MapPin,
  Users,
  Target,
  MessageSquare,
  Calendar,
  Copy,
  Check,
  Save,
  Loader2,
  Pencil,
  X,
  Building,
  Network,
  Globe,
  FileText,
} from "@tasco/ui/icons";
import { useTranslation } from "@tasco/i18n";
import type { Entity } from "../lib/entity-filter-context";

export interface EntityDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entity: Entity | null;
  entities: Entity[];
  mode?: "view" | "edit";
  onEntityUpdated?: () => void;
  onModeChange?: (mode: "view" | "edit") => void;
}

interface EntityFormData {
  name: string;
  shortName: string;
  type: Entity["type"];
  category: NonNullable<Entity["category"]>;
  parentId: string;
  location: string;
  employeeCount: string;
  industry: string;
  comments: string;
}

const initialFormData: EntityFormData = {
  name: "",
  shortName: "",
  type: "subsidiary",
  category: "automotive-showroom",
  parentId: "",
  location: "",
  employeeCount: "",
  industry: "",
  comments: "",
};

export function EntityDetailSheet({
  open,
  onOpenChange,
  entity,
  entities,
  mode = "view",
  onEntityUpdated,
  onModeChange,
}: EntityDetailSheetProps) {
  const { t } = useTranslation("entities");

  const isEditMode = mode === "edit";
  const isViewMode = mode === "view";

  const [activeTab, setActiveTab] = useState<"overview" | "metadata">("overview");
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<EntityFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof EntityFormData, string>>>({});

  // Reset state when sheet closes
  useEffect(() => {
    if (!open) {
      setActiveTab("overview");
      setFormErrors({});
    }
  }, [open]);

  // Populate form when entering edit mode or when entity changes
  useEffect(() => {
    if (entity) {
      setFormData({
        name: entity.name || "",
        shortName: entity.shortName || "",
        type: entity.type,
        category: entity.category || "automotive-showroom",
        parentId: entity.parentId || "",
        location: entity.metadata?.location || "",
        employeeCount: entity.metadata?.employeeCount?.toString() || "",
        industry: entity.metadata?.industry || "",
        comments: entity.metadata?.comments || "",
      });
    }
  }, [entity]);

  // Form handlers
  const handleInputChange = (field: keyof EntityFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof EntityFormData, string>> = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !entity) return;

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        shortName: formData.shortName,
        type: formData.type,
        category: formData.category,
        parentId: formData.parentId || undefined,
        metadata: {
          location: formData.location || undefined,
          employeeCount: formData.employeeCount ? parseInt(formData.employeeCount, 10) : undefined,
          industry: formData.industry || undefined,
          comments: formData.comments || undefined,
        },
      };

      const response = await fetch(`/api/entities/${entity.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        onEntityUpdated?.();
        onModeChange?.("view");
      } else {
        console.error("Failed to update entity:", data.error);
      }
    } catch (error) {
      console.error("Error updating entity:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = () => {
    onModeChange?.("edit");
  };

  const handleCancelEdit = () => {
    if (entity) {
      setFormData({
        name: entity.name || "",
        shortName: entity.shortName || "",
        type: entity.type,
        category: entity.category || "automotive-showroom",
        parentId: entity.parentId || "",
        location: entity.metadata?.location || "",
        employeeCount: entity.metadata?.employeeCount?.toString() || "",
        industry: entity.metadata?.industry || "",
        comments: entity.metadata?.comments || "",
      });
    }
    setFormErrors({});
    onModeChange?.("view");
  };

  // Copy link
  const handleCopyLink = useCallback(() => {
    const url = new URL(window.location.origin + "/entities");
    if (entity?.id) url.searchParams.set("id", entity.id);

    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [entity?.id]);

  // Get parent entity
  const parentEntity = entity?.parentId
    ? entities.find(e => e.id === entity.parentId)
    : null;

  // Type config
  const getTypeConfig = (type: Entity["type"]) => {
    switch (type) {
      case "parent":
        return {
          label: t("type.parent"),
          bgClass: "bg-gradient-to-br from-violet-500 to-purple-600",
          icon: Building,
        };
      case "holding":
        return {
          label: t("type.holding"),
          bgClass: "bg-gradient-to-br from-blue-500 to-indigo-600",
          icon: Network,
        };
      case "subsidiary":
        return {
          label: t("type.subsidiary"),
          bgClass: "bg-gradient-to-br from-emerald-500 to-teal-600",
          icon: Globe,
        };
      default:
        return {
          label: type,
          bgClass: "bg-gradient-to-br from-slate-500 to-slate-600",
          icon: Building2,
        };
    }
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
        return { label: category || "Unknown", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" };
    }
  };

  const typeConfig = entity ? getTypeConfig(entity.type) : null;
  const categoryConfig = entity ? getCategoryConfig(entity.category) : null;
  const TypeIcon = typeConfig?.icon || Building2;

  // Parent entities for select
  const parentEntities = entities.filter(e => e.type === "parent" || e.type === "holding");

  // Form view
  const renderForm = () => (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            {t("detail.basic_info")}
          </h3>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("detail.name")} *</Label>
              <Input
                id="name"
                placeholder="Enter entity name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && (
                <p className="text-xs text-red-500">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortName">{t("detail.short_name")}</Label>
              <Input
                id="shortName"
                placeholder="Short name"
                value={formData.shortName}
                onChange={(e) => handleInputChange("shortName", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t("columns.type")}</Label>
                <Select
                  value={formData.type}
                  onChange={(value) => handleInputChange("type", value)}
                  options={[
                    { value: "parent", label: t("type.parent") },
                    { value: "holding", label: t("type.holding") },
                    { value: "subsidiary", label: t("type.subsidiary") },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("columns.category")}</Label>
                <Select
                  value={formData.category}
                  onChange={(value) => handleInputChange("category", value)}
                  options={[
                    { value: "tasco-group", label: t("category.tasco-group") },
                    { value: "automotive-showroom", label: t("category.automotive-showroom") },
                    { value: "automotive-b2b", label: t("category.automotive-b2b") },
                    { value: "automotive-brand", label: t("category.automotive-brand") },
                  ]}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("detail.parent_entity")}</Label>
              <Select
                value={formData.parentId}
                onChange={(value) => handleInputChange("parentId", value)}
                placeholder={t("detail.no_parent")}
                options={[
                  { value: "", label: t("detail.no_parent") },
                  ...parentEntities.map((e) => ({
                    value: e.id,
                    label: e.name,
                  })),
                ]}
              />
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            {t("detail.metadata")}
          </h3>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="location">{t("detail.location")}</Label>
                <Input
                  id="location"
                  placeholder="City, Country"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeCount">{t("detail.employees")}</Label>
                <Input
                  id="employeeCount"
                  type="number"
                  placeholder="Number of employees"
                  value={formData.employeeCount}
                  onChange={(e) => handleInputChange("employeeCount", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">{t("detail.industry")}</Label>
              <Input
                id="industry"
                placeholder="Industry"
                value={formData.industry}
                onChange={(e) => handleInputChange("industry", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">{t("detail.comments")}</Label>
              <Input
                id="comments"
                placeholder="Additional comments"
                value={formData.comments}
                onChange={(e) => handleInputChange("comments", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl flex flex-col p-0 gap-0"
      >
        {/* Header */}
        {isEditMode ? (
          <div className="relative overflow-hidden px-4 py-4 bg-card border-b">
            <SheetHeader className="space-y-0">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl shadow-lg bg-gradient-to-br from-amber-500 to-orange-500">
                  <Pencil className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <SheetTitle className="text-lg font-bold">
                    {t("detail.edit")} {entity?.shortName || entity?.name}
                  </SheetTitle>
                  <SheetDescription className="mt-1 text-xs">
                    Update the entity information below
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
          </div>
        ) : (
          /* Hero Header - View Mode */
          <div className={`relative overflow-hidden px-4 py-4 ${entity && typeConfig ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" : "bg-card border-b"}`}>
            {entity && typeConfig && (
              <div className="absolute inset-0 overflow-hidden">
                <div className={`absolute -right-10 -top-10 h-40 w-40 rounded-full ${typeConfig.bgClass} opacity-20 blur-2xl`} />
              </div>
            )}

            <SheetHeader className="relative space-y-0">
              {!entity ? (
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <SheetTitle>Entity Not Found</SheetTitle>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <div className={`relative flex h-14 w-14 items-center justify-center rounded-xl ${typeConfig?.bgClass} text-xl font-bold text-white shadow-lg flex-shrink-0`}>
                    <TypeIcon className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <SheetTitle className="text-lg font-bold text-white truncate">
                      {entity.name}
                    </SheetTitle>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className={`inline-flex items-center gap-1 rounded-full ${typeConfig?.bgClass} px-2 py-0.5 text-xs font-semibold text-white`}>
                        <TypeIcon className="h-2.5 w-2.5" />
                        {typeConfig?.label}
                      </span>
                      {categoryConfig && (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryConfig.color}`}>
                          {categoryConfig.label}
                        </span>
                      )}
                    </div>
                    {entity.shortName && (
                      <SheetDescription className="flex items-center gap-1.5 mt-1.5 text-xs text-white/60">
                        {entity.shortName}
                      </SheetDescription>
                    )}
                  </div>
                </div>
              )}
            </SheetHeader>
          </div>
        )}

        {/* Stats Strip - View Mode Only */}
        {isViewMode && entity && (
          <div className="grid grid-cols-3 gap-1 p-2 border-b bg-muted/20 shrink-0">
            <div className="text-center p-2 rounded-lg bg-card/50">
              <div className="flex items-center justify-center gap-1">
                <MapPin className="h-3 w-3 text-blue-500" />
                <span className="font-medium text-sm truncate">{entity.metadata?.location || "—"}</span>
              </div>
              <p className="text-[9px] text-muted-foreground">{t("detail.location")}</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-card/50">
              <div className="flex items-center justify-center gap-1">
                <Users className="h-3 w-3 text-emerald-500" />
                <span className="font-bold text-sm">{entity.metadata?.employeeCount?.toLocaleString() || "—"}</span>
              </div>
              <p className="text-[9px] text-muted-foreground">{t("detail.employees")}</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-card/50">
              <div className="flex items-center justify-center gap-1">
                <Target className="h-3 w-3 text-violet-500" />
                <span className="font-medium text-sm truncate">{entity.metadata?.industry || "—"}</span>
              </div>
              <p className="text-[9px] text-muted-foreground">{t("detail.industry")}</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isEditMode ? (
            renderForm()
          ) : !entity ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-4 font-medium">{t("empty.title")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("empty.description")}
              </p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "overview" | "metadata")} className="flex flex-col h-full">
              <TabsList className="mx-4 mt-2 shrink-0">
                <TabsTrigger value="overview">{t("detail.overview")}</TabsTrigger>
                <TabsTrigger value="metadata">{t("detail.metadata")}</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1">
                <TabsContent value="overview" className="p-4 space-y-4 mt-0">
                  {/* Basic Info */}
                  <div className="rounded-xl border bg-card/50 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Building2 className="h-4 w-4 text-primary" />
                      {t("detail.basic_info")}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { icon: Building2, label: t("detail.name"), value: entity.name },
                        { icon: Globe, label: t("detail.short_name"), value: entity.shortName || "—" },
                        { icon: Network, label: t("columns.type"), value: typeConfig?.label },
                        { icon: Target, label: t("columns.category"), value: categoryConfig?.label },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                          <item.icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground">{item.label}</p>
                            <p className="text-xs font-medium truncate">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hierarchy */}
                  <div className="rounded-xl border bg-card/50 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Network className="h-4 w-4 text-primary" />
                      {t("detail.hierarchy")}
                    </div>
                    {parentEntity ? (
                      <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${getTypeConfig(parentEntity.type).bgClass} shadow flex-shrink-0`}>
                          {(() => {
                            const ParentIcon = getTypeConfig(parentEntity.type).icon;
                            return <ParentIcon className="h-5 w-5 text-white" />;
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{parentEntity.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {getTypeConfig(parentEntity.type).label} • {t("detail.parent_entity")}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Building className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                        <p className="mt-2 text-xs text-muted-foreground">{t("detail.no_parent")}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="metadata" className="p-4 space-y-4 mt-0">
                  {/* Metadata */}
                  <div className="rounded-xl border bg-card/50 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <FileText className="h-4 w-4 text-primary" />
                      {t("detail.metadata")}
                    </div>
                    <div className="space-y-3">
                      {[
                        { icon: MapPin, label: t("detail.location"), value: entity.metadata?.location },
                        { icon: Users, label: t("detail.employees"), value: entity.metadata?.employeeCount?.toLocaleString() },
                        { icon: Target, label: t("detail.industry"), value: entity.metadata?.industry },
                        { icon: MessageSquare, label: t("detail.comments"), value: entity.metadata?.comments },
                      ].map((item) => (
                        <div key={item.label} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                          <item.icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] text-muted-foreground">{item.label}</p>
                            <p className="text-sm">{item.value || "—"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="rounded-xl border bg-card/50 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Calendar className="h-4 w-4 text-primary" />
                      Timestamps
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-lg bg-muted/30">
                        <p className="text-[10px] text-muted-foreground">{t("detail.created")}</p>
                        <p className="text-xs font-medium">—</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/30">
                        <p className="text-[10px] text-muted-foreground">{t("detail.updated")}</p>
                        <p className="text-xs font-medium">—</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          )}
        </div>

        {/* Footer Actions */}
        {isEditMode ? (
          <div className="p-3 border-t flex items-center gap-2 bg-muted/30 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5"
              onClick={handleCancelEdit}
            >
              <X className="h-3.5 w-3.5" />
              {t("detail.cancel")}
            </Button>
            <Button
              size="sm"
              className="flex-1 gap-1.5 bg-gradient-brand"
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {isSaving ? "Saving..." : t("detail.save")}
            </Button>
          </div>
        ) : entity && (
          <div className="p-3 border-t flex items-center gap-2 bg-muted/30 shrink-0">
            <Button variant="outline" size="sm" className="gap-1.5 flex-1" onClick={handleCopyLink}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy Link"}
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleEditClick}>
              <Pencil className="h-3.5 w-3.5" />
              {t("detail.edit")}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
