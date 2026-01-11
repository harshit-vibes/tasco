#!/usr/bin/env bun
/**
 * Script to update Lyzr agent's model configuration
 *
 * Usage:
 *   bun scripts/update-agent-model.ts
 *
 * Requires:
 *   LYZR_API_KEY - Your Lyzr API key
 *   LYZR_AGENT_ID - The agent ID to update
 */

const LYZR_API_URL = "https://agent-prod.studio.lyzr.ai";

// Get credentials from environment
const apiKey = process.env.LYZR_API_KEY || process.env.NEXT_PUBLIC_LYZR_API_KEY;
const agentId = process.env.LYZR_AGENT_ID || process.env.NEXT_PUBLIC_LYZR_AGENT_ID;

if (!apiKey || !agentId) {
  console.error("Error: LYZR_API_KEY and LYZR_AGENT_ID environment variables are required");
  console.log("\nUsage:");
  console.log("  export LYZR_API_KEY=your-api-key");
  console.log("  export LYZR_AGENT_ID=your-agent-id");
  console.log("  bun scripts/update-agent-model.ts");
  process.exit(1);
}

const headers = {
  "Content-Type": "application/json",
  "x-api-key": apiKey,
};

async function main() {
  console.log("🔍 Fetching agent details...");

  // 1. Get current agent details
  const agentResponse = await fetch(`${LYZR_API_URL}/v3/agents/${agentId}`, {
    headers,
  });

  if (!agentResponse.ok) {
    console.error("Failed to fetch agent:", await agentResponse.text());
    process.exit(1);
  }

  const agent = await agentResponse.json();
  console.log("✅ Agent:", agent.name);
  console.log("   Current Model:", agent.model || "Not specified");
  console.log("   Provider:", agent.provider_id || "Not specified");

  // 2. Update agent with Gemini model using v3 API
  console.log("\n🔄 Updating agent to use Gemini...");

  // For v3 agents, we update the model directly
  const updatePayload = {
    model: "gemini-1.5-pro-latest",
    provider_id: "Google",  // Provider name for Gemini
  };

  console.log("   New Model Config:", JSON.stringify(updatePayload, null, 2));

  // Try v3 PATCH endpoint
  const updateResponse = await fetch(`${LYZR_API_URL}/v3/agents/${agentId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(updatePayload),
  });

  if (!updateResponse.ok) {
    const errorText = await updateResponse.text();
    console.error("Failed to update agent:", errorText);
    console.log("\n⚠️  Note: Model changes may need to be done via Lyzr Studio UI");
    console.log("   Visit: https://studio.lyzr.ai/agent-create/" + agentId);
    process.exit(1);
  }

  const updateResult = await updateResponse.json();
  console.log("\n✅ Agent updated successfully!");
  console.log("   Response:", JSON.stringify(updateResult, null, 2));

  // 3. Verify the update
  console.log("\n🔍 Verifying update...");
  const verifyResponse = await fetch(`${LYZR_API_URL}/v3/agents/${agentId}`, {
    headers,
  });

  const verifiedAgent = await verifyResponse.json();
  console.log("   Updated Model:", verifiedAgent.model);
  console.log("   Updated Provider:", verifiedAgent.provider_id);

  console.log("\n🎉 Done! Agent is now using Gemini 1.5 Pro.");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
