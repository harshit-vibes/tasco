"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Skeleton,
} from "@tasco/ui";
import {
  Car,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  ArrowRight,
  BarChart3,
  Shield,
  Target,
  Flame,
} from "@tasco/ui/icons";

// Types for dashboard data
interface DashboardStats {
  quotesToday: number;
  quotesChange: number;
  conversionRate: number;
  conversionChange: number;
  avgPremium: number;
  premiumChange: number;
  pendingReview: number;
}

interface RecentQuote {
  id: string;
  customerName: string;
  vehicleInfo: string;
  premium: number;
  status: "pending" | "approved" | "rejected" | "accepted";
  riskLevel: "low" | "standard" | "high";
  createdAt: string;
}

interface AIInsight {
  id: string;
  type: "recommendation" | "alert" | "trend";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

// Mock data for demonstration
const mockStats: DashboardStats = {
  quotesToday: 24,
  quotesChange: 12,
  conversionRate: 68,
  conversionChange: 5,
  avgPremium: 15500000,
  premiumChange: -3,
  pendingReview: 8,
};

const mockRecentQuotes: RecentQuote[] = [
  {
    id: "Q-2025-001",
    customerName: "Nguyen Van A",
    vehicleInfo: "Toyota Camry 2023",
    premium: 18500000,
    status: "pending",
    riskLevel: "low",
    createdAt: "10 mins ago",
  },
  {
    id: "Q-2025-002",
    customerName: "Tran Thi B",
    vehicleInfo: "Honda CR-V 2024",
    premium: 22000000,
    status: "approved",
    riskLevel: "standard",
    createdAt: "25 mins ago",
  },
  {
    id: "Q-2025-003",
    customerName: "Le Van C",
    vehicleInfo: "Ford Ranger 2022",
    premium: 28500000,
    status: "pending",
    riskLevel: "high",
    createdAt: "1 hour ago",
  },
  {
    id: "Q-2025-004",
    customerName: "Pham Thi D",
    vehicleInfo: "Mazda CX-5 2024",
    premium: 19800000,
    status: "accepted",
    riskLevel: "low",
    createdAt: "2 hours ago",
  },
];

const mockInsights: AIInsight[] = [
  {
    id: "1",
    type: "recommendation",
    title: "Consider premium increase for commercial vehicles",
    description:
      "Loss ratio for commercial vehicles increased by 8% last quarter. Recommend 5% premium adjustment.",
    priority: "high",
  },
  {
    id: "2",
    type: "trend",
    title: "SUV quotes up 15% this month",
    description:
      "Strong demand for SUV insurance. Current conversion rate is above average at 72%.",
    priority: "medium",
  },
  {
    id: "3",
    type: "alert",
    title: "High-risk segment needs attention",
    description:
      "3 pending quotes flagged as high-risk. Review recommended before approval.",
    priority: "high",
  },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  suffix = "",
  prefix = "",
}: {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  suffix?: string;
  prefix?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {prefix}
          {value}
          {suffix}
        </div>
        {change !== undefined && (
          <p
            className={`mt-1 flex items-center text-xs ${
              change >= 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {change >= 0 ? (
              <TrendingUp className="mr-1 h-3 w-3" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3" />
            )}
            {change >= 0 ? "+" : ""}
            {change}% from last week
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function QuoteStatusBadge({ status }: { status: RecentQuote["status"] }) {
  const variants = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    approved: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    accepted: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  };

  return (
    <Badge className={variants[status]} variant="secondary">
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function RiskBadge({ level }: { level: RecentQuote["riskLevel"] }) {
  const variants = {
    low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    standard: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  const icons = {
    low: Shield,
    standard: Target,
    high: Flame,
  };

  const Icon = icons[level];

  return (
    <Badge className={variants[level]} variant="secondary">
      <Icon className="mr-1 h-3 w-3" />
      {level.charAt(0).toUpperCase() + level.slice(1)} Risk
    </Badge>
  );
}

function InsightIcon({ type }: { type: AIInsight["type"] }) {
  const icons = {
    recommendation: DollarSign,
    alert: AlertTriangle,
    trend: TrendingUp,
  };
  const colors = {
    recommendation: "text-emerald-600",
    alert: "text-amber-600",
    trend: "text-blue-600",
  };

  const Icon = icons[type];
  return <Icon className={`h-5 w-5 ${colors[type]}`} />;
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentQuotes, setRecentQuotes] = useState<RecentQuote[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setStats(mockStats);
      setRecentQuotes(mockRecentQuotes);
      setInsights(mockInsights);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          AI-powered sales and pricing cockpit overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="mt-2 h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatCard
              title="Quotes Today"
              value={stats?.quotesToday || 0}
              change={stats?.quotesChange}
              icon={Car}
            />
            <StatCard
              title="Conversion Rate"
              value={stats?.conversionRate || 0}
              suffix="%"
              change={stats?.conversionChange}
              icon={Target}
            />
            <StatCard
              title="Avg Premium"
              value={formatCurrency(stats?.avgPremium || 0)}
              change={stats?.premiumChange}
              icon={DollarSign}
            />
            <StatCard
              title="Pending Review"
              value={stats?.pendingReview || 0}
              icon={Clock}
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/quote">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Car className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">New Quote</h3>
                <p className="text-sm text-muted-foreground">
                  Generate instant vehicle insurance quote
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/chat">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-sm text-muted-foreground">
                  Ask pricing questions & get recommendations
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/analytics">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  View pricing trends & performance metrics
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Quotes */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Quotes</CardTitle>
              <CardDescription>Latest insurance quotes generated</CardDescription>
            </div>
            <Link href="/history">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentQuotes.map((quote) => (
                  <div
                    key={quote.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <Car className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{quote.customerName}</span>
                          <span className="text-sm text-muted-foreground">
                            {quote.id}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {quote.vehicleInfo}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-emerald-600">
                          {formatCurrency(quote.premium)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {quote.createdAt}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <QuoteStatusBadge status={quote.status} />
                        <RiskBadge level={quote.riskLevel} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-emerald-600" />
              AI Insights
            </CardTitle>
            <CardDescription>
              Recommendations and alerts from AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div
                    key={insight.id}
                    className={`rounded-lg border p-4 ${
                      insight.priority === "high"
                        ? "border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-900/10"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <InsightIcon type={insight.type} />
                      <div>
                        <h4 className="text-sm font-medium">{insight.title}</h4>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                <Link href="/chat">
                  <Button variant="outline" className="w-full" size="sm">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Ask AI for more insights
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
