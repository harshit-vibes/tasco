import { NextResponse } from "next/server";
import {
  listDocumentVersions,
  restoreDocumentVersion,
  getSignedUrlForVersion,
  getDocumentSyncStatus,
  getDocumentsIndex,
} from "@tasco/db";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Extract document ID from S3 key
 * Key format: documents/{id}/{filename}
 */
function extractDocumentIdFromKey(key: string): string | null {
  const parts = key.split("/");
  if (parts.length >= 2 && parts[0] === "documents") {
    return parts[1];
  }
  return null;
}

/**
 * GET - List versions of a document
 * Query params:
 * - key: S3 key of the document (required)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { success: false, error: "Document key is required" },
        { status: 400 }
      );
    }

    const versions = await listDocumentVersions(key);

    // Convert dates to ISO strings for JSON serialization
    const serializedVersions = versions.map((v) => ({
      ...v,
      lastModified: v.lastModified.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      versions: serializedVersions,
    });
  } catch (error) {
    console.error("Error fetching document versions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch document versions" },
      { status: 500 }
    );
  }
}

/**
 * POST - Restore a specific version or get signed URL for version
 * Body:
 * - action: "restore" | "getUrl"
 * - key: S3 key of the document
 * - versionId: Version ID to restore/get URL for
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, key, versionId } = body;

    if (!key || !versionId) {
      return NextResponse.json(
        { success: false, error: "Document key and versionId are required" },
        { status: 400 }
      );
    }

    if (action === "restore") {
      const success = await restoreDocumentVersion(key, versionId);

      if (!success) {
        return NextResponse.json(
          { success: false, error: "Failed to restore version" },
          { status: 500 }
        );
      }

      // Check if document was synced to RAG and trigger resync
      // The sync endpoint will automatically use resync since document was previously synced
      let resynced = false;
      try {
        // Try to find document ID from the key or from index
        const index = await getDocumentsIndex();
        const doc = index.find(d => d.filename === key || key.includes(d.filename));

        if (doc) {
          const syncStatus = await getDocumentSyncStatus(doc.id);

          if (syncStatus?.syncedToKB) {
            console.log(`[Versions] Document ${doc.id} was synced, triggering resync after version restore...`);

            // Trigger sync via the sync endpoint - it will automatically use resync
            // since the document was previously synced
            const syncResponse = await fetch(new URL("/api/documents/sync", request.url).toString(), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ documentId: doc.id, action: "sync" }),
            });

            if (syncResponse.ok) {
              resynced = true;
              console.log(`[Versions] Resync completed for document ${doc.id}`);
            } else {
              console.warn(`[Versions] Resync failed for document ${doc.id}`);
            }
          }
        }
      } catch (syncError) {
        console.warn("[Versions] Error checking/triggering resync:", syncError);
        // Don't fail the restore operation if resync fails
      }

      return NextResponse.json({
        success: true,
        message: `Version ${versionId} restored successfully`,
        resynced,
      });
    }

    if (action === "getUrl") {
      const url = await getSignedUrlForVersion(key, versionId);

      if (!url) {
        return NextResponse.json(
          { success: false, error: "Failed to generate signed URL" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        url,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Use 'restore' or 'getUrl'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error processing version action:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process version action" },
      { status: 500 }
    );
  }
}
