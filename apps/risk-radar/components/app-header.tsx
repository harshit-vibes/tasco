"use client";

import { useState, useEffect, useCallback } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  ScrollArea,
  GuideCarousel,
  GuideTrigger,
  useAppGuide,
} from "@tasco/ui";
import {
  ArrowLeft,
  Bell,
  Settings,
  LogOut,
  User,
  Eye,
  EyeOff,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  Bot,
  Database,
  ExternalLink,
  Check,
} from "@tasco/ui/icons";
import { useSettings } from "@tasco/lyzr";
import { LanguageSwitcher, useTranslation } from "@tasco/i18n";
import {
  type Notification,
  getNotifications,
  markAllAsRead as markAllAsReadStore,
  clearNotifications as clearNotificationsStore,
  getUnreadCount,
  getCriticalCount,
  subscribe,
  formatTime,
  getSeverityColor,
  getSeverityBg,
} from "@/lib/notifications";
import { DemoControlsPanel } from "./demo-controls";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { settings, updateSettings } = useSettings();
  const { t } = useTranslation("app");

  const [notifications, setNotifications] = useState<Notification[]>(
    getNotifications()
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  // App guide (feature showcase)
  const {
    guide,
    isOpen: isGuideOpen,
    setIsOpen: setIsGuideOpen,
    openGuide,
  } = useAppGuide("risk-radar");

  // Subscribe to notification changes
  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setNotifications(getNotifications());
    });
    return unsubscribe;
  }, []);

  const unreadCount = getUnreadCount();
  const criticalCount = getCriticalCount();

  const markAllAsRead = useCallback(() => {
    markAllAsReadStore();
  }, []);

  const clearNotifications = useCallback(() => {
    clearNotificationsStore();
  }, []);

  // Show back button on non-home pages
  const showBackButton = pathname !== "/";

  const envApiKey = process.env.NEXT_PUBLIC_LYZR_API_KEY;
  const hasEnvKey = !!envApiKey;
  const displayKey = hasEnvKey ? envApiKey : settings.lyzrApiKey;

  const handleSaveApiKey = () => {
    updateSettings({ lyzrApiKey: apiKeyInput });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setIsSettingsOpen(false);
    }, 1500);
  };

  const handleOpenSettings = () => {
    setApiKeyInput(settings.lyzrApiKey || "");
    setIsSettingsOpen(true);
  };

  const getSeverityIcon = (severity: Notification["severity"]) => {
    switch (severity) {
      case "critical":
        return (
          <AlertTriangle className="h-4 w-4 text-[hsl(0,72%,51%)]" />
        );
      case "warning":
        return (
          <TrendingUp className="h-4 w-4 text-[hsl(25,95%,55%)]" />
        );
      default:
        return (
          <TrendingDown className="h-4 w-4 text-[hsl(152,60%,40%)]" />
        );
    }
  };

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
              <span>{t("common.close")}</span>
            </Button>
          )}
        </div>

        {/* Right side - Demo, Help, Language, Notifications, Profile */}
        <div className="flex items-center gap-1">
          {/* Demo Controls */}
          <DemoControlsPanel />

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

          {/* Notifications */}
          <DropdownMenu onOpenChange={(open) => open && markAllAsRead()}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground relative"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span
                    className={`absolute top-1 right-1 h-4 w-4 rounded-full text-[10px] font-medium text-white flex items-center justify-center ${
                      criticalCount > 0
                        ? "bg-[hsl(0,72%,51%)]"
                        : "bg-primary"
                    }`}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <span className="font-semibold text-sm">
                  {t("dashboard.alerts.title")}
                </span>
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground"
                    onClick={clearNotifications}
                  >
                    {t("alerts.clearFilters")}
                  </Button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    {t("alerts.empty.title")}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {t("alerts.empty.allClear")}
                  </p>
                </div>
              ) : (
                <ScrollArea className="max-h-[350px]">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 px-3 py-3 border-b last:border-0 ${
                        !notification.read ? "bg-primary/5" : ""
                      }`}
                    >
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${getSeverityBg(
                          notification.severity
                        )}`}
                      >
                        {getSeverityIcon(notification.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {notification.title}
                        </p>
                        {notification.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          {notification.metric && (
                            <span className="text-xs font-mono font-medium text-primary">
                              {notification.value}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    RR
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="gap-2">
                <User className="h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onClick={handleOpenSettings}>
                <Settings className="h-4 w-4" />
                {t("nav.settings")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-destructive">
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t("settings.title")}
            </DialogTitle>
            <DialogDescription>{t("settings.subtitle")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Navigation Links */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Quick Links
              </p>
              <div className="space-y-1">
                <a
                  href="https://studio.lyzr.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Agent Builder</p>
                      <p className="text-xs text-muted-foreground">
                        Configure AI agent in Lyzr Studio
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </a>
                <a
                  href="https://studio.lyzr.ai/knowledge-base"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Database className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Knowledge Base</p>
                      <p className="text-xs text-muted-foreground">
                        Manage RAG knowledge base
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </a>
              </div>
            </div>

            {/* API Key Section */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("settings.api.title")}
              </p>
              {hasEnvKey ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    API key configured via environment variable
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      value={displayKey}
                      readOnly
                      className="font-mono text-sm bg-muted"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      placeholder="sk-..."
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get your API key from{" "}
                    <a
                      href="https://studio.lyzr.ai"
                      target="_blank"
                      rel="noopener"
                      className="text-primary underline"
                    >
                      Lyzr Studio
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              {t("common.close")}
            </Button>
            {!hasEnvKey && (
              <Button onClick={handleSaveApiKey} disabled={!apiKeyInput || saved}>
                {saved ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Saved
                  </>
                ) : (
                  t("common.save")
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
