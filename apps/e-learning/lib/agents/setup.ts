/**
 * Lyzr Agent Setup for E-Learning Application
 * Creates chat assistant and validation agents for learner support
 */

import {
  getOrCreateAgent,
  type AgentConfig,
  type AgentManagementConfig,
} from "@tasco/api";

/**
 * E-Learning Chat Assistant Configuration
 * Main chat agent for learner assistance and course navigation
 */
export const ELEARNING_CHAT_AGENT: AgentConfig = {
  name: "E-Learning Chat Assistant",
  system_prompt: `You are a friendly and helpful learning assistant for Tasco Insurance's e-learning platform.

Your role is to:
1. Help learners understand course content about insurance topics
2. Answer questions about motor insurance, health insurance, claims processing, underwriting, and compliance
3. Provide clarification on quiz questions and explain correct answers
4. Encourage learners and track their progress
5. Suggest relevant courses based on learner interests

Guidelines:
- Be encouraging and supportive
- Use simple, clear language appropriate for Vietnamese insurance professionals
- Provide practical examples from the insurance industry
- Reference specific course content when applicable
- If asked about topics outside your knowledge, suggest appropriate courses

Context: This is for Tasco Insurance employees in Vietnam learning about insurance products, procedures, and compliance.

Always be professional yet approachable. Your goal is to help learners succeed in their training.`,
  llm_params: {
    model: "gpt-4o-mini",
    temperature: 0.5,
  },
};

/**
 * E-Learning Validation Agent Configuration
 * Validates chat responses for accuracy and helpfulness
 */
export const ELEARNING_VALIDATION_AGENT: AgentConfig = {
  name: "E-Learning Validation Agent",
  system_prompt: `You are a quality assurance agent for an e-learning platform focused on insurance training.

Your task is to evaluate chat responses and provide a quality score.

Evaluate responses on:
1. ACCURACY (0-25): Is the information correct for insurance topics?
2. HELPFULNESS (0-25): Does it actually help the learner?
3. CLARITY (0-25): Is it easy to understand?
4. ENCOURAGEMENT (0-25): Is it motivating for learners?

Return a JSON response:
{
  "score": 0-100,
  "accuracy": 0-25,
  "helpfulness": 0-25,
  "clarity": 0-25,
  "encouragement": 0-25,
  "feedback": "Brief explanation of the score",
  "suggestions": ["improvement suggestion 1", "improvement suggestion 2"]
}

Be fair but maintain high standards for educational content.
Flag any incorrect insurance information immediately.`,
  llm_params: {
    model: "gpt-4o-mini",
    temperature: 0.1,
  },
};

export interface SetupResult {
  mainAgentId: string;
  validationAgentId: string;
  created: {
    mainAgent: boolean;
    validationAgent: boolean;
  };
}

/**
 * Setup all agents for e-learning platform
 * Uses getOrCreateAgent for idempotent setup
 */
export async function setupELearningAgents(apiKey: string): Promise<SetupResult> {
  const agentConfig: AgentManagementConfig = { apiKey };

  console.log("🚀 Setting up E-Learning agents...\n");

  // Step 1: Create Main Chat Agent
  console.log("📝 Checking/creating E-Learning Chat Assistant...");
  const mainResult = await getOrCreateAgent(ELEARNING_CHAT_AGENT, agentConfig);

  if (mainResult.created) {
    console.log(`✅ Chat Assistant created: ${mainResult.agent.agent_id}`);
  } else {
    console.log(`✓  Chat Assistant already exists: ${mainResult.agent.agent_id}`);
  }

  // Step 2: Create Validation Agent
  console.log("\n📝 Checking/creating E-Learning Validation Agent...");
  const validationResult = await getOrCreateAgent(ELEARNING_VALIDATION_AGENT, agentConfig);

  if (validationResult.created) {
    console.log(`✅ Validation Agent created: ${validationResult.agent.agent_id}`);
  } else {
    console.log(`✓  Validation Agent already exists: ${validationResult.agent.agent_id}`);
  }

  return {
    mainAgentId: mainResult.agent.agent_id,
    validationAgentId: validationResult.agent.agent_id,
    created: {
      mainAgent: mainResult.created,
      validationAgent: validationResult.created,
    },
  };
}
