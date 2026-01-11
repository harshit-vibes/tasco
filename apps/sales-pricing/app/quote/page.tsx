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
  Badge,
  Separator,
} from "@tasco/ui";
import {
  Car,
  User,
  Calendar,
  DollarSign,
  Shield,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Sparkles,
  Target,
  Flame,
  TrendingUp,
  TrendingDown,
} from "@tasco/ui/icons";

// Types
interface VehicleData {
  make: string;
  model: string;
  year: string;
  registrationNo: string;
  usage: "personal" | "commercial";
  estimatedValue: string;
  engineCapacity: string;
}

interface CustomerData {
  name: string;
  phone: string;
  email: string;
  idNumber: string;
  driverAge: string;
  drivingExperience: string;
}

interface RiskFactor {
  name: string;
  impact: "positive" | "negative" | "neutral";
  weight: number;
  description: string;
  confidence: number;
}

interface QuoteResult {
  quoteId: string;
  basePremium: number;
  adjustments: { reason: string; amount: number }[];
  finalPremium: number;
  riskScore: number;
  riskLevel: "low" | "standard" | "high";
  riskFactors: RiskFactor[];
  validUntil: string;
}

// Vehicle makes and models for Vietnam market
const vehicleMakes = [
  "Toyota",
  "Honda",
  "Ford",
  "Mazda",
  "Hyundai",
  "Kia",
  "VinFast",
  "Mercedes-Benz",
  "BMW",
  "Audi",
  "Lexus",
  "Mitsubishi",
  "Nissan",
  "Suzuki",
  "Isuzu",
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 15 }, (_, i) => String(currentYear - i));

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function RiskLevelBadge({ level }: { level: "low" | "standard" | "high" }) {
  const config = {
    low: {
      icon: Shield,
      className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
      label: "Low Risk",
    },
    standard: {
      icon: Target,
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      label: "Standard Risk",
    },
    high: {
      icon: Flame,
      className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      label: "High Risk",
    },
  };

  const { icon: Icon, className, label } = config[level];

  return (
    <Badge className={className} variant="secondary">
      <Icon className="mr-1 h-3 w-3" />
      {label}
    </Badge>
  );
}

export default function QuotePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [quoteResult, setQuoteResult] = useState<QuoteResult | null>(null);

  const [vehicleData, setVehicleData] = useState<VehicleData>({
    make: "",
    model: "",
    year: "",
    registrationNo: "",
    usage: "personal",
    estimatedValue: "",
    engineCapacity: "",
  });

  const [customerData, setCustomerData] = useState<CustomerData>({
    name: "",
    phone: "",
    email: "",
    idNumber: "",
    driverAge: "",
    drivingExperience: "",
  });

  const handleVehicleChange = (field: keyof VehicleData, value: string) => {
    setVehicleData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCustomerChange = (field: keyof CustomerData, value: string) => {
    setCustomerData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateQuote = async () => {
    setIsCalculating(true);

    // Simulate AI-powered quote calculation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const vehicleValue = parseInt(vehicleData.estimatedValue.replace(/\D/g, "")) || 500000000;
    const baseRate = vehicleData.usage === "commercial" ? 0.025 : 0.018;
    const basePremium = vehicleValue * baseRate;

    // Calculate risk factors
    const driverAge = parseInt(customerData.driverAge) || 35;
    const experience = parseInt(customerData.drivingExperience) || 5;
    const vehicleAge = currentYear - (parseInt(vehicleData.year) || currentYear);

    const riskFactors: RiskFactor[] = [
      {
        name: "Driver Age",
        impact: driverAge < 25 ? "negative" : driverAge > 60 ? "negative" : "positive",
        weight: driverAge < 25 ? 15 : driverAge > 60 ? 10 : -5,
        description:
          driverAge < 25
            ? "Young drivers have higher accident rates"
            : driverAge > 60
            ? "Senior drivers may have slower reaction times"
            : "Experienced age group with lower risk",
        confidence: 0.92,
      },
      {
        name: "Driving Experience",
        impact: experience < 3 ? "negative" : experience > 10 ? "positive" : "neutral",
        weight: experience < 3 ? 12 : experience > 10 ? -8 : 0,
        description:
          experience < 3
            ? "Less than 3 years of driving experience"
            : experience > 10
            ? "Over 10 years of safe driving assumed"
            : "Average driving experience",
        confidence: 0.88,
      },
      {
        name: "Vehicle Age",
        impact: vehicleAge > 7 ? "negative" : vehicleAge < 2 ? "positive" : "neutral",
        weight: vehicleAge > 7 ? 8 : vehicleAge < 2 ? -3 : 0,
        description:
          vehicleAge > 7
            ? "Older vehicles may have higher maintenance issues"
            : vehicleAge < 2
            ? "New vehicle with modern safety features"
            : "Vehicle in standard age range",
        confidence: 0.95,
      },
      {
        name: "Usage Type",
        impact: vehicleData.usage === "commercial" ? "negative" : "positive",
        weight: vehicleData.usage === "commercial" ? 20 : -5,
        description:
          vehicleData.usage === "commercial"
            ? "Commercial use increases exposure and risk"
            : "Personal use with lower mileage expected",
        confidence: 0.98,
      },
    ];

    // Calculate adjustments
    const totalAdjustment = riskFactors.reduce((sum, factor) => sum + factor.weight, 0);
    const adjustmentAmount = basePremium * (totalAdjustment / 100);

    const adjustments = [
      { reason: "Risk factors adjustment", amount: adjustmentAmount },
      { reason: "No claims discount (assumed)", amount: -basePremium * 0.1 },
    ];

    const finalPremium = basePremium + adjustments.reduce((sum, adj) => sum + adj.amount, 0);

    // Calculate risk score (0-100)
    const riskScore = Math.min(100, Math.max(0, 50 + totalAdjustment));
    const riskLevel: "low" | "standard" | "high" =
      riskScore < 40 ? "low" : riskScore > 70 ? "high" : "standard";

    // Generate quote ID
    const quoteId = `Q-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;

    // Valid for 30 days
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);

    setQuoteResult({
      quoteId,
      basePremium,
      adjustments,
      finalPremium,
      riskScore,
      riskLevel,
      riskFactors,
      validUntil: validUntil.toISOString(),
    });

    setIsCalculating(false);
    setStep(3);
  };

  const isStep1Valid =
    vehicleData.make &&
    vehicleData.model &&
    vehicleData.year &&
    vehicleData.estimatedValue;

  const isStep2Valid =
    customerData.name &&
    customerData.phone &&
    customerData.driverAge &&
    customerData.drivingExperience;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Generate Quote</h1>
          <p className="text-muted-foreground">
            AI-powered instant insurance quote calculation
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step >= s
                  ? "bg-emerald-600 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s ? <CheckCircle className="h-4 w-4" /> : s}
            </div>
            <span
              className={`text-sm ${
                step >= s ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {s === 1 ? "Vehicle Info" : s === 2 ? "Customer Info" : "Quote Result"}
            </span>
            {s < 3 && <div className="mx-2 h-px w-8 bg-muted" />}
          </div>
        ))}
      </div>

      {/* Step 1: Vehicle Information */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-emerald-600" />
              Vehicle Information
            </CardTitle>
            <CardDescription>
              Enter the vehicle details for insurance quote
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Make *</label>
                <select
                  className="w-full rounded-md border bg-background px-3 py-2"
                  value={vehicleData.make}
                  onChange={(e) => handleVehicleChange("make", e.target.value)}
                >
                  <option value="">Select make...</option>
                  {vehicleMakes.map((make) => (
                    <option key={make} value={make}>
                      {make}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Model *</label>
                <Input
                  placeholder="e.g., Camry, CR-V, CX-5"
                  value={vehicleData.model}
                  onChange={(e) => handleVehicleChange("model", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Year *</label>
                <select
                  className="w-full rounded-md border bg-background px-3 py-2"
                  value={vehicleData.year}
                  onChange={(e) => handleVehicleChange("year", e.target.value)}
                >
                  <option value="">Select year...</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Registration No.</label>
                <Input
                  placeholder="e.g., 30A-12345"
                  value={vehicleData.registrationNo}
                  onChange={(e) => handleVehicleChange("registrationNo", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Usage Type *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="usage"
                      value="personal"
                      checked={vehicleData.usage === "personal"}
                      onChange={(e) => handleVehicleChange("usage", e.target.value)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Personal</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="usage"
                      value="commercial"
                      checked={vehicleData.usage === "commercial"}
                      onChange={(e) => handleVehicleChange("usage", e.target.value)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Commercial</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Engine Capacity (cc)</label>
                <Input
                  placeholder="e.g., 2000"
                  value={vehicleData.engineCapacity}
                  onChange={(e) => handleVehicleChange("engineCapacity", e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Estimated Value (VND) *</label>
                <Input
                  placeholder="e.g., 800,000,000"
                  value={vehicleData.estimatedValue}
                  onChange={(e) => handleVehicleChange("estimatedValue", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the current market value of the vehicle
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={!isStep1Valid}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Next: Customer Info
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Customer Information */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-600" />
              Customer Information
            </CardTitle>
            <CardDescription>
              Enter the customer and driver details for risk assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name *</label>
                <Input
                  placeholder="Enter customer name"
                  value={customerData.name}
                  onChange={(e) => handleCustomerChange("name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number *</label>
                <Input
                  placeholder="e.g., 0901234567"
                  value={customerData.phone}
                  onChange={(e) => handleCustomerChange("phone", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="customer@example.com"
                  value={customerData.email}
                  onChange={(e) => handleCustomerChange("email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">ID/Passport Number</label>
                <Input
                  placeholder="Enter ID number"
                  value={customerData.idNumber}
                  onChange={(e) => handleCustomerChange("idNumber", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Driver Age *</label>
                <Input
                  type="number"
                  placeholder="e.g., 35"
                  value={customerData.driverAge}
                  onChange={(e) => handleCustomerChange("driverAge", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Driving Experience (years) *</label>
                <Input
                  type="number"
                  placeholder="e.g., 10"
                  value={customerData.drivingExperience}
                  onChange={(e) => handleCustomerChange("drivingExperience", e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={calculateQuote}
                disabled={!isStep2Valid || isCalculating}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Calculate Quote
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Quote Result */}
      {step === 3 && quoteResult && (
        <div className="space-y-6">
          {/* Quote Summary Card */}
          <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-900/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <DollarSign className="h-6 w-6 text-emerald-600" />
                    Quote Generated
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Quote ID: {quoteResult.quoteId}
                  </CardDescription>
                </div>
                <RiskLevelBadge level={quoteResult.riskLevel} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Annual Premium</p>
                  <p className="text-4xl font-bold text-emerald-600">
                    {formatCurrency(quoteResult.finalPremium)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Risk Score</p>
                  <p className="text-2xl font-semibold">{quoteResult.riskScore}/100</p>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base Premium</span>
                  <span>{formatCurrency(quoteResult.basePremium)}</span>
                </div>
                {quoteResult.adjustments.map((adj, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{adj.reason}</span>
                    <span className={adj.amount >= 0 ? "text-red-600" : "text-emerald-600"}>
                      {adj.amount >= 0 ? "+" : ""}
                      {formatCurrency(adj.amount)}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Final Premium</span>
                  <span className="text-emerald-600">{formatCurrency(quoteResult.finalPremium)}</span>
                </div>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                Valid until: {new Date(quoteResult.validUntil).toLocaleDateString("vi-VN")}
              </p>
            </CardContent>
          </Card>

          {/* Risk Assessment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-600" />
                AI Risk Assessment
              </CardTitle>
              <CardDescription>
                Factors analyzed by AI for risk-based pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quoteResult.riskFactors.map((factor, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {factor.impact === "positive" ? (
                          <TrendingDown className="h-5 w-5 text-emerald-600" />
                        ) : factor.impact === "negative" ? (
                          <TrendingUp className="h-5 w-5 text-red-600" />
                        ) : (
                          <Target className="h-5 w-5 text-gray-500" />
                        )}
                        <div>
                          <h4 className="font-medium">{factor.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {factor.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="secondary"
                          className={
                            factor.impact === "positive"
                              ? "bg-emerald-100 text-emerald-800"
                              : factor.impact === "negative"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {factor.weight >= 0 ? "+" : ""}
                          {factor.weight}%
                        </Badge>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {Math.round(factor.confidence * 100)}% confidence
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Vehicle & Customer Summary */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vehicle Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Make/Model</span>
                  <span className="font-medium">
                    {vehicleData.make} {vehicleData.model}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Year</span>
                  <span className="font-medium">{vehicleData.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Usage</span>
                  <span className="font-medium capitalize">{vehicleData.usage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Value</span>
                  <span className="font-medium">{vehicleData.estimatedValue} VND</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{customerData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{customerData.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Driver Age</span>
                  <span className="font-medium">{customerData.driverAge} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Experience</span>
                  <span className="font-medium">{customerData.drivingExperience} years</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Create New Quote
            </Button>
            <div className="flex gap-2">
              <Button variant="outline">Save as Draft</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <CheckCircle className="mr-2 h-4 w-4" />
                Submit for Approval
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
