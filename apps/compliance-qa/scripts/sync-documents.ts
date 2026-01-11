#!/usr/bin/env node
/**
 * Sync Documents to Knowledge Bases
 *
 * Syncs documents from S3 to the appropriate Lyzr RAG Knowledge Base:
 * - Documents with category='_LEGAL' → Legal KB (for Legal Expert Agent)
 * - Documents with category!='_LEGAL' → Internal KB (for Internal Policy Expert Agent)
 *
 * Run: bun run sync-documents
 * Or:  LYZR_API_KEY=xxx bun run sync-documents
 *
 * Options:
 *   --legal-only    Only sync legal documents
 *   --internal-only Only sync internal documents
 *   --force         Force resync all documents (ignore syncedToKB flag)
 */

import {
  getDocumentsIndex,
  updateDocumentsIndex,
  getDocument,
  type DocumentMetadata,
} from "@tasco/db/s3";
import { syncDocumentToRAG, type SyncDocument } from "@tasco/rag";
import {
  getKB,
  DOCUMENT_CATEGORIES,
} from "@tasco/agents/knowledge-bases";

// Get KB IDs from central registry (fallback to env vars for backward compatibility)
const legalKB = getKB("compliance-qa:legal-kb");
const internalKB = getKB("compliance-qa:internal-kb");

const LEGAL_KB_ID = legalKB?.id || process.env.LYZR_LEGAL_KB_ID || process.env.NEXT_PUBLIC_LYZR_LEGAL_KB_ID;
const INTERNAL_KB_ID = internalKB?.id || process.env.LYZR_KB_ID || process.env.NEXT_PUBLIC_LYZR_KB_ID;
const API_KEY = process.env.LYZR_API_KEY || process.env.NEXT_PUBLIC_LYZR_API_KEY;

// Get legal category from central registry
const LEGAL_CATEGORY = DOCUMENT_CATEGORIES._LEGAL?.key || "_LEGAL";

interface SyncOptions {
  legalOnly?: boolean;
  internalOnly?: boolean;
  force?: boolean;
}

interface SyncStats {
  legal: { synced: number; failed: number; skipped: number };
  internal: { synced: number; failed: number; skipped: number };
}

async function getDocumentContent(filename: string): Promise<string | null> {
  try {
    const content = await getDocument(filename);
    return content;
  } catch (error) {
    console.error(`   ⚠️  Failed to get content for ${filename}:`, error);
    return null;
  }
}

async function syncDocuments(options: SyncOptions = {}): Promise<SyncStats> {
  console.log("📚 Syncing documents to Knowledge Bases...\n");

  if (!API_KEY) {
    console.error("❌ Error: LYZR_API_KEY environment variable is required");
    process.exit(1);
  }

  if (!options.internalOnly && !LEGAL_KB_ID) {
    console.error("❌ Error: LYZR_LEGAL_KB_ID environment variable is required for legal sync");
    console.log("   Run 'bun run setup-agents' first to create the Legal KB");
    process.exit(1);
  }

  if (!options.legalOnly && !INTERNAL_KB_ID) {
    console.error("❌ Error: LYZR_KB_ID environment variable is required for internal sync");
    process.exit(1);
  }

  // Load all documents
  const documents = await getDocumentsIndex();
  console.log(`📄 Found ${documents.length} documents in index\n`);

  // Separate legal and internal documents
  const legalDocs = documents.filter((doc: DocumentMetadata) => doc.category === LEGAL_CATEGORY);
  const internalDocs = documents.filter((doc: DocumentMetadata) => doc.category !== LEGAL_CATEGORY);

  console.log(`⚖️  Legal documents: ${legalDocs.length}`);
  console.log(`📁 Internal documents: ${internalDocs.length}\n`);

  const stats: SyncStats = {
    legal: { synced: 0, failed: 0, skipped: 0 },
    internal: { synced: 0, failed: 0, skipped: 0 },
  };

  const updatedDocs: DocumentMetadata[] = [...documents];

  // Sync Legal Documents
  if (!options.internalOnly && legalDocs.length > 0 && LEGAL_KB_ID) {
    console.log("=".repeat(50));
    console.log("⚖️  SYNCING LEGAL DOCUMENTS TO LEGAL KB");
    console.log("=".repeat(50));
    console.log(`   KB ID: ${LEGAL_KB_ID}\n`);

    for (const doc of legalDocs) {
      // Skip if already synced (unless force flag)
      if (doc.syncedToKB && !options.force) {
        console.log(`⏭️  [SKIP] ${doc.name} (already synced)`);
        stats.legal.skipped++;
        continue;
      }

      console.log(`📄 Syncing: ${doc.name}`);

      // Get document content from S3
      const content = await getDocumentContent(doc.filename);
      if (!content) {
        console.log(`   ❌ No content available - skipping`);
        stats.legal.failed++;
        continue;
      }

      // Prepare sync document
      const syncDoc: SyncDocument = {
        id: doc.id,
        name: doc.name,
        filename: doc.filename,
        content,
        category: (doc as any).legalType || doc.category,
        entityId: doc.entityId,
      };

      // Sync to Legal KB
      const result = await syncDocumentToRAG(
        { kbId: LEGAL_KB_ID, apiKey: API_KEY },
        syncDoc
      );

      if (result.success) {
        console.log(`   ✅ Synced successfully`);
        stats.legal.synced++;

        // Update document metadata
        const docIndex = updatedDocs.findIndex((d: DocumentMetadata) => d.id === doc.id);
        if (docIndex !== -1) {
          updatedDocs[docIndex] = {
            ...updatedDocs[docIndex],
            syncedToKB: true,
            kbDocumentId: result.kbDocumentId,
            syncedAt: new Date().toISOString(),
          };
        }
      } else {
        console.log(`   ❌ Sync failed: ${result.error}`);
        stats.legal.failed++;
      }
    }
  }

  // Sync Internal Documents
  if (!options.legalOnly && internalDocs.length > 0 && INTERNAL_KB_ID) {
    console.log("\n" + "=".repeat(50));
    console.log("📁 SYNCING INTERNAL DOCUMENTS TO INTERNAL KB");
    console.log("=".repeat(50));
    console.log(`   KB ID: ${INTERNAL_KB_ID}\n`);

    for (const doc of internalDocs) {
      // Skip if already synced (unless force flag)
      if (doc.syncedToKB && !options.force) {
        console.log(`⏭️  [SKIP] ${doc.name} (already synced)`);
        stats.internal.skipped++;
        continue;
      }

      console.log(`📄 Syncing: ${doc.name}`);

      // Get document content from S3
      const content = await getDocumentContent(doc.filename);
      if (!content) {
        console.log(`   ❌ No content available - skipping`);
        stats.internal.failed++;
        continue;
      }

      // Prepare sync document
      const syncDoc: SyncDocument = {
        id: doc.id,
        name: doc.name,
        filename: doc.filename,
        content,
        category: doc.category,
        entityId: doc.entityId,
      };

      // Sync to Internal KB
      const result = await syncDocumentToRAG(
        { kbId: INTERNAL_KB_ID, apiKey: API_KEY },
        syncDoc
      );

      if (result.success) {
        console.log(`   ✅ Synced successfully`);
        stats.internal.synced++;

        // Update document metadata
        const docIndex = updatedDocs.findIndex((d: DocumentMetadata) => d.id === doc.id);
        if (docIndex !== -1) {
          updatedDocs[docIndex] = {
            ...updatedDocs[docIndex],
            syncedToKB: true,
            kbDocumentId: result.kbDocumentId,
            syncedAt: new Date().toISOString(),
          };
        }
      } else {
        console.log(`   ❌ Sync failed: ${result.error}`);
        stats.internal.failed++;
      }
    }
  }

  // Update documents index with sync status
  console.log("\n📝 Updating documents index...");
  const success = await updateDocumentsIndex(updatedDocs);
  if (success) {
    console.log("✅ Documents index updated");
  } else {
    console.log("⚠️  Failed to update documents index");
  }

  return stats;
}

async function main() {
  const args = process.argv.slice(2);
  const options: SyncOptions = {
    legalOnly: args.includes("--legal-only"),
    internalOnly: args.includes("--internal-only"),
    force: args.includes("--force"),
  };

  if (options.legalOnly && options.internalOnly) {
    console.error("❌ Cannot use both --legal-only and --internal-only");
    process.exit(1);
  }

  try {
    const stats = await syncDocuments(options);

    console.log("\n" + "=".repeat(50));
    console.log("📊 SYNC SUMMARY");
    console.log("=".repeat(50));
    console.log("\n⚖️  Legal KB:");
    console.log(`   ✅ Synced: ${stats.legal.synced}`);
    console.log(`   ❌ Failed: ${stats.legal.failed}`);
    console.log(`   ⏭️  Skipped: ${stats.legal.skipped}`);

    console.log("\n📁 Internal KB:");
    console.log(`   ✅ Synced: ${stats.internal.synced}`);
    console.log(`   ❌ Failed: ${stats.internal.failed}`);
    console.log(`   ⏭️  Skipped: ${stats.internal.skipped}`);

    const totalSynced = stats.legal.synced + stats.internal.synced;
    const totalFailed = stats.legal.failed + stats.internal.failed;

    if (totalFailed > 0) {
      console.log(`\n⚠️  ${totalFailed} document(s) failed to sync.`);
    }

    if (totalSynced > 0) {
      console.log("\n🔧 Next steps:");
      console.log("1. Connect Knowledge Bases to agents in Lyzr Studio:");
      console.log("   - Legal Expert Agent → Legal KB");
      console.log("   - Internal Expert Agent → Internal KB");
      console.log("\n2. Restart your development server:");
      console.log("   bun run dev");
    }
  } catch (error) {
    console.error("\n❌ Error syncing documents:", error);
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

main();
