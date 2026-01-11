"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@tasco/ui";
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Megaphone,
  BarChart3,
  MessageSquare,
  Settings,
  Sparkles,
  Car,
  ChevronRight,
} from "@tasco/ui/icons";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

const navigationItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Leads",
    href: "/leads",
    icon: Users,
    badge: "New",
    badgeColor: "bg-emerald-500",
  },
  {
    label: "Customers",
    href: "/customers",
    icon: UserCircle,
  },
  {
    label: "Campaigns",
    href: "/marketing",
    icon: Megaphone,
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
    badgeColor: "bg-violet-500",
  },
];

export function Sidebar() {
  const pathname = usePathname();

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
            <h1 className="text-base font-semibold tracking-tight">Customer Lifecycle</h1>
            <p className="text-xs text-muted-foreground">Tasco Auto</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Main Menu
        </p>
        {navigationItems.map((item, index) => {
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "sidebar-nav-item group opacity-0 animate-fade-in-up",
                isActive && "active"
              )}
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: "forwards" }}
            >
              <div className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-all",
                isActive
                  ? "bg-white/20"
                  : "bg-muted/50 group-hover:bg-muted"
              )}>
                <Icon className={cn(
                  "h-[18px] w-[18px] transition-transform group-hover:scale-110",
                  isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                )} />
              </div>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold text-white",
                  item.badgeColor || "bg-primary"
                )}>
                  {item.badge}
                </span>
              )}
              <ChevronRight className={cn(
                "h-4 w-4 opacity-0 transition-all",
                isActive ? "opacity-100 text-white/70" : "group-hover:opacity-50"
              )} />
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <Link
          href="/settings"
          className={cn(
            "sidebar-nav-item group",
            pathname === "/settings" && "active"
          )}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50 transition-all group-hover:bg-muted">
            <Settings className="h-[18px] w-[18px] text-muted-foreground transition-transform group-hover:rotate-90 group-hover:text-foreground" />
          </div>
          <span>Settings</span>
        </Link>

        {/* App Info Card */}
        <div className="mt-4 overflow-hidden rounded-xl bg-gradient-to-br from-violet-600/10 via-violet-500/5 to-cyan-500/10 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold">Innovation Day</p>
              <p className="text-[10px] text-muted-foreground">Demo v1.0</p>
            </div>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            AI-powered customer lifecycle management for Tasco Auto dealerships.
          </p>
        </div>
      </div>
    </aside>
  );
}
