"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { AppShell as SharedAppShell, Button, ChatHistory } from "@tasco/ui";
import {
  Plus,
  LayoutDashboard,
  Scale,
  FolderOpen,
  Building2,
  Clock,
  Settings,
  Shield,
} from "@tasco/ui/icons";
import { AppHeader } from "./app-header";
import { ChatProvider, useChatContext } from "@tasco/lyzr";
import { cn } from "@tasco/ui/lib/utils";
import type { LucideIcon } from "@tasco/ui/icons";

// Navigation structure with sections
interface NavSection {
  label?: string;
  items: {
    name: string;
    href: string;
    icon: LucideIcon;
    tourId?: string;
  }[];
}

const navigationSections: NavSection[] = [
  {
    // Main section (no label)
    items: [
      { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "DOCUMENTS",
    items: [
      { name: "Internal Documents", href: "/knowledge-base", icon: FolderOpen, tourId: "knowledge-base" },
      { name: "Legal Framework", href: "/legal-framework", icon: Scale },
    ],
  },
  {
    label: "ORGANIZATION",
    items: [
      { name: "Entity Structure", href: "/entities", icon: Building2 },
      { name: "Audit Trail", href: "/audit", icon: Clock },
    ],
  },
];

// Custom sidebar component with navy theme
function ComplianceSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActive = (href: string) => {
    // Handle query params in href
    if (href.includes("?")) {
      const [path, query] = href.split("?");
      const params = new URLSearchParams(query);
      if (pathname !== path) return false;
      for (const [key, value] of params.entries()) {
        if (searchParams.get(key) !== value) return false;
      }
      return true;
    }
    // Exact match for root path
    if (href === "/") return pathname === "/";
    // Exact match for other paths
    return pathname === href;
  };

  return (
    <aside className="flex h-full w-[280px] flex-col bg-[hsl(222,47%,11%)]">
      {/* Brand Header */}
      <div className="sidebar-brand" data-tour="welcome">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[hsl(45,93%,47%)] flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5 text-[hsl(222,47%,11%)]" />
          </div>
          <div className="min-w-0">
            <h1 className="sidebar-brand-title">TASCO COMPLIANCE</h1>
            <p className="sidebar-brand-subtitle">Legal & Governance Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navigationSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className={cn(sectionIndex > 0 && "mt-6")}>
            {section.label && (
              <div className="sidebar-section-label">{section.label}</div>
            )}
            <div className="space-y-1 px-3">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href}>
                    <button
                      data-tour={item.tourId}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                        active
                          ? "bg-[hsl(222,47%,18%)] text-white border-l-2 border-[hsl(45,93%,47%)] ml-[-2px]"
                          : "text-[hsl(210,20%,70%)] hover:bg-[hsl(222,47%,15%)] hover:text-white"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4", active && "text-[hsl(45,93%,47%)]")} />
                      <span>{item.name}</span>
                    </button>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Chat History Section */}
        <div className="mt-6" data-tour="chat-history">
          <div className="sidebar-section-label">RECENT CHATS</div>
          <div className="px-3">{children}</div>
        </div>
      </nav>

      {/* Footer: Settings */}
      <div className="p-4 border-t border-[hsl(222,47%,18%)]">
        <Link href="/settings">
          <button
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
              pathname === "/settings"
                ? "bg-[hsl(222,47%,18%)] text-white"
                : "text-[hsl(210,20%,70%)] hover:bg-[hsl(222,47%,15%)] hover:text-white"
            )}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </Link>
      </div>
    </aside>
  );
}

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
    <ComplianceSidebar>
      <Button
        onClick={handleNewConversation}
        className="w-full gap-2 mb-3 btn-gold"
      >
        <Plus className="h-4 w-4" />
        New Chat
      </Button>
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
    </ComplianceSidebar>
  );
}

interface AppShellProps {
  children: React.ReactNode;
}

// Lyzr agent configuration (from environment variables)
const LYZR_AGENT_ID = process.env.NEXT_PUBLIC_LYZR_AGENT_ID;
const LYZR_VALIDATION_AGENT_ID = process.env.NEXT_PUBLIC_LYZR_VALIDATION_AGENT_ID;
const LYZR_API_KEY = process.env.NEXT_PUBLIC_LYZR_API_KEY;

// Multi-Agent Configuration (Expert Sub-Agents)
// These are connected to the main agent in Lyzr Studio as sub-agents
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LYZR_LEGAL_AGENT_ID = process.env.NEXT_PUBLIC_LYZR_LEGAL_AGENT_ID;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LYZR_INTERNAL_AGENT_ID = process.env.NEXT_PUBLIC_LYZR_INTERNAL_AGENT_ID;

export function AppShell({ children }: AppShellProps) {
  return (
    <ChatProvider
      appId="compliance-qa"
      entityId="compliance-qa"
      agentId={LYZR_AGENT_ID}
      validationAgentId={LYZR_VALIDATION_AGENT_ID}
      apiKey={LYZR_API_KEY}
      enableValidation={!!LYZR_VALIDATION_AGENT_ID}
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
