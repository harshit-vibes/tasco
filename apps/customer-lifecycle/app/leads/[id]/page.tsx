"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@tasco/ui";
import {
  ArrowLeft,
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
  FileText,
  Activity,
  ChevronRight,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  MoreHorizontal,
  DollarSign,
} from "@tasco/ui/icons";
import type { Lead, Interaction, AIRecommendation } from "../../../lib/data-layer";

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "activity" | "insights">("overview");

  useEffect(() => {
    async function loadLeadData() {
      try {
        const response = await fetch(`/api/leads/${leadId}`);
        const data = await response.json();

        if (data.success && data.lead) {
          setLead(data.lead);
          setInteractions(data.interactions || []);
          setRecommendations(data.recommendations || []);
        }
      } catch (error) {
        console.error("Error loading lead:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadLeadData();
  }, [leadId]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-brand animate-pulse" />
            <User className="absolute inset-0 m-auto h-8 w-8 text-white" />
          </div>
          <p className="mt-6 text-sm font-medium text-muted-foreground">Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="mt-6 text-xl font-semibold">Lead Not Found</h2>
        <p className="mt-2 text-muted-foreground">The lead you're looking for doesn't exist.</p>
        <Button onClick={() => router.push("/leads")} className="mt-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Leads
        </Button>
      </div>
    );
  }

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

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="border-b bg-card/50 backdrop-blur-xl px-6 py-6 md:px-8">
          <div className="mx-auto max-w-6xl">
            {/* Back Button */}
            <button
              onClick={() => router.push("/leads")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 animate-fade-in-up"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Lead Inbox
            </button>

            {/* Lead Header */}
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between animate-fade-in-up" style={{ animationDelay: "50ms" }}>
              <div className="flex items-start gap-5">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl font-bold text-2xl text-white shadow-xl ${
                  lead.priority === "hot"
                    ? "bg-gradient-to-br from-red-500 to-orange-500"
                    : lead.priority === "warm"
                      ? "bg-gradient-to-br from-amber-500 to-yellow-500"
                      : "bg-gradient-to-br from-blue-500 to-cyan-500"
                }`}>
                  {lead.customer.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="font-display text-2xl font-bold">{lead.customer.name}</h1>
                    <span className={`priority-badge ${lead.priority}`}>
                      {lead.priority}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-4 w-4" />
                      {lead.customer.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-4 w-4" />
                      {lead.customer.phone}
                    </span>
                    {lead.customer.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {lead.customer.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="gap-2">
                  <Phone className="h-4 w-4" />
                  Call
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
                <Button className="gap-2 bg-gradient-brand shadow-lg hover:opacity-90">
                  <Calendar className="h-4 w-4" />
                  Schedule
                </Button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <div className="flex items-center gap-3 rounded-xl border bg-card/50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 shadow-md">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Lead Score</p>
                  <p className="font-display text-xl font-bold">{lead.score}/100</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border bg-card/50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 shadow-md">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Interactions</p>
                  <p className="font-display text-xl font-bold">{interactions.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border bg-card/50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-display text-xl font-bold capitalize">{lead.status}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border bg-card/50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="font-display text-sm font-bold">
                    {new Date(lead.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-6 flex items-center gap-1 border-b animate-fade-in-up" style={{ animationDelay: "150ms" }}>
              {(["overview", "activity", "insights"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-[2px] ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-6xl px-6 py-6 md:px-8">
          {activeTab === "overview" && (
            <div className="grid gap-6 lg:grid-cols-3 animate-fade-in-up">
              {/* Interest Details */}
              <Card className="card-glass lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display">
                    <Car className="h-5 w-5 text-primary" />
                    Interest Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Interested Brands</p>
                      <div className="flex flex-wrap gap-2">
                        {lead.interest.brands.map((brand) => (
                          <span
                            key={brand}
                            className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
                          >
                            {brand}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Vehicle Types</p>
                      <div className="flex flex-wrap gap-2">
                        {lead.interest.vehicleTypes.map((type) => (
                          <span
                            key={type}
                            className="px-3 py-1.5 rounded-full bg-muted text-sm font-medium"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Budget Range</p>
                        <p className="font-semibold">
                          {lead.interest.budget}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Purchase Timeline</p>
                        <p className="font-semibold capitalize">{lead.interest.timeline}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lead Source & Assignment */}
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display">
                    <Target className="h-5 w-5 text-primary" />
                    Lead Info
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Source</p>
                      <p className="font-medium capitalize">{lead.source}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Assigned To</p>
                      <p className="font-medium">{lead.assignedTo || "Unassigned"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Entity</p>
                      <p className="font-medium">{lead.entityId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Updated</p>
                      <p className="font-medium">
                        {new Date(lead.updatedAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Lead Score */}
              <Card className="card-glass lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Lead Score Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-4">
                    {/* Score Circle */}
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative h-32 w-32">
                        <svg className="h-32 w-32 -rotate-90 transform">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-muted"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="url(#scoreGradient)"
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${(lead.score / 100) * 352} 352`}
                          />
                          <defs>
                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#8B5CF6" />
                              <stop offset="100%" stopColor="#06B6D4" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="font-display text-4xl font-bold">{lead.score}</span>
                          <span className="text-xs text-muted-foreground">/ 100</span>
                        </div>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="md:col-span-3 grid gap-4 md:grid-cols-3">
                      <div className="rounded-xl border p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Engagement</span>
                          <span className="text-sm font-bold text-emerald-600">High</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: "85%" }} />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">Active interactions and quick responses</p>
                      </div>
                      <div className="rounded-xl border p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Budget Fit</span>
                          <span className="text-sm font-bold text-blue-600">Good</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: "75%" }} />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">Budget aligns with available inventory</p>
                      </div>
                      <div className="rounded-xl border p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Timeline</span>
                          <span className="text-sm font-bold text-violet-600">Urgent</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500" style={{ width: "90%" }} />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">Ready to purchase within {lead.interest.timeline}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="animate-fade-in-up">
              <Card className="card-glass">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 font-display">
                      <Activity className="h-5 w-5 text-primary" />
                      Activity Timeline
                    </CardTitle>
                    <Button size="sm" variant="outline" className="gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Log Activity
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {interactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                        <Activity className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="mt-4 font-medium">No activities yet</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Start by logging your first interaction with this lead
                      </p>
                    </div>
                  ) : (
                    <div className="timeline">
                      {interactions.map((interaction, index) => {
                        const Icon = getInteractionIcon(interaction.type);
                        const colorClass = getInteractionColor(interaction.type);
                        return (
                          <div
                            key={interaction.id}
                            className="timeline-item animate-fade-in-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className={`timeline-dot bg-gradient-to-br ${colorClass}`}>
                              <Icon className="h-3.5 w-3.5 text-white" />
                            </div>
                            <div className="timeline-content">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium capitalize">{interaction.type}</p>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {interaction.notes}
                                  </p>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(interaction.timestamp).toLocaleDateString("vi-VN")}
                                </span>
                              </div>
                              {interaction.sentiment && (
                                <div className="mt-2 flex items-center gap-2">
                                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                    interaction.sentiment === "positive"
                                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                      : interaction.sentiment === "negative"
                                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                        : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                                  }`}>
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
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "insights" && (
            <div className="grid gap-6 lg:grid-cols-2 animate-fade-in-up">
              {/* AI Recommendations */}
              <Card className="ai-insight-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand shadow-lg">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="font-display">AI Recommendations</CardTitle>
                        <p className="text-sm text-muted-foreground">Powered by Lyzr AI</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {recommendations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/30">
                        <Sparkles className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                      </div>
                      <p className="mt-4 font-medium">No recommendations yet</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        AI insights will appear as more data is collected
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recommendations.map((rec, index) => (
                        <div
                          key={rec.id}
                          className="rounded-xl border border-violet-200/50 dark:border-violet-800/30 bg-gradient-to-r from-violet-50/50 to-transparent dark:from-violet-950/20 p-4 transition-all hover:shadow-md animate-fade-in-up"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 flex-shrink-0">
                              <TrendingUp className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{rec.title}</p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {rec.description}
                              </p>
                              <div className="mt-3 flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                                      style={{ width: `${rec.confidence * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                    {(rec.confidence * 100).toFixed(0)}%
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                                  {rec.type.replace(/_/g, " ")}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recommended Actions */}
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display">
                    <Target className="h-5 w-5 text-primary" />
                    Recommended Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-xl border-2 border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 transition-all hover:shadow-md">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Schedule Test Drive</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Lead shows high interest in {lead.interest.brands[0]} models
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border-2 border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/20 p-4 transition-all hover:shadow-md">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Send Financing Options</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Budget range matches available financing plans
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border-2 border-violet-200 dark:border-violet-800/50 bg-violet-50/50 dark:bg-violet-950/20 p-4 transition-all hover:shadow-md">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Follow Up This Week</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Timeline indicates purchase within {lead.interest.timeline}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
