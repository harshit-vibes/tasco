export interface LyzrConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatResponse {
  message: string;
  sources?: Array<{
    title: string;
    content: string;
  }>;
}

class LyzrClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: LyzrConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://agent.api.lyzr.app";
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
    return {
      message: data.response || data.message || "",
      sources: data.sources,
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
