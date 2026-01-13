import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

/**
 * Database Configuration
 *
 * Uses lazy initialization to ensure environment variables are available at runtime
 * (not just at build time). This is critical for AWS Amplify SSR deployments.
 *
 * Credentials are provided via:
 * 1. TASCO_AWS_* environment variables (for Amplify - can't use AWS_ prefix)
 * 2. AWS_* environment variables (standard - local dev)
 * 3. NEXT_PUBLIC_AWS_* environment variables (fallback)
 */
let _client: DynamoDBClient | null = null;
let _docClient: DynamoDBDocumentClient | null = null;

function getClient(): DynamoDBClient {
  if (!_client) {
    _client = new DynamoDBClient({
      region:
        process.env.TASCO_AWS_REGION ||
        process.env.AWS_REGION ||
        process.env.NEXT_PUBLIC_AWS_REGION ||
        "ap-southeast-1",
      credentials: {
        accessKeyId:
          process.env.TASCO_AWS_ACCESS_KEY_ID ||
          process.env.AWS_ACCESS_KEY_ID ||
          process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID ||
          "",
        secretAccessKey:
          process.env.TASCO_AWS_SECRET_ACCESS_KEY ||
          process.env.AWS_SECRET_ACCESS_KEY ||
          process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY ||
          "",
      },
    });
  }
  return _client;
}

function getDocClient(): DynamoDBDocumentClient {
  if (!_docClient) {
    _docClient = DynamoDBDocumentClient.from(getClient(), {
      marshallOptions: {
        convertEmptyValues: true,
        removeUndefinedValues: true,
        convertClassInstanceToMap: true,
      },
    });
  }
  return _docClient;
}

// Export getters that lazily initialize clients
export const docClient = {
  send: <T>(command: Parameters<DynamoDBDocumentClient["send"]>[0]) =>
    getDocClient().send(command) as T,
};

export const dynamoClient = {
  send: <T>(command: Parameters<DynamoDBClient["send"]>[0]) =>
    getClient().send(command) as T,
};
