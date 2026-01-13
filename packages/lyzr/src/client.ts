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
  /** Validation result from validation agent */
  validation?: ValidationResult;
}

/**
 * Validation result from the validation agent
 */
export interface ValidationResult {
  /** Overall validation score (0-100) */
  score: number;
  /** Human-readable rationale for the score */
  rationale: string;
  /** Whether the response includes citations */
  hasCitations: boolean;
  /** Quality of citations (0-100) */
  citationQuality: number;
  /** How complete the response is (0-100) */
  responseCompleteness: number;
  /** Whether the response is grounded in documents */
  isGrounded: boolean;
  /** Confidence level: high, medium, low */
  confidence: "high" | "medium" | "low";
  // Compliance-specific fields (optional)
  /** Compliance risk level: high, medium, low */
  complianceRisk?: "high" | "medium" | "low";
  /** Potential conflicts between documents and regulations */
  potentialConflicts?: string[];
  /** Required clauses that may be missing */
  missingClauses?: string[];
  /** Law articles cited in the response */
  lawArticlesCited?: string[];
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

    // Build deep link URL
    const href = `/knowledge-base?doc=${encodeURIComponent(documentId)}`;

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

  // Get headers with required Origin + User-Agent for Lyzr API
  private getHeaders(includeContentType = false) {
    return {
      "x-api-key": this.apiKey,
      "Origin": "https://studio.lyzr.ai",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/json",
      ...(includeContentType && { "Content-Type": "application/json" }),
    };
  }

  async chat(
    agentId: string,
    messages: ChatMessage[],
    sessionId?: string
  ): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/v3/inference/chat/`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify({
        agent_id: agentId,
        user_id: sessionId || "default",
        session_id: sessionId || "default",
        message: messages[messages.length - 1]?.content || "",
      }),
    });

    if (!response.ok) {
      let errorMessage = `Lyzr API error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = `Lyzr API error: ${response.status} - ${errorData.message || errorData.detail || JSON.stringify(errorData)}`;
      } catch {
        // Response body wasn't JSON
      }
      console.error("[Lyzr Client] Chat error:", errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Extract RAG documents from module_outputs
    const ragDocuments: RagDocument[] =
      data.module_outputs?.documents || data.module_outputs?.rag_documents || [];

    console.log("[Lyzr Client] Raw response:", JSON.stringify(data, null, 2).slice(0, 500));
    console.log("[Lyzr Client] RAG documents count:", ragDocuments.length);

    // Transform to enhanced citations
    const citations =
      ragDocuments.length > 0
        ? transformToEnhancedCitations(ragDocuments)
        : undefined;

    console.log("[Lyzr Client] Citations:", citations?.length || 0);

    return {
      message: data.response || "",
      sources: data.sources,
      citations,
      rawDocuments: ragDocuments.length > 0 ? ragDocuments : undefined,
    };
  }

  /**
   * Validate a response using a validation agent
   * The validation agent should return JSON with validation metrics
   */
  async validateResponse(
    validationAgentId: string,
    query: string,
    response: string,
    citations: EnhancedCitation[] | undefined,
    sessionId?: string
  ): Promise<ValidationResult> {
    const hasCitations = (citations?.length || 0) > 0;

    // Format citations for the validator
    const citationSummary = citations?.length
      ? citations.map((c, i) => `[${i + 1}] ${c.documentName} (relevance: ${(c.metadata?.relevanceScore || 0).toFixed(2)})`).join("\n")
      : "None";

    const validationPrompt = `Validate the following AI response for a compliance Q&A system.

QUERY: ${query}

RESPONSE: ${response}

CITATIONS PROVIDED: ${hasCitations ? "Yes" : "No"}
${hasCitations ? `\nSOURCE DOCUMENTS:\n${citationSummary}` : ""}

Evaluate the response and return ONLY a valid JSON object (no markdown, no explanation) with these fields:
{
  "score": <number 0-100, overall quality score>,
  "rationale": "<string, 1-2 sentence explanation of the score>",
  "hasCitations": <boolean, whether response references source documents>,
  "citationQuality": <number 0-100, quality and relevance of citations>,
  "responseCompleteness": <number 0-100, how complete is the answer>,
  "isGrounded": <boolean, is the response grounded in the provided documents>,
  "confidence": "<'high'|'medium'|'low', confidence in the answer>"
}

Scoring guidelines:
- 90-100: Excellent - Complete answer grounded in source documents
- 70-89: Good - Mostly complete, well-supported by sources
- 50-69: Fair - Partial answer or weak source support
- 0-49: Poor - Incomplete or not grounded in sources`;

    try {
      const response = await fetch(`${this.baseUrl}/v3/inference/chat/`, {
        method: "POST",
        headers: this.getHeaders(true),
        body: JSON.stringify({
          agent_id: validationAgentId,
          user_id: sessionId || "validator",
          session_id: `validation-${Date.now()}`,
          message: validationPrompt,
        }),
      });

      if (!response.ok) {
        let errorMessage = `Validation API error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = `Validation API error: ${response.status} - ${errorData.message || errorData.detail || JSON.stringify(errorData)}`;
        } catch {
          // Response body wasn't JSON
        }
        console.error("[Lyzr Client] Validation error:", errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const responseText = data.response || "";

      console.log("[Lyzr Client] Validation raw response:", responseText);

      // Parse JSON from response (handle potential markdown wrapping)
      let jsonStr = responseText;
      if (responseText.includes("```json")) {
        jsonStr = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      } else if (responseText.includes("```")) {
        jsonStr = responseText.replace(/```\n?/g, "");
      }

      const validationResult = JSON.parse(jsonStr.trim());

      return {
        score: validationResult.score ?? 0,
        rationale: validationResult.rationale ?? "Unable to validate",
        hasCitations: validationResult.hasCitations ?? hasCitations,
        citationQuality: validationResult.citationQuality ?? 0,
        responseCompleteness: validationResult.responseCompleteness ?? 0,
        isGrounded: validationResult.isGrounded ?? false,
        confidence: validationResult.confidence ?? "low",
      };
    } catch (err) {
      console.error("[Lyzr Client] Validation error:", err);
      // Return a default validation result on error
      return {
        score: 50,
        rationale: "Validation could not be completed",
        hasCitations,
        citationQuality: hasCitations ? 50 : 0,
        responseCompleteness: 50,
        isGrounded: hasCitations,
        confidence: "low",
      };
    }
  }

  async streamChat(
    agentId: string,
    messages: ChatMessage[],
    sessionId?: string,
    onChunk?: (chunk: string) => void
  ): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/v3/inference/stream/`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify({
        agent_id: agentId,
        user_id: sessionId || "default",
        session_id: sessionId || "default",
        message: messages[messages.length - 1]?.content || "",
      }),
    });

    if (!response.ok) {
      let errorMessage = `Lyzr API error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = `Lyzr API error: ${response.status} - ${errorData.message || errorData.detail || JSON.stringify(errorData)}`;
      } catch {
        // Response body wasn't JSON
      }
      console.error("[Lyzr Client] Stream error:", errorMessage);
      throw new Error(errorMessage);
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
