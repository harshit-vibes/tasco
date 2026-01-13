import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

/**
 * Database Configuration
 *
 * Always uses production AWS DynamoDB (even for local development).
 * Credentials are provided via:
 * 1. TASCO_AWS_* environment variables (for Amplify - can't use AWS_ prefix)
 * 2. AWS_* environment variables (standard - local dev)
 * 3. NEXT_PUBLIC_AWS_* environment variables (fallback)
 */
const client = new DynamoDBClient({
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

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
});

export { client as dynamoClient };
