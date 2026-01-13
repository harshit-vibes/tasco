#!/usr/bin/env bun
/**
 * Fix Agent RAG Configuration
 *
 * This script updates the compliance-qa agents to use the correct
 * KNOWLEDGE_BASE feature format instead of the old "rag" format.
 *
 * The Lyzr API expects:
 * {
 *   type: "KNOWLEDGE_BASE",
 *   config: {
 *     lyzr_rag: {
 *       base_url: "https://rag-prod.studio.lyzr.ai",
 *       rag_id: "...",
 *       params: { top_k, retrieval_type, score_threshold }
 *     },
 *     agentic_rag: []
 *   }
 * }
 *
 * Usage:
 *   LYZR_API_KEY=xxx bun run scripts/fix-agent-rag-config.ts
 */

import {
  getAgent,
  connectKnowledgeBase,
  type AgentManagementConfig,
} from "@tasco/api";

// Agent and KB mapping from registry
const AGENTS_TO_FIX = [
  {
    name: "Tasco Legal Framework Expert",
    agentId: "69613776c57d451439d4c8f4",
    knowledgeBaseId: "69613775979041509ac8ee82",
    ragConfig: {
      top_k: 5,
      retrieval_type: "basic" as const,
      score_threshold: 0,
    },
  },
  {
    name: "Tasco Internal Policy Expert",
    agentId: "69613777c57d451439d4c8f5",
    knowledgeBaseId: "6960a63fee18986913060bc0",
    ragConfig: {
      top_k: 5,
      retrieval_type: "basic" as const,
      score_threshold: 0,
    },
  },
];

async function main() {
  const apiKey = process.env.LYZR_API_KEY;
  if (!apiKey) {
    console.error("Error: LYZR_API_KEY environment variable is required");
    process.exit(1);
  }

  const config: AgentManagementConfig = { apiKey };

  console.log("=".repeat(60));
  console.log("Fix Agent RAG Configuration");
  console.log("=".repeat(60));
  console.log();

  for (const agentInfo of AGENTS_TO_FIX) {
    console.log(`\nProcessing: ${agentInfo.name}`);
    console.log(`  Agent ID: ${agentInfo.agentId}`);
    console.log(`  KB ID:    ${agentInfo.knowledgeBaseId}`);

    try {
      // First, get current agent config
      console.log("  Fetching current config...");
      const currentAgent = await getAgent(agentInfo.agentId, config);

      // Check current features
      const currentFeatures = currentAgent.features || [];
      console.log(`  Current features: ${JSON.stringify(currentFeatures.map(f => f.type))}`);

      // Check if already has KNOWLEDGE_BASE feature
      const hasCorrectFormat = currentFeatures.some(
        (f) =>
          f.type === "KNOWLEDGE_BASE" &&
          (f.config as any)?.lyzr_rag?.rag_id === agentInfo.knowledgeBaseId
      );

      if (hasCorrectFormat) {
        console.log("  Already has correct KNOWLEDGE_BASE format. Skipping.");
        continue;
      }

      // Connect KB with correct format
      console.log("  Connecting KB with correct format...");
      const updatedAgent = await connectKnowledgeBase(
        agentInfo.agentId,
        agentInfo.knowledgeBaseId,
        config,
        agentInfo.ragConfig
      );

      // Verify the update
      const newFeatures = updatedAgent.features || [];
      const kbFeature = newFeatures.find((f) => f.type === "KNOWLEDGE_BASE");

      if (kbFeature) {
        console.log("  SUCCESS! Updated to KNOWLEDGE_BASE format:");
        console.log(`    Type: ${kbFeature.type}`);
        console.log(`    RAG ID: ${(kbFeature.config as any)?.lyzr_rag?.rag_id}`);
        console.log(`    Base URL: ${(kbFeature.config as any)?.lyzr_rag?.base_url}`);
      } else {
        console.log("  WARNING: Feature update may have failed. Please verify manually.");
      }
    } catch (error) {
      console.error(`  ERROR: ${error instanceof Error ? error.message : error}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("Done! All agents processed.");
  console.log("=".repeat(60));
}

main().catch(console.error);
