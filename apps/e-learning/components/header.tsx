"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  cn,
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  GuideCarousel,
  GuideTrigger,
  useAppGuide,
} from "@tasco/ui";
import {
  ChevronRight,
  GraduationCap,
  BookOpen,
  MessageCircle,
  BarChart3,
  Sparkles,
  Home,
} from "@tasco/ui/icons";
import { LanguageSwitcher, useTranslation } from "@tasco/i18n";

// Route configuration factory for i18n support
function getRouteConfig(t: (key: string) => string): Record<
  string,
  {
    title: string;
    subtitle?: string;
    icon: React.ElementType;
    breadcrumb?: { label: string; href: string }[];
  }
> {
  return {
    "/": {
      title: t("header.dashboard"),
      subtitle: t("header.dashboardSubtitle"),
      icon: Home,
    },
    "/courses": {
      title: t("header.courseLibrary"),
      subtitle: t("header.courseLibrarySubtitle"),
      icon: BookOpen,
    },
    "/progress": {
      title: t("header.myProgress"),
      subtitle: t("header.myProgressSubtitle"),
      icon: BarChart3,
    },
    "/chat": {
      title: t("header.aiAssistant"),
      subtitle: t("header.aiAssistantSubtitle"),
      icon: MessageCircle,
    },
    "/create": {
      title: t("header.createCourse"),
      subtitle: t("header.createCourseSubtitle"),
      icon: Sparkles,
    },
  };
}

function getRouteInfo(pathname: string, t: (key: string) => string) {
  const routeConfig = getRouteConfig(t);

  // Direct match
  if (routeConfig[pathname]) {
    return routeConfig[pathname];
  }

  // Course detail page
  if (pathname.startsWith("/courses/") && pathname.split("/").length === 3) {
    return {
      title: t("header.courseDetails"),
      subtitle: t("header.courseDetailsSubtitle"),
      icon: BookOpen,
      breadcrumb: [{ label: t("header.breadcrumbs.courses"), href: "/courses" }],
    };
  }

  // Module/Lesson page
  if (pathname.startsWith("/courses/") && pathname.split("/").length === 4) {
    const parts = pathname.split("/");
    return {
      title: t("header.module"),
      subtitle: t("header.moduleSubtitle"),
      icon: GraduationCap,
      breadcrumb: [
        { label: t("header.breadcrumbs.courses"), href: "/courses" },
        { label: t("header.breadcrumbs.course"), href: `/courses/${parts[2]}` },
      ],
    };
  }

  // Default
  return {
    title: t("branding.name"),
    subtitle: t("branding.tagline"),
    icon: GraduationCap,
  };
}

export function Header() {
  const { t, i18n } = useTranslation("elearning");
  const pathname = usePathname();
  const routeInfo = getRouteInfo(pathname, t);
  const Icon = routeInfo.icon;

  // Database-driven app guide (feature showcase)
  const { guide, isOpen: isGuideOpen, setIsOpen: setIsGuideOpen, openGuide } = useAppGuide("e-learning", i18n.language);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-md px-6">
        {/* Left: Page Context */}
        <div className="flex items-center gap-3">
          {/* Breadcrumb (if exists) */}
          {routeInfo.breadcrumb && (
            <nav className="flex items-center gap-1.5 mr-3">
              {routeInfo.breadcrumb.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center gap-1.5">
                  <Link
                    href={crumb.href}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </Link>
                  <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
                </div>
              ))}
            </nav>
          )}

          {/* Page Icon */}
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>

          {/* Page Title */}
          <div>
            <h1 className="text-sm font-semibold text-foreground">
              {routeInfo.title}
            </h1>
            {routeInfo.subtitle && (
              <p className="text-[10px] text-muted-foreground leading-none">
                {routeInfo.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Guide + Language Switcher */}
        <div className="flex items-center gap-2">
          {/* App Guide Trigger (DB-driven feature showcase) */}
          {guide && <GuideTrigger onClick={openGuide} />}

          <LanguageSwitcher
            variant="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            Button={Button}
            DropdownMenu={DropdownMenu}
            DropdownMenuTrigger={DropdownMenuTrigger}
            DropdownMenuContent={DropdownMenuContent}
            DropdownMenuItem={DropdownMenuItem}
          />
        </div>
      </header>

      {/* Database-driven Feature Guide Carousel */}
      {guide && (
        <GuideCarousel
          guide={guide}
          open={isGuideOpen}
          onOpenChange={setIsGuideOpen}
        />
      )}
    </>
  );
}
