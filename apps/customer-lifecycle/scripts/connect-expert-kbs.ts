#!/usr/bin/env bun
/**
 * Connect each Expert Agent to their domain-specific Knowledge Base
 *
 * - Lead Expert → Lead KB
 * - Customer Expert → Customer KB
 * - Inventory Expert → Inventory KB
 * - Campaign Expert → Campaign KB
 *
 * Run: bun run scripts/connect-expert-kbs.ts
 */

const LYZR_AGENT_URL = "https://agent-prod.studio.lyzr.ai/v3/agents";

// Agent IDs from environment
const AGENT_IDS = {
  leadExpert: process.env.NEXT_PUBLIC_LYZR_LEAD_EXPERT_ID,
  customerExpert: process.env.NEXT_PUBLIC_LYZR_CUSTOMER_EXPERT_ID,
  inventoryExpert: process.env.NEXT_PUBLIC_LYZR_INVENTORY_EXPERT_ID,
  campaignExpert: process.env.NEXT_PUBLIC_LYZR_CAMPAIGN_EXPERT_ID,
};

// KB IDs from environment
const KB_IDS = {
  lead: process.env.LYZR_LEAD_KB_ID,
  customer: process.env.LYZR_CUSTOMER_KB_ID,
  inventory: process.env.LYZR_INVENTORY_KB_ID,
  campaign: process.env.LYZR_CAMPAIGN_KB_ID,
};

const API_KEY = process.env.LYZR_API_KEY || process.env.NEXT_PUBLIC_LYZR_API_KEY;

interface AgentFeature {
  type: string;
  config?: Record<string, unknown>;
}

interface AgentConfig {
  agent_id: string;
  name: string;
  system_prompt: string;
  model: string;
  provider_id: string;
  top_p: number;
  temperature: number;
  features?: AgentFeature[];
}

interface ConnectionResult {
  agentName: string;
  agentId: string;
  kbId: string;
  success: boolean;
  error?: string;
}

/**
 * Get current agent configuration
 */
async function getAgentConfig(agentId: string): Promise<AgentConfig | null> {
  try {
    const response = await fetch(`${LYZR_AGENT_URL}/${agentId}`, {
      method: "GET",
      headers: {
        "x-api-key": API_KEY!,
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch agent ${agentId}: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching agent ${agentId}:`, error);
    return null;
  }
}

/**
 * Connect KB to agent via RAG feature
 */
async function connectKBToAgent(
  agentId: string,
  kbId: string,
  agentName: string
): Promise<ConnectionResult> {
  console.log(`\n🔗 Connecting ${agentName} to KB...`);
  console.log(`   Agent ID: ${agentId}`);
  console.log(`   KB ID: ${kbId}`);

  try {
    // Get current agent config
    const currentConfig = await getAgentConfig(agentId);
    if (!currentConfig) {
      throw new Error("Failed to fetch current agent configuration");
    }

    // Remove existing KNOWLEDGE_BASE features (to replace with new KB)
    const existingFeatures = (currentConfig.features || []).filter(
      (f) => f.type !== "KNOWLEDGE_BASE"
    );

    // Add new KNOWLEDGE_BASE feature with the domain-specific KB
    const newFeatures: AgentFeature[] = [
      ...existingFeatures,
      {
        type: "KNOWLEDGE_BASE",
        config: {
          lyzr_rag: {
            base_url: "https://rag-prod.studio.lyzr.ai",
            rag_id: kbId,
            params: {
              top_k: 10,
              retrieval_type: "basic",
              score_threshold: 0,
            },
          },
          agentic_rag: [],
        },
        priority: 1,
      },
    ];

    // Update agent with new KB
    const response = await fetch(`${LYZR_AGENT_URL}/${agentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY!,
      },
      body: JSON.stringify({
        name: currentConfig.name,
        system_prompt: currentConfig.system_prompt,
        model: currentConfig.model,
        provider_id: currentConfig.provider_id,
        top_p: currentConfig.top_p,
        temperature: currentConfig.temperature,
        features: newFeatures,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    console.log(`   ✅ Connected successfully`);
    return {
      agentName,
      agentId,
      kbId,
      success: true,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.log(`   ❌ Failed: ${errorMsg}`);
    return {
      agentName,
      agentId,
      kbId,
      success: false,
      error: errorMsg,
    };
  }
}

async function main() {
  console.log("\n🚀 CONNECTING EXPERT AGENTS TO DOMAIN KBs\n");
  console.log("=".repeat(60));

  if (!API_KEY) {
    console.error("❌ Error: LYZR_API_KEY environment variable required");
    process.exit(1);
  }

  // Validate agent and KB IDs
  const missing: string[] = [];

  if (!AGENT_IDS.leadExpert) missing.push("NEXT_PUBLIC_LYZR_LEAD_EXPERT_ID");
  if (!AGENT_IDS.customerExpert) missing.push("NEXT_PUBLIC_LYZR_CUSTOMER_EXPERT_ID");
  if (!AGENT_IDS.inventoryExpert) missing.push("NEXT_PUBLIC_LYZR_INVENTORY_EXPERT_ID");
  if (!AGENT_IDS.campaignExpert) missing.push("NEXT_PUBLIC_LYZR_CAMPAIGN_EXPERT_ID");
  if (!KB_IDS.lead) missing.push("LYZR_LEAD_KB_ID");
  if (!KB_IDS.customer) missing.push("LYZR_CUSTOMER_KB_ID");
  if (!KB_IDS.inventory) missing.push("LYZR_INVENTORY_KB_ID");
  if (!KB_IDS.campaign) missing.push("LYZR_CAMPAIGN_KB_ID");

  if (missing.length > 0) {
    console.error("❌ Missing environment variables:");
    missing.forEach((v) => console.error(`   - ${v}`));
    console.log("\n   Run setup scripts first:");
    console.log("   1. bun run scripts/setup-multi-agents.ts");
    console.log("   2. bun run scripts/setup-expert-kbs.ts");
    process.exit(1);
  }

  console.log("\n📋 Configuration:");
  console.log("\nAgents:");
  console.log(`   Lead Expert:      ${AGENT_IDS.leadExpert}`);
  console.log(`   Customer Expert:  ${AGENT_IDS.customerExpert}`);
  console.log(`   Inventory Expert: ${AGENT_IDS.inventoryExpert}`);
  console.log(`   Campaign Expert:  ${AGENT_IDS.campaignExpert}`);

  console.log("\nKnowledge Bases:");
  console.log(`   Lead KB:      ${KB_IDS.lead}`);
  console.log(`   Customer KB:  ${KB_IDS.customer}`);
  console.log(`   Inventory KB: ${KB_IDS.inventory}`);
  console.log(`   Campaign KB:  ${KB_IDS.campaign}`);

  console.log("\n" + "=".repeat(60));
  console.log("CONNECTING...");
  console.log("=".repeat(60));

  const results: ConnectionResult[] = [];

  // Connect Lead Expert → Lead KB
  results.push(
    await connectKBToAgent(
      AGENT_IDS.leadExpert!,
      KB_IDS.lead!,
      "Lead Expert"
    )
  );

  // Connect Customer Expert → Customer KB
  results.push(
    await connectKBToAgent(
      AGENT_IDS.customerExpert!,
      KB_IDS.customer!,
      "Customer Expert"
    )
  );

  // Connect Inventory Expert → Inventory KB
  results.push(
    await connectKBToAgent(
      AGENT_IDS.inventoryExpert!,
      KB_IDS.inventory!,
      "Inventory Expert"
    )
  );

  // Connect Campaign Expert → Campaign KB
  results.push(
    await connectKBToAgent(
      AGENT_IDS.campaignExpert!,
      KB_IDS.campaign!,
      "Campaign Expert"
    )
  );

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("CONNECTION SUMMARY");
  console.log("=".repeat(60));

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`\n✅ Successful: ${successful.length}`);
  console.log(`❌ Failed:     ${failed.length}`);

  if (successful.length > 0) {
    console.log("\n🔗 Successfully Connected:");
    for (const result of successful) {
      console.log(`   ${result.agentName} → KB ${result.kbId}`);
    }
  }

  if (failed.length > 0) {
    console.log("\n❌ Failed Connections:");
    for (const result of failed) {
      console.log(`   ${result.agentName}: ${result.error}`);
    }
  }

  if (successful.length === 4) {
    console.log("\n🎉 All Expert Agents connected to their Domain KBs!");
    console.log("\n📋 Architecture:");
    console.log("   ┌─────────────────────────────────────────┐");
    console.log("   │         General Assistant               │");
    console.log("   │    (Shared Business Data KB)            │");
    console.log("   └───────────────┬─────────────────────────┘");
    console.log("                   │");
    console.log("   ┌───────────────┼───────────────┐");
    console.log("   │               │               │");
    console.log("   ▼               ▼               ▼");
    console.log("┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐");
    console.log("│  Lead    │ │ Customer │ │Inventory │ │ Campaign │");
    console.log("│  Expert  │ │  Expert  │ │  Expert  │ │  Expert  │");
    console.log("├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤");
    console.log("│  Lead KB │ │Cust. KB  │ │ Inv. KB  │ │ Camp. KB │");
    console.log("│ (Leads)  │ │(Customers│ │(Vehicles,│ │(Marketing│");
    console.log("│          │ │         )│ │ Orders) │ │         )│");
    console.log("└──────────┘ └──────────┘ └──────────┘ └──────────┘");
    console.log("\n📌 Test with:");
    console.log('   Lead Expert: "Which hot leads should I prioritize?"');
    console.log('   Customer Expert: "Show me at-risk customers"');
    console.log('   Inventory Expert: "What vehicles are aging in stock?"');
    console.log('   Campaign Expert: "Which campaigns have highest ROI?"');
  }

  console.log("\n" + "=".repeat(60) + "\n");
}

main().catch(console.error);
