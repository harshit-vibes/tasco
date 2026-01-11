"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from "@tasco/ui";
import { FileText, ArrowRight, Clock, CheckCircle, Loader2 } from "@tasco/ui/icons";
import { useTranslation } from "@tasco/i18n";
import { FileDropzone, UploadedFile } from "../components/upload/file-dropzone";

interface Order {
  orderId: string;
  extractedData: {
    customerName: { value: string };
    orderDate: { value: string };
    items: any[];
  };
  status: "reviewing" | "approved" | "exported" | "rejected";
  confidence: number;
}

export default function UploadPage() {
  const { t } = useTranslation("app");
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  // Fetch recent orders on mount
  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setIsLoadingOrders(true);
        const response = await fetch(
          "/api/orders?limit=5&entityId=inochi&sortBy=updatedAt&sortOrder=desc"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch recent orders");
        }

        const data = await response.json();
        if (data.success) {
          setRecentOrders(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching recent orders:", error);
        setRecentOrders([]);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchRecentOrders();
  }, []);

  // Get category badges based on order characteristics
  const getCategoryBadges = (order: Order) => {
    const badges = [];
    const totalAmount = order.extractedData.totalAmount;
    const itemCount = order.extractedData.items.length;

    // High value orders
    if (totalAmount > 5000000) {
      badges.push(
        <Badge key="high-value" variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs">
          High Value
        </Badge>
      );
    }

    // Large orders
    if (itemCount > 6) {
      badges.push(
        <Badge key="large-order" variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xs">
          Large Order
        </Badge>
      );
    }

    // Low confidence
    if (order.confidence < 80) {
      badges.push(
        <Badge key="needs-review" variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs">
          Needs Review
        </Badge>
      );
    }

    return badges;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "reviewing":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            {t("order.status.reviewing", "Reviewing")}
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="mr-1 h-3 w-3" />
            {t("order.status.approved", "Approved")}
          </Badge>
        );
      case "exported":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <CheckCircle className="mr-1 h-3 w-3" />
            {t("order.status.exported", "Exported")}
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

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t("upload.title", "New Upload")}
            </h1>
            <p className="text-muted-foreground">
              {t(
                "upload.description",
                "Upload order documents for automatic AI extraction and processing"
              )}
            </p>
          </div>

          {/* Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {t("upload.title", "Upload Documents")}
              </CardTitle>
              <CardDescription>
                {t(
                  "upload.description",
                  "Drag and drop order documents for automatic data extraction"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileDropzone onFilesUploaded={handleFilesUploaded} />
            </CardContent>
          </Card>

          {/* Recent Orders Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("upload.recentUploads", "Recent Orders")}</CardTitle>
                <CardDescription>
                  {t(
                    "review.description",
                    "Review and approve extracted order data"
                  )}
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => router.push("/history")}>
                {t("upload.viewAll", "View All")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingOrders ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    {t("common.loading", "Loading recent orders...")}
                  </p>
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">
                    {t("upload.noUploads", "No uploads yet")}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t(
                      "upload.uploadFirst",
                      "Upload your first order document to get started"
                    )}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.orderId}
                      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50 cursor-pointer"
                      onClick={() => router.push(`/review/${order.orderId}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-medium">
                              {order.extractedData.customerName.value}
                            </p>
                            {getCategoryBadges(order)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{order.extractedData.orderDate.value}</span>
                            <span>•</span>
                            <span>
                              {order.extractedData.items.length}{" "}
                              {t("history.columns.items", "items")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {Math.round(order.confidence)}%{" "}
                            {t("review.confidence", "confidence")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.orderId}
                          </p>
                        </div>
                        {getStatusBadge(order.status)}
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
