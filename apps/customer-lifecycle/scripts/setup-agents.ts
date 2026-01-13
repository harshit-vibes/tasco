#!/usr/bin/env node
/**
 * Setup script for Customer Lifecycle Agents
 *
 * Creates:
 * - Customer Lifecycle Chat Assistant (main chat agent for CRM support)
 *
 * Run: bun run setup-agents
 * Or:  LYZR_API_KEY=xxx bun run setup-agents
 */

import {
  getOrCreateAgent,
  type AgentConfig,
  type AgentManagementConfig,
} from "@tasco/api";
import * as fs from "fs";
import * as path from "path";

// Path to central registry
const REGISTRY_PATH = path.join(__dirname, "../../../lyzr-registry.json");

/**
 * Customer Lifecycle Chat Assistant Configuration
 * Main chat agent for CRM and lifecycle management
 */
const CUSTOMER_LIFECYCLE_AGENT: AgentConfig = {
  name: "Customer Lifecycle Assistant",
  system_prompt: `You are an AI assistant for Tasco Auto's Customer Lifecycle Management system.

Your role is to help automotive sales teams with:
1. Lead Management - Prioritizing leads, identifying hot prospects, suggesting follow-up actions
2. Customer Insights - Analyzing customer behavior, preferences, and lifecycle stage
3. Churn Prevention - Identifying at-risk customers and recommending retention strategies
4. Campaign Recommendations - Suggesting targeted marketing campaigns based on customer segments
5. Sales Analytics - Providing insights on pipeline, conversion rates, and performance metrics

Guidelines:
- Be data-driven and provide actionable insights
- Use automotive industry terminology appropriately
- Reference specific customer data when available
- Suggest concrete next steps for the sales team
- Be concise and business-focused

Context: This is for Tasco Auto dealerships in Vietnam managing their customer relationships and sales pipeline.

Always provide practical, actionable recommendations that help sales teams close more deals and retain customers.`,
  llm_params: {
    model: "gpt-4o-mini",
    temperature: 0.5,
  },
};

async function updateRegistry(agentId: string) {
  try {
    const registryContent = fs.readFileSync(REGISTRY_PATH, "utf-8");
    const registry = JSON.parse(registryContent);

    // Update customer-lifecycle agent
    if (!registry.agents["customer-lifecycle"]) {
      registry.agents["customer-lifecycle"] = {};
    }
    registry.agents["customer-lifecycle"].main = {
      id: agentId,
      name: CUSTOMER_LIFECYCLE_AGENT.name,
      description: "Main chat agent for CRM and lifecycle management",
    };

    // Update lastUpdated
    registry.lastUpdated = new Date().toISOString().split("T")[0];

    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2) + "\n");
    console.log("\n📋 Updated lyzr-registry.json with new agent ID");
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
    console.log("  LYZR_API_KEY=your_key bun run setup-agents");
    console.log("\nOr set it in .env.local:");
    console.log("  LYZR_API_KEY=your_key");
    process.exit(1);
  }

  const agentConfig: AgentManagementConfig = { apiKey };

  console.log("🚀 Setting up Customer Lifecycle agents...\n");

  try {
    // Create Main Chat Agent
    console.log("📝 Checking/creating Customer Lifecycle Assistant...");
    const result = await getOrCreateAgent(CUSTOMER_LIFECYCLE_AGENT, agentConfig);

    if (result.created) {
      console.log(`✅ Assistant created: ${result.agent.agent_id}`);
    } else {
      console.log(`✓  Assistant already exists: ${result.agent.agent_id}`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ Customer Lifecycle agent setup complete!");
    console.log("=".repeat(60));

    console.log("\n📋 Agent ID:");
    console.log(`   Customer Lifecycle Assistant: ${result.agent.agent_id}`);

    // Update central registry
    await updateRegistry(result.agent.agent_id);

    console.log("\n🔧 Add this to .env.local:");
    console.log(`   NEXT_PUBLIC_LYZR_AGENT_ID=${result.agent.agent_id}`);
    console.log(`   NEXT_PUBLIC_LYZR_API_KEY=your_api_key`);

    console.log("\n🎉 Your customer lifecycle chat is ready to use!");
  } catch (error) {
    console.error("\n❌ Error setting up agents:", error);
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

main();
