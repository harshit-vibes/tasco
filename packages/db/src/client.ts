import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

/**
 * Database Configuration
 *
 * Always uses production AWS DynamoDB (even for local development).
 * Credentials are loaded from AWS CLI (~/.aws/credentials) via default credential provider chain.
 *
 * Setup: aws configure --profile tasco (or use default profile)
 */
const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || "ap-southeast-1",
  // Uses default credential provider chain (AWS CLI, env vars, IAM roles)
});

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
});

export { client as dynamoClient };
