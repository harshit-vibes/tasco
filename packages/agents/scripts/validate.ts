#!/usr/bin/env bun
/**
 * Validate Registry Script
 *
 * Validates the agent registry for configuration errors,
 * missing fields, and best practice warnings.
 *
 * Usage:
 *   bun run validate              # Full validation
 *   bun run validate --strict     # Fail on warnings
 *   bun run validate --json       # Output as JSON
 */

import {
  AGENTS,
  KNOWLEDGE_BASES,
  APP_CONFIGS,
  validateRegistry,
  getRegistryStats,
  getJSONOutputAgents,
  getRAGEnabledAgents,
} from "../src";

// Parse CLI arguments
const args = process.argv.slice(2);
const strict = args.includes("--strict");
const jsonOutput = args.includes("--json");

function main() {
  if (!jsonOutput) {
    console.log("🔍 Tasco Registry Validation");
    console.log("============================\n");
  }

  // Run validation
  const result = validateRegistry();

  // Get stats
  const stats = getRegistryStats();

  // JSON output mode
  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          valid: result.valid,
          stats,
          errors: result.errors,
          warnings: result.warnings,
        },
        null,
        2
      )
    );
    process.exit(result.valid && (!strict || result.warnings.length === 0) ? 0 : 1);
  }

  // Regular output
  console.log("📊 Registry Statistics");
  console.log("─".repeat(40));
  console.log(`   Total Agents: ${stats.totalAgents}`);
  console.log(`   Active Agents: ${stats.activeAgents}`);
  console.log(`   Pending Agents: ${stats.pendingAgents}`);
  console.log(`   Knowledge Bases: ${stats.totalKnowledgeBases}`);
  console.log(`   Active KBs: ${stats.activeKnowledgeBases}`);

  console.log("\n📱 App Status");
  console.log("─".repeat(40));
  for (const app of stats.appStats) {
    const statusEmoji =
      app.status === "active" ? "✅" : app.status === "mock" ? "⏳" : "❌";
    console.log(
      `   ${statusEmoji} ${app.appId}: ${app.agentCount} agents, ${app.kbCount} KBs`
    );
  }

  // JSON Output Agents
  const jsonAgents = getJSONOutputAgents();
  console.log("\n📋 JSON Output Agents");
  console.log("─".repeat(40));
  if (jsonAgents.length === 0) {
    console.log("   No agents configured for JSON output");
  } else {
    for (const agent of jsonAgents) {
      const hasSchema = agent.jsonOutput?.schema ? "✅" : "⚠️";
      console.log(`   ${hasSchema} ${agent.key}`);
    }
  }

  // RAG-Enabled Agents
  const ragAgents = getRAGEnabledAgents();
  console.log("\n📚 RAG-Enabled Agents");
  console.log("─".repeat(40));
  if (ragAgents.length === 0) {
    console.log("   No agents with RAG configured");
  } else {
    for (const agent of ragAgents) {
      const kbId = agent.ragConfig?.knowledgeBaseId || "N/A";
      const topK = agent.ragConfig?.topK || 5;
      console.log(`   ${agent.key}`);
      console.log(`      KB: ${kbId.substring(0, 12)}... | Top-K: ${topK}`);
    }
  }

  // Errors
  if (result.errors.length > 0) {
    console.log("\n❌ Errors");
    console.log("─".repeat(40));
    for (const error of result.errors) {
      console.log(`   ${error.agentKey}.${error.field}:`);
      console.log(`      ${error.message}`);
    }
  }

  // Warnings
  if (result.warnings.length > 0) {
    console.log("\n⚠️  Warnings");
    console.log("─".repeat(40));
    for (const warning of result.warnings) {
      console.log(`   ${warning.agentKey}.${warning.field}:`);
      console.log(`      ${warning.message}`);
    }
  }

  // Final status
  console.log("\n" + "─".repeat(40));
  if (result.valid && result.warnings.length === 0) {
    console.log("✅ Registry is valid with no warnings!");
  } else if (result.valid) {
    console.log(`✅ Registry is valid with ${result.warnings.length} warning(s)`);
  } else {
    console.log(`❌ Registry has ${result.errors.length} error(s)`);
  }

  // Exit code
  if (!result.valid) {
    process.exit(1);
  }
  if (strict && result.warnings.length > 0) {
    console.log("\n⚠️  Strict mode: Failing due to warnings");
    process.exit(1);
  }
}

main();
