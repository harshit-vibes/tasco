#!/usr/bin/env node
/**
 * Check agent configurations to diagnose provider_id issue
 */

const LYZR_API_URL = "https://agent-prod.studio.lyzr.ai";
const API_KEY = process.env.LYZR_API_KEY || process.env.NEXT_PUBLIC_LYZR_API_KEY || "";

// Agent IDs from .env.local
const AGENTS = {
  orchestrator: "696108ed5e0239738a838cd8",
  validation: "696108f75e0239738a838cdf",
  legal: "69613776c57d451439d4c8f4",
  internal: "69613777c57d451439d4c8f5",
};

async function getAgent(agentId: string): Promise<any> {
  const response = await fetch(`${LYZR_API_URL}/v3/agents/${agentId}`, {
    method: "GET",
    headers: {
      "x-api-key": API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get agent: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

async function fixAgent(agentId: string, agent: any): Promise<any> {
  // Ensure provider_id is set
  const payload = {
    name: agent.name,
    provider_id: agent.provider_id || "openai",
    model: agent.model || "gpt-4o-mini",
    temperature: agent.temperature ?? 0.3,
    top_p: agent.top_p ?? 0.9,
    agent_instructions: agent.agent_instructions || agent.system_prompt || "",
    features: agent.features || [],
    tools: agent.tools || [],
    store_messages: agent.store_messages ?? true,
  };

  console.log(`\nUpdating agent ${agentId} with payload:`);
  console.log(JSON.stringify(payload, null, 2));

  const response = await fetch(`${LYZR_API_URL}/v3/agents/${agentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to update agent: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

async function main() {
  if (!API_KEY) {
    console.error("❌ Error: LYZR_API_KEY environment variable is required");
    process.exit(1);
  }

  console.log("🔍 Checking agent configurations...\n");

  const needsFix: string[] = [];

  for (const [name, agentId] of Object.entries(AGENTS)) {
    try {
      console.log(`\n=== ${name.toUpperCase()} (${agentId}) ===`);
      const agent = await getAgent(agentId);

      console.log(`  name: ${agent.name}`);
      console.log(`  provider_id: ${agent.provider_id || "❌ MISSING"}`);
      console.log(`  model: ${agent.model}`);
      console.log(`  temperature: ${agent.temperature}`);
      console.log(`  top_p: ${agent.top_p}`);
      console.log(`  features: ${JSON.stringify(agent.features?.map((f: any) => f.type) || [])}`);

      // Check if provider_id is missing
      if (!agent.provider_id) {
        console.log(`  ⚠️  NEEDS FIX: provider_id is missing!`);
        needsFix.push(name);
      }
    } catch (error) {
      console.error(`  ❌ Error fetching agent: ${error}`);
    }
  }

  // If any agents need fixing
  if (needsFix.length > 0) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`🔧 ${needsFix.length} agents need provider_id fix: ${needsFix.join(", ")}`);
    console.log(`${"=".repeat(60)}`);

    const fix = process.argv.includes("--fix");

    if (fix) {
      console.log("\n🔧 Fixing agents...\n");

      for (const name of needsFix) {
        const agentId = AGENTS[name as keyof typeof AGENTS];
        try {
          const agent = await getAgent(agentId);
          await fixAgent(agentId, agent);
          console.log(`  ✅ Fixed ${name}`);
        } catch (error) {
          console.error(`  ❌ Failed to fix ${name}: ${error}`);
        }
      }

      console.log("\n✅ Done! Run this script again to verify.");
    } else {
      console.log("\nRun with --fix to update the agents:");
      console.log("  LYZR_API_KEY=xxx bun run scripts/check-agents.ts --fix");
    }
  } else {
    console.log("\n✅ All agents have provider_id configured correctly!");
  }
}

main().catch(console.error);
