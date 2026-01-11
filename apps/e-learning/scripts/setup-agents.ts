#!/usr/bin/env node
/**
 * Setup script for E-Learning Agents
 *
 * Creates:
 * - E-Learning Chat Assistant (main chat agent for learner support)
 * - E-Learning Validation Agent (validates response quality)
 *
 * Run: bun run setup-agents
 * Or:  LYZR_API_KEY=xxx bun run setup-agents
 */

import { setupELearningAgents } from "../lib/agents/setup";
import * as fs from "fs";
import * as path from "path";

// Path to central registry
const REGISTRY_PATH = path.join(__dirname, "../../../lyzr-registry.json");

async function updateRegistry(mainAgentId: string, validationAgentId: string) {
  try {
    const registryContent = fs.readFileSync(REGISTRY_PATH, "utf-8");
    const registry = JSON.parse(registryContent);

    // Update e-learning agents
    if (registry.agents["e-learning"]) {
      if (registry.agents["e-learning"].main) {
        registry.agents["e-learning"].main.id = mainAgentId;
        delete registry.agents["e-learning"].main.status;
      }
      if (registry.agents["e-learning"].validation) {
        registry.agents["e-learning"].validation.id = validationAgentId;
        delete registry.agents["e-learning"].validation.status;
      }
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
    console.log("  LYZR_API_KEY=your_key bun run setup-agents");
    console.log("\nOr set it in .env.local:");
    console.log("  LYZR_API_KEY=your_key");
    process.exit(1);
  }

  try {
    const result = await setupELearningAgents(apiKey);

    console.log("\n" + "=".repeat(60));
    console.log("✅ E-Learning agents setup complete!");
    console.log("=".repeat(60));

    console.log("\n📋 Agent IDs:");
    console.log(`   Chat Assistant:     ${result.mainAgentId}`);
    console.log(`   Validation Agent:   ${result.validationAgentId}`);

    // Update central registry
    await updateRegistry(result.mainAgentId, result.validationAgentId);

    console.log("\n🔧 Add these to .env.local:");
    console.log(`   NEXT_PUBLIC_LYZR_AGENT_ID=${result.mainAgentId}`);
    console.log(`   NEXT_PUBLIC_LYZR_VALIDATION_AGENT_ID=${result.validationAgentId}`);

    console.log("\n🎉 Your e-learning chat is ready to use!");
  } catch (error) {
    console.error("\n❌ Error setting up agents:", error);
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

main();
