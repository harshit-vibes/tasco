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
  Input,
} from "@tasco/ui";
import {
  DollarSign,
  Search,
  FileText,
  Car,
  Shield,
  TrendingUp,
  Info,
  Calculator,
} from "@tasco/ui/icons";

// Types
interface PricingRule {
  id: string;
  name: string;
  category: string;
  description: string;
  baseRate: number;
  factors: {
    name: string;
    description: string;
    minMultiplier: number;
    maxMultiplier: number;
  }[];
  effectiveFrom: string;
  status: "active" | "draft" | "expired";
}

// Mock pricing rules
const pricingRules: PricingRule[] = [
  {
    id: "PR-001",
    name: "Motor Vehicle - Personal Use",
    category: "Motor Insurance",
    description: "Standard pricing for personal use motor vehicles",
    baseRate: 1.8,
    factors: [
      { name: "Vehicle Age", description: "Years since manufacture", minMultiplier: 0.9, maxMultiplier: 1.3 },
      { name: "Driver Age", description: "Primary driver age", minMultiplier: 0.95, maxMultiplier: 1.25 },
      { name: "Claims History", description: "Previous claims record", minMultiplier: 0.8, maxMultiplier: 1.5 },
      { name: "Location", description: "Vehicle registration area", minMultiplier: 0.95, maxMultiplier: 1.15 },
    ],
    effectiveFrom: "2025-01-01",
    status: "active",
  },
  {
    id: "PR-002",
    name: "Motor Vehicle - Commercial Use",
    category: "Motor Insurance",
    description: "Pricing for commercial use vehicles with higher exposure",
    baseRate: 2.5,
    factors: [
      { name: "Vehicle Type", description: "Truck, van, taxi, etc.", minMultiplier: 1.0, maxMultiplier: 1.8 },
      { name: "Daily Mileage", description: "Average daily usage", minMultiplier: 1.0, maxMultiplier: 1.5 },
      { name: "Driver Experience", description: "Years of driving", minMultiplier: 0.9, maxMultiplier: 1.3 },
      { name: "Fleet Size", description: "Volume discount", minMultiplier: 0.85, maxMultiplier: 1.0 },
    ],
    effectiveFrom: "2025-01-01",
    status: "active",
  },
  {
    id: "PR-003",
    name: "Third Party Liability",
    category: "Liability Insurance",
    description: "Compulsory third party liability coverage",
    baseRate: 0.5,
    factors: [
      { name: "Vehicle Class", description: "Engine capacity based", minMultiplier: 0.8, maxMultiplier: 1.5 },
      { name: "Coverage Limit", description: "Max payout amount", minMultiplier: 1.0, maxMultiplier: 2.0 },
    ],
    effectiveFrom: "2025-01-01",
    status: "active",
  },
  {
    id: "PR-004",
    name: "Comprehensive Coverage Add-on",
    category: "Motor Insurance",
    description: "Additional comprehensive protection options",
    baseRate: 0.8,
    factors: [
      { name: "Deductible Level", description: "Chosen deductible amount", minMultiplier: 0.7, maxMultiplier: 1.0 },
      { name: "Additional Coverage", description: "Selected add-ons", minMultiplier: 1.0, maxMultiplier: 1.5 },
    ],
    effectiveFrom: "2025-01-01",
    status: "active",
  },
];

function StatusBadge({ status }: { status: PricingRule["status"] }) {
  const config = {
    active: { className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30", label: "Active" },
    draft: { className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30", label: "Draft" },
    expired: { className: "bg-gray-100 text-gray-500 dark:bg-gray-900/30", label: "Expired" },
  };

  const { className, label } = config[status];
  return <Badge className={className} variant="secondary">{label}</Badge>;
}

export default function PricingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRule, setSelectedRule] = useState<PricingRule | null>(null);

  const filteredRules = pricingRules.filter(
    (rule) =>
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pricing Rules</h1>
        <p className="text-muted-foreground">
          View and understand insurance pricing guidelines
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pricingRules.length}</p>
                <p className="text-sm text-muted-foreground">Active Rules</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Car className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">1.8%</p>
                <p className="text-sm text-muted-foreground">Base Rate (Personal)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">2.5%</p>
                <p className="text-sm text-muted-foreground">Base Rate (Commercial)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Shield className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Risk Factors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search pricing rules..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Pricing Rules Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {filteredRules.map((rule) => (
          <Card key={rule.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedRule(rule)}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{rule.name}</CardTitle>
                  <CardDescription>{rule.description}</CardDescription>
                </div>
                <StatusBadge status={rule.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Base Rate */}
                <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
                  <span className="text-sm font-medium">Base Rate</span>
                  <span className="text-lg font-bold text-emerald-600">{rule.baseRate}%</span>
                </div>

                {/* Category */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Category</span>
                  <Badge variant="outline">{rule.category}</Badge>
                </div>

                {/* Factors Preview */}
                <div>
                  <p className="text-sm font-medium mb-2">Risk Factors ({rule.factors.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {rule.factors.map((factor, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {factor.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Effective Date */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Effective from</span>
                  <span>{new Date(rule.effectiveFrom).toLocaleDateString("vi-VN")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Rule Detail Modal/Panel could be added here */}
      {selectedRule && (
        <Card className="border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/50 dark:bg-emerald-900/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-emerald-600" />
                {selectedRule.name} - Factor Details
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedRule(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {selectedRule.factors.map((factor, index) => (
                <div key={index} className="rounded-lg border bg-background p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{factor.name}</h4>
                      <p className="text-sm text-muted-foreground">{factor.description}</p>
                    </div>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Multiplier Range</span>
                    <span className="font-mono">
                      {factor.minMultiplier}x - {factor.maxMultiplier}x
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${((factor.maxMultiplier - factor.minMultiplier) / 1.5) * 100}%`,
                        marginLeft: `${((factor.minMultiplier - 0.7) / 1.5) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
