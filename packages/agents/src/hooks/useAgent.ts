"use client";

/**
 * React hooks for accessing agent configurations
 *
 * @example
 * ```tsx
 * import { useAgent, useAgentId, useAppAgents } from "@tasco/agents/hooks";
 *
 * // Get full agent config
 * const { agent, isConfigured, error } = useAgent("compliance-qa:orchestrator");
 *
 * // Get just the agent ID (common use case)
 * const agentId = useAgentId("compliance-qa:orchestrator");
 *
 * // Get all agents for an app
 * const { agents, pendingAgents, isFullyConfigured } = useAppAgents("e-learning");
 * ```
 */

import { useMemo } from "react";
import type { AgentConfig, AppId } from "../types";
import {
  getAgent,
  getAgentsByApp,
  isAppFullyConfigured,
  getAgentByEnvVar,
} from "../registry";

/**
 * Hook result for useAgent
 */
export interface UseAgentResult {
  /** The agent configuration */
  agent: AgentConfig | undefined;
  /** Whether the agent has an ID configured */
  isConfigured: boolean;
  /** The agent's Lyzr API ID */
  agentId: string | null;
  /** Error message if agent not found */
  error: string | null;
}

/**
 * Get an agent configuration by key
 *
 * @param agentKey - The agent key (e.g., "compliance-qa:orchestrator")
 * @returns Agent configuration and status
 *
 * @example
 * ```tsx
 * function ChatComponent() {
 *   const { agent, isConfigured, agentId, error } = useAgent("compliance-qa:orchestrator");
 *
 *   if (error) {
 *     return <div>Agent not found: {error}</div>;
 *   }
 *
 *   if (!isConfigured) {
 *     return <div>Agent not configured. Please run setup script.</div>;
 *   }
 *
 *   return <Chat agentId={agentId} />;
 * }
 * ```
 */
export function useAgent(agentKey: string): UseAgentResult {
  return useMemo(() => {
    const agent = getAgent(agentKey);

    if (!agent) {
      return {
        agent: undefined,
        isConfigured: false,
        agentId: null,
        error: `Agent "${agentKey}" not found in registry`,
      };
    }

    return {
      agent,
      isConfigured: agent.id !== null && agent.status === "active",
      agentId: agent.id,
      error: null,
    };
  }, [agentKey]);
}

/**
 * Get just the agent ID for a given agent key
 *
 * @param agentKey - The agent key (e.g., "compliance-qa:orchestrator")
 * @returns The agent ID or null if not configured
 *
 * @example
 * ```tsx
 * function ChatComponent() {
 *   const agentId = useAgentId("e-learning:chat-assistant");
 *
 *   if (!agentId) {
 *     return <div>Agent not configured</div>;
 *   }
 *
 *   return <LyzrChat agentId={agentId} />;
 * }
 * ```
 */
export function useAgentId(agentKey: string): string | null {
  return useMemo(() => {
    const agent = getAgent(agentKey);
    return agent?.id ?? null;
  }, [agentKey]);
}

/**
 * Get agent ID by environment variable name
 *
 * @param envVar - The environment variable name
 * @returns The agent ID or null if not found
 *
 * @example
 * ```tsx
 * // Useful for gradual migration from env vars to registry
 * const agentId = useAgentIdByEnvVar("NEXT_PUBLIC_LYZR_AGENT_ID");
 * ```
 */
export function useAgentIdByEnvVar(envVar: string): string | null {
  return useMemo(() => {
    const agent = getAgentByEnvVar(envVar);
    return agent?.id ?? null;
  }, [envVar]);
}

/**
 * Hook result for useAppAgents
 */
export interface UseAppAgentsResult {
  /** All agents for the app */
  agents: AgentConfig[];
  /** Agents that are pending (no ID) */
  pendingAgents: AgentConfig[];
  /** Agents that are active (have ID) */
  activeAgents: AgentConfig[];
  /** Whether all agents have IDs configured */
  isFullyConfigured: boolean;
  /** Total number of agents */
  totalCount: number;
  /** Number of configured agents */
  configuredCount: number;
}

/**
 * Get all agents for an app
 *
 * @param appId - The app ID (e.g., "compliance-qa")
 * @returns All agents and their status for the app
 *
 * @example
 * ```tsx
 * function AppStatus() {
 *   const { agents, isFullyConfigured, configuredCount, totalCount } =
 *     useAppAgents("compliance-qa");
 *
 *   return (
 *     <div>
 *       <p>Agents: {configuredCount}/{totalCount} configured</p>
 *       {!isFullyConfigured && (
 *         <p className="text-yellow-500">Some agents need setup</p>
 *       )}
 *       <ul>
 *         {agents.map(agent => (
 *           <li key={agent.key}>
 *             {agent.name} - {agent.id ? '✅' : '⏳'}
 *           </li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAppAgents(appId: AppId): UseAppAgentsResult {
  return useMemo(() => {
    const agents = getAgentsByApp(appId);
    const activeAgents = agents.filter(
      (a) => a.id !== null && a.status === "active"
    );
    const pendingAgents = agents.filter(
      (a) => a.id === null || a.status === "pending"
    );

    return {
      agents,
      pendingAgents,
      activeAgents,
      isFullyConfigured: isAppFullyConfigured(appId),
      totalCount: agents.length,
      configuredCount: activeAgents.length,
    };
  }, [appId]);
}

/**
 * Get the main chat agent for an app
 *
 * @param appId - The app ID
 * @returns The main agent configuration or undefined
 *
 * @example
 * ```tsx
 * function AppChat() {
 *   const mainAgent = useMainAgent("e-learning");
 *
 *   if (!mainAgent?.id) {
 *     return <div>Chat agent not configured</div>;
 *   }
 *
 *   return <Chat agentId={mainAgent.id} />;
 * }
 * ```
 */
export function useMainAgent(appId: AppId): AgentConfig | undefined {
  return useMemo(() => {
    const agents = getAgentsByApp(appId);
    // Look for main or orchestrator role
    return (
      agents.find((a) => a.role === "main") ||
      agents.find((a) => a.role === "orchestrator")
    );
  }, [appId]);
}

/**
 * Get the validation agent for an app
 *
 * @param appId - The app ID
 * @returns The validator agent configuration or undefined
 *
 * @example
 * ```tsx
 * function ResponseWithValidation({ response }) {
 *   const validator = useValidatorAgent("compliance-qa");
 *
 *   if (!validator?.id) {
 *     // No validation available
 *     return <div>{response}</div>;
 *   }
 *
 *   return <ValidatedResponse agentId={validator.id} response={response} />;
 * }
 * ```
 */
export function useValidatorAgent(appId: AppId): AgentConfig | undefined {
  return useMemo(() => {
    const agents = getAgentsByApp(appId);
    return agents.find((a) => a.role === "validator");
  }, [appId]);
}

/**
 * Get expert agents for an app
 *
 * @param appId - The app ID
 * @returns Array of expert agent configurations
 *
 * @example
 * ```tsx
 * function ExpertSelector() {
 *   const experts = useExpertAgents("compliance-qa");
 *
 *   return (
 *     <select>
 *       {experts.map(expert => (
 *         <option key={expert.key} value={expert.id}>
 *           {expert.name}
 *         </option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export function useExpertAgents(appId: AppId): AgentConfig[] {
  return useMemo(() => {
    const agents = getAgentsByApp(appId);
    return agents.filter((a) => a.role === "expert");
  }, [appId]);
}

/**
 * Get all sub-agents for an orchestrator
 *
 * @param orchestratorKey - The orchestrator agent key
 * @returns Array of sub-agent configurations
 *
 * @example
 * ```tsx
 * function OrchestratorView() {
 *   const subAgents = useSubAgents("compliance-qa:orchestrator");
 *
 *   return (
 *     <div>
 *       <h2>Sub-agents:</h2>
 *       {subAgents.map(agent => (
 *         <AgentCard key={agent.key} agent={agent} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useSubAgents(orchestratorKey: string): AgentConfig[] {
  return useMemo(() => {
    const orchestrator = getAgent(orchestratorKey);
    if (!orchestrator?.subAgents) {
      return [];
    }

    return orchestrator.subAgents
      .map((key) => getAgent(key))
      .filter((a): a is AgentConfig => a !== undefined);
  }, [orchestratorKey]);
}
