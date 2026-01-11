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
} from "@tasco/ui/icons";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/alerts",
    label: "Alerts",
    icon: AlertCircle,
  },
  {
    href: "/systems",
    label: "Systems",
    icon: Database,
  },
  {
    href: "/chat",
    label: "AI Assistant",
    icon: MessageSquare,
  },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-2 mr-8">
          <RefreshCw className="h-5 w-5 text-primary" />
          <span className="font-semibold">Data Sync</span>
          <span className="text-xs text-muted-foreground">| Inochi</span>
        </div>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-3 w-3" />
            Sync Now
          </Button>
        </div>
      </div>
    </header>
  );
}
