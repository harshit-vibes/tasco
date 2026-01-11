"use client";

import { ChatContainer } from "@tasco/ui";
import { useChatContext } from "@tasco/lyzr";
import { useTranslation } from "@tasco/i18n";
import { Sparkles, Database, AlertCircle, Zap, Clock } from "@tasco/ui/icons";

const SUGGESTED_QUESTIONS = [
  "What's the current sync status?",
  "Why is order #INO-12345 missing in Bravo?",
  "Show me today's sync discrepancies",
  "Which system has the most pending records?",
  "What caused the recent Bravo API timeout?",
  "List all orders stuck in pending state",
  "How can I resolve the revenue mismatch?",
  "Show me sync performance for the past hour",
];

export default function ChatPage() {
  const { t } = useTranslation("app");
  const { messages, isLoading, sendMessage } = useChatContext();

  const handleSend = async (content: string) => {
    if (!content.trim()) return;
    await sendMessage(content);
  };

  return (
    <div className="container py-8 h-[calc(100vh-8rem)]">
      <div className="flex flex-col h-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-[hsl(var(--ds-text-primary))]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--ds-flow-primary))]/10">
                <Sparkles className="h-5 w-5 text-[hsl(var(--ds-flow-primary))]" />
              </div>
              {t("chat.title", "Sync Assistant")}
            </h1>
            <p className="text-sm text-[hsl(var(--ds-text-secondary))] mt-1">
              {t("chat.subtitle", "Ask questions about sync status, discrepancies, and data issues")}
            </p>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 ds-card overflow-hidden">
          <ChatContainer
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSend}
            appTitle={t("chat.howCanIHelp", "How can I help you?")}
            appDescription={t("chat.helpDescription", "I can help you understand sync status, investigate discrepancies, and troubleshoot data synchronization issues.")}
            suggestedQuestions={SUGGESTED_QUESTIONS}
            inputPlaceholder={t("chat.inputPlaceholder", "Ask about sync status, discrepancies, or data issues...")}
            emptyIcon={
              <div className="relative">
                <div className="absolute inset-0 bg-[hsl(var(--ds-flow-primary))] blur-2xl opacity-20 rounded-full" />
                <div className="relative p-5 rounded-2xl bg-[hsl(var(--ds-flow-primary))]/10 border border-[hsl(var(--ds-flow-primary))]/30">
                  <Database className="h-12 w-12 text-[hsl(var(--ds-flow-primary))]" />
                </div>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
