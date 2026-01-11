/**
 * Document Sync Utilities for Lyzr RAG
 * High-level functions for syncing documents to/from knowledge bases
 */

const DEFAULT_RAG_URL = "https://rag-prod.studio.lyzr.ai";

/**
 * Configuration for document sync operations
 */
export interface DocumentSyncConfig {
  /** The knowledge base ID to sync to */
  kbId: string;
  /** Lyzr API key */
  apiKey: string;
  /** Base URL for RAG API (optional, defaults to production) */
  baseUrl?: string;
  /** Chunk size for text splitting (default: 1000) */
  chunkSize?: number;
  /** Chunk overlap for text splitting (default: 100) */
  chunkOverlap?: number;
}

/**
 * Document to sync to RAG
 */
export interface SyncDocument {
  /** Unique document identifier */
  id: string;
  /** Document display name */
  name: string;
  /** Original filename */
  filename: string;
  /** Document text content */
  content: string;
  /** Document category (optional) */
  category?: string;
  /** Entity ID (optional) */
  entityId?: string;
}

/**
 * Result of a sync operation
 */
export interface SyncResult {
  success: boolean;
  /** KB document ID if sync was successful */
  kbDocumentId?: string;
  /** Error message if sync failed */
  error?: string;
  /** Human-readable message about the operation */
  message?: string;
}

/**
 * Sync a document to the Lyzr RAG knowledge base
 *
 * @example
 * ```ts
 * const result = await syncDocumentToRAG(
 *   { kbId: "abc123", apiKey: "xxx" },
 *   { id: "doc-1", name: "Policy", filename: "policy.md", content: "..." }
 * );
 * if (result.success) {
 *   console.log("Synced:", result.kbDocumentId);
 * }
 * ```
 */
export async function syncDocumentToRAG(
  config: DocumentSyncConfig,
  document: SyncDocument
): Promise<SyncResult> {
  const {
    kbId,
    apiKey,
    baseUrl = DEFAULT_RAG_URL,
    chunkSize = 1000,
    chunkOverlap = 100,
  } = config;

  if (!apiKey) {
    return {
      success: false,
      error: "No API key configured",
      message: "Document marked as synced (demo mode - no API key configured)",
    };
  }

  if (!document.content) {
    return {
      success: false,
      error: "No content to sync",
      message: "Document marked as synced (content not available for RAG)",
    };
  }

  try {
    // Use /v3/train/text/ endpoint with metadata
    const trainUrl = `${baseUrl}/v3/train/text/?rag_id=${kbId}`;

    const requestBody = {
      data: [
        {
          text: document.content,
          source: document.name,
          metadata: {
            document_id: document.id,
            filename: document.filename,
            category: document.category || "Document",
            entity_id: document.entityId || "",
          },
        },
      ],
      chunk_size: chunkSize,
      chunk_overlap: chunkOverlap,
    };

    console.log(`[RAG] Syncing document ${document.id} to KB ${kbId}...`);

    const response = await fetch(trainUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("[RAG] Sync success:", result);
      return {
        success: true,
        kbDocumentId: result.id || document.id,
        message: "Document synced to knowledge base",
      };
    } else {
      const errorText = await response.text();
      console.error("[RAG] Sync error:", response.status, errorText);
      return {
        success: false,
        error: `RAG sync failed: ${response.status}`,
        message: `RAG sync failed (${response.status}) - document marked as synced locally`,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[RAG] API error:", error);
    return {
      success: false,
      error: errorMessage,
      message: "RAG service unavailable - document marked as synced locally",
    };
  }
}

/**
 * Resync (delete old + create new) a document in the Lyzr RAG knowledge base
 * Used when a document is updated (new S3 version) and needs to be re-indexed
 *
 * This is the correct way to update a document in RAG:
 * 1. Delete the old document using the stored kbDocumentId
 * 2. Create a new document with the updated content
 * 3. Return the new kbDocumentId for storage
 *
 * @example
 * ```ts
 * const result = await resyncDocumentToRAG(
 *   { kbId: "abc123", apiKey: "xxx" },
 *   { id: "doc-1", name: "Policy", filename: "policy.md", content: "..." },
 *   "old-kb-doc-123" // Previous kbDocumentId to delete
 * );
 * if (result.success) {
 *   // Store the new kbDocumentId
 *   console.log("New KB doc ID:", result.kbDocumentId);
 * }
 * ```
 */
export async function resyncDocumentToRAG(
  config: DocumentSyncConfig,
  document: SyncDocument,
  oldKbDocumentId: string
): Promise<SyncResult> {
  const { kbId, apiKey, baseUrl = DEFAULT_RAG_URL } = config;

  console.log(`[RAG] Resyncing document ${document.id} (replacing ${oldKbDocumentId})...`);

  // Step 1: Delete the old document from RAG
  if (oldKbDocumentId && apiKey) {
    const deleteResult = await unsyncDocumentFromRAG(
      { kbId, apiKey, baseUrl },
      oldKbDocumentId
    );

    if (!deleteResult.success) {
      console.warn(`[RAG] Failed to delete old document ${oldKbDocumentId}, proceeding with sync:`, deleteResult.error);
      // Continue anyway - the old document may already be deleted or not exist
    } else {
      console.log(`[RAG] Deleted old document ${oldKbDocumentId}`);
    }
  }

  // Step 2: Create new document with updated content
  const syncResult = await syncDocumentToRAG(config, document);

  if (syncResult.success) {
    console.log(`[RAG] Resync complete. New KB doc ID: ${syncResult.kbDocumentId}`);
    return {
      ...syncResult,
      message: "Document resynced to knowledge base (old version replaced)",
    };
  }

  return syncResult;
}

/**
 * Unsync (remove) a document from the Lyzr RAG knowledge base
 *
 * @example
 * ```ts
 * const result = await unsyncDocumentFromRAG(
 *   { kbId: "abc123", apiKey: "xxx" },
 *   "kb-doc-123"
 * );
 * ```
 */
export async function unsyncDocumentFromRAG(
  config: DocumentSyncConfig,
  kbDocumentId: string
): Promise<SyncResult> {
  const { kbId, apiKey, baseUrl = DEFAULT_RAG_URL } = config;

  if (!apiKey) {
    return {
      success: true,
      message: "Document marked as unsynced (demo mode - no API key configured)",
    };
  }

  try {
    console.log(`[RAG] Unsyncing document ${kbDocumentId} from KB ${kbId}...`);

    // Note: The RAG API delete endpoint
    const deleteUrl = `${baseUrl}/v3/rag/${kbId}/documents/${kbDocumentId}/`;

    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        "x-api-key": apiKey,
      },
    });

    if (response.ok || response.status === 404) {
      // 404 is acceptable - document may already be deleted
      console.log("[RAG] Unsync success");
      return {
        success: true,
        message: "Document removed from knowledge base",
      };
    } else {
      const errorText = await response.text();
      console.error("[RAG] Unsync error:", response.status, errorText);
      return {
        success: false,
        error: `RAG unsync failed: ${response.status}`,
        message: `Failed to remove from RAG (${response.status})`,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[RAG] Unsync API error:", error);
    return {
      success: false,
      error: errorMessage,
      message: "RAG service unavailable during unsync",
    };
  }
}
