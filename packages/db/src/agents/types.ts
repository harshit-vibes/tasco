/**
 * Agent Types - Stores agent metadata and suggestions per app
 */

export interface AgentSuggestion {
  id: string;
  query: string;
  icon: string; // Icon name (e.g., "Calendar", "AlertTriangle", "Target")
  category: string;
  description?: string;
}

export interface Agent {
  // Key fields
  pk: string; // AGENT#{appId}
  sk: string; // {agentKey}

  // Identity
  appId: string; // e.g., "customer-lifecycle"
  agentKey: string; // e.g., "lead-expert"
  lyzrAgentId: string; // Lyzr API agent ID

  // Display
  name: string;
  shortName: string;
  description: string;
  icon: string; // Icon name for UI

  // Styling
  colorClass: string; // Tailwind color class
  bgClass: string; // Tailwind bg class

  // Knowledge Base
  kbId?: string; // Connected KB ID

  // Suggestions (try asking queries)
  suggestions: AgentSuggestion[];

  // Metadata
  isDefault?: boolean;
  isEnabled: boolean;
  order: number; // Display order

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentInput {
  appId: string;
  agentKey: string;
  lyzrAgentId: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  colorClass: string;
  bgClass: string;
  kbId?: string;
  suggestions: AgentSuggestion[];
  isDefault?: boolean;
  isEnabled?: boolean;
  order?: number;
}

export interface UpdateAgentInput {
  name?: string;
  shortName?: string;
  description?: string;
  icon?: string;
  colorClass?: string;
  bgClass?: string;
  kbId?: string;
  suggestions?: AgentSuggestion[];
  isEnabled?: boolean;
  order?: number;
}
