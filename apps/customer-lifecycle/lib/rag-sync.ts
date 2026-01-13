/**
 * RAG Sync Utilities for Customer Lifecycle App
 * Automatically syncs data changes to the Lyzr Knowledge Base
 */

import { syncDocumentToRAG, type SyncDocument } from "@tasco/rag";
import { getKB } from "@tasco/agents/knowledge-bases";
import type { Lead, Customer, Campaign, Vehicle, ImportOrder } from "@tasco/db";

// Get KB configuration
const businessKB = getKB("customer-lifecycle:business-data-kb");
const KB_ID = businessKB?.id || process.env.LYZR_BUSINESS_DATA_KB_ID;
const API_KEY = process.env.LYZR_API_KEY || process.env.NEXT_PUBLIC_LYZR_API_KEY;

/**
 * Format a lead as a text document for RAG
 */
export function formatLead(lead: Lead): string {
  const updatedAt = new Date(lead.updatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const lastContacted = lead.lastContactedAt
    ? new Date(lead.lastContactedAt).toLocaleDateString("en-US")
    : "Not contacted yet";

  return `LEAD: ${lead.customer.name} [Updated: ${updatedAt}]
- Priority: ${lead.priority.toUpperCase()} | Score: ${lead.score}/100
- Source: ${lead.source} | Status: ${lead.status}
- Interest: ${lead.interest?.vehicleTypes?.join(", ") || "Not specified"}, Budget: ${lead.interest?.budget || "Not specified"}
- Contact: ${lead.customer.email} | ${lead.customer.phone}
- Last Contact: ${lastContacted}
- Assigned To: ${lead.assignedTo || "Unassigned"}
- Entity: ${lead.entityId}`;
}

/**
 * Format a customer as a text document for RAG
 */
export function formatCustomer(customer: Customer): string {
  const updatedAt = new Date(customer.updatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);

  const churnRiskPercent = Math.round(customer.insights.churnRisk * 100);
  const recommendedActions = customer.insights.recommendedActions?.length
    ? customer.insights.recommendedActions.join(", ")
    : "None";

  return `CUSTOMER: ${customer.profile.name} [Segment: ${customer.insights.segment.toUpperCase()}] [Updated: ${updatedAt}]
- Lifetime Value: ${formatCurrency(customer.insights.lifetimeValue)}
- Total Purchases: ${customer.insights.totalPurchases} | Avg Order: ${formatCurrency(customer.insights.averageOrderValue)}
- Churn Risk: ${churnRiskPercent}% | Satisfaction: ${customer.insights.satisfactionScore}/100
- Stage: ${customer.lifecycle.stage}
- First Purchase: ${customer.lifecycle.firstPurchaseDate || "N/A"} | Last Purchase: ${customer.lifecycle.lastPurchaseDate || "N/A"}
- Contact: ${customer.profile.email} | ${customer.profile.phone}
- Preferred Brands: ${customer.preferences.brands?.join(", ") || "None"}
- Communication Channels: ${customer.preferences.communicationChannels?.join(", ") || "None"}
- Recommended Actions: ${recommendedActions}
- Entity: ${customer.entityId}`;
}

/**
 * Format a campaign as a text document for RAG
 */
export function formatCampaign(campaign: Campaign): string {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);

  const startDate = new Date(campaign.startDate).toLocaleDateString("en-US");
  const endDate = campaign.endDate
    ? new Date(campaign.endDate).toLocaleDateString("en-US")
    : "Ongoing";

  // Safely extract metrics with defaults
  const metrics = campaign.metrics || {};
  const sent = metrics.sent || 0;
  const delivered = metrics.delivered || 0;
  const opened = metrics.opened || 0;
  const clicked = metrics.clicked || 0;
  const converted = metrics.converted || 0;
  const revenue = metrics.revenue || 0;
  const budget = campaign.budget || 0;

  const openRate = delivered > 0
    ? Math.round((opened / delivered) * 100)
    : 0;
  const clickRate = opened > 0
    ? Math.round((clicked / opened) * 100)
    : 0;
  const conversionRate = clicked > 0
    ? Math.round((converted / clicked) * 100)
    : 0;
  const roi = budget > 0
    ? Math.round(((revenue - budget) / budget) * 100)
    : 0;

  return `CAMPAIGN: ${campaign.name} [Status: ${campaign.status.toUpperCase()}]
- Type: ${campaign.type} | Target Segment: ${campaign.targetSegment}
- Budget: ${formatCurrency(budget)} | Revenue: ${formatCurrency(revenue)}
- ROI: ${roi}%
- Duration: ${startDate} to ${endDate}
- Metrics:
  - Sent: ${sent.toLocaleString()} | Delivered: ${delivered.toLocaleString()}
  - Open Rate: ${openRate}% | Click Rate: ${clickRate}% | Conversion Rate: ${conversionRate}%
  - Conversions: ${converted}
- Created By: ${campaign.createdBy || "Unknown"}
- Entity: ${campaign.entityId}`;
}

/**
 * Sync a lead to RAG
 */
export async function syncLeadToRAG(lead: Lead): Promise<boolean> {
  if (!KB_ID || !API_KEY) {
    console.warn("[RAG Sync] Skipping - KB_ID or API_KEY not configured");
    return false;
  }

  try {
    const doc: SyncDocument = {
      id: `lead-${lead.id}`,
      name: `Lead: ${lead.customer.name}`,
      filename: `lead-${lead.id}.txt`,
      content: formatLead(lead),
      category: "Leads",
      entityId: lead.entityId,
    };

    const result = await syncDocumentToRAG(
      { kbId: KB_ID, apiKey: API_KEY, chunkSize: 500, chunkOverlap: 100 },
      doc
    );

    if (result.success) {
      console.log(`[RAG Sync] Lead ${lead.id} synced successfully`);
    } else {
      console.error(`[RAG Sync] Lead ${lead.id} sync failed:`, result.error);
    }

    return result.success;
  } catch (error) {
    console.error(`[RAG Sync] Error syncing lead ${lead.id}:`, error);
    return false;
  }
}

/**
 * Sync a customer to RAG
 */
export async function syncCustomerToRAG(customer: Customer): Promise<boolean> {
  if (!KB_ID || !API_KEY) {
    console.warn("[RAG Sync] Skipping - KB_ID or API_KEY not configured");
    return false;
  }

  try {
    const doc: SyncDocument = {
      id: `customer-${customer.id}`,
      name: `Customer: ${customer.profile.name}`,
      filename: `customer-${customer.id}.txt`,
      content: formatCustomer(customer),
      category: "Customers",
      entityId: customer.entityId,
    };

    const result = await syncDocumentToRAG(
      { kbId: KB_ID, apiKey: API_KEY, chunkSize: 500, chunkOverlap: 100 },
      doc
    );

    if (result.success) {
      console.log(`[RAG Sync] Customer ${customer.id} synced successfully`);
    } else {
      console.error(`[RAG Sync] Customer ${customer.id} sync failed:`, result.error);
    }

    return result.success;
  } catch (error) {
    console.error(`[RAG Sync] Error syncing customer ${customer.id}:`, error);
    return false;
  }
}

/**
 * Sync a campaign to RAG
 */
export async function syncCampaignToRAG(campaign: Campaign): Promise<boolean> {
  if (!KB_ID || !API_KEY) {
    console.warn("[RAG Sync] Skipping - KB_ID or API_KEY not configured");
    return false;
  }

  try {
    const doc: SyncDocument = {
      id: `campaign-${campaign.id}`,
      name: `Campaign: ${campaign.name}`,
      filename: `campaign-${campaign.id}.txt`,
      content: formatCampaign(campaign),
      category: "Campaigns",
      entityId: campaign.entityId,
    };

    const result = await syncDocumentToRAG(
      { kbId: KB_ID, apiKey: API_KEY, chunkSize: 500, chunkOverlap: 100 },
      doc
    );

    if (result.success) {
      console.log(`[RAG Sync] Campaign ${campaign.id} synced successfully`);
    } else {
      console.error(`[RAG Sync] Campaign ${campaign.id} sync failed:`, result.error);
    }

    return result.success;
  } catch (error) {
    console.error(`[RAG Sync] Error syncing campaign ${campaign.id}:`, error);
    return false;
  }
}

/**
 * Format a vehicle as a text document for RAG
 */
export function formatVehicle(vehicle: Vehicle): string {
  const formatCurrency = (value: number, currency = "VND") =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);

  const ageStatus =
    vehicle.ageAlert === "critical"
      ? "CRITICAL (>90 days)"
      : vehicle.ageAlert === "warning"
        ? "WARNING (>60 days)"
        : "Normal";

  return `VEHICLE: ${vehicle.brand} ${vehicle.model} ${vehicle.variant} [VIN: ${vehicle.vin}]
- Year: ${vehicle.year} | Color: ${vehicle.color}
- Status: ${vehicle.status.toUpperCase()}
- Location: ${vehicle.currentLocation || vehicle.assignedShowroom}
- Days in Inventory: ${vehicle.daysInInventory} | Age Alert: ${ageStatus}
- List Price: ${formatCurrency(vehicle.listPrice)}
- Import Price: ${formatCurrency(vehicle.importPrice, "USD")}
- Expected Arrival: ${vehicle.expectedArrival}
- Arrived At: ${vehicle.arrivedAt || "Not yet arrived"}
${vehicle.soldToCustomerId ? `- Sold to Customer: ${vehicle.soldToCustomerId}` : ""}
${vehicle.reservedForLeadId ? `- Reserved for Lead: ${vehicle.reservedForLeadId}` : ""}
- Entity: ${vehicle.entityId}`;
}

/**
 * Format an import order as a text document for RAG
 */
export function formatImportOrder(order: ImportOrder): string {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);

  const vehiclesList = order.vehicles
    .map((v) => `  - ${v.quantity}x ${v.model} ${v.variant} (${v.color}) @ ${formatCurrency(v.unitPrice)}/unit`)
    .join("\n");

  return `IMPORT ORDER: ${order.orderNumber} [Brand: ${order.brand}]
- Status: ${order.status.toUpperCase()}
- Total Units: ${order.totalUnits}
- Total Value: ${formatCurrency(order.totalValue)}
- Order Date: ${order.orderedAt}
- Expected Production Complete: ${order.expectedProductionComplete}
- Expected Ship Date: ${order.expectedShipDate}
- Expected Arrival: ${order.expectedArrivalDate}
${order.actualArrivalDate ? `- Actual Arrival: ${order.actualArrivalDate}` : ""}
${order.lcNumber ? `- LC Number: ${order.lcNumber}` : ""}
${order.lcOpenedAt ? `- LC Opened: ${order.lcOpenedAt}` : ""}
${order.lcExpiryAt ? `- LC Expiry: ${order.lcExpiryAt}` : ""}
- Vehicles:
${vehiclesList}
${order.notes ? `- Notes: ${order.notes}` : ""}
- Entity: ${order.entityId}`;
}

/**
 * Sync a vehicle to RAG
 */
export async function syncVehicleToRAG(vehicle: Vehicle): Promise<boolean> {
  if (!KB_ID || !API_KEY) {
    console.warn("[RAG Sync] Skipping - KB_ID or API_KEY not configured");
    return false;
  }

  try {
    const doc: SyncDocument = {
      id: `vehicle-${vehicle.id}`,
      name: `Vehicle: ${vehicle.brand} ${vehicle.model} (${vehicle.vin})`,
      filename: `vehicle-${vehicle.id}.txt`,
      content: formatVehicle(vehicle),
      category: "Inventory",
      entityId: vehicle.entityId,
    };

    const result = await syncDocumentToRAG(
      { kbId: KB_ID, apiKey: API_KEY, chunkSize: 500, chunkOverlap: 100 },
      doc
    );

    if (result.success) {
      console.log(`[RAG Sync] Vehicle ${vehicle.id} synced successfully`);
    } else {
      console.error(`[RAG Sync] Vehicle ${vehicle.id} sync failed:`, result.error);
    }

    return result.success;
  } catch (error) {
    console.error(`[RAG Sync] Error syncing vehicle ${vehicle.id}:`, error);
    return false;
  }
}

/**
 * Sync an import order to RAG
 */
export async function syncImportOrderToRAG(order: ImportOrder): Promise<boolean> {
  if (!KB_ID || !API_KEY) {
    console.warn("[RAG Sync] Skipping - KB_ID or API_KEY not configured");
    return false;
  }

  try {
    const doc: SyncDocument = {
      id: `import-order-${order.id}`,
      name: `Import Order: ${order.orderNumber}`,
      filename: `import-order-${order.id}.txt`,
      content: formatImportOrder(order),
      category: "ImportOrders",
      entityId: order.entityId,
    };

    const result = await syncDocumentToRAG(
      { kbId: KB_ID, apiKey: API_KEY, chunkSize: 500, chunkOverlap: 100 },
      doc
    );

    if (result.success) {
      console.log(`[RAG Sync] ImportOrder ${order.id} synced successfully`);
    } else {
      console.error(`[RAG Sync] ImportOrder ${order.id} sync failed:`, result.error);
    }

    return result.success;
  } catch (error) {
    console.error(`[RAG Sync] Error syncing import order ${order.id}:`, error);
    return false;
  }
}
