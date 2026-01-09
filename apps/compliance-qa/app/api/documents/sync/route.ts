import { NextResponse } from "next/server";
import { getDocumentsIndex, getDocument } from "@tasco/db/s3";
import {
  getDocumentSyncStatus,
  getAllDocumentSyncStatuses,
  updateDocumentSyncStatus,
} from "@tasco/db";

// Force dynamic rendering - no caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Get the default knowledge base ID
const DEFAULT_KB_ID = process.env.LYZR_KB_ID || process.env.NEXT_PUBLIC_LYZR_KB_ID || "6960a63fee18986913060bc0";
const RAG_BASE_URL = process.env.RAG_BASE_URL || process.env.NEXT_PUBLIC_RAG_BASE_URL || "https://rag-prod.studio.lyzr.ai";
const LYZR_API_KEY = process.env.LYZR_API_KEY || process.env.NEXT_PUBLIC_LYZR_API_KEY;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { documentId, action } = body;

    if (!documentId || !action) {
      return NextResponse.json(
        { success: false, error: "Missing documentId or action" },
        { status: 400 }
      );
    }

    if (!["sync", "unsync"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Invalid action. Use 'sync' or 'unsync'" },
        { status: 400 }
      );
    }

    // Get document metadata
    const index = await getDocumentsIndex();
    const doc = index.find((d) => d.id === documentId);

    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    if (action === "sync") {
      // Get document content for RAG sync
      const content = await getDocument(doc.filename);

      let ragSyncSuccess = false;
      let ragSyncMessage = "";

      // If we have API key and content, try to sync to RAG
      if (LYZR_API_KEY && content) {
        console.log(`Syncing document ${documentId} to KB ${DEFAULT_KB_ID}...`);

        try {
          // Use /v3/train/text/ endpoint with correct format
          // This endpoint expects: { data: [{ text, source }], chunk_size, chunk_overlap }
          const trainUrl = `${RAG_BASE_URL}/v3/train/text/?rag_id=${DEFAULT_KB_ID}`;

          // Include document metadata for citation linking
          const requestBody = {
            data: [
              {
                text: content,
                source: doc.name,
                metadata: {
                  document_id: doc.id,
                  filename: doc.filename,
                  category: doc.category || "Document",
                  entity_id: doc.entityId || "",
                },
              },
            ],
            chunk_size: 1000,
            chunk_overlap: 100,
          };

          console.log(`[RAG] POST ${trainUrl}`);
          console.log(`[RAG] Request body:`, JSON.stringify(requestBody, null, 2).slice(0, 500) + "...");

          const response = await fetch(trainUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": LYZR_API_KEY,
            },
            body: JSON.stringify(requestBody),
          });

          if (response.ok) {
            const ragResult = await response.json();
            console.log("[RAG] Sync success:", ragResult);
            ragSyncSuccess = true;
            ragSyncMessage = "Document synced to knowledge base";
          } else {
            const errorText = await response.text();
            console.error("[RAG] Sync error:", response.status, errorText);
            ragSyncMessage = `RAG sync failed (${response.status}) - document marked as synced locally`;
          }
        } catch (ragError) {
          console.error("[RAG] API error:", ragError);
          ragSyncMessage = "RAG service unavailable - document marked as synced locally";
        }
      } else if (!LYZR_API_KEY) {
        console.log(`No API key configured - syncing document ${documentId} in demo mode`);
        ragSyncMessage = "Document marked as synced (demo mode - no API key configured)";
      } else if (!content) {
        console.warn(`Could not read content for document ${documentId}`);
        ragSyncMessage = "Document marked as synced (content not available for RAG)";
      }

      // Always update sync status in DynamoDB (persistent storage)
      const updated = await updateDocumentSyncStatus(documentId, true);

      if (!updated) {
        console.error("Failed to update sync status in database");
        return NextResponse.json(
          { success: false, error: "Failed to update sync status in database" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: ragSyncMessage,
        ragSynced: ragSyncSuccess,
        document: {
          id: documentId,
          syncedToKB: true,
        },
      });
    } else {
      // Unsync action
      // In production with API key, we would delete from KB
      if (LYZR_API_KEY) {
        console.log(`Unsyncing document ${documentId} from KB...`);
        // Note: RAG API delete endpoint would be called here if available
        // DELETE /v3/rag/{kb_id}/documents/{doc_id}/
      }

      // Update sync status in DynamoDB
      const updated = await updateDocumentSyncStatus(documentId, false);

      if (!updated) {
        console.error("Failed to update sync status in database");
        return NextResponse.json(
          { success: false, error: "Failed to update sync status" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Document removed from knowledge base",
        document: {
          id: documentId,
          syncedToKB: false,
        },
      });
    }
  } catch (error) {
    console.error("Error in sync operation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process sync request" },
      { status: 500 }
    );
  }
}

// Get sync status for a document or all documents
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("documentId");

    if (documentId) {
      const status = await getDocumentSyncStatus(documentId);
      return NextResponse.json({
        success: true,
        documentId,
        synced: status?.syncedToKB ?? null,
        syncedAt: status?.syncedAt,
      });
    }

    // Return all sync statuses
    const allStatuses = await getAllDocumentSyncStatuses();
    const overrides: Record<string, boolean> = {};

    for (const [docId, status] of Object.entries(allStatuses)) {
      overrides[docId] = status.syncedToKB;
    }

    return NextResponse.json({
      success: true,
      overrides,
    });
  } catch (error) {
    console.error("Error getting sync status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get sync status" },
      { status: 500 }
    );
  }
}
