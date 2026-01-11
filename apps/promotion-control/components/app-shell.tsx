"use client";

import { useRouter } from "next/navigation";
import { AppShell as SharedAppShell, AppSidebar, Button } from "@tasco/ui";
import {
  Calendar,
  List,
  AlertTriangle,
  Plus,
  BarChart3,
  Sparkles,
} from "@tasco/ui/icons";
import { AppHeader } from "./app-header";
import { useTranslation } from "@tasco/i18n";
import { OnboardingGuide } from "./onboarding-guide";

const getNavigation = (t: (key: string, fallback?: string) => string) => [
  {
    name: t("nav.calendar", "Calendar"),
    href: "/",
    icon: Calendar,
  },
  {
    name: t("nav.promotions", "Promotions"),
    href: "/promotions",
    icon: List,
  },
  {
    name: t("nav.alerts", "Alerts"),
    href: "/alerts",
    icon: AlertTriangle,
  },
  {
    name: t("nav.analytics", "Analytics"),
    href: "/analytics",
    icon: BarChart3,
  },
];

function SidebarContent() {
  const { t } = useTranslation("app");
  const router = useRouter();

  const navigation = getNavigation(t);

  const handleNewPromotion = () => {
    router.push("/promotions/new");
  };

  return (
    <AppSidebar
      appName={t("appTitle", "Promotion Control")}
      appSubtitle={t("appSubtitle", "Inochi")}
      primaryAction={
        <Button onClick={handleNewPromotion} className="btn-premium w-full gap-2">
          <Plus className="h-4 w-4" />
          {t("newPromotion", "New Promotion")}
        </Button>
      }
      navigation={navigation}
    />
  );
}

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <>
      <OnboardingGuide />
      <SharedAppShell sidebar={<SidebarContent />} header={<AppHeader />}>
        <div className="page-enter">
          {children}
        </div>
      </SharedAppShell>
    </>
  );
}
