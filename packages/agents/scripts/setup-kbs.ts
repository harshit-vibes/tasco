#!/usr/bin/env bun
/**
 * Setup pending knowledge bases in Lyzr RAG API
 * Usage: bun run packages/agents/src/scripts/setup-kbs.ts
 *
 * Environment:
 *   LYZR_API_KEY - Lyzr API key
 */

import {
  KNOWLEDGE_BASES,
  getPendingKBs,
  getKBStats,
} from "../src/knowledge-bases.ts";
import type { KnowledgeBaseConfig, KBSetupResult } from "../src/types.ts";

const LYZR_RAG_URL = "https://agent-prod.studio.lyzr.ai/v3/rag";

interface LyzrRAGResponse {
  knowledge_base_id: string;
  collection_name: string;
  status: string;
}

/**
 * Create a knowledge base in Lyzr RAG API
 */
async function createKnowledgeBase(
  kb: KnowledgeBaseConfig,
  apiKey: string
): Promise<KBSetupResult> {
  try {
    console.log(`\n📚 Creating KB: ${kb.name}`);
    console.log(`   Key: ${kb.key}`);
    console.log(`   App: ${kb.appId}`);

    const response = await fetch(LYZR_RAG_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        name: kb.name,
        description: kb.description,
        vector_store_provider: kb.vectorStoreProvider,
        embedding_model: kb.embeddingModel,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as LyzrRAGResponse;

    console.log(`   ✅ Created: ${data.knowledge_base_id}`);
    console.log(`   Collection: ${data.collection_name}`);

    return {
      key: kb.key,
      kbId: data.knowledge_base_id,
      created: true,
      name: kb.name,
      collectionName: data.collection_name,
    };
  } catch (error) {
    console.log(`   ❌ Failed: ${error instanceof Error ? error.message : String(error)}`);
    return {
      key: kb.key,
      kbId: "",
      created: false,
      name: kb.name,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Check if a KB already exists by name
 */
async function findKBByName(
  name: string,
  apiKey: string
): Promise<string | null> {
  try {
    const response = await fetch(LYZR_RAG_URL, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
      },
    });

    if (!response.ok) {
      return null;
    }

    const kbs = (await response.json()) as Array<{
      knowledge_base_id: string;
      name: string;
    }>;

    const existing = kbs.find((kb) => kb.name === name);
    return existing?.knowledge_base_id || null;
  } catch {
    return null;
  }
}

async function main() {
  const apiKey = process.env.LYZR_API_KEY;

  if (!apiKey) {
    console.error("❌ Error: LYZR_API_KEY environment variable not set");
    console.log("\nUsage: LYZR_API_KEY=your-key bun run setup-kbs");
    process.exit(1);
  }

  console.log("\n🚀 TASCO KNOWLEDGE BASE SETUP\n");
  console.log("=".repeat(60));

  // Get stats
  const stats = getKBStats();
  console.log(`\n📊 Registry Status:`);
  console.log(`   Total KBs:   ${stats.total}`);
  console.log(`   Active:      ${stats.active}`);
  console.log(`   Pending:     ${stats.pending}`);

  // Get pending KBs
  const pendingKBs = getPendingKBs();

  if (pendingKBs.length === 0) {
    console.log("\n✅ All knowledge bases are already active!");
    console.log("   No pending KBs to create.\n");
    process.exit(0);
  }

  console.log(`\n📋 Pending KBs to create: ${pendingKBs.length}`);
  for (const kb of pendingKBs) {
    console.log(`   - ${kb.key} (${kb.appId})`);
  }

  // Create KBs
  console.log("\n" + "=".repeat(60));
  console.log("Creating Knowledge Bases...\n");

  const results: KBSetupResult[] = [];

  for (const kb of pendingKBs) {
    // Check if already exists
    const existingId = await findKBByName(kb.name, apiKey);

    if (existingId) {
      console.log(`\n⚡ KB already exists: ${kb.name}`);
      console.log(`   ID: ${existingId}`);
      results.push({
        key: kb.key,
        kbId: existingId,
        created: false,
        name: kb.name,
      });
      continue;
    }

    // Create new KB
    const result = await createKnowledgeBase(kb, apiKey);
    results.push(result);
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("SETUP SUMMARY\n");

  const successful = results.filter((r) => r.kbId);
  const failed = results.filter((r) => !r.kbId);

  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed:     ${failed.length}`);

  if (successful.length > 0) {
    console.log("\n📝 Update your .env files with these KB IDs:\n");
    for (const result of successful) {
      const kb = KNOWLEDGE_BASES[result.key];
      console.log(`# ${result.key}`);
      console.log(`${kb.envVar}=${result.kbId}`);
      console.log();
    }

    console.log("\n📝 Update knowledge-bases.ts registry with these IDs:\n");
    for (const result of successful) {
      console.log(`"${result.key}": {`);
      console.log(`  id: "${result.kbId}",`);
      console.log(`  status: "active",`);
      if (result.collectionName) {
        console.log(`  collectionName: "${result.collectionName}",`);
      }
      console.log(`},`);
      console.log();
    }
  }

  if (failed.length > 0) {
    console.log("\n❌ Failed KBs:");
    for (const result of failed) {
      console.log(`   ${result.key}: ${result.error}`);
    }
  }

  console.log("=".repeat(60) + "\n");
}

main().catch(console.error);
