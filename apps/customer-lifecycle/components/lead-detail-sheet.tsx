"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ScrollArea,
  Badge,
  Input,
  Label,
  Select,
} from "@tasco/ui";
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Zap,
  Target,
  Car,
  User,
  MessageSquare,
  Activity,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  DollarSign,
  X,
  Copy,
  Check,
  Plus,
  Save,
  Loader2,
  Pencil,
} from "@tasco/ui/icons";
import { useTranslation } from "@tasco/i18n";
import { useEntityFilter } from "../lib/entity-filter-context";
import type { Lead, Interaction, AIRecommendation } from "../lib/data-layer";

export interface LeadDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string | null;
  mode?: "view" | "create" | "edit";
  onLeadUpdated?: () => void;
  onLeadCreated?: (lead: Lead) => void;
  onModeChange?: (mode: "view" | "create" | "edit") => void;
}

interface LeadFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerLocation: string;
  source: Lead["source"];
  priority: Lead["priority"];
  brands: string;
  vehicleTypes: string;
  budget: string;
  timeline: string;
  assignedTo: string;
  entityId: string;
}

const initialFormData: LeadFormData = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  customerLocation: "",
  source: "website",
  priority: "warm",
  brands: "",
  vehicleTypes: "",
  budget: "",
  timeline: "",
  assignedTo: "",
  entityId: "",
};

export function LeadDetailSheet({
  open,
  onOpenChange,
  leadId,
  mode = "view",
  onLeadUpdated,
  onLeadCreated,
  onModeChange,
}: LeadDetailSheetProps) {
  const { t } = useTranslation("leads");
  const { t: tCommon } = useTranslation("common");
  const { entities, selectedEntityIds } = useEntityFilter();

  // Internal mode for edit transitions
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";
  const isViewMode = mode === "view";
  const isFormMode = isEditMode || isCreateMode;

  const [lead, setLead] = useState<Lead | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "activity" | "insights">("overview");
  const [copied, setCopied] = useState(false);

  // Form state for create mode
  const [formData, setFormData] = useState<LeadFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof LeadFormData, string>>>({});

  // Reset state when sheet closes
  useEffect(() => {
    if (!open) {
      setActiveTab("overview");
      setFormData({
        ...initialFormData,
        entityId: selectedEntityIds[0] || "",
      });
      setFormErrors({});
    }
  }, [open, selectedEntityIds]);

  // Populate form data from lead when in edit mode
  useEffect(() => {
    if (isEditMode && lead) {
      setFormData({
        customerName: lead.customer.name || "",
        customerEmail: lead.customer.email || "",
        customerPhone: lead.customer.phone || "",
        customerLocation: lead.customer.location || "",
        source: lead.source,
        priority: lead.priority,
        brands: lead.interest.brands?.join(", ") || "",
        vehicleTypes: lead.interest.vehicleTypes?.join(", ") || "",
        budget: lead.interest.budget || "",
        timeline: lead.interest.timeline || "",
        assignedTo: lead.assignedTo || "",
        entityId: lead.entityId || "",
      });
    }
  }, [isEditMode, lead]);

  // Set default entity when opening in create mode
  useEffect(() => {
    if (open && mode === "create" && selectedEntityIds.length > 0) {
      setFormData(prev => ({
        ...prev,
        entityId: prev.entityId || selectedEntityIds[0],
      }));
    }
  }, [open, mode, selectedEntityIds]);

  // Fetch lead data (view and edit modes)
  useEffect(() => {
    if (!open || !leadId || isCreateMode) {
      setLead(null);
      setInteractions([]);
      setRecommendations([]);
      return;
    }

    async function fetchLeadData() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/leads/${leadId}`);
        const data = await response.json();

        if (data.success && data.lead) {
          setLead(data.lead);
          setInteractions(data.interactions || []);
          setRecommendations(data.recommendations || []);
        }
      } catch (error) {
        console.error("Error fetching lead:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeadData();
  }, [open, leadId, isCreateMode]);

  // Form handlers
  const handleInputChange = (field: keyof LeadFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof LeadFormData, string>> = {};

    if (!formData.customerName.trim()) errors.customerName = "Name is required";
    if (!formData.customerEmail.trim()) errors.customerEmail = "Email is required";
    if (!formData.customerPhone.trim()) errors.customerPhone = "Phone is required";
    if (!formData.entityId) errors.entityId = "Company is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const payload = {
        customer: {
          name: formData.customerName,
          email: formData.customerEmail,
          phone: formData.customerPhone,
          location: formData.customerLocation,
        },
        source: formData.source,
        priority: formData.priority,
        interest: {
          brands: formData.brands.split(",").map(s => s.trim()).filter(Boolean),
          vehicleTypes: formData.vehicleTypes.split(",").map(s => s.trim()).filter(Boolean),
          budget: formData.budget,
          timeline: formData.timeline,
        },
        assignedTo: formData.assignedTo || undefined,
        entityId: formData.entityId,
      };

      // Use PATCH for edit, POST for create
      const url = isEditMode && leadId ? `/api/leads/${leadId}` : "/api/leads";
      const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        if (isEditMode) {
          // Update local lead state and notify parent
          setLead(data.lead);
          onLeadUpdated?.();
          onModeChange?.("view"); // Switch back to view mode
        } else {
          onLeadCreated?.(data.lead);
          onOpenChange(false);
        }
      } else {
        console.error(`Failed to ${isEditMode ? "update" : "create"} lead:`, data.error);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "creating"} lead:`, error);
    } finally {
      setIsSaving(false);
    }
  };

  // Switch to edit mode
  const handleEditClick = () => {
    onModeChange?.("edit");
  };

  // Cancel edit and return to view
  const handleCancelEdit = () => {
    // Reset form to original lead data
    if (lead) {
      setFormData({
        customerName: lead.customer.name || "",
        customerEmail: lead.customer.email || "",
        customerPhone: lead.customer.phone || "",
        customerLocation: lead.customer.location || "",
        source: lead.source,
        priority: lead.priority,
        brands: lead.interest.brands?.join(", ") || "",
        vehicleTypes: lead.interest.vehicleTypes?.join(", ") || "",
        budget: lead.interest.budget || "",
        timeline: lead.interest.timeline || "",
        assignedTo: lead.assignedTo || "",
        entityId: lead.entityId || "",
      });
    }
    setFormErrors({});
    onModeChange?.("view");
  };

  // Copy link
  const handleCopyLink = useCallback(() => {
    const url = new URL(window.location.origin + "/leads");
    if (leadId) url.searchParams.set("id", leadId);

    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [leadId]);

  // Analyze lead with AI
  const handleAnalyze = async () => {
    if (!lead?.id) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}/score`, {
        method: "POST",
      });
      const data = await response.json();
      if (data.success && data.aiScore) {
        // Update local lead state with new AI score
        setLead((prev) =>
          prev
            ? {
                ...prev,
                score: data.aiScore.overallScore,
                aiScore: data.aiScore,
              }
            : null
        );
        // Notify parent to refresh
        onLeadUpdated?.();
      } else {
        console.error("Failed to analyze lead:", data.error);
      }
    } catch (error) {
      console.error("Error analyzing lead:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case "call":
        return Phone;
      case "email":
        return Mail;
      case "meeting":
        return Calendar;
      case "message":
        return MessageSquare;
      default:
        return Activity;
    }
  };

  const getInteractionColor = (type: string) => {
    switch (type) {
      case "call":
        return "from-emerald-500 to-teal-500";
      case "email":
        return "from-blue-500 to-cyan-500";
      case "meeting":
        return "from-violet-500 to-purple-500";
      case "message":
        return "from-amber-500 to-orange-500";
      default:
        return "from-gray-500 to-slate-500";
    }
  };

  // Create Mode Form
  const renderCreateForm = () => (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Customer Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Customer Information
          </h3>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Name *</Label>
              <Input
                id="customerName"
                placeholder="Enter customer name"
                value={formData.customerName}
                onChange={(e) => handleInputChange("customerName", e.target.value)}
                className={formErrors.customerName ? "border-red-500" : ""}
              />
              {formErrors.customerName && (
                <p className="text-xs text-red-500">{formErrors.customerName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.customerEmail}
                  onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                  className={formErrors.customerEmail ? "border-red-500" : ""}
                />
                {formErrors.customerEmail && (
                  <p className="text-xs text-red-500">{formErrors.customerEmail}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone *</Label>
                <Input
                  id="customerPhone"
                  placeholder="+84 xxx xxx xxx"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange("customerPhone", e.target.value)}
                  className={formErrors.customerPhone ? "border-red-500" : ""}
                />
                {formErrors.customerPhone && (
                  <p className="text-xs text-red-500">{formErrors.customerPhone}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerLocation">Location</Label>
              <Input
                id="customerLocation"
                placeholder="City, District"
                value={formData.customerLocation}
                onChange={(e) => handleInputChange("customerLocation", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Lead Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Lead Details
          </h3>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Source</Label>
                <Select
                  value={formData.source}
                  onChange={(value) => handleInputChange("source", value)}
                  options={[
                    { value: "website", label: "Website" },
                    { value: "referral", label: "Referral" },
                    { value: "walk-in", label: "Walk-in" },
                    { value: "event", label: "Event" },
                    { value: "social", label: "Social Media" },
                    { value: "other", label: "Other" },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onChange={(value) => handleInputChange("priority", value)}
                  options={[
                    { value: "hot", label: "Hot" },
                    { value: "warm", label: "Warm" },
                    { value: "cold", label: "Cold" },
                  ]}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                placeholder="Sales representative name"
                value={formData.assignedTo}
                onChange={(e) => handleInputChange("assignedTo", e.target.value)}
              />
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

        {/* Interest Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Car className="h-4 w-4 text-primary" />
            Interest Details
          </h3>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="brands">Interested Brands</Label>
              <Input
                id="brands"
                placeholder="Toyota, Honda, Ford (comma separated)"
                value={formData.brands}
                onChange={(e) => handleInputChange("brands", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleTypes">Vehicle Types</Label>
              <Input
                id="vehicleTypes"
                placeholder="SUV, Sedan, Pickup (comma separated)"
                value={formData.vehicleTypes}
                onChange={(e) => handleInputChange("vehicleTypes", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget Range</Label>
                <Input
                  id="budget"
                  placeholder="500M - 800M VND"
                  value={formData.budget}
                  onChange={(e) => handleInputChange("budget", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeline">Timeline</Label>
                <Input
                  id="timeline"
                  placeholder="Within 1 month"
                  value={formData.timeline}
                  onChange={(e) => handleInputChange("timeline", e.target.value)}
                />
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
        <SheetHeader className="p-4 pb-3 border-b space-y-0 shrink-0">
          {isCreateMode ? (
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
                <Plus className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-lg font-bold">
                  Add New Lead
                </SheetTitle>
                <SheetDescription className="mt-1 text-xs">
                  Fill in the details to create a new lead
                </SheetDescription>
              </div>
            </div>
          ) : isEditMode && lead ? (
            <div className="flex items-start gap-4">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-xl font-bold text-xl text-white shadow-lg ${
                  lead.priority === "hot"
                    ? "bg-gradient-to-br from-red-500 to-orange-500"
                    : lead.priority === "warm"
                    ? "bg-gradient-to-br from-amber-500 to-yellow-500"
                    : "bg-gradient-to-br from-blue-500 to-cyan-500"
                }`}
              >
                <Pencil className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-lg font-bold">
                  Edit Lead
                </SheetTitle>
                <SheetDescription className="mt-1 text-xs">
                  Update information for {lead.customer.name}
                </SheetDescription>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-muted animate-pulse" />
              <div className="space-y-2">
                <SheetTitle className="sr-only">Loading lead details</SheetTitle>
                <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                <div className="h-3 w-48 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ) : lead ? (
            <div className="flex items-start gap-4">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-xl font-bold text-xl text-white shadow-lg ${
                  lead.priority === "hot"
                    ? "bg-gradient-to-br from-red-500 to-orange-500"
                    : lead.priority === "warm"
                    ? "bg-gradient-to-br from-amber-500 to-yellow-500"
                    : "bg-gradient-to-br from-blue-500 to-cyan-500"
                }`}
              >
                {lead.customer.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-lg font-bold truncate">
                    {lead.customer.name}
                  </SheetTitle>
                  <span className={`priority-badge ${lead.priority}`}>
                    {lead.priority}
                  </span>
                </div>
                <SheetDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {lead.customer.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {lead.customer.phone}
                  </span>
                </SheetDescription>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              <SheetTitle>Lead Not Found</SheetTitle>
            </div>
          )}
        </SheetHeader>

        {/* Quick Stats (view mode only) */}
        {isViewMode && lead && !isLoading && (
          <div className="grid grid-cols-4 gap-2 p-3 border-b bg-muted/20 shrink-0">
            <div className="text-center p-2 rounded-lg bg-card/50">
              <div className="flex items-center justify-center gap-1">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-bold text-lg">{lead.score}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Score</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-card/50">
              <div className="flex items-center justify-center gap-1">
                <Activity className="h-3.5 w-3.5 text-violet-500" />
                <span className="font-bold text-lg">{interactions.length}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Activities</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-card/50">
              <div className="flex items-center justify-center gap-1">
                <Target className="h-3.5 w-3.5 text-emerald-500" />
                <span className="font-bold text-sm capitalize">{lead.status}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Status</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-card/50">
              <div className="flex items-center justify-center gap-1">
                <Clock className="h-3.5 w-3.5 text-blue-500" />
                <span className="font-bold text-sm">
                  {new Date(lead.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">Created</p>
            </div>
          </div>
        )}

        {/* Tabs (view mode only) */}
        {isViewMode && lead && !isLoading && (
          <div className="flex items-center gap-1 px-3 pt-2 border-b shrink-0">
            {(["overview", "activity", "insights"] as const).map((tab) => (
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
            renderCreateForm()
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="relative mx-auto">
                  <div className="h-12 w-12 rounded-xl bg-gradient-brand animate-pulse" />
                  <User className="absolute inset-0 m-auto h-6 w-6 text-white" />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">Loading lead details...</p>
              </div>
            </div>
          ) : !lead ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-4 font-medium">Lead not found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                The lead you're looking for doesn't exist
              </p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {activeTab === "overview" && (
                  <>
                    {/* Interest Details */}
                    <div className="rounded-xl border bg-card/50 p-4 space-y-4">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Car className="h-4 w-4 text-primary" />
                        Interest Details
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1.5">Interested Brands</p>
                          <div className="flex flex-wrap gap-1.5">
                            {lead.interest.brands.map((brand) => (
                              <span
                                key={brand}
                                className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                              >
                                {brand}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1.5">Vehicle Types</p>
                          <div className="flex flex-wrap gap-1.5">
                            {lead.interest.vehicleTypes.map((type) => (
                              <span
                                key={type}
                                className="px-2 py-1 rounded-full bg-muted text-xs font-medium"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                          <div>
                            <p className="text-xs text-muted-foreground">Budget Range</p>
                            <p className="text-sm font-medium mt-0.5">{lead.interest.budget}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Timeline</p>
                            <p className="text-sm font-medium mt-0.5 capitalize">{lead.interest.timeline}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lead Info */}
                    <div className="rounded-xl border bg-card/50 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Target className="h-4 w-4 text-primary" />
                        Lead Info
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Source</p>
                          <p className="font-medium capitalize">{lead.source}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Assigned To</p>
                          <p className="font-medium">{lead.assignedTo || "Unassigned"}</p>
                        </div>
                        {lead.customer.location && (
                          <div className="col-span-2">
                            <p className="text-xs text-muted-foreground">Location</p>
                            <p className="font-medium flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {lead.customer.location}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* AI Score Analysis */}
                    <div className="rounded-xl border bg-gradient-to-br from-violet-50/50 to-transparent dark:from-violet-950/20 p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <Sparkles className="h-4 w-4 text-violet-500" />
                          AI Lead Score
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAnalyze}
                          disabled={isAnalyzing}
                          className="h-7 text-xs gap-1.5"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3 w-3" />
                              {lead.aiScore ? "Re-analyze" : "Analyze with AI"}
                            </>
                          )}
                        </Button>
                      </div>

                      {lead.aiScore ? (
                        <>
                          <div className="flex items-center gap-4">
                            <div className="relative h-20 w-20 flex-shrink-0">
                              <svg className="h-20 w-20 -rotate-90 transform">
                                <circle
                                  cx="40"
                                  cy="40"
                                  r="32"
                                  stroke="currentColor"
                                  strokeWidth="6"
                                  fill="none"
                                  className="text-muted"
                                />
                                <circle
                                  cx="40"
                                  cy="40"
                                  r="32"
                                  stroke="url(#scoreGradientSheet)"
                                  strokeWidth="6"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeDasharray={`${(lead.aiScore.overallScore / 100) * 201} 201`}
                                />
                                <defs>
                                  <linearGradient id="scoreGradientSheet" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#8B5CF6" />
                                    <stop offset="100%" stopColor="#06B6D4" />
                                  </linearGradient>
                                </defs>
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="font-display text-2xl font-bold">{lead.aiScore.overallScore}</span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge
                                  variant={
                                    lead.aiScore.recommendation === "Hot"
                                      ? "default"
                                      : lead.aiScore.recommendation === "Warm"
                                      ? "secondary"
                                      : "outline"
                                  }
                                  className={
                                    lead.aiScore.recommendation === "Hot"
                                      ? "bg-red-500 hover:bg-red-600"
                                      : lead.aiScore.recommendation === "Warm"
                                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                                      : ""
                                  }
                                >
                                  {lead.aiScore.recommendation}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{lead.aiScore.insights}</p>
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 border-t">
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span>Budget Fit</span>
                                <span className="font-medium">{lead.aiScore.factors.budgetScore}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                                  style={{ width: `${lead.aiScore.factors.budgetScore}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span>Timeline Urgency</span>
                                <span className="font-medium">{lead.aiScore.factors.timelineScore}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all"
                                  style={{ width: `${lead.aiScore.factors.timelineScore}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span>Brand Match</span>
                                <span className="font-medium">{lead.aiScore.factors.brandScore}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                                  style={{ width: `${lead.aiScore.factors.brandScore}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span>Engagement</span>
                                <span className="font-medium">{lead.aiScore.factors.engagementScore}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                                  style={{ width: `${lead.aiScore.factors.engagementScore}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <p className="text-[10px] text-muted-foreground text-right">
                            Analyzed {new Date(lead.aiScore.analyzedAt).toLocaleDateString("vi-VN")} at{" "}
                            {new Date(lead.aiScore.analyzedAt).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30 mb-3">
                            <Sparkles className="h-6 w-6 text-violet-500" />
                          </div>
                          <p className="text-sm font-medium">No AI analysis yet</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Click "Analyze with AI" to get AI-powered scoring
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {activeTab === "activity" && (
                  <div className="space-y-3">
                    {interactions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                          <Activity className="h-7 w-7 text-muted-foreground" />
                        </div>
                        <p className="mt-4 font-medium">No activities yet</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Start by logging your first interaction
                        </p>
                      </div>
                    ) : (
                      <div className="relative pl-6 space-y-4">
                        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
                        {interactions.map((interaction, index) => {
                          const Icon = getInteractionIcon(interaction.type);
                          const colorClass = getInteractionColor(interaction.type);
                          return (
                            <div key={interaction.id} className="relative">
                              <div
                                className={`absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${colorClass} shadow-md`}
                              >
                                <Icon className="h-3 w-3 text-white" />
                              </div>
                              <div className="rounded-lg border bg-card/50 p-3">
                                <div className="flex items-start justify-between">
                                  <p className="font-medium text-sm capitalize">{interaction.type}</p>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(interaction.timestamp).toLocaleDateString("vi-VN")}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {interaction.notes}
                                </p>
                                {interaction.sentiment && (
                                  <div className="mt-2">
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                        interaction.sentiment === "positive"
                                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                          : interaction.sentiment === "negative"
                                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                          : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                                      }`}
                                    >
                                      {interaction.sentiment === "positive" ? (
                                        <CheckCircle className="h-3 w-3" />
                                      ) : interaction.sentiment === "negative" ? (
                                        <XCircle className="h-3 w-3" />
                                      ) : null}
                                      {interaction.sentiment}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "insights" && (
                  <div className="space-y-4">
                    {/* AI Recommendations */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Sparkles className="h-4 w-4 text-violet-500" />
                        AI Recommendations
                      </div>
                      {recommendations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center rounded-xl border bg-muted/20">
                          <Sparkles className="h-8 w-8 text-violet-400/50" />
                          <p className="mt-3 text-sm font-medium">No recommendations yet</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            AI insights will appear as more data is collected
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {recommendations.map((rec) => (
                            <div
                              key={rec.id}
                              className="rounded-lg border border-violet-200/50 dark:border-violet-800/30 bg-gradient-to-r from-violet-50/50 to-transparent dark:from-violet-950/20 p-3"
                            >
                              <div className="flex items-start gap-2">
                                <TrendingUp className="h-4 w-4 text-violet-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium">{rec.title}</p>
                                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                                    {rec.description}
                                  </p>
                                  <div className="mt-2 flex items-center gap-3">
                                    <div className="flex items-center gap-1.5">
                                      <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
                                        <div
                                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                                          style={{ width: `${rec.confidence * 100}%` }}
                                        />
                                      </div>
                                      <span className="text-xs font-medium text-emerald-600">
                                        {(rec.confidence * 100).toFixed(0)}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Recommended Actions */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Target className="h-4 w-4 text-primary" />
                        Recommended Actions
                      </div>
                      <div className="space-y-2">
                        <div className="rounded-lg border-2 border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-3">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Schedule Test Drive</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Lead shows high interest in {lead.interest.brands[0]}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-lg border-2 border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/20 p-3">
                          <div className="flex items-start gap-2">
                            <DollarSign className="h-4 w-4 text-blue-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Send Financing Options</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Budget matches available financing plans
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-lg border-2 border-violet-200 dark:border-violet-800/50 bg-violet-50/50 dark:bg-violet-950/20 p-3">
                          <div className="flex items-start gap-2">
                            <Clock className="h-4 w-4 text-violet-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Follow Up This Week</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Timeline: {lead.interest.timeline}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Footer Actions */}
        {isCreateMode ? (
          <div className="p-3 border-t flex items-center gap-2 bg-muted/30 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
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
              {isSaving ? "Creating..." : "Create Lead"}
            </Button>
          </div>
        ) : isEditMode && lead ? (
          <div className="p-3 border-t flex items-center gap-2 bg-muted/30 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleCancelEdit}
            >
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
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        ) : lead && !isLoading && (
          <div className="p-3 border-t flex items-center gap-2 bg-muted/30 shrink-0">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopyLink}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleEditClick}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
            <Button size="sm" className="gap-1.5 bg-gradient-brand flex-1">
              <Phone className="h-3.5 w-3.5" />
              Call
            </Button>
            <Button size="sm" className="gap-1.5 flex-1">
              <Mail className="h-3.5 w-3.5" />
              Email
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
