"use client";

import { useState } from "react";
import { ChatContainer, DocumentPreviewSheet, Button } from "@tasco/ui";
import { FileDown } from "@tasco/ui/icons";
import { useChatContext } from "@tasco/lyzr";
import { useTranslation } from "@tasco/i18n";
import { exportChatToPDF } from "@tasco/export";

export default function Home() {
  const { t } = useTranslation("compliance");
  const { messages = [], isLoading, sendMessage } = useChatContext();

  // Export handler
  const handleExportPDF = () => {
    exportChatToPDF(messages, {
      title: t("exportTitle", "Compliance Analysis Report"),
      entityName: "All Companies",
    });
  };

  // Get translated suggested questions
  const suggestedQuestions = [
    t("suggestedQuestions.approval"),
    t("suggestedQuestions.travel"),
    t("suggestedQuestions.capital"),
  ];

  // Document preview state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDocId, setPreviewDocId] = useState<string | null>(null);
  const [previewDocName, setPreviewDocName] = useState<string | null>(null);

  // Handle citation click - open preview sheet instead of navigating
  const handleCitationNavigate = (href: string) => {
    console.log("[Citation] Opening preview for href:", href);

    let docId = "";
    let docName = "";

    // Parse href to extract doc info
    if (href.startsWith("/knowledge-base?")) {
      // New format: /knowledge-base?doc=X
      const url = new URL(href, window.location.origin);
      docId = url.searchParams.get("doc") || "";
    } else if (href.includes("/knowledge-base/documents/")) {
      // Old format: /knowledge-base/documents/[id]
      const match = href.match(/\/knowledge-base\/documents\/([^?]+)/);
      if (match) {
        docId = decodeURIComponent(match[1]);
      }
    } else if (href.startsWith("/knowledge-base/")) {
      // Old format: /knowledge-base/[name]
      const match = href.match(/\/knowledge-base\/([^?]+)/);
      if (match) {
        docName = decodeURIComponent(match[1]);
        docId = docName; // Use name as ID for lookup
      }
    }

    console.log("[Citation] Parsed - docId:", docId);

    if (docId) {
      setPreviewDocId(docId);
      setPreviewDocName(docName || docId);
      setPreviewOpen(true);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Export header - only show when there are messages */}
      {messages.length > 0 && (
        <div className="flex items-center justify-end border-b bg-muted/30 px-4 py-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            className="gap-2"
          >
            <FileDown className="h-4 w-4" />
            {t("exportPDF", "Export Report")}
          </Button>
        </div>
      )}

      <ChatContainer
        messages={messages}
        isLoading={isLoading}
        onSendMessage={sendMessage}
        appTitle={t("appTitle")}
        appDescription={t("appDescription")}
        suggestedQuestions={suggestedQuestions}
        onCitationNavigate={handleCitationNavigate}
      />

      {/* Document Preview Sheet */}
      <DocumentPreviewSheet
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        documentId={previewDocId}
        documentName={previewDocName}
      />
    </div>
  );
}
