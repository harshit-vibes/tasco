"use client";

import { ChatContainer } from "@tasco/ui";
import { useChatContext } from "@tasco/lyzr";

const SUGGESTED_QUESTIONS = [
  "What types of motor insurance coverage does Tasco offer?",
  "How do I process a new insurance claim?",
  "What are the key regulatory requirements for insurance in Vietnam?",
  "Explain the difference between comprehensive and third-party coverage.",
  "What documents are required for claim submission?",
  "How is insurance premium calculated for motor vehicles?",
];

export default function ChatPage() {
  const { messages = [], isLoading, sendMessage } = useChatContext();

  return (
    <ChatContainer
      messages={messages}
      isLoading={isLoading}
      onSendMessage={sendMessage}
      appTitle="AI Learning Assistant"
      appDescription="Ask me anything about insurance products, claims processing, regulations, and compliance. I'm trained on all Tasco Insurance training materials."
      suggestedQuestions={SUGGESTED_QUESTIONS}
    />
  );
}
