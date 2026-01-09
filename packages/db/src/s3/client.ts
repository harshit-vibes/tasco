import { S3Client, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

// S3 Client configuration with explicit credentials
const s3Client = new S3Client({
  region: process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION || "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || "",
  },
});

export const DOCUMENTS_BUCKET = process.env.DOCUMENTS_BUCKET || "tasco-compliance-docs";

export { s3Client };

/**
 * Get a document from S3
 */
export async function getDocument(key: string): Promise<string | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: DOCUMENTS_BUCKET,
      Key: key,
    });
    const response = await s3Client.send(command);
    const content = await response.Body?.transformToString();
    return content || null;
  } catch (error) {
    console.error(`Error fetching document ${key}:`, error);
    return null;
  }
}

/**
 * Get JSON document from S3
 */
export async function getJsonDocument<T>(key: string): Promise<T | null> {
  const content = await getDocument(key);
  if (!content) return null;
  try {
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Error parsing JSON document ${key}:`, error);
    return null;
  }
}

/**
 * List all documents in a prefix
 */
export async function listDocuments(prefix: string = ""): Promise<string[]> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: DOCUMENTS_BUCKET,
      Prefix: prefix,
    });
    const response = await s3Client.send(command);
    return response.Contents?.map((obj) => obj.Key || "").filter(Boolean) || [];
  } catch (error) {
    console.error(`Error listing documents with prefix ${prefix}:`, error);
    return [];
  }
}

/**
 * Get the documents index (index.json)
 */
export interface DocumentMetadata {
  id: string;
  name: string;
  filename: string;
  type: string;
  category: string;
  entityId: string;
  effectiveDate: string;
  version: string;
  pages: number;
  language: string;
  tags: string[];
  summary: string;
  syncedToKB?: boolean; // Whether document is synced to knowledge base
  kbDocumentId?: string; // ID of the document in the knowledge base (if synced)
}

export async function getDocumentsIndex(): Promise<DocumentMetadata[]> {
  const index = await getJsonDocument<{ documents: DocumentMetadata[] }>("index.json");
  return index?.documents || [];
}

/**
 * Get entities from S3
 */
export interface S3Entity {
  id: string;
  name: string;
  type: "parent" | "holding" | "subsidiary";
  parentId: string | null;
  location: string;
  employees: number;
  industry: string;
}

export async function getEntitiesFromS3(): Promise<S3Entity[]> {
  const entities = await getJsonDocument<{ entities: S3Entity[] }>("entities.json");
  return entities?.entities || [];
}
