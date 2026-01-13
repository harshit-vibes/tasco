#!/usr/bin/env node
/**
 * Connect Knowledge Base to Multi-Agent Experts
 *
 * Connects the business-data-kb to all 4 specialist agents:
 * - Lead Expert
 * - Customer Expert
 * - Inventory Expert
 * - Campaign Expert
 *
 * Prerequisites:
 * - Run setup-multi-agents.ts first to create the agents
 * - Have a Knowledge Base ID ready
 *
 * Run: LYZR_KB_ID=xxx bun run connect-kb-to-experts
 */

import {
  connectKnowledgeBase,
  getAgent,
  type AgentManagementConfig,
} from "@tasco/api";
import * as fs from "fs";
import * as path from "path";

// Path to central registry
const REGISTRY_PATH = path.join(__dirname, "../../../../lyzr-registry.json");

/**
 * Get agent IDs from the registry
 */
function getAgentIdsFromRegistry(): Record<string, string> {
  try {
    const registryContent = fs.readFileSync(REGISTRY_PATH, "utf-8");
    const registry = JSON.parse(registryContent);
    const customerLifecycleAgents = registry.agents?.["customer-lifecycle"] || {};

    return {
      "lead-expert": customerLifecycleAgents["lead-expert"]?.id,
      "customer-expert": customerLifecycleAgents["customer-expert"]?.id,
      "inventory-expert": customerLifecycleAgents["inventory-expert"]?.id,
      "campaign-expert": customerLifecycleAgents["campaign-expert"]?.id,
    };
  } catch (error) {
    console.error("❌ Could not read registry:", error);
    return {};
  }
}

/**
 * Get agent IDs from environment variables (fallback)
 */
function getAgentIdsFromEnv(): Record<string, string | undefined> {
  return {
    "lead-expert": process.env.NEXT_PUBLIC_LYZR_LEAD_EXPERT_ID,
    "customer-expert": process.env.NEXT_PUBLIC_LYZR_CUSTOMER_EXPERT_ID,
    "inventory-expert": process.env.NEXT_PUBLIC_LYZR_INVENTORY_EXPERT_ID,
    "campaign-expert": process.env.NEXT_PUBLIC_LYZR_CAMPAIGN_EXPERT_ID,
  };
}

async function main() {
  const apiKey =
    process.env.LYZR_API_KEY || process.env.NEXT_PUBLIC_LYZR_API_KEY;
  const kbId = process.env.LYZR_KB_ID || process.env.LYZR_BUSINESS_KB_ID;

  if (!apiKey) {
    console.error("❌ Error: LYZR_API_KEY environment variable is required");
    console.log("\nUsage:");
    console.log("  LYZR_API_KEY=xxx LYZR_KB_ID=yyy bun run connect-kb-to-experts");
    process.exit(1);
  }

  if (!kbId) {
    console.error("❌ Error: LYZR_KB_ID environment variable is required");
    console.log("\nUsage:");
    console.log("  LYZR_API_KEY=xxx LYZR_KB_ID=yyy bun run connect-kb-to-experts");
    console.log("\nYou can find your KB ID in the Lyzr Studio or registry.");
    process.exit(1);
  }

  const agentConfig: AgentManagementConfig = { apiKey };

  console.log("🔗 Connecting Knowledge Base to Expert Agents...\n");
  console.log(`   Knowledge Base ID: ${kbId}\n`);

  // Get agent IDs from registry or env
  const registryAgentIds = getAgentIdsFromRegistry();
  const envAgentIds = getAgentIdsFromEnv();

  const expertAgents = [
    { name: "Lead Expert", key: "lead-expert" },
    { name: "Customer Expert", key: "customer-expert" },
    { name: "Inventory Expert", key: "inventory-expert" },
    { name: "Campaign Expert", key: "campaign-expert" },
  ];

  let successCount = 0;

  for (const expert of expertAgents) {
    const agentId = registryAgentIds[expert.key] || envAgentIds[expert.key];

    if (!agentId) {
      console.log(`⚠️  ${expert.name}: Agent ID not found, skipping`);
      continue;
    }

    try {
      console.log(`📝 Connecting ${expert.name}...`);

      // Check if agent exists
      const agent = await getAgent(agentId, agentConfig);
      if (!agent) {
        console.log(`   ⚠️  Agent not found: ${agentId}`);
        continue;
      }

      // Connect KB with optimized retrieval settings
      await connectKnowledgeBase(agentId, kbId, agentConfig, {
        top_k: 5,
        retrieval_type: "basic",
        score_threshold: 0.5,
      });

      console.log(`   ✅ Connected to KB`);
      successCount++;
    } catch (error) {
      console.log(`   ❌ Failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`✅ Connected ${successCount}/${expertAgents.length} agents to Knowledge Base`);
  console.log("=".repeat(60));

  if (successCount === expertAgents.length) {
    console.log("\n🎉 All expert agents are now connected to the Knowledge Base!");
    console.log("   They will use RAG to retrieve relevant business data.");
  } else {
    console.log("\n⚠️  Some agents could not be connected.");
    console.log("   Make sure to run setup-multi-agents.ts first.");
  }
}

main();
