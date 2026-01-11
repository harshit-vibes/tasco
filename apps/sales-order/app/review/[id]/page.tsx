"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Separator,
  Textarea,
  Select,
} from "@tasco/ui";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Edit2,
  Save,
  X,
  Trash2,
  Plus,
  Download,
  Loader2,
} from "@tasco/ui/icons";
import { useTranslation } from "@tasco/i18n";
import { toast } from "sonner";
import { DocumentViewer } from "@/components/document-viewer";
import {
  ConfidenceIndicator,
  FieldWithConfidence,
} from "@/components/confidence-indicator";
import { exportSingleOrderToBravo, type BravoOrder } from "@tasco/export";

interface OrderItem {
  id: string;
  productCode: { value: string; confidence: number };
  productName: { value: string; confidence: number };
  quantity: { value: number; confidence: number };
  unit: { value: string; confidence: number };
  unitPrice: { value: number; confidence: number };
  amount: number;
}

interface Order {
  orderId: string;
  status: string;
  sourceType: string;
  sourceUrl: string;
  fileName: string;
  confidence: number;
  createdAt: string;
  extractedData: {
    customerName: { value: string; confidence: number };
    customerCode: { value: string; confidence: number };
    orderDate: { value: string; confidence: number };
    deliveryDate: { value: string; confidence: number };
    items: OrderItem[];
    totalAmount: number;
    notes: { value: string; confidence: number };
  };
}

export default function ReviewDetailPage() {
  const { t } = useTranslation("app");
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fullOrder, setFullOrder] = useState<Order | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [originalData, setOriginalData] = useState<any>(null);
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [internalNotes, setInternalNotes] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>("");

  // Fetch order data on mount
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/orders/${orderId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch order");
        }

        const data = await response.json();
        if (data.success && data.data) {
          setFullOrder(data.data);
          setOrderData(data.data.extractedData);
          setItems(data.data.extractedData.items);
          setOriginalData(data.data.extractedData);
          setAssignedTo(data.data.assignedTo || "");
          setInternalNotes(data.data.internalNotes || "");
          setTags(data.data.tags || []);
        } else {
          toast.error("Order not found");
          router.push("/review");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Failed to load order");
        router.push("/review");
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, router]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleItemChange = (
    index: number,
    field: keyof OrderItem,
    value: any
  ) => {
    const newItems = [...items];
    if (field === "amount") {
      newItems[index] = { ...newItems[index], [field]: value };
    } else {
      newItems[index] = {
        ...newItems[index],
        [field]: { ...newItems[index][field as any], value },
      };
    }

    // Recalculate amount if quantity or unitPrice changed
    if (field === "quantity" || field === "unitPrice") {
      newItems[index].amount =
        newItems[index].quantity.value * newItems[index].unitPrice.value;
    }

    setItems(newItems);

    // Recalculate total
    const total = newItems.reduce((sum, item) => sum + item.amount, 0);
    setOrderData({ ...orderData, totalAmount: total });
  };

  const addItem = () => {
    const newItem: OrderItem = {
      id: `${Date.now()}`,
      productCode: { value: "", confidence: 0 },
      productName: { value: "", confidence: 0 },
      quantity: { value: 0, confidence: 0 },
      unit: { value: "thùng", confidence: 0 },
      unitPrice: { value: 0, confidence: 0 },
      amount: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);

    // Recalculate total
    const total = newItems.reduce((sum, item) => sum + item.amount, 0);
    setOrderData({ ...orderData, totalAmount: total });
  };

  const handleApprove = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "approved",
          reviewedBy: "user", // TODO: Get from auth
          extractedData: { ...orderData, items },
          assignedTo: assignedTo || undefined,
          internalNotes: internalNotes || undefined,
          tags: tags.length > 0 ? tags : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve order");
      }

      toast.success(t("common.success", "Order approved and sent for export"));
      router.push("/review");
    } catch (error) {
      console.error("Error approving order:", error);
      toast.error("Failed to approve order");
    }
  };

  const handleReject = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "rejected",
          reviewedBy: "user", // TODO: Get from auth
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject order");
      }

      toast.error("Order rejected");
      router.push("/review");
    } catch (error) {
      console.error("Error rejecting order:", error);
      toast.error("Failed to reject order");
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          extractedData: { ...orderData, items },
          assignedTo: assignedTo || undefined,
          internalNotes: internalNotes || undefined,
          tags: tags.length > 0 ? tags : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save changes");
      }

      setOrderData({ ...orderData, items });
      setOriginalData({ ...orderData, items });
      setIsEditing(false);
      toast.success(t("common.success", "Changes saved"));
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Failed to save changes");
    }
  };

  const handleExport = () => {
    if (!fullOrder) return;

    const bravoOrder: BravoOrder = {
      id: fullOrder.orderId,
      customerName: orderData.customerName,
      customerCode: orderData.customerCode,
      orderDate: orderData.orderDate,
      deliveryDate: orderData.deliveryDate,
      items: items,
      totalAmount: orderData.totalAmount,
      notes: orderData.notes,
    };

    exportSingleOrderToBravo(bravoOrder);
    toast.success("Order exported to Bravo ERP format");
  };

  // Show loading state while fetching
  if (isLoading || !fullOrder || !orderData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">
            {t("common.loading", "Loading order...")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b bg-background px-6 py-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("back", "Back")}
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-lg font-semibold">
              {t("review.orderDetails", "Order Details")}
            </h1>
            <p className="text-sm text-muted-foreground">{orderId}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ConfidenceIndicator confidence={fullOrder.confidence} />
          <Badge variant="outline">
            {fullOrder.sourceType.toUpperCase()}
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Export to Bravo
          </Button>
          {!isEditing ? (
            <>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={handleApprove}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {t("review.approve", "Approve")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                {t("review.edit", "Edit")}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleReject}
              >
                <XCircle className="mr-2 h-4 w-4" />
                {t("review.reject", "Reject")}
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                {t("review.save", "Save")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setItems(originalData.items);
                  setOrderData(originalData);
                  setIsEditing(false);
                }}
              >
                <X className="mr-2 h-4 w-4" />
                {t("review.cancel", "Cancel")}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Split-screen Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Document Viewer - Left Side */}
        <div className="w-1/2 border-r">
          <DocumentViewer
            fileUrl={fullOrder.sourceUrl}
            fileName={fullOrder.fileName}
            fileType={fullOrder.sourceType}
            className="h-full rounded-none border-0"
          />
        </div>

        {/* Form - Right Side */}
        <div className="flex w-1/2 flex-col overflow-auto">
          <div className="flex-1 space-y-6 p-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("review.customerInfo", "Customer Information")}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <FieldWithConfidence
                  label={t("order.fields.customerName", "Customer Name")}
                  confidence={orderData.customerName.confidence}
                  value={orderData.customerName.value}
                  onChange={(value) =>
                    setOrderData({
                      ...orderData,
                      customerName: { ...orderData.customerName, value },
                    })
                  }
                />
                <FieldWithConfidence
                  label={t("order.fields.customerCode", "Customer Code")}
                  confidence={orderData.customerCode.confidence}
                  value={orderData.customerCode.value}
                  onChange={(value) =>
                    setOrderData({
                      ...orderData,
                      customerCode: { ...orderData.customerCode, value },
                    })
                  }
                />
                <FieldWithConfidence
                  label={t("order.fields.orderDate", "Order Date")}
                  confidence={orderData.orderDate.confidence}
                  value={orderData.orderDate.value}
                  onChange={(value) =>
                    setOrderData({
                      ...orderData,
                      orderDate: { ...orderData.orderDate, value },
                    })
                  }
                />
                <FieldWithConfidence
                  label={t("order.fields.deliveryDate", "Delivery Date")}
                  confidence={orderData.deliveryDate.confidence}
                  value={orderData.deliveryDate.value}
                  onChange={(value) =>
                    setOrderData({
                      ...orderData,
                      deliveryDate: { ...orderData.deliveryDate, value },
                    })
                  }
                />
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">
                  {t("review.orderItems", "Order Items")}
                </CardTitle>
                {isEditing && (
                  <Button variant="outline" size="sm" onClick={addItem}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("actions.add", "Add Item")}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="rounded-lg border p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          Item {index + 1}
                        </span>
                        {isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-destructive"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Remove
                          </Button>
                        )}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <FieldWithConfidence
                          label={t(
                            "order.fields.productCode",
                            "Product Code"
                          )}
                          confidence={item.productCode.confidence}
                          value={item.productCode.value}
                          onChange={(value) =>
                            handleItemChange(index, "productCode", value)
                          }
                        />
                        <FieldWithConfidence
                          label={t(
                            "order.fields.productName",
                            "Product Name"
                          )}
                          confidence={item.productName.confidence}
                          value={item.productName.value}
                          onChange={(value) =>
                            handleItemChange(index, "productName", value)
                          }
                        />
                        <FieldWithConfidence
                          label={t("order.fields.quantity", "Quantity")}
                          confidence={item.quantity.confidence}
                          value={String(item.quantity.value)}
                          onChange={(value) =>
                            handleItemChange(
                              index,
                              "quantity",
                              parseInt(value) || 0
                            )
                          }
                        />
                        <FieldWithConfidence
                          label={t("order.fields.unit", "Unit")}
                          confidence={item.unit.confidence}
                          value={item.unit.value}
                          onChange={(value) =>
                            handleItemChange(index, "unit", value)
                          }
                        />
                        <FieldWithConfidence
                          label={t("order.fields.unitPrice", "Unit Price")}
                          confidence={item.unitPrice.confidence}
                          value={String(item.unitPrice.value)}
                          onChange={(value) =>
                            handleItemChange(
                              index,
                              "unitPrice",
                              parseInt(value) || 0
                            )
                          }
                        />
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            {t("order.fields.amount", "Amount")}
                          </label>
                          <Input
                            value={formatCurrency(item.amount)}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between border-t pt-4">
                  <span className="text-lg font-semibold">
                    {t("order.fields.totalAmount", "Total Amount")}
                  </span>
                  <span className="text-xl font-bold">
                    {formatCurrency(orderData.totalAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Customer Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("order.fields.notes", "Customer Notes")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FieldWithConfidence
                  label=""
                  confidence={orderData.notes.confidence}
                  value={orderData.notes.value}
                  onChange={(value) =>
                    setOrderData({
                      ...orderData,
                      notes: { ...orderData.notes, value },
                    })
                  }
                />
              </CardContent>
            </Card>

            {/* Assignment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("order.assignment", "Assignment")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <label htmlFor="assignedTo" className="text-sm font-medium">
                    {t("order.assignedTo", "Assigned To")}
                  </label>
                  <Select
                    id="assignedTo"
                    value={assignedTo}
                    onChange={setAssignedTo}
                    placeholder={t("order.selectAssignee", "Select team member")}
                    options={[
                      { value: "", label: t("order.unassigned", "Unassigned") },
                      { value: "nguyen.van.a@inochi.vn", label: "Nguyễn Văn A" },
                      { value: "tran.thi.b@inochi.vn", label: "Trần Thị B" },
                      { value: "le.van.c@inochi.vn", label: "Lê Văn C" },
                      { value: "pham.thi.d@inochi.vn", label: "Phạm Thị D" },
                      { value: "hoang.van.e@inochi.vn", label: "Hoàng Văn E" },
                    ]}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("order.tags", "Tags")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <label htmlFor="tagInput" className="text-sm font-medium">
                    {t("order.tags.description", "Categorize this order")}
                  </label>
                  <Input
                    id="tagInput"
                    placeholder={t("order.tags.placeholder", "Type and press Enter to add tag...")}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="px-3 py-1 text-sm flex items-center gap-2"
                        >
                          {tag}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={() => handleRemoveTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Internal Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("order.internalNotes", "Internal Notes")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <label htmlFor="internalNotes" className="text-sm font-medium">
                    {t("order.internalNotes.description", "Team collaboration notes")}
                  </label>
                  <Textarea
                    id="internalNotes"
                    placeholder={t("order.internalNotes.placeholder", "Add notes for your team...")}
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
