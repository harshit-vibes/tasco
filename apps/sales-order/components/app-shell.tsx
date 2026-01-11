"use client";

import { useRouter, usePathname } from "next/navigation";
import { AppShell as SharedAppShell, AppSidebar, Button } from "@tasco/ui";
import {
  Upload,
  Clock,
  LayoutDashboard,
  FileText,
  Plus,
} from "@tasco/ui/icons";
import { AppHeader } from "./app-header";
import { useTranslation } from "@tasco/i18n";

const getNavigation = (t: (key: string, fallback?: string) => string) => [
  {
    name: t("nav.upload", "New Upload"),
    href: "/",
    icon: Upload,
  },
  {
    name: t("nav.review", "Pending Review"),
    href: "/review",
    icon: FileText,
  },
  {
    name: t("nav.history", "All Orders"),
    href: "/history",
    icon: Clock,
  },
  {
    name: t("nav.dashboard", "Analytics"),
    href: "/dashboard",
    icon: LayoutDashboard,
  },
];

function SidebarContent() {
  const { t } = useTranslation("app");
  const router = useRouter();
  const pathname = usePathname();

  const navigation = getNavigation(t);

  const handleNewUpload = () => {
    router.push("/");
  };

  return (
    <AppSidebar
      appName={t("appTitle", "Sales Order")}
      appSubtitle={t("appSubtitle", "Inochi")}
      primaryAction={
        <Button onClick={handleNewUpload} className="w-full gap-2">
          <Plus className="h-4 w-4" />
          {t("newUpload", "New Upload")}
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
    <SharedAppShell sidebar={<SidebarContent />} header={<AppHeader />}>
      {children}
    </SharedAppShell>
  );
}
