#!/usr/bin/env bun
/**
 * Setup All Agents Script
 *
 * Creates all pending agents in the Lyzr API and updates the registry.
 * Also connects knowledge bases to their respective agents.
 *
 * Usage:
 *   bun run setup-all              # Setup all pending agents
 *   bun run setup-all --app=compliance-qa  # Setup specific app
 *   bun run setup-all --dry-run    # Preview without creating
 */

import {
  AGENTS,
  KNOWLEDGE_BASES,
  getPendingAgents,
  getAgentsByApp,
  setAgentId,
  buildLyzrFeatures,
  type AppId,
} from "../src";
import {
  createAgent,
  getOrCreateAgent,
  connectKnowledgeBase,
  type AgentManagementConfig,
} from "@tasco/api";

// Parse CLI arguments
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const appArg = args.find((a) => a.startsWith("--app="));
const targetAppId = appArg ? (appArg.split("=")[1] as AppId) : undefined;

// Configuration
const config: AgentManagementConfig = {
  apiKey: process.env.LYZR_API_KEY || "",
};

if (!config.apiKey && !dryRun) {
  console.error("Error: LYZR_API_KEY environment variable is required");
  process.exit(1);
}

async function setupAgent(agentKey: string) {
  const agent = AGENTS[agentKey];
  if (!agent) {
    console.error(`Agent ${agentKey} not found`);
    return null;
  }

  console.log(`\n📦 Setting up: ${agent.name} (${agentKey})`);
  console.log(`   Role: ${agent.role}`);
  console.log(`   Model: ${agent.model}`);
  console.log(`   App: ${agent.appId}`);

  if (agent.id) {
    console.log(`   ✅ Already configured with ID: ${agent.id}`);
    return { agentKey, agentId: agent.id, created: false };
  }

  if (dryRun) {
    console.log(`   🔍 [DRY RUN] Would create agent`);
    return { agentKey, agentId: null, created: false };
  }

  try {
    // Build features array (includes RAG if configured)
    const features = buildLyzrFeatures(agentKey);

    // Create agent in Lyzr API
    const { agent: createdAgent, created } = await getOrCreateAgent(
      {
        name: agent.name,
        system_prompt: agent.systemPrompt,
        model: agent.model,
        temperature: agent.temperature,
        features: features.length > 0 ? features : undefined,
      },
      config
    );

    if (created) {
      console.log(`   ✅ Created with ID: ${createdAgent.agent_id}`);
      setAgentId(agentKey, createdAgent.agent_id);
    } else {
      console.log(`   ℹ️  Found existing agent: ${createdAgent.agent_id}`);
      setAgentId(agentKey, createdAgent.agent_id);
    }

    return { agentKey, agentId: createdAgent.agent_id, created };
  } catch (error) {
    console.error(`   ❌ Error creating agent:`, error);
    return { agentKey, agentId: null, error };
  }
}

async function connectKB(agentKey: string, kbKey: string) {
  const agent = AGENTS[agentKey];
  const kb = KNOWLEDGE_BASES[kbKey];

  if (!agent?.id || !kb?.id) {
    console.log(`   ⏭️  Skipping KB connection: ${kbKey} (missing IDs)`);
    return false;
  }

  console.log(`   🔗 Connecting KB: ${kb.name} → ${agent.name}`);

  if (dryRun) {
    console.log(`      [DRY RUN] Would connect KB`);
    return true;
  }

  try {
    const ragConfig = agent.ragConfig;
    await connectKnowledgeBase(agent.id, kb.id, config, {
      top_k: ragConfig?.topK ?? 5,
    });
    console.log(`      ✅ Connected successfully`);
    return true;
  } catch (error) {
    console.error(`      ❌ Error connecting KB:`, error);
    return false;
  }
}

async function main() {
  console.log("🚀 Tasco Agent Setup Script");
  console.log("===========================");

  if (dryRun) {
    console.log("🔍 DRY RUN MODE - No changes will be made\n");
  }

  // Get agents to setup
  let agentsToSetup = getPendingAgents();

  if (targetAppId) {
    console.log(`📱 Target app: ${targetAppId}`);
    agentsToSetup = agentsToSetup.filter((a) => a.appId === targetAppId);
  }

  console.log(`\n📋 Agents to setup: ${agentsToSetup.length}`);

  if (agentsToSetup.length === 0) {
    console.log("✅ All agents are already configured!");
    return;
  }

  // Group by app
  const agentsByApp = agentsToSetup.reduce(
    (acc, agent) => {
      if (!acc[agent.appId]) acc[agent.appId] = [];
      acc[agent.appId].push(agent);
      return acc;
    },
    {} as Record<string, typeof agentsToSetup>
  );

  // Setup agents by app
  const results: Array<{
    agentKey: string;
    agentId: string | null;
    created?: boolean;
    error?: unknown;
  }> = [];

  for (const [appId, agents] of Object.entries(agentsByApp)) {
    console.log(`\n\n📱 App: ${appId}`);
    console.log("─".repeat(40));

    for (const agent of agents) {
      const result = await setupAgent(agent.key);
      if (result) {
        results.push(result);
      }
    }
  }

  // Connect knowledge bases
  console.log("\n\n🔗 Connecting Knowledge Bases");
  console.log("─".repeat(40));

  for (const kb of Object.values(KNOWLEDGE_BASES)) {
    if (targetAppId && kb.appId !== targetAppId) continue;

    for (const agentKey of kb.connectedAgents) {
      await connectKB(agentKey, kb.key);
    }
  }

  // Summary
  console.log("\n\n📊 Summary");
  console.log("─".repeat(40));

  const created = results.filter((r) => r.created).length;
  const existing = results.filter((r) => !r.created && r.agentId).length;
  const failed = results.filter((r) => r.error).length;

  console.log(`   ✅ Created: ${created}`);
  console.log(`   ℹ️  Existing: ${existing}`);
  console.log(`   ❌ Failed: ${failed}`);

  if (!dryRun && created > 0) {
    console.log("\n💡 Next steps:");
    console.log("   1. Run 'bun run sync-registry' to persist agent IDs");
    console.log("   2. Update .env files with new agent IDs");
    console.log("   3. Restart your apps to use new agents");
  }

  // Output env vars for created agents
  if (created > 0 || existing > 0) {
    console.log("\n📝 Environment Variables:");
    for (const result of results) {
      if (result.agentId) {
        const agent = AGENTS[result.agentKey];
        console.log(`   ${agent.envVar}=${result.agentId}`);
      }
    }
  }
}

main().catch(console.error);
