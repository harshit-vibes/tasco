"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@tasco/ui";
import {
  LayoutDashboard,
  Car,
  DollarSign,
  MessageSquare,
  Clock,
  BarChart3,
  Shield,
  Settings,
  FileText,
} from "@tasco/ui/icons";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navigationItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "New Quote",
    href: "/quote",
    icon: Car,
  },
  {
    label: "Pricing Rules",
    href: "/pricing",
    icon: DollarSign,
  },
  {
    label: "Risk Assessment",
    href: "/risk",
    icon: Shield,
  },
  {
    label: "Quote History",
    href: "/history",
    icon: Clock,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    label: "AI Assistant",
    href: "/chat",
    icon: MessageSquare,
    badge: "AI",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r bg-muted/10 md:flex">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold">Sales & Pricing</h1>
            <p className="text-xs text-muted-foreground">Tasco Insurance</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigationItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-600 text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className={cn(
                    "ml-auto rounded-full px-2 py-0.5 text-xs font-medium",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-emerald-100 text-emerald-700"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Link>

        <Link
          href="/docs"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <FileText className="h-4 w-4" />
          <span>Documentation</span>
        </Link>

        {/* App Info */}
        <div className="mt-4 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/30">
          <p className="text-xs text-muted-foreground">Innovation Day Demo</p>
          <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            INS2: AI Sales & Pricing Cockpit
          </p>
        </div>
      </div>
    </aside>
  );
}
