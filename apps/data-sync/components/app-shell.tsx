"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@tasco/ui";
import {
  LayoutDashboard,
  AlertCircle,
  Database,
  MessageSquare,
  RefreshCw,
  Activity,
  HelpCircle,
  Settings,
} from "@tasco/ui/icons";
import { useTranslation } from "@tasco/i18n";

interface AppShellProps {
  children: React.ReactNode;
  onOpenGuide?: () => void;
}

export function AppShell({ children, onOpenGuide }: AppShellProps) {
  const pathname = usePathname();
  const { t } = useTranslation("app");

  const navItems = [
    {
      href: "/",
      labelKey: "nav.dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/alerts",
      labelKey: "nav.alerts",
      icon: AlertCircle,
    },
    {
      href: "/systems",
      labelKey: "nav.systems",
      icon: Database,
    },
    {
      href: "/chat",
      labelKey: "nav.chat",
      icon: MessageSquare,
    },
  ];

  return (
    <div className="relative flex min-h-screen flex-col ds-grid-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[hsl(var(--ds-border))] bg-[hsl(var(--ds-surface))]/95 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--ds-surface))]/80">
        <div className="container flex h-16 items-center px-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mr-8">
            <div className="relative">
              <div className="absolute inset-0 bg-[hsl(var(--ds-flow-primary))] blur-md opacity-30" />
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--ds-flow-primary))]/10 border border-[hsl(var(--ds-flow-primary))]/30">
                <Activity className="h-5 w-5 text-[hsl(var(--ds-flow-primary))]" />
              </div>
            </div>
            <div>
              <span className="font-semibold text-[hsl(var(--ds-text-primary))]">
                {t("title", "Data Sync")}
              </span>
              <span className="ml-2 text-xs text-[hsl(var(--ds-text-muted))] font-mono">
                | Inochi
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className={`ds-nav-item flex items-center gap-2 text-sm font-medium ${
                      isActive ? "active" : ""
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {t(item.labelKey, item.labelKey.split(".").pop())}
                  </button>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-3">
            {/* Live indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--ds-flow-success))]/10 border border-[hsl(var(--ds-flow-success))]/20">
              <div className="ds-status-dot ds-status-connected" />
              <span className="text-xs font-medium text-[hsl(var(--ds-flow-success))]">
                Live
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-[hsl(var(--ds-text-secondary))] hover:text-[hsl(var(--ds-text-primary))] hover:bg-[hsl(var(--ds-surface-elevated))]"
              onClick={onOpenGuide}
            >
              <HelpCircle className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-[hsl(var(--ds-text-secondary))] hover:text-[hsl(var(--ds-text-primary))] hover:bg-[hsl(var(--ds-surface-elevated))]"
            >
              <Settings className="h-5 w-5" />
            </Button>

            <Button className="ds-btn-glow gap-2">
              <RefreshCw className="h-4 w-4" />
              {t("dashboard.syncNow", "Sync Now")}
            </Button>
          </div>
        </div>

        {/* Progress line */}
        <div className="ds-flow-line" />
      </header>

      {/* Main content */}
      <main className="flex-1 ds-page-enter">{children}</main>

      {/* Footer status bar */}
      <footer className="border-t border-[hsl(var(--ds-border))] bg-[hsl(var(--ds-surface))]/50 py-2 px-6">
        <div className="container flex items-center justify-between text-xs text-[hsl(var(--ds-text-muted))]">
          <div className="flex items-center gap-4">
            <span className="font-mono">4 {t("systems.totalSystems", "Systems").toLowerCase()}</span>
            <span className="text-[hsl(var(--ds-border))]">|</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--ds-flow-success))]" />
              3 {t("status.connected", "Connected").toLowerCase()}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--ds-flow-warning))]" />
              1 {t("status.delayed", "Delayed").toLowerCase()}
            </span>
          </div>
          <div className="font-mono">
            {t("metrics.averageLatency", "Avg Latency")}: 234ms
          </div>
        </div>
      </footer>
    </div>
  );
}
