import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const isLocal = process.env.DYNAMODB_ENDPOINT?.includes("localhost") ||
                process.env.DYNAMODB_ENDPOINT?.includes("dynamodb-local");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
  ...(isLocal && {
    endpoint: process.env.DYNAMODB_ENDPOINT || "http://localhost:8000",
    credentials: {
      accessKeyId: "local",
      secretAccessKey: "local",
    },
  }),
});

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
  },
});

export { client as dynamoClient };
