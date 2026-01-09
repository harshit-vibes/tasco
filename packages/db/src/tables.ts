// DynamoDB Table Names
export const TABLES = {
  CONVERSATIONS: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-conversations`
    : "tasco-conversations",
  MESSAGES: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-messages`
    : "tasco-messages",
  ENTITIES: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-entities`
    : "tasco-entities",
  DOCUMENTS: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-documents`
    : "tasco-documents",
} as const;

// Key prefixes for composite keys
export const KEY_PREFIXES = {
  CONVERSATION: "CONV",
  MESSAGE: "MSG",
  ENTITY: "ENT",
  DOCUMENT: "DOC",
} as const;

// Helper to build partition keys
export const buildConversationPK = (appId: string, entityId: string): string =>
  `${KEY_PREFIXES.CONVERSATION}#${appId}#${entityId}`;

export const buildMessagePK = (conversationId: string): string =>
  `${KEY_PREFIXES.MESSAGE}#${conversationId}`;

export const buildMessageSK = (timestamp: string, messageId: string): string =>
  `${timestamp}#${messageId}`;

// Entity key builders (simple key structure - pk is type, sk is id)
export const buildEntityPK = (type: string): string =>
  `${KEY_PREFIXES.ENTITY}#${type}`;

export const ENTITY_ALL_PK = `${KEY_PREFIXES.ENTITY}#ALL`;
