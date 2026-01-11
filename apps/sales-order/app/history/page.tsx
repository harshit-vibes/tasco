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
  Tabs,
  TabsList,
  TabsTrigger,
} from "@tasco/ui";
import {
  FileText,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  MoreHorizontal,
  Eye,
  Trash2,
  Upload as UploadIcon,
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
  status: string;
  confidence: number;
  createdAt: string;
}

type OrderStatus = "all" | "reviewing" | "approved" | "rejected" | "exported";

export default function HistoryPage() {
  const { t } = useTranslation("app");
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus>("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch orders whenever status filter changes
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const statusParam =
          statusFilter === "all" ? "" : `&status=${statusFilter}`;
        const response = await fetch(
          `/api/orders?entityId=inochi&sortBy=createdAt&sortOrder=desc${statusParam}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();
        if (data.success) {
          setOrders(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter]);

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
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "reviewing":
        return (
          <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
            <Clock className="mr-1 h-3 w-3" />
            {t("order.status.reviewing", "Reviewing")}
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="mr-1 h-3 w-3" />
            {t("order.status.approved", "Approved")}
          </Badge>
        );
      case "exported":
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <UploadIcon className="mr-1 h-3 w-3" />
            {t("order.status.exported", "Exported")}
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <XCircle className="mr-1 h-3 w-3" />
            {t("order.status.rejected", "Rejected")}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {t("order.status.pending", "Pending")}
          </Badge>
        );
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.extractedData.customerName.value
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.extractedData.customerCode.value
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const statusCounts = {
    all: orders.length,
    reviewing: orders.filter((o) => o.status === "reviewing").length,
    approved: orders.filter((o) => o.status === "approved").length,
    exported: orders.filter((o) => o.status === "exported").length,
    rejected: orders.filter((o) => o.status === "rejected").length,
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {t("history.title", "Order History")}
              </h1>
              <p className="text-muted-foreground">
                {t("history.description", "View all processed orders")}
              </p>
            </div>
            <Button onClick={() => router.push("/")}>
              <UploadIcon className="mr-2 h-4 w-4" />
              {t("newUpload", "New Upload")}
            </Button>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6 space-y-4">
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
                  <Download className="mr-2 h-4 w-4" />
                  {t("actions.export", "Export")}
                </Button>
              </div>

              <Tabs
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as OrderStatus)}
              >
                <TabsList>
                  <TabsTrigger value="all">
                    {t("history.filter.all", "All")} ({statusCounts.all})
                  </TabsTrigger>
                  <TabsTrigger value="reviewing">
                    {t("order.status.reviewing", "Reviewing")} ({statusCounts.reviewing})
                  </TabsTrigger>
                  <TabsTrigger value="approved">
                    {t("order.status.approved", "Approved")} ({statusCounts.approved})
                  </TabsTrigger>
                  <TabsTrigger value="exported">
                    {t("order.status.exported", "Exported")} ({statusCounts.exported})
                  </TabsTrigger>
                  <TabsTrigger value="rejected">
                    {t("order.status.rejected", "Rejected")} ({statusCounts.rejected})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Loader2 className="h-16 w-16 animate-spin text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">
                    {t("common.loading", "Loading orders...")}
                  </p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <FileText className="h-16 w-16 text-muted-foreground/50" />
                  <h3 className="mt-4 text-xl font-medium">
                    {t("history.empty", "No orders yet")}
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    {t(
                      "history.emptyDescription",
                      "Processed orders will appear here"
                    )}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50 text-left text-sm">
                        <th className="px-4 py-3 font-medium">
                          {t("history.columns.orderId", "Order ID")}
                        </th>
                        <th className="px-4 py-3 font-medium">
                          {t("history.columns.customer", "Customer")}
                        </th>
                        <th className="px-4 py-3 font-medium">
                          {t("history.columns.date", "Date")}
                        </th>
                        <th className="px-4 py-3 font-medium text-center">
                          {t("history.columns.items", "Items")}
                        </th>
                        <th className="px-4 py-3 font-medium text-right">
                          {t("history.columns.total", "Total")}
                        </th>
                        <th className="px-4 py-3 font-medium text-center">
                          {t("history.columns.status", "Status")}
                        </th>
                        <th className="px-4 py-3 font-medium text-center">
                          {t("history.columns.actions", "Actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr
                          key={order.orderId}
                          className="border-b last:border-0 hover:bg-muted/30 cursor-pointer"
                          onClick={() => router.push(`/review/${order.orderId}`)}
                        >
                          <td className="px-4 py-4">
                            <span className="font-medium">{order.orderId}</span>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium">
                                {order.extractedData.customerName.value}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {order.extractedData.customerCode.value}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            {formatDate(order.extractedData.orderDate.value)}
                          </td>
                          <td className="px-4 py-4 text-center">
                            {order.extractedData.items.length}
                          </td>
                          <td className="px-4 py-4 text-right font-medium">
                            {formatCurrency(order.extractedData.totalAmount)}
                          </td>
                          <td className="px-4 py-4 text-center">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div
                              className="flex justify-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
