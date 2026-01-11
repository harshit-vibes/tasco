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
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Flame,
  Info,
  BarChart3,
  Users,
  Car,
} from "@tasco/ui/icons";

// Risk factor categories
const riskCategories = [
  {
    id: "driver",
    name: "Driver Factors",
    icon: Users,
    description: "Risk factors related to driver profile and behavior",
    factors: [
      {
        name: "Driver Age",
        weight: 15,
        description: "Age of primary driver affects risk assessment",
        ranges: [
          { range: "18-25", risk: "high", note: "Higher accident rates" },
          { range: "26-60", risk: "low", note: "Experienced drivers" },
          { range: "60+", risk: "medium", note: "Slower reflexes" },
        ],
      },
      {
        name: "Driving Experience",
        weight: 12,
        description: "Years of licensed driving experience",
        ranges: [
          { range: "0-2 years", risk: "high", note: "New drivers" },
          { range: "3-10 years", risk: "medium", note: "Building experience" },
          { range: "10+ years", risk: "low", note: "Experienced" },
        ],
      },
      {
        name: "Claims History",
        weight: 20,
        description: "Previous insurance claims record",
        ranges: [
          { range: "0 claims", risk: "low", note: "Clean record" },
          { range: "1-2 claims", risk: "medium", note: "Minor history" },
          { range: "3+ claims", risk: "high", note: "High risk" },
        ],
      },
    ],
  },
  {
    id: "vehicle",
    name: "Vehicle Factors",
    icon: Car,
    description: "Risk factors related to vehicle characteristics",
    factors: [
      {
        name: "Vehicle Age",
        weight: 10,
        description: "Years since vehicle manufacture",
        ranges: [
          { range: "0-2 years", risk: "low", note: "Modern safety features" },
          { range: "3-7 years", risk: "medium", note: "Standard condition" },
          { range: "8+ years", risk: "high", note: "Wear and maintenance" },
        ],
      },
      {
        name: "Vehicle Value",
        weight: 8,
        description: "Current market value of vehicle",
        ranges: [
          { range: "< 300M VND", risk: "low", note: "Lower claim amounts" },
          { range: "300M-800M VND", risk: "medium", note: "Standard range" },
          { range: "> 800M VND", risk: "high", note: "Higher exposure" },
        ],
      },
      {
        name: "Safety Rating",
        weight: 10,
        description: "Vehicle safety test ratings",
        ranges: [
          { range: "5 stars", risk: "low", note: "Excellent safety" },
          { range: "3-4 stars", risk: "medium", note: "Good safety" },
          { range: "1-2 stars", risk: "high", note: "Poor safety" },
        ],
      },
    ],
  },
  {
    id: "usage",
    name: "Usage Factors",
    icon: Target,
    description: "Risk factors related to vehicle usage patterns",
    factors: [
      {
        name: "Usage Type",
        weight: 20,
        description: "Personal vs commercial usage",
        ranges: [
          { range: "Personal", risk: "low", note: "Lower mileage" },
          { range: "Commercial", risk: "high", note: "Higher exposure" },
        ],
      },
      {
        name: "Annual Mileage",
        weight: 8,
        description: "Expected kilometers per year",
        ranges: [
          { range: "< 10,000 km", risk: "low", note: "Light usage" },
          { range: "10,000-30,000 km", risk: "medium", note: "Normal usage" },
          { range: "> 30,000 km", risk: "high", note: "Heavy usage" },
        ],
      },
      {
        name: "Geographic Area",
        weight: 7,
        description: "Primary operating location",
        ranges: [
          { range: "Rural", risk: "low", note: "Less traffic" },
          { range: "Urban", risk: "medium", note: "City driving" },
          { range: "High-density", risk: "high", note: "HCMC/Hanoi center" },
        ],
      },
    ],
  },
];

function RiskBadge({ risk }: { risk: "low" | "medium" | "high" }) {
  const config = {
    low: { icon: Shield, className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30", label: "Low Risk" },
    medium: { icon: Target, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30", label: "Medium Risk" },
    high: { icon: Flame, className: "bg-red-100 text-red-800 dark:bg-red-900/30", label: "High Risk" },
  };

  const { icon: Icon, className, label } = config[risk];
  return (
    <Badge className={className} variant="secondary">
      <Icon className="mr-1 h-3 w-3" />
      {label}
    </Badge>
  );
}

export default function RiskPage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("driver");

  const totalWeight = riskCategories.reduce(
    (sum, cat) => sum + cat.factors.reduce((s, f) => s + f.weight, 0),
    0
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Risk Assessment</h1>
        <p className="text-muted-foreground">
          Understand risk factors used in AI-powered pricing decisions
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Shield className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{riskCategories.length}</p>
                <p className="text-sm text-muted-foreground">Risk Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {riskCategories.reduce((sum, cat) => sum + cat.factors.length, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Risk Factors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalWeight}%</p>
                <p className="text-sm text-muted-foreground">Total Weight</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">92%</p>
                <p className="text-sm text-muted-foreground">AI Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Score Formula */}
      <Card className="border-blue-200 bg-blue-50/30 dark:border-blue-900/50 dark:bg-blue-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            How Risk Score is Calculated
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            The AI analyzes multiple risk factors and assigns a weighted score from 0-100.
            Lower scores indicate lower risk and result in better premium rates.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <span>0-40: Low Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <span>41-70: Standard Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span>71-100: High Risk</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Categories */}
      <div className="space-y-4">
        {riskCategories.map((category) => {
          const Icon = category.icon;
          const isExpanded = expandedCategory === category.id;
          const categoryWeight = category.factors.reduce((sum, f) => sum + f.weight, 0);

          return (
            <Card key={category.id}>
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">{category.factors.length} factors</Badge>
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30">
                      {categoryWeight}% weight
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="border-t">
                  <div className="space-y-6 pt-4">
                    {category.factors.map((factor, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{factor.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {factor.description}
                            </p>
                          </div>
                          <Badge variant="secondary">{factor.weight}% weight</Badge>
                        </div>

                        {/* Risk Ranges */}
                        <div className="grid gap-2 md:grid-cols-3">
                          {factor.ranges.map((range, rangeIndex) => (
                            <div
                              key={rangeIndex}
                              className="rounded-lg border p-3 text-sm"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">{range.range}</span>
                                <RiskBadge risk={range.risk as "low" | "medium" | "high"} />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {range.note}
                              </p>
                            </div>
                          ))}
                        </div>

                        {index < category.factors.length - 1 && (
                          <div className="border-b" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* AI Confidence Note */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold">AI-Powered Risk Assessment</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Our AI model has been trained on historical claims data and continuously
                learns from new patterns. Each risk assessment includes a confidence score
                indicating the reliability of the prediction. Factors with lower confidence
                may require manual review.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
