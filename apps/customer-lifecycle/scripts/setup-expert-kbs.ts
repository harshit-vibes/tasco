#!/usr/bin/env bun
/**
 * Setup unique Knowledge Bases for each expert agent
 *
 * Creates 4 domain-specific KBs:
 * - Lead KB: Lead records, prospecting data
 * - Customer KB: Customer profiles, lifecycle data
 * - Inventory KB: Vehicles, import orders
 * - Campaign KB: Marketing campaigns, metrics
 *
 * Run: bun run scripts/setup-expert-kbs.ts
 * Or:  LYZR_API_KEY=xxx bun run scripts/setup-expert-kbs.ts
 */

const LYZR_RAG_URL = "https://rag-prod.studio.lyzr.ai/v3/rag/";

interface KBConfig {
  name: string;
  key: string;
  description: string;
  envVar: string;
}

const EXPERT_KBS: KBConfig[] = [
  {
    name: "Customer Lifecycle - Lead Expert KB",
    key: "customer-lifecycle:lead-kb",
    description: "Lead records, prospecting data, lead scoring, and qualification insights for the Lead Expert agent",
    envVar: "LYZR_LEAD_KB_ID",
  },
  {
    name: "Customer Lifecycle - Customer Expert KB",
    key: "customer-lifecycle:customer-kb",
    description: "Customer profiles, lifecycle stages, churn risk, satisfaction scores, and retention insights for the Customer Expert agent",
    envVar: "LYZR_CUSTOMER_KB_ID",
  },
  {
    name: "Customer Lifecycle - Inventory Expert KB",
    key: "customer-lifecycle:inventory-kb",
    description: "Vehicle inventory, import orders, stock levels, and supply chain data for the Inventory Expert agent",
    envVar: "LYZR_INVENTORY_KB_ID",
  },
  {
    name: "Customer Lifecycle - Campaign Expert KB",
    key: "customer-lifecycle:campaign-kb",
    description: "Marketing campaigns, ROI metrics, conversion data, and audience segments for the Campaign Expert agent",
    envVar: "LYZR_CAMPAIGN_KB_ID",
  },
];

interface CreateKBResult {
  key: string;
  name: string;
  kbId: string;
  collectionName?: string;
  success: boolean;
  error?: string;
}

/**
 * Create a Knowledge Base via Lyzr RAG API
 */
async function createKnowledgeBase(
  kb: KBConfig,
  apiKey: string
): Promise<CreateKBResult> {
  try {
    console.log(`\n📚 Creating KB: ${kb.name}`);
    console.log(`   Key: ${kb.key}`);

    // Generate collection name
    const collectionName = kb.key
      .replace(/[^a-z0-9]+/gi, "_")
      .toLowerCase()
      + "_" + Date.now().toString(36);

    const response = await fetch(LYZR_RAG_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        collection_name: collectionName,
        description: kb.description,
        user_id: apiKey,
        llm_credential_id: "lyzr_openai",
        embedding_credential_id: "lyzr_openai",
        vector_db_credential_id: "lyzr_qdrant",
        vector_store_provider: "Qdrant [Lyzr]",
        llm_model: "gpt-4o-mini",
        embedding_model: "text-embedding-ada-002",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const kbId = data._id || data.id || data.knowledge_base_id;

    console.log(`   ✅ Created: ${kbId}`);
    console.log(`   Collection: ${collectionName}`);

    return {
      key: kb.key,
      name: kb.name,
      kbId,
      collectionName,
      success: true,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.log(`   ❌ Failed: ${errorMsg}`);
    return {
      key: kb.key,
      name: kb.name,
      kbId: "",
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * List existing Knowledge Bases
 */
async function listExistingKBs(apiKey: string): Promise<Map<string, string>> {
  try {
    const response = await fetch(`https://rag-prod.studio.lyzr.ai/v3/rag/user/${apiKey}/`, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
      },
    });

    if (!response.ok) {
      return new Map();
    }

    const data = await response.json();
    const kbs = data.configs || data.data || data.items || [];

    const existing = new Map<string, string>();
    for (const kb of kbs) {
      const name = kb.collection_name || kb.name || "";
      const id = kb._id || kb.id;
      if (name && id) {
        existing.set(name.toLowerCase(), id);
      }
    }
    return existing;
  } catch {
    return new Map();
  }
}

async function main() {
  const apiKey = process.env.LYZR_API_KEY || process.env.NEXT_PUBLIC_LYZR_API_KEY;

  if (!apiKey) {
    console.error("❌ Error: LYZR_API_KEY environment variable required");
    console.log("\nUsage: LYZR_API_KEY=xxx bun run scripts/setup-expert-kbs.ts");
    process.exit(1);
  }

  console.log("\n🚀 SETTING UP EXPERT KNOWLEDGE BASES\n");
  console.log("=".repeat(60));
  console.log("\nThis script creates 4 unique KBs for expert agents:");
  console.log("  - Lead KB (for Lead Expert)");
  console.log("  - Customer KB (for Customer Expert)");
  console.log("  - Inventory KB (for Inventory Expert)");
  console.log("  - Campaign KB (for Campaign Expert)");

  // Check existing KBs
  console.log("\n📋 Checking existing KBs...");
  const existingKBs = await listExistingKBs(apiKey);
  console.log(`   Found ${existingKBs.size} existing KBs`);

  // Create KBs
  console.log("\n" + "=".repeat(60));
  console.log("CREATING KNOWLEDGE BASES");
  console.log("=".repeat(60));

  const results: CreateKBResult[] = [];

  for (const kb of EXPERT_KBS) {
    // Check if similar name exists
    const key = kb.key.replace(/[^a-z0-9]+/gi, "_").toLowerCase();
    let existingId: string | undefined;

    for (const [name, id] of existingKBs) {
      if (name.includes(key.split("_")[0])) {
        existingId = id;
        break;
      }
    }

    if (existingId) {
      console.log(`\n⚡ Similar KB may exist: ${kb.name}`);
      console.log(`   Creating new one anyway...`);
    }

    const result = await createKnowledgeBase(kb, apiKey);
    results.push(result);

    // Small delay between API calls
    await new Promise((r) => setTimeout(r, 500));
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("SETUP SUMMARY");
  console.log("=".repeat(60));

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`\n✅ Successful: ${successful.length}`);
  console.log(`❌ Failed:     ${failed.length}`);

  if (successful.length > 0) {
    console.log("\n📝 Add these to your .env.local:\n");
    console.log("# Expert Knowledge Base IDs");
    for (const result of successful) {
      const kb = EXPERT_KBS.find((k) => k.key === result.key)!;
      console.log(`${kb.envVar}=${result.kbId}`);
    }

    console.log("\n📝 Next steps:");
    console.log("1. Add the env vars above to .env.local");
    console.log("2. Run: bun run scripts/sync-expert-kbs.ts");
    console.log("3. Run: bun run scripts/connect-expert-kbs.ts");
  }

  if (failed.length > 0) {
    console.log("\n❌ Failed KBs:");
    for (const result of failed) {
      console.log(`   ${result.key}: ${result.error}`);
    }
  }

  console.log("\n" + "=".repeat(60) + "\n");
}

main().catch(console.error);
