import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

/**
 * Database Configuration
 *
 * Uses explicit credentials from NEXT_PUBLIC_AWS_* environment variables.
 * Falls back to TASCO_AWS_* if available.
 */

function createDocClient(): DynamoDBDocumentClient {
  const region = process.env.NEXT_PUBLIC_AWS_REGION || process.env.TASCO_AWS_REGION || process.env.AWS_REGION || "ap-southeast-1";
  const accessKeyId = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || process.env.TASCO_AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || process.env.TASCO_AWS_SECRET_ACCESS_KEY;

  // Log for debugging (remove after fixing)
  console.log("[DynamoDB Client] Region:", region);
  console.log("[DynamoDB Client] Has AccessKeyId:", !!accessKeyId, accessKeyId?.substring(0, 8));
  console.log("[DynamoDB Client] Has SecretKey:", !!secretAccessKey);

  const clientConfig: any = { region };

  if (accessKeyId && secretAccessKey) {
    clientConfig.credentials = { accessKeyId, secretAccessKey };
    console.log("[DynamoDB Client] Using explicit credentials");
  } else {
    console.log("[DynamoDB Client] Using default credential chain");
  }

  const client = new DynamoDBClient(clientConfig);

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
