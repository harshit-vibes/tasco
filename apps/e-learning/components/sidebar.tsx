"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { cn, Button } from "@tasco/ui";
import {
  GraduationCap,
  BookOpen,
  BarChart3,
  MessageCircle,
  Plus,
  Sparkles,
  ChevronRight,
  Play,
  Flame,
  Star,
} from "@tasco/ui/icons";
import { useChatContext } from "@tasco/lyzr";
import { useTranslation } from "@tasco/i18n";
import { useCourses } from "../lib/course-context";

// Navigation structure - labels are i18n keys
const getMainNavigation = (t: (key: string) => string) => [
  {
    id: "learn",
    label: t("nav.learn"),
    items: [
      {
        name: t("nav.dashboard"),
        href: "/",
        icon: GraduationCap,
        description: t("nav.dashboardDesc"),
      },
      {
        name: t("nav.courses"),
        href: "/courses",
        icon: BookOpen,
        description: t("nav.coursesDesc"),
      },
      {
        name: t("nav.progress"),
        href: "/progress",
        icon: BarChart3,
        description: t("nav.progressDesc"),
      },
    ],
  },
  {
    id: "assist",
    label: t("nav.aiAssistant"),
    items: [
      {
        name: t("nav.askAi"),
        href: "/chat",
        icon: MessageCircle,
        description: t("nav.askAiDesc"),
      },
    ],
  },
];

function UserStreak() {
  // Mock data - would come from context in production
  const streak = 5;
  const xp = 1250;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1.5">
        <div className="relative">
          <Flame className="h-4 w-4 text-amber-500" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
        </div>
        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
          {streak}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <Star className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold text-primary">
          {xp.toLocaleString()} XP
        </span>
      </div>
    </div>
  );
}

function QuickStats() {
  const { t } = useTranslation("elearning");
  const { courses } = useCourses();
  const completedCourses = 0; // Would come from progress context
  const totalCourses = courses.length;

  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-3 border border-primary/10">
        <div className="text-2xl font-display font-bold text-primary">
          {completedCourses}
        </div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          {t("stats.completed")}
        </div>
      </div>
      <div className="rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-500/5 p-3 border border-amber-500/10">
        <div className="text-2xl font-display font-bold text-amber-600 dark:text-amber-400">
          {totalCourses}
        </div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          {t("stats.available")}
        </div>
      </div>
    </div>
  );
}

function ContinueLearning() {
  const { t } = useTranslation("elearning");
  const { courses } = useCourses();
  // Get first course as "in progress" for demo
  const inProgressCourse = courses[0];

  if (!inProgressCourse) return null;

  return (
    <div className="px-4 pt-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
        {t("nav.continueLearning")}
      </div>
      <Link href={`/courses/${inProgressCourse.id}`}>
        <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-3 transition-all hover:border-primary/30 hover:shadow-warm-md">
          {/* Progress indicator */}
          <div className="absolute top-0 left-0 h-1 bg-primary/20 w-full">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: "25%" }}
            />
          </div>

          <div className="flex items-start gap-3 pt-1">
            <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Play className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {inProgressCourse.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("stats.modules", { count: inProgressCourse.moduleCount })} &middot; {t("stats.complete", { percent: 25 })}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </Link>
    </div>
  );
}

function RecentChats() {
  const { t } = useTranslation("elearning");
  const { conversations } = useChatContext();
  const recentChats = conversations?.slice(0, 3) || [];

  if (recentChats.length === 0) return null;

  return (
    <div className="pt-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 px-2">
        {t("nav.recentChats")}
      </div>
      <div className="space-y-1">
        {recentChats.map((chat) => (
          <Link key={chat.id} href="/chat">
            <div className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <MessageCircle className="h-3.5 w-3.5 shrink-0 opacity-60" />
              <span className="truncate text-xs">
                {chat.title || t("chat.newChat")}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Sidebar() {
  const { t } = useTranslation("elearning");
  const pathname = usePathname();
  const router = useRouter();
  const { createNewConversation } = useChatContext();
  const mainNavigation = getMainNavigation(t);

  const handleNewChat = async () => {
    try {
      await createNewConversation();
      if (pathname !== "/chat") {
        router.push("/chat");
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  return (
    <aside className="relative flex h-full w-[280px] flex-col bg-gradient-to-b from-background via-background to-muted/30 border-r border-border/40">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      {/* Header: Brand */}
      <div className="relative z-10 px-4 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-warm-md">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-amber-400 rounded-full border-2 border-background flex items-center justify-center">
              <Sparkles className="h-1.5 w-1.5 text-amber-900" />
            </div>
          </div>
          <div>
            <h1 className="font-display text-base font-bold text-foreground tracking-tight">
              {t("branding.name")}
            </h1>
            <p className="text-[11px] text-muted-foreground font-medium">
              {t("branding.tagline")}
            </p>
          </div>
        </div>

        {/* Streak and XP */}
        <div className="mt-4">
          <UserStreak />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="relative z-10 pb-4">
        <QuickStats />
      </div>

      {/* Primary Action */}
      <div className="relative z-10 px-4 pb-4">
        <Button
          onClick={handleNewChat}
          className="w-full gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-warm-sm hover:shadow-warm-md transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>{t("nav.newConversation")}</span>
        </Button>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Continue Learning */}
      <ContinueLearning />

      {/* Main Navigation */}
      <nav className="relative z-10 flex-1 overflow-y-auto px-4 pt-4 pb-2 scrollbar-thin">
        {mainNavigation.map((group) => (
          <div key={group.id} className="mb-4">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
              {group.label}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.name} href={item.href}>
                    <div
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                      )}

                      <div
                        className={cn(
                          "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-warm-sm"
                            : "bg-muted/50 group-hover:bg-muted"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{item.name}</div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {item.description}
                        </div>
                      </div>

                      <ChevronRight
                        className={cn(
                          "h-4 w-4 shrink-0 transition-all",
                          isActive
                            ? "opacity-100"
                            : "opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0"
                        )}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Recent Chats */}
        <RecentChats />
      </nav>

      {/* Footer */}
      <div className="relative z-10 border-t border-border/40 bg-muted/20 p-4 space-y-3">
        {/* Create Course Action */}
        <Link href="/create">
          <div
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
              pathname === "/create"
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {/* Active indicator */}
            {pathname === "/create" && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-500 rounded-r-full" />
            )}
            <div
              className={cn(
                "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                pathname === "/create"
                  ? "bg-amber-500 text-white shadow-warm-sm"
                  : "bg-amber-500/10 group-hover:bg-amber-500/20"
              )}
            >
              <Plus className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{t("nav.createCourse")}</div>
              <div className="text-[10px] text-muted-foreground truncate">
                {t("nav.createCourseDesc")}
              </div>
            </div>
            <Sparkles
              className={cn(
                "h-4 w-4 shrink-0 transition-all text-amber-500",
                pathname === "/create"
                  ? "opacity-100"
                  : "opacity-50 group-hover:opacity-100"
              )}
            />
          </div>
        </Link>

        {/* AI Status */}
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              {t("branding.aiStatus")}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
