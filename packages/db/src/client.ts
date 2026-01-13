import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

/**
 * Database Configuration
 *
 * Uses lazy initialization to ensure environment variables are available at runtime
 * (not just at build time). This is critical for AWS Amplify SSR deployments.
 *
 * Credentials are provided via:
 * 1. NEXT_PUBLIC_AWS_* environment variables (available at runtime in Amplify)
 * 2. AWS_* environment variables (standard - local dev)
 */
let _client: DynamoDBClient | null = null;
let _docClient: DynamoDBDocumentClient | null = null;

function createClient(): DynamoDBClient {
  const region = process.env.NEXT_PUBLIC_AWS_REGION || process.env.AWS_REGION || "ap-southeast-1";
  const accessKeyId = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || "";
  const secretAccessKey = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || "";

  return new DynamoDBClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export function getDocClient(): DynamoDBDocumentClient {
  if (!_docClient) {
    if (!_client) {
      _client = createClient();
    }
    _docClient = DynamoDBDocumentClient.from(_client, {
      marshallOptions: {
        convertEmptyValues: true,
        removeUndefinedValues: true,
        convertClassInstanceToMap: true,
      },
    });
  }
  return _docClient;
}

export function getDynamoClient(): DynamoDBClient {
  if (!_client) {
    _client = createClient();
  }
  return _client;
}

// For backward compatibility - these are proxies that delegate to lazy-initialized clients
export const docClient = new Proxy({} as DynamoDBDocumentClient, {
  get(_, prop) {
    const client = getDocClient();
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export const dynamoClient = new Proxy({} as DynamoDBClient, {
  get(_, prop) {
    const client = getDynamoClient();
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
