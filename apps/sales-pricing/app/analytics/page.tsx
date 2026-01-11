"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from "@tasco/ui";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Car,
  Users,
  Target,
  Calendar,
  ArrowUpDown,
} from "@tasco/ui/icons";

// Mock analytics data
const monthlyData = [
  { month: "Jul", quotes: 180, conversions: 122, premium: 2.1, lossRatio: 62 },
  { month: "Aug", quotes: 195, conversions: 128, premium: 2.3, lossRatio: 58 },
  { month: "Sep", quotes: 210, conversions: 147, premium: 2.8, lossRatio: 55 },
  { month: "Oct", quotes: 225, conversions: 158, premium: 3.0, lossRatio: 52 },
  { month: "Nov", quotes: 248, conversions: 169, premium: 3.2, lossRatio: 54 },
  { month: "Dec", quotes: 265, conversions: 185, premium: 3.5, lossRatio: 51 },
];

const vehicleTypeStats = [
  { type: "Sedan", quotes: 420, premium: 15.2, share: 35 },
  { type: "SUV", quotes: 380, premium: 18.5, share: 32 },
  { type: "Commercial", quotes: 180, premium: 28.0, share: 15 },
  { type: "Pickup", quotes: 120, premium: 22.0, share: 10 },
  { type: "Other", quotes: 100, premium: 12.0, share: 8 },
];

const riskDistribution = [
  { level: "Low Risk", count: 485, percentage: 42, color: "bg-emerald-500" },
  { level: "Standard Risk", count: 520, percentage: 45, color: "bg-blue-500" },
  { level: "High Risk", count: 150, percentage: 13, color: "bg-red-500" },
];

function formatCurrency(value: number, unit: string = "B"): string {
  return `${value.toFixed(1)}${unit} VND`;
}

function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = "text-emerald-600",
  bgColor = "bg-emerald-100 dark:bg-emerald-900/30",
}: {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  bgColor?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
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
                {change}% {changeLabel || "vs last month"}
              </p>
            )}
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bgColor}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("6m");

  // Calculate totals
  const totalQuotes = monthlyData.reduce((sum, m) => sum + m.quotes, 0);
  const totalConversions = monthlyData.reduce((sum, m) => sum + m.conversions, 0);
  const avgConversionRate = Math.round((totalConversions / totalQuotes) * 100);
  const totalPremium = monthlyData.reduce((sum, m) => sum + m.premium, 0);
  const avgLossRatio = Math.round(
    monthlyData.reduce((sum, m) => sum + m.lossRatio, 0) / monthlyData.length
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Performance metrics and pricing insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={timeRange === "1m" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("1m")}
          >
            1M
          </Button>
          <Button
            variant={timeRange === "3m" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("3m")}
          >
            3M
          </Button>
          <Button
            variant={timeRange === "6m" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("6m")}
            className={timeRange === "6m" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          >
            6M
          </Button>
          <Button
            variant={timeRange === "1y" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("1y")}
          >
            1Y
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Quotes"
          value={totalQuotes.toLocaleString()}
          change={12}
          icon={Car}
        />
        <StatCard
          title="Conversion Rate"
          value={`${avgConversionRate}%`}
          change={5}
          icon={Target}
          iconColor="text-blue-600"
          bgColor="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatCard
          title="Total Premium"
          value={formatCurrency(totalPremium)}
          change={18}
          icon={DollarSign}
          iconColor="text-purple-600"
          bgColor="bg-purple-100 dark:bg-purple-900/30"
        />
        <StatCard
          title="Loss Ratio"
          value={`${avgLossRatio}%`}
          change={-8}
          changeLabel="(lower is better)"
          icon={BarChart3}
          iconColor="text-amber-600"
          bgColor="bg-amber-100 dark:bg-amber-900/30"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
            <CardDescription>Quotes and conversions over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((month, index) => (
                <div key={month.month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{month.month} 2024</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        {month.quotes} quotes
                      </span>
                      <span className="text-emerald-600 font-medium">
                        {month.conversions} converted
                      </span>
                    </div>
                  </div>
                  <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="bg-emerald-500"
                      style={{ width: `${(month.conversions / month.quotes) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>Quote distribution by risk level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Visual bar */}
              <div className="flex h-8 overflow-hidden rounded-lg">
                {riskDistribution.map((risk) => (
                  <div
                    key={risk.level}
                    className={`${risk.color}`}
                    style={{ width: `${risk.percentage}%` }}
                  />
                ))}
              </div>

              {/* Legend */}
              <div className="grid gap-4 md:grid-cols-3">
                {riskDistribution.map((risk) => (
                  <div key={risk.level} className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div className={`h-3 w-3 rounded-full ${risk.color}`} />
                      <span className="text-sm font-medium">{risk.level}</span>
                    </div>
                    <p className="text-2xl font-bold">{risk.count}</p>
                    <p className="text-xs text-muted-foreground">
                      {risk.percentage}% of total
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Vehicle Type</CardTitle>
          <CardDescription>
            Quote volume and premium distribution across vehicle categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Header */}
            <div className="grid grid-cols-5 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
              <div>Vehicle Type</div>
              <div className="text-center">Quotes</div>
              <div className="text-center">Avg Premium</div>
              <div className="text-center">Market Share</div>
              <div>Distribution</div>
            </div>

            {/* Rows */}
            {vehicleTypeStats.map((type) => (
              <div key={type.type} className="grid grid-cols-5 gap-4 items-center">
                <div className="font-medium">{type.type}</div>
                <div className="text-center">{type.quotes}</div>
                <div className="text-center text-emerald-600 font-medium">
                  {formatCurrency(type.premium, "M")}
                </div>
                <div className="text-center">
                  <Badge variant="secondary">{type.share}%</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${type.share}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/50 dark:bg-emerald-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <TrendingUp className="h-5 w-5" />
              Positive Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Conversion rate improved by 5% compared to last quarter</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Loss ratio decreased to 51%, below industry average of 58%</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>SUV segment showing strong growth with 18% higher premiums</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/30 dark:border-amber-900/50 dark:bg-amber-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <ArrowUpDown className="h-5 w-5" />
              Areas for Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span>Commercial vehicle loss ratio (68%) above target</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span>High-risk segment rejection rate increased to 35%</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span>Consider reviewing pricing for vehicles older than 8 years</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
