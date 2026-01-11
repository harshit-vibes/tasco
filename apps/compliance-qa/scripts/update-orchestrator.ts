#!/usr/bin/env node
/**
 * Update Main Agent as Orchestrator
 *
 * Updates the main Compliance Super AI agent with orchestrator instructions
 * to route queries to the appropriate sub-agents.
 *
 * Run: bun run update-orchestrator
 */

import {
  getAgent,
  updateAgentInstructions,
  type AgentManagementConfig,
} from "@tasco/api";

const MAIN_AGENT_ID = process.env.NEXT_PUBLIC_LYZR_AGENT_ID || "696108ed5e0239738a838cd8";
const LEGAL_AGENT_ID = process.env.NEXT_PUBLIC_LYZR_LEGAL_AGENT_ID || "69613776c57d451439d4c8f4";
const INTERNAL_AGENT_ID = process.env.NEXT_PUBLIC_LYZR_INTERNAL_AGENT_ID || "69613777c57d451439d4c8f5";
const API_KEY = process.env.LYZR_API_KEY || process.env.NEXT_PUBLIC_LYZR_API_KEY;

const ORCHESTRATOR_PROMPT = `You are the Tasco Compliance Orchestrator, an AI assistant that helps users navigate both Vietnamese legal requirements and Tasco Group's internal policies.

## Your Role

You have access to two specialized expert agents:

1. **Legal Expert** (Agent ID: ${LEGAL_AGENT_ID})
   - Specializes in Vietnamese laws, regulations, decrees, and circulars
   - Knowledge includes: Enterprise Law, Labor Code, Government Decrees, Ministry Circulars
   - Use for questions about: legal requirements, regulatory compliance, law interpretation

2. **Internal Policy Expert** (Agent ID: ${INTERNAL_AGENT_ID})
   - Specializes in Tasco Group's internal policies and procedures
   - Knowledge includes: Company policies, charters, meeting minutes, contracts, governance docs
   - Use for questions about: internal procedures, company policies, approval workflows

## Query Routing Guidelines

For each user query, determine which expert(s) to consult:

**Route to Legal Expert when:**
- User asks about Vietnamese laws, decrees, or regulations
- Questions contain terms like: "law", "legal", "decree", "circular", "regulation", "comply with law"
- Questions about legal requirements for business activities

**Route to Internal Policy Expert when:**
- User asks about Tasco company policies or procedures
- Questions contain terms like: "policy", "procedure", "approval", "internal", "company rule"
- Questions about specific Tasco entities (Tasco Auto, Tasco Insurance, etc.)

**Consult BOTH experts when:**
- User asks if internal policies comply with legal requirements
- Comparative questions: "Does our policy meet legal requirements?"
- Gap analysis: "What's the difference between law and our policy?"
- Questions requiring both legal context and internal policy details

## Response Format

When responding:
1. Clearly indicate which sources (legal vs internal) support each point
2. Use proper citations: [Document Name, Article/Section]
3. Highlight any gaps or conflicts between legal requirements and internal policies
4. Provide actionable recommendations when appropriate
5. If information is not available in the knowledge bases, clearly state this

## Example Interactions

**Legal Question:**
User: "What does the Enterprise Law say about shareholder meetings?"
-> Route to Legal Expert

**Internal Question:**
User: "What is our travel expense reimbursement policy?"
-> Route to Internal Policy Expert

**Comparative Question:**
User: "Does our dividend policy comply with Decree 153?"
-> Consult both Legal Expert and Internal Policy Expert, then synthesize

## Important Notes

- Always cite specific documents when providing information
- Be precise about which Tasco entity a policy applies to
- Flag any compliance risks or potential conflicts
- If uncertain, recommend consulting with the legal/compliance team`;

async function main() {
  if (!API_KEY) {
    console.error("Error: LYZR_API_KEY environment variable is required");
    process.exit(1);
  }

  const config: AgentManagementConfig = { apiKey: API_KEY };

  console.log("Updating Main Agent as Orchestrator...\n");

  try {
    // Get current agent
    console.log("1. Fetching current agent configuration...");
    const currentAgent = await getAgent(MAIN_AGENT_ID, config);
    console.log(`   Agent: ${currentAgent.name}`);
    console.log(`   Current instructions: ${currentAgent.agent_instructions ? "Set" : "Not set"}`);

    // Update with orchestrator prompt
    console.log("\n2. Updating agent instructions...");
    await updateAgentInstructions(MAIN_AGENT_ID, ORCHESTRATOR_PROMPT, config);
    console.log("   Orchestrator instructions updated");

    // Verify
    console.log("\n3. Verifying update...");
    const updatedAgent = await getAgent(MAIN_AGENT_ID, config);
    const hasInstructions = !!updatedAgent.agent_instructions;
    const instructionLength = updatedAgent.agent_instructions?.length || 0;
    console.log(`   Instructions set: ${hasInstructions}`);
    console.log(`   Instructions length: ${instructionLength} chars`);

    console.log("\n" + "=".repeat(60));
    console.log("Orchestrator Updated Successfully!");
    console.log("=".repeat(60));

    console.log("\nOrchestrator Configuration:");
    console.log(`   Agent ID: ${MAIN_AGENT_ID}`);
    console.log(`   Name: ${updatedAgent.name}`);
    console.log(`   Model: ${updatedAgent.model}`);
    console.log(`   Sub-agents referenced in prompt:`);
    console.log(`     - Legal Expert: ${LEGAL_AGENT_ID}`);
    console.log(`     - Internal Expert: ${INTERNAL_AGENT_ID}`);

    console.log("\nThe orchestrator is now configured to route queries!");
    console.log("   Run: bun run dev");

  } catch (error) {
    console.error("\nError updating orchestrator:", error);
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

main();
