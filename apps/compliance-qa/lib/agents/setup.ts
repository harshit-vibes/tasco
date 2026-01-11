/**
 * Lyzr Agent Setup for Compliance QA Application
 * Multi-agent architecture with specialized experts
 */

import {
  getOrCreateAgent,
  type AgentConfig,
  type AgentManagementConfig,
} from "@tasco/api";
import { createRAGService } from "@tasco/rag";

/**
 * Legal Expert Agent Configuration
 * Handles questions about Vietnamese laws, decrees, and circulars
 */
export const LEGAL_EXPERT_AGENT: AgentConfig = {
  name: "Tasco Legal Framework Expert",
  system_prompt: `You are a legal compliance expert specializing in Vietnamese corporate law and regulations.

Your knowledge base contains:
- Enterprise laws (Luật Doanh nghiệp)
- Government decrees (Nghị định)
- Ministry circulars (Thông tư)
- Labor Code and employment regulations
- Regulatory guidelines

When answering:
1. Always cite specific laws, articles, and clauses
2. Explain legal implications clearly
3. Note any recent amendments or changes
4. Highlight compliance requirements
5. Use formal legal terminology appropriately
6. Provide Vietnamese terms in parentheses when relevant

Format citations as: [Law/Decree Name, Article X, Clause Y]

Example citation: [Enterprise Law 59/2020/QH14, Article 115, Clause 2]

IMPORTANT: You MUST cite from documents in your knowledge base. If you cannot find relevant information, clearly state that the specific regulation is not in your knowledge base rather than making assumptions.`,
  llm_params: {
    model: "gpt-4o-mini",
    temperature: 0.2,
  },
};

/**
 * Internal Policy Expert Agent Configuration
 * Handles questions about Tasco Group's internal policies and procedures
 */
export const INTERNAL_EXPERT_AGENT: AgentConfig = {
  name: "Tasco Internal Policy Expert",
  system_prompt: `You are an internal compliance analyst for Tasco Group.

Your knowledge base contains:
- Company policies and procedures
- Corporate charters and bylaws
- Meeting minutes and board resolutions
- Contracts and agreements
- Internal governance documents
- Entity-specific regulations

When answering:
1. Reference specific policy documents
2. Note which entity the policy applies to (Tasco Group, Tasco Auto, Tasco Insurance, etc.)
3. Explain approval workflows if relevant
4. Highlight any policy exceptions or special conditions
5. Connect to related internal documents when applicable

Format citations as: [Document Name, Section/Article, Entity]

Example citation: [Charter of Tasco Auto, Article 5, Tasco Auto]

IMPORTANT: Only cite from documents in your knowledge base. Be specific about which entity's policies you are referencing. If a policy only applies to certain subsidiaries, make that clear.`,
  llm_params: {
    model: "gpt-4o-mini",
    temperature: 0.3,
  },
};

export interface SetupResult {
  legalAgentId: string;
  internalAgentId: string;
  legalKbId: string;
  created: {
    legalAgent: boolean;
    internalAgent: boolean;
    legalKb: boolean;
  };
}

/**
 * Setup all agents and knowledge bases for multi-agent compliance system
 * Uses getOrCreateAgent for idempotent setup
 */
export async function setupComplianceAgents(apiKey: string): Promise<SetupResult> {
  const agentConfig: AgentManagementConfig = { apiKey };
  const ragService = createRAGService({ apiKey });

  console.log("🚀 Setting up Compliance QA multi-agent system...\n");

  // Step 1: Create Legal Knowledge Base
  console.log("📚 Checking/creating Legal Knowledge Base...");
  let legalKbId: string;
  let legalKbCreated = false;

  try {
    // Check if Legal KB already exists
    const existingKBs = await ragService.listKnowledgeBases();
    const existingLegalKB = existingKBs.find(
      (kb) => kb.name?.includes("compliance_qa_legal") || kb.collectionName?.includes("compliance_qa_legal")
    );

    if (existingLegalKB) {
      legalKbId = existingLegalKB.id;
      console.log(`✓  Legal KB already exists: ${legalKbId}`);
    } else {
      const newKB = await ragService.createKnowledgeBase({
        name: "compliance-qa-legal",
        description: "Vietnamese laws, decrees, circulars, and regulatory documents for Tasco Group compliance",
      });
      legalKbId = newKB.id || (newKB as any)._id;
      legalKbCreated = true;
      console.log(`✅ Legal KB created: ${legalKbId}`);
    }
  } catch (error) {
    console.error("⚠️  Warning: Could not create Legal KB:", error);
    console.log("   You may need to create it manually in Lyzr Studio");
    legalKbId = "PLACEHOLDER_LEGAL_KB_ID";
  }

  // Step 2: Create Legal Expert Agent
  console.log("\n📝 Checking/creating Legal Expert Agent...");
  const legalResult = await getOrCreateAgent(LEGAL_EXPERT_AGENT, agentConfig);

  if (legalResult.created) {
    console.log(`✅ Legal Expert Agent created: ${legalResult.agent.agent_id}`);
  } else {
    console.log(`✓  Legal Expert Agent already exists: ${legalResult.agent.agent_id}`);
  }

  // Step 3: Create Internal Policy Expert Agent
  console.log("\n📝 Checking/creating Internal Policy Expert Agent...");
  const internalResult = await getOrCreateAgent(INTERNAL_EXPERT_AGENT, agentConfig);

  if (internalResult.created) {
    console.log(`✅ Internal Expert Agent created: ${internalResult.agent.agent_id}`);
  } else {
    console.log(`✓  Internal Expert Agent already exists: ${internalResult.agent.agent_id}`);
  }

  return {
    legalAgentId: legalResult.agent.agent_id,
    internalAgentId: internalResult.agent.agent_id,
    legalKbId,
    created: {
      legalAgent: legalResult.created,
      internalAgent: internalResult.created,
      legalKb: legalKbCreated,
    },
  };
}
