"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Button,
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  GuideCarousel,
  GuideTrigger,
  useAppGuide,
} from "@tasco/ui";
import {
  ArrowLeft,
  Settings,
  LogOut,
  User,
} from "@tasco/ui/icons";
import { LanguageSwitcher, useTranslation } from "@tasco/i18n";

export function AppHeader() {
  const { t } = useTranslation("app");
  const pathname = usePathname();
  const router = useRouter();

  // App guide (feature showcase)
  const { guide, isOpen: isGuideOpen, setIsOpen: setIsGuideOpen, openGuide } = useAppGuide("sales-order");

  // Show back button on non-home pages
  const showBackButton = pathname !== "/";

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b border-border/50 bg-card/30 px-4">
        {/* Left side - Back button */}
        <div className="flex items-center">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t("back", "Back")}</span>
            </Button>
          )}
        </div>

        {/* Right side - Help, Language, Profile */}
        <div className="flex items-center gap-1">
          {/* Help / Feature Guide */}
          {guide && <GuideTrigger onClick={openGuide} />}

          {/* Language Switcher */}
          <LanguageSwitcher
            variant="icon"
            Button={Button as any}
            DropdownMenu={DropdownMenu as any}
            DropdownMenuTrigger={DropdownMenuTrigger as any}
            DropdownMenuContent={DropdownMenuContent as any}
            DropdownMenuItem={DropdownMenuItem as any}
          />

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    IN
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="gap-2">
                <User className="h-4 w-4" />
                {t("profile", "Profile")}
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Settings className="h-4 w-4" />
                {t("settings", "Settings")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-destructive">
                <LogOut className="h-4 w-4" />
                {t("signOut", "Sign out")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Feature Guide Carousel (DB-driven) */}
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
