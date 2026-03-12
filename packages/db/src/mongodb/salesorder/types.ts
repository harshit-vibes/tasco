/**
 * MongoDB Types for Sales Order App
 */

import { ObjectId } from "mongodb";

// ============================================
// Confidence & Value Types
// ============================================

export interface ConfidenceField<T> {
  value: T;
  confidence: number; // 0-100
}

export interface OrderItem {
  id: string;
  productCode: ConfidenceField<string>;
  productName: ConfidenceField<string>;
  quantity: ConfidenceField<number>;
  unit: ConfidenceField<string>;
  unitPrice: ConfidenceField<number>;
  amount: number; // Calculated: quantity × unitPrice
}

export interface ExtractedOrderData {
  customerName: ConfidenceField<string>;
  customerCode: ConfidenceField<string>;
  orderDate: ConfidenceField<string>;
  deliveryDate: ConfidenceField<string>;
  items: OrderItem[];
  totalAmount: number;
  notes: ConfidenceField<string>;
}

// ============================================
// Validation Types
// ============================================

export interface ValidationIssue {
  field: string;
  issue: string;
  severity: "error" | "warning" | "info";
  suggestion?: string;
}

export interface ValidationResult {
  overallScore: number;
  isValid: boolean;
  issues: ValidationIssue[];
  recommendations: string[];
  confidence: "high" | "medium" | "low";
}

// ============================================
// Processing Types
// ============================================

export interface ProcessingMetrics {
  ocrMs: number;
  extractionMs: number;
  validationMs: number;
  totalMs: number;
}

// ============================================
// Order Types
// ============================================

export type OrderStatus = "pending" | "reviewing" | "approved" | "rejected" | "exported";
export type SourceType = "pdf" | "image" | "email" | "zalo";

/**
 * MongoDB document for orders
 */
export interface OrderDocument {
  _id?: ObjectId;
  orderId: string;
  entityId: string;
  status: OrderStatus;
  sourceType: SourceType;
  sourceUrl: string;
  fileName: string;
  fileSize: number;
  confidence: number;
  extractedData: ExtractedOrderData;
  validation?: ValidationResult;
  processingTime: ProcessingMetrics;
  createdBy: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  exportedAt?: Date;
  exportedBy?: string;
  assignedTo?: string;
  assignedAt?: Date;
  tags?: string[];
  internalNotes?: string;
  extractionAgentId: string;
  validationAgentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * API response type for orders
 */
export interface Order {
  id: string;
  orderId: string;
  entityId: string;
  status: OrderStatus;
  sourceType: SourceType;
  sourceUrl: string;
  fileName: string;
  fileSize: number;
  confidence: number;
  extractedData: ExtractedOrderData;
  validation?: ValidationResult;
  processingTime: ProcessingMetrics;
  createdBy: string;
  reviewedBy?: string;
  reviewedAt?: string;
  exportedAt?: string;
  exportedBy?: string;
  assignedTo?: string;
  assignedAt?: string;
  tags?: string[];
  internalNotes?: string;
  extractionAgentId: string;
  validationAgentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  entityId: string;
  sourceType: SourceType;
  sourceUrl: string;
  fileName: string;
  fileSize: number;
  confidence: number;
  extractedData: ExtractedOrderData;
  processingTime: ProcessingMetrics;
  createdBy: string;
  extractionAgentId: string;
  validationAgentId?: string;
  validation?: ValidationResult;
  tags?: string[];
  internalNotes?: string;
}

export interface UpdateOrderInput {
  status?: OrderStatus;
  confidence?: number;
  extractedData?: ExtractedOrderData;
  validation?: ValidationResult;
  validationAgentId?: string;
  reviewedBy?: string;
  exportedBy?: string;
  assignedTo?: string;
  tags?: string[];
  internalNotes?: string;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Calculate overall confidence from extracted order data
 */
export function calculateOverallConfidence(data: ExtractedOrderData): number {
  const fields = [
    data.customerName?.confidence,
    data.customerCode?.confidence,
    data.orderDate?.confidence,
    data.deliveryDate?.confidence,
    data.notes?.confidence,
  ].filter((c): c is number => c !== undefined && c !== null);

  // Add item-level confidence
  for (const item of data.items) {
    if (item.productCode?.confidence) fields.push(item.productCode.confidence);
    if (item.productName?.confidence) fields.push(item.productName.confidence);
    if (item.quantity?.confidence) fields.push(item.quantity.confidence);
    if (item.unit?.confidence) fields.push(item.unit.confidence);
    if (item.unitPrice?.confidence) fields.push(item.unitPrice.confidence);
  }

  if (fields.length === 0) return 0;

  const total = fields.reduce((sum, c) => sum + c, 0);
  return Math.round(total / fields.length);
}

// ============================================
// Activity Types
// ============================================

export type ActivityAction =
  | "uploaded"
  | "extracted"
  | "validated"
  | "reviewed"
  | "approved"
  | "rejected"
  | "exported"
  | "deleted"
  | "updated";

export interface ActivityDetails {
  userId?: string;
  userName?: string;
  changes?: Record<string, unknown>;
  reason?: string;
}

/**
 * MongoDB document for activity logs
 */
export interface OrderActivityDocument {
  _id?: ObjectId;
  activityId: string;
  orderId: string;
  entityId: string;
  action: ActivityAction;
  details: ActivityDetails;
  timestamp: Date;
}

/**
 * API response type for activity
 */
export interface OrderActivity {
  id: string;
  activityId: string;
  orderId: string;
  entityId: string;
  action: ActivityAction;
  details: ActivityDetails;
  timestamp: string;
}

export interface CreateActivityInput {
  orderId: string;
  entityId: string;
  action: ActivityAction;
  details?: ActivityDetails;
}

// ============================================
// Metrics Types
// ============================================

export type MetricType = "daily" | "weekly" | "monthly";

export interface MetricValues {
  totalOrders: number;
  approvedOrders: number;
  rejectedOrders: number;
  exportedOrders: number;
  avgConfidence: number;
  avgProcessingTimeMs: number;
  totalTimeSavedHours: number;
}

/**
 * MongoDB document for metrics
 */
export interface OrderMetricsDocument {
  _id?: ObjectId;
  metricType: MetricType;
  date: string;
  entityId: string;
  metrics: MetricValues;
  updatedAt: Date;
}

/**
 * API response type for metrics
 */
export interface OrderMetrics {
  id: string;
  metricType: MetricType;
  date: string;
  entityId: string;
  metrics: MetricValues;
  updatedAt: string;
}

export interface AggregatedMetrics {
  totalOrders: number;
  approvedOrders: number;
  rejectedOrders: number;
  exportedOrders: number;
  avgConfidence: number;
  avgProcessingTimeMs: number;
  totalTimeSavedHours: number;
  approvalRate: number;
  rejectionRate: number;
}

// ============================================
// Pagination Types
// ============================================

export interface PaginatedResult<T> {
  items: T[];
  hasMore: boolean;
  total?: number;
}
