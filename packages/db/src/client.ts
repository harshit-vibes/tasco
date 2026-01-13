import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

/**
 * Database Configuration
 *
 * Creates a FRESH client for every send() call.
 * This is critical for AWS Amplify SSR where env vars are only available at runtime.
 *
 * The AWS SDK's default credential provider chain returns "Could not load credentials"
 * when explicit credentials are empty strings. So we need to ensure credentials
 * are read at the exact moment of the API call, not during module initialization.
 */

function createFreshDocClient(): DynamoDBDocumentClient {
  // Read env vars at call time, not module load time
  const region = process.env.NEXT_PUBLIC_AWS_REGION || process.env.AWS_REGION || "ap-southeast-1";
  const accessKeyId = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

  // Only provide credentials if they exist
  const credentials = accessKeyId && secretAccessKey
    ? { accessKeyId, secretAccessKey }
    : undefined;

  const client = new DynamoDBClient({
    region,
    ...(credentials && { credentials }),
  });

  return DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      convertEmptyValues: true,
      removeUndefinedValues: true,
      convertClassInstanceToMap: true,
    },
  });
}

/**
 * docClient - creates a fresh client for each send() call
 * This ensures env vars are always read at runtime
 */
export const docClient = {
  send: (...args: Parameters<DynamoDBDocumentClient["send"]>) => {
    const client = createFreshDocClient();
    return client.send(...args);
  },
};

/**
 * dynamoClient - creates a fresh client for each send() call
 */
export const dynamoClient = {
  send: (...args: Parameters<DynamoDBClient["send"]>) => {
    const region = process.env.NEXT_PUBLIC_AWS_REGION || process.env.AWS_REGION || "ap-southeast-1";
    const accessKeyId = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
    const credentials = accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined;
    const client = new DynamoDBClient({ region, ...(credentials && { credentials }) });
    return client.send(...args);
  },
};

// Also export the factory function for cases where more control is needed
export function getDocClient(): DynamoDBDocumentClient {
  return createFreshDocClient();
}
