"use client";

import { ChatContainer } from "@tasco/ui";
import { useChatContext } from "@tasco/lyzr";

const SUGGESTED_QUESTIONS = [
  "What is the approval process for contracts over $100,000?",
  "What is the travel expense reimbursement policy?",
  "Who has authority to approve capital expenditures?",
];

export default function Home() {
  const { messages = [], isLoading, sendMessage } = useChatContext();

  return (
    <ChatContainer
      messages={messages}
      isLoading={isLoading}
      onSendMessage={sendMessage}
      appTitle="Compliance QA"
      appDescription="Ask me anything about Tasco Group's policies, regulations, and compliance documents."
      suggestedQuestions={SUGGESTED_QUESTIONS}
    />
  );
}
