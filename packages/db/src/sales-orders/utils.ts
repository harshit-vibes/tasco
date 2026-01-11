/**
 * Sales Order utility functions
 */

/**
 * Generate a unique order ID
 * Format: ORD-{timestamp}-{random}
 * Example: ORD-1736410800000-A3B2F1
 */
export function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * Generate a unique activity ID
 * Format: ACT-{timestamp}-{random}
 * Example: ACT-1736410800000-X9Y2Z5
 */
export function generateActivityId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ACT-${timestamp}-${random}`;
}

/**
 * Calculate overall confidence from extracted data
 */
export function calculateOverallConfidence(extractedData: {
  customerName?: { confidence: number };
  customerCode?: { confidence: number };
  orderDate?: { confidence: number };
  deliveryDate?: { confidence: number };
  items?: Array<{
    productCode?: { confidence: number };
    productName?: { confidence: number };
    quantity?: { confidence: number };
    unit?: { confidence: number };
    unitPrice?: { confidence: number };
  }>;
  notes?: { confidence: number };
}): number {
  const confidences: number[] = [];

  // Add header field confidences
  if (extractedData.customerName?.confidence !== undefined) {
    confidences.push(extractedData.customerName.confidence);
  }
  if (extractedData.customerCode?.confidence !== undefined) {
    confidences.push(extractedData.customerCode.confidence);
  }
  if (extractedData.orderDate?.confidence !== undefined) {
    confidences.push(extractedData.orderDate.confidence);
  }
  if (extractedData.deliveryDate?.confidence !== undefined) {
    confidences.push(extractedData.deliveryDate.confidence);
  }

  // Add item confidences (weighted average per item)
  if (extractedData.items && extractedData.items.length > 0) {
    for (const item of extractedData.items) {
      const itemConfidences: number[] = [];
      if (item.productCode?.confidence !== undefined) {
        itemConfidences.push(item.productCode.confidence);
      }
      if (item.productName?.confidence !== undefined) {
        itemConfidences.push(item.productName.confidence);
      }
      if (item.quantity?.confidence !== undefined) {
        itemConfidences.push(item.quantity.confidence);
      }
      if (item.unit?.confidence !== undefined) {
        itemConfidences.push(item.unit.confidence);
      }
      if (item.unitPrice?.confidence !== undefined) {
        itemConfidences.push(item.unitPrice.confidence);
      }

      if (itemConfidences.length > 0) {
        const itemAvg =
          itemConfidences.reduce((sum, conf) => sum + conf, 0) /
          itemConfidences.length;
        confidences.push(itemAvg);
      }
    }
  }

  // Add notes confidence
  if (extractedData.notes?.confidence !== undefined) {
    confidences.push(extractedData.notes.confidence);
  }

  // Calculate overall average
  if (confidences.length === 0) {
    return 0;
  }

  const sum = confidences.reduce((total, conf) => total + conf, 0);
  return Math.round((sum / confidences.length) * 100) / 100; // Round to 2 decimal places
}

/**
 * Get TTL timestamp (30 days from now)
 * Used for automatic cleanup of old records
 */
export function getTTL(daysFromNow: number = 30): number {
  const now = Date.now();
  const ttl = now + daysFromNow * 24 * 60 * 60 * 1000;
  return Math.floor(ttl / 1000); // DynamoDB TTL uses seconds
}

/**
 * Format order number for display
 * Example: ORD-1736410800000-A3B2F1 => ORD-...A3B2F1
 */
export function formatOrderNumber(orderId: string): string {
  if (!orderId.includes("-")) {
    return orderId;
  }

  const parts = orderId.split("-");
  if (parts.length === 3) {
    return `${parts[0]}-...${parts[2]}`;
  }

  return orderId;
}

/**
 * Validate order data completeness
 */
export function validateOrderData(extractedData: {
  customerName?: { value: string };
  customerCode?: { value: string };
  orderDate?: { value: string };
  items?: Array<{
    productCode?: { value: string };
    quantity?: { value: number };
  }>;
}): {
  isValid: boolean;
  missingFields: string[];
} {
  const missingFields: string[] = [];

  if (!extractedData.customerName?.value) {
    missingFields.push("customerName");
  }
  if (!extractedData.customerCode?.value) {
    missingFields.push("customerCode");
  }
  if (!extractedData.orderDate?.value) {
    missingFields.push("orderDate");
  }
  if (!extractedData.items || extractedData.items.length === 0) {
    missingFields.push("items");
  } else {
    // Check if at least one item has required fields
    const hasValidItem = extractedData.items.some(
      (item) =>
        item.productCode?.value && item.quantity?.value !== undefined
    );
    if (!hasValidItem) {
      missingFields.push("items.productCode or items.quantity");
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Calculate time saved vs manual entry
 * Assumes manual entry takes 5 minutes per order
 */
export function calculateTimeSaved(
  orderCount: number,
  avgProcessingTimeMs: number
): {
  manualTimeMinutes: number;
  automatedTimeMinutes: number;
  savedMinutes: number;
  savedHours: number;
} {
  const MANUAL_TIME_PER_ORDER_MINUTES = 5;
  const manualTimeMinutes = orderCount * MANUAL_TIME_PER_ORDER_MINUTES;
  const automatedTimeMinutes = (orderCount * avgProcessingTimeMs) / 1000 / 60;
  const savedMinutes = manualTimeMinutes - automatedTimeMinutes;

  return {
    manualTimeMinutes,
    automatedTimeMinutes,
    savedMinutes,
    savedHours: savedMinutes / 60,
  };
}
