"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
} from "react";
import type { LucideIcon } from "lucide-react";
import {
  Sparkles,
  Target,
  Users,
  Car,
  Megaphone,
  Calendar,
  AlertTriangle,
  TrendingUp,
  User,
  PieChart,
  Clock,
  Package,
  Lock,
  DollarSign,
  Star,
  Mail,
  BarChart3,
} from "@tasco/ui/icons";
import type { Agent as DbAgent, AgentSuggestion as DbSuggestion } from "@tasco/db";

// Icon mapping from string names to actual icons
const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  Target,
  Users,
  Car,
  Megaphone,
  Calendar,
  AlertTriangle,
  TrendingUp,
  User,
  PieChart,
  Clock,
  Package,
  Lock,
  DollarSign,
  Star,
  Mail,
  BarChart3,
};

/**
 * Get icon component from string name
 */
function getIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] || Sparkles;
}

/**
 * Agent definition for the multi-agent system (UI representation)
 */
export interface AgentDefinition {
  key: string;
  name: string;
  shortName: string;
  description: string;
  role: "main" | "expert";
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  lyzrAgentId: string;
  kbId?: string;
  suggestions: AgentSuggestion[];
}

/**
 * Suggestion for an agent
 */
export interface AgentSuggestion {
  id: string;
  query: string;
  icon: LucideIcon;
  iconName: string;
  category: string;
  agentKey: string;
}

/**
 * Convert DB agent to UI agent definition
 */
function dbAgentToDefinition(dbAgent: DbAgent): AgentDefinition {
  return {
    key: `customer-lifecycle:${dbAgent.agentKey}`,
    name: dbAgent.name,
    shortName: dbAgent.shortName,
    description: dbAgent.description,
    role: dbAgent.isDefault ? "main" : "expert",
    icon: getIcon(dbAgent.icon),
    colorClass: dbAgent.colorClass,
    bgClass: dbAgent.bgClass,
    lyzrAgentId: dbAgent.lyzrAgentId,
    kbId: dbAgent.kbId,
    suggestions: dbAgent.suggestions.map((s) => ({
      id: s.id,
      query: s.query,
      icon: getIcon(s.icon),
      iconName: s.icon,
      category: s.category,
      agentKey: dbAgent.agentKey,
    })),
  };
}

// Default fallback agent (used while loading)
const DEFAULT_AGENT: AgentDefinition = {
  key: "customer-lifecycle:assistant",
  name: "General Assistant",
  shortName: "General",
  description: "All-purpose queries about customers, leads, campaigns, and inventory",
  role: "main",
  icon: Sparkles,
  colorClass: "text-violet-600",
  bgClass: "bg-violet-100",
  lyzrAgentId: "",
  suggestions: [],
};

/**
 * Multi-agent context type
 */
interface MultiAgentContextType {
  /** Currently selected agent */
  selectedAgent: AgentDefinition;
  /** Select a different agent */
  selectAgent: (agent: AgentDefinition) => void;
  /** All available agents */
  agents: AgentDefinition[];
  /** Get agent ID for current selection */
  currentAgentId: string | undefined;
  /** Whether multi-agent is enabled */
  isMultiAgentEnabled: boolean;
  /** All suggestions across all agents */
  allSuggestions: AgentSuggestion[];
  /** Loading state */
  isLoading: boolean;
  /** Refresh agents from DB */
  refreshAgents: () => Promise<void>;
}

const MultiAgentContext = createContext<MultiAgentContextType | undefined>(undefined);

export interface MultiAgentProviderProps {
  children: ReactNode;
}

/**
 * Provider for multi-agent context
 * Fetches agent data from the database
 */
export function MultiAgentProvider({ children }: MultiAgentProviderProps) {
  const [agents, setAgents] = useState<AgentDefinition[]>([DEFAULT_AGENT]);
  const [selectedAgent, setSelectedAgent] = useState<AgentDefinition>(DEFAULT_AGENT);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch agents from database
  const fetchAgents = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/agents");
      if (!response.ok) {
        throw new Error("Failed to fetch agents");
      }
      const data = await response.json();

      if (data.agents && data.agents.length > 0) {
        const agentDefinitions = data.agents.map(dbAgentToDefinition);
        setAgents(agentDefinitions);

        // Set default agent if current selection is invalid
        const defaultAgent = agentDefinitions.find((a: AgentDefinition) => a.role === "main") || agentDefinitions[0];
        if (!agentDefinitions.find((a: AgentDefinition) => a.key === selectedAgent.key)) {
          setSelectedAgent(defaultAgent);
        }
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
      // Keep using default agent on error
    } finally {
      setIsLoading(false);
    }
  }, [selectedAgent.key]);

  // Fetch agents on mount
  useEffect(() => {
    fetchAgents();
  }, []);

  // Collect all suggestions
  const allSuggestions = useMemo(() => {
    const suggestions: AgentSuggestion[] = [];
    for (const agent of agents) {
      for (const suggestion of agent.suggestions) {
        suggestions.push({
          ...suggestion,
          agentKey: agent.key,
        });
      }
    }
    return suggestions;
  }, [agents]);

  const multiAgentEnabled = agents.length > 1;

  const currentAgentId = useMemo(
    () => selectedAgent.lyzrAgentId || undefined,
    [selectedAgent]
  );

  const value = useMemo(
    () => ({
      selectedAgent,
      selectAgent: setSelectedAgent,
      agents,
      currentAgentId,
      isMultiAgentEnabled: multiAgentEnabled,
      allSuggestions,
      isLoading,
      refreshAgents: fetchAgents,
    }),
    [selectedAgent, agents, currentAgentId, multiAgentEnabled, allSuggestions, isLoading, fetchAgents]
  );

  return (
    <MultiAgentContext.Provider value={value}>
      {children}
    </MultiAgentContext.Provider>
  );
}

/**
 * Hook to access multi-agent context
 */
export function useMultiAgent() {
  const context = useContext(MultiAgentContext);
  if (context === undefined) {
    throw new Error("useMultiAgent must be used within a MultiAgentProvider");
  }
  return context;
}

/**
 * Get agent by key from the context
 */
export function useAgentByKey(key: string): AgentDefinition | undefined {
  const { agents } = useMultiAgent();
  return agents.find((a) => a.key === key);
}
