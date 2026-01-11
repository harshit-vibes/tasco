/**
 * @tasco/agents
 * Centralized Lyzr agent management for Tasco apps
 *
 * This package provides a single source of truth for all agent configurations,
 * utilities for agent lookup, and tools for managing agent lifecycle.
 *
 * @example
 * ```typescript
 * import {
 *   getAgent,
 *   getAgentsByApp,
 *   AGENTS,
 *   REGISTRY,
 *   addAgent,
 *   updateAgent,
 * } from "@tasco/agents";
 *
 * // Get a specific agent
 * const agent = getAgent("compliance-qa:orchestrator");
 *
 * // Get all agents for an app
 * const elearningAgents = getAgentsByApp("e-learning");
 *
 * // Add a new agent (for future expansion)
 * addAgent({
 *   key: "my-app:my-agent",
 *   name: "My Agent",
 *   role: "main",
 *   appId: "my-app",
 *   // ...
 * });
 * ```
 */

// ============================================
// TYPE EXPORTS
// ============================================

export type {
  AppId,
  AgentRole,
  AgentStatus,
  ModelId,
  OutputFormat,
  JSONOutputConfig,
  RAGConfig,
  AgentConfig,
  KnowledgeBaseConfig,
  KnowledgeBaseStatus,
  VectorStoreProvider,
  EmbeddingModel,
  DocumentCategory,
  RetrievalConfig,
  AppAgentConfig,
  AgentRegistry,
  AgentCreateInput,
  AgentFeature,
  RAGFeatureConfig,
  AgentSetupResult,
  KBCreateInput,
  KBSetupResult,
  DocumentSyncInput,
  DocumentSyncResult,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  EnvVarMapping,
} from "./types";

// ============================================
// REGISTRY EXPORTS
// ============================================

export {
  // Data
  AGENTS,
  KNOWLEDGE_BASES,
  APP_CONFIGS,
  REGISTRY,
  // Getters
  getAgent,
  getAgentsByApp,
  getActiveAgents,
  getPendingAgents,
  getAgentByEnvVar,
  getKnowledgeBase,
  getKnowledgeBasesByApp,
  getEnvVarMappings,
  getAllEnvVarMappings,
  isAppFullyConfigured,
  getRegistryStats,
} from "./registry";

// ============================================
// KNOWLEDGE BASE REGISTRY EXPORTS
// ============================================

export {
  // Data
  KNOWLEDGE_BASES as KB_REGISTRY,
  DOCUMENT_CATEGORIES,
  // Getters
  getKB,
  getKBsByApp,
  getKBsByStatus,
  getPendingKBs,
  getActiveKBs,
  getKBsForAgent,
  getTargetKBForCategory,
  getDocumentCategory,
  getCategoriesForKB,
  getKBEnvVarMappings,
  generateKBEnvContent,
  getKBStats,
} from "./knowledge-bases";

// ============================================
// AGENT MODIFICATION UTILITIES
// ============================================

import type {
  AgentConfig,
  KnowledgeBaseConfig,
  AppId,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  JSONOutputConfig,
  RAGConfig,
  OutputFormat,
} from "./types";

import { AGENTS, KNOWLEDGE_BASES, APP_CONFIGS } from "./registry";
import { KNOWLEDGE_BASES as KB_FULL_REGISTRY } from "./knowledge-bases";

/**
 * Add a new agent to the registry (runtime only - doesn't persist)
 * Use this during development or for dynamic agent management
 *
 * @example
 * ```typescript
 * addAgent({
 *   key: "new-app:assistant",
 *   id: null,
 *   name: "New Assistant",
 *   role: "main",
 *   appId: "new-app",
 *   model: "gpt-4o-mini",
 *   temperature: 0.5,
 *   systemPrompt: "You are a helpful assistant.",
 *   envVar: "NEXT_PUBLIC_LYZR_AGENT_ID",
 *   visibility: "public",
 *   connectedKBs: [],
 *   status: "pending",
 *   description: "New assistant agent",
 *   feature: "Chat Support",
 * });
 * ```
 */
export function addAgent(agent: AgentConfig): void {
  if (AGENTS[agent.key]) {
    throw new Error(`Agent with key "${agent.key}" already exists`);
  }

  // Validate required fields
  const validation = validateAgentConfig(agent);
  if (!validation.valid) {
    const errors = validation.errors.map((e) => e.message).join(", ");
    throw new Error(`Invalid agent configuration: ${errors}`);
  }

  AGENTS[agent.key] = agent;

  // Update app config if app exists
  if (APP_CONFIGS[agent.appId]) {
    APP_CONFIGS[agent.appId].agents.push(agent);
  }
}

/**
 * Update an existing agent in the registry (runtime only - doesn't persist)
 *
 * @example
 * ```typescript
 * updateAgent("compliance-qa:orchestrator", {
 *   model: "gpt-4o",
 *   temperature: 0.5,
 * });
 * ```
 */
export function updateAgent(
  key: string,
  updates: Partial<Omit<AgentConfig, "key" | "appId">>
): AgentConfig {
  const existing = AGENTS[key];
  if (!existing) {
    throw new Error(`Agent with key "${key}" not found`);
  }

  const updated: AgentConfig = {
    ...existing,
    ...updates,
    key: existing.key, // Prevent key modification
    appId: existing.appId, // Prevent app modification
  };

  // Validate updated config
  const validation = validateAgentConfig(updated);
  if (!validation.valid) {
    const errors = validation.errors.map((e) => e.message).join(", ");
    throw new Error(`Invalid agent configuration: ${errors}`);
  }

  AGENTS[key] = updated;

  // Update in app config
  const appConfig = APP_CONFIGS[existing.appId];
  if (appConfig) {
    const index = appConfig.agents.findIndex((a) => a.key === key);
    if (index !== -1) {
      appConfig.agents[index] = updated;
    }
  }

  return updated;
}

/**
 * Set an agent's ID (after creating in Lyzr API)
 *
 * @example
 * ```typescript
 * setAgentId("customer-lifecycle:assistant", "new-lyzr-agent-id");
 * ```
 */
export function setAgentId(key: string, agentId: string): void {
  const agent = AGENTS[key];
  if (!agent) {
    throw new Error(`Agent with key "${key}" not found`);
  }

  updateAgent(key, {
    id: agentId,
    status: "active",
  });
}

/**
 * Mark an agent as deprecated
 */
export function deprecateAgent(key: string): void {
  const agent = AGENTS[key];
  if (!agent) {
    throw new Error(`Agent with key "${key}" not found`);
  }

  updateAgent(key, { status: "deprecated" });
}

/**
 * Disable an agent temporarily
 */
export function disableAgent(key: string): void {
  const agent = AGENTS[key];
  if (!agent) {
    throw new Error(`Agent with key "${key}" not found`);
  }

  updateAgent(key, { status: "disabled" });
}

/**
 * Enable a disabled agent
 */
export function enableAgent(key: string): void {
  const agent = AGENTS[key];
  if (!agent) {
    throw new Error(`Agent with key "${key}" not found`);
  }

  if (!agent.id) {
    updateAgent(key, { status: "pending" });
  } else {
    updateAgent(key, { status: "active" });
  }
}

// ============================================
// KNOWLEDGE BASE MODIFICATION UTILITIES
// ============================================

/**
 * Add a new knowledge base to the registry
 */
export function addKnowledgeBase(kb: KnowledgeBaseConfig): void {
  if (KNOWLEDGE_BASES[kb.key]) {
    throw new Error(`Knowledge base with key "${kb.key}" already exists`);
  }

  KNOWLEDGE_BASES[kb.key] = kb;

  // Update app config if app exists
  if (APP_CONFIGS[kb.appId]) {
    APP_CONFIGS[kb.appId].knowledgeBases.push(kb);
  }
}

/**
 * Update a knowledge base
 */
export function updateKnowledgeBase(
  key: string,
  updates: Partial<Omit<KnowledgeBaseConfig, "key" | "appId">>
): KnowledgeBaseConfig {
  const existing = KNOWLEDGE_BASES[key];
  if (!existing) {
    throw new Error(`Knowledge base with key "${key}" not found`);
  }

  const updated: KnowledgeBaseConfig = {
    ...existing,
    ...updates,
    key: existing.key,
    appId: existing.appId,
  };

  KNOWLEDGE_BASES[key] = updated;

  // Update in app config
  const appConfig = APP_CONFIGS[existing.appId];
  if (appConfig) {
    const index = appConfig.knowledgeBases.findIndex((kb) => kb.key === key);
    if (index !== -1) {
      appConfig.knowledgeBases[index] = updated;
    }
  }

  return updated;
}

/**
 * Connect a knowledge base to an agent
 */
export function connectAgentToKnowledgeBase(
  agentKey: string,
  kbKey: string
): void {
  const agent = AGENTS[agentKey];
  if (!agent) {
    throw new Error(`Agent with key "${agentKey}" not found`);
  }

  const kb = KNOWLEDGE_BASES[kbKey];
  if (!kb) {
    throw new Error(`Knowledge base with key "${kbKey}" not found`);
  }

  // Add KB to agent
  if (!agent.connectedKBs.includes(kbKey)) {
    agent.connectedKBs.push(kbKey);
  }

  // Add agent to KB
  if (!kb.connectedAgents.includes(agentKey)) {
    kb.connectedAgents.push(agentKey);
  }
}

/**
 * Disconnect a knowledge base from an agent
 */
export function disconnectAgentFromKnowledgeBase(
  agentKey: string,
  kbKey: string
): void {
  const agent = AGENTS[agentKey];
  if (agent) {
    agent.connectedKBs = agent.connectedKBs.filter((k) => k !== kbKey);
  }

  const kb = KNOWLEDGE_BASES[kbKey];
  if (kb) {
    kb.connectedAgents = kb.connectedAgents.filter((k) => k !== agentKey);
  }
}

// ============================================
// JSON OUTPUT CONFIGURATION UTILITIES
// ============================================

/**
 * Enable JSON output mode for an agent
 *
 * @example
 * ```typescript
 * // Enable basic JSON output
 * configureJSONOutput("sales-order:extractor", { enabled: true });
 *
 * // Enable with schema validation
 * configureJSONOutput("sales-order:extractor", {
 *   enabled: true,
 *   strict: true,
 *   schema: {
 *     type: "object",
 *     properties: {
 *       customerName: { type: "string" },
 *       items: { type: "array" }
 *     },
 *     required: ["customerName", "items"]
 *   }
 * });
 * ```
 */
export function configureJSONOutput(
  agentKey: string,
  config: JSONOutputConfig
): void {
  const agent = AGENTS[agentKey];
  if (!agent) {
    throw new Error(`Agent with key "${agentKey}" not found`);
  }

  agent.outputFormat = config.enabled ? "json" : "text";
  agent.jsonOutput = config;
}

/**
 * Disable JSON output mode for an agent
 */
export function disableJSONOutput(agentKey: string): void {
  const agent = AGENTS[agentKey];
  if (!agent) {
    throw new Error(`Agent with key "${agentKey}" not found`);
  }

  agent.outputFormat = "text";
  agent.jsonOutput = undefined;
}

/**
 * Set output format for an agent
 */
export function setOutputFormat(
  agentKey: string,
  format: OutputFormat
): void {
  const agent = AGENTS[agentKey];
  if (!agent) {
    throw new Error(`Agent with key "${agentKey}" not found`);
  }

  agent.outputFormat = format;
  if (format !== "json") {
    agent.jsonOutput = undefined;
  }
}

/**
 * Get agents configured for JSON output
 */
export function getJSONOutputAgents(): AgentConfig[] {
  return Object.values(AGENTS).filter(
    (agent) => agent.outputFormat === "json" && agent.jsonOutput?.enabled
  );
}

// ============================================
// RAG CONFIGURATION UTILITIES
// ============================================

/**
 * Configure RAG settings for an agent
 *
 * @example
 * ```typescript
 * // Basic RAG configuration
 * configureRAG("compliance-qa:legal-expert", {
 *   knowledgeBaseId: "6960a63fee18986913060bc0",
 *   topK: 5,
 * });
 *
 * // Advanced RAG configuration
 * configureRAG("compliance-qa:legal-expert", {
 *   knowledgeBaseId: "6960a63fee18986913060bc0",
 *   topK: 10,
 *   similarityThreshold: 0.7,
 *   includeMetadata: true,
 *   maxContextTokens: 4000,
 * });
 * ```
 */
export function configureRAG(agentKey: string, config: RAGConfig): void {
  const agent = AGENTS[agentKey];
  if (!agent) {
    throw new Error(`Agent with key "${agentKey}" not found`);
  }

  agent.ragConfig = config;

  // Also update the features array for API compatibility
  if (!agent.features) {
    agent.features = [];
  }

  // Remove existing RAG feature
  agent.features = agent.features.filter((f) => f.type !== "rag");

  // Add new RAG feature
  agent.features.push({
    type: "rag",
    config: {
      knowledge_base_id: config.knowledgeBaseId,
      top_k: config.topK ?? 5,
      similarity_threshold: config.similarityThreshold ?? 0.5,
    },
  });
}

/**
 * Remove RAG configuration from an agent
 */
export function removeRAGConfig(agentKey: string): void {
  const agent = AGENTS[agentKey];
  if (!agent) {
    throw new Error(`Agent with key "${agentKey}" not found`);
  }

  agent.ragConfig = undefined;
  if (agent.features) {
    agent.features = agent.features.filter((f) => f.type !== "rag");
  }
}

/**
 * Update RAG settings for an agent
 */
export function updateRAGConfig(
  agentKey: string,
  updates: Partial<RAGConfig>
): RAGConfig {
  const agent = AGENTS[agentKey];
  if (!agent) {
    throw new Error(`Agent with key "${agentKey}" not found`);
  }

  if (!agent.ragConfig) {
    throw new Error(`Agent "${agentKey}" does not have RAG configured`);
  }

  const updated: RAGConfig = {
    ...agent.ragConfig,
    ...updates,
  };

  configureRAG(agentKey, updated);
  return updated;
}

/**
 * Get all RAG-enabled agents
 */
export function getRAGEnabledAgents(): AgentConfig[] {
  return Object.values(AGENTS).filter(
    (agent) =>
      agent.ragConfig !== undefined ||
      agent.features?.some((f) => f.type === "rag")
  );
}

/**
 * Get RAG configuration for an agent
 */
export function getRAGConfig(agentKey: string): RAGConfig | undefined {
  const agent = AGENTS[agentKey];
  if (!agent) {
    throw new Error(`Agent with key "${agentKey}" not found`);
  }

  return agent.ragConfig;
}

/**
 * Build Lyzr API features array from agent config
 * Use this when calling the Lyzr API to create/update agents
 *
 * @example
 * ```typescript
 * const features = buildLyzrFeatures("compliance-qa:legal-expert");
 * await createAgent({
 *   name: agent.name,
 *   system_prompt: agent.systemPrompt,
 *   features: features,
 * });
 * ```
 */
export function buildLyzrFeatures(
  agentKey: string
): Array<{ type: string; config?: Record<string, unknown> }> {
  const agent = AGENTS[agentKey];
  if (!agent) {
    throw new Error(`Agent with key "${agentKey}" not found`);
  }

  const features: Array<{ type: string; config?: Record<string, unknown> }> =
    [];

  // Add RAG feature if configured
  if (agent.ragConfig) {
    features.push({
      type: "rag",
      config: {
        knowledge_base_id: agent.ragConfig.knowledgeBaseId,
        top_k: agent.ragConfig.topK ?? 5,
        similarity_threshold: agent.ragConfig.similarityThreshold ?? 0.5,
      },
    });
  }

  // Add any additional features
  if (agent.features) {
    for (const feature of agent.features) {
      if (feature.type !== "rag") {
        features.push(feature);
      }
    }
  }

  return features;
}

// ============================================
// VALIDATION UTILITIES
// ============================================

/**
 * Validate an agent configuration
 */
export function validateAgentConfig(agent: AgentConfig): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Required field validation
  if (!agent.key) {
    errors.push({
      agentKey: agent.key || "unknown",
      field: "key",
      message: "Agent key is required",
    });
  }

  if (!agent.name) {
    errors.push({
      agentKey: agent.key,
      field: "name",
      message: "Agent name is required",
    });
  }

  if (!agent.role) {
    errors.push({
      agentKey: agent.key,
      field: "role",
      message: "Agent role is required",
    });
  }

  if (!agent.appId) {
    errors.push({
      agentKey: agent.key,
      field: "appId",
      message: "Agent appId is required",
    });
  }

  if (!agent.model) {
    errors.push({
      agentKey: agent.key,
      field: "model",
      message: "Agent model is required",
    });
  }

  if (!agent.systemPrompt) {
    errors.push({
      agentKey: agent.key,
      field: "systemPrompt",
      message: "Agent system prompt is required",
    });
  }

  if (!agent.envVar) {
    errors.push({
      agentKey: agent.key,
      field: "envVar",
      message: "Agent environment variable name is required",
    });
  }

  // Key format validation
  if (agent.key && !agent.key.includes(":")) {
    errors.push({
      agentKey: agent.key,
      field: "key",
      message: "Agent key must be in format 'appId:agentName'",
    });
  }

  // Temperature validation
  if (agent.temperature !== undefined) {
    if (agent.temperature < 0 || agent.temperature > 1) {
      errors.push({
        agentKey: agent.key,
        field: "temperature",
        message: "Temperature must be between 0 and 1",
      });
    }
  }

  // Warnings for best practices
  if (agent.status === "active" && !agent.id) {
    warnings.push({
      agentKey: agent.key,
      field: "id",
      message: "Agent is marked active but has no ID",
    });
  }

  if (agent.role === "expert" && agent.connectedKBs.length === 0) {
    warnings.push({
      agentKey: agent.key,
      field: "connectedKBs",
      message: "Expert agent has no connected knowledge bases",
    });
  }

  if (agent.systemPrompt && agent.systemPrompt.length < 50) {
    warnings.push({
      agentKey: agent.key,
      field: "systemPrompt",
      message: "System prompt is very short, consider adding more detail",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate entire registry
 */
export function validateRegistry(): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Validate all agents
  for (const agent of Object.values(AGENTS)) {
    const result = validateAgentConfig(agent);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  // Check for duplicate environment variables
  const envVars = new Map<string, string[]>();
  for (const agent of Object.values(AGENTS)) {
    const existing = envVars.get(agent.envVar) || [];
    existing.push(agent.key);
    envVars.set(agent.envVar, existing);
  }

  for (const [envVar, agentKeys] of envVars) {
    // Same env var in different apps is OK, same app is not
    const appIds = agentKeys.map((key) => AGENTS[key].appId);
    const uniqueApps = new Set(appIds);
    if (uniqueApps.size !== agentKeys.length) {
      errors.push({
        agentKey: agentKeys.join(", "),
        field: "envVar",
        message: `Duplicate environment variable "${envVar}" within same app`,
      });
    }
  }

  // Check orphaned knowledge bases
  for (const kb of Object.values(KNOWLEDGE_BASES)) {
    if (kb.connectedAgents.length === 0) {
      warnings.push({
        agentKey: kb.key,
        field: "connectedAgents",
        message: "Knowledge base has no connected agents",
      });
    }

    // Verify connected agents exist
    for (const agentKey of kb.connectedAgents) {
      if (!AGENTS[agentKey]) {
        errors.push({
          agentKey: kb.key,
          field: "connectedAgents",
          message: `Connected agent "${agentKey}" does not exist`,
        });
      }
    }
  }

  // Verify agent KB references
  for (const agent of Object.values(AGENTS)) {
    for (const kbKey of agent.connectedKBs) {
      if (!KNOWLEDGE_BASES[kbKey]) {
        errors.push({
          agentKey: agent.key,
          field: "connectedKBs",
          message: `Connected knowledge base "${kbKey}" does not exist`,
        });
      }
    }
  }

  // Verify sub-agents exist
  for (const agent of Object.values(AGENTS)) {
    if (agent.subAgents) {
      for (const subKey of agent.subAgents) {
        if (!AGENTS[subKey]) {
          errors.push({
            agentKey: agent.key,
            field: "subAgents",
            message: `Sub-agent "${subKey}" does not exist`,
          });
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================
// SERIALIZATION UTILITIES
// ============================================

/**
 * Export registry to JSON (for persistence or sync)
 */
export function exportRegistryToJSON(): string {
  return JSON.stringify(
    {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      agents: AGENTS,
      knowledgeBases: KNOWLEDGE_BASES,
      apps: APP_CONFIGS,
    },
    null,
    2
  );
}

/**
 * Generate .env file content for an app
 */
export function generateEnvFile(appId: AppId): string {
  const agents = Object.values(AGENTS).filter((a) => a.appId === appId);
  const kbs = Object.values(KNOWLEDGE_BASES).filter((kb) => kb.appId === appId);

  const lines: string[] = [
    `# Generated by @tasco/agents for ${appId}`,
    `# ${new Date().toISOString()}`,
    "",
    "# Lyzr API",
    "LYZR_API_KEY=",
    "NEXT_PUBLIC_LYZR_API_KEY=",
    "",
    "# Agent IDs",
  ];

  for (const agent of agents) {
    const value = agent.id || "<TO_BE_CREATED>";
    lines.push(`${agent.envVar}=${value}`);
  }

  if (kbs.length > 0) {
    lines.push("");
    lines.push("# Knowledge Base IDs");
    for (const kb of kbs) {
      const value = kb.id || "<TO_BE_CREATED>";
      lines.push(`${kb.envVar}=${value}`);
    }
  }

  return lines.join("\n");
}

/**
 * Generate TypeScript type declarations for an app's agents
 */
export function generateTypeDeclarations(appId: AppId): string {
  const agents = Object.values(AGENTS).filter((a) => a.appId === appId);

  const lines: string[] = [
    `// Generated by @tasco/agents for ${appId}`,
    `// ${new Date().toISOString()}`,
    "",
    `export type ${toPascalCase(appId)}AgentKey =`,
  ];

  for (let i = 0; i < agents.length; i++) {
    const isLast = i === agents.length - 1;
    lines.push(`  | "${agents[i].key}"${isLast ? ";" : ""}`);
  }

  return lines.join("\n");
}

function toPascalCase(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}
