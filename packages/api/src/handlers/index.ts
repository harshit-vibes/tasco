// API Handlers
export {
  handleListEntities,
  handleCreateEntity,
  type EntitiesHandlerConfig,
} from "./entities";

export {
  handleListConversations,
  handleCreateConversation,
  handleDeleteConversation,
  handleUpdateConversation,
} from "./conversations";

export {
  handleGetMessages,
  handleCreateMessage,
} from "./messages";

export {
  handleGetAgent,
  clearAgentCache,
  type AgentHandlerConfig,
} from "./agents";

// Agent Management (CRUD + Advanced Utilities)
export {
  // Basic CRUD
  createAgent,
  listAgents,
  getAgent,
  updateAgent,
  deleteAgent,
  findAgentByName,
  getOrCreateAgent,
  // Advanced utilities
  updateAgentFull,
  connectKnowledgeBase,
  disconnectKnowledgeBase,
  updateAgentInstructions,
  getAgentKnowledgeBase,
  updateAgentModel,
  addKnowledgeBase,
  removeKnowledgeBase,
  getAgentKnowledgeBases,
  // Types
  type AgentConfig,
  type Agent,
  type AgentManagementConfig,
  type AgentUpdateOptions,
  type AgentFeature,
  type RAGFeature,
} from "./agent-management";

export {
  createDocumentsHandler,
  type DocumentsHandlerConfig,
  type EntityConfig,
  type EnrichedDocument,
  type DocumentResponse,
  type DocumentMetadata,
} from "./documents";

export {
  createSyncHandler,
  getSyncConfigFromEnv,
  type SyncHandlerConfig,
} from "./documents-sync";

export { handleFileGet } from "./documents-file";

export { handlePdfGet } from "./documents-pdf";

export {
  createUploadHandler,
  type UploadHandlerConfig,
} from "./documents-upload";

// OCR handlers
export {
  handleOCR,
  handlePDFOCR,
  handleImageOCR,
  createOCRHandler,
  type OCRResult,
  type OCRHandlerConfig,
} from "./ocr";

// Notifications handlers
export {
  handleGetNotifications,
  handleNotificationActions,
  createNotificationsHandler,
  type NotificationsHandlerConfig,
  type CreateNotificationBody,
  type NotificationActionBody,
  // Re-exported from @tasco/db
  type Notification,
  type NotificationType,
  type NotificationCategory,
  type CreateNotificationInput,
} from "./notifications";

// Course handlers (e-learning)
export {
  // Course CRUD
  handleListCourses,
  handleGetCourse,
  handleCreateCourse,
  handleUpdateCourse,
  handleDeleteCourse,
  handlePublishCourse,
  handleGetFullCourse,
  // Module handlers
  handleListModules,
  handleCreateModule,
  // Lesson handlers
  handleListLessons,
  handleCreateLesson,
  // Quiz handlers
  handleGetQuiz,
  handleCreateQuiz,
  // Progress handlers
  handleGetProgress,
  handleEnrollCourse,
  handleUpdateLessonProgress,
  handleSubmitQuizAttempt,
  handleGetQuizAttempts,
} from "./courses";

// App Guide handlers (feature showcase / help carousel)
export {
  handleGetGuide,
  handlePutGuide,
  handleDeleteGuide,
  createGuideHandler,
  type GuideHandlerConfig,
  // Re-exported from @tasco/db
  type AppGuide,
  type CreateAppGuideInput,
  type GuideSlide,
  type GuideIcon,
  type GuideIconColor,
} from "./guide";
