/**
 * Lyzr Agent Management API
 * Comprehensive agent CRUD operations for the monorepo
 *
 * @example
 * ```ts
 * import {
 *   getOrCreateAgent,
 *   connectKnowledgeBase,
 *   updateAgentInstructions,
 * } from "@tasco/api";
 *
 * // Create an agent
 * const { agent } = await getOrCreateAgent(
 *   { name: "My Agent", system_prompt: "You are a helpful assistant" },
 *   { apiKey: process.env.LYZR_API_KEY }
 * );
 *
 * // Connect a KB
 * await connectKnowledgeBase(agent.agent_id, "kb-id", { apiKey });
 *
 * // Update instructions
 * await updateAgentInstructions(agent.agent_id, "New instructions", { apiKey });
 * ```
 */

const LYZR_API_URL = "https://agent-prod.studio.lyzr.ai";

// ============================================================================
// Types
// ============================================================================

export interface AgentConfig {
  name: string;
  system_prompt: string;
  model?: string;
  temperature?: number;
  tools?: string[];
  llm_params?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
  };
}

export interface RAGFeature {
  type: "rag";
  config: {
    knowledge_base_id: string;
    top_k?: number;
  };
  priority?: number;
}

export interface AgentFeature {
  type: string;
  config: Record<string, unknown>;
  priority?: number;
}

export interface Agent {
  agent_id: string;
  _id?: string;
  name: string;
  system_prompt?: string;
  agent_instructions?: string;
  provider_id?: string;
  model?: string;
  temperature?: number;
  top_p?: number;
  llm_params?: {
    model: string;
    temperature: number;
  };
  features?: AgentFeature[];
  tools?: string[];
  store_messages?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AgentManagementConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface AgentUpdateOptions {
  /** Agent display name */
  name?: string;
  /** System prompt / instructions */
  instructions?: string;
  /** Model to use (e.g., "gpt-4o", "gpt-4o-mini") */
  model?: string;
  /** Temperature (0-1) */
  temperature?: number;
  /** Top-p sampling */
  top_p?: number;
  /** Features (RAG, etc.) */
  features?: AgentFeature[];
  /** Tools */
  tools?: string[];
}

/**
 * Create a new Lyzr agent
 */
export async function createAgent(
  config: AgentConfig,
  managementConfig: AgentManagementConfig
): Promise<Agent> {
  const { apiKey, baseUrl = LYZR_API_URL } = managementConfig;

  // Extract model and temperature from llm_params or fallback to legacy fields
  const model = config.llm_params?.model || config.model || "gpt-4-turbo-preview";
  const temperature = config.llm_params?.temperature ?? config.temperature ?? 0.3;

  const response = await fetch(`${baseUrl}/v3/agents/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      name: config.name,
      agent_instructions: config.system_prompt,
      provider_id: "openai",
      model: model,
      temperature: temperature,
      top_p: config.llm_params?.top_p ?? 0.9,
      features: [],
      tools: config.tools || [],
      store_messages: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `Failed to create agent: ${response.status} ${error}`
    );
  }

  return response.json();
}

/**
 * List all agents
 */
export async function listAgents(
  managementConfig: AgentManagementConfig
): Promise<Agent[]> {
  const { apiKey, baseUrl = LYZR_API_URL } = managementConfig;

  const response = await fetch(`${baseUrl}/v3/agents`, {
    method: "GET",
    headers: {
      "x-api-key": apiKey,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `Failed to list agents: ${response.status} ${error}`
    );
  }

  const data = await response.json();
  return data.agents || [];
}

/**
 * Get a specific agent by ID
 */
export async function getAgent(
  agentId: string,
  managementConfig: AgentManagementConfig
): Promise<Agent> {
  const { apiKey, baseUrl = LYZR_API_URL } = managementConfig;

  const response = await fetch(`${baseUrl}/v3/agents/${agentId}`, {
    method: "GET",
    headers: {
      "x-api-key": apiKey,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `Failed to get agent: ${response.status} ${error}`
    );
  }

  return response.json();
}

/**
 * Update an existing agent
 */
export async function updateAgent(
  agentId: string,
  config: Partial<AgentConfig>,
  managementConfig: AgentManagementConfig
): Promise<Agent> {
  const { apiKey, baseUrl = LYZR_API_URL } = managementConfig;

  const updateData: any = {};
  if (config.name) updateData.name = config.name;
  if (config.system_prompt) updateData.system_prompt = config.system_prompt;
  if (config.llm_params || config.model !== undefined || config.temperature !== undefined) {
    updateData.llm_params = config.llm_params || {
      ...(config.model && { model: config.model }),
      ...(config.temperature !== undefined && { temperature: config.temperature }),
    };
  }
  if (config.tools) updateData.tools = config.tools;

  const response = await fetch(`${baseUrl}/v3/agents/${agentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `Failed to update agent: ${response.status} ${error}`
    );
  }

  return response.json();
}

/**
 * Delete an agent
 */
export async function deleteAgent(
  agentId: string,
  managementConfig: AgentManagementConfig
): Promise<void> {
  const { apiKey, baseUrl = LYZR_API_URL } = managementConfig;

  const response = await fetch(`${baseUrl}/v3/agents/${agentId}`, {
    method: "DELETE",
    headers: {
      "x-api-key": apiKey,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `Failed to delete agent: ${response.status} ${error}`
    );
  }
}

/**
 * Find an agent by name
 */
export async function findAgentByName(
  name: string,
  managementConfig: AgentManagementConfig
): Promise<Agent | null> {
  const agents = await listAgents(managementConfig);
  return agents.find((a) => a.name === name) || null;
}

/**
 * Get or create an agent (idempotent)
 * Tries to create the agent directly. If listing is supported, can check first.
 * Falls back to direct creation if listing fails.
 */
export async function getOrCreateAgent(
  config: AgentConfig,
  managementConfig: AgentManagementConfig
): Promise<{ agent: Agent; created: boolean }> {
  try {
    // Try to check if agent exists (may not be supported by all APIs)
    const existing = await findAgentByName(config.name, managementConfig);

    if (existing) {
      return { agent: existing, created: false };
    }
  } catch (error) {
    // If listing fails (e.g., 405 Method Not Allowed), just try to create
    console.log("   Note: Agent listing not available, will attempt creation");
  }

  // Try to create new agent
  try {
    const newAgent = await createAgent(config, managementConfig);
    return { agent: newAgent, created: true };
  } catch (error: any) {
    // If creation fails with conflict, agent might already exist
    if (error.message?.includes("409") || error.message?.includes("conflict")) {
      // Try to get the existing agent by name
      try {
        const existing = await findAgentByName(config.name, managementConfig);
        if (existing) {
          return { agent: existing, created: false };
        }
      } catch (e) {
        // If we can't list agents, just throw the original error
      }
    }
    throw error;
  }
}

// ============================================================================
// Advanced Agent Management Utilities
// ============================================================================

/**
 * Update an agent with full payload (merges with existing config)
 *
 * The Lyzr API requires all fields on PUT, so this function fetches the
 * current agent config and merges your updates with it.
 *
 * @example
 * ```ts
 * await updateAgentFull(agentId, {
 *   instructions: "New system prompt",
 *   model: "gpt-4o",
 * }, { apiKey });
 * ```
 */
export async function updateAgentFull(
  agentId: string,
  options: AgentUpdateOptions,
  managementConfig: AgentManagementConfig
): Promise<Agent> {
  const { apiKey, baseUrl = LYZR_API_URL } = managementConfig;

  // Get current agent config first
  const currentAgent = await getAgent(agentId, managementConfig);

  // Build full payload by merging with existing config
  const fullPayload = {
    name: options.name ?? currentAgent.name,
    provider_id: currentAgent.provider_id || "openai",
    model: options.model ?? currentAgent.model ?? "gpt-4o-mini",
    top_p: options.top_p ?? currentAgent.top_p ?? 0.9,
    temperature: options.temperature ?? currentAgent.temperature ?? 0.3,
    agent_instructions:
      options.instructions ??
      currentAgent.agent_instructions ??
      currentAgent.system_prompt,
    features: options.features ?? currentAgent.features ?? [],
    tools: options.tools ?? currentAgent.tools ?? [],
    store_messages: currentAgent.store_messages ?? true,
  };

  const response = await fetch(`${baseUrl}/v3/agents/${agentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(fullPayload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update agent: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Connect a Knowledge Base to an agent via the features array
 *
 * @example
 * ```ts
 * await connectKnowledgeBase(agentId, kbId, { apiKey });
 * // Or with custom top_k
 * await connectKnowledgeBase(agentId, kbId, { apiKey }, { top_k: 10 });
 * ```
 */
export async function connectKnowledgeBase(
  agentId: string,
  knowledgeBaseId: string,
  managementConfig: AgentManagementConfig,
  options: { top_k?: number; priority?: number } = {}
): Promise<Agent> {
  const { top_k = 5, priority = 0 } = options;

  // Get current agent to preserve other features
  const currentAgent = await getAgent(agentId, managementConfig);
  const existingFeatures = currentAgent.features || [];

  // Remove any existing RAG features (replace with new KB)
  const nonRagFeatures = existingFeatures.filter((f) => f.type !== "rag");

  // Add the new RAG feature
  const newFeatures: AgentFeature[] = [
    ...nonRagFeatures,
    {
      type: "rag",
      config: {
        knowledge_base_id: knowledgeBaseId,
        top_k,
      },
      priority,
    },
  ];

  return updateAgentFull(
    agentId,
    { features: newFeatures },
    managementConfig
  );
}

/**
 * Disconnect a Knowledge Base from an agent
 *
 * @example
 * ```ts
 * await disconnectKnowledgeBase(agentId, { apiKey });
 * ```
 */
export async function disconnectKnowledgeBase(
  agentId: string,
  managementConfig: AgentManagementConfig
): Promise<Agent> {
  // Get current agent to preserve other features
  const currentAgent = await getAgent(agentId, managementConfig);
  const existingFeatures = currentAgent.features || [];

  // Remove all RAG features
  const nonRagFeatures = existingFeatures.filter((f) => f.type !== "rag");

  return updateAgentFull(
    agentId,
    { features: nonRagFeatures },
    managementConfig
  );
}

/**
 * Update only the agent's instructions (system prompt)
 *
 * @example
 * ```ts
 * await updateAgentInstructions(
 *   agentId,
 *   "You are a helpful assistant that specializes in...",
 *   { apiKey }
 * );
 * ```
 */
export async function updateAgentInstructions(
  agentId: string,
  instructions: string,
  managementConfig: AgentManagementConfig
): Promise<Agent> {
  return updateAgentFull(agentId, { instructions }, managementConfig);
}

/**
 * Get the Knowledge Base ID connected to an agent (if any)
 *
 * @example
 * ```ts
 * const kbId = await getAgentKnowledgeBase(agentId, { apiKey });
 * if (kbId) {
 *   console.log("Agent is connected to KB:", kbId);
 * }
 * ```
 */
export async function getAgentKnowledgeBase(
  agentId: string,
  managementConfig: AgentManagementConfig
): Promise<string | null> {
  const agent = await getAgent(agentId, managementConfig);
  const ragFeature = agent.features?.find((f) => f.type === "rag") as
    | RAGFeature
    | undefined;

  return ragFeature?.config?.knowledge_base_id ?? null;
}

/**
 * Update the model used by an agent
 *
 * @example
 * ```ts
 * await updateAgentModel(agentId, "gpt-4o", { apiKey });
 * ```
 */
export async function updateAgentModel(
  agentId: string,
  model: string,
  managementConfig: AgentManagementConfig
): Promise<Agent> {
  return updateAgentFull(agentId, { model }, managementConfig);
}

/**
 * Add a RAG feature to an agent without removing existing RAG features
 * Useful for multi-KB setups
 *
 * @example
 * ```ts
 * await addKnowledgeBase(agentId, kbId, { apiKey }, { priority: 1 });
 * ```
 */
export async function addKnowledgeBase(
  agentId: string,
  knowledgeBaseId: string,
  managementConfig: AgentManagementConfig,
  options: { top_k?: number; priority?: number } = {}
): Promise<Agent> {
  const { top_k = 5, priority = 0 } = options;

  // Get current agent to preserve existing features
  const currentAgent = await getAgent(agentId, managementConfig);
  const existingFeatures = currentAgent.features || [];

  // Check if this KB is already connected
  const alreadyConnected = existingFeatures.some(
    (f) =>
      f.type === "rag" &&
      (f as RAGFeature).config?.knowledge_base_id === knowledgeBaseId
  );

  if (alreadyConnected) {
    return currentAgent; // Already connected, no-op
  }

  // Add the new RAG feature
  const newFeatures: AgentFeature[] = [
    ...existingFeatures,
    {
      type: "rag",
      config: {
        knowledge_base_id: knowledgeBaseId,
        top_k,
      },
      priority,
    },
  ];

  return updateAgentFull(
    agentId,
    { features: newFeatures },
    managementConfig
  );
}

/**
 * Remove a specific Knowledge Base from an agent (keeps other KBs)
 *
 * @example
 * ```ts
 * await removeKnowledgeBase(agentId, kbId, { apiKey });
 * ```
 */
export async function removeKnowledgeBase(
  agentId: string,
  knowledgeBaseId: string,
  managementConfig: AgentManagementConfig
): Promise<Agent> {
  // Get current agent to preserve other features
  const currentAgent = await getAgent(agentId, managementConfig);
  const existingFeatures = currentAgent.features || [];

  // Remove only the specified KB
  const filteredFeatures = existingFeatures.filter(
    (f) =>
      f.type !== "rag" ||
      (f as RAGFeature).config?.knowledge_base_id !== knowledgeBaseId
  );

  return updateAgentFull(
    agentId,
    { features: filteredFeatures },
    managementConfig
  );
}

/**
 * Get all Knowledge Base IDs connected to an agent
 *
 * @example
 * ```ts
 * const kbIds = await getAgentKnowledgeBases(agentId, { apiKey });
 * console.log("Connected KBs:", kbIds);
 * ```
 */
export async function getAgentKnowledgeBases(
  agentId: string,
  managementConfig: AgentManagementConfig
): Promise<string[]> {
  const agent = await getAgent(agentId, managementConfig);
  const ragFeatures = (agent.features || []).filter(
    (f) => f.type === "rag"
  ) as RAGFeature[];

  return ragFeatures
    .map((f) => f.config?.knowledge_base_id)
    .filter((id): id is string => !!id);
}
