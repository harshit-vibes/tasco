import type { EnhancedCitation, CitationLocation } from "@tasco/db";

export interface LyzrConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * RAG document from Lyzr module_outputs
 */
interface RagDocument {
  text: string;
  score?: number;
  metadata?: {
    source?: string;
    document_id?: string;
    filename?: string;
    category?: string;
    entity_id?: string;
    start_char_idx?: number;
    end_char_idx?: number;
    page_label?: string;
    section?: string;
  };
}

export interface ChatResponse {
  message: string;
  sources?: Array<{
    title: string;
    content: string;
  }>;
  /** Enhanced citations with document linking and metadata */
  citations?: EnhancedCitation[];
  /** Raw RAG documents from module_outputs */
  rawDocuments?: RagDocument[];
}

/**
 * Transform RAG documents to enhanced citations
 */
function transformToEnhancedCitations(
  documents: RagDocument[]
): EnhancedCitation[] {
  return documents.map((doc, index) => {
    const metadata = doc.metadata || {};
    const documentId = metadata.document_id || metadata.source || `doc-${index}`;

    // Build location from available metadata
    const location: CitationLocation = {};
    if (metadata.start_char_idx !== undefined) {
      location.charStart = metadata.start_char_idx;
    }
    if (metadata.end_char_idx !== undefined) {
      location.charEnd = metadata.end_char_idx;
    }
    if (metadata.page_label) {
      location.page = parseInt(metadata.page_label, 10) || undefined;
    }
    if (metadata.section) {
      location.section = metadata.section;
    }

    // Truncate excerpt for display (max 300 chars)
    const excerpt =
      doc.text.length > 300 ? doc.text.slice(0, 300) + "..." : doc.text;

    // Build deep link URL with highlight parameters
    let href = `/knowledge-base/${documentId}`;
    const params: string[] = [];
    if (location.charStart !== undefined && location.charEnd !== undefined) {
      params.push(`highlight=${location.charStart},${location.charEnd}`);
    }
    if (location.section) {
      href += `#section-${location.section}`;
    }
    if (params.length > 0) {
      href += `?${params.join("&")}`;
    }

    return {
      id: `citation_${index}_${Date.now()}`,
      documentId,
      documentName: metadata.source || "Unknown Document",
      filename: metadata.filename,
      location: Object.keys(location).length > 0 ? location : undefined,
      excerpt,
      metadata: {
        relevanceScore: doc.score,
        category: metadata.category || "Document",
        entityId: metadata.entity_id,
      },
      href,
    };
  });
}

class LyzrClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: LyzrConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://agent-prod.studio.lyzr.ai";
  }

  async chat(
    agentId: string,
    messages: ChatMessage[],
    sessionId?: string
  ): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/v3/inference/chat/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
      },
      body: JSON.stringify({
        agent_id: agentId,
        user_id: sessionId || "default",
        session_id: sessionId || "default",
        message: messages[messages.length - 1]?.content || "",
      }),
    });

    if (!response.ok) {
      throw new Error(`Lyzr API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Extract RAG documents from module_outputs
    const ragDocuments: RagDocument[] =
      data.module_outputs?.documents || data.module_outputs?.rag_documents || [];

    // Transform to enhanced citations
    const citations =
      ragDocuments.length > 0
        ? transformToEnhancedCitations(ragDocuments)
        : undefined;

    return {
      message: data.response || "",
      sources: data.sources,
      citations,
      rawDocuments: ragDocuments.length > 0 ? ragDocuments : undefined,
    };
  }

  async streamChat(
    agentId: string,
    messages: ChatMessage[],
    sessionId?: string,
    onChunk?: (chunk: string) => void
  ): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/v3/inference/stream/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
      },
      body: JSON.stringify({
        agent_id: agentId,
        user_id: sessionId || "default",
        session_id: sessionId || "default",
        message: messages[messages.length - 1]?.content || "",
      }),
    });

    if (!response.ok) {
      throw new Error(`Lyzr API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullMessage = "";

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullMessage += chunk;
        onChunk?.(chunk);
      }
    }

    return { message: fullMessage };
  }
}

export function createLyzrClient(config: LyzrConfig): LyzrClient {
  return new LyzrClient(config);
}

export { LyzrClient };
