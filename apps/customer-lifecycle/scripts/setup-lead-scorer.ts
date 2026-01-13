#!/usr/bin/env node
/**
 * Setup script for Lead Scoring Agent
 *
 * Creates a dedicated AI agent optimized for analyzing leads and outputting
 * structured JSON scores with factor breakdown.
 *
 * Run: bun run scripts/setup-lead-scorer.ts
 * Or:  LYZR_API_KEY=xxx bun run scripts/setup-lead-scorer.ts
 */

import {
  getOrCreateAgent,
  type AgentConfig,
  type AgentManagementConfig,
} from "@tasco/api";
import * as fs from "fs";
import * as path from "path";

// Path to central registry (TypeScript)
const REGISTRY_TS_PATH = path.join(
  __dirname,
  "../../../../packages/agents/src/registry.ts"
);

/**
 * Lead Scoring Agent Configuration
 * Analyzes lead data and outputs structured JSON scores
 */
const LEAD_SCORER_AGENT: AgentConfig = {
  name: "Lead Scoring Agent",
  system_prompt: `You are a Lead Scoring AI for Tasco Auto's CRM system.

Your task is to analyze lead data and output a structured JSON score.

SCORING CRITERIA (0-100 scale for each):
1. **Budget Fit** (budgetScore): How well the lead's budget matches vehicle offerings
   - High (80-100): Budget matches premium/mid-tier vehicles (>500M VND)
   - Medium (50-79): Budget matches entry-level vehicles (300-500M VND)
   - Low (0-49): Budget below entry level or not specified

2. **Timeline Urgency** (timelineScore): How soon the lead intends to purchase
   - High (80-100): Within 1 month or "immediate"
   - Medium (50-79): Within 1-3 months
   - Low (0-49): 3+ months or "just browsing"

3. **Brand Interest Match** (brandScore): Alignment with available brands
   - Mercedes-Benz, Kia, Mazda, Carpla certified pre-owned
   - High (80-100): Strong interest in available brands
   - Medium (50-79): General interest, no specific brand
   - Low (0-49): Interest in brands we don't carry

4. **Engagement Signals** (engagementScore): Activity level and responsiveness
   - High (80-100): Multiple contacts, showroom visits, test drives
   - Medium (50-79): Responded to follow-up, single contact
   - Low (0-49): No response, single inquiry only

OUTPUT FORMAT - Always respond with valid JSON only, no markdown:
{
  "overallScore": <0-100 weighted average>,
  "factors": {
    "budgetScore": <0-100>,
    "timelineScore": <0-100>,
    "brandScore": <0-100>,
    "engagementScore": <0-100>
  },
  "recommendation": "<Hot|Warm|Cold>",
  "insights": "<1-2 sentence actionable analysis>"
}

Weights: Budget 30%, Timeline 25%, Brand 25%, Engagement 20%

Recommendation thresholds:
- Hot (75-100): High priority, assign to senior sales rep
- Warm (50-74): Medium priority, continue nurturing
- Cold (0-49): Low priority, add to drip campaign`,
  llm_params: {
    model: "gpt-4o",
    temperature: 0.3,
  },
};

async function updateRegistryWithAgentId(agentId: string) {
  try {
    const registryContent = fs.readFileSync(REGISTRY_TS_PATH, "utf-8");

    // Update the lead-scorer id from "PENDING" to actual ID
    const updatedContent = registryContent.replace(
      /"customer-lifecycle:lead-scorer": \{[\s\S]*?id: "PENDING"/,
      `"customer-lifecycle:lead-scorer": {\n    key: "customer-lifecycle:lead-scorer",\n    id: "${agentId}"`
    );

    // Also update status from pending to active
    const finalContent = updatedContent.replace(
      /("customer-lifecycle:lead-scorer"[\s\S]*?status: )"pending"/,
      `$1"active"`
    );

    if (finalContent !== registryContent) {
      fs.writeFileSync(REGISTRY_TS_PATH, finalContent);
      console.log("\n📋 Updated packages/agents/src/registry.ts with agent ID");
      console.log(`   - ID updated to: ${agentId}`);
      console.log(`   - Status updated to: active`);
    } else {
      console.log("\n⚠️  Registry already has this agent ID or format changed");
    }
  } catch (error) {
    console.log("\n⚠️  Could not update registry:", error);
    console.log("   Please update packages/agents/src/registry.ts manually:");
    console.log(`   - Set id: "${agentId}"`);
    console.log(`   - Set status: "active"`);
  }
}

async function main() {
  const apiKey =
    process.env.LYZR_API_KEY || process.env.NEXT_PUBLIC_LYZR_API_KEY;

  if (!apiKey) {
    console.error("❌ Error: LYZR_API_KEY environment variable is required");
    console.log("\nUsage:");
    console.log("  LYZR_API_KEY=your_key bun run scripts/setup-lead-scorer.ts");
    console.log("\nOr set it in .env.local:");
    console.log("  LYZR_API_KEY=your_key");
    process.exit(1);
  }

  const agentConfig: AgentManagementConfig = { apiKey };

  console.log("🚀 Setting up Lead Scoring Agent...\n");

  try {
    // Create Lead Scoring Agent
    console.log("📝 Checking/creating Lead Scoring Agent...");
    const result = await getOrCreateAgent(LEAD_SCORER_AGENT, agentConfig);

    if (result.created) {
      console.log(`✅ Lead Scoring Agent created: ${result.agent.agent_id}`);
    } else {
      console.log(
        `✓  Lead Scoring Agent already exists: ${result.agent.agent_id}`
      );
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ Lead Scoring Agent setup complete!");
    console.log("=".repeat(60));

    console.log("\n📋 Agent ID:");
    console.log(`   Lead Scoring Agent: ${result.agent.agent_id}`);

    // Update registry with actual agent ID
    await updateRegistryWithAgentId(result.agent.agent_id);

    console.log("\n🔧 Optional: Add to .env.local:");
    console.log(`   LYZR_LEAD_SCORER_AGENT_ID=${result.agent.agent_id}`);

    console.log("\n🎉 Lead scoring is ready to use!");
    console.log('   Open a lead detail and click "Analyze with AI"');
  } catch (error) {
    console.error("\n❌ Error setting up agent:", error);
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

main();
