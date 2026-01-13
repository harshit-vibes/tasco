/**
 * Tasco Knowledge Base Registry
 * Central registry of all Lyzr RAG knowledge bases across apps
 */

import type {
  AppId,
  KnowledgeBaseConfig,
  DocumentCategory,
  KnowledgeBaseStatus,
} from "./types";

/**
 * Document categories for routing documents to appropriate KBs
 */
export const DOCUMENT_CATEGORIES: Record<string, DocumentCategory> = {
  // Legal documents - Vietnamese laws, decrees, circulars
  _LEGAL: {
    key: "_LEGAL",
    name: "Legal Framework",
    description: "Vietnamese laws, decrees, circulars, and regulatory documents",
    targetKB: "compliance-qa:legal-kb",
    entityId: "_LEGAL",
    filePatterns: ["*.pdf", "*.docx"],
  },

  // Internal company documents
  Charter: {
    key: "Charter",
    name: "Company Charters",
    description: "Company charters and bylaws",
    targetKB: "compliance-qa:internal-kb",
    filePatterns: ["*charter*.pdf", "*dieu-le*.pdf"],
  },

  Minutes: {
    key: "Minutes",
    name: "Meeting Minutes",
    description: "Meeting minutes and board resolutions",
    targetKB: "compliance-qa:internal-kb",
    filePatterns: ["*minutes*.pdf", "*bien-ban*.pdf"],
  },

  Contract: {
    key: "Contract",
    name: "Contracts",
    description: "Contracts and agreements",
    targetKB: "compliance-qa:internal-kb",
    filePatterns: ["*contract*.pdf", "*hop-dong*.pdf"],
  },

  Policy: {
    key: "Policy",
    name: "Internal Policies",
    description: "Internal policies and procedures",
    targetKB: "compliance-qa:internal-kb",
    filePatterns: ["*policy*.pdf", "*quy-che*.pdf", "*quy-dinh*.pdf"],
  },
};

/**
 * Central registry of all knowledge bases
 */
export const KNOWLEDGE_BASES: Record<string, KnowledgeBaseConfig> = {
  // ============================================
  // COMPLIANCE-QA APP - Document Governance
  // ============================================

  "compliance-qa:internal-kb": {
    key: "compliance-qa:internal-kb",
    id: "6960a63fee18986913060bc0",
    name: "compliance-qa-internal",
    description:
      "Tasco Group internal policies, charters, meeting minutes, contracts",
    appId: "compliance-qa",
    vectorStoreProvider: "Qdrant [Lyzr]",
    embeddingModel: "text-embedding-3-small",
    connectedAgents: ["compliance-qa:internal-expert"],
    documentCount: 8,
    s3Path: "compliance-qa/internal/",
    documentFilter: {
      excludeCategories: ["_LEGAL"],
    },
    retrievalConfig: {
      topK: 5,
      similarityThreshold: 0.5,
      retrievalType: "basic",
      includeMetadata: true,
      chunkSize: 1000,
      chunkOverlap: 200,
    },
    envVar: "LYZR_KB_ID",
    status: "active",
    collectionName: "compliance-qa-internal",
  },

  "compliance-qa:legal-kb": {
    key: "compliance-qa:legal-kb",
    id: "69613775979041509ac8ee82",
    name: "compliance-qa-legal",
    description: "Vietnamese laws, decrees, circulars, and regulatory documents",
    appId: "compliance-qa",
    vectorStoreProvider: "Qdrant [Lyzr]",
    embeddingModel: "text-embedding-3-small",
    connectedAgents: ["compliance-qa:legal-expert"],
    documentCount: 6,
    s3Path: "compliance-qa/legal/",
    documentFilter: {
      includeCategories: ["_LEGAL"],
      includeEntities: ["_LEGAL"],
    },
    retrievalConfig: {
      topK: 5,
      similarityThreshold: 0.5,
      retrievalType: "basic",
      includeMetadata: true,
      chunkSize: 1000,
      chunkOverlap: 200,
    },
    envVar: "LYZR_LEGAL_KB_ID",
    status: "active",
    collectionName: "compliance-qa-legal",
  },

  // ============================================
  // E-LEARNING APP - Course Content
  // ============================================

  "e-learning:courses-kb": {
    key: "e-learning:courses-kb",
    id: null,
    name: "e-learning-courses",
    description: "Course materials, training content, and learning resources",
    appId: "e-learning",
    vectorStoreProvider: "Qdrant [Lyzr]",
    embeddingModel: "text-embedding-3-small",
    connectedAgents: ["e-learning:main"],
    documentCount: 0,
    s3Path: "e-learning/courses/",
    retrievalConfig: {
      topK: 5,
      similarityThreshold: 0.5,
      retrievalType: "basic",
      includeMetadata: true,
      chunkSize: 1000,
      chunkOverlap: 200,
    },
    envVar: "LYZR_COURSES_KB_ID",
    status: "pending",
  },

  // ============================================
  // CUSTOMER-LIFECYCLE APP - Business Data (Leads, Customers, Campaigns)
  // ============================================

  "customer-lifecycle:business-data-kb": {
    key: "customer-lifecycle:business-data-kb",
    id: "6963e00cee18986913061152",
    name: "customer-lifecycle-business-data",
    description: "Customer lifecycle business data - leads, customers, campaigns from DynamoDB",
    appId: "customer-lifecycle",
    vectorStoreProvider: "Qdrant [Lyzr]",
    embeddingModel: "text-embedding-ada-002",
    connectedAgents: ["customer-lifecycle:assistant"],
    documentCount: 0,
    s3Path: "customer-lifecycle/business-data/",
    retrievalConfig: {
      topK: 10,
      similarityThreshold: 0.5,
      retrievalType: "basic",
      includeMetadata: true,
      chunkSize: 500,
      chunkOverlap: 100,
    },
    envVar: "LYZR_BUSINESS_DATA_KB_ID",
    status: "active",
    collectionName: "customer_lifecycle_business_data_test",
  },

  // ============================================
  // SALES-PRICING APP - Pricing Data
  // ============================================

  "sales-pricing:pricing-kb": {
    key: "sales-pricing:pricing-kb",
    id: null,
    name: "sales-pricing-pricing",
    description: "Insurance pricing rules, rate tables, and underwriting guidelines",
    appId: "sales-pricing",
    vectorStoreProvider: "Qdrant [Lyzr]",
    embeddingModel: "text-embedding-3-small",
    connectedAgents: ["sales-pricing:main"],
    documentCount: 0,
    s3Path: "sales-pricing/pricing/",
    retrievalConfig: {
      topK: 5,
      similarityThreshold: 0.6,
      retrievalType: "basic",
      includeMetadata: true,
      chunkSize: 800,
      chunkOverlap: 150,
    },
    envVar: "LYZR_PRICING_KB_ID",
    status: "pending",
  },

  // ============================================
  // RISK-RADAR APP - Risk Data
  // ============================================

  "risk-radar:risk-kb": {
    key: "risk-radar:risk-kb",
    id: null,
    name: "risk-radar-risk",
    description: "Risk assessment models, profitability data, and actuarial reports",
    appId: "risk-radar",
    vectorStoreProvider: "Qdrant [Lyzr]",
    embeddingModel: "text-embedding-3-small",
    connectedAgents: ["risk-radar:main"],
    documentCount: 0,
    s3Path: "risk-radar/risk/",
    retrievalConfig: {
      topK: 5,
      similarityThreshold: 0.5,
      retrievalType: "basic",
      includeMetadata: true,
      chunkSize: 1000,
      chunkOverlap: 200,
    },
    envVar: "LYZR_RISK_KB_ID",
    status: "pending",
  },

  // ============================================
  // SALES-ORDER APP - Order Processing
  // ============================================

  "sales-order:orders-kb": {
    key: "sales-order:orders-kb",
    id: null,
    name: "sales-order-orders",
    description: "Order templates, product catalog, and processing guidelines",
    appId: "sales-order",
    vectorStoreProvider: "Qdrant [Lyzr]",
    embeddingModel: "text-embedding-3-small",
    connectedAgents: ["sales-order:extraction", "sales-order:validation"],
    documentCount: 0,
    s3Path: "sales-order/orders/",
    retrievalConfig: {
      topK: 3,
      similarityThreshold: 0.6,
      retrievalType: "basic",
      includeMetadata: true,
      chunkSize: 500,
      chunkOverlap: 100,
    },
    envVar: "LYZR_ORDERS_KB_ID",
    status: "pending",
  },

  // ============================================
  // DATA-SYNC APP - Sync Documentation
  // ============================================

  "data-sync:sync-kb": {
    key: "data-sync:sync-kb",
    id: null,
    name: "data-sync-sync",
    description: "Data synchronization rules, API documentation, and mapping schemas",
    appId: "data-sync",
    vectorStoreProvider: "Qdrant [Lyzr]",
    embeddingModel: "text-embedding-3-small",
    connectedAgents: ["data-sync:main"],
    documentCount: 0,
    s3Path: "data-sync/sync/",
    retrievalConfig: {
      topK: 5,
      similarityThreshold: 0.5,
      retrievalType: "basic",
      includeMetadata: true,
      chunkSize: 800,
      chunkOverlap: 150,
    },
    envVar: "LYZR_SYNC_KB_ID",
    status: "pending",
  },

  // ============================================
  // PROMOTION-CONTROL APP - Promotions
  // ============================================

  "promotion-control:promotions-kb": {
    key: "promotion-control:promotions-kb",
    id: null,
    name: "promotion-control-promotions",
    description: "Promotion rules, conflict detection guidelines, and campaign history",
    appId: "promotion-control",
    vectorStoreProvider: "Qdrant [Lyzr]",
    embeddingModel: "text-embedding-3-small",
    connectedAgents: [],
    documentCount: 0,
    s3Path: "promotion-control/promotions/",
    retrievalConfig: {
      topK: 5,
      similarityThreshold: 0.5,
      retrievalType: "basic",
      includeMetadata: true,
      chunkSize: 800,
      chunkOverlap: 150,
    },
    envVar: "LYZR_PROMOTIONS_KB_ID",
    status: "pending",
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get a knowledge base by key
 */
export function getKB(key: string): KnowledgeBaseConfig | undefined {
  return KNOWLEDGE_BASES[key];
}

/**
 * Get all knowledge bases for an app
 */
export function getKBsByApp(appId: AppId): KnowledgeBaseConfig[] {
  return Object.values(KNOWLEDGE_BASES).filter((kb) => kb.appId === appId);
}

/**
 * Get all knowledge bases with a specific status
 */
export function getKBsByStatus(status: KnowledgeBaseStatus): KnowledgeBaseConfig[] {
  return Object.values(KNOWLEDGE_BASES).filter((kb) => kb.status === status);
}

/**
 * Get all pending (not yet created) knowledge bases
 */
export function getPendingKBs(): KnowledgeBaseConfig[] {
  return getKBsByStatus("pending");
}

/**
 * Get all active knowledge bases
 */
export function getActiveKBs(): KnowledgeBaseConfig[] {
  return getKBsByStatus("active");
}

/**
 * Get knowledge bases connected to a specific agent
 */
export function getKBsForAgent(agentKey: string): KnowledgeBaseConfig[] {
  return Object.values(KNOWLEDGE_BASES).filter((kb) =>
    kb.connectedAgents.includes(agentKey)
  );
}

/**
 * Get the target KB for a document category
 */
export function getTargetKBForCategory(categoryKey: string): KnowledgeBaseConfig | undefined {
  const category = DOCUMENT_CATEGORIES[categoryKey];
  if (!category) return undefined;
  return KNOWLEDGE_BASES[category.targetKB];
}

/**
 * Get document category by key
 */
export function getDocumentCategory(key: string): DocumentCategory | undefined {
  return DOCUMENT_CATEGORIES[key];
}

/**
 * Get all document categories for a target KB
 */
export function getCategoriesForKB(kbKey: string): DocumentCategory[] {
  return Object.values(DOCUMENT_CATEGORIES).filter(
    (category) => category.targetKB === kbKey
  );
}

/**
 * Get environment variable mapping for all KBs
 */
export function getKBEnvVarMappings(): Array<{
  envVar: string;
  kbKey: string;
  kbId: string | null;
  appId: AppId;
}> {
  return Object.values(KNOWLEDGE_BASES).map((kb) => ({
    envVar: kb.envVar,
    kbKey: kb.key,
    kbId: kb.id,
    appId: kb.appId,
  }));
}

/**
 * Generate .env.local content for an app's KBs
 */
export function generateKBEnvContent(appId: AppId): string {
  const kbs = getKBsByApp(appId);
  if (kbs.length === 0) return "# No knowledge bases configured for this app\n";

  const lines = [
    `# Knowledge Base IDs for ${appId}`,
    `# Generated from @tasco/agents knowledge-bases registry`,
    "",
  ];

  for (const kb of kbs) {
    lines.push(`# ${kb.name}: ${kb.description}`);
    lines.push(`${kb.envVar}=${kb.id || ""}`);
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Get KB statistics summary
 */
export function getKBStats(): {
  total: number;
  active: number;
  pending: number;
  syncing: number;
  disabled: number;
  byApp: Record<AppId, number>;
  totalDocuments: number;
} {
  const kbs = Object.values(KNOWLEDGE_BASES);
  const byApp = {} as Record<AppId, number>;

  for (const kb of kbs) {
    byApp[kb.appId] = (byApp[kb.appId] || 0) + 1;
  }

  return {
    total: kbs.length,
    active: kbs.filter((kb) => kb.status === "active").length,
    pending: kbs.filter((kb) => kb.status === "pending").length,
    syncing: kbs.filter((kb) => kb.status === "syncing").length,
    disabled: kbs.filter((kb) => kb.status === "disabled").length,
    byApp,
    totalDocuments: kbs.reduce((sum, kb) => sum + kb.documentCount, 0),
  };
}
