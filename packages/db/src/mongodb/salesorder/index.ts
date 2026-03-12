/**
 * MongoDB Sales Order Module Exports
 *
 * This module provides MongoDB operations for the sales-order app,
 * as part of the migration from DynamoDB.
 */

// Type exports
export type {
  // Confidence types
  ConfidenceField,
  OrderItem,
  ExtractedOrderData,
  // Validation types
  ValidationIssue,
  ValidationResult,
  // Processing types
  ProcessingMetrics,
  // Order types
  OrderDocument,
  Order,
  CreateOrderInput,
  UpdateOrderInput,
  OrderStatus,
  SourceType,
  // Activity types
  OrderActivityDocument,
  OrderActivity,
  CreateActivityInput,
  ActivityAction,
  ActivityDetails,
  // Metrics types
  OrderMetricsDocument,
  OrderMetrics,
  MetricType,
  MetricValues,
  AggregatedMetrics,
  // Pagination
  PaginatedResult,
} from "./types";

// Utility functions from types
export { calculateOverallConfidence } from "./types";

// Order operations
export {
  generateOrderId,
  createOrder,
  getOrder,
  updateOrder,
  deleteOrder,
  listOrdersByEntity,
  listOrdersByStatus,
  listAllOrders,
  getRecentOrders,
  searchOrders,
  getOrderCountByStatus,
  getOrderCountByEntity,
  getOrdersCreatedToday,
  getPipelineStatus,
} from "./orders";

// Activity operations
export {
  logActivity,
  getOrderActivity,
  getRecentActivity,
  getEntityActivity,
  deleteOrderActivity,
} from "./activity";

// Metrics operations
export {
  getOrCreateMetrics,
  updateMetrics,
  getMetrics,
  getMetricsRange,
  getTodayMetrics,
  getWeekMetrics,
  getMonthMetrics,
  aggregateMetrics,
} from "./metrics";
