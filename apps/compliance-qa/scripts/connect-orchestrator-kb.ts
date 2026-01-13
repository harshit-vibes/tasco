#!/usr/bin/env node
/**
 * Connect KB to Main Orchestrator Agent
 * This enables citations to appear in chat responses
 */

import { connectKnowledgeBase, getAgentKnowledgeBase, type AgentManagementConfig } from "@tasco/api";

const ORCHESTRATOR_ID = process.env.NEXT_PUBLIC_LYZR_AGENT_ID || "696108ed5e0239738a838cd8";
const INTERNAL_KB_ID = process.env.LYZR_KB_ID || "6960a63fee18986913060bc0";
const API_KEY = process.env.LYZR_API_KEY || process.env.NEXT_PUBLIC_LYZR_API_KEY;

async function main() {
  if (!API_KEY) {
    console.error("❌ Error: LYZR_API_KEY environment variable is required");
    process.exit(1);
  }

  const config: AgentManagementConfig = { apiKey: API_KEY };

  console.log("🔗 Connecting Internal KB to Main Orchestrator...");
  console.log(`   Orchestrator: ${ORCHESTRATOR_ID}`);
  console.log(`   KB:           ${INTERNAL_KB_ID}`);

  await connectKnowledgeBase(ORCHESTRATOR_ID, INTERNAL_KB_ID, config, { top_k: 5 });

  const kbId = await getAgentKnowledgeBase(ORCHESTRATOR_ID, config);
  console.log(`\n✅ Main Orchestrator KB: ${kbId}`);
  console.log("   Citations will now appear in chat responses!");
}

main().catch(console.error);
