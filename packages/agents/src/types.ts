/**
 * Tasco Agent Types
 * Centralized type definitions for Lyzr agent management
 */

// App identifiers
export type AppId =
  | "compliance-qa"
  | "e-learning"
  | "sales-order"
  | "customer-lifecycle"
  | "sales-pricing"
  | "risk-radar"
  | "data-sync"
  | "promotion-control";

// Agent roles
export type AgentRole =
  | "main"           // Primary chat agent for an app
  | "orchestrator"   // Routes to sub-agents
  | "expert"         // Specialized knowledge agent
  | "validator"      // Response quality validator
  | "generator"      // Content generation agent
  | "analyzer";      // Data analysis agent (e.g., lead scoring)

// Agent status
export type AgentStatus =
  | "active"         // Agent created and operational
  | "pending"        // Agent defined but not yet created
  | "disabled"       // Agent temporarily disabled
  | "deprecated";    // Agent marked for removal

// Model options
export type ModelId =
  | "gpt-4o"
  | "gpt-4o-mini"
  | "gpt-4-turbo"
  | "gpt-3.5-turbo"
  | "claude-3-opus"
  | "claude-3-sonnet"
  | "claude-3-haiku";

// Output format options
export type OutputFormat = "text" | "json" | "markdown";

// JSON output schema for structured responses
export interface JSONOutputConfig {
  /** Enable JSON output mode */
  enabled: boolean;
  /** JSON schema for validation (optional) */
  schema?: Record<string, unknown>;
  /** Strict schema validation */
  strict?: boolean;
}

// RAG configuration options
export interface RAGConfig {
  /** Knowledge base ID */
  knowledgeBaseId: string;
  /** Number of documents to retrieve */
  topK?: number;
  /** Minimum similarity threshold (0-1) */
  similarityThreshold?: number;
  /** Include document metadata in context */
  includeMetadata?: boolean;
  /** Chunk overlap for retrieval */
  chunkOverlap?: number;
  /** Maximum context tokens */
  maxContextTokens?: number;
}

/**
 * Agent configuration definition
 */
export interface AgentConfig {
  /** Unique key for the agent (e.g., "compliance-qa:orchestrator") */
  key: string;

  /** Lyzr agent ID (null if not yet created) */
  id: string | null;

  /** Human-readable name */
  name: string;

  /** Agent role */
  role: AgentRole;

  /** App this agent belongs to */
  appId: AppId;

  /** LLM model to use */
  model: ModelId;

  /** Temperature (0-1) */
  temperature: number;

  /** System prompt for the agent */
  systemPrompt: string;

  /** Environment variable name for the agent ID */
  envVar: string;

  /** Whether this is a public (client-side) or private (server-side) agent */
  visibility: "public" | "private";

  /** Connected knowledge base IDs */
  connectedKBs: string[];

  /** Sub-agents for orchestrator agents */
  subAgents?: string[];

  /** Current status */
  status: AgentStatus;

  /** Description of the agent's purpose */
  description: string;

  /** Feature this agent powers */
  feature: string;

  /** Output format configuration */
  outputFormat?: OutputFormat;

  /** JSON output configuration (when outputFormat is "json") */
  jsonOutput?: JSONOutputConfig;

  /** RAG configuration for knowledge-base-connected agents */
  ragConfig?: RAGConfig;

  /** Custom agent features (tools, memory, etc.) */
  features?: AgentFeature[];
}

/**
 * Knowledge base status
 */
export type KnowledgeBaseStatus =
  | "active"      // KB created and operational
  | "pending"     // KB defined but not yet created
  | "syncing"     // KB is being synced with documents
  | "disabled";   // KB temporarily disabled

/**
 * Vector store provider options
 */
export type VectorStoreProvider =
  | "Qdrant [Lyzr]"
  | "Pinecone"
  | "Weaviate"
  | "ChromaDB";

/**
 * Embedding model options
 */
export type EmbeddingModel =
  | "text-embedding-ada-002"
  | "text-embedding-3-small"
  | "text-embedding-3-large";

/**
 * Document category definition
 */
export interface DocumentCategory {
  /** Category key (e.g., "_LEGAL", "Charter", "Policy") */
  key: string;

  /** Human-readable name */
  name: string;

  /** Description of what documents belong here */
  description: string;

  /** Target KB key for documents in this category */
  targetKB: string;

  /** Special entity ID for this category (optional) */
  entityId?: string;

  /** File patterns to match (e.g., ["*.pdf", "*.docx"]) */
  filePatterns?: string[];
}

/**
 * RAG retrieval configuration
 */
export interface RetrievalConfig {
  /** Number of documents to retrieve (default: 5) */
  topK: number;

  /** Minimum similarity threshold (0-1, default: 0.5) */
  similarityThreshold: number;

  /** Retrieval type */
  retrievalType: "basic" | "mmr" | "hyde" | "rrf";

  /** Include document metadata in results */
  includeMetadata: boolean;

  /** Chunk size for document splitting */
  chunkSize: number;

  /** Chunk overlap for document splitting */
  chunkOverlap: number;
}

/**
 * Knowledge base configuration
 */
export interface KnowledgeBaseConfig {
  /** Unique key for the KB (e.g., "compliance-qa:legal-kb") */
  key: string;

  /** Lyzr KB ID (null if not yet created) */
  id: string | null;

  /** Human-readable name */
  name: string;

  /** Description of what this KB contains */
  description: string;

  /** App this KB belongs to */
  appId: AppId;

  /** Vector store provider */
  vectorStoreProvider: VectorStoreProvider;

  /** Embedding model */
  embeddingModel: EmbeddingModel;

  /** Connected agent keys */
  connectedAgents: string[];

  /** Document count (tracked separately) */
  documentCount: number;

  /** S3 bucket path for documents (optional) */
  s3Path?: string;

  /** Document filter rules */
  documentFilter?: {
    /** Only include documents with these categories */
    includeCategories?: string[];
    /** Exclude documents with these categories */
    excludeCategories?: string[];
    /** Only include documents from these entities */
    includeEntities?: string[];
    /** Exclude documents from these entities */
    excludeEntities?: string[];
  };

  /** Default retrieval configuration */
  retrievalConfig: RetrievalConfig;

  /** Environment variable name for the KB ID */
  envVar: string;

  /** Current status */
  status: KnowledgeBaseStatus;

  /** Lyzr collection name (auto-generated) */
  collectionName?: string;

  /** Created timestamp */
  createdAt?: string;

  /** Last sync timestamp */
  lastSyncedAt?: string;
}

/**
 * KB creation input (for Lyzr RAG API)
 */
export interface KBCreateInput {
  name: string;
  description?: string;
  vectorStoreProvider?: VectorStoreProvider;
  embeddingModel?: EmbeddingModel;
}

/**
 * KB setup result
 */
export interface KBSetupResult {
  key: string;
  kbId: string;
  created: boolean;
  name: string;
  collectionName?: string;
  error?: string;
}

/**
 * Document sync input
 */
export interface DocumentSyncInput {
  documentId: string;
  name: string;
  filename: string;
  content: string;
  category?: string;
  entityId?: string;
}

/**
 * Document sync result
 */
export interface DocumentSyncResult {
  documentId: string;
  kbDocumentId?: string;
  synced: boolean;
  error?: string;
}

/**
 * App agent configuration
 */
export interface AppAgentConfig {
  appId: AppId;
  appName: string;
  description: string;
  agents: AgentConfig[];
  knowledgeBases: KnowledgeBaseConfig[];
  status: "active" | "mock" | "not-started";
}

/**
 * Central registry type
 */
export interface AgentRegistry {
  version: string;
  lastUpdated: string;
  apiUrl: string;
  apps: Record<AppId, AppAgentConfig>;
}

/**
 * Agent creation input (for Lyzr API)
 */
export interface AgentCreateInput {
  name: string;
  system_prompt: string;
  model?: ModelId;
  temperature?: number;
  features?: AgentFeature[];
}

/**
 * Agent feature configuration
 */
export interface AgentFeature {
  type: "rag" | "tools" | "memory";
  config?: Record<string, unknown>;
}

/**
 * RAG feature configuration
 */
export interface RAGFeatureConfig {
  type: "rag";
  config: {
    knowledge_base_id: string;
    top_k?: number;
    similarity_threshold?: number;
  };
}

/**
 * Setup result
 */
export interface AgentSetupResult {
  key: string;
  agentId: string;
  created: boolean;
  name: string;
  error?: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  agentKey: string;
  field: string;
  message: string;
}

export interface ValidationWarning {
  agentKey: string;
  field: string;
  message: string;
}

/**
 * Environment variable mapping
 */
export interface EnvVarMapping {
  envVar: string;
  agentKey: string;
  agentId: string | null;
  appId: AppId;
}
