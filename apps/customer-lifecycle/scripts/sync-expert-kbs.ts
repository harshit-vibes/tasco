#!/usr/bin/env bun
/**
 * Sync domain-specific data to each Expert Knowledge Base
 *
 * - Lead KB: Lead records only
 * - Customer KB: Customer records only
 * - Inventory KB: Vehicles + Import Orders only
 * - Campaign KB: Campaign records only
 *
 * Run: bun run scripts/sync-expert-kbs.ts
 * Options:
 *   --leads     Only sync leads
 *   --customers Only sync customers
 *   --inventory Only sync inventory
 *   --campaigns Only sync campaigns
 *   --force     Force resync all data
 */

import {
  getAllLeads,
  getAllCustomers,
  getAllCampaigns,
  getAllVehicles,
  getAllImportOrders,
  type Lead,
  type Customer,
  type Campaign,
  type Vehicle,
  type ImportOrder,
} from "@tasco/db";
import * as fs from "fs";
import * as path from "path";

const LYZR_RAG_BASE_URL = "https://rag-prod.studio.lyzr.ai";

// KB IDs from environment
const KB_IDS = {
  lead: process.env.LYZR_LEAD_KB_ID,
  customer: process.env.LYZR_CUSTOMER_KB_ID,
  inventory: process.env.LYZR_INVENTORY_KB_ID,
  campaign: process.env.LYZR_CAMPAIGN_KB_ID,
};

const API_KEY = process.env.LYZR_API_KEY || process.env.NEXT_PUBLIC_LYZR_API_KEY;

// Sync index to track what has been synced
const SYNC_INDEX_PATH = path.join(__dirname, "..", "data", "expert-sync-index.json");

interface SyncIndex {
  [recordId: string]: {
    kbId: string;
    syncedAt: string;
    dataType: "lead" | "customer" | "vehicle" | "import_order" | "campaign";
  };
}

interface SyncStats {
  leads: { synced: number; failed: number; skipped: number };
  customers: { synced: number; failed: number; skipped: number };
  vehicles: { synced: number; failed: number; skipped: number };
  importOrders: { synced: number; failed: number; skipped: number };
  campaigns: { synced: number; failed: number; skipped: number };
}

function loadSyncIndex(): SyncIndex {
  try {
    if (fs.existsSync(SYNC_INDEX_PATH)) {
      return JSON.parse(fs.readFileSync(SYNC_INDEX_PATH, "utf-8"));
    }
  } catch {
    console.warn("⚠️  Could not load sync index, starting fresh");
  }
  return {};
}

function saveSyncIndex(index: SyncIndex): void {
  try {
    const dir = path.dirname(SYNC_INDEX_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SYNC_INDEX_PATH, JSON.stringify(index, null, 2));
  } catch (error) {
    console.error("❌ Failed to save sync index:", error);
  }
}

// ============================================
// FORMATTERS
// ============================================

function formatLead(lead: Lead): string {
  const updatedAt = new Date(lead.updatedAt).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
  const lastContacted = lead.lastContactedAt
    ? new Date(lead.lastContactedAt).toLocaleDateString("en-US")
    : "Not contacted yet";

  return `LEAD RECORD: ${lead.customer.name}
ID: ${lead.id}
Updated: ${updatedAt}

SCORING:
- Priority: ${lead.priority.toUpperCase()}
- Score: ${lead.score}/100
- Source: ${lead.source}
- Status: ${lead.status}

INTEREST:
- Vehicle Types: ${lead.interest?.vehicleTypes?.join(", ") || "Not specified"}
- Brands: ${lead.interest?.brands?.join(", ") || "Not specified"}
- Budget: ${lead.interest?.budget || "Not specified"}
- Timeline: ${lead.interest?.timeline || "Not specified"}

CONTACT INFO:
- Name: ${lead.customer.name}
- Email: ${lead.customer.email}
- Phone: ${lead.customer.phone}
- Location: ${lead.customer.location || "Unknown"}

ACTIVITY:
- Last Contact: ${lastContacted}
- Assigned To: ${lead.assignedTo || "Unassigned"}
- Entity: ${lead.entityId}`;
}

function formatCustomer(customer: Customer): string {
  const updatedAt = new Date(customer.updatedAt).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency", currency: "USD", maximumFractionDigits: 0,
    }).format(value);

  const churnRiskPercent = Math.round(customer.insights.churnRisk * 100);

  return `CUSTOMER RECORD: ${customer.profile.name}
ID: ${customer.id}
Updated: ${updatedAt}

SEGMENT & VALUE:
- Segment: ${customer.insights.segment.toUpperCase()}
- Lifetime Value: ${formatCurrency(customer.insights.lifetimeValue)}
- Total Purchases: ${customer.insights.totalPurchases}
- Avg Order Value: ${formatCurrency(customer.insights.averageOrderValue)}

LIFECYCLE:
- Stage: ${customer.lifecycle.stage}
- First Purchase: ${customer.lifecycle.firstPurchaseDate || "N/A"}
- Last Purchase: ${customer.lifecycle.lastPurchaseDate || "N/A"}

HEALTH METRICS:
- Churn Risk: ${churnRiskPercent}%
- Satisfaction Score: ${customer.insights.satisfactionScore}/100
- Recommended Actions: ${customer.insights.recommendedActions?.join("; ") || "None"}

CONTACT INFO:
- Name: ${customer.profile.name}
- Email: ${customer.profile.email}
- Phone: ${customer.profile.phone}
- Location: ${customer.profile.location || "Unknown"}

PREFERENCES:
- Preferred Brands: ${customer.preferences.brands?.join(", ") || "None"}
- Communication Channels: ${customer.preferences.communicationChannels?.join(", ") || "None"}
- Service Interests: ${customer.preferences.serviceInterests?.join(", ") || "None"}
- Entity: ${customer.entityId}`;
}

function formatVehicle(vehicle: Vehicle): string {
  const formatCurrency = (value: number, currency = "VND") =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency", currency, maximumFractionDigits: 0,
    }).format(value);

  const ageStatus =
    vehicle.ageAlert === "critical" ? "CRITICAL (>90 days)"
    : vehicle.ageAlert === "warning" ? "WARNING (>60 days)"
    : "Normal";

  return `VEHICLE INVENTORY: ${vehicle.brand} ${vehicle.model} ${vehicle.variant}
VIN: ${vehicle.vin}
ID: ${vehicle.id}

DETAILS:
- Brand: ${vehicle.brand}
- Model: ${vehicle.model}
- Variant: ${vehicle.variant}
- Year: ${vehicle.year}
- Color: ${vehicle.color}

STATUS:
- Current Status: ${vehicle.status.toUpperCase()}
- Location: ${vehicle.currentLocation || vehicle.assignedShowroom}
- Assigned Showroom: ${vehicle.assignedShowroom}

INVENTORY AGE:
- Days in Inventory: ${vehicle.daysInInventory || 0}
- Age Alert: ${ageStatus}
- Arrived At: ${vehicle.arrivedAt || "Not yet arrived"}
- Expected Arrival: ${vehicle.expectedArrival}

PRICING:
- List Price: ${formatCurrency(vehicle.listPrice)}
- Dealer Price: ${formatCurrency(vehicle.dealerPrice || vehicle.listPrice * 0.92)}
- Import Price: ${formatCurrency(vehicle.importPrice, "USD")}

SALES:
${vehicle.soldToCustomerId ? `- Sold to Customer: ${vehicle.soldToCustomerId}` : "- Not sold"}
${vehicle.reservedForLeadId ? `- Reserved for Lead: ${vehicle.reservedForLeadId}` : "- Not reserved"}
- Entity: ${vehicle.entityId}`;
}

function formatImportOrder(order: ImportOrder): string {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency", currency: "USD", maximumFractionDigits: 0,
    }).format(value);

  const vehiclesList = order.vehicles
    .map((v) => `  - ${v.quantity}x ${v.model} ${v.variant} (${v.color}) @ ${formatCurrency(v.unitPrice)}/unit`)
    .join("\n");

  return `IMPORT ORDER: ${order.orderNumber}
ID: ${order.id}
Brand: ${order.brand}

STATUS:
- Current Status: ${order.status.toUpperCase()}
- Total Units: ${order.totalUnits}
- Total Value: ${formatCurrency(order.totalValue)}

TIMELINE:
- Order Date: ${order.orderedAt}
- Expected Production Complete: ${order.expectedProductionComplete}
- Expected Ship Date: ${order.expectedShipDate}
- Expected Arrival: ${order.expectedArrivalDate}
${order.actualArrivalDate ? `- Actual Arrival: ${order.actualArrivalDate}` : "- Not yet arrived"}

LC DETAILS:
${order.lcNumber ? `- LC Number: ${order.lcNumber}` : "- No LC"}
${order.lcOpenedAt ? `- LC Opened: ${order.lcOpenedAt}` : ""}
${order.lcExpiryAt ? `- LC Expiry: ${order.lcExpiryAt}` : ""}

VEHICLES:
${vehiclesList}

${order.notes ? `NOTES: ${order.notes}` : ""}
- Entity: ${order.entityId}`;
}

function formatCampaign(campaign: Campaign): string {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency", currency: "USD", maximumFractionDigits: 0,
    }).format(value);

  const startDate = new Date(campaign.startDate).toLocaleDateString("en-US");
  const endDate = campaign.endDate
    ? new Date(campaign.endDate).toLocaleDateString("en-US")
    : "Ongoing";

  const metrics = campaign.metrics || {};
  const sent = metrics.sent || 0;
  const delivered = metrics.delivered || 0;
  const opened = metrics.opened || 0;
  const clicked = metrics.clicked || 0;
  const converted = metrics.converted || 0;
  const revenue = metrics.revenue || 0;
  const budget = campaign.budget || 0;

  const openRate = delivered > 0 ? Math.round((opened / delivered) * 100) : 0;
  const clickRate = opened > 0 ? Math.round((clicked / opened) * 100) : 0;
  const conversionRate = clicked > 0 ? Math.round((converted / clicked) * 100) : 0;
  const roi = budget > 0 ? Math.round(((revenue - budget) / budget) * 100) : 0;

  return `MARKETING CAMPAIGN: ${campaign.name}
ID: ${campaign.id}
Status: ${campaign.status.toUpperCase()}

CONFIGURATION:
- Type: ${campaign.type}
- Target Segment: ${campaign.targetSegment}
- Duration: ${startDate} to ${endDate}

BUDGET & ROI:
- Budget: ${formatCurrency(budget)}
- Revenue: ${formatCurrency(revenue)}
- ROI: ${roi}%

ENGAGEMENT METRICS:
- Sent: ${sent.toLocaleString()}
- Delivered: ${delivered.toLocaleString()} (${sent > 0 ? Math.round((delivered / sent) * 100) : 0}%)
- Opened: ${opened.toLocaleString()} (Open Rate: ${openRate}%)
- Clicked: ${clicked.toLocaleString()} (Click Rate: ${clickRate}%)
- Converted: ${converted.toLocaleString()} (Conversion Rate: ${conversionRate}%)

- Created By: ${campaign.createdBy || "Unknown"}
- Entity: ${campaign.entityId}`;
}

// ============================================
// SYNC FUNCTIONS
// ============================================

async function syncToKB(
  kbId: string,
  docId: string,
  content: string,
  source: string,
  category: string
): Promise<boolean> {
  try {
    const requestBody = {
      data: [
        {
          text: content,
          source: source,
          metadata: {
            document_id: docId,
            filename: `${docId}.txt`,
            category: category,
          },
        },
      ],
      chunk_size: 500,
      chunk_overlap: 100,
    };

    const response = await fetch(`${LYZR_RAG_BASE_URL}/v3/train/text/?rag_id=${kbId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY!,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`   API error: ${errorText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`   Sync error:`, error);
    return false;
  }
}

interface SyncOptions {
  force?: boolean;
  leadsOnly?: boolean;
  customersOnly?: boolean;
  inventoryOnly?: boolean;
  campaignsOnly?: boolean;
}

async function syncExpertKBs(options: SyncOptions = {}): Promise<SyncStats> {
  console.log("📊 Syncing Domain-Specific Data to Expert KBs...\n");

  if (!API_KEY) {
    console.error("❌ Error: LYZR_API_KEY environment variable is required");
    process.exit(1);
  }

  // Validate KB IDs
  const missingKBs: string[] = [];
  if (!options.customersOnly && !options.inventoryOnly && !options.campaignsOnly && !KB_IDS.lead) {
    missingKBs.push("LYZR_LEAD_KB_ID");
  }
  if (!options.leadsOnly && !options.inventoryOnly && !options.campaignsOnly && !KB_IDS.customer) {
    missingKBs.push("LYZR_CUSTOMER_KB_ID");
  }
  if (!options.leadsOnly && !options.customersOnly && !options.campaignsOnly && !KB_IDS.inventory) {
    missingKBs.push("LYZR_INVENTORY_KB_ID");
  }
  if (!options.leadsOnly && !options.customersOnly && !options.inventoryOnly && !KB_IDS.campaign) {
    missingKBs.push("LYZR_CAMPAIGN_KB_ID");
  }

  if (missingKBs.length > 0) {
    console.error("❌ Missing KB IDs:");
    missingKBs.forEach((kb) => console.error(`   - ${kb}`));
    console.log("\n   Run 'bun run scripts/setup-expert-kbs.ts' first to create KBs");
    process.exit(1);
  }

  console.log("📦 KB IDs:");
  if (KB_IDS.lead) console.log(`   Lead KB:      ${KB_IDS.lead}`);
  if (KB_IDS.customer) console.log(`   Customer KB:  ${KB_IDS.customer}`);
  if (KB_IDS.inventory) console.log(`   Inventory KB: ${KB_IDS.inventory}`);
  if (KB_IDS.campaign) console.log(`   Campaign KB:  ${KB_IDS.campaign}`);

  const syncIndex = loadSyncIndex();
  const stats: SyncStats = {
    leads: { synced: 0, failed: 0, skipped: 0 },
    customers: { synced: 0, failed: 0, skipped: 0 },
    vehicles: { synced: 0, failed: 0, skipped: 0 },
    importOrders: { synced: 0, failed: 0, skipped: 0 },
    campaigns: { synced: 0, failed: 0, skipped: 0 },
  };

  // Sync Leads to Lead KB
  if (!options.customersOnly && !options.inventoryOnly && !options.campaignsOnly && KB_IDS.lead) {
    console.log("\n" + "=".repeat(50));
    console.log("🎯 SYNCING LEADS TO LEAD KB");
    console.log("=".repeat(50));

    const leadsResult = await getAllLeads();
    const leads = leadsResult.items;
    console.log(`Found ${leads.length} leads\n`);

    for (const lead of leads) {
      const recordId = `lead-${lead.id}`;
      const existingSync = syncIndex[recordId];

      if (existingSync && !options.force) {
        console.log(`⏭️  [SKIP] ${lead.customer.name}`);
        stats.leads.skipped++;
        continue;
      }

      console.log(`📄 Syncing: ${lead.customer.name} (${lead.priority})`);
      const content = formatLead(lead);
      const success = await syncToKB(KB_IDS.lead!, recordId, content, `Lead: ${lead.customer.name}`, "Leads");

      if (success) {
        console.log(`   ✅ Synced`);
        stats.leads.synced++;
        syncIndex[recordId] = {
          kbId: KB_IDS.lead!,
          syncedAt: new Date().toISOString(),
          dataType: "lead",
        };
      } else {
        console.log(`   ❌ Failed`);
        stats.leads.failed++;
      }
    }
  }

  // Sync Customers to Customer KB
  if (!options.leadsOnly && !options.inventoryOnly && !options.campaignsOnly && KB_IDS.customer) {
    console.log("\n" + "=".repeat(50));
    console.log("👥 SYNCING CUSTOMERS TO CUSTOMER KB");
    console.log("=".repeat(50));

    const customersResult = await getAllCustomers();
    const customers = customersResult.items;
    console.log(`Found ${customers.length} customers\n`);

    for (const customer of customers) {
      const recordId = `customer-${customer.id}`;
      const existingSync = syncIndex[recordId];

      if (existingSync && !options.force) {
        console.log(`⏭️  [SKIP] ${customer.profile.name}`);
        stats.customers.skipped++;
        continue;
      }

      console.log(`📄 Syncing: ${customer.profile.name} (${customer.insights.segment})`);
      const content = formatCustomer(customer);
      const success = await syncToKB(KB_IDS.customer!, recordId, content, `Customer: ${customer.profile.name}`, "Customers");

      if (success) {
        console.log(`   ✅ Synced`);
        stats.customers.synced++;
        syncIndex[recordId] = {
          kbId: KB_IDS.customer!,
          syncedAt: new Date().toISOString(),
          dataType: "customer",
        };
      } else {
        console.log(`   ❌ Failed`);
        stats.customers.failed++;
      }
    }
  }

  // Sync Vehicles & Import Orders to Inventory KB
  if (!options.leadsOnly && !options.customersOnly && !options.campaignsOnly && KB_IDS.inventory) {
    console.log("\n" + "=".repeat(50));
    console.log("🚗 SYNCING VEHICLES TO INVENTORY KB");
    console.log("=".repeat(50));

    const vehiclesResult = await getAllVehicles();
    const vehicles = vehiclesResult.items;
    console.log(`Found ${vehicles.length} vehicles\n`);

    for (const vehicle of vehicles) {
      const recordId = `vehicle-${vehicle.id}`;
      const existingSync = syncIndex[recordId];

      if (existingSync && !options.force) {
        console.log(`⏭️  [SKIP] ${vehicle.brand} ${vehicle.model}`);
        stats.vehicles.skipped++;
        continue;
      }

      console.log(`📄 Syncing: ${vehicle.brand} ${vehicle.model} (${vehicle.status})`);
      const content = formatVehicle(vehicle);
      const success = await syncToKB(KB_IDS.inventory!, recordId, content, `Vehicle: ${vehicle.brand} ${vehicle.model}`, "Vehicles");

      if (success) {
        console.log(`   ✅ Synced`);
        stats.vehicles.synced++;
        syncIndex[recordId] = {
          kbId: KB_IDS.inventory!,
          syncedAt: new Date().toISOString(),
          dataType: "vehicle",
        };
      } else {
        console.log(`   ❌ Failed`);
        stats.vehicles.failed++;
      }
    }

    console.log("\n📦 SYNCING IMPORT ORDERS TO INVENTORY KB");
    console.log("-".repeat(50));

    const ordersResult = await getAllImportOrders();
    const orders = ordersResult.items;
    console.log(`Found ${orders.length} import orders\n`);

    for (const order of orders) {
      const recordId = `import-order-${order.id}`;
      const existingSync = syncIndex[recordId];

      if (existingSync && !options.force) {
        console.log(`⏭️  [SKIP] ${order.orderNumber}`);
        stats.importOrders.skipped++;
        continue;
      }

      console.log(`📄 Syncing: ${order.orderNumber} (${order.status})`);
      const content = formatImportOrder(order);
      const success = await syncToKB(KB_IDS.inventory!, recordId, content, `Import Order: ${order.orderNumber}`, "ImportOrders");

      if (success) {
        console.log(`   ✅ Synced`);
        stats.importOrders.synced++;
        syncIndex[recordId] = {
          kbId: KB_IDS.inventory!,
          syncedAt: new Date().toISOString(),
          dataType: "import_order",
        };
      } else {
        console.log(`   ❌ Failed`);
        stats.importOrders.failed++;
      }
    }
  }

  // Sync Campaigns to Campaign KB
  if (!options.leadsOnly && !options.customersOnly && !options.inventoryOnly && KB_IDS.campaign) {
    console.log("\n" + "=".repeat(50));
    console.log("📢 SYNCING CAMPAIGNS TO CAMPAIGN KB");
    console.log("=".repeat(50));

    const campaigns = await getAllCampaigns();
    console.log(`Found ${campaigns.length} campaigns\n`);

    for (const campaign of campaigns) {
      const recordId = `campaign-${campaign.id}`;
      const existingSync = syncIndex[recordId];

      if (existingSync && !options.force) {
        console.log(`⏭️  [SKIP] ${campaign.name}`);
        stats.campaigns.skipped++;
        continue;
      }

      console.log(`📄 Syncing: ${campaign.name} (${campaign.status})`);
      const content = formatCampaign(campaign);
      const success = await syncToKB(KB_IDS.campaign!, recordId, content, `Campaign: ${campaign.name}`, "Campaigns");

      if (success) {
        console.log(`   ✅ Synced`);
        stats.campaigns.synced++;
        syncIndex[recordId] = {
          kbId: KB_IDS.campaign!,
          syncedAt: new Date().toISOString(),
          dataType: "campaign",
        };
      } else {
        console.log(`   ❌ Failed`);
        stats.campaigns.failed++;
      }
    }
  }

  saveSyncIndex(syncIndex);
  console.log("\n📝 Sync index updated");

  return stats;
}

async function main() {
  const args = process.argv.slice(2);
  const options: SyncOptions = {
    force: args.includes("--force"),
    leadsOnly: args.includes("--leads"),
    customersOnly: args.includes("--customers"),
    inventoryOnly: args.includes("--inventory"),
    campaignsOnly: args.includes("--campaigns"),
  };

  try {
    const stats = await syncExpertKBs(options);

    console.log("\n" + "=".repeat(50));
    console.log("📊 SYNC SUMMARY");
    console.log("=".repeat(50));

    console.log("\n🎯 Leads (→ Lead KB):");
    console.log(`   ✅ Synced: ${stats.leads.synced}`);
    console.log(`   ❌ Failed: ${stats.leads.failed}`);
    console.log(`   ⏭️  Skipped: ${stats.leads.skipped}`);

    console.log("\n👥 Customers (→ Customer KB):");
    console.log(`   ✅ Synced: ${stats.customers.synced}`);
    console.log(`   ❌ Failed: ${stats.customers.failed}`);
    console.log(`   ⏭️  Skipped: ${stats.customers.skipped}`);

    console.log("\n🚗 Vehicles (→ Inventory KB):");
    console.log(`   ✅ Synced: ${stats.vehicles.synced}`);
    console.log(`   ❌ Failed: ${stats.vehicles.failed}`);
    console.log(`   ⏭️  Skipped: ${stats.vehicles.skipped}`);

    console.log("\n📦 Import Orders (→ Inventory KB):");
    console.log(`   ✅ Synced: ${stats.importOrders.synced}`);
    console.log(`   ❌ Failed: ${stats.importOrders.failed}`);
    console.log(`   ⏭️  Skipped: ${stats.importOrders.skipped}`);

    console.log("\n📢 Campaigns (→ Campaign KB):");
    console.log(`   ✅ Synced: ${stats.campaigns.synced}`);
    console.log(`   ❌ Failed: ${stats.campaigns.failed}`);
    console.log(`   ⏭️  Skipped: ${stats.campaigns.skipped}`);

    const totalSynced =
      stats.leads.synced + stats.customers.synced +
      stats.vehicles.synced + stats.importOrders.synced +
      stats.campaigns.synced;

    if (totalSynced > 0) {
      console.log("\n🎉 Data synced to Expert Knowledge Bases!");
      console.log("\n🔧 Next step:");
      console.log("   Run: bun run scripts/connect-expert-kbs.ts");
    }
  } catch (error) {
    console.error("\n❌ Error syncing data:", error);
    process.exit(1);
  }
}

main();
