#!/usr/bin/env node
/**
 * Fix agent configurations to ensure provider_id is properly set
 * This re-saves all agents with complete configuration
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

async function updateAgent(agentId: string, payload: any): Promise<any> {
  console.log(`  Updating agent ${agentId}...`);
  console.log(`  Payload: ${JSON.stringify(payload, null, 2).slice(0, 500)}...`);

  const response = await fetch(`${LYZR_API_URL}/v3/agents/${agentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update agent: ${response.status} ${errorText}`);
  }

  return response.json();
}

async function testInference(agentId: string): Promise<boolean> {
  console.log(`  Testing inference for ${agentId}...`);

  try {
    const response = await fetch(`${LYZR_API_URL}/v3/inference/chat/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({
        agent_id: agentId,
        user_id: "test-user",
        session_id: `fix-test-${Date.now()}`,
        message: "Say hello briefly",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`  ❌ Inference error: ${errorText.slice(0, 200)}`);
      return false;
    }

    const data = await response.json();
    console.log(`  ✅ Inference successful: ${data.response?.slice(0, 100) || "OK"}`);
    return true;
  } catch (error) {
    console.log(`  ❌ Inference error: ${error}`);
    return false;
  }
}

async function fixAgent(name: string, agentId: string): Promise<void> {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Fixing: ${name} (${agentId})`);
  console.log(`${"=".repeat(60)}`);

  // Get current agent configuration
  const agent = await getAgent(agentId);
  console.log(`  Current config:`);
  console.log(`    name: ${agent.name}`);
  console.log(`    provider_id: ${agent.provider_id || "MISSING"}`);
  console.log(`    model: ${agent.model}`);
  console.log(`    temperature: ${agent.temperature}`);
  console.log(`    top_p: ${agent.top_p}`);

  // Build complete payload with all required fields
  const payload = {
    name: agent.name,
    provider_id: "openai", // Ensure this is always set
    llm_credential_id: "lyzr_openai", // Required for inference API
    model: agent.model || "gpt-4o-mini",
    temperature: agent.temperature ?? 0.3,
    top_p: agent.top_p ?? 0.9,
    agent_instructions: agent.agent_instructions || agent.system_prompt || "",
    features: agent.features || [],
    tools: agent.tools || [],
    store_messages: agent.store_messages ?? true,
  };

  // Update the agent
  await updateAgent(agentId, payload);
  console.log(`  ✅ Updated successfully`);

  // Verify the update
  const updated = await getAgent(agentId);
  console.log(`  Verified:`);
  console.log(`    provider_id: ${updated.provider_id}`);
  console.log(`    model: ${updated.model}`);

  // Test inference
  await testInference(agentId);
}

async function main() {
  if (!API_KEY) {
    console.error("❌ Error: LYZR_API_KEY environment variable is required");
    console.log("\nUsage:");
    console.log("  LYZR_API_KEY=xxx bun run scripts/fix-agents.ts");
    process.exit(1);
  }

  console.log("🔧 Fixing all Compliance QA agents...\n");
  console.log("API Key:", API_KEY.slice(0, 15) + "...");

  // Fix all agents
  for (const [name, agentId] of Object.entries(AGENTS)) {
    try {
      await fixAgent(name, agentId);
    } catch (error) {
      console.error(`\n❌ Failed to fix ${name}: ${error}`);
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log("✅ Done! All agents have been updated.");
  console.log(`${"=".repeat(60)}`);
}

main().catch(console.error);
