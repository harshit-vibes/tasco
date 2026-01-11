"use client";

import { useTranslation } from "@tasco/i18n";
import { ChatContainer } from "@tasco/ui";
import { useChatContext } from "@tasco/lyzr";
import { Radar } from "@tasco/ui/icons";

export default function AssistantPage() {
  const { t } = useTranslation("app");
  const { messages, isLoading, sendMessage } = useChatContext();

  const handleSend = async (content: string) => {
    if (!content.trim()) return;
    await sendMessage(content);
  };

  // Get suggested questions from translations
  const suggestedQuestions = t("assistant.suggestions.items", {
    returnObjects: true,
  }) as string[];

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10">
            <Radar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{t("assistant.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("assistant.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <ChatContainer
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSend}
        appTitle={t("assistant.empty.title")}
        appDescription={t("assistant.empty.description")}
        suggestedQuestions={suggestedQuestions}
        inputPlaceholder={t("assistant.placeholder")}
        emptyIcon={
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-sm">
            <Radar className="h-8 w-8 text-primary" />
          </div>
        }
      />
    </div>
  );
}
