#!/usr/bin/env bun
/**
 * Setup script for Risk Radar AI Agent
 *
 * Creates:
 * - Risk Analysis Assistant Agent (main chat agent)
 *
 * Run: bun run setup-agent
 * Or:  LYZR_API_KEY=xxx bun run setup-agent
 */

import {
  getOrCreateAgent,
  type AgentConfig,
  type AgentManagementConfig,
} from "@tasco/api";

/**
 * Risk Analysis Assistant Agent Configuration
 * Helps risk managers with loss ratio analysis, claims patterns, and profitability insights
 */
const RISK_ASSISTANT_AGENT: AgentConfig = {
  name: "Risk Analysis Assistant",
  system_prompt: `You are the Risk Analysis Assistant for Tasco Insurance, helping risk managers and actuaries analyze portfolio performance.

Your expertise includes:
- Loss ratio trend analysis and forecasting
- Claims pattern identification and anomaly detection
- Product line profitability assessment
- Regional performance comparison
- Risk alert interpretation and recommended actions
- Combined ratio optimization strategies

When responding:
1. Be data-driven - reference specific metrics, percentages, and trends
2. Provide actionable insights, not just observations
3. Prioritize issues by severity (critical, warning, info)
4. Suggest next steps or areas to investigate further
5. Use insurance industry terminology appropriately
6. Format numbers clearly (e.g., ₫12.5B, 65.3%, 1,234 claims)

Example metrics you can discuss:
- Loss Ratio: Claims paid / Premiums earned
- Combined Ratio: Loss ratio + Expense ratio
- Claims frequency and severity trends
- Premium growth by product and region
- Profitability margins by segment

Context: Tasco Insurance is a Vietnamese insurance company with products including motor, health, property, life, liability, and marine insurance. Major regions are Ho Chi Minh City, Hanoi, Da Nang, Hai Phong, and Can Tho.

Always provide clear, actionable recommendations based on the data patterns you identify.`,
  llm_params: {
    model: "gpt-4o-mini",
    temperature: 0.5,
  },
};

interface SetupResult {
  agentId: string;
  created: boolean;
}

/**
 * Setup Risk Radar agent
 * Uses getOrCreateAgent for idempotent setup
 */
async function setupRiskRadarAgent(apiKey: string): Promise<SetupResult> {
  const agentConfig: AgentManagementConfig = { apiKey };

  console.log("🚀 Setting up Risk Radar AI Agent...\n");

  // Create Risk Analysis Assistant Agent
  console.log("📝 Checking/creating Risk Analysis Assistant...");
  const result = await getOrCreateAgent(RISK_ASSISTANT_AGENT, agentConfig);

  if (result.created) {
    console.log(`✅ Risk Analysis Assistant created: ${result.agent.agent_id}`);
  } else {
    console.log(`✓  Risk Analysis Assistant already exists: ${result.agent.agent_id}`);
  }

  return {
    agentId: result.agent.agent_id,
    created: result.created,
  };
}

async function main() {
  const apiKey =
    process.env.LYZR_API_KEY || process.env.NEXT_PUBLIC_LYZR_API_KEY;

  if (!apiKey) {
    console.error("❌ Error: LYZR_API_KEY environment variable is required");
    console.log("\nUsage:");
    console.log("  LYZR_API_KEY=your_key bun run setup-agent");
    console.log("\nOr set it in .env.local:");
    console.log("  LYZR_API_KEY=your_key");
    process.exit(1);
  }

  try {
    const result = await setupRiskRadarAgent(apiKey);

    console.log("\n" + "=".repeat(60));
    console.log("✅ Setup complete!");
    console.log("=".repeat(60));

    console.log("\n📋 Agent ID:");
    console.log(`   Risk Analysis Assistant: ${result.agentId}`);

    console.log("\n🔧 Next steps:");
    console.log("1. Add this ID to your .env.local file:");
    console.log(`   NEXT_PUBLIC_LYZR_API_KEY=${apiKey}`);
    console.log(`   NEXT_PUBLIC_LYZR_AGENT_ID=${result.agentId}`);

    console.log("\n2. Update the agent registry (optional):");
    console.log(`   Edit packages/agents/src/registry.ts`);
    console.log(`   Update "risk-radar:assistant" id to: ${result.agentId}`);

    console.log("\n3. Restart your development server:");
    console.log("   bun run dev");

    console.log("\n4. Test the agent:");
    console.log("   Navigate to http://localhost:3005/assistant");
    console.log('   Try asking: "What are the key risk indicators I should monitor?"');

  } catch (error) {
    console.error("\n❌ Error setting up agent:", error);
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

main();
