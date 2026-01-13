import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

/**
 * Database Configuration
 *
 * Uses the AWS SDK default credential provider chain which automatically
 * uses IAM role credentials on AWS Amplify SSR.
 *
 * Region is determined from:
 * 1. NEXT_PUBLIC_AWS_REGION env var
 * 2. AWS_REGION env var (set by Amplify)
 * 3. Default: ap-southeast-1
 */

function createDocClient(): DynamoDBDocumentClient {
  const region = process.env.NEXT_PUBLIC_AWS_REGION || process.env.AWS_REGION || "ap-southeast-1";

  const client = new DynamoDBClient({ region });

  return DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      convertEmptyValues: true,
      removeUndefinedValues: true,
      convertClassInstanceToMap: true,
    },
  });
}

// Singleton - created lazily on first access
let _docClient: DynamoDBDocumentClient | null = null;

/**
 * Get the DynamoDB Document Client singleton
 */
export function getDocClient(): DynamoDBDocumentClient {
  if (!_docClient) {
    _docClient = createDocClient();
  }
  return _docClient;
}

/**
 * docClient - backwards compatible export
 * Delegates to the lazily-created singleton
 */
export const docClient = {
  send: (...args: Parameters<DynamoDBDocumentClient["send"]>) => getDocClient().send(...args),
};

/**
 * dynamoClient - raw DynamoDB client
 */
export const dynamoClient = {
  send: (...args: Parameters<DynamoDBClient["send"]>) => {
    const region = process.env.NEXT_PUBLIC_AWS_REGION || process.env.AWS_REGION || "ap-southeast-1";
    const client = new DynamoDBClient({ region });
    return client.send(...args);
  },
};
