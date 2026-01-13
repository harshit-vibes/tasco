import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

/**
 * Database Configuration
 *
 * CRITICAL: Creates a fresh client each time to ensure environment variables
 * are read at runtime, not at module initialization during build.
 *
 * For AWS Amplify SSR, env vars are only available at runtime, not build time.
 */

function createDocumentClient(): DynamoDBDocumentClient {
  const region = process.env.NEXT_PUBLIC_AWS_REGION || process.env.AWS_REGION || "ap-southeast-1";
  const accessKeyId = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || "";
  const secretAccessKey = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || "";

  const client = new DynamoDBClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      convertEmptyValues: true,
      removeUndefinedValues: true,
      convertClassInstanceToMap: true,
    },
  });
}

// Singleton instance - created lazily on first access
let _docClient: DynamoDBDocumentClient | null = null;

/**
 * Get the DynamoDB Document Client (singleton)
 * Creates the client on first call to ensure env vars are available.
 */
export function getDocClient(): DynamoDBDocumentClient {
  if (!_docClient) {
    _docClient = createDocumentClient();
  }
  return _docClient;
}

/**
 * docClient - backwards compatible export
 * IMPORTANT: This is a getter-based object, not the actual client.
 * All property accesses are proxied to the lazily-created singleton.
 */
export const docClient = {
  send: (...args: Parameters<DynamoDBDocumentClient["send"]>) => getDocClient().send(...args),
};

/**
 * dynamoClient - backwards compatible export (raw DynamoDB client)
 */
export const dynamoClient = {
  send: (...args: Parameters<DynamoDBClient["send"]>) => {
    const region = process.env.NEXT_PUBLIC_AWS_REGION || process.env.AWS_REGION || "ap-southeast-1";
    const accessKeyId = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || "";
    const secretAccessKey = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || "";
    const client = new DynamoDBClient({ region, credentials: { accessKeyId, secretAccessKey } });
    return client.send(...args);
  },
};
