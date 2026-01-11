/**
 * Sales Order data types for DynamoDB persistence
 */

export type OrderStatus = "pending" | "reviewing" | "approved" | "rejected" | "exported";

export type SourceType = "pdf" | "image" | "email" | "zalo";

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

export type MetricType = "daily" | "weekly" | "monthly";

/**
 * Field with confidence score
 */
export interface ConfidenceField<T = string> {
  value: T;
  confidence: number;
}

/**
 * Order line item
 */
export interface OrderItem {
  id: string;
  productCode: ConfidenceField<string>;
  productName: ConfidenceField<string>;
  quantity: ConfidenceField<number>;
  unit: ConfidenceField<string>;
  unitPrice: ConfidenceField<number>;
  amount: number;
}

/**
 * Extracted order data with confidence scores
 */
export interface ExtractedOrderData {
  customerName: ConfidenceField<string>;
  customerCode: ConfidenceField<string>;
  orderDate: ConfidenceField<string>;
  deliveryDate: ConfidenceField<string>;
  items: OrderItem[];
  totalAmount: number;
  notes: ConfidenceField<string>;
}

/**
 * Validation issue
 */
export interface ValidationIssue {
  field: string;
  severity: "error" | "warning" | "info";
  message: string;
  suggestion?: string;
}

/**
 * Validation result from validation agent
 */
export interface ValidationResult {
  overallScore: number;
  isValid: boolean;
  issues: ValidationIssue[];
  recommendations: string[];
  confidence: "high" | "medium" | "low";
}

/**
 * Processing time metrics
 */
export interface ProcessingMetrics {
  ocrMs: number;
  extractionMs: number;
  validationMs: number;
  totalMs: number;
}

/**
 * Main Order entity
 */
export interface Order {
  // Primary identifiers
  orderId: string;
  entityId: string;

  // Order metadata
  status: OrderStatus;
  sourceType: SourceType;
  sourceUrl: string;
  fileName: string;
  fileSize: number;

  // Extraction results
  confidence: number;
  extractedData: ExtractedOrderData;

  // Validation results (optional)
  validation?: ValidationResult;

  // Processing metadata
  processingTime: ProcessingMetrics;

  // Audit trail
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  reviewedBy?: string;
  reviewedAt?: string;
  exportedAt?: string;
  exportedBy?: string;

  // Assignment (Week 2)
  assignedTo?: string;      // User ID or email
  assignedAt?: string;      // ISO timestamp

  // Categorization (Week 2)
  tags?: string[];          // Flexible categorization tags

  // Collaboration (Week 2)
  internalNotes?: string;   // Team notes for collaboration

  // Agent IDs
  extractionAgentId: string;
  validationAgentId?: string;

  // TTL for automatic cleanup (optional)
  ttl?: number;
}

/**
 * Create order input
 */
export interface CreateOrderInput {
  entityId: string;
  sourceType: SourceType;
  sourceUrl: string;
  fileName: string;
  fileSize: number;
  extractedData: ExtractedOrderData;
  confidence: number;
  processingTime: ProcessingMetrics;
  createdBy: string;
  extractionAgentId: string;
  validationAgentId?: string;
}

/**
 * Update order input
 */
export interface UpdateOrderInput {
  status?: OrderStatus;
  extractedData?: ExtractedOrderData;
  confidence?: number;
  validation?: ValidationResult;
  reviewedBy?: string;
  reviewedAt?: string;
  exportedAt?: string;
  exportedBy?: string;
  validationAgentId?: string;
  // Week 2 additions
  assignedTo?: string;
  assignedAt?: string;
  tags?: string[];
  internalNotes?: string;
}

/**
 * Order activity log entry
 */
export interface OrderActivity {
  activityId: string;
  orderId: string;
  entityId: string;
  action: ActivityAction;
  details: {
    userId?: string;
    userName?: string;
    changes?: Record<string, any>;
    reason?: string;
  };
  timestamp: string;
  ttl?: number;
}

/**
 * Create activity input
 */
export interface CreateActivityInput {
  orderId: string;
  entityId: string;
  action: ActivityAction;
  details: {
    userId?: string;
    userName?: string;
    changes?: Record<string, any>;
    reason?: string;
  };
}

/**
 * Order metrics for dashboard
 */
export interface OrderMetrics {
  metricType: MetricType;
  date: string;
  entityId: string;
  metrics: {
    totalOrders: number;
    approvedOrders: number;
    rejectedOrders: number;
    exportedOrders: number;
    avgConfidence: number;
    avgProcessingTimeMs: number;
    totalTimeSavedHours: number;
  };
  updatedAt: string;
}

/**
 * Order Customer entity (optional master data)
 * Named OrderCustomer to avoid conflict with lifecycle Customer
 */
export interface OrderCustomer {
  customerCode: string;
  customerName: string;
  entityId: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  creditLimit?: number;
  paymentTerms?: string;
  totalOrders: number;
  lastOrderDate?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Product entity (optional master data)
 */
export interface Product {
  productCode: string;
  productName: string;
  entityId: string;
  unitPrice: number;
  unit: string;
  isActive: boolean;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Pagination result
 */
export interface PaginatedResult<T> {
  items: T[];
  lastEvaluatedKey?: Record<string, unknown>;
  hasMore: boolean;
}

/**
 * DynamoDB item types (internal use)
 */
export interface OrderItem_DB extends Order {
  // DynamoDB doesn't need pk/sk for single-table design with orderId as primary key
}

export interface ActivityItem_DB extends OrderActivity {
  pk: string; // orderId
  sk: string; // timestamp#activityId
}

export interface MetricsItem_DB extends OrderMetrics {
  pk: string; // metricType#date
  sk: string; // entityId
}
