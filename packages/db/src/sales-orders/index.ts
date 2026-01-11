/**
 * Sales Order module - Public exports
 */

// Export all types
export type {
  Order,
  OrderStatus,
  SourceType,
  ActivityAction,
  MetricType,
  ConfidenceField,
  OrderItem,
  ExtractedOrderData,
  ValidationIssue,
  ValidationResult,
  ProcessingMetrics,
  CreateOrderInput,
  UpdateOrderInput,
  OrderActivity,
  CreateActivityInput,
  OrderMetrics,
  OrderCustomer,
  Product,
  PaginatedResult,
} from "./types";

// Export order operations
export {
  createOrder,
  getOrder,
  updateOrder,
  deleteOrder,
  listOrdersByStatus,
  listOrdersByEntity,
  listOrdersByEntityAndStatus,
  listAllOrders,
  getOrderCountByStatus,
  getOrderCountByEntity,
  getRecentOrders,
  searchOrders,
} from "./orders";

// Export activity operations
export {
  logActivity,
  getOrderActivity,
  getRecentActivity,
} from "./activity";

// Export metrics operations
export {
  updateMetrics,
  getMetrics,
  getMetricsRange,
  getTodayMetrics,
  getWeekMetrics,
  getMonthMetrics,
  aggregateMetrics,
} from "./metrics";

// Export utilities
export {
  generateOrderId,
  generateActivityId,
  calculateOverallConfidence,
  getTTL,
  formatOrderNumber,
  validateOrderData,
  calculateTimeSaved,
} from "./utils";
