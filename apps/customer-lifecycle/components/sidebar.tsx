"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  cn,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@tasco/ui";
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Megaphone,
  MessageSquare,
  Sparkles,
  Car,
  ChevronRight,
  Trash2,
  Loader2,
  Warehouse,
  Package,
  TrendingUp,
  Building2,
} from "@tasco/ui/icons";
import { useTranslation } from "@tasco/i18n";
import type { Conversation } from "@tasco/db";

interface NavItem {
  labelKey: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

interface CompactNavGroup {
  labelKey: string;
  items: NavItem[];
}

// Dashboard is standalone
const dashboardItem: NavItem = {
  labelKey: "menu.dashboard",
  href: "/",
  icon: LayoutDashboard,
};

// Compact navigation groups (displayed in row format)
const compactGroups: CompactNavGroup[] = [
  {
    labelKey: "menu.customer_ops",
    items: [
      {
        labelKey: "menu.leads",
        href: "/leads",
        icon: Users,
      },
      {
        labelKey: "menu.customers",
        href: "/customers",
        icon: UserCircle,
      },
      {
        labelKey: "menu.campaigns",
        href: "/marketing",
        icon: Megaphone,
      },
    ],
  },
  {
    labelKey: "menu.inventory_ops",
    items: [
      {
        labelKey: "menu.organisations",
        href: "/entities",
        icon: Building2,
      },
      {
        labelKey: "menu.vehicles",
        href: "/inventory",
        icon: Car,
      },
      {
        labelKey: "menu.orders",
        href: "/inventory/orders",
        icon: Package,
      },
    ],
  },
];

// Collect all nav items for active state checking
const allNavItems = [
  dashboardItem,
  ...compactGroups.flatMap(g => g.items),
];

interface SidebarProps {
  conversations?: Conversation[];
  activeConversationId?: string;
  onSelectConversation?: (id: string) => void;
  onCreateConversation?: () => void;
  onDeleteConversation?: (id: string) => void;
  isLoadingConversations?: boolean;
  onOpenCommand?: () => void;
}

export function Sidebar({
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  isLoadingConversations = false,
  onOpenCommand,
}: SidebarProps) {
  const { t } = useTranslation("sidebar");
  const { t: tApp } = useTranslation("app");
  const pathname = usePathname();
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <aside className="hidden w-72 flex-col border-r bg-card/50 backdrop-blur-xl md:flex">
      {/* Logo/Brand */}
      <div className="flex h-20 items-center border-b px-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand shadow-lg">
              <Car className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-card">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">{t("brand.name")}</h1>
            <p className="text-xs text-muted-foreground">{t("brand.company")}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col overflow-hidden p-4">
        {/* Dashboard - Standalone */}
        <div className="mb-4">
          {(() => {
            const isActive = pathname === dashboardItem.href;
            const Icon = dashboardItem.icon;
            return (
              <Link
                href={dashboardItem.href}
                className={cn(
                  "sidebar-nav-item group",
                  isActive && "active"
                )}
              >
                <div className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg transition-all",
                  isActive
                    ? "bg-white/20"
                    : "bg-muted/50 group-hover:bg-muted"
                )}>
                  <Icon className={cn(
                    "h-[18px] w-[18px] transition-transform group-hover:scale-105",
                    isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                </div>
                <span className="flex-1">{t(dashboardItem.labelKey)}</span>
                <ChevronRight className={cn(
                  "h-4 w-4 opacity-0 transition-all",
                  isActive ? "opacity-100 text-white" : "group-hover:opacity-50"
                )} />
              </Link>
            );
          })()}
        </div>

        {/* Compact Navigation Groups */}
        {compactGroups.map((group, groupIndex) => (
          <div key={group.labelKey} className={groupIndex > 0 ? "mt-4" : ""}>
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t(group.labelKey)}
            </p>
            <div className="grid grid-cols-3 gap-1">
              {group.items.map((item) => {
                // Improved active state: exact match or parent route without more specific child match
                const isExactMatch = pathname === item.href;
                const isParentRoute = item.href !== "/" && pathname.startsWith(item.href + "/");

                // Check if there's a more specific nav item that matches this path
                const hasMoreSpecificMatch = allNavItems.some(navItem =>
                  navItem.href !== item.href &&
                  navItem.href.startsWith(item.href) &&
                  pathname.startsWith(navItem.href)
                );

                const isActive = isExactMatch || (isParentRoute && !hasMoreSpecificMatch);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg transition-all group",
                      isActive
                        ? "bg-gradient-brand text-white shadow-md"
                        : "hover:bg-muted/70 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                      isActive
                        ? "bg-white/20"
                        : "bg-muted/50 group-hover:bg-muted"
                    )}>
                      <Icon className={cn(
                        "h-4 w-4 transition-transform group-hover:scale-105",
                        isActive ? "text-white" : ""
                      )} />
                    </div>
                    <span className="text-[10px] font-medium text-center leading-tight">{t(item.labelKey)}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* AI Conversations Section */}
        <div className="mt-6 flex-1 flex flex-col min-h-0">
          <div className="px-3 mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("ai.title")}
            </p>
          </div>

          {/* Ask AI Button */}
          <div className="px-2 mb-3">
            <button
              onClick={onOpenCommand}
              className="w-full h-9 rounded-lg bg-gradient-to-r from-violet-500/10 to-cyan-500/10 px-3 flex items-center gap-2 text-sm text-muted-foreground hover:from-violet-500/20 hover:to-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all"
            >
              <Sparkles className="h-4 w-4 text-violet-500" />
              <span>{t("ai.ask_placeholder")}</span>
              <kbd className="ml-auto hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
            {isLoadingConversations ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 px-3">
                <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center mb-2">
                  <MessageSquare className="h-4 w-4 text-violet-500" />
                </div>
                <p className="text-[11px] text-muted-foreground text-center">
                  {t("ai.empty_state")}
                </p>
              </div>
            ) : (
              conversations.slice(0, 10).map((conversation) => {
                const isActive = activeConversationId === conversation.id;
                const isHovered = hoveredId === conversation.id;

                return (
                  <div
                    key={conversation.id}
                    className={cn(
                      "group flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm cursor-pointer transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-violet-500/20 to-cyan-500/10 border border-violet-500/20"
                        : "hover:bg-muted/50 border border-transparent"
                    )}
                    onClick={() => {
                      onSelectConversation?.(conversation.id);
                      router.push("/chat");
                    }}
                    onMouseEnter={() => setHoveredId(conversation.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors",
                      isActive
                        ? "bg-violet-500/20 text-violet-500"
                        : "bg-muted/50 text-muted-foreground group-hover:bg-muted"
                    )}>
                      <MessageSquare className="h-3 w-3" />
                    </div>
                    <span className={cn(
                      "flex-1 truncate text-left transition-colors text-xs",
                      isActive
                        ? "text-foreground font-medium"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}>
                      {conversation.title}
                    </span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "p-1 rounded transition-all",
                            isHovered || isActive
                              ? "opacity-100 hover:bg-red-500/10"
                              : "opacity-0"
                          )}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-500 transition-colors" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("ai.delete_title")}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("ai.delete_description")}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("ai.cancel")}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDeleteConversation?.(conversation.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {t("ai.delete")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        {/* App Info Card */}
        <div className="overflow-hidden rounded-xl bg-gradient-to-br from-violet-600/10 via-violet-500/5 to-cyan-500/10 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold">{t("footer.title")}</p>
              <p className="text-[10px] text-muted-foreground">{t("footer.version")}</p>
            </div>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            {t("footer.description")}
          </p>
        </div>
      </div>
    </aside>
  );
}
