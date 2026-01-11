"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Switch,
} from "@tasco/ui";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Percent,
  Package,
  Gift,
  Star,
  CreditCard,
  Users,
  Calendar,
  Settings,
  Sparkles,
  AlertTriangle,
  Lightbulb,
} from "@tasco/ui/icons";
import { useTranslation } from "@tasco/i18n";
import { toast } from "sonner";
import type { PromotionType, PromotionStatus, CustomerSegment, SalesChannel, DiscountType } from "@tasco/db";

// Step configuration
const STEPS = [
  { id: "basics", label: "Basics", icon: Settings },
  { id: "targeting", label: "Targeting", icon: Users },
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "review", label: "Review", icon: Check },
];

// Promotion type options with icons
const PROMO_TYPES: { value: PromotionType; label: string; icon: React.ElementType; description: string }[] = [
  { value: "discount", label: "Discount", icon: Percent, description: "Percentage or fixed discount" },
  { value: "bundle", label: "Bundle", icon: Package, description: "Buy more, save more" },
  { value: "free-item", label: "Free Item", icon: Gift, description: "Free gift with purchase" },
  { value: "loyalty", label: "Loyalty", icon: Star, description: "Reward loyal customers" },
  { value: "coupon", label: "Coupon", icon: CreditCard, description: "Redeemable code" },
];

// Customer segments
const SEGMENTS: { value: CustomerSegment; label: string }[] = [
  { value: "all", label: "All Customers" },
  { value: "vip", label: "VIP Members" },
  { value: "regular", label: "Regular Customers" },
  { value: "new", label: "New Customers" },
  { value: "wholesale", label: "Wholesale" },
  { value: "retail", label: "Retail" },
];

// Sales channels
const CHANNELS: { value: SalesChannel; label: string }[] = [
  { value: "all", label: "All Channels" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "retail", label: "Retail Stores" },
  { value: "wholesale", label: "Wholesale" },
  { value: "direct", label: "Direct Sales" },
];

interface FormData {
  name: string;
  description: string;
  type: PromotionType;
  status: PromotionStatus;
  discountType: DiscountType;
  discountValue: number;
  targetSegments: CustomerSegment[];
  targetChannels: SalesChannel[];
  targetProducts: string[];
  startDate: string;
  endDate: string;
  stackable: boolean;
  priority: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
}

export default function NewPromotionPage() {
  const { t } = useTranslation("app");
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    type: "discount",
    status: "draft",
    discountType: "percentage",
    discountValue: 10,
    targetSegments: ["all"],
    targetChannels: ["all"],
    targetProducts: [],
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    stackable: true,
    priority: 1,
  });

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const toggleArrayItem = <T,>(array: T[], item: T): T[] => {
    return array.includes(item)
      ? array.filter((i) => i !== item)
      : [...array, item];
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.push("/promotions");
    }
  };

  const handleSubmit = async (asDraft: boolean = true) => {
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        status: asDraft ? "draft" : "active",
      };

      const res = await fetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(
          asDraft
            ? t("promotions.savedAsDraft", "Promotion saved as draft")
            : t("promotions.activated", "Promotion activated")
        );
        router.push("/promotions");
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to create promotion");
      }
    } catch (error) {
      toast.error(t("common.error", "Failed to create promotion"));
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Basics
        return formData.name.trim() !== "" && formData.description.trim() !== "";
      case 1: // Targeting
        return formData.targetSegments.length > 0 && formData.targetChannels.length > 0;
      case 2: // Schedule
        return formData.startDate && formData.endDate && new Date(formData.startDate) <= new Date(formData.endDate);
      case 3: // Review
        return true;
      default:
        return false;
    }
  };

  return (
    <main className="flex h-full flex-col overflow-auto">
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {t("promotions.create", "Create Promotion")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("promotions.createSubtitle", "Set up a new promotion campaign")}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div key={step.id} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                        isCompleted
                          ? "border-primary bg-primary text-primary-foreground"
                          : isActive
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-muted bg-muted text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        isActive ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`mx-2 h-0.5 flex-1 transition-all ${
                        isCompleted ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="mx-auto max-w-2xl">
          {/* Step 1: Basics */}
          {currentStep === 0 && (
            <Card className="card-premium">
              <CardHeader>
                <CardTitle>{t("promotions.form.basics", "Basic Information")}</CardTitle>
                <CardDescription>
                  {t("promotions.form.basicsDesc", "Name your promotion and choose its type")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("promotions.form.name", "Promotion Name")} *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                    placeholder={t("promotions.form.namePlaceholder", "e.g., Summer Sale 2024")}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("promotions.form.description", "Description")} *
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => updateFormData({ description: e.target.value })}
                    placeholder={t("promotions.form.descriptionPlaceholder", "Describe the promotion...")}
                    rows={3}
                  />
                </div>

                {/* Type Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    {t("promotions.form.type", "Promotion Type")} *
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {PROMO_TYPES.map((type) => {
                      const Icon = type.icon;
                      const isSelected = formData.type === type.value;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => updateFormData({ type: type.value })}
                          className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div
                            className={`rounded-lg p-2 ${
                              isSelected ? "bg-primary/10" : "bg-muted"
                            }`}
                          >
                            <Icon
                              className={`h-5 w-5 ${
                                isSelected ? "text-primary" : "text-muted-foreground"
                              }`}
                            />
                          </div>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {type.description}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Discount Settings */}
                <div className="rounded-xl border bg-muted/30 p-4">
                  <h4 className="mb-4 font-medium">
                    {t("promotions.form.discountSettings", "Discount Settings")}
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {t("promotions.form.discountType", "Discount Type")}
                      </label>
                      <Select
                        value={formData.discountType}
                        onValueChange={(value) =>
                          updateFormData({ discountType: value as DiscountType })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">
                            {t("promotions.form.percentage", "Percentage (%)")}
                          </SelectItem>
                          <SelectItem value="fixed">
                            {t("promotions.form.fixed", "Fixed Amount (VND)")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {t("promotions.form.discountValue", "Discount Value")}
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={formData.discountValue}
                          onChange={(e) =>
                            updateFormData({ discountValue: Number(e.target.value) })
                          }
                          className="pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {formData.discountType === "percentage" ? "%" : "₫"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Targeting */}
          {currentStep === 1 && (
            <Card className="card-premium">
              <CardHeader>
                <CardTitle>{t("promotions.form.targeting", "Target Audience")}</CardTitle>
                <CardDescription>
                  {t("promotions.form.targetingDesc", "Choose who should receive this promotion")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Segments */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    {t("promotions.form.targetSegments", "Customer Segments")} *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SEGMENTS.map((segment) => {
                      const isSelected = formData.targetSegments.includes(segment.value);
                      return (
                        <button
                          key={segment.value}
                          type="button"
                          onClick={() =>
                            updateFormData({
                              targetSegments: toggleArrayItem(formData.targetSegments, segment.value),
                            })
                          }
                          className={`badge-status rounded-lg px-4 py-2 transition-all ${
                            isSelected
                              ? "badge-status-active"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {segment.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sales Channels */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    {t("promotions.form.targetChannels", "Sales Channels")} *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CHANNELS.map((channel) => {
                      const isSelected = formData.targetChannels.includes(channel.value);
                      return (
                        <button
                          key={channel.value}
                          type="button"
                          onClick={() =>
                            updateFormData({
                              targetChannels: toggleArrayItem(formData.targetChannels, channel.value),
                            })
                          }
                          className={`badge-status rounded-lg px-4 py-2 transition-all ${
                            isSelected
                              ? "badge-status-active"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {channel.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Advanced Options */}
                <div className="rounded-xl border bg-muted/30 p-4">
                  <h4 className="mb-4 font-medium">
                    {t("promotions.form.advancedOptions", "Advanced Options")}
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {t("promotions.form.stackable", "Stackable")}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t("promotions.form.stackableHelp", "Allow combining with other promotions")}
                        </div>
                      </div>
                      <Switch
                        checked={formData.stackable}
                        onCheckedChange={(checked) => updateFormData({ stackable: checked })}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {t("promotions.form.minPurchase", "Min. Purchase (VND)")}
                        </label>
                        <Input
                          type="number"
                          value={formData.minPurchaseAmount || ""}
                          onChange={(e) =>
                            updateFormData({
                              minPurchaseAmount: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {t("promotions.form.maxDiscount", "Max. Discount (VND)")}
                        </label>
                        <Input
                          type="number"
                          value={formData.maxDiscountAmount || ""}
                          onChange={(e) =>
                            updateFormData({
                              maxDiscountAmount: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          placeholder="No limit"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Schedule */}
          {currentStep === 2 && (
            <Card className="card-premium">
              <CardHeader>
                <CardTitle>{t("promotions.form.schedule", "Schedule")}</CardTitle>
                <CardDescription>
                  {t("promotions.form.scheduleDesc", "Set when this promotion should be active")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t("promotions.form.startDate", "Start Date")} *
                    </label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => updateFormData({ startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t("promotions.form.endDate", "End Date")} *
                    </label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => updateFormData({ endDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Duration Preview */}
                <div className="rounded-xl border bg-primary/5 p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">
                        {t("promotions.form.duration", "Duration")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {Math.ceil(
                          (new Date(formData.endDate).getTime() -
                            new Date(formData.startDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        {t("promotions.form.days", "days")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("promotions.form.priority", "Priority")}
                  </label>
                  <Select
                    value={String(formData.priority)}
                    onValueChange={(value) => updateFormData({ priority: Number(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">
                        {t("promotions.form.priorityLow", "1 - Low")}
                      </SelectItem>
                      <SelectItem value="2">
                        {t("promotions.form.priorityMedium", "2 - Medium")}
                      </SelectItem>
                      <SelectItem value="3">
                        {t("promotions.form.priorityHigh", "3 - High")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {t("promotions.form.priorityHelp", "Higher priority promotions are applied first when multiple apply")}
                  </p>
                </div>

                {/* Tip */}
                <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-amber-800">
                  <Lightbulb className="mt-0.5 h-5 w-5 flex-shrink-0" />
                  <div className="text-sm">
                    <strong>{t("promotions.form.tip", "Tip")}:</strong>{" "}
                    {t(
                      "promotions.form.scheduleTip",
                      "Avoid overlapping dates with similar promotions to prevent conflicts. The system will alert you if conflicts are detected."
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Review */}
          {currentStep === 3 && (
            <Card className="card-premium">
              <CardHeader>
                <CardTitle>{t("promotions.form.review", "Review & Confirm")}</CardTitle>
                <CardDescription>
                  {t("promotions.form.reviewDesc", "Review your promotion before creating")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between rounded-lg border p-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {t("promotions.form.name", "Name")}
                      </div>
                      <div className="text-lg font-semibold">{formData.name}</div>
                    </div>
                    <Badge className={`badge-type-${formData.type}`}>
                      {formData.type}
                    </Badge>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="text-sm text-muted-foreground">
                      {t("promotions.form.description", "Description")}
                    </div>
                    <div className="mt-1">{formData.description}</div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border p-4">
                      <div className="text-sm text-muted-foreground">
                        {t("promotions.form.discount", "Discount")}
                      </div>
                      <div className="mt-1 text-2xl font-bold">
                        {formData.discountType === "percentage"
                          ? `${formData.discountValue}%`
                          : `${formData.discountValue.toLocaleString()} ₫`}
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-sm text-muted-foreground">
                        {t("promotions.form.duration", "Duration")}
                      </div>
                      <div className="mt-1 font-medium">
                        {new Date(formData.startDate).toLocaleDateString()} -{" "}
                        {new Date(formData.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="text-sm text-muted-foreground mb-2">
                      {t("promotions.form.targeting", "Targeting")}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.targetSegments.map((seg) => (
                        <Badge key={seg} variant="secondary">
                          {SEGMENTS.find((s) => s.value === seg)?.label || seg}
                        </Badge>
                      ))}
                      {formData.targetChannels.map((ch) => (
                        <Badge key={ch} variant="outline">
                          {CHANNELS.find((c) => c.value === ch)?.label || ch}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-amber-800">
                  <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                  <div className="text-sm">
                    {t(
                      "promotions.form.reviewWarning",
                      "After creation, the system will automatically check for conflicts with existing promotions."
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="mt-6 flex items-center justify-between">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {currentStep === 0 ? t("common.cancel", "Cancel") : t("guide.back", "Back")}
            </Button>

            <div className="flex gap-3">
              {currentStep === STEPS.length - 1 ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleSubmit(true)}
                    disabled={isSubmitting}
                  >
                    {t("promotions.saveAsDraft", "Save as Draft")}
                  </Button>
                  <Button
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmitting}
                    className="btn-premium gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    {t("promotions.createAndActivate", "Create & Activate")}
                  </Button>
                </>
              ) : (
                <Button onClick={handleNext} disabled={!canProceed()}>
                  {t("guide.next", "Next")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
