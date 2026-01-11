#!/usr/bin/env node
/**
 * Lyzr Registry Manager
 *
 * Utility script to view and update the lyzr-registry.json file.
 *
 * Usage:
 *   bun scripts/registry.ts list [agents|kbs]
 *   bun scripts/registry.ts get <app> <agent-key>
 *   bun scripts/registry.ts update <app> <agent-key> <field> <value>
 *   bun scripts/registry.ts env <app>               # Generate .env.local
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const REGISTRY_PATH = join(import.meta.dir, "..", "lyzr-registry.json");
const LYZR_API_URL = "https://agent-prod.studio.lyzr.ai";

interface Registry {
  version: string;
  lastUpdated: string;
  apiUrl: string;
  agents: Record<string, Record<string, AgentEntry>>;
  knowledgeBases: Record<string, KBEntry>;
  documentCategories: Record<string, any>;
  scripts: Record<string, Record<string, string>>;
}

interface AgentEntry {
  id: string | null;
  name: string;
  role: string;
  model: string;
  description: string;
  connectedKBs: string[];
  subAgents?: string[];
  envVar: string;
  status?: string;
}

interface KBEntry {
  id: string | null;
  name: string;
  app: string;
  description: string;
  documentFilter?: Record<string, string>;
  connectedAgents: string[];
  envVar: string;
  documentCount?: number;
}

function loadRegistry(): Registry {
  const content = readFileSync(REGISTRY_PATH, "utf-8");
  return JSON.parse(content);
}

function saveRegistry(registry: Registry): void {
  registry.lastUpdated = new Date().toISOString().split("T")[0];
  writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2) + "\n");
  console.log("Registry saved.");
}

function listCommand(type?: string): void {
  const registry = loadRegistry();

  if (!type || type === "agents") {
    console.log("\n=== AGENTS ===\n");
    for (const [app, agents] of Object.entries(registry.agents)) {
      console.log(`${app}:`);
      for (const [key, agent] of Object.entries(agents)) {
        const status = agent.id ? "active" : "pending";
        const kbs = agent.connectedKBs.length > 0 ? ` [KBs: ${agent.connectedKBs.join(", ")}]` : "";
        console.log(`  ${key}: ${agent.id || "(not created)"} - ${agent.name} (${status})${kbs}`);
      }
      console.log();
    }
  }

  if (!type || type === "kbs") {
    console.log("\n=== KNOWLEDGE BASES ===\n");
    for (const [key, kb] of Object.entries(registry.knowledgeBases)) {
      const agents = kb.connectedAgents.length > 0 ? ` [Agents: ${kb.connectedAgents.join(", ")}]` : "";
      console.log(`${key}: ${kb.id || "(not created)"}`);
      console.log(`  Name: ${kb.name}`);
      console.log(`  App: ${kb.app}`);
      console.log(`  Docs: ${kb.documentCount || 0}${agents}`);
      console.log();
    }
  }
}

function getCommand(app: string, agentKey: string): void {
  const registry = loadRegistry();

  const agents = registry.agents[app];
  if (!agents) {
    console.error(`App not found: ${app}`);
    console.log("Available apps:", Object.keys(registry.agents).join(", "));
    process.exit(1);
  }

  const agent = agents[agentKey];
  if (!agent) {
    console.error(`Agent not found: ${agentKey}`);
    console.log("Available agents:", Object.keys(agents).join(", "));
    process.exit(1);
  }

  console.log(JSON.stringify(agent, null, 2));
}

function updateCommand(app: string, agentKey: string, field: string, value: string): void {
  const registry = loadRegistry();

  if (!registry.agents[app]) {
    console.error(`App not found: ${app}`);
    process.exit(1);
  }

  if (!registry.agents[app][agentKey]) {
    console.error(`Agent not found: ${agentKey}`);
    process.exit(1);
  }

  const agent = registry.agents[app][agentKey] as any;
  const oldValue = agent[field];

  // Handle arrays
  if (field === "connectedKBs" || field === "subAgents") {
    agent[field] = value.split(",").map((s: string) => s.trim());
  } else {
    agent[field] = value;
  }

  saveRegistry(registry);
  console.log(`Updated ${app}.${agentKey}.${field}:`);
  console.log(`  Old: ${JSON.stringify(oldValue)}`);
  console.log(`  New: ${JSON.stringify(agent[field])}`);
}

async function syncCommand(): Promise<void> {
  const apiKey = process.env.LYZR_API_KEY;
  if (!apiKey) {
    console.error("LYZR_API_KEY required for sync");
    process.exit(1);
  }

  const registry = loadRegistry();

  console.log("Fetching agents from Lyzr API...\n");

  try {
    // Fetch agents directly
    const response = await fetch(`${LYZR_API_URL}/v3/agents`, {
      headers: { "x-api-key": apiKey },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const liveAgents = data.agents || [];
    console.log(`Found ${liveAgents.length} agents in Lyzr\n`);

    // Match live agents with registry
    for (const [app, agents] of Object.entries(registry.agents)) {
      for (const [key, agent] of Object.entries(agents)) {
        const liveAgent = liveAgents.find(
          (a: any) => a.agent_id === agent.id || a.name === agent.name
        );

        if (liveAgent) {
          // Update from live
          agent.id = liveAgent.agent_id;
          agent.model = liveAgent.model || agent.model;
          delete agent.status;

          // Check for RAG features (connected KBs)
          const ragFeatures = (liveAgent.features || []).filter((f: any) => f.type === "rag");
          if (ragFeatures.length > 0) {
            const kbIds = ragFeatures.map((f: any) => f.config?.knowledge_base_id).filter(Boolean);

            // Find KB keys
            const kbKeys = kbIds
              .map((kbId: string) => {
                const entry = Object.entries(registry.knowledgeBases).find(
                  ([_, kb]) => kb.id === kbId
                );
                return entry ? entry[0] : null;
              })
              .filter((k: string | null): k is string => k !== null);

            if (kbKeys.length > 0) {
              agent.connectedKBs = kbKeys;
            }
          }

          console.log(`[SYNCED] ${app}.${key}: ${agent.id}`);
        } else if (!agent.id) {
          console.log(`[PENDING] ${app}.${key}: Not created yet`);
        } else {
          console.log(`[NOT FOUND] ${app}.${key}: ${agent.id} not in Lyzr`);
        }
      }
    }

    saveRegistry(registry);
    console.log("\nSync complete!");
  } catch (error) {
    console.error("Sync failed:", error);
    process.exit(1);
  }
}

function envCommand(app: string): void {
  const registry = loadRegistry();

  const agents = registry.agents[app];
  if (!agents) {
    console.error(`App not found: ${app}`);
    console.log("Available apps:", Object.keys(registry.agents).join(", "));
    process.exit(1);
  }

  console.log(`# Environment variables for ${app}`);
  console.log(`# Add to apps/${app}/.env.local\n`);

  for (const [_, agent] of Object.entries(agents)) {
    if (agent.id) {
      console.log(`${agent.envVar}=${agent.id}`);
    } else {
      console.log(`# ${agent.envVar}= # Not created yet`);
    }
  }

  // Find KBs for this app
  const appKBs = Object.entries(registry.knowledgeBases).filter(
    ([_, kb]) => kb.app === app
  );

  if (appKBs.length > 0) {
    console.log();
    for (const [_, kb] of appKBs) {
      if (kb.id) {
        console.log(`${kb.envVar}=${kb.id}`);
      } else {
        console.log(`# ${kb.envVar}= # Not created yet`);
      }
    }
  }
}

function summaryCommand(): void {
  const registry = loadRegistry();

  let totalAgents = 0;
  let activeAgents = 0;
  let pendingAgents = 0;

  for (const [_, agents] of Object.entries(registry.agents)) {
    for (const [_, agent] of Object.entries(agents)) {
      totalAgents++;
      if (agent.id) {
        activeAgents++;
      } else {
        pendingAgents++;
      }
    }
  }

  const totalKBs = Object.keys(registry.knowledgeBases).length;
  const activeKBs = Object.values(registry.knowledgeBases).filter(kb => kb.id).length;

  console.log("\n=== REGISTRY SUMMARY ===\n");
  console.log(`Last Updated: ${registry.lastUpdated}`);
  console.log(`API URL: ${registry.apiUrl}`);
  console.log();
  console.log(`Agents: ${activeAgents}/${totalAgents} active (${pendingAgents} pending)`);
  console.log(`Knowledge Bases: ${activeKBs}/${totalKBs} active`);
  console.log(`Apps: ${Object.keys(registry.agents).length}`);
  console.log();
}

// Main
const [command, ...args] = process.argv.slice(2);

switch (command) {
  case "list":
    listCommand(args[0]);
    break;
  case "get":
    if (args.length < 2) {
      console.error("Usage: registry.ts get <app> <agent-key>");
      process.exit(1);
    }
    getCommand(args[0], args[1]);
    break;
  case "update":
    if (args.length < 4) {
      console.error("Usage: registry.ts update <app> <agent-key> <field> <value>");
      process.exit(1);
    }
    updateCommand(args[0], args[1], args[2], args[3]);
    break;
  case "sync":
    syncCommand();
    break;
  case "env":
    if (!args[0]) {
      console.error("Usage: registry.ts env <app>");
      process.exit(1);
    }
    envCommand(args[0]);
    break;
  case "summary":
    summaryCommand();
    break;
  default:
    console.log(`
Lyzr Registry Manager

Usage:
  bun scripts/registry.ts list [agents|kbs]        List all agents or KBs
  bun scripts/registry.ts get <app> <agent-key>    Get agent details
  bun scripts/registry.ts update <app> <key> <field> <value>  Update agent field
  bun scripts/registry.ts sync                      Sync from live Lyzr API
  bun scripts/registry.ts env <app>                 Generate .env.local vars
  bun scripts/registry.ts summary                   Show registry summary

Examples:
  bun scripts/registry.ts list agents
  bun scripts/registry.ts get compliance-qa main
  bun scripts/registry.ts update compliance-qa main model gpt-4o
  bun scripts/registry.ts env compliance-qa
`);
}
