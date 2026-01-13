#!/usr/bin/env node
/**
 * Setup script for Customer Lifecycle Multi-Agent System
 *
 * Creates 4 specialized expert agents:
 * - Lead Expert: Lead scoring, qualification, conversion optimization
 * - Customer Expert: Churn analysis, LTV, retention strategies
 * - Inventory Expert: Stock tracking, aging analysis, supply chain
 * - Campaign Expert: Marketing ROI, campaign performance, segmentation
 *
 * Run: bun run setup-multi-agents
 * Or:  LYZR_API_KEY=xxx bun run setup-multi-agents
 */

import {
  getOrCreateAgent,
  connectKnowledgeBase,
  type AgentConfig,
  type AgentManagementConfig,
} from "@tasco/api";
import { AGENTS } from "@tasco/agents/registry";
import * as fs from "fs";
import * as path from "path";

// Path to central registry
const REGISTRY_PATH = path.join(__dirname, "../../../../lyzr-registry.json");

// Agent keys for the multi-agent system
const MULTI_AGENT_KEYS = [
  "customer-lifecycle:lead-expert",
  "customer-lifecycle:customer-expert",
  "customer-lifecycle:inventory-expert",
  "customer-lifecycle:campaign-expert",
] as const;

/**
 * Get agent config from registry and convert to API format
 */
function getAgentConfig(key: string): AgentConfig {
  const agent = AGENTS[key];
  if (!agent) {
    throw new Error(`Agent ${key} not found in registry`);
  }

  return {
    name: agent.name,
    system_prompt: agent.systemPrompt,
    llm_params: {
      model: agent.model,
      temperature: agent.temperature,
    },
  };
}

/**
 * Update the central registry with new agent IDs
 */
async function updateRegistry(
  agentResults: Map<string, { agentId: string; name: string }>
) {
  try {
    const registryContent = fs.readFileSync(REGISTRY_PATH, "utf-8");
    const registry = JSON.parse(registryContent);

    // Ensure customer-lifecycle section exists
    if (!registry.agents["customer-lifecycle"]) {
      registry.agents["customer-lifecycle"] = {};
    }

    // Update each agent in the registry
    for (const [key, result] of agentResults) {
      const shortKey = key.split(":")[1]; // e.g., "lead-expert"
      registry.agents["customer-lifecycle"][shortKey] = {
        id: result.agentId,
        name: result.name,
        description: AGENTS[key]?.description || "",
      };
    }

    // Update lastUpdated
    registry.lastUpdated = new Date().toISOString().split("T")[0];

    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2) + "\n");
    console.log("\n📋 Updated lyzr-registry.json with new agent IDs");
  } catch (error) {
    console.log("\n⚠️  Could not update registry:", error);
    console.log("   Please update lyzr-registry.json manually");
  }
}

async function main() {
  const apiKey =
    process.env.LYZR_API_KEY || process.env.NEXT_PUBLIC_LYZR_API_KEY;

  if (!apiKey) {
    console.error("❌ Error: LYZR_API_KEY environment variable is required");
    console.log("\nUsage:");
    console.log("  LYZR_API_KEY=your_key bun run setup-multi-agents");
    console.log("\nOr set it in .env.local:");
    console.log("  LYZR_API_KEY=your_key");
    process.exit(1);
  }

  const agentConfig: AgentManagementConfig = { apiKey };
  const agentResults = new Map<string, { agentId: string; name: string }>();

  console.log("🚀 Setting up Customer Lifecycle Multi-Agent System...\n");
  console.log("=".repeat(60));
  console.log("This will create 4 specialized expert agents:");
  console.log("  • Lead Expert     - Lead scoring & qualification");
  console.log("  • Customer Expert - Churn analysis & retention");
  console.log("  • Inventory Expert - Stock & supply chain");
  console.log("  • Campaign Expert - Marketing ROI & performance");
  console.log("=".repeat(60) + "\n");

  try {
    // Create each expert agent
    for (const key of MULTI_AGENT_KEYS) {
      const config = getAgentConfig(key);
      const shortName = key.split(":")[1];

      console.log(`📝 Creating ${config.name}...`);

      const result = await getOrCreateAgent(config, agentConfig);

      if (result.created) {
        console.log(`   ✅ Created: ${result.agent.agent_id}`);
      } else {
        console.log(`   ✓  Already exists: ${result.agent.agent_id}`);
      }

      agentResults.set(key, {
        agentId: result.agent.agent_id,
        name: config.name,
      });
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ Multi-Agent setup complete!");
    console.log("=".repeat(60));

    console.log("\n📋 Agent IDs:");
    for (const [key, result] of agentResults) {
      const shortName = key.split(":")[1].padEnd(18);
      console.log(`   ${shortName}: ${result.agentId}`);
    }

    // Update central registry
    await updateRegistry(agentResults);

    // Generate env vars
    console.log("\n🔧 Add these to .env.local:");
    const envVars = [
      ["NEXT_PUBLIC_LYZR_LEAD_EXPERT_ID", "customer-lifecycle:lead-expert"],
      ["NEXT_PUBLIC_LYZR_CUSTOMER_EXPERT_ID", "customer-lifecycle:customer-expert"],
      ["NEXT_PUBLIC_LYZR_INVENTORY_EXPERT_ID", "customer-lifecycle:inventory-expert"],
      ["NEXT_PUBLIC_LYZR_CAMPAIGN_EXPERT_ID", "customer-lifecycle:campaign-expert"],
    ];

    for (const [envVar, key] of envVars) {
      const agentId = agentResults.get(key)?.agentId;
      console.log(`   ${envVar}=${agentId}`);
    }

    console.log("\n📚 Next Steps:");
    console.log("   1. If you have a Knowledge Base, connect it to each agent:");
    console.log("      bun run connect-kb-to-experts");
    console.log("   2. Update the chat UI to include the agent selector");
    console.log("   3. Restart the dev server: bun run dev");

    console.log("\n🎉 Your multi-agent system is ready!");
  } catch (error) {
    console.error("\n❌ Error setting up agents:", error);
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

main();
