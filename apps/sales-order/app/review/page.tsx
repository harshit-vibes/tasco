"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  FileText,
  ArrowRight,
  Clock,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "@tasco/ui/icons";
import { useTranslation } from "@tasco/i18n";

interface Order {
  orderId: string;
  extractedData: {
    customerName: { value: string };
    customerCode: { value: string };
    orderDate: { value: string };
    items: any[];
    totalAmount: number;
  };
  confidence: number;
  sourceType: string;
  createdAt: string;
}

export default function ReviewPage() {
  const { t } = useTranslation("app");
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch orders with "reviewing" status
  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "/api/orders?status=reviewing&entityId=inochi&sortBy=createdAt&sortOrder=desc"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch pending orders");
        }

        const data = await response.json();
        if (data.success) {
          setOrders(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching pending orders:", error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingOrders();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) {
      return (
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle className="mr-1 h-3 w-3" />
          {confidence}%
        </Badge>
      );
    }
    if (confidence >= 75) {
      return (
        <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
          <AlertCircle className="mr-1 h-3 w-3" />
          {confidence}%
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
        <AlertCircle className="mr-1 h-3 w-3" />
        {confidence}%
      </Badge>
    );
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.extractedData.customerName.value
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.extractedData.customerCode.value
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {t("review.title", "Review Queue")}
              </h1>
              <p className="text-muted-foreground">
                {t(
                  "review.description",
                  "Review and approve extracted order data"
                )}
              </p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {filteredOrders.length} {t("order.status.pending", "pending")}
            </Badge>
          </div>

          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={t("history.search", "Search orders...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  {t("history.filter.all", "Filter")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          {isLoading ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Loader2 className="h-16 w-16 animate-spin text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  {t("common.loading", "Loading pending orders...")}
                </p>
              </CardContent>
            </Card>
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="h-16 w-16 text-muted-foreground/50" />
                <h3 className="mt-4 text-xl font-medium">
                  {t("review.empty", "No orders pending review")}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {t(
                    "review.emptyDescription",
                    "Upload order documents to start processing"
                  )}
                </p>
                <Button className="mt-6" onClick={() => router.push("/")}>
                  {t("newUpload", "Upload Documents")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card
                  key={order.orderId}
                  className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                  onClick={() => router.push(`/review/${order.orderId}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">
                              {order.extractedData.customerName.value}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {order.sourceType.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {order.extractedData.customerCode.value} • {order.orderId}
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {formatDate(order.createdAt)}
                            </span>
                            <span>
                              {order.extractedData.items.length}{" "}
                              {t("history.columns.items", "items")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-lg font-semibold">
                            {formatCurrency(order.extractedData.totalAmount)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t("order.fields.orderDate", "Order Date")}:{" "}
                            {order.extractedData.orderDate.value}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {getConfidenceBadge(Math.round(order.confidence))}
                          <span className="text-xs text-muted-foreground">
                            {t("review.confidence", "AI Confidence")}
                          </span>
                        </div>

                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
