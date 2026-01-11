#!/usr/bin/env node
/**
 * Setup script for Compliance QA Multi-Agent System
 *
 * Creates:
 * - Legal Expert Agent (Vietnamese law specialist)
 * - Internal Policy Expert Agent (Tasco policies specialist)
 * - Legal Knowledge Base (for _LEGAL category documents)
 *
 * Run: bun run setup-agents
 * Or:  LYZR_API_KEY=xxx bun run setup-agents
 */

import { setupComplianceAgents } from "../lib/agents/setup";

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
    const result = await setupComplianceAgents(apiKey);

    console.log("\n" + "=".repeat(60));
    console.log("✅ Setup complete!");
    console.log("=".repeat(60));

    console.log("\n📋 Agent IDs:");
    console.log(`   Legal Expert Agent:    ${result.legalAgentId}`);
    console.log(`   Internal Expert Agent: ${result.internalAgentId}`);

    console.log("\n📚 Knowledge Base IDs:");
    console.log(`   Legal KB: ${result.legalKbId}`);

    console.log("\n🔧 Next steps:");
    console.log("1. Add these IDs to your .env.local file:");
    console.log(`   NEXT_PUBLIC_LYZR_LEGAL_AGENT_ID=${result.legalAgentId}`);
    console.log(`   NEXT_PUBLIC_LYZR_INTERNAL_AGENT_ID=${result.internalAgentId}`);
    console.log(`   LYZR_LEGAL_KB_ID=${result.legalKbId}`);

    console.log("\n2. Connect the Knowledge Bases to agents in Lyzr Studio:");
    console.log("   - Legal Expert Agent → Legal KB (new)");
    console.log("   - Internal Expert Agent → Internal KB (existing: LYZR_KB_ID)");

    console.log("\n3. Sync documents to Knowledge Bases:");
    console.log("   bun run sync-documents");

    console.log("\n4. Restart your development server:");
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
