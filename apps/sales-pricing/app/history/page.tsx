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
  Input,
  Skeleton,
} from "@tasco/ui";
import {
  Car,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Shield,
  Target,
  Flame,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  MoreHorizontal,
} from "@tasco/ui/icons";

// Types
interface Quote {
  id: string;
  customerName: string;
  customerPhone: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  usage: "personal" | "commercial";
  premium: number;
  riskScore: number;
  riskLevel: "low" | "standard" | "high";
  status: "draft" | "pending" | "approved" | "rejected" | "accepted" | "expired";
  createdAt: string;
  validUntil: string;
  createdBy: string;
}

// Mock data
const mockQuotes: Quote[] = [
  {
    id: "Q-2025-001",
    customerName: "Nguyen Van A",
    customerPhone: "0901234567",
    vehicleMake: "Toyota",
    vehicleModel: "Camry",
    vehicleYear: 2023,
    usage: "personal",
    premium: 18500000,
    riskScore: 35,
    riskLevel: "low",
    status: "pending",
    createdAt: "2025-01-10T08:30:00Z",
    validUntil: "2025-02-09T23:59:59Z",
    createdBy: "Agent A",
  },
  {
    id: "Q-2025-002",
    customerName: "Tran Thi B",
    customerPhone: "0912345678",
    vehicleMake: "Honda",
    vehicleModel: "CR-V",
    vehicleYear: 2024,
    usage: "personal",
    premium: 22000000,
    riskScore: 52,
    riskLevel: "standard",
    status: "approved",
    createdAt: "2025-01-10T07:15:00Z",
    validUntil: "2025-02-09T23:59:59Z",
    createdBy: "Agent B",
  },
  {
    id: "Q-2025-003",
    customerName: "Le Van C",
    customerPhone: "0923456789",
    vehicleMake: "Ford",
    vehicleModel: "Ranger",
    vehicleYear: 2022,
    usage: "commercial",
    premium: 28500000,
    riskScore: 78,
    riskLevel: "high",
    status: "pending",
    createdAt: "2025-01-09T16:45:00Z",
    validUntil: "2025-02-08T23:59:59Z",
    createdBy: "Agent A",
  },
  {
    id: "Q-2025-004",
    customerName: "Pham Thi D",
    customerPhone: "0934567890",
    vehicleMake: "Mazda",
    vehicleModel: "CX-5",
    vehicleYear: 2024,
    usage: "personal",
    premium: 19800000,
    riskScore: 28,
    riskLevel: "low",
    status: "accepted",
    createdAt: "2025-01-09T14:20:00Z",
    validUntil: "2025-02-08T23:59:59Z",
    createdBy: "Agent C",
  },
  {
    id: "Q-2025-005",
    customerName: "Hoang Van E",
    customerPhone: "0945678901",
    vehicleMake: "Hyundai",
    vehicleModel: "Tucson",
    vehicleYear: 2023,
    usage: "personal",
    premium: 20500000,
    riskScore: 45,
    riskLevel: "standard",
    status: "rejected",
    createdAt: "2025-01-08T11:00:00Z",
    validUntil: "2025-02-07T23:59:59Z",
    createdBy: "Agent B",
  },
  {
    id: "Q-2025-006",
    customerName: "Vo Thi F",
    customerPhone: "0956789012",
    vehicleMake: "Kia",
    vehicleModel: "Sorento",
    vehicleYear: 2023,
    usage: "commercial",
    premium: 32000000,
    riskScore: 65,
    riskLevel: "standard",
    status: "draft",
    createdAt: "2025-01-08T09:30:00Z",
    validUntil: "2025-02-07T23:59:59Z",
    createdBy: "Agent A",
  },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: Quote["status"] }) {
  const config = {
    draft: { className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30", label: "Draft" },
    pending: { className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30", label: "Pending" },
    approved: { className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30", label: "Approved" },
    rejected: { className: "bg-red-100 text-red-800 dark:bg-red-900/30", label: "Rejected" },
    accepted: { className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30", label: "Accepted" },
    expired: { className: "bg-gray-100 text-gray-500 dark:bg-gray-900/30", label: "Expired" },
  };

  const { className, label } = config[status];
  return (
    <Badge className={className} variant="secondary">
      {label}
    </Badge>
  );
}

function RiskBadge({ level, score }: { level: Quote["riskLevel"]; score: number }) {
  const config = {
    low: { icon: Shield, className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30" },
    standard: { icon: Target, className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30" },
    high: { icon: Flame, className: "bg-red-100 text-red-800 dark:bg-red-900/30" },
  };

  const { icon: Icon, className } = config[level];
  return (
    <Badge className={className} variant="secondary">
      <Icon className="mr-1 h-3 w-3" />
      {score}
    </Badge>
  );
}

export default function HistoryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setQuotes(mockQuotes);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Filter quotes
  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch =
      quote.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${quote.vehicleMake} ${quote.vehicleModel}`.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: quotes.length,
    pending: quotes.filter((q) => q.status === "pending").length,
    approved: quotes.filter((q) => q.status === "approved").length,
    accepted: quotes.filter((q) => q.status === "accepted").length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quote History</h1>
          <p className="text-muted-foreground">
            View and manage all insurance quotes
          </p>
        </div>
        <Link href="/quote">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Car className="mr-2 h-4 w-4" />
            New Quote
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Quotes</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Car className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-blue-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.accepted}</p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by customer, quote ID, or vehicle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                className="rounded-md border bg-background px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="accepted">Accepted</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quotes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quotes ({filteredQuotes.length})</CardTitle>
          <CardDescription>
            Click on a quote to view details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div className="py-12 text-center">
              <Car className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No quotes found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first quote to get started"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Link href="/quote">
                  <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                    Create Quote
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table Header */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
                <div className="col-span-3">Customer / Vehicle</div>
                <div className="col-span-2">Quote ID</div>
                <div className="col-span-2">Premium</div>
                <div className="col-span-1">Risk</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Date</div>
              </div>

              {/* Table Rows */}
              {filteredQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className="grid md:grid-cols-12 gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  {/* Customer / Vehicle */}
                  <div className="md:col-span-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <Car className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{quote.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {quote.vehicleMake} {quote.vehicleModel} {quote.vehicleYear}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quote ID */}
                  <div className="md:col-span-2 flex items-center">
                    <span className="text-sm font-mono">{quote.id}</span>
                  </div>

                  {/* Premium */}
                  <div className="md:col-span-2 flex items-center">
                    <span className="font-semibold text-emerald-600">
                      {formatCurrency(quote.premium)}
                    </span>
                  </div>

                  {/* Risk */}
                  <div className="md:col-span-1 flex items-center">
                    <RiskBadge level={quote.riskLevel} score={quote.riskScore} />
                  </div>

                  {/* Status */}
                  <div className="md:col-span-2 flex items-center">
                    <StatusBadge status={quote.status} />
                  </div>

                  {/* Date */}
                  <div className="md:col-span-2 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(quote.createdAt)}
                    </span>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
