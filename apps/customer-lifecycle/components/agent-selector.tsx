"use client";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  cn,
} from "@tasco/ui";
import { ChevronDown, Check } from "@tasco/ui/icons";
import { useMultiAgent, type AgentDefinition } from "../lib/multi-agent-context";

interface AgentSelectorProps {
  /** Optional callback when agent changes */
  onAgentChange?: (agent: AgentDefinition) => void;
  /** Size variant */
  size?: "sm" | "default";
  /** Show full name or short name */
  showFullName?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * Agent selector dropdown component
 * Allows users to switch between different specialized AI agents
 */
export function AgentSelector({
  onAgentChange,
  size = "default",
  showFullName = false,
  className,
}: AgentSelectorProps) {
  const { selectedAgent, selectAgent, agents, isMultiAgentEnabled } = useMultiAgent();

  // Don't render if only one agent is available
  if (!isMultiAgentEnabled || agents.length <= 1) {
    return null;
  }

  const handleSelect = (agent: AgentDefinition) => {
    selectAgent(agent);
    onAgentChange?.(agent);
  };

  const Icon = selectedAgent.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-between gap-2",
            size === "sm" ? "h-8 px-2 text-xs" : "h-9 px-3 text-sm",
            className
          )}
        >
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center justify-center rounded",
                size === "sm" ? "h-5 w-5" : "h-6 w-6",
                selectedAgent.bgClass
              )}
            >
              <Icon
                className={cn(
                  selectedAgent.colorClass,
                  size === "sm" ? "h-3 w-3" : "h-4 w-4"
                )}
              />
            </div>
            <span className="font-medium">
              {showFullName ? selectedAgent.name : selectedAgent.shortName}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[280px]" align="start">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          Select an AI Agent
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {agents.map((agent) => {
          const AgentIcon = agent.icon;
          const isSelected = selectedAgent.key === agent.key;

          return (
            <DropdownMenuItem
              key={agent.key}
              onClick={() => handleSelect(agent)}
              className="flex items-start gap-3 py-3 cursor-pointer"
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                  agent.bgClass
                )}
              >
                <AgentIcon className={cn("h-4 w-4", agent.colorClass)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{agent.name}</span>
                  {agent.role === "expert" && (
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      Expert
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {agent.description}
                </p>
              </div>
              {isSelected && (
                <Check className="h-4 w-4 shrink-0 text-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Compact agent indicator (shows current agent without dropdown)
 */
export function AgentIndicator({ className }: { className?: string }) {
  const { selectedAgent, isMultiAgentEnabled } = useMultiAgent();

  if (!isMultiAgentEnabled) {
    return null;
  }

  const Icon = selectedAgent.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
        selectedAgent.bgClass,
        className
      )}
    >
      <Icon className={cn("h-3 w-3", selectedAgent.colorClass)} />
      <span className={selectedAgent.colorClass}>{selectedAgent.shortName}</span>
    </div>
  );
}

/**
 * Agent badge for chat messages
 */
export function AgentBadge({
  agentKey,
  className,
}: {
  agentKey?: string;
  className?: string;
}) {
  const { agents } = useMultiAgent();

  // Find agent by key, fallback to general assistant
  const agent = agents.find((a) => a.key === agentKey) || agents[0];
  if (!agent) return null;

  const Icon = agent.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
        agent.bgClass,
        className
      )}
    >
      <Icon className={cn("h-3 w-3", agent.colorClass)} />
      <span className={agent.colorClass}>{agent.name}</span>
    </div>
  );
}
