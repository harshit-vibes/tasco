#!/usr/bin/env node
/**
 * Connect Multi-Agent System via API
 *
 * This script uses the global @tasco/api utilities to:
 * 1. Connect Legal KB to Legal Expert Agent
 * 2. Connect Internal KB to Internal Expert Agent
 *
 * Run: bun run connect-agents
 */

import {
  getAgent,
  connectKnowledgeBase,
  getAgentKnowledgeBase,
  type AgentManagementConfig,
} from "@tasco/api";
import { getAgent as getAgentFromRegistry } from "@tasco/agents/registry";
import { getKB } from "@tasco/agents/knowledge-bases";

// Get agent IDs from central registry (fallback to env vars)
const mainAgentConfig = getAgentFromRegistry("compliance-qa:orchestrator");
const legalAgentConfig = getAgentFromRegistry("compliance-qa:legal-expert");
const internalAgentConfig = getAgentFromRegistry("compliance-qa:internal-expert");

const MAIN_AGENT_ID = mainAgentConfig?.id || process.env.NEXT_PUBLIC_LYZR_AGENT_ID;
const LEGAL_AGENT_ID = legalAgentConfig?.id || process.env.NEXT_PUBLIC_LYZR_LEGAL_AGENT_ID;
const INTERNAL_AGENT_ID = internalAgentConfig?.id || process.env.NEXT_PUBLIC_LYZR_INTERNAL_AGENT_ID;

// Get KB IDs from central registry (fallback to env vars)
const legalKB = getKB("compliance-qa:legal-kb");
const internalKB = getKB("compliance-qa:internal-kb");

const LEGAL_KB_ID = legalKB?.id || process.env.LYZR_LEGAL_KB_ID;
const INTERNAL_KB_ID = internalKB?.id || process.env.LYZR_KB_ID;

const API_KEY = process.env.LYZR_API_KEY || process.env.NEXT_PUBLIC_LYZR_API_KEY;

async function main() {
  if (!API_KEY) {
    console.error("Error: LYZR_API_KEY environment variable is required");
    process.exit(1);
  }

  const config: AgentManagementConfig = { apiKey: API_KEY };

  console.log("Connecting Multi-Agent System...\n");

  console.log("Configuration:");
  console.log(`   Main Orchestrator: ${MAIN_AGENT_ID}`);
  console.log(`   Legal Expert:      ${LEGAL_AGENT_ID}`);
  console.log(`   Internal Expert:   ${INTERNAL_AGENT_ID}`);
  console.log(`   Legal KB:          ${LEGAL_KB_ID}`);
  console.log(`   Internal KB:       ${INTERNAL_KB_ID}`);
  console.log();

  try {
    // Step 1: Get current main agent configuration
    console.log("1. Fetching main agent configuration...");
    const mainAgent = await getAgent(MAIN_AGENT_ID, config);
    console.log(`   Found: ${mainAgent.name}`);

    // Step 2: Connect Legal KB to Legal Expert Agent
    console.log("\n2. Connecting Legal KB to Legal Expert Agent...");
    await connectKnowledgeBase(LEGAL_AGENT_ID, LEGAL_KB_ID, config, { top_k: 5 });
    console.log("   Legal KB connected to Legal Expert");

    // Step 3: Connect Internal KB to Internal Expert Agent
    console.log("\n3. Connecting Internal KB to Internal Expert Agent...");
    await connectKnowledgeBase(INTERNAL_AGENT_ID, INTERNAL_KB_ID, config, { top_k: 5 });
    console.log("   Internal KB connected to Internal Expert");

    // Verify the connections
    console.log("\n4. Verifying connections...");

    const legalKbId = await getAgentKnowledgeBase(LEGAL_AGENT_ID, config);
    console.log(`   Legal Expert KB: ${legalKbId || "not set"}`);

    const internalKbId = await getAgentKnowledgeBase(INTERNAL_AGENT_ID, config);
    console.log(`   Internal Expert KB: ${internalKbId || "not set"}`);

    console.log("\n" + "=".repeat(50));
    console.log("Multi-Agent System Connected Successfully!");
    console.log("=".repeat(50));

    console.log("\nArchitecture:");
    console.log(`
    User Query
        |
    [Main Orchestrator] <-- ${MAIN_AGENT_ID}
        |
        +-- [Legal Expert] <-- ${LEGAL_AGENT_ID}
        |       |-- Legal KB: ${LEGAL_KB_ID}
        |
        +-- [Internal Expert] <-- ${INTERNAL_AGENT_ID}
                |-- Internal KB: ${INTERNAL_KB_ID}
    `);

    console.log("You can now test the multi-agent system!");
    console.log("   Run: bun run dev");

  } catch (error) {
    console.error("\nError connecting agents:", error);
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

main();
