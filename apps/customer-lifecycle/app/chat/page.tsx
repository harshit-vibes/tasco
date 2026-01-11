"use client";

import { ChatContainer } from "@tasco/ui";
import { useChatContext } from "@tasco/lyzr";

const SUGGESTED_QUESTIONS = [
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
  const { messages = [], isLoading, sendMessage } = useChatContext();

  return (
    <ChatContainer
      messages={messages}
      isLoading={isLoading}
      onSendMessage={sendMessage}
      appTitle="Customer Lifecycle AI Assistant"
      appDescription="Ask me anything about leads, customers, marketing campaigns, and lifecycle management. I can analyze trends, recommend actions, and help you optimize your customer engagement strategy."
      suggestedQuestions={SUGGESTED_QUESTIONS}
    />
  );
}
