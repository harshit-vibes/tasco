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
  Textarea,
} from "@tasco/ui";
import {
  Megaphone,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Calendar,
  Mail,
  MessageSquare,
  BarChart3,
  Clock,
  CheckCircle,
  PauseCircle,
  Copy,
  Check,
  Play,
  Pause,
  Sparkles,
  MousePointer,
  Eye,
  UserPlus,
  Plus,
  Save,
  Loader2,
  Pencil,
  X,
} from "@tasco/ui/icons";
import { useEntityFilter } from "../lib/entity-filter-context";
import type { Campaign } from "../lib/data-layer";

export interface CampaignDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string | null;
  mode?: "view" | "create" | "edit";
  onCampaignUpdated?: () => void;
  onCampaignCreated?: (campaign: Campaign) => void;
  onModeChange?: (mode: "view" | "create" | "edit") => void;
}

interface CampaignFormData {
  name: string;
  type: Campaign["type"];
  status: Campaign["status"];
  targetSegment: string;
  budget: string;
  startDate: string;
  endDate: string;
  entityId: string;
}

const initialFormData: CampaignFormData = {
  name: "",
  type: "email",
  status: "draft",
  targetSegment: "",
  budget: "",
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
  entityId: "",
};

export function CampaignDetailSheet({
  open,
  onOpenChange,
  campaignId,
  mode = "view",
  onCampaignUpdated,
  onCampaignCreated,
  onModeChange,
}: CampaignDetailSheetProps) {
  const { entities, selectedEntityIds } = useEntityFilter();

  // Mode helpers
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";
  const isViewMode = mode === "view";
  const isFormMode = isEditMode || isCreateMode;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "metrics" | "audience">("overview");
  const [copied, setCopied] = useState(false);

  // Form state for create mode
  const [formData, setFormData] = useState<CampaignFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CampaignFormData, string>>>({});

  // Reset state when sheet closes
  useEffect(() => {
    if (!open) {
      setActiveTab("overview");
      if (!isEditMode) {
        setFormData({
          ...initialFormData,
          entityId: selectedEntityIds[0] || "",
        });
      }
      setFormErrors({});
    }
  }, [open, selectedEntityIds, isEditMode]);

  // Set default entity when opening in create mode
  useEffect(() => {
    if (open && isCreateMode && selectedEntityIds.length > 0) {
      setFormData(prev => ({
        ...prev,
        entityId: prev.entityId || selectedEntityIds[0],
      }));
    }
  }, [open, isCreateMode, selectedEntityIds]);

  // Populate form when entering edit mode
  useEffect(() => {
    if (isEditMode && campaign) {
      setFormData({
        name: campaign.name || "",
        type: campaign.type,
        status: campaign.status,
        targetSegment: campaign.targetSegment || "",
        budget: campaign.budget ? String(campaign.budget) : "",
        startDate: campaign.startDate ? campaign.startDate.split("T")[0] : "",
        endDate: campaign.endDate ? campaign.endDate.split("T")[0] : "",
        entityId: campaign.entityId || "",
      });
    }
  }, [isEditMode, campaign]);

  // Fetch campaign data (view and edit modes)
  useEffect(() => {
    if (!open || !campaignId || isCreateMode) {
      setCampaign(null);
      return;
    }

    async function fetchCampaignData() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/campaigns?id=${campaignId}`);
        const data = await response.json();

        if (data.success && data.campaign) {
          setCampaign(data.campaign);
        }
      } catch (error) {
        console.error("Error fetching campaign:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCampaignData();
  }, [open, campaignId, mode]);

  // Form handlers
  const handleInputChange = (field: keyof CampaignFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CampaignFormData, string>> = {};

    if (!formData.name.trim()) errors.name = "Campaign name is required";
    if (!formData.startDate) errors.startDate = "Start date is required";
    if (!formData.entityId) errors.entityId = "Company is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        status: formData.status,
        targetSegment: formData.targetSegment || undefined,
        budget: formData.budget ? parseFloat(formData.budget.replace(/[^0-9.]/g, "")) : undefined,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        entityId: formData.entityId,
      };

      const url = isEditMode && campaignId ? `/api/campaigns/${campaignId}` : "/api/campaigns";
      const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        if (isEditMode) {
          setCampaign(data.campaign);
          onCampaignUpdated?.();
          onModeChange?.("view");
        } else {
          onCampaignCreated?.(data.campaign);
          onOpenChange(false);
        }
      } else {
        console.error(`Failed to ${isEditMode ? "update" : "create"} campaign:`, data.error);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "creating"} campaign:`, error);
    } finally {
      setIsSaving(false);
    }
  };

  // Edit mode handlers
  const handleEditClick = () => {
    onModeChange?.("edit");
  };

  const handleCancelEdit = () => {
    // Reset form data to campaign values
    if (campaign) {
      setFormData({
        name: campaign.name || "",
        type: campaign.type,
        status: campaign.status,
        targetSegment: campaign.targetSegment || "",
        budget: campaign.budget ? String(campaign.budget) : "",
        startDate: campaign.startDate ? campaign.startDate.split("T")[0] : "",
        endDate: campaign.endDate ? campaign.endDate.split("T")[0] : "",
        entityId: campaign.entityId || "",
      });
    }
    setFormErrors({});
    onModeChange?.("view");
  };

  // Copy link
  const handleCopyLink = useCallback(() => {
    const url = new URL(window.location.origin + "/marketing");
    if (campaignId) url.searchParams.set("id", campaignId);

    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [campaignId]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)}M`;
    }
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getCampaignTypeIcon = (type: string) => {
    switch (type) {
      case "email": return Mail;
      case "sms": return MessageSquare;
      case "social": return Users;
      case "display": return BarChart3;
      default: return Megaphone;
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          label: "Active",
          icon: CheckCircle,
          gradient: "from-emerald-500 to-teal-500",
          textColor: "text-emerald-600 dark:text-emerald-400",
          bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
        };
      case "paused":
        return {
          label: "Paused",
          icon: PauseCircle,
          gradient: "from-amber-500 to-orange-500",
          textColor: "text-amber-600 dark:text-amber-400",
          bgColor: "bg-amber-100 dark:bg-amber-900/30",
        };
      case "completed":
        return {
          label: "Completed",
          icon: CheckCircle,
          gradient: "from-blue-500 to-cyan-500",
          textColor: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-100 dark:bg-blue-900/30",
        };
      case "draft":
        return {
          label: "Draft",
          icon: Clock,
          gradient: "from-gray-500 to-slate-500",
          textColor: "text-gray-600 dark:text-gray-400",
          bgColor: "bg-gray-100 dark:bg-gray-900/30",
        };
      default:
        return {
          label: status,
          icon: Megaphone,
          gradient: "from-violet-500 to-purple-500",
          textColor: "text-violet-600 dark:text-violet-400",
          bgColor: "bg-violet-100 dark:bg-violet-900/30",
        };
    }
  };

  const TypeIcon = campaign ? getCampaignTypeIcon(campaign.type) : Megaphone;
  const statusConfig = campaign ? getStatusConfig(campaign.status) : getStatusConfig("draft");
  const StatusIcon = statusConfig.icon;

  // Calculate metrics
  const roi = campaign ? ((campaign.metrics?.revenue || 0) / (campaign.budget || 1)).toFixed(1) : "0.0";
  const clickRate = campaign?.metrics?.clicked && campaign?.metrics?.delivered
    ? ((campaign.metrics.clicked / campaign.metrics.delivered) * 100).toFixed(1)
    : "0.0";
  const conversionRate = campaign?.metrics?.converted && campaign?.metrics?.clicked
    ? ((campaign.metrics.converted / campaign.metrics.clicked) * 100).toFixed(1)
    : "0.0";

  // Form for create/edit modes
  const renderForm = () => (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Campaign Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-primary" />
            Campaign Details
          </h3>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                placeholder="Enter campaign name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && (
                <p className="text-xs text-red-500">{formErrors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onChange={(value) => handleInputChange("type", value)}
                  options={[
                    { value: "email", label: "Email" },
                    { value: "sms", label: "SMS" },
                    { value: "social", label: "Social Media" },
                    { value: "event", label: "Event" },
                    { value: "direct-mail", label: "Direct Mail" },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onChange={(value) => handleInputChange("status", value)}
                  options={[
                    { value: "draft", label: "Draft" },
                    { value: "active", label: "Active" },
                    { value: "paused", label: "Paused" },
                  ]}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Company *</Label>
              <Select
                value={formData.entityId}
                onChange={(value) => handleInputChange("entityId", value)}
                placeholder="Select company"
                className={formErrors.entityId ? "border-red-500" : ""}
                options={entities.map((entity) => ({
                  value: entity.id,
                  label: entity.name,
                }))}
              />
              {formErrors.entityId && (
                <p className="text-xs text-red-500">{formErrors.entityId}</p>
              )}
            </div>
          </div>
        </div>

        {/* Target & Budget */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Target & Budget
          </h3>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetSegment">Target Segment</Label>
              <Select
                value={formData.targetSegment}
                onChange={(value) => handleInputChange("targetSegment", value)}
                placeholder="Select target segment"
                options={[
                  { value: "all", label: "All Customers" },
                  { value: "vip", label: "VIP Customers" },
                  { value: "regular", label: "Regular Customers" },
                  { value: "at-risk", label: "At-Risk Customers" },
                  { value: "new", label: "New Customers" },
                  { value: "leads", label: "Leads" },
                ]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget (VND)</Label>
              <Input
                id="budget"
                placeholder="e.g., 50,000,000"
                value={formData.budget}
                onChange={(e) => handleInputChange("budget", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Schedule
          </h3>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                  className={formErrors.startDate ? "border-red-500" : ""}
                />
                {formErrors.startDate && (
                  <p className="text-xs text-red-500">{formErrors.startDate}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground">Leave empty for ongoing campaign</p>
              </div>
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
        {isFormMode ? (
          <SheetHeader className="p-4 pb-3 border-b space-y-0 shrink-0">
            <div className="flex items-start gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl shadow-lg ${
                isEditMode
                  ? "bg-gradient-to-br from-amber-500 to-orange-500"
                  : "bg-gradient-to-br from-violet-500 to-purple-500"
              }`}>
                {isEditMode ? (
                  <Pencil className="h-7 w-7 text-white" />
                ) : (
                  <Plus className="h-7 w-7 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-lg font-bold">
                  {isEditMode ? "Edit Campaign" : "Create Campaign"}
                </SheetTitle>
                <SheetDescription className="mt-1 text-xs">
                  {isEditMode
                    ? "Update the campaign details below"
                    : "Set up a new marketing campaign"}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
        ) : (
          <SheetHeader className="p-4 pb-3 border-b space-y-0 shrink-0">
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-muted animate-pulse" />
                <div className="space-y-2">
                  <SheetTitle className="sr-only">Loading campaign details</SheetTitle>
                  <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-48 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ) : campaign ? (
              <div className="flex items-start gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${statusConfig.gradient} shadow-lg flex-shrink-0`}>
                  <TypeIcon className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <SheetTitle className="text-lg font-bold truncate">
                      {campaign.name}
                    </SheetTitle>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1 rounded-full ${statusConfig.bgColor} px-2 py-0.5 text-xs font-semibold ${statusConfig.textColor}`}>
                      <StatusIcon className="h-2.5 w-2.5" />
                      {statusConfig.label}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize">
                      {campaign.type}
                    </span>
                  </div>
                  <SheetDescription className="flex items-center gap-1.5 mt-1.5 text-xs">
                    <Calendar className="h-3 w-3" />
                    {formatDate(campaign.startDate)} {campaign.endDate ? `- ${formatDate(campaign.endDate)}` : "- Ongoing"}
                  </SheetDescription>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Megaphone className="h-5 w-5 text-muted-foreground" />
                <SheetTitle>Campaign Not Found</SheetTitle>
              </div>
            )}
          </SheetHeader>
        )}

        {/* Quick Stats - View Mode Only */}
        {isViewMode && campaign && !isLoading && (
          <div className="grid grid-cols-4 gap-2 p-3 border-b bg-muted/20 shrink-0">
            <div className="text-center p-2 rounded-lg bg-card/50">
              <div className="flex items-center justify-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                <span className="font-bold text-sm">{formatCurrency(campaign.budget || 0)}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Budget</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-card/50">
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                <span className="font-bold text-sm">{roi}x</span>
              </div>
              <p className="text-[10px] text-muted-foreground">ROI</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-card/50">
              <div className="flex items-center justify-center gap-1">
                <Users className="h-3.5 w-3.5 text-violet-500" />
                <span className="font-bold text-sm">{(campaign.metrics?.sent || 0).toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Reach</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-card/50">
              <div className="flex items-center justify-center gap-1">
                <Target className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-bold text-sm">{conversionRate}%</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Conv. Rate</p>
            </div>
          </div>
        )}

        {/* Tabs - View Mode Only */}
        {isViewMode && campaign && !isLoading && (
          <div className="flex items-center gap-1 px-3 pt-2 border-b shrink-0">
            {(["overview", "metrics", "audience"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-xs font-medium transition-all border-b-2 -mb-[1px] ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isFormMode ? (
            renderForm()
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="relative mx-auto">
                  <div className="h-12 w-12 rounded-xl bg-gradient-brand animate-pulse" />
                  <Megaphone className="absolute inset-0 m-auto h-6 w-6 text-white" />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">Loading campaign...</p>
              </div>
            </div>
          ) : !campaign ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <Megaphone className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-4 font-medium">Campaign not found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                This campaign doesn't exist or has been deleted
              </p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {activeTab === "overview" && (
                  <>
                    {/* Campaign Details */}
                    <div className="rounded-xl border bg-card/50 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Megaphone className="h-4 w-4 text-primary" />
                        Campaign Details
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Type</p>
                          <p className="font-medium capitalize flex items-center gap-1.5">
                            <TypeIcon className="h-3.5 w-3.5" />
                            {campaign.type}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Target Segment</p>
                          <p className="font-medium capitalize">{campaign.targetSegment || "All"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Start Date</p>
                          <p className="font-medium">{formatDate(campaign.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">End Date</p>
                          <p className="font-medium">{campaign.endDate ? formatDate(campaign.endDate) : "Ongoing"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Budget Breakdown */}
                    <div className="rounded-xl border bg-card/50 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <DollarSign className="h-4 w-4 text-primary" />
                          Budget
                        </div>
                        <span className="text-lg font-bold text-emerald-600">{formatCurrency(campaign.budget || 0)} VND</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Spent</span>
                          <span className="font-medium">{formatCurrency((campaign.budget || 0) * 0.65)} VND</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full w-[65%] rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                        </div>
                        <p className="text-xs text-muted-foreground">65% of budget utilized</p>
                      </div>
                    </div>

                    {/* Performance Summary */}
                    <div className="rounded-xl border bg-gradient-to-br from-violet-50/50 to-transparent dark:from-violet-950/20 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <TrendingUp className="h-4 w-4 text-violet-500" />
                        Performance Summary
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-white/50 dark:bg-white/5 border">
                          <p className="text-xs text-muted-foreground">Total Revenue</p>
                          <p className="text-lg font-bold text-emerald-600">{formatCurrency(campaign.metrics?.revenue || 0)} VND</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/50 dark:bg-white/5 border">
                          <p className="text-xs text-muted-foreground">ROI</p>
                          <p className="text-lg font-bold text-blue-600">{roi}x</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "metrics" && (
                  <div className="space-y-4">
                    {/* Engagement Metrics */}
                    <div className="rounded-xl border bg-card/50 p-4 space-y-4">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        Engagement Metrics
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">Impressions</span>
                          </div>
                          <span className="font-bold">{(campaign.metrics?.delivered || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-2">
                            <MousePointer className="h-4 w-4 text-emerald-500" />
                            <span className="text-sm">Clicks</span>
                          </div>
                          <span className="font-bold">{(campaign.metrics?.clicked || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-violet-500" />
                            <span className="text-sm">Conversions</span>
                          </div>
                          <span className="font-bold">{(campaign.metrics?.converted || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-amber-500" />
                            <span className="text-sm">Total Reach</span>
                          </div>
                          <span className="font-bold">{(campaign.metrics?.sent || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Rates */}
                    <div className="rounded-xl border bg-card/50 p-4 space-y-4">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Performance Rates
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Click-Through Rate (CTR)</span>
                            <span className="font-bold text-blue-600">{clickRate}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${Math.min(parseFloat(clickRate) * 10, 100)}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Conversion Rate</span>
                            <span className="font-bold text-emerald-600">{conversionRate}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${Math.min(parseFloat(conversionRate) * 5, 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "audience" && (
                  <div className="space-y-4">
                    {/* Target Audience */}
                    <div className="rounded-xl border bg-card/50 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Users className="h-4 w-4 text-primary" />
                        Target Audience
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <span className="text-sm">Segment</span>
                          <span className="font-medium capitalize px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                            {campaign.targetSegment || "All"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <span className="text-sm">Estimated Audience Size</span>
                          <span className="font-bold">{((campaign.metrics?.sent || 0) * 1.5).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <span className="text-sm">Actual Reach</span>
                          <span className="font-bold text-emerald-600">{(campaign.metrics?.sent || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Audience Insights */}
                    <div className="rounded-xl border bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Sparkles className="h-4 w-4 text-blue-500" />
                        AI Audience Insights
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="p-2 rounded-lg bg-white/50 dark:bg-white/5 border border-blue-200/50 dark:border-blue-800/30">
                          <span className="font-medium">Peak engagement:</span> Tuesdays 10AM-12PM
                        </p>
                        <p className="p-2 rounded-lg bg-white/50 dark:bg-white/5 border border-blue-200/50 dark:border-blue-800/30">
                          <span className="font-medium">Top location:</span> Ho Chi Minh City (45%)
                        </p>
                        <p className="p-2 rounded-lg bg-white/50 dark:bg-white/5 border border-blue-200/50 dark:border-blue-800/30">
                          <span className="font-medium">Device split:</span> Mobile 68%, Desktop 32%
                        </p>
                      </div>
                    </div>

                    {/* New Leads Generated */}
                    <div className="rounded-xl border bg-card/50 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <UserPlus className="h-4 w-4 text-emerald-500" />
                          New Leads Generated
                        </div>
                        <span className="text-lg font-bold text-emerald-600">{campaign.metrics?.converted || 0}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        This campaign generated {campaign.metrics?.converted || 0} new qualified leads for the sales team.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Footer Actions */}
        {isFormMode ? (
          <div className="p-3 border-t flex items-center gap-2 bg-muted/30 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5"
              onClick={isEditMode ? handleCancelEdit : () => onOpenChange(false)}
            >
              <X className="h-3.5 w-3.5" />
              Cancel
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
              {isSaving
                ? isEditMode ? "Saving..." : "Creating..."
                : isEditMode ? "Save Changes" : "Create Campaign"}
            </Button>
          </div>
        ) : campaign && !isLoading && (
          <div className="p-3 border-t flex items-center gap-2 bg-muted/30 shrink-0">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopyLink}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy Link"}
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleEditClick}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
            {campaign.status === "active" ? (
              <Button variant="outline" size="sm" className="gap-1.5">
                <Pause className="h-3.5 w-3.5" />
                Pause
              </Button>
            ) : campaign.status === "paused" || campaign.status === "draft" ? (
              <Button size="sm" className="gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500">
                <Play className="h-3.5 w-3.5" />
                {campaign.status === "draft" ? "Launch" : "Resume"}
              </Button>
            ) : null}
            <Button variant="outline" size="sm" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              Analytics
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
