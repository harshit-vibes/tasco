"use client";

import { useRouter, usePathname } from "next/navigation";
import { AppShell as SharedAppShell, AppSidebar, Button, ChatHistory } from "@tasco/ui";
import { Plus, LayoutDashboard } from "@tasco/ui/icons";
import { AppHeader } from "./app-header";
import { ChatProvider, useChatContext } from "@tasco/lyzr";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
];

function SidebarContent() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    conversations,
    conversation,
    selectConversation,
    createNewConversation,
    deleteConversationById,
    isLoadingConversations,
  } = useChatContext();

  const handleNewConversation = async () => {
    try {
      await createNewConversation();
      // Navigate to home page where chat is
      if (pathname !== "/") {
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
      alert("Failed to create conversation: " + (error as Error).message);
    }
  };

  return (
    <AppSidebar
      appName="Compliance QA"
      appSubtitle="Tasco Group"
      primaryAction={
        <Button onClick={handleNewConversation} className="w-full gap-2">
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      }
      navigation={navigation}
      settingsHref="/settings"
    >
      <ChatHistory
        conversations={conversations}
        activeConversationId={conversation?.id}
        onSelectConversation={(id) => {
          selectConversation(id);
          // Navigate to home page where chat is
          if (pathname !== "/") {
            router.push("/");
          }
        }}
        onDeleteConversation={deleteConversationById}
        isLoading={isLoadingConversations}
      />
    </AppSidebar>
  );
}

interface AppShellProps {
  children: React.ReactNode;
}

// Lyzr agent configuration (from environment variables)
const LYZR_AGENT_ID = process.env.NEXT_PUBLIC_LYZR_AGENT_ID;
const LYZR_API_KEY = process.env.NEXT_PUBLIC_LYZR_API_KEY;

export function AppShell({ children }: AppShellProps) {
  return (
    <ChatProvider
      appId="compliance-qa"
      entityId="compliance-qa"
      agentId={LYZR_AGENT_ID}
      apiKey={LYZR_API_KEY}
    >
      <SharedAppShell
        sidebar={<SidebarContent />}
        header={<AppHeader />}
      >
        {children}
      </SharedAppShell>
    </ChatProvider>
  );
}
