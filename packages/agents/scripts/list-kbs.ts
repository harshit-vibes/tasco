#!/usr/bin/env bun
/**
 * List all knowledge bases from the registry
 * Usage: bun run packages/agents/src/scripts/list-kbs.ts
 */

import {
  KNOWLEDGE_BASES,
  DOCUMENT_CATEGORIES,
  getKBStats,
  getActiveKBs,
  getPendingKBs,
  getCategoriesForKB,
} from "../src/knowledge-bases.ts";

console.log("\n📚 TASCO KNOWLEDGE BASE REGISTRY\n");
console.log("=".repeat(80));

// Summary stats
const stats = getKBStats();
console.log("\n📊 SUMMARY");
console.log("-".repeat(40));
console.log(`Total KBs:       ${stats.total}`);
console.log(`Active:          ${stats.active}`);
console.log(`Pending:         ${stats.pending}`);
console.log(`Total Documents: ${stats.totalDocuments}`);

// KBs by app
console.log("\n📱 KBs BY APP");
console.log("-".repeat(40));
for (const [appId, count] of Object.entries(stats.byApp)) {
  console.log(`${appId}: ${count}`);
}

// Active KBs
const activeKBs = getActiveKBs();
if (activeKBs.length > 0) {
  console.log("\n✅ ACTIVE KNOWLEDGE BASES");
  console.log("-".repeat(80));
  console.log(
    "Key".padEnd(35) +
      "ID".padEnd(28) +
      "Docs".padEnd(6) +
      "Agents"
  );
  console.log("-".repeat(80));
  for (const kb of activeKBs) {
    const categories = getCategoriesForKB(kb.key);
    const categoryNames = categories.map((c) => c.key).join(", ");
    console.log(
      kb.key.padEnd(35) +
        (kb.id || "N/A").padEnd(28) +
        String(kb.documentCount).padEnd(6) +
        kb.connectedAgents.join(", ")
    );
    if (categoryNames) {
      console.log(`   Categories: ${categoryNames}`);
    }
  }
}

// Pending KBs
const pendingKBs = getPendingKBs();
if (pendingKBs.length > 0) {
  console.log("\n⏳ PENDING KNOWLEDGE BASES");
  console.log("-".repeat(80));
  console.log(
    "Key".padEnd(35) +
      "EnvVar".padEnd(25) +
      "App"
  );
  console.log("-".repeat(80));
  for (const kb of pendingKBs) {
    console.log(
      kb.key.padEnd(35) +
        kb.envVar.padEnd(25) +
        kb.appId
    );
    console.log(`   → ${kb.description}`);
  }
}

// Document categories
console.log("\n📁 DOCUMENT CATEGORIES");
console.log("-".repeat(80));
console.log(
  "Category".padEnd(15) +
    "Target KB".padEnd(30) +
    "Description"
);
console.log("-".repeat(80));
for (const [key, category] of Object.entries(DOCUMENT_CATEGORIES)) {
  console.log(
    key.padEnd(15) +
      category.targetKB.padEnd(30) +
      category.description.slice(0, 40)
  );
}

// All KBs detail
console.log("\n📋 ALL KNOWLEDGE BASES DETAIL");
console.log("=".repeat(80));
for (const [key, kb] of Object.entries(KNOWLEDGE_BASES)) {
  const statusIcon = kb.status === "active" ? "✅" : kb.status === "pending" ? "⏳" : "❌";
  console.log(`\n${statusIcon} ${key}`);
  console.log(`   Name:        ${kb.name}`);
  console.log(`   Description: ${kb.description}`);
  console.log(`   App:         ${kb.appId}`);
  console.log(`   ID:          ${kb.id || "Not created yet"}`);
  console.log(`   Status:      ${kb.status}`);
  console.log(`   Env Var:     ${kb.envVar}`);
  console.log(`   Documents:   ${kb.documentCount}`);
  console.log(`   Agents:      ${kb.connectedAgents.join(", ") || "None"}`);
  console.log(`   Vector DB:   ${kb.vectorStoreProvider}`);
  console.log(`   Embedding:   ${kb.embeddingModel}`);
  if (kb.s3Path) {
    console.log(`   S3 Path:     ${kb.s3Path}`);
  }
  if (kb.retrievalConfig) {
    console.log(`   Retrieval:   topK=${kb.retrievalConfig.topK}, threshold=${kb.retrievalConfig.similarityThreshold}`);
  }
}

console.log("\n" + "=".repeat(80));
console.log("Use 'bun run setup-kbs' to create pending knowledge bases");
console.log("=".repeat(80) + "\n");
