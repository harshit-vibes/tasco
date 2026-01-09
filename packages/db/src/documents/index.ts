import { docClient } from "../client";
import { TABLES, KEY_PREFIXES } from "../tables";
import {
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

// Document sync status interface
export interface DocumentSyncStatus {
  documentId: string;
  syncedToKB: boolean;
  kbDocumentId?: string;
  syncedAt?: string;
  unsyncedAt?: string;
}

// Build document key
const buildDocumentKey = (documentId: string) => ({
  pk: `${KEY_PREFIXES.DOCUMENT}#SYNC`,
  sk: documentId,
});

/**
 * Get sync status for a document
 */
export async function getDocumentSyncStatus(
  documentId: string
): Promise<DocumentSyncStatus | null> {
  try {
    const key = buildDocumentKey(documentId);
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLES.DOCUMENTS,
        Key: key,
      })
    );

    if (!result.Item) {
      return null;
    }

    return {
      documentId: result.Item.sk,
      syncedToKB: result.Item.syncedToKB ?? false,
      kbDocumentId: result.Item.kbDocumentId,
      syncedAt: result.Item.syncedAt,
      unsyncedAt: result.Item.unsyncedAt,
    };
  } catch (error) {
    console.error("Error getting document sync status:", error);
    return null;
  }
}

/**
 * Get sync status for all documents
 */
export async function getAllDocumentSyncStatuses(): Promise<
  Record<string, DocumentSyncStatus>
> {
  try {
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLES.DOCUMENTS,
        KeyConditionExpression: "pk = :pk",
        ExpressionAttributeValues: {
          ":pk": `${KEY_PREFIXES.DOCUMENT}#SYNC`,
        },
      })
    );

    const statuses: Record<string, DocumentSyncStatus> = {};
    for (const item of result.Items || []) {
      statuses[item.sk] = {
        documentId: item.sk,
        syncedToKB: item.syncedToKB ?? false,
        kbDocumentId: item.kbDocumentId,
        syncedAt: item.syncedAt,
        unsyncedAt: item.unsyncedAt,
      };
    }

    return statuses;
  } catch (error) {
    console.error("Error getting all document sync statuses:", error);
    return {};
  }
}

/**
 * Update sync status for a document
 */
export async function updateDocumentSyncStatus(
  documentId: string,
  syncedToKB: boolean,
  kbDocumentId?: string
): Promise<boolean> {
  try {
    const key = buildDocumentKey(documentId);
    const now = new Date().toISOString();

    await docClient.send(
      new PutCommand({
        TableName: TABLES.DOCUMENTS,
        Item: {
          ...key,
          documentId,
          syncedToKB,
          kbDocumentId: kbDocumentId || null,
          ...(syncedToKB ? { syncedAt: now } : { unsyncedAt: now }),
          updatedAt: now,
        },
      })
    );

    return true;
  } catch (error) {
    console.error("Error updating document sync status:", error);
    return false;
  }
}

/**
 * Delete sync status for a document
 */
export async function deleteDocumentSyncStatus(
  documentId: string
): Promise<boolean> {
  try {
    const key = buildDocumentKey(documentId);
    await docClient.send(
      new DeleteCommand({
        TableName: TABLES.DOCUMENTS,
        Key: key,
      })
    );
    return true;
  } catch (error) {
    console.error("Error deleting document sync status:", error);
    return false;
  }
}
