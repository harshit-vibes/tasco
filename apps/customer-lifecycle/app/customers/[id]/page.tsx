"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button, Badge } from "@tasco/ui";
import {
  ArrowLeft,
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
  FileText,
  Wrench,
  Gift,
  Send,
  ChevronRight,
  Activity,
  Heart,
  BarChart3,
} from "@tasco/ui/icons";
import {
  getCustomerById,
  getPurchasesByCustomerId,
  getInteractionsByCustomerId,
  type Customer,
  type Purchase,
  type Interaction,
} from "../../../lib/data-layer";
import { useTranslation } from "@tasco/i18n";

type TabType = "overview" | "history" | "insights";

export default function CustomerDetailPage() {
  const { t } = useTranslation("app");
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  useEffect(() => {
    async function loadCustomerData() {
      try {
        const customerData = await getCustomerById(customerId);
        if (!customerData) {
          router.push("/customers");
          return;
        }

        const purchasesData = await getPurchasesByCustomerId(customerId);
        const interactionsData = await getInteractionsByCustomerId(customerId);

        setCustomer(customerData);
        setPurchases(purchasesData);
        setInteractions(interactionsData);
      } catch (error) {
        console.error("Error loading customer data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCustomerData();
  }, [customerId, router]);

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
      case "phone":
        return Phone;
      case "email":
        return Mail;
      case "in-person":
        return User;
      case "chat":
        return MessageSquare;
      default:
        return MessageSquare;
    }
  };

  const getInteractionColor = (type: string) => {
    switch (type) {
      case "purchase":
        return "from-emerald-500 to-green-500";
      case "service":
        return "from-blue-500 to-indigo-500";
      case "inquiry":
        return "from-amber-500 to-orange-500";
      case "complaint":
        return "from-rose-500 to-red-500";
      case "follow-up":
        return "from-violet-500 to-purple-500";
      default:
        return "from-slate-500 to-slate-600";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
            <div className="absolute inset-0 flex items-center justify-center">
              <User className="h-6 w-6 text-violet-600" />
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground font-medium">
            Loading customer profile...
          </p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
            <User className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-xl font-semibold font-display">Customer Not Found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The customer you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/customers">
            <Button className="mt-6" variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Customers
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const segmentConfig = getSegmentConfig(customer.insights.segment);
  const SegmentIcon = segmentConfig.icon;
  const churnRiskPercentage = Math.round(customer.insights.churnRisk * 100);
  const churnRiskLevel =
    customer.insights.churnRisk > 0.7
      ? "high"
      : customer.insights.churnRisk > 0.4
        ? "medium"
        : "low";
  const satisfactionPercentage = customer.insights.satisfactionScore;
  const totalSpent = purchases.reduce((sum, p) => sum + p.amount, 0);

  const tabs = [
    { id: "overview" as TabType, label: "Overview", icon: User },
    { id: "history" as TabType, label: "History", icon: Clock },
    { id: "insights" as TabType, label: "AI Insights", icon: Sparkles },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-8 md:px-8">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute -right-20 -top-20 h-80 w-80 rounded-full bg-gradient-to-br ${segmentConfig.gradient} opacity-10 blur-3xl`} />
          <div className="absolute -left-20 bottom-0 h-60 w-60 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 opacity-10 blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative mx-auto max-w-7xl">
          {/* Back button */}
          <Link
            href="/customers"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Customers
          </Link>

          {/* Customer Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div className={`relative flex h-20 w-20 items-center justify-center rounded-2xl ${segmentConfig.bgClass} text-3xl font-bold text-white shadow-lg animate-fade-in-up`}>
                {customer.profile.name.charAt(0)}
                {customer.insights.segment === "vip" && (
                  <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 shadow-md">
                    <Crown className="h-3.5 w-3.5 text-amber-900" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="animate-fade-in-up delay-75">
                <h1 className="text-2xl md:text-3xl font-bold text-white font-display">
                  {customer.profile.name}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full ${segmentConfig.bgClass} px-3 py-1 text-xs font-semibold text-white`}>
                    <SegmentIcon className="h-3 w-3" />
                    {segmentConfig.label}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                    {customer.lifecycle.stage}
                  </span>
                  {churnRiskLevel === "high" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-medium text-rose-300">
                      <AlertTriangle className="h-3 w-3" />
                      High Churn Risk
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm text-white/60">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Customer since {formatDate(customer.lifecycle.firstPurchaseDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 animate-fade-in-up delay-150">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10"
              >
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10"
              >
                <Phone className="mr-2 h-4 w-4" />
                Call
              </Button>
              <Button size="sm" className="bg-gradient-brand text-white shadow-md">
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4 animate-fade-in-up delay-200">
            {[
              {
                label: "Lifetime Value",
                value: formatCurrency(customer.insights.lifetimeValue),
                icon: DollarSign,
                color: "text-emerald-400",
              },
              {
                label: "Total Purchases",
                value: customer.insights.totalPurchases.toString(),
                icon: ShoppingCart,
                color: "text-blue-400",
              },
              {
                label: "Avg. Order",
                value: formatCurrency(customer.insights.averageOrderValue),
                icon: TrendingUp,
                color: "text-violet-400",
              },
              {
                label: "Satisfaction",
                value: `${satisfactionPercentage}%`,
                icon: Heart,
                color: "text-rose-400",
              },
              {
                label: "Churn Risk",
                value: `${churnRiskPercentage}%`,
                icon: Activity,
                color:
                  churnRiskLevel === "high"
                    ? "text-rose-400"
                    : churnRiskLevel === "medium"
                      ? "text-amber-400"
                      : "text-emerald-400",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50">{stat.label}</span>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <p className="mt-1 text-xl font-bold text-white font-display">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b bg-card/50 px-6 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-[1px] ${
                  activeTab === tab.id
                    ? "border-violet-600 text-violet-600"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-mesh px-6 py-6 md:px-8">
        <div className="mx-auto max-w-7xl">
          {activeTab === "overview" && (
            <div className="grid gap-6 lg:grid-cols-3 animate-fade-in-up">
              {/* Left Column */}
              <div className="space-y-6 lg:col-span-2">
                {/* Contact Information */}
                <div className="card-elevated p-6">
                  <h3 className="text-lg font-semibold font-display mb-4">Contact Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      { icon: Mail, label: "Email", value: customer.profile.email },
                      { icon: Phone, label: "Phone", value: customer.profile.phone },
                      { icon: MapPin, label: "Location", value: customer.profile.location },
                      { icon: Calendar, label: "Date of Birth", value: formatDate(customer.profile.dateOfBirth) },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/10 to-indigo-500/10">
                          <item.icon className="h-5 w-5 text-violet-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                          <p className="text-sm font-medium">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vehicle Ownership */}
                <div className="card-elevated p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold font-display">Vehicle Ownership</h3>
                    <span className="text-sm text-muted-foreground">{purchases.length} vehicles</span>
                  </div>
                  {purchases.length === 0 ? (
                    <div className="text-center py-8">
                      <Car className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                      <p className="mt-3 text-sm text-muted-foreground">No vehicles purchased yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {purchases.map((purchase, index) => (
                        <div
                          key={purchase.id}
                          className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-md transition-all animate-fade-in-up"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 shadow-lg">
                            <Car className="h-7 w-7 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{purchase.vehicleModel}</p>
                            <p className="text-sm text-muted-foreground">
                              {purchase.brand} • {purchase.year}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-emerald-600">{formatCurrency(purchase.amount)}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(purchase.purchaseDate)}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preferences */}
                <div className="card-elevated p-6">
                  <h3 className="text-lg font-semibold font-display mb-4">Preferences</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Preferred Brands</p>
                      <div className="flex flex-wrap gap-2">
                        {customer.preferences.brands.map((brand) => (
                          <span
                            key={brand}
                            className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-sm font-medium"
                          >
                            <Car className="h-3.5 w-3.5" />
                            {brand}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Communication Channels</p>
                      <div className="flex flex-wrap gap-2">
                        {customer.preferences.communicationChannels.map((channel) => {
                          const Icon = getChannelIcon(channel);
                          return (
                            <span
                              key={channel}
                              className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 px-3 py-1.5 text-sm font-medium text-violet-700 dark:text-violet-300"
                            >
                              <Icon className="h-3.5 w-3.5" />
                              {channel}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Service Interests</p>
                      <div className="flex flex-wrap gap-2">
                        {customer.preferences.serviceInterests.map((service) => (
                          <span
                            key={service}
                            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300"
                          >
                            <Wrench className="h-3.5 w-3.5" />
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Satisfaction Gauge */}
                <div className="card-elevated p-6">
                  <h3 className="text-lg font-semibold font-display mb-4">Satisfaction Score</h3>
                  <div className="flex justify-center">
                    <div className="relative h-36 w-36">
                      <svg className="h-36 w-36 -rotate-90 transform">
                        <circle
                          cx="72"
                          cy="72"
                          r="60"
                          stroke="currentColor"
                          strokeWidth="10"
                          fill="none"
                          className="text-muted/30"
                        />
                        <circle
                          cx="72"
                          cy="72"
                          r="60"
                          stroke="url(#satisfactionGradient)"
                          strokeWidth="10"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${(satisfactionPercentage / 100) * 377} 377`}
                        />
                        <defs>
                          <linearGradient id="satisfactionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10B981" />
                            <stop offset="100%" stopColor="#06B6D4" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold font-display">{satisfactionPercentage}%</span>
                        <span className="text-xs text-muted-foreground">Satisfaction</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <div className="flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      <Heart className="h-4 w-4" />
                      {satisfactionPercentage >= 80 ? "Highly Satisfied" : satisfactionPercentage >= 60 ? "Satisfied" : "Needs Attention"}
                    </div>
                  </div>
                </div>

                {/* Churn Risk */}
                <div
                  className={`card-elevated p-6 ${
                    churnRiskLevel === "high"
                      ? "ring-2 ring-rose-500/20"
                      : ""
                  }`}
                >
                  <h3 className="text-lg font-semibold font-display mb-4 flex items-center gap-2">
                    <Activity className={`h-5 w-5 ${
                      churnRiskLevel === "high" ? "text-rose-500" :
                      churnRiskLevel === "medium" ? "text-amber-500" : "text-emerald-500"
                    }`} />
                    Churn Risk
                  </h3>
                  <div className="flex justify-center">
                    <div className="relative h-36 w-36">
                      <svg className="h-36 w-36 -rotate-90 transform">
                        <circle
                          cx="72"
                          cy="72"
                          r="60"
                          stroke="currentColor"
                          strokeWidth="10"
                          fill="none"
                          className="text-muted/30"
                        />
                        <circle
                          cx="72"
                          cy="72"
                          r="60"
                          stroke={
                            churnRiskLevel === "high" ? "#F43F5E" :
                            churnRiskLevel === "medium" ? "#F59E0B" : "#10B981"
                          }
                          strokeWidth="10"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${(churnRiskPercentage / 100) * 377} 377`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl font-bold font-display ${
                          churnRiskLevel === "high" ? "text-rose-500" :
                          churnRiskLevel === "medium" ? "text-amber-500" : "text-emerald-500"
                        }`}>
                          {churnRiskPercentage}%
                        </span>
                        <span className="text-xs text-muted-foreground">Risk Level</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-center text-muted-foreground">
                    {churnRiskLevel === "high"
                      ? "Immediate action recommended"
                      : churnRiskLevel === "medium"
                        ? "Monitor closely"
                        : "Low risk, maintain engagement"}
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="card-elevated p-6">
                  <h3 className="text-lg font-semibold font-display mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    {[
                      { icon: MessageSquare, label: "Log Interaction", color: "text-blue-600" },
                      { icon: Calendar, label: "Schedule Service", color: "text-violet-600" },
                      { icon: Gift, label: "Send Offer", color: "text-emerald-600" },
                      { icon: FileText, label: "View Documents", color: "text-amber-600" },
                    ].map((action) => (
                      <button
                        key={action.label}
                        className="flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all hover:bg-muted/50 hover:shadow-md"
                      >
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50 ${action.color}`}>
                          <action.icon className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium">{action.label}</span>
                        <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="animate-fade-in-up">
              <div className="card-elevated p-6">
                <h3 className="text-lg font-semibold font-display mb-6">Interaction Timeline</h3>
                {interactions.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                    <p className="mt-3 text-sm text-muted-foreground">No interactions recorded</p>
                  </div>
                ) : (
                  <div className="timeline">
                    {interactions.map((interaction, index) => {
                      const Icon = getChannelIcon(interaction.channel);
                      const colorClass = getInteractionColor(interaction.type);
                      return (
                        <div
                          key={interaction.id}
                          className="timeline-item animate-fade-in-up"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className={`absolute -left-[1.625rem] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${colorClass} shadow-md`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="ml-4 rounded-xl border bg-card p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="font-semibold capitalize">{interaction.type}</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {interaction.notes}
                                </p>
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDate(interaction.timestamp)}
                              </span>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium capitalize">
                                {interaction.channel}
                              </span>
                              {interaction.sentiment && (
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  interaction.sentiment === "positive"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                    : interaction.sentiment === "negative"
                                      ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                }`}>
                                  {interaction.sentiment} sentiment
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
            </div>
          )}

          {activeTab === "insights" && (
            <div className="grid gap-6 lg:grid-cols-2 animate-fade-in-up">
              {/* AI Recommendations */}
              <div className="card-elevated p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold font-display">Next Best Actions</h3>
                </div>
                {customer.insights.recommendedActions && customer.insights.recommendedActions.length > 0 ? (
                  <div className="space-y-3">
                    {customer.insights.recommendedActions.map((action, index) => (
                      <div
                        key={index}
                        className="ai-insight animate-fade-in-up"
                        style={{ animationDelay: `${index * 75}ms` }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20">
                            <Target className="h-4 w-4 text-violet-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{action}</p>
                            <Button size="sm" variant="ghost" className="mt-2 h-7 text-xs text-violet-600">
                              <Send className="mr-1.5 h-3 w-3" />
                              Take Action
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                    <p className="mt-3 text-sm text-muted-foreground">No recommendations available</p>
                  </div>
                )}
              </div>

              {/* Customer Insights Summary */}
              <div className="card-elevated p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold font-display">Customer Insights</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Engagement Level</span>
                      <span className="text-sm font-semibold text-emerald-600">High</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Purchase Frequency</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {customer.insights.totalPurchases > 2 ? "Frequent" : customer.insights.totalPurchases > 0 ? "Occasional" : "None"}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                        style={{ width: `${Math.min(customer.insights.totalPurchases * 25, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Loyalty Score</span>
                      <span className="text-sm font-semibold text-violet-600">
                        {customer.insights.segment === "vip" ? "Platinum" : "Silver"}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-brand"
                        style={{ width: customer.insights.segment === "vip" ? "100%" : "50%" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl border-2 border-dashed border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-900/10">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-violet-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-violet-900 dark:text-violet-100">AI Summary</p>
                      <p className="mt-1 text-sm text-violet-700 dark:text-violet-300">
                        {customer.profile.name} is a {customer.insights.segment} customer with{" "}
                        {customer.insights.churnRisk > 0.5 ? "elevated" : "low"} churn risk.{" "}
                        {customer.insights.segment === "vip"
                          ? "Consider exclusive VIP offers to maintain loyalty."
                          : customer.insights.churnRisk > 0.5
                            ? "Recommend proactive engagement to improve retention."
                            : "Continue regular engagement to build loyalty."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
