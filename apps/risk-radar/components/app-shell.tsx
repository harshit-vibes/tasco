"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { AppShell as SharedAppShell, Button, ChatHistory } from "@tasco/ui";
import {
  LayoutDashboard,
  AlertTriangle,
  BarChart3,
  MessageSquare,
  Settings,
  Radar,
  TrendingUp,
  TrendingDown,
  Plus,
} from "@tasco/ui/icons";
import { AppHeader } from "./app-header";
import { ChatProvider, useChatContext } from "@tasco/lyzr";
import { DemoProvider } from "./demo-controls";
import { cn } from "@tasco/ui/lib/utils";
import { useTranslation } from "@tasco/i18n";
import type { LucideIcon } from "@tasco/ui/icons";

// Navigation structure with sections
interface NavSection {
  label?: string;
  items: {
    nameKey: string;
    href: string;
    icon: LucideIcon;
    badge?: {
      type: "critical" | "warning" | "info";
      count?: number;
    };
  }[];
}

const navigationSections: NavSection[] = [
  {
    // Main section (no label)
    items: [
      { nameKey: "nav.dashboard", href: "/", icon: LayoutDashboard },
      {
        nameKey: "nav.alerts",
        href: "/alerts",
        icon: AlertTriangle,
        badge: { type: "critical", count: 3 },
      },
      { nameKey: "nav.analysis", href: "/analysis", icon: BarChart3 },
    ],
  },
  {
    label: "AI",
    items: [{ nameKey: "nav.assistant", href: "/assistant", icon: MessageSquare }],
  },
];

// Risk summary indicators for sidebar
interface RiskIndicator {
  label: string;
  value: string;
  trend: "up" | "down" | "stable";
  status: "healthy" | "warning" | "critical";
}

const riskIndicators: RiskIndicator[] = [
  { label: "Loss Ratio", value: "62.4%", trend: "down", status: "healthy" },
  { label: "Combined Ratio", value: "95.2%", trend: "up", status: "warning" },
  { label: "Claims YTD", value: "₫12.8B", trend: "up", status: "warning" },
];

// Custom sidebar component with command center theme
function RiskRadarSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation("app");

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
    <aside className="flex h-full w-[280px] flex-col bg-[hsl(215,35%,9%)]">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[hsl(173,58%,39%)] flex items-center justify-center shrink-0">
            <Radar className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="sidebar-brand-title">{t("appTitle")}</h1>
            <p className="sidebar-brand-subtitle">{t("appSubtitle")}</p>
          </div>
        </div>
      </div>

      {/* Quick Risk Indicators */}
      <div className="px-4 py-4 border-b border-[hsl(215,35%,15%)]">
        <div className="space-y-2">
          {riskIndicators.map((indicator) => (
            <div
              key={indicator.label}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "status-dot",
                    indicator.status === "healthy" && "status-dot-healthy",
                    indicator.status === "warning" && "status-dot-warning",
                    indicator.status === "critical" && "status-dot-critical"
                  )}
                />
                <span className="text-[hsl(210,20%,70%)]">{indicator.label}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-mono font-medium text-white">
                  {indicator.value}
                </span>
                {indicator.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-[hsl(0,72%,60%)]" />
                ) : indicator.trend === "down" ? (
                  <TrendingDown className="h-3 w-3 text-[hsl(152,60%,50%)]" />
                ) : null}
              </div>
            </div>
          ))}
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
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                        active
                          ? "bg-[hsl(215,35%,15%)] text-white border-l-2 border-[hsl(173,58%,50%)] ml-[-2px]"
                          : "text-[hsl(210,20%,70%)] hover:bg-[hsl(215,35%,12%)] hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon
                          className={cn(
                            "h-4 w-4",
                            active && "text-[hsl(173,58%,50%)]"
                          )}
                        />
                        <span>{t(item.nameKey)}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={cn(
                            "alert-badge",
                            item.badge.type === "critical" &&
                              "alert-badge-critical",
                            item.badge.type === "warning" &&
                              "alert-badge-warning",
                            item.badge.type === "info" && "alert-badge-info"
                          )}
                        >
                          {item.badge.count}
                        </span>
                      )}
                    </button>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Chat History Section */}
        <div className="mt-6">
          <div className="sidebar-section-label">{t("dashboard.alerts.title")}</div>
          <div className="px-3">{children}</div>
        </div>
      </nav>

      {/* Footer: Settings */}
      <div className="p-4 border-t border-[hsl(215,35%,15%)]">
        <Link href="/settings">
          <button
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
              pathname === "/settings"
                ? "bg-[hsl(215,35%,15%)] text-white"
                : "text-[hsl(210,20%,70%)] hover:bg-[hsl(215,35%,12%)] hover:text-white"
            )}
          >
            <Settings className="h-4 w-4" />
            <span>{t("nav.settings")}</span>
          </button>
        </Link>
      </div>
    </aside>
  );
}

function SidebarContent() {
  const pathname = usePathname();
  const {
    conversations,
    conversation,
    selectConversation,
    createNewConversation,
    deleteConversationById,
    isLoadingConversations,
  } = useChatContext();
  const { t } = useTranslation("app");

  const handleNewConversation = async () => {
    try {
      await createNewConversation();
      // Navigate to assistant page where chat is
      if (pathname !== "/assistant") {
        window.location.href = "/assistant";
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
      alert("Failed to create conversation: " + (error as Error).message);
    }
  };

  return (
    <RiskRadarSidebar>
      <Button onClick={handleNewConversation} className="w-full gap-2 mb-3 btn-primary">
        <Plus className="h-4 w-4" />
        {t("assistant.suggestions.title")}
      </Button>
      <ChatHistory
        conversations={conversations}
        activeConversationId={conversation?.id}
        onSelectConversation={(id) => {
          selectConversation(id);
          // Navigate to assistant page where chat is
          if (pathname !== "/assistant") {
            window.location.href = "/assistant";
          }
        }}
        onDeleteConversation={deleteConversationById}
        isLoading={isLoadingConversations}
      />
    </RiskRadarSidebar>
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
    <DemoProvider>
      <ChatProvider
        appId="risk-radar"
        entityId="risk-radar"
        agentId={LYZR_AGENT_ID}
        apiKey={LYZR_API_KEY}
      >
        <SharedAppShell sidebar={<SidebarContent />} header={<AppHeader />}>
          {children}
        </SharedAppShell>
      </ChatProvider>
    </DemoProvider>
  );
}
