/**
 * Central Agent Registry
 * Single source of truth for all Lyzr agents across Tasco apps
 */

import type {
  AgentRegistry,
  AgentConfig,
  KnowledgeBaseConfig,
  AppAgentConfig,
  AppId,
  EnvVarMapping,
} from "./types";

/**
 * All registered agents across all apps
 */
export const AGENTS: Record<string, AgentConfig> = {
  // ============================================
  // COMPLIANCE-QA AGENTS (4)
  // ============================================

  "compliance-qa:orchestrator": {
    key: "compliance-qa:orchestrator",
    id: "696108ed5e0239738a838cd8",
    name: "Compliance Super AI",
    role: "orchestrator",
    appId: "compliance-qa",
    model: "gpt-4o-mini",
    temperature: 0.3,
    systemPrompt: `You are the Compliance Super AI orchestrator for Tasco Group. Your role is to route user queries to the appropriate expert agent:

- For questions about Vietnamese LAWS, DECREES, CIRCULARS, or REGULATORY documents → Route to legal-expert
- For questions about INTERNAL POLICIES, CHARTERS, MEETING MINUTES, or CONTRACTS → Route to internal-expert

Always analyze the query first, then delegate to the appropriate expert. Synthesize their responses when needed.`,
    envVar: "NEXT_PUBLIC_LYZR_AGENT_ID",
    visibility: "public",
    connectedKBs: [],
    subAgents: ["compliance-qa:legal-expert", "compliance-qa:internal-expert"],
    status: "active",
    description: "Routes compliance queries to specialized expert agents",
    feature: "Compliance Q&A Orchestration",
  },

  "compliance-qa:legal-expert": {
    key: "compliance-qa:legal-expert",
    id: "69613776c57d451439d4c8f4",
    name: "Tasco Legal Framework Expert",
    role: "expert",
    appId: "compliance-qa",
    model: "gpt-4o-mini",
    temperature: 0.2,
    systemPrompt: `You are a Legal Framework Expert for Tasco Group, specializing in Vietnamese laws and regulations.

Your knowledge covers:
- Vietnamese laws and decrees
- Regulatory circulars
- Legal compliance requirements
- Government directives

Always cite specific document names, article numbers, and effective dates when answering.
Format citations as: [Document Name, Article X, effective YYYY-MM-DD]`,
    envVar: "NEXT_PUBLIC_LYZR_LEGAL_AGENT_ID",
    visibility: "public",
    connectedKBs: ["compliance-qa:legal-kb"],
    status: "active",
    description: "Answers questions about Vietnamese laws and regulations",
    feature: "Legal Document Q&A",
    ragConfig: {
      knowledgeBaseId: "69613775979041509ac8ee82",
      topK: 5,
      similarityThreshold: 0.5,
      includeMetadata: true,
    },
  },

  "compliance-qa:internal-expert": {
    key: "compliance-qa:internal-expert",
    id: "69613777c57d451439d4c8f5",
    name: "Tasco Internal Policy Expert",
    role: "expert",
    appId: "compliance-qa",
    model: "gpt-4o-mini",
    temperature: 0.3,
    systemPrompt: `You are an Internal Policy Expert for Tasco Group, specializing in internal governance documents.

Your knowledge covers:
- Company charters and bylaws
- Internal policies and procedures
- Meeting minutes and board resolutions
- Contracts and agreements

Always cite specific document names, sections, and approval dates when answering.
Be aware of entity-specific policies (different subsidiaries may have different rules).`,
    envVar: "NEXT_PUBLIC_LYZR_INTERNAL_AGENT_ID",
    visibility: "public",
    connectedKBs: ["compliance-qa:internal-kb"],
    status: "active",
    description: "Answers questions about Tasco internal policies",
    feature: "Internal Policy Q&A",
    ragConfig: {
      knowledgeBaseId: "6960a63fee18986913060bc0",
      topK: 5,
      similarityThreshold: 0.5,
      includeMetadata: true,
    },
  },

  "compliance-qa:validator": {
    key: "compliance-qa:validator",
    id: "696108f75e0239738a838cdf",
    name: "Compliance Validation Agent",
    role: "validator",
    appId: "compliance-qa",
    model: "gpt-4o-mini",
    temperature: 0.1,
    systemPrompt: `You are a Compliance Response Validator. Your job is to score the quality of compliance responses.

Evaluate responses on:
1. Accuracy (0-25): Are the cited documents and facts correct?
2. Completeness (0-25): Does it fully answer the question?
3. Clarity (0-25): Is it easy to understand?
4. Citations (0-25): Are proper citations included?

Return JSON: { "score": 0-100, "accuracy": 0-25, "completeness": 0-25, "clarity": 0-25, "citations": 0-25, "feedback": "..." }`,
    envVar: "NEXT_PUBLIC_LYZR_VALIDATION_AGENT_ID",
    visibility: "public",
    connectedKBs: [],
    status: "active",
    description: "Validates and scores compliance response quality",
    feature: "Response Validation",
    outputFormat: "json",
    jsonOutput: {
      enabled: true,
      schema: {
        type: "object",
        properties: {
          score: { type: "number", minimum: 0, maximum: 100 },
          accuracy: { type: "number", minimum: 0, maximum: 25 },
          completeness: { type: "number", minimum: 0, maximum: 25 },
          clarity: { type: "number", minimum: 0, maximum: 25 },
          citations: { type: "number", minimum: 0, maximum: 25 },
          feedback: { type: "string" },
        },
        required: ["score", "accuracy", "completeness", "clarity", "citations", "feedback"],
      },
    },
  },

  // ============================================
  // E-LEARNING AGENTS (6)
  // ============================================

  "e-learning:outline-generator": {
    key: "e-learning:outline-generator",
    id: "6960efc45e0239738a838056",
    name: "Course Outline Generator",
    role: "generator",
    appId: "e-learning",
    model: "gpt-4o-mini",
    temperature: 0.7,
    systemPrompt: `You are a Course Outline Generator for insurance training at Tasco Insurance.

Generate course outlines with:
- Clear, descriptive title
- Comprehensive description
- 3-5 modules covering the topic
- 2-4 lessons per module
- Quiz question count per module

Output JSON format:
{
  "title": "...",
  "description": "...",
  "level": "beginner|intermediate|advanced",
  "audience": "...",
  "estimatedMinutes": number,
  "modules": [
    {
      "title": "...",
      "lessons": ["Lesson 1", "Lesson 2"],
      "quizQuestions": 5
    }
  ]
}`,
    envVar: "LYZR_COURSE_OUTLINE_AGENT_ID",
    visibility: "private",
    connectedKBs: [],
    status: "active",
    description: "Generates course structure and outlines",
    feature: "Course Outline Generation",
    outputFormat: "json",
    jsonOutput: {
      enabled: true,
      schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          level: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
          audience: { type: "string" },
          estimatedMinutes: { type: "number" },
          modules: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                lessons: { type: "array", items: { type: "string" } },
                quizQuestions: { type: "number" },
              },
            },
          },
        },
        required: ["title", "description", "level", "modules"],
      },
    },
  },

  "e-learning:module-generator": {
    key: "e-learning:module-generator",
    id: "6960efcf5e0239738a838072",
    name: "Module Content Generator",
    role: "generator",
    appId: "e-learning",
    model: "gpt-4o-mini",
    temperature: 0.7,
    systemPrompt: `You are a Module Content Generator for insurance training courses.

Generate complete module content including:
- Detailed lesson content (600-900 words each)
- Quiz questions with 4 options and explanations

Use markdown formatting:
- ## for section headers
- **bold** for key terms
- Bullet points for lists
- > for tips and important notes

Output JSON format:
{
  "moduleIndex": number,
  "lessons": [{ "title": "...", "content": "..." }],
  "quiz": { "questions": [...] }
}`,
    envVar: "LYZR_MODULE_CONTENT_AGENT_ID",
    visibility: "private",
    connectedKBs: [],
    status: "active",
    description: "Generates complete module content with lessons and quizzes",
    feature: "Module Content Generation",
  },

  "e-learning:lesson-generator": {
    key: "e-learning:lesson-generator",
    id: "6960f136c57d451439d4b4a1",
    name: "Lesson Generator",
    role: "generator",
    appId: "e-learning",
    model: "gpt-4o-mini",
    temperature: 0.7,
    systemPrompt: `You are a Lesson Content Generator for insurance training.

Generate detailed lesson content (600-900 words) that:
- Explains concepts clearly for the target audience
- Uses practical examples from insurance industry
- Includes key takeaways
- Uses markdown formatting

Output JSON: { "title": "...", "content": "..." }`,
    envVar: "LYZR_LESSON_GENERATOR_AGENT_ID",
    visibility: "private",
    connectedKBs: [],
    status: "active",
    description: "Generates individual lesson content",
    feature: "Lesson Content Generation",
  },

  "e-learning:quiz-generator": {
    key: "e-learning:quiz-generator",
    id: "6960f1445e0239738a8383b9",
    name: "Quiz Generator",
    role: "generator",
    appId: "e-learning",
    model: "gpt-4o-mini",
    temperature: 0.6,
    systemPrompt: `You are a Quiz Question Generator for insurance training.

Generate quiz questions that:
- Test understanding of lesson content
- Have exactly 4 options (A, B, C, D)
- Include clear explanations for correct answers
- Vary in difficulty

Output JSON:
{
  "questions": [
    {
      "question": "...",
      "options": ["A...", "B...", "C...", "D..."],
      "correctAnswer": 0-3,
      "explanation": "..."
    }
  ]
}`,
    envVar: "LYZR_QUIZ_GENERATOR_AGENT_ID",
    visibility: "private",
    connectedKBs: [],
    status: "active",
    description: "Generates quiz questions for lessons",
    feature: "Quiz Generation",
  },

  "e-learning:chat-assistant": {
    key: "e-learning:chat-assistant",
    id: "6961ba6bd09b5523633454d5",
    name: "E-Learning Chat Assistant",
    role: "main",
    appId: "e-learning",
    model: "gpt-4o-mini",
    temperature: 0.5,
    systemPrompt: `You are the E-Learning Chat Assistant for Tasco Insurance training.

Help learners with:
- Understanding course content about insurance
- Answering questions on motor/health insurance, claims, underwriting, compliance
- Clarifying quiz questions
- Suggesting relevant courses based on interests

Be encouraging, supportive, and patient. Use simple language for complex concepts.
Context: Designed for Vietnamese insurance professionals at Tasco Insurance.`,
    envVar: "NEXT_PUBLIC_LYZR_AGENT_ID",
    visibility: "public",
    connectedKBs: [],
    status: "active",
    description: "Assists learners with course content and questions",
    feature: "Learner Chat Support",
  },

  "e-learning:validator": {
    key: "e-learning:validator",
    id: "6961ba6bd09b5523633454d6",
    name: "E-Learning Validation Agent",
    role: "validator",
    appId: "e-learning",
    model: "gpt-4o-mini",
    temperature: 0.1,
    systemPrompt: `You are an E-Learning Response Validator. Score chat responses on:

1. Accuracy (0-25): Is the insurance information correct?
2. Helpfulness (0-25): Does it actually help the learner?
3. Clarity (0-25): Is it easy to understand?
4. Encouragement (0-25): Is it motivating for learners?

Return JSON: { "score": 0-100, "accuracy": 0-25, "helpfulness": 0-25, "clarity": 0-25, "encouragement": 0-25, "feedback": "..." }`,
    envVar: "NEXT_PUBLIC_LYZR_VALIDATION_AGENT_ID",
    visibility: "public",
    connectedKBs: [],
    status: "active",
    description: "Validates learner chat response quality",
    feature: "Response Validation",
  },

  // ============================================
  // SALES-ORDER AGENTS (2)
  // ============================================

  "sales-order:extractor": {
    key: "sales-order:extractor",
    id: "69613126c57d451439d4c4e4",
    name: "Vietnamese Order Data Extractor",
    role: "expert",
    appId: "sales-order",
    model: "gpt-4o-mini",
    temperature: 0.2,
    systemPrompt: `You are a Vietnamese Order Data Extractor for Inochi sales orders.

Extract structured data from OCR text:
- Customer name and code
- Order date and delivery date
- Line items (product code, name, quantity, unit, price)
- Total amounts
- Notes and special instructions

Handle Vietnamese text correctly (diacritics, tone marks).
Provide confidence scores (0-100) for each extracted field.

Output JSON with confidence fields:
{
  "customerName": { "value": "...", "confidence": 0-100 },
  "items": [{ "productCode": { "value": "...", "confidence": 0-100 }, ... }],
  ...
}`,
    envVar: "EXTRACTION_AGENT_ID",
    visibility: "private",
    connectedKBs: [],
    status: "active",
    description: "Extracts structured data from Vietnamese sales order OCR",
    feature: "Order Data Extraction",
    outputFormat: "json",
    jsonOutput: {
      enabled: true,
      strict: true,
      schema: {
        type: "object",
        properties: {
          customerName: {
            type: "object",
            properties: { value: { type: "string" }, confidence: { type: "number" } },
          },
          customerCode: {
            type: "object",
            properties: { value: { type: "string" }, confidence: { type: "number" } },
          },
          orderDate: {
            type: "object",
            properties: { value: { type: "string" }, confidence: { type: "number" } },
          },
          deliveryDate: {
            type: "object",
            properties: { value: { type: "string" }, confidence: { type: "number" } },
          },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                productCode: { type: "object" },
                productName: { type: "object" },
                quantity: { type: "object" },
                unit: { type: "object" },
                unitPrice: { type: "object" },
                totalPrice: { type: "object" },
              },
            },
          },
          totalAmount: {
            type: "object",
            properties: { value: { type: "number" }, confidence: { type: "number" } },
          },
          notes: {
            type: "object",
            properties: { value: { type: "string" }, confidence: { type: "number" } },
          },
        },
        required: ["customerName", "items"],
      },
    },
  },

  "sales-order:validator": {
    key: "sales-order:validator",
    id: "69613126c57d451439d4c4e5",
    name: "Order Validation Specialist",
    role: "validator",
    appId: "sales-order",
    model: "gpt-4o-mini",
    temperature: 0.1,
    systemPrompt: `You are an Order Validation Specialist for Inochi.

Validate extracted order data for:
1. Data completeness (required fields present)
2. Format validity (dates, numbers, codes)
3. Business logic (quantities > 0, amounts match)
4. Consistency (totals match line items)
5. Vietnamese text correctness

Return validation report:
{
  "score": 0-100,
  "issues": [{ "field": "...", "severity": "error|warning|info", "message": "..." }],
  "recommendations": ["..."]
}`,
    envVar: "VALIDATION_AGENT_ID",
    visibility: "private",
    connectedKBs: [],
    status: "active",
    description: "Validates extracted order data for accuracy",
    feature: "Order Data Validation",
    outputFormat: "json",
    jsonOutput: {
      enabled: true,
      schema: {
        type: "object",
        properties: {
          score: { type: "number", minimum: 0, maximum: 100 },
          issues: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string" },
                severity: { type: "string", enum: ["error", "warning", "info"] },
                message: { type: "string" },
              },
              required: ["field", "severity", "message"],
            },
          },
          recommendations: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["score", "issues"],
      },
    },
  },

  // ============================================
  // CUSTOMER-LIFECYCLE AGENTS (Pending)
  // ============================================

  "customer-lifecycle:assistant": {
    key: "customer-lifecycle:assistant",
    id: "69625ab1d09b552363346dd5",
    name: "Customer Lifecycle Assistant",
    role: "main",
    appId: "customer-lifecycle",
    model: "gpt-4o-mini",
    temperature: 0.5,
    systemPrompt: `You are the Customer Lifecycle Assistant for Tasco Auto.

Help sales and service teams with:
- Lead prioritization and qualification
- Customer churn risk analysis
- Next best action recommendations
- Campaign effectiveness insights
- Customer satisfaction analysis

Provide actionable, data-driven recommendations.`,
    envVar: "NEXT_PUBLIC_LYZR_AGENT_ID",
    visibility: "public",
    connectedKBs: [],
    status: "active",
    description: "Assists with customer lifecycle management",
    feature: "Customer Insights Chat",
  },

  // ============================================
  // SALES-PRICING AGENTS (Pending)
  // ============================================

  "sales-pricing:assistant": {
    key: "sales-pricing:assistant",
    id: "69625ab2d09b552363346dd6",
    name: "Pricing Assistant",
    role: "main",
    appId: "sales-pricing",
    model: "gpt-4o-mini",
    temperature: 0.5,
    systemPrompt: `You are the Pricing Assistant for Tasco Insurance.

Help insurance agents with:
- Premium calculation guidance
- Risk assessment explanations
- Pricing rule clarifications
- Quote optimization suggestions
- Market rate comparisons

Be precise with numbers and clear about pricing factors.`,
    envVar: "NEXT_PUBLIC_LYZR_AGENT_ID",
    visibility: "public",
    connectedKBs: [],
    status: "active",
    description: "Assists with insurance pricing and quotes",
    feature: "Pricing Guidance Chat",
  },

  // ============================================
  // RISK-RADAR AGENTS (Pending)
  // ============================================

  "risk-radar:assistant": {
    key: "risk-radar:assistant",
    id: "69625ab2d09b552363346dd7",
    name: "Risk Analysis Assistant",
    role: "main",
    appId: "risk-radar",
    model: "gpt-4o-mini",
    temperature: 0.5,
    systemPrompt: `You are the Risk Analysis Assistant for Tasco Insurance.

Help risk managers with:
- Loss ratio trend analysis
- Claims pattern identification
- Profitability insights
- Risk alerts interpretation
- Product performance analysis

Provide clear, actionable insights with supporting data.`,
    envVar: "NEXT_PUBLIC_LYZR_AGENT_ID",
    visibility: "public",
    connectedKBs: [],
    status: "active",
    description: "Assists with risk and profitability analysis",
    feature: "Risk Analysis Chat",
  },

  // ============================================
  // DATA-SYNC AGENTS (Pending)
  // ============================================

  "data-sync:assistant": {
    key: "data-sync:assistant",
    id: "69625ab3d09b552363346dd8",
    name: "Data Sync Assistant",
    role: "main",
    appId: "data-sync",
    model: "gpt-4o-mini",
    temperature: 0.5,
    systemPrompt: `You are the Data Sync Assistant for Inochi.

Help operations teams with:
- Sync status inquiries
- Data discrepancy investigation
- Missing order troubleshooting
- System health monitoring
- Alert interpretation and resolution

Be specific about system names (Haravan, Shopee, Bravo, Fulfillment).`,
    envVar: "NEXT_PUBLIC_LYZR_AGENT_ID",
    visibility: "public",
    connectedKBs: [],
    status: "active",
    description: "Assists with data synchronization issues",
    feature: "Sync Support Chat",
  },
};

/**
 * All registered knowledge bases
 */
export const KNOWLEDGE_BASES: Record<string, KnowledgeBaseConfig> = {
  "compliance-qa:internal-kb": {
    key: "compliance-qa:internal-kb",
    id: "6960a63fee18986913060bc0",
    name: "compliance-qa-internal",
    appId: "compliance-qa",
    connectedAgents: ["compliance-qa:internal-expert"],
    documentCount: 8,
    documentFilter: {
      excludeCategories: ["_LEGAL"],
    },
    envVar: "LYZR_KB_ID",
    status: "active",
  },

  "compliance-qa:legal-kb": {
    key: "compliance-qa:legal-kb",
    id: "69613775979041509ac8ee82",
    name: "compliance-qa-legal",
    appId: "compliance-qa",
    connectedAgents: ["compliance-qa:legal-expert"],
    documentCount: 6,
    documentFilter: {
      includeCategories: ["_LEGAL"],
    },
    envVar: "LYZR_LEGAL_KB_ID",
    status: "active",
  },
};

/**
 * App configurations
 */
export const APP_CONFIGS: Record<AppId, AppAgentConfig> = {
  "compliance-qa": {
    appId: "compliance-qa",
    appName: "Compliance & Document Governance",
    description: "Multi-agent compliance Q&A with legal and internal policy experts",
    agents: [
      AGENTS["compliance-qa:orchestrator"],
      AGENTS["compliance-qa:legal-expert"],
      AGENTS["compliance-qa:internal-expert"],
      AGENTS["compliance-qa:validator"],
    ],
    knowledgeBases: [
      KNOWLEDGE_BASES["compliance-qa:internal-kb"],
      KNOWLEDGE_BASES["compliance-qa:legal-kb"],
    ],
    status: "active",
  },

  "e-learning": {
    appId: "e-learning",
    appName: "AI E-Learning Factory",
    description: "AI-powered course generation and learner support",
    agents: [
      AGENTS["e-learning:outline-generator"],
      AGENTS["e-learning:module-generator"],
      AGENTS["e-learning:lesson-generator"],
      AGENTS["e-learning:quiz-generator"],
      AGENTS["e-learning:chat-assistant"],
      AGENTS["e-learning:validator"],
    ],
    knowledgeBases: [],
    status: "active",
  },

  "sales-order": {
    appId: "sales-order",
    appName: "Order Data Entry Automation",
    description: "OCR extraction and validation for Vietnamese sales orders",
    agents: [
      AGENTS["sales-order:extractor"],
      AGENTS["sales-order:validator"],
    ],
    knowledgeBases: [],
    status: "active",
  },

  "customer-lifecycle": {
    appId: "customer-lifecycle",
    appName: "Customer Lifecycle Management",
    description: "AI-powered customer insights and recommendations",
    agents: [AGENTS["customer-lifecycle:assistant"]],
    knowledgeBases: [],
    status: "mock",
  },

  "sales-pricing": {
    appId: "sales-pricing",
    appName: "AI Sales & Pricing Cockpit",
    description: "Insurance pricing guidance and quote assistance",
    agents: [AGENTS["sales-pricing:assistant"]],
    knowledgeBases: [],
    status: "mock",
  },

  "risk-radar": {
    appId: "risk-radar",
    appName: "AI Risk & Profitability Radar",
    description: "Risk analysis and profitability insights",
    agents: [AGENTS["risk-radar:assistant"]],
    knowledgeBases: [],
    status: "mock",
  },

  "data-sync": {
    appId: "data-sync",
    appName: "Sales & Revenue Data Sync",
    description: "Data synchronization monitoring and support",
    agents: [AGENTS["data-sync:assistant"]],
    knowledgeBases: [],
    status: "mock",
  },

  "promotion-control": {
    appId: "promotion-control",
    appName: "Promotion Overlap Control",
    description: "Promotion conflict detection (no chat feature)",
    agents: [],
    knowledgeBases: [],
    status: "active",
  },
};

/**
 * Full registry export
 */
export const REGISTRY: AgentRegistry = {
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  apiUrl: "https://agent-prod.studio.lyzr.ai",
  apps: APP_CONFIGS,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get agent by key
 */
export function getAgent(key: string): AgentConfig | undefined {
  return AGENTS[key];
}

/**
 * Get all agents for an app
 */
export function getAgentsByApp(appId: AppId): AgentConfig[] {
  return Object.values(AGENTS).filter((agent) => agent.appId === appId);
}

/**
 * Get all active agents
 */
export function getActiveAgents(): AgentConfig[] {
  return Object.values(AGENTS).filter((agent) => agent.status === "active");
}

/**
 * Get all pending agents
 */
export function getPendingAgents(): AgentConfig[] {
  return Object.values(AGENTS).filter((agent) => agent.status === "pending");
}

/**
 * Get agent by environment variable name
 */
export function getAgentByEnvVar(envVar: string): AgentConfig | undefined {
  return Object.values(AGENTS).find((agent) => agent.envVar === envVar);
}

/**
 * Get knowledge base by key
 */
export function getKnowledgeBase(key: string): KnowledgeBaseConfig | undefined {
  return KNOWLEDGE_BASES[key];
}

/**
 * Get all knowledge bases for an app
 */
export function getKnowledgeBasesByApp(appId: AppId): KnowledgeBaseConfig[] {
  return Object.values(KNOWLEDGE_BASES).filter((kb) => kb.appId === appId);
}

/**
 * Get environment variable mappings for an app
 */
export function getEnvVarMappings(appId: AppId): EnvVarMapping[] {
  const agents = getAgentsByApp(appId);
  return agents.map((agent) => ({
    envVar: agent.envVar,
    agentKey: agent.key,
    agentId: agent.id,
    appId: agent.appId,
  }));
}

/**
 * Get all environment variable mappings
 */
export function getAllEnvVarMappings(): EnvVarMapping[] {
  return Object.values(AGENTS).map((agent) => ({
    envVar: agent.envVar,
    agentKey: agent.key,
    agentId: agent.id,
    appId: agent.appId,
  }));
}

/**
 * Check if an app has all agents configured
 */
export function isAppFullyConfigured(appId: AppId): boolean {
  const agents = getAgentsByApp(appId);
  return agents.length > 0 && agents.every((agent) => agent.id !== null);
}

/**
 * Get summary statistics
 */
export function getRegistryStats() {
  const allAgents = Object.values(AGENTS);
  const allKBs = Object.values(KNOWLEDGE_BASES);

  return {
    totalAgents: allAgents.length,
    activeAgents: allAgents.filter((a) => a.status === "active" && a.id).length,
    pendingAgents: allAgents.filter((a) => a.status === "pending" || !a.id).length,
    totalKnowledgeBases: allKBs.length,
    activeKnowledgeBases: allKBs.filter((kb) => kb.status === "active").length,
    appStats: Object.entries(APP_CONFIGS).map(([appId, config]) => ({
      appId,
      status: config.status,
      agentCount: config.agents.length,
      kbCount: config.knowledgeBases.length,
    })),
  };
}
