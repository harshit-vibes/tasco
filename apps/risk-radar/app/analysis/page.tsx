"use client";

import { useState } from "react";
import { useTranslation } from "@tasco/i18n";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@tasco/ui";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Car,
  Heart,
  Home,
  Users,
  Anchor,
  Shield,
} from "@tasco/ui/icons";

// Demo trend data
const monthlyTrends = [
  { month: "Jul", lossRatio: 58, premiums: 42, claims: 24 },
  { month: "Aug", lossRatio: 61, premiums: 45, claims: 27 },
  { month: "Sep", lossRatio: 59, premiums: 44, claims: 26 },
  { month: "Oct", lossRatio: 63, premiums: 46, claims: 29 },
  { month: "Nov", lossRatio: 65, premiums: 48, claims: 31 },
  { month: "Dec", lossRatio: 62, premiums: 48, claims: 30 },
];

const productMetrics = [
  {
    name: "motor",
    icon: Car,
    color: "hsl(215, 70%, 50%)",
    lossRatio: 68.5,
    premiums: 18200,
    claims: 12500,
    policies: 45230,
    claimsCount: 3420,
    avgClaimSize: 3.65,
  },
  {
    name: "health",
    icon: Heart,
    color: "hsl(152, 60%, 40%)",
    lossRatio: 58.2,
    premiums: 15800,
    claims: 9200,
    policies: 32150,
    claimsCount: 5680,
    avgClaimSize: 1.62,
  },
  {
    name: "property",
    icon: Home,
    color: "hsl(25, 80%, 50%)",
    lossRatio: 42.1,
    premiums: 8500,
    claims: 3600,
    policies: 12890,
    claimsCount: 890,
    avgClaimSize: 4.04,
  },
  {
    name: "life",
    icon: Users,
    color: "hsl(270, 60%, 50%)",
    lossRatio: 71.8,
    premiums: 5700,
    claims: 4100,
    policies: 8920,
    claimsCount: 245,
    avgClaimSize: 16.73,
  },
  {
    name: "liability",
    icon: Shield,
    color: "hsl(340, 70%, 50%)",
    lossRatio: 35.4,
    premiums: 3200,
    claims: 1130,
    policies: 4560,
    claimsCount: 156,
    avgClaimSize: 7.24,
  },
  {
    name: "marine",
    icon: Anchor,
    color: "hsl(190, 70%, 45%)",
    lossRatio: 48.9,
    premiums: 2800,
    claims: 1370,
    policies: 2180,
    claimsCount: 89,
    avgClaimSize: 15.39,
  },
];

const regionMetrics = [
  { region: "Ho Chi Minh", premiums: 22500, claims: 14200, lossRatio: 63.1, policies: 48500 },
  { region: "Hanoi", premiums: 18200, claims: 10800, lossRatio: 59.3, policies: 38200 },
  { region: "Da Nang", premiums: 6800, claims: 4100, lossRatio: 60.3, policies: 15800 },
  { region: "Hai Phong", premiums: 4200, claims: 2400, lossRatio: 57.1, policies: 9800 },
  { region: "Can Tho", premiums: 3500, claims: 2100, lossRatio: 60.0, policies: 8200 },
  { region: "Other", premiums: 3000, claims: 1700, lossRatio: 56.7, policies: 9430 },
];

export default function AnalysisPage() {
  const { t } = useTranslation("app");
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");

  const formatCurrency = (value: number) => {
    if (value >= 1000) return `₫${(value / 1000).toFixed(1)}B`;
    return `₫${value}M`;
  };

  const totalPremiums = productMetrics.reduce((sum, p) => sum + p.premiums, 0);
  const totalClaims = productMetrics.reduce((sum, p) => sum + p.claims, 0);
  const avgLossRatio = (totalClaims / totalPremiums) * 100;
  const totalPolicies = productMetrics.reduce((sum, p) => sum + p.policies, 0);
  const totalClaimsCount = productMetrics.reduce((sum, p) => sum + p.claimsCount, 0);
  const avgClaimSize = totalClaims / totalClaimsCount;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("analysis.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("analysis.subtitle")}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            Q4 2024
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">
              {t("analysis.metrics.averageLossRatio")}
            </div>
            <div className="text-2xl font-bold font-mono mt-1">
              {avgLossRatio.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">
              {t("analysis.metrics.totalPremiums")}
            </div>
            <div className="text-2xl font-bold font-mono mt-1">
              {formatCurrency(totalPremiums)}
            </div>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">
              {t("analysis.metrics.totalClaims")}
            </div>
            <div className="text-2xl font-bold font-mono mt-1">
              {formatCurrency(totalClaims)}
            </div>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">
              {t("analysis.metrics.claimsCount")}
            </div>
            <div className="text-2xl font-bold font-mono mt-1">
              {totalClaimsCount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">
              {t("analysis.metrics.avgClaimSize")}
            </div>
            <div className="text-2xl font-bold font-mono mt-1">
              ₫{avgClaimSize.toFixed(1)}M
            </div>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">
              {t("analysis.metrics.policyCount")}
            </div>
            <div className="text-2xl font-bold font-mono mt-1">
              {totalPolicies.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            {t("analysis.sections.overview")}
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            {t("analysis.sections.trends")}
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="gap-2">
            <PieChart className="h-4 w-4" />
            {t("analysis.sections.breakdown")}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("analysis.charts.productPerformance")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productMetrics.map((product) => (
                    <div key={product.name} className="flex items-center gap-4">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${product.color}15` }}
                      >
                        <product.icon className="h-4 w-4" style={{ color: product.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">
                            {t(`dashboard.products.${product.name}`)}
                          </span>
                          <span
                            className={`text-sm font-mono ${
                              product.lossRatio > 65
                                ? "text-[hsl(0,72%,51%)]"
                                : product.lossRatio > 55
                                ? "text-[hsl(45,90%,50%)]"
                                : "text-[hsl(152,60%,40%)]"
                            }`}
                          >
                            {product.lossRatio}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${Math.min(product.lossRatio, 100)}%`,
                              backgroundColor: product.color,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Regional Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("analysis.charts.regionBreakdown")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {regionMetrics.map((region, idx) => (
                    <div
                      key={region.region}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-bold text-muted-foreground w-6">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-medium">{region.region}</div>
                          <div className="text-xs text-muted-foreground">
                            {region.policies.toLocaleString()} {t("dashboard.metrics.policies")}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-semibold">
                          {formatCurrency(region.premiums)}
                        </div>
                        <div
                          className={`text-xs font-mono ${
                            region.lossRatio > 62
                              ? "text-[hsl(0,72%,51%)]"
                              : "text-[hsl(152,60%,40%)]"
                          }`}
                        >
                          LR: {region.lossRatio}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {t("analysis.charts.lossRatioTrend")}
              </CardTitle>
              <div className="flex gap-2">
                {["daily", "weekly", "monthly", "quarterly"].map((period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPeriod(period)}
                  >
                    {t(`dashboard.trends.${period}`)}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {/* Simple bar chart visualization */}
              <div className="h-64 flex items-end gap-4 px-4">
                {monthlyTrends.map((data, idx) => (
                  <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-lg bg-primary transition-all duration-500"
                      style={{ height: `${(data.lossRatio / 70) * 100}%` }}
                    />
                    <span className="text-xs text-muted-foreground">{data.month}</span>
                    <span className="text-xs font-mono font-medium">{data.lossRatio}%</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-primary" />
                  {t("dashboard.metrics.lossRatio")}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premiums vs Claims */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("analysis.charts.premiumVsClaims")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end gap-2 px-4">
                {monthlyTrends.map((data) => (
                  <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex gap-1">
                      <div
                        className="flex-1 rounded-t-lg bg-[hsl(152,60%,40%)] transition-all duration-500"
                        style={{ height: `${(data.premiums / 50) * 100}px` }}
                      />
                      <div
                        className="flex-1 rounded-t-lg bg-[hsl(0,72%,51%)] transition-all duration-500"
                        style={{ height: `${(data.claims / 50) * 100}px` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{data.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[hsl(152,60%,40%)]" />
                  {t("dashboard.metrics.premiums")}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[hsl(0,72%,51%)]" />
                  {t("dashboard.metrics.claims")}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Breakdown Tab */}
        <TabsContent value="breakdown" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productMetrics.map((product) => (
              <Card key={product.name} className="metric-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2.5 rounded-lg"
                      style={{ backgroundColor: `${product.color}15` }}
                    >
                      <product.icon className="h-5 w-5" style={{ color: product.color }} />
                    </div>
                    <CardTitle className="text-base">
                      {t(`dashboard.products.${product.name}`)}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("dashboard.metrics.lossRatio")}
                      </span>
                      <span
                        className={`font-mono font-semibold ${
                          product.lossRatio > 65
                            ? "text-[hsl(0,72%,51%)]"
                            : product.lossRatio > 55
                            ? "text-[hsl(45,90%,50%)]"
                            : "text-[hsl(152,60%,40%)]"
                        }`}
                      >
                        {product.lossRatio}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("dashboard.metrics.premiums")}
                      </span>
                      <span className="font-mono">{formatCurrency(product.premiums)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("dashboard.metrics.claims")}
                      </span>
                      <span className="font-mono">{formatCurrency(product.claims)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("analysis.metrics.claimsCount")}
                      </span>
                      <span className="font-mono">{product.claimsCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("analysis.metrics.avgClaimSize")}
                      </span>
                      <span className="font-mono">₫{product.avgClaimSize.toFixed(1)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("analysis.metrics.policyCount")}
                      </span>
                      <span className="font-mono">{product.policies.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
