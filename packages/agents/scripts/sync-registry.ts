#!/usr/bin/env bun
/**
 * Sync Registry Script
 *
 * Synchronizes agent IDs from environment variables or Lyzr API
 * back to the registry file.
 *
 * Usage:
 *   bun run sync-registry              # Sync from env vars
 *   bun run sync-registry --from-api   # Sync from Lyzr API
 *   bun run sync-registry --export     # Export to lyzr-registry.json
 */

import * as fs from "fs";
import * as path from "path";
import {
  AGENTS,
  KNOWLEDGE_BASES,
  APP_CONFIGS,
  exportRegistryToJSON,
  generateEnvFile,
  type AppId,
} from "../src";
import { listAgents, findAgentByName, type AgentManagementConfig } from "@tasco/api";

// Parse CLI arguments
const args = process.argv.slice(2);
const fromApi = args.includes("--from-api");
const exportJson = args.includes("--export");

// Configuration
const config: AgentManagementConfig = {
  apiKey: process.env.LYZR_API_KEY || "",
};

async function syncFromEnvVars() {
  console.log("🔄 Syncing from environment variables...\n");

  let synced = 0;
  let missing = 0;

  for (const agent of Object.values(AGENTS)) {
    const envValue = process.env[agent.envVar];

    if (envValue && envValue !== agent.id) {
      console.log(`   ${agent.key}:`);
      console.log(`      Old: ${agent.id || "(null)"}`);
      console.log(`      New: ${envValue}`);
      agent.id = envValue;
      agent.status = "active";
      synced++;
    } else if (!envValue && !agent.id) {
      missing++;
    }
  }

  console.log(`\n✅ Synced: ${synced} agents`);
  console.log(`⏳ Missing: ${missing} agents (need setup)`);
}

async function syncFromApi() {
  console.log("🔄 Syncing from Lyzr API...\n");

  if (!config.apiKey) {
    console.error("Error: LYZR_API_KEY environment variable is required");
    process.exit(1);
  }

  try {
    const allAgents = await listAgents(config);
    console.log(`   Found ${allAgents.length} agents in Lyzr API`);

    let synced = 0;
    let notFound = 0;

    for (const agent of Object.values(AGENTS)) {
      // Try to find by name
      const found = allAgents.find(
        (a: { name: string }) =>
          a.name === agent.name ||
          a.name.toLowerCase() === agent.name.toLowerCase()
      );

      if (found) {
        if (found.agent_id !== agent.id) {
          console.log(`   ${agent.key}:`);
          console.log(`      Old: ${agent.id || "(null)"}`);
          console.log(`      New: ${found.agent_id}`);
          agent.id = found.agent_id;
          agent.status = "active";
          synced++;
        }
      } else {
        if (agent.status === "active") {
          console.log(`   ⚠️  ${agent.key}: Not found in API`);
          notFound++;
        }
      }
    }

    console.log(`\n✅ Synced: ${synced} agents`);
    console.log(`⚠️  Not found: ${notFound} agents`);
  } catch (error) {
    console.error("Error syncing from API:", error);
  }
}

function exportToJson() {
  console.log("📤 Exporting registry to JSON...\n");

  // Export to lyzr-registry.json at repo root
  const repoRoot = path.resolve(__dirname, "../../../..");
  const outputPath = path.join(repoRoot, "lyzr-registry.json");

  // Build the registry structure that matches the existing format
  const registry = {
    $schema: "./lyzr-registry.schema.json",
    version: "2.0.0",
    lastUpdated: new Date().toISOString(),
    apiUrl: "https://agent-prod.studio.lyzr.ai",
    agents: {} as Record<string, Record<string, { id: string | null; envVar: string }>>,
    knowledgeBases: {} as Record<
      string,
      { id: string | null; envVar: string; connectedAgents: string[] }
    >,
  };

  // Group agents by app
  for (const agent of Object.values(AGENTS)) {
    if (!registry.agents[agent.appId]) {
      registry.agents[agent.appId] = {};
    }

    const shortKey = agent.key.split(":")[1];
    registry.agents[agent.appId][shortKey] = {
      id: agent.id,
      envVar: agent.envVar,
    };
  }

  // Add knowledge bases
  for (const kb of Object.values(KNOWLEDGE_BASES)) {
    registry.knowledgeBases[kb.key] = {
      id: kb.id,
      envVar: kb.envVar,
      connectedAgents: kb.connectedAgents,
    };
  }

  fs.writeFileSync(outputPath, JSON.stringify(registry, null, 2));
  console.log(`   ✅ Exported to: ${outputPath}`);

  // Also generate env files for each app
  const appsDir = path.join(repoRoot, "apps");
  for (const appId of Object.keys(APP_CONFIGS) as AppId[]) {
    const envContent = generateEnvFile(appId);
    const envPath = path.join(appsDir, appId, ".env.local.example");

    // Only write if there are agents for this app
    const appAgents = Object.values(AGENTS).filter((a) => a.appId === appId);
    if (appAgents.length > 0) {
      try {
        fs.writeFileSync(envPath, envContent);
        console.log(`   ✅ Generated: apps/${appId}/.env.local.example`);
      } catch {
        console.log(`   ⚠️  Could not write: apps/${appId}/.env.local.example`);
      }
    }
  }
}

async function main() {
  console.log("🔄 Tasco Registry Sync Script");
  console.log("=============================\n");

  if (fromApi) {
    await syncFromApi();
  } else {
    await syncFromEnvVars();
  }

  if (exportJson) {
    console.log("\n");
    exportToJson();
  }

  console.log("\n✅ Sync complete!");
}

main().catch(console.error);
