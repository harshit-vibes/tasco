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
} from "@tasco/ui";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Target,
  MessageSquare,
  User,
  Car,
  Clock,
  Crown,
  Star,
  Wrench,
  ChevronRight,
  Activity,
  Heart,
  BarChart3,
  Copy,
  Check,
  Send,
  Plus,
  Save,
  Loader2,
  Pencil,
  X,
} from "@tasco/ui/icons";
import { useEntityFilter } from "../lib/entity-filter-context";
import type { Customer, Purchase, Interaction } from "../lib/data-layer";

export interface CustomerDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string | null;
  mode?: "view" | "create" | "edit";
  onCustomerUpdated?: () => void;
  onCustomerCreated?: (customer: Customer) => void;
  onModeChange?: (mode: "view" | "create" | "edit") => void;
}

interface CustomerFormData {
  // Profile
  name: string;
  email: string;
  phone: string;
  location: string;
  dateOfBirth: string;
  // Lifecycle
  stage: Customer["lifecycle"]["stage"];
  firstPurchaseDate: string;
  // Preferences
  brands: string;
  communicationChannels: string;
  serviceInterests: string;
  // Entity
  entityId: string;
}

const initialFormData: CustomerFormData = {
  name: "",
  email: "",
  phone: "",
  location: "",
  dateOfBirth: "",
  stage: "active",
  firstPurchaseDate: new Date().toISOString().split("T")[0],
  brands: "",
  communicationChannels: "",
  serviceInterests: "",
  entityId: "",
};

export function CustomerDetailSheet({
  open,
  onOpenChange,
  customerId,
  mode = "view",
  onCustomerUpdated,
  onCustomerCreated,
  onModeChange,
}: CustomerDetailSheetProps) {
  const { entities, selectedEntityIds } = useEntityFilter();

  // Mode helpers
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";
  const isViewMode = mode === "view";
  const isFormMode = isEditMode || isCreateMode;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "insights">("overview");
  const [copied, setCopied] = useState(false);

  // Form state for create mode
  const [formData, setFormData] = useState<CustomerFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CustomerFormData, string>>>({});

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
    if (isEditMode && customer) {
      setFormData({
        name: customer.profile.name || "",
        email: customer.profile.email || "",
        phone: customer.profile.phone || "",
        location: customer.profile.location || "",
        dateOfBirth: customer.profile.dateOfBirth ? customer.profile.dateOfBirth.split("T")[0] : "",
        stage: customer.lifecycle.stage,
        firstPurchaseDate: customer.lifecycle.firstPurchaseDate ? customer.lifecycle.firstPurchaseDate.split("T")[0] : "",
        brands: customer.preferences?.brands?.join(", ") || "",
        communicationChannels: customer.preferences?.communicationChannels?.join(", ") || "",
        serviceInterests: customer.preferences?.serviceInterests?.join(", ") || "",
        entityId: customer.entityId || "",
      });
    }
  }, [isEditMode, customer]);

  // Fetch customer data (view and edit modes)
  useEffect(() => {
    if (!open || !customerId || isCreateMode) {
      setCustomer(null);
      setPurchases([]);
      setInteractions([]);
      return;
    }

    async function fetchCustomerData() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/customers/${customerId}`);
        const data = await response.json();

        if (data.success && data.customer) {
          setCustomer(data.customer);
          setPurchases(data.purchases || []);
          setInteractions(data.interactions || []);
        }
      } catch (error) {
        console.error("Error fetching customer:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCustomerData();
  }, [open, customerId, mode]);

  // Form handlers
  const handleInputChange = (field: keyof CustomerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CustomerFormData, string>> = {};

    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    if (!formData.phone.trim()) errors.phone = "Phone is required";
    if (!formData.entityId) errors.entityId = "Company is required";
    if (!formData.firstPurchaseDate) errors.firstPurchaseDate = "First purchase date is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const payload = {
        profile: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          dateOfBirth: formData.dateOfBirth || new Date().toISOString(),
        },
        lifecycle: {
          stage: formData.stage,
          firstPurchaseDate: formData.firstPurchaseDate,
        },
        preferences: {
          brands: formData.brands.split(",").map(s => s.trim()).filter(Boolean),
          communicationChannels: formData.communicationChannels.split(",").map(s => s.trim()).filter(Boolean),
          serviceInterests: formData.serviceInterests.split(",").map(s => s.trim()).filter(Boolean),
        },
        entityId: formData.entityId,
      };

      const url = isEditMode && customerId ? `/api/customers/${customerId}` : "/api/customers";
      const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        if (isEditMode) {
          setCustomer(data.customer);
          onCustomerUpdated?.();
          onModeChange?.("view");
        } else {
          onCustomerCreated?.(data.customer);
          onOpenChange(false);
        }
      } else {
        console.error(`Failed to ${isEditMode ? "update" : "create"} customer:`, data.error);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "creating"} customer:`, error);
    } finally {
      setIsSaving(false);
    }
  };

  // Edit mode handlers
  const handleEditClick = () => {
    onModeChange?.("edit");
  };

  const handleCancelEdit = () => {
    // Reset form data to customer values
    if (customer) {
      setFormData({
        name: customer.profile.name || "",
        email: customer.profile.email || "",
        phone: customer.profile.phone || "",
        location: customer.profile.location || "",
        dateOfBirth: customer.profile.dateOfBirth ? customer.profile.dateOfBirth.split("T")[0] : "",
        stage: customer.lifecycle.stage,
        firstPurchaseDate: customer.lifecycle.firstPurchaseDate ? customer.lifecycle.firstPurchaseDate.split("T")[0] : "",
        brands: customer.preferences?.brands?.join(", ") || "",
        communicationChannels: customer.preferences?.communicationChannels?.join(", ") || "",
        serviceInterests: customer.preferences?.serviceInterests?.join(", ") || "",
        entityId: customer.entityId || "",
      });
    }
    setFormErrors({});
    onModeChange?.("view");
  };

  // Copy link
  const handleCopyLink = useCallback(() => {
    const url = new URL(window.location.origin + "/customers");
    if (customerId) url.searchParams.set("id", customerId);

    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [customerId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getSegmentConfig = (segment: string) => {
    switch (segment) {
      case "vip":
        return {
          label: "VIP",
          gradient: "from-amber-500 to-orange-500",
          bgClass: "bg-gradient-to-br from-amber-500 to-orange-500",
          icon: Crown,
        };
      case "regular":
        return {
          label: "Regular",
          gradient: "from-blue-500 to-indigo-500",
          bgClass: "bg-gradient-to-br from-blue-500 to-indigo-500",
          icon: User,
        };
      case "at-risk":
        return {
          label: "At Risk",
          gradient: "from-rose-500 to-red-500",
          bgClass: "bg-gradient-to-br from-rose-500 to-red-500",
          icon: AlertTriangle,
        };
      case "new":
        return {
          label: "New",
          gradient: "from-emerald-500 to-teal-500",
          bgClass: "bg-gradient-to-br from-emerald-500 to-teal-500",
          icon: Star,
        };
      default:
        return {
          label: "Customer",
          gradient: "from-slate-500 to-slate-600",
          bgClass: "bg-gradient-to-br from-slate-500 to-slate-600",
          icon: User,
        };
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "phone": return Phone;
      case "email": return Mail;
      case "in-person": return User;
      case "chat": return MessageSquare;
      default: return MessageSquare;
    }
  };

  const getInteractionColor = (type: string) => {
    switch (type) {
      case "purchase": return "from-emerald-500 to-green-500";
      case "service": return "from-blue-500 to-indigo-500";
      case "inquiry": return "from-amber-500 to-orange-500";
      case "complaint": return "from-rose-500 to-red-500";
      case "follow-up": return "from-violet-500 to-purple-500";
      default: return "from-slate-500 to-slate-600";
    }
  };

  const segmentConfig = customer ? getSegmentConfig(customer.insights.segment) : null;
  const SegmentIcon = segmentConfig?.icon || User;
  const churnRiskPercentage = customer ? Math.round(customer.insights.churnRisk * 100) : 0;
  const churnRiskLevel = customer
    ? customer.insights.churnRisk > 0.7 ? "high" : customer.insights.churnRisk > 0.4 ? "medium" : "low"
    : "low";
  const satisfactionPercentage = customer?.insights.satisfactionScore || 0;

  // Form for create/edit modes
  const renderForm = () => (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Profile Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Profile Information
          </h3>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter customer name"
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
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={formErrors.email ? "border-red-500" : ""}
                />
                {formErrors.email && (
                  <p className="text-xs text-red-500">{formErrors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  placeholder="+84 xxx xxx xxx"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={formErrors.phone ? "border-red-500" : ""}
                />
                {formErrors.phone && (
                  <p className="text-xs text-red-500">{formErrors.phone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="City, District"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lifecycle Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Lifecycle Information
          </h3>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Stage</Label>
                <Select
                  value={formData.stage}
                  onChange={(value) => handleInputChange("stage", value)}
                  options={[
                    { value: "prospect", label: "Prospect" },
                    { value: "active", label: "Active" },
                    { value: "loyal", label: "Loyal" },
                    { value: "at-risk", label: "At Risk" },
                    { value: "churned", label: "Churned" },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstPurchaseDate">First Purchase Date *</Label>
                <Input
                  id="firstPurchaseDate"
                  type="date"
                  value={formData.firstPurchaseDate}
                  onChange={(e) => handleInputChange("firstPurchaseDate", e.target.value)}
                  className={formErrors.firstPurchaseDate ? "border-red-500" : ""}
                />
                {formErrors.firstPurchaseDate && (
                  <p className="text-xs text-red-500">{formErrors.firstPurchaseDate}</p>
                )}
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

        {/* Preferences */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Preferences
          </h3>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="brands">Preferred Brands</Label>
              <Input
                id="brands"
                placeholder="Toyota, Honda, Ford (comma separated)"
                value={formData.brands}
                onChange={(e) => handleInputChange("brands", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceInterests">Service Interests</Label>
              <Input
                id="serviceInterests"
                placeholder="Maintenance, Insurance, Trade-in (comma separated)"
                value={formData.serviceInterests}
                onChange={(e) => handleInputChange("serviceInterests", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="communicationChannels">Communication Channels</Label>
              <Input
                id="communicationChannels"
                placeholder="Email, Phone, SMS (comma separated)"
                value={formData.communicationChannels}
                onChange={(e) => handleInputChange("communicationChannels", e.target.value)}
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
        {isFormMode ? (
          <div className="relative overflow-hidden px-4 py-4 bg-card border-b">
            <SheetHeader className="space-y-0">
              <div className="flex items-start gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl shadow-lg ${
                  isEditMode
                    ? "bg-gradient-to-br from-amber-500 to-orange-500"
                    : "bg-gradient-to-br from-blue-500 to-indigo-500"
                }`}>
                  {isEditMode ? (
                    <Pencil className="h-7 w-7 text-white" />
                  ) : (
                    <Plus className="h-7 w-7 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <SheetTitle className="text-lg font-bold">
                    {isEditMode ? "Edit Customer" : "Add New Customer"}
                  </SheetTitle>
                  <SheetDescription className="mt-1 text-xs">
                    {isEditMode
                      ? "Update the customer information below"
                      : "Fill in the details to create a new customer"}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
          </div>
        ) : (
          /* Hero Header - View Mode */
          <div className={`relative overflow-hidden px-4 py-4 ${customer && segmentConfig ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" : "bg-card border-b"}`}>
            {customer && segmentConfig && (
              <div className="absolute inset-0 overflow-hidden">
                <div className={`absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${segmentConfig.gradient} opacity-20 blur-2xl`} />
              </div>
            )}

            <SheetHeader className="relative space-y-0">
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-xl bg-muted animate-pulse" />
                  <div className="space-y-2">
                    <SheetTitle className="sr-only">Loading customer details</SheetTitle>
                    <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-48 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ) : customer && segmentConfig ? (
                <div className="flex items-start gap-4">
                  <div className={`relative flex h-14 w-14 items-center justify-center rounded-xl ${segmentConfig.bgClass} text-xl font-bold text-white shadow-lg flex-shrink-0`}>
                    {customer.profile.name.charAt(0)}
                    {customer.insights.segment === "vip" && (
                      <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 shadow">
                        <Crown className="h-3 w-3 text-amber-900" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <SheetTitle className="text-lg font-bold text-white truncate">
                      {customer.profile.name}
                    </SheetTitle>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className={`inline-flex items-center gap-1 rounded-full ${segmentConfig.bgClass} px-2 py-0.5 text-xs font-semibold text-white`}>
                        <SegmentIcon className="h-2.5 w-2.5" />
                        {segmentConfig.label}
                      </span>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-white/80">
                        {customer.lifecycle.stage}
                      </span>
                      {churnRiskLevel === "high" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2 py-0.5 text-xs font-medium text-rose-300">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          High Risk
                        </span>
                      )}
                    </div>
                    <SheetDescription className="flex items-center gap-1.5 mt-1.5 text-xs text-white/60">
                      <Calendar className="h-3 w-3" />
                      Customer since {formatDate(customer.lifecycle.firstPurchaseDate)}
                    </SheetDescription>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                  <SheetTitle>Customer Not Found</SheetTitle>
                </div>
              )}
            </SheetHeader>
          </div>
        )}

        {/* Stats Strip - View Mode Only */}
        {isViewMode && customer && !isLoading && (
          <div className="grid grid-cols-4 gap-1 p-2 border-b bg-muted/20 shrink-0">
            <div className="text-center p-2 rounded-lg bg-card/50">
              <div className="flex items-center justify-center gap-1">
                <DollarSign className="h-3 w-3 text-emerald-500" />
                <span className="font-bold text-sm">{formatCurrency(customer.insights.lifetimeValue)}</span>
              </div>
              <p className="text-[9px] text-muted-foreground">LTV</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-card/50">
              <div className="flex items-center justify-center gap-1">
                <ShoppingCart className="h-3 w-3 text-blue-500" />
                <span className="font-bold text-sm">{customer.insights.totalPurchases}</span>
              </div>
              <p className="text-[9px] text-muted-foreground">Purchases</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-card/50">
              <div className="flex items-center justify-center gap-1">
                <Heart className="h-3 w-3 text-rose-500" />
                <span className="font-bold text-sm">{satisfactionPercentage}%</span>
              </div>
              <p className="text-[9px] text-muted-foreground">Satisfaction</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-card/50">
              <div className="flex items-center justify-center gap-1">
                <Activity className={`h-3 w-3 ${churnRiskLevel === "high" ? "text-rose-500" : churnRiskLevel === "medium" ? "text-amber-500" : "text-emerald-500"}`} />
                <span className="font-bold text-sm">{churnRiskPercentage}%</span>
              </div>
              <p className="text-[9px] text-muted-foreground">Churn Risk</p>
            </div>
          </div>
        )}

        {/* Tabs - View Mode Only */}
        {isViewMode && customer && !isLoading && (
          <div className="flex items-center gap-1 px-3 pt-2 border-b shrink-0">
            {(["overview", "history", "insights"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-xs font-medium transition-all border-b-2 -mb-[1px] ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "insights" ? "AI Insights" : tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                <div className="relative mx-auto h-12 w-12">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <User className="h-5 w-5 text-violet-600" />
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">Loading customer...</p>
              </div>
            </div>
          ) : !customer ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-4 font-medium">Customer not found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                This customer doesn't exist or has been removed
              </p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {activeTab === "overview" && (
                  <>
                    {/* Contact Info */}
                    <div className="rounded-xl border bg-card/50 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <User className="h-4 w-4 text-primary" />
                        Contact Information
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { icon: Mail, label: "Email", value: customer.profile.email },
                          { icon: Phone, label: "Phone", value: customer.profile.phone },
                          { icon: MapPin, label: "Location", value: customer.profile.location },
                          { icon: Calendar, label: "DOB", value: formatDate(customer.profile.dateOfBirth) },
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

                    {/* Vehicle Ownership */}
                    <div className="rounded-xl border bg-card/50 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <Car className="h-4 w-4 text-primary" />
                          Vehicles
                        </div>
                        <span className="text-xs text-muted-foreground">{purchases.length} owned</span>
                      </div>
                      {purchases.length === 0 ? (
                        <div className="text-center py-4">
                          <Car className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                          <p className="mt-2 text-xs text-muted-foreground">No vehicles purchased</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {purchases.slice(0, 3).map((purchase) => (
                            <div key={purchase.id} className="flex items-center gap-3 p-2 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 shadow flex-shrink-0">
                                <Car className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{purchase.vehicleModel}</p>
                                <p className="text-xs text-muted-foreground">
                                  {purchase.brand} • {purchase.year}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-emerald-600">{formatCurrency(purchase.amount)}</p>
                              </div>
                            </div>
                          ))}
                          {purchases.length > 3 && (
                            <p className="text-xs text-center text-muted-foreground">+{purchases.length - 3} more vehicles</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Preferences */}
                    <div className="rounded-xl border bg-card/50 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Target className="h-4 w-4 text-primary" />
                        Preferences
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1.5">Preferred Brands</p>
                          <div className="flex flex-wrap gap-1">
                            {customer.preferences.brands.map((brand) => (
                              <span key={brand} className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium">
                                <Car className="h-2.5 w-2.5" />
                                {brand}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1.5">Service Interests</p>
                          <div className="flex flex-wrap gap-1">
                            {customer.preferences.serviceInterests.map((service) => (
                              <span key={service} className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                                <Wrench className="h-2.5 w-2.5" />
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Risk Indicators */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Satisfaction */}
                      <div className="rounded-xl border bg-card/50 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium">Satisfaction</span>
                          <Heart className="h-3.5 w-3.5 text-rose-500" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative h-12 w-12">
                            <svg className="h-12 w-12 -rotate-90 transform">
                              <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="4" fill="none" className="text-muted/30" />
                              <circle
                                cx="24"
                                cy="24"
                                r="18"
                                stroke="url(#satGradientSheet)"
                                strokeWidth="4"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={`${(satisfactionPercentage / 100) * 113} 113`}
                              />
                              <defs>
                                <linearGradient id="satGradientSheet" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#10B981" />
                                  <stop offset="100%" stopColor="#06B6D4" />
                                </linearGradient>
                              </defs>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-bold">{satisfactionPercentage}%</span>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {satisfactionPercentage >= 80 ? "Excellent" : satisfactionPercentage >= 60 ? "Good" : "Needs Work"}
                          </div>
                        </div>
                      </div>

                      {/* Churn Risk */}
                      <div className={`rounded-xl border bg-card/50 p-3 ${churnRiskLevel === "high" ? "ring-1 ring-rose-500/30" : ""}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium">Churn Risk</span>
                          <Activity className={`h-3.5 w-3.5 ${churnRiskLevel === "high" ? "text-rose-500" : churnRiskLevel === "medium" ? "text-amber-500" : "text-emerald-500"}`} />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative h-12 w-12">
                            <svg className="h-12 w-12 -rotate-90 transform">
                              <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="4" fill="none" className="text-muted/30" />
                              <circle
                                cx="24"
                                cy="24"
                                r="18"
                                stroke={churnRiskLevel === "high" ? "#F43F5E" : churnRiskLevel === "medium" ? "#F59E0B" : "#10B981"}
                                strokeWidth="4"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={`${(churnRiskPercentage / 100) * 113} 113`}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className={`text-sm font-bold ${churnRiskLevel === "high" ? "text-rose-500" : churnRiskLevel === "medium" ? "text-amber-500" : "text-emerald-500"}`}>
                                {churnRiskPercentage}%
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {churnRiskLevel === "high" ? "Action needed" : churnRiskLevel === "medium" ? "Monitor" : "Stable"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "history" && (
                  <div className="space-y-3">
                    {interactions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Clock className="h-10 w-10 text-muted-foreground/30" />
                        <p className="mt-3 text-sm font-medium">No interactions recorded</p>
                        <p className="mt-1 text-xs text-muted-foreground">Start by logging an interaction</p>
                      </div>
                    ) : (
                      <div className="relative pl-6 space-y-3">
                        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
                        {interactions.map((interaction) => {
                          const Icon = getChannelIcon(interaction.channel);
                          const colorClass = getInteractionColor(interaction.type);
                          return (
                            <div key={interaction.id} className="relative">
                              <div className={`absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${colorClass} shadow`}>
                                <Icon className="h-3 w-3 text-white" />
                              </div>
                              <div className="rounded-lg border bg-card/50 p-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium capitalize">{interaction.type}</p>
                                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                                      {interaction.notes}
                                    </p>
                                  </div>
                                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                    {formatDate(interaction.timestamp)}
                                  </span>
                                </div>
                                <div className="mt-2 flex items-center gap-1.5">
                                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium capitalize">
                                    {interaction.channel}
                                  </span>
                                  {interaction.sentiment && (
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                      interaction.sentiment === "positive"
                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                        : interaction.sentiment === "negative"
                                        ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                    }`}>
                                      {interaction.sentiment}
                                    </span>
                                  )}
                                </div>
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
                    {/* Next Best Actions */}
                    <div className="rounded-xl border bg-gradient-to-br from-violet-50/50 to-transparent dark:from-violet-950/20 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Sparkles className="h-4 w-4 text-violet-500" />
                        Next Best Actions
                      </div>
                      {customer.insights.recommendedActions && customer.insights.recommendedActions.length > 0 ? (
                        <div className="space-y-2">
                          {customer.insights.recommendedActions.map((action, index) => (
                            <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-white/50 dark:bg-white/5 border border-violet-200/50 dark:border-violet-800/30">
                              <Target className="h-4 w-4 text-violet-500 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-xs">{action}</p>
                                <Button size="sm" variant="ghost" className="h-6 mt-1 text-[10px] text-violet-600 px-2">
                                  <Send className="mr-1 h-2.5 w-2.5" />
                                  Take Action
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <Sparkles className="h-8 w-8 text-violet-400/30 mx-auto" />
                          <p className="mt-2 text-xs text-muted-foreground">No recommendations available</p>
                        </div>
                      )}
                    </div>

                    {/* Insights Summary */}
                    <div className="rounded-xl border bg-card/50 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <BarChart3 className="h-4 w-4 text-emerald-500" />
                        Customer Insights
                      </div>
                      <div className="space-y-2">
                        {[
                          { label: "Engagement Level", value: "High", percent: 75, color: "from-emerald-500 to-teal-500" },
                          { label: "Purchase Frequency", value: customer.insights.totalPurchases > 2 ? "Frequent" : "Occasional", percent: Math.min(customer.insights.totalPurchases * 25, 100), color: "from-blue-500 to-indigo-500" },
                          { label: "Loyalty Score", value: customer.insights.segment === "vip" ? "Platinum" : "Silver", percent: customer.insights.segment === "vip" ? 100 : 50, color: "from-violet-500 to-purple-500" },
                        ].map((item) => (
                          <div key={item.label} className="p-2 rounded-lg bg-muted/30">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>{item.label}</span>
                              <span className="font-medium">{item.value}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                              <div className={`h-full rounded-full bg-gradient-to-r ${item.color}`} style={{ width: `${item.percent}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Summary */}
                    <div className="p-3 rounded-xl border-2 border-dashed border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-900/10">
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-violet-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-violet-900 dark:text-violet-100">AI Summary</p>
                          <p className="mt-1 text-xs text-violet-700 dark:text-violet-300">
                            {customer.profile.name} is a {customer.insights.segment} customer with{" "}
                            {customer.insights.churnRisk > 0.5 ? "elevated" : "low"} churn risk.{" "}
                            {customer.insights.segment === "vip"
                              ? "Consider exclusive VIP offers."
                              : customer.insights.churnRisk > 0.5
                              ? "Recommend proactive engagement."
                              : "Continue regular engagement."}
                          </p>
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
                : isEditMode ? "Save Changes" : "Create Customer"}
            </Button>
          </div>
        ) : customer && !isLoading && (
          <div className="p-3 border-t flex items-center gap-2 bg-muted/30 shrink-0">
            <Button variant="outline" size="sm" className="gap-1.5 flex-1" onClick={handleCopyLink}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy Link"}
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleEditClick}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
            <Button size="sm" className="gap-1.5 bg-gradient-brand">
              <MessageSquare className="h-3.5 w-3.5" />
              Chat
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
