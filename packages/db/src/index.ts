export { docClient, dynamoClient } from "./client";
export * from "./tables";
export * from "./chat";
// Re-export entities selectively to avoid PaginatedResult conflict
export {
  listEntities,
  getEntity,
  createEntity,
  updateEntity,
  deleteEntity,
  batchCreateEntities,
  isEntitiesEmpty,
} from "./entities";
export type {
  Entity,
  EntityType,
  EntityMetadata,
  CreateEntityInput,
  UpdateEntityInput,
} from "./entities";

// Documents sync status
export {
  getDocumentSyncStatus,
  getAllDocumentSyncStatuses,
  updateDocumentSyncStatus,
  deleteDocumentSyncStatus,
} from "./documents";
export type { DocumentSyncStatus } from "./documents";
