import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

/**
 * Database Configuration
 *
 * Always uses production AWS DynamoDB (even for local development).
 * Credentials can be provided via:
 * 1. NEXT_PUBLIC_AWS_* environment variables (for Amplify/Vercel)
 * 2. AWS CLI (~/.aws/credentials) via default credential provider chain
 * 3. IAM roles (for AWS services)
 */
const accessKeyId = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY;

const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || "ap-southeast-1",
  ...(accessKeyId && secretAccessKey
    ? {
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      }
    : {}),
});

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
});

export { client as dynamoClient };
