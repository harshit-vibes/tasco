#!/usr/bin/env node
/**
 * Setup script for Sales Order Lyzr Agents
 * Run: bun run setup-agents
 * Or: LYZR_API_KEY=xxx bun run setup-agents
 */

import { setupSalesOrderAgents } from "../lib/agents/setup";

async function main() {
  const apiKey = process.env.LYZR_API_KEY || process.env.NEXT_PUBLIC_LYZR_API_KEY;

  if (!apiKey) {
    console.error("❌ Error: LYZR_API_KEY environment variable is required");
    console.log("\nUsage:");
    console.log("  LYZR_API_KEY=your_key bun run setup-agents");
    console.log("\nOr set it in .env.local:");
    console.log("  LYZR_API_KEY=your_key");
    process.exit(1);
  }

  try {
    const result = await setupSalesOrderAgents(apiKey);

    console.log("\n✅ Setup complete!");
    console.log("\n📋 Agent IDs:");
    console.log(`   Extraction Agent ID: ${result.extractionAgentId}`);
    console.log(`   Validation Agent ID: ${result.validationAgentId}`);

    console.log("\n🔧 Next steps:");
    console.log("1. Add these agent IDs to your .env.local file:");
    console.log(`   EXTRACTION_AGENT_ID=${result.extractionAgentId}`);
    console.log(`   VALIDATION_AGENT_ID=${result.validationAgentId}`);
    console.log("\n2. Restart your development server:");
    console.log("   bun run dev");
  } catch (error) {
    console.error("\n❌ Error setting up agents:", error);
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

main();
