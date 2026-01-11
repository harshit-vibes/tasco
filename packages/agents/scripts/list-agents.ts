#!/usr/bin/env bun
/**
 * List Agents Script
 *
 * Lists all agents in the registry with their status and configuration.
 *
 * Usage:
 *   bun run list-agents                    # List all agents
 *   bun run list-agents --app=compliance-qa  # Filter by app
 *   bun run list-agents --pending          # Show only pending
 *   bun run list-agents --json             # Output as JSON
 *   bun run list-agents --detailed         # Show full config
 */

import {
  AGENTS,
  KNOWLEDGE_BASES,
  APP_CONFIGS,
  getAgentsByApp,
  getPendingAgents,
  getActiveAgents,
  getJSONOutputAgents,
  getRAGEnabledAgents,
  type AppId,
} from "../src";

// Parse CLI arguments
const args = process.argv.slice(2);
const appArg = args.find((a) => a.startsWith("--app="));
const targetAppId = appArg ? (appArg.split("=")[1] as AppId) : undefined;
const pendingOnly = args.includes("--pending");
const jsonOutput = args.includes("--json");
const detailed = args.includes("--detailed");

function formatAgent(agent: (typeof AGENTS)[string], index: number) {
  const statusEmoji =
    agent.status === "active"
      ? "✅"
      : agent.status === "pending"
        ? "⏳"
        : agent.status === "disabled"
          ? "🔒"
          : "⚠️";

  const roleEmoji =
    agent.role === "orchestrator"
      ? "🎭"
      : agent.role === "expert"
        ? "🎓"
        : agent.role === "validator"
          ? "✔️"
          : agent.role === "generator"
            ? "📝"
            : "💬";

  const configFlags: string[] = [];
  if (agent.outputFormat === "json") configFlags.push("JSON");
  if (agent.ragConfig) configFlags.push("RAG");
  if (agent.subAgents?.length) configFlags.push(`SUB:${agent.subAgents.length}`);
  if (agent.connectedKBs.length) configFlags.push(`KB:${agent.connectedKBs.length}`);

  const flags = configFlags.length > 0 ? ` [${configFlags.join(", ")}]` : "";

  console.log(`\n   ${index}. ${statusEmoji} ${roleEmoji} ${agent.name}${flags}`);
  console.log(`      Key: ${agent.key}`);
  console.log(`      ID: ${agent.id || "(not created)"}`);
  console.log(`      Model: ${agent.model} | Temp: ${agent.temperature}`);
  console.log(`      Env: ${agent.envVar}`);

  if (detailed) {
    console.log(`      Description: ${agent.description}`);
    console.log(`      Feature: ${agent.feature}`);
    console.log(`      Visibility: ${agent.visibility}`);

    if (agent.ragConfig) {
      console.log(`      RAG Config:`);
      console.log(`         KB ID: ${agent.ragConfig.knowledgeBaseId}`);
      console.log(`         Top-K: ${agent.ragConfig.topK || 5}`);
      console.log(
        `         Threshold: ${agent.ragConfig.similarityThreshold || 0.5}`
      );
    }

    if (agent.jsonOutput) {
      console.log(`      JSON Output: enabled`);
      console.log(`         Strict: ${agent.jsonOutput.strict || false}`);
      console.log(
        `         Schema: ${agent.jsonOutput.schema ? "defined" : "none"}`
      );
    }

    if (agent.subAgents?.length) {
      console.log(`      Sub-agents: ${agent.subAgents.join(", ")}`);
    }

    if (agent.connectedKBs.length) {
      console.log(`      Connected KBs: ${agent.connectedKBs.join(", ")}`);
    }
  }
}

function main() {
  if (jsonOutput) {
    let agents = Object.values(AGENTS);
    if (targetAppId) {
      agents = agents.filter((a) => a.appId === targetAppId);
    }
    if (pendingOnly) {
      agents = agents.filter((a) => !a.id || a.status === "pending");
    }
    console.log(JSON.stringify(agents, null, 2));
    return;
  }

  console.log("📋 Tasco Agent Registry");
  console.log("=======================\n");

  // Summary
  const total = Object.keys(AGENTS).length;
  const active = getActiveAgents().length;
  const pending = getPendingAgents().length;
  const jsonAgents = getJSONOutputAgents().length;
  const ragAgents = getRAGEnabledAgents().length;

  console.log("📊 Summary");
  console.log("─".repeat(40));
  console.log(`   Total Agents: ${total}`);
  console.log(`   Active: ${active} | Pending: ${pending}`);
  console.log(`   JSON Output: ${jsonAgents} | RAG-Enabled: ${ragAgents}`);
  console.log(`   Knowledge Bases: ${Object.keys(KNOWLEDGE_BASES).length}`);

  // List agents by app
  const appIds = targetAppId
    ? [targetAppId]
    : (Object.keys(APP_CONFIGS) as AppId[]);

  for (const appId of appIds) {
    const appConfig = APP_CONFIGS[appId];
    let agents = getAgentsByApp(appId);

    if (pendingOnly) {
      agents = agents.filter((a) => !a.id || a.status === "pending");
    }

    if (agents.length === 0) continue;

    const statusEmoji =
      appConfig.status === "active"
        ? "✅"
        : appConfig.status === "mock"
          ? "⏳"
          : "❌";

    console.log(`\n\n📱 ${appConfig.appName} (${appId}) ${statusEmoji}`);
    console.log("─".repeat(50));
    console.log(`   ${appConfig.description}`);

    agents.forEach((agent, i) => formatAgent(agent, i + 1));

    // Show knowledge bases for this app
    const kbs = Object.values(KNOWLEDGE_BASES).filter(
      (kb) => kb.appId === appId
    );
    if (kbs.length > 0) {
      console.log(`\n   📚 Knowledge Bases:`);
      for (const kb of kbs) {
        console.log(`      - ${kb.name} (${kb.id || "not created"})`);
        console.log(`        Docs: ${kb.documentCount} | Agents: ${kb.connectedAgents.join(", ")}`);
      }
    }
  }

  console.log("\n");
}

main();
