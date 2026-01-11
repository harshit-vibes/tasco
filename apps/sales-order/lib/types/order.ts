/**
 * Type definitions for Sales Order processing
 */

export interface ConfidenceField<T> {
  value: T;
  confidence: number;
}

export interface ExtractedOrderItem {
  productCode: ConfidenceField<string>;
  productName: ConfidenceField<string>;
  quantity: ConfidenceField<number>;
  unit: ConfidenceField<string>;
  unitPrice: ConfidenceField<number>;
}

export interface ExtractedOrderData {
  customerName: ConfidenceField<string>;
  customerCode: ConfidenceField<string>;
  orderDate: ConfidenceField<string>;
  deliveryDate: ConfidenceField<string>;
  items: ExtractedOrderItem[];
  notes: ConfidenceField<string>;
}

export interface ValidationIssue {
  field: string;
  severity: "error" | "warning" | "info";
  message: string;
  suggestion?: string;
}

export interface ValidationResult {
  overallScore: number;
  isValid: boolean;
  issues: ValidationIssue[];
  recommendations: string[];
  confidence: "high" | "medium" | "low";
}

export interface ProcessedOrder {
  id: string;
  status: "uploading" | "processing" | "reviewing" | "approved" | "rejected" | "error";
  sourceFile: {
    name: string;
    type: string;
    size: number;
    url?: string;
  };
  ocrText?: string;
  extractedData?: ExtractedOrderData;
  validation?: ValidationResult;
  overallConfidence?: number;
  createdAt: string;
  updatedAt: string;
  error?: string;
}

/**
 * Calculate overall confidence score from extracted data
 */
export function calculateOverallConfidence(data: ExtractedOrderData): number {
  const scores: number[] = [
    data.customerName.confidence,
    data.customerCode.confidence,
    data.orderDate.confidence,
    data.deliveryDate.confidence,
    data.notes.confidence,
  ];

  // Add item confidence scores
  data.items.forEach((item) => {
    scores.push(
      item.productCode.confidence,
      item.productName.confidence,
      item.quantity.confidence,
      item.unit.confidence,
      item.unitPrice.confidence
    );
  });

  // Calculate weighted average
  const total = scores.reduce((sum, score) => sum + score, 0);
  return Math.round(total / scores.length);
}

/**
 * Calculate amount for an order item
 */
export function calculateItemAmount(item: ExtractedOrderItem): number {
  return item.quantity.value * item.unitPrice.value;
}

/**
 * Calculate total order amount
 */
export function calculateTotalAmount(items: ExtractedOrderItem[]): number {
  return items.reduce((total, item) => total + calculateItemAmount(item), 0);
}
