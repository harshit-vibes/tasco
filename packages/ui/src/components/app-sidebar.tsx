"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./button";
import { cn } from "../lib/utils";
import { Settings, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export interface AppSidebarProps {
  /** App name shown in header */
  appName?: string;
  /** App subtitle shown in header */
  appSubtitle?: string;
  /** Custom app icon component */
  appIcon?: React.ReactNode;
  /** Primary action button (e.g., New Chat) */
  primaryAction?: React.ReactNode;
  /** Main content area (e.g., chat history) */
  children?: React.ReactNode;
  /** Navigation items */
  navigation?: NavItem[];
  /** Settings click handler */
  onSettingsClick?: () => void;
  /** Settings href (alternative to onClick) */
  settingsHref?: string;
}

export function AppSidebar({
  appName,
  appSubtitle,
  appIcon,
  primaryAction,
  children,
  navigation = [],
  onSettingsClick,
  settingsHref = "/settings",
}: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[280px] flex-col bg-gradient-to-b from-slate-50 to-slate-100/80 dark:from-slate-900 dark:to-slate-950 border-r border-slate-200/60 dark:border-slate-800/60">
      {/* Header: App Branding */}
      {appName && (
        <div className="h-14 px-4 flex items-center gap-3 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
            {appIcon || <Shield className="h-5 w-5 text-primary-foreground" />}
          </div>
          <div className="min-w-0">
            <h1 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{appName}</h1>
            {appSubtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{appSubtitle}</p>
            )}
          </div>
        </div>
      )}

      {/* Navigation Items (Dashboard) - Now above New Chat */}
      {navigation.length > 0 && (
        <nav className="px-4 pt-4 pb-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "outline"}
                  className={cn(
                    "w-full gap-2.5 transition-all duration-200",
                    !isActive && "bg-white/60 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm text-slate-700 dark:text-slate-300"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      )}

      {/* Primary Action (e.g., New Chat button) */}
      {primaryAction && (
        <div className={cn("px-4 pb-4", navigation.length === 0 && "pt-4")}>
          {primaryAction}
        </div>
      )}

      {/* Main Content Area (e.g., Chat History) - 50% height */}
      {children && (
        <div className="relative z-10 h-[50%] overflow-y-auto scrollbar-thin">
          {children}
        </div>
      )}

      {/* Footer: Settings */}
      <div className="mt-auto p-4 border-t border-slate-200/60 dark:border-slate-800/60">
        {settingsHref ? (
          <Link href={settingsHref}>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all duration-200"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Button>
          </Link>
        ) : onSettingsClick ? (
          <Button
            variant="ghost"
            onClick={onSettingsClick}
            className="w-full justify-start gap-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all duration-200"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>
        ) : null}
      </div>
    </aside>
  );
}
