import type {
  RAGConfig,
  KnowledgeBase,
  CreateKnowledgeBaseInput,
  Document,
  RAGQueryInput,
  RAGQueryResponse,
  RAGResult,
} from "./types";

const DEFAULT_RAG_URL = "https://rag-prod.studio.lyzr.ai";

export class RAGService {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: RAGConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || DEFAULT_RAG_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`RAG API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // Knowledge Base Operations

  async listKnowledgeBases(): Promise<KnowledgeBase[]> {
    const response = await this.request<{ configs?: KnowledgeBase[]; data?: KnowledgeBase[]; items?: KnowledgeBase[] }>(
      `/v3/rag/user/${this.apiKey}/`
    );
    // API returns configs array - map to our KnowledgeBase type
    const kbs = response.configs || response.data || response.items || [];
    return kbs.map((kb: any) => ({
      id: kb._id || kb.id,
      name: kb.collection_name?.slice(0, -13) || kb.collection_name, // Remove timestamp suffix
      collectionName: kb.collection_name,
      description: kb.description,
      vectorStoreProvider: kb.vector_store_provider,
      embeddingModel: kb.embedding_model,
      documentCount: kb.document_count || 0,
      createdAt: kb.created_at,
      updatedAt: kb.updated_at,
    }));
  }

  async createKnowledgeBase(input: CreateKnowledgeBaseInput): Promise<KnowledgeBase> {
    // Generate a collection name from the KB name
    const collectionName = input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "")
      + "_" + Date.now().toString(36);

    const response = await this.request<KnowledgeBase>("/v3/rag/", {
      method: "POST",
      body: JSON.stringify({
        collection_name: collectionName,
        description: input.description || "",
        user_id: this.apiKey,
        llm_credential_id: "lyzr_openai",
        embedding_credential_id: "lyzr_openai",
        vector_db_credential_id: "lyzr_qdrant",
        vector_store_provider: input.vectorStoreProvider || "Qdrant [Lyzr]",
        llm_model: "gpt-4o-mini",
        embedding_model: input.embeddingModel || "text-embedding-ada-002",
      }),
    });

    return {
      ...response,
      name: input.name,
      collectionName,
    };
  }

  async deleteKnowledgeBase(ragId: string): Promise<void> {
    await this.request(`/v3/rag/${ragId}/`, {
      method: "DELETE",
    });
  }

  // Document Operations

  async listDocuments(ragId: string): Promise<Document[]> {
    const response = await this.request<{ data?: Document[]; documents?: Document[] }>(
      `/v3/rag/documents/${ragId}/`
    );
    return response.data || response.documents || [];
  }

  async uploadDocument(
    ragId: string,
    file: File
  ): Promise<{ documents: Array<{ text: string; source: string }> }> {
    // Step 1: Parse the file
    const formData = new FormData();
    formData.append("file", file);
    formData.append("data_parser", "llmsherpa");

    const fileType = file.name.split(".").pop()?.toLowerCase() || "txt";
    const parseEndpoint = fileType === "pdf" ? "/v3/parse/pdf/" :
                         fileType === "docx" ? "/v3/parse/docx/" :
                         "/v3/parse/txt/";

    const parseResponse = await fetch(`${this.baseUrl}${parseEndpoint}`, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
      },
      body: formData,
    });

    if (!parseResponse.ok) {
      throw new Error(`Failed to parse document: ${parseResponse.statusText}`);
    }

    const parsed = await parseResponse.json();
    const documents = parsed.documents || parsed.data || [{ text: await file.text(), source: file.name }];

    // Step 2: Train the RAG with parsed documents
    await this.request(`/v3/rag/train/${ragId}/`, {
      method: "POST",
      body: JSON.stringify(documents),
    });

    return { documents };
  }

  async uploadText(
    ragId: string,
    text: string,
    source: string
  ): Promise<{ documents: Array<{ text: string; source: string }> }> {
    const documents = [{ text, source }];

    await this.request(`/v3/rag/train/${ragId}/`, {
      method: "POST",
      body: JSON.stringify(documents),
    });

    return { documents };
  }

  async deleteDocument(ragId: string, documentId: string): Promise<void> {
    await this.request(`/v3/rag/${ragId}/documents/${documentId}/`, {
      method: "DELETE",
    });
  }

  // RAG Query Operations

  async query(input: RAGQueryInput): Promise<RAGQueryResponse> {
    const params = new URLSearchParams({
      query: input.query,
      top_k: String(input.topK || 10),
      retrieval_type: input.retrievalType || "basic",
      score_threshold: String(input.scoreThreshold || 0),
    });

    const response = await this.request<{ results?: RAGResult[]; data?: RAGResult[] }>(
      `/v3/rag/${input.knowledgeBaseId}/retrieve/?${params.toString()}`
    );

    const results = response.results || response.data || [];

    return {
      results,
      query: input.query,
      knowledgeBaseId: input.knowledgeBaseId,
    };
  }
}

export function createRAGService(config: RAGConfig): RAGService {
  return new RAGService(config);
}
