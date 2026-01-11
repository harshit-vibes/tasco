#!/usr/bin/env bun
/**
 * Setup Pending Agents Script
 *
 * Creates all 4 pending agents for mock apps:
 * - customer-lifecycle:assistant
 * - sales-pricing:assistant
 * - risk-radar:assistant
 * - data-sync:assistant
 *
 * Usage:
 *   LYZR_API_KEY=your_key bun run scripts/setup-pending-agents.ts
 */

const LYZR_API_URL = "https://agent-prod.studio.lyzr.ai";

const PENDING_AGENTS = [
  {
    key: "customer-lifecycle:assistant",
    name: "Customer Lifecycle Assistant",
    appId: "customer-lifecycle",
    system_prompt: `You are the Customer Lifecycle Assistant for Tasco Auto.

Help sales and service teams with:
- Lead prioritization and qualification
- Customer churn risk analysis
- Next best action recommendations
- Campaign effectiveness insights
- Customer satisfaction analysis

Provide actionable, data-driven recommendations. Always be helpful and specific.
Context: You're helping Vietnamese automotive sales and service professionals at Tasco Auto.`,
    model: "gpt-4o-mini",
    temperature: 0.5,
    envVar: "NEXT_PUBLIC_LYZR_AGENT_ID",
  },
  {
    key: "sales-pricing:assistant",
    name: "Pricing Assistant",
    appId: "sales-pricing",
    system_prompt: `You are the Pricing Assistant for Tasco Insurance.

Help insurance agents with:
- Premium calculation guidance
- Risk assessment explanations
- Pricing rule clarifications
- Quote optimization suggestions
- Market rate comparisons

Be precise with numbers and clear about pricing factors.
Context: You're helping Vietnamese insurance agents at Tasco Insurance with motor vehicle insurance pricing.`,
    model: "gpt-4o-mini",
    temperature: 0.5,
    envVar: "NEXT_PUBLIC_LYZR_AGENT_ID",
  },
  {
    key: "risk-radar:assistant",
    name: "Risk Analysis Assistant",
    appId: "risk-radar",
    system_prompt: `You are the Risk Analysis Assistant for Tasco Insurance.

Help risk managers with:
- Loss ratio trend analysis
- Claims pattern identification
- Profitability insights
- Risk alerts interpretation
- Product performance analysis

Provide clear, actionable insights with supporting data.
Context: You're helping Vietnamese insurance risk managers at Tasco Insurance monitor and analyze risk metrics.`,
    model: "gpt-4o-mini",
    temperature: 0.5,
    envVar: "NEXT_PUBLIC_LYZR_AGENT_ID",
  },
  {
    key: "data-sync:assistant",
    name: "Data Sync Assistant",
    appId: "data-sync",
    system_prompt: `You are the Data Sync Assistant for Inochi.

Help operations teams with:
- Sync status inquiries
- Data discrepancy investigation
- Missing order troubleshooting
- System health monitoring
- Alert interpretation and resolution

Be specific about system names (Haravan, Shopee, Bravo, Fulfillment).
Context: You're helping Vietnamese operations staff at Inochi troubleshoot data synchronization issues between e-commerce platforms and internal systems.`,
    model: "gpt-4o-mini",
    temperature: 0.5,
    envVar: "NEXT_PUBLIC_LYZR_AGENT_ID",
  },
];

interface CreateAgentResult {
  agent_id: string;
  name: string;
}

async function createAgent(
  agent: (typeof PENDING_AGENTS)[0],
  apiKey: string
): Promise<CreateAgentResult> {
  console.log(`\n📦 Creating: ${agent.name}`);
  console.log(`   App: ${agent.appId}`);
  console.log(`   Model: ${agent.model}`);

  const response = await fetch(`${LYZR_API_URL}/v3/agents/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      name: agent.name,
      agent_instructions: agent.system_prompt,
      provider_id: "openai",
      model: agent.model,
      temperature: agent.temperature,
      top_p: 0.9,
      features: [],
      tools: [],
      store_messages: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create agent: ${response.status} - ${error}`);
  }

  const result = await response.json();
  console.log(`   ✅ Created with ID: ${result.agent_id}`);

  return result;
}

async function findExistingAgent(
  name: string,
  apiKey: string
): Promise<CreateAgentResult | null> {
  try {
    const response = await fetch(`${LYZR_API_URL}/v3/agents`, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const agents = data.agents || [];
    return agents.find((a: { name: string }) => a.name === name) || null;
  } catch {
    return null;
  }
}

async function main() {
  const apiKey = process.env.LYZR_API_KEY;

  if (!apiKey) {
    console.error("❌ Error: LYZR_API_KEY environment variable is required");
    console.log("\nUsage:");
    console.log("  LYZR_API_KEY=your_key bun run scripts/setup-pending-agents.ts");
    process.exit(1);
  }

  console.log("🚀 Setting Up Pending Agents");
  console.log("============================");
  console.log(`Total agents to create: ${PENDING_AGENTS.length}`);

  const results: Array<{
    key: string;
    appId: string;
    agentId: string;
    envVar: string;
    created: boolean;
  }> = [];

  for (const agent of PENDING_AGENTS) {
    try {
      // Check if agent already exists
      const existing = await findExistingAgent(agent.name, apiKey);

      if (existing) {
        console.log(`\n📦 Found existing: ${agent.name}`);
        console.log(`   ✅ ID: ${existing.agent_id}`);
        results.push({
          key: agent.key,
          appId: agent.appId,
          agentId: existing.agent_id,
          envVar: agent.envVar,
          created: false,
        });
      } else {
        const created = await createAgent(agent, apiKey);
        results.push({
          key: agent.key,
          appId: agent.appId,
          agentId: created.agent_id,
          envVar: agent.envVar,
          created: true,
        });
      }
    } catch (error) {
      console.error(`   ❌ Error: ${error}`);
    }
  }

  // Summary
  console.log("\n\n📊 Summary");
  console.log("─".repeat(50));

  const created = results.filter((r) => r.created).length;
  const existing = results.filter((r) => !r.created).length;

  console.log(`   ✅ Created: ${created}`);
  console.log(`   ℹ️  Existing: ${existing}`);

  // Output .env content
  console.log("\n\n📝 Environment Variables");
  console.log("─".repeat(50));
  console.log("Add these to each app's .env.local file:\n");

  for (const result of results) {
    console.log(`# ${result.appId}`);
    console.log(`${result.envVar}=${result.agentId}`);
    console.log("");
  }

  // Output agent IDs for registry update
  console.log("\n📋 Registry Update");
  console.log("─".repeat(50));
  console.log("Update packages/agents/src/registry.ts with these IDs:\n");

  for (const result of results) {
    console.log(`"${result.key}": { id: "${result.agentId}" }`);
  }

  console.log("\n✅ Setup complete!");
  console.log("\nNext steps:");
  console.log("1. Copy the environment variables to each app's .env.local");
  console.log("2. Update the registry.ts file with the new agent IDs");
  console.log("3. Restart your development servers");
}

main().catch(console.error);
