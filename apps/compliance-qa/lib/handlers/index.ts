/**
 * MongoDB-based API Handlers for compliance-qa
 *
 * These handlers replace the DynamoDB-based handlers from @tasco/api
 * as part of the migration to MongoDB + Vercel.
 */

// Conversation handlers
export {
  handleListConversations,
  handleCreateConversation,
  handleDeleteConversation,
  handleUpdateConversation,
} from "./conversations";

// Message handlers
export {
  handleListMessages,
  handleCreateMessage,
  handleDeleteMessage,
} from "./messages";

// Guide handlers
export {
  handleGetGuide,
  handlePutGuide,
  handleDeleteGuide,
} from "./guides";

// Entity handlers
export {
  handleListEntities,
  handleGetEntity,
} from "./entities";
