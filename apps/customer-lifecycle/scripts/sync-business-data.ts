#!/usr/bin/env node
/**
 * Sync Business Data to Knowledge Base
 *
 * Syncs leads, customers, and campaigns from DynamoDB to Lyzr RAG Knowledge Base.
 * This enables the AI agent to answer questions with real data instead of generic responses.
 *
 * Run: bun run sync-business-data
 * Or:  LYZR_API_KEY=xxx bun run sync-business-data
 *
 * Options:
 *   --force     Force resync all data (delete and re-add)
 *   --leads     Only sync leads
 *   --customers Only sync customers
 *   --campaigns Only sync campaigns
 */

import { syncDocumentToRAG, type SyncDocument } from "@tasco/rag";
import { getKB } from "@tasco/agents/knowledge-bases";
import {
  getAllLeads,
  getAllCustomers,
  getAllCampaigns,
  type Lead,
  type Customer,
  type Campaign,
} from "@tasco/db";
import * as fs from "fs";
import * as path from "path";

// Get KB ID from central registry
const businessKB = getKB("customer-lifecycle:business-data-kb");
const KB_ID = businessKB?.id || process.env.LYZR_BUSINESS_DATA_KB_ID;
const API_KEY = process.env.LYZR_API_KEY || process.env.NEXT_PUBLIC_LYZR_API_KEY;

// Sync index file to track what has been synced
const SYNC_INDEX_PATH = path.join(__dirname, "..", "data", "sync-index.json");

interface SyncIndex {
  [recordId: string]: {
    kbDocumentId: string;
    syncedAt: string;
    dataType: "lead" | "customer" | "campaign";
  };
}

interface SyncOptions {
  force?: boolean;
  leadsOnly?: boolean;
  customersOnly?: boolean;
  campaignsOnly?: boolean;
}

interface SyncStats {
  leads: { synced: number; failed: number; skipped: number };
  customers: { synced: number; failed: number; skipped: number };
  campaigns: { synced: number; failed: number; skipped: number };
}

/**
 * Load sync index from file
 */
function loadSyncIndex(): SyncIndex {
  try {
    if (fs.existsSync(SYNC_INDEX_PATH)) {
      return JSON.parse(fs.readFileSync(SYNC_INDEX_PATH, "utf-8"));
    }
  } catch (error) {
    console.warn("⚠️  Could not load sync index, starting fresh");
  }
  return {};
}

/**
 * Save sync index to file
 */
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

/**
 * Format a lead as a text document for RAG
 */
function formatLead(lead: Lead): string {
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
- Interest: ${lead.interest?.vehicleType || "Not specified"}, Budget: ${lead.interest?.budget || "Not specified"}
- Contact: ${lead.customer.email} | ${lead.customer.phone}
- Last Contact: ${lastContacted}
- Assigned To: ${lead.assignedTo || "Unassigned"}
- Entity: ${lead.entityId}`;
}

/**
 * Format a customer as a text document for RAG
 */
function formatCustomer(customer: Customer): string {
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
function formatCampaign(campaign: Campaign): string {
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

  const openRate = campaign.metrics.delivered > 0
    ? Math.round((campaign.metrics.opened / campaign.metrics.delivered) * 100)
    : 0;
  const clickRate = campaign.metrics.opened > 0
    ? Math.round((campaign.metrics.clicked / campaign.metrics.opened) * 100)
    : 0;
  const conversionRate = campaign.metrics.clicked > 0
    ? Math.round((campaign.metrics.converted / campaign.metrics.clicked) * 100)
    : 0;
  const roi = campaign.budget > 0
    ? Math.round(((campaign.metrics.revenue - campaign.budget) / campaign.budget) * 100)
    : 0;

  return `CAMPAIGN: ${campaign.name} [Status: ${campaign.status.toUpperCase()}]
- Type: ${campaign.type} | Target Segment: ${campaign.targetSegment}
- Budget: ${formatCurrency(campaign.budget)} | Revenue: ${formatCurrency(campaign.metrics.revenue)}
- ROI: ${roi}%
- Duration: ${startDate} to ${endDate}
- Metrics:
  - Sent: ${campaign.metrics.sent.toLocaleString()} | Delivered: ${campaign.metrics.delivered.toLocaleString()}
  - Open Rate: ${openRate}% | Click Rate: ${clickRate}% | Conversion Rate: ${conversionRate}%
  - Conversions: ${campaign.metrics.converted}
- Created By: ${campaign.createdBy || "Unknown"}
- Entity: ${campaign.entityId}`;
}

async function syncBusinessData(options: SyncOptions = {}): Promise<SyncStats> {
  console.log("📊 Syncing Business Data to Knowledge Base...\n");

  if (!API_KEY) {
    console.error("❌ Error: LYZR_API_KEY environment variable is required");
    console.log("   Set it in your .env.local or pass it directly");
    process.exit(1);
  }

  if (!KB_ID) {
    console.error("❌ Error: Knowledge Base ID not found");
    console.log("   Run the KB creation script first or check @tasco/agents registry");
    process.exit(1);
  }

  console.log(`📦 KB ID: ${KB_ID}\n`);

  // Load sync index
  const syncIndex = loadSyncIndex();

  const stats: SyncStats = {
    leads: { synced: 0, failed: 0, skipped: 0 },
    customers: { synced: 0, failed: 0, skipped: 0 },
    campaigns: { synced: 0, failed: 0, skipped: 0 },
  };

  // Sync Leads
  if (!options.customersOnly && !options.campaignsOnly) {
    console.log("=".repeat(50));
    console.log("🎯 SYNCING LEADS");
    console.log("=".repeat(50));

    const leadsResult = await getAllLeads();
    const leads = leadsResult.items;
    console.log(`Found ${leads.length} leads\n`);

    for (const lead of leads) {
      const recordId = `lead-${lead.id}`;
      const existingSync = syncIndex[recordId];

      // Skip if already synced and not forcing
      if (existingSync && !options.force) {
        console.log(`⏭️  [SKIP] ${lead.customer.name} (already synced)`);
        stats.leads.skipped++;
        continue;
      }

      console.log(`📄 Syncing: ${lead.customer.name} (${lead.priority})`);

      const doc: SyncDocument = {
        id: recordId,
        name: `Lead: ${lead.customer.name}`,
        filename: `${recordId}.txt`,
        content: formatLead(lead),
        category: "Leads",
        entityId: lead.entityId,
      };

      const result = await syncDocumentToRAG(
        { kbId: KB_ID, apiKey: API_KEY, chunkSize: 500, chunkOverlap: 100 },
        doc
      );

      if (result.success) {
        console.log(`   ✅ Synced successfully`);
        stats.leads.synced++;
        syncIndex[recordId] = {
          kbDocumentId: result.kbDocumentId || recordId,
          syncedAt: new Date().toISOString(),
          dataType: "lead",
        };
      } else {
        console.log(`   ❌ Sync failed: ${result.error}`);
        stats.leads.failed++;
      }
    }
  }

  // Sync Customers
  if (!options.leadsOnly && !options.campaignsOnly) {
    console.log("\n" + "=".repeat(50));
    console.log("👥 SYNCING CUSTOMERS");
    console.log("=".repeat(50));

    const customersResult = await getAllCustomers();
    const customers = customersResult.items;
    console.log(`Found ${customers.length} customers\n`);

    for (const customer of customers) {
      const recordId = `customer-${customer.id}`;
      const existingSync = syncIndex[recordId];

      // Skip if already synced and not forcing
      if (existingSync && !options.force) {
        console.log(`⏭️  [SKIP] ${customer.profile.name} (already synced)`);
        stats.customers.skipped++;
        continue;
      }

      console.log(`📄 Syncing: ${customer.profile.name} (${customer.insights.segment})`);

      const doc: SyncDocument = {
        id: recordId,
        name: `Customer: ${customer.profile.name}`,
        filename: `${recordId}.txt`,
        content: formatCustomer(customer),
        category: "Customers",
        entityId: customer.entityId,
      };

      const result = await syncDocumentToRAG(
        { kbId: KB_ID, apiKey: API_KEY, chunkSize: 500, chunkOverlap: 100 },
        doc
      );

      if (result.success) {
        console.log(`   ✅ Synced successfully`);
        stats.customers.synced++;
        syncIndex[recordId] = {
          kbDocumentId: result.kbDocumentId || recordId,
          syncedAt: new Date().toISOString(),
          dataType: "customer",
        };
      } else {
        console.log(`   ❌ Sync failed: ${result.error}`);
        stats.customers.failed++;
      }
    }
  }

  // Sync Campaigns
  if (!options.leadsOnly && !options.customersOnly) {
    console.log("\n" + "=".repeat(50));
    console.log("📢 SYNCING CAMPAIGNS");
    console.log("=".repeat(50));

    const campaigns = await getAllCampaigns();
    console.log(`Found ${campaigns.length} campaigns\n`);

    for (const campaign of campaigns) {
      const recordId = `campaign-${campaign.id}`;
      const existingSync = syncIndex[recordId];

      // Skip if already synced and not forcing
      if (existingSync && !options.force) {
        console.log(`⏭️  [SKIP] ${campaign.name} (already synced)`);
        stats.campaigns.skipped++;
        continue;
      }

      console.log(`📄 Syncing: ${campaign.name} (${campaign.status})`);

      const doc: SyncDocument = {
        id: recordId,
        name: `Campaign: ${campaign.name}`,
        filename: `${recordId}.txt`,
        content: formatCampaign(campaign),
        category: "Campaigns",
        entityId: campaign.entityId,
      };

      const result = await syncDocumentToRAG(
        { kbId: KB_ID, apiKey: API_KEY, chunkSize: 500, chunkOverlap: 100 },
        doc
      );

      if (result.success) {
        console.log(`   ✅ Synced successfully`);
        stats.campaigns.synced++;
        syncIndex[recordId] = {
          kbDocumentId: result.kbDocumentId || recordId,
          syncedAt: new Date().toISOString(),
          dataType: "campaign",
        };
      } else {
        console.log(`   ❌ Sync failed: ${result.error}`);
        stats.campaigns.failed++;
      }
    }
  }

  // Save updated sync index
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
    campaignsOnly: args.includes("--campaigns"),
  };

  // Validate mutually exclusive options
  const exclusiveCount = [options.leadsOnly, options.customersOnly, options.campaignsOnly]
    .filter(Boolean).length;
  if (exclusiveCount > 1) {
    console.error("❌ Cannot use multiple --leads/--customers/--campaigns flags together");
    process.exit(1);
  }

  try {
    const stats = await syncBusinessData(options);

    console.log("\n" + "=".repeat(50));
    console.log("📊 SYNC SUMMARY");
    console.log("=".repeat(50));

    console.log("\n🎯 Leads:");
    console.log(`   ✅ Synced: ${stats.leads.synced}`);
    console.log(`   ❌ Failed: ${stats.leads.failed}`);
    console.log(`   ⏭️  Skipped: ${stats.leads.skipped}`);

    console.log("\n👥 Customers:");
    console.log(`   ✅ Synced: ${stats.customers.synced}`);
    console.log(`   ❌ Failed: ${stats.customers.failed}`);
    console.log(`   ⏭️  Skipped: ${stats.customers.skipped}`);

    console.log("\n📢 Campaigns:");
    console.log(`   ✅ Synced: ${stats.campaigns.synced}`);
    console.log(`   ❌ Failed: ${stats.campaigns.failed}`);
    console.log(`   ⏭️  Skipped: ${stats.campaigns.skipped}`);

    const totalSynced = stats.leads.synced + stats.customers.synced + stats.campaigns.synced;
    const totalFailed = stats.leads.failed + stats.customers.failed + stats.campaigns.failed;

    if (totalFailed > 0) {
      console.log(`\n⚠️  ${totalFailed} item(s) failed to sync.`);
    }

    if (totalSynced > 0) {
      console.log("\n🎉 Business data synced to Knowledge Base!");
      console.log("\n🔧 Next steps:");
      console.log("1. Connect the KB to your agent (if not already connected)");
      console.log("2. Test the agent with questions like:");
      console.log('   - "Which hot leads should I contact today?"');
      console.log('   - "Show me at-risk customers"');
      console.log('   - "What campaigns are running?"');
    }
  } catch (error) {
    console.error("\n❌ Error syncing business data:", error);
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

main();
