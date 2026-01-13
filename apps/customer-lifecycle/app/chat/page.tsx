"use client";

import { useEffect, useRef, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChatContainer } from "@tasco/ui";
import { useChatContext } from "@tasco/lyzr";
import { useMultiAgent } from "../../lib/multi-agent-context";
import { AgentSelector, AgentIndicator } from "../../components/agent-selector";

// Default suggested questions (fallback)
const DEFAULT_SUGGESTED_QUESTIONS = [
  "Which leads should I prioritize contacting today?",
  "Show me customers at high risk of churning.",
  "What are the best next actions for my VIP customers?",
  "Analyze the recent drop in customer satisfaction scores.",
  "Which marketing campaigns have the highest ROI?",
  "What vehicles are trending among new leads?",
  "Give me a summary of this week's lead quality.",
  "How can I improve conversion rates for warm leads?",
];

export default function ChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { messages = [], isLoading, sendMessage } = useChatContext();
  const { selectedAgent, isMultiAgentEnabled } = useMultiAgent();
  const hasProcessedQuery = useRef(false);

  // Get suggested questions based on selected agent
  const suggestedQuestions = useMemo(() => {
    if (selectedAgent?.suggestedQuestions?.length > 0) {
      return selectedAgent.suggestedQuestions;
    }
    return DEFAULT_SUGGESTED_QUESTIONS;
  }, [selectedAgent]);

  // Get app title and description based on selected agent
  const { appTitle, appDescription } = useMemo(() => {
    if (!selectedAgent) {
      return {
        appTitle: "Customer Lifecycle AI Assistant",
        appDescription:
          "Ask me anything about leads, customers, marketing campaigns, and lifecycle management.",
      };
    }

    const Icon = selectedAgent.icon;
    const iconName = selectedAgent.name;

    switch (selectedAgent.key) {
      case "customer-lifecycle:lead-expert":
        return {
          appTitle: "Lead Expert",
          appDescription:
            "I specialize in lead scoring, qualification strategies, and conversion optimization. Ask me about prioritizing leads, analyzing sources, and improving conversion rates.",
        };
      case "customer-lifecycle:customer-expert":
        return {
          appTitle: "Customer Expert",
          appDescription:
            "I specialize in customer retention, churn prediction, and lifetime value optimization. Ask me about at-risk customers, VIP analysis, and engagement strategies.",
        };
      case "customer-lifecycle:inventory-expert":
        return {
          appTitle: "Inventory Expert",
          appDescription:
            "I specialize in vehicle inventory tracking, aging analysis, and supply chain visibility. Ask me about stock levels, import orders, and inventory health.",
        };
      case "customer-lifecycle:campaign-expert":
        return {
          appTitle: "Campaign Expert",
          appDescription:
            "I specialize in marketing ROI analysis, campaign performance, and customer segmentation. Ask me about campaign effectiveness, channel comparisons, and targeting strategies.",
        };
      default:
        return {
          appTitle: "Customer Lifecycle AI Assistant",
          appDescription:
            "Ask me anything about leads, customers, marketing campaigns, and lifecycle management. I can analyze trends, recommend actions, and help you optimize your customer engagement strategy.",
        };
    }
  }, [selectedAgent]);

  // Handle query parameter from Command K / AI Command Bar
  useEffect(() => {
    const query = searchParams.get("q");

    if (query && !hasProcessedQuery.current && !isLoading) {
      hasProcessedQuery.current = true;

      // Send the message - sendMessage automatically creates a new conversation if needed
      const handleQuery = async () => {
        try {
          await sendMessage(query);
          // Clear the URL parameter to prevent re-sending on refresh
          router.replace("/chat", { scroll: false });
        } catch (error) {
          console.error("Failed to process query:", error);
          hasProcessedQuery.current = false; // Allow retry on error
        }
      };

      handleQuery();
    }
  }, [searchParams, sendMessage, router, isLoading]);

  return (
    <div className="flex flex-col h-full">
      {/* Agent Selector Header */}
      {isMultiAgentEnabled && (
        <div className="flex items-center justify-between px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Chat with:</span>
            <AgentSelector showFullName />
          </div>
          {messages.length > 0 && <AgentIndicator />}
        </div>
      )}

      {/* Chat Container */}
      <div className="flex-1 min-h-0">
        <ChatContainer
          messages={messages}
          isLoading={isLoading}
          onSendMessage={sendMessage}
          appTitle={appTitle}
          appDescription={appDescription}
          suggestedQuestions={suggestedQuestions}
        />
      </div>
    </div>
  );
}
