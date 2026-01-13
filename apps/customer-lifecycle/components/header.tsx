"use client";

import { useState, useEffect } from "react";
import {
  Button,
  EntitySelector,
  GuideCarousel,
  useAppGuide,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Avatar,
  AvatarFallback,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from "@tasco/ui";
import {
  Bell,
  Menu,
  Sparkles,
  Settings,
  LogOut,
  User as UserIcon,
  Bot,
  Database,
  ExternalLink,
  Eye,
  EyeOff,
  Check,
  CheckCheck,
  Users,
  Target,
  Megaphone,
  MessageSquare,
  Trash2,
  RefreshCw,
} from "@tasco/ui/icons";
import { useSettings } from "@tasco/lyzr";
import { LanguageSwitcher, useTranslation } from "@tasco/i18n";
import { useEntityFilter } from "../lib/entity-filter-context";

interface HeaderProps {
  onMenuClick?: () => void;
}

interface User {
  id: string;
  fullName: string;
  role: string;
}

interface Notification {
  id: string;
  type: string;
  category: string;
  title: string;
  message?: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { t } = useTranslation("app");
  const { t: tHeader } = useTranslation("header");

  // Entity filter context (shared across app)
  const {
    entities,
    isLoading: isEntitiesLoading,
    selectedEntityIds,
    setSelectedEntityIds,
    isAllSelected,
    selectAll,
  } = useEntityFilter();

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  // App guide (feature showcase)
  const { guide, isOpen: isGuideOpen, setIsOpen: setIsGuideOpen, openGuide } = useAppGuide("customer-lifecycle");

  // Settings
  const { settings, updateSettings } = useSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  // Check if API key is from environment
  const envApiKey = process.env.NEXT_PUBLIC_LYZR_API_KEY || "";
  const hasEnvKey = !!envApiKey;
  const displayKey = hasEnvKey ? envApiKey : settings.lyzrApiKey;

  const handleSaveApiKey = () => {
    updateSettings({ lyzrApiKey: apiKeyInput });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setIsSettingsOpen(false);
    }, 1000);
  };

  const handleOpenSettings = () => {
    setApiKeyInput(settings.lyzrApiKey || "");
    setIsSettingsOpen(true);
  };

  useEffect(() => {
    async function loadData() {
      try {
        // Set a demo user for the UI
        setCurrentUser({
          id: "demo-user",
          fullName: "Nguyen Van A",
          role: "sales_manager",
        });

        // Fetch notifications
        await fetchNotifications();
      } catch (error) {
        console.error("Error loading header data:", error);
      } finally {
        setIsUserLoading(false);
      }
    }

    loadData();
  }, []);

  const fetchNotifications = async () => {
    setIsNotificationsLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=10");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsNotificationsLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllRead" }),
      });
      const data = await res.json();
      if (data.success) {
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const getNotificationIcon = (category: string) => {
    switch (category) {
      case "lead":
        return Target;
      case "customer":
        return Users;
      case "campaign":
        return Megaphone;
      case "conversation":
        return MessageSquare;
      default:
        return Bell;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  /**
   * Handle multi-select entity changes
   */
  const handleEntitiesChange = (entityIds: string[]) => {
    setSelectedEntityIds(entityIds);
    // Data refresh is handled by pages listening to context changes
  };

  /**
   * Get display text for selected entities
   */
  const getSelectedEntitiesLabel = (): string => {
    if (selectedEntityIds.length === 0 || isAllSelected) {
      return t("entity.all_companies");
    }
    if (selectedEntityIds.length === 1) {
      const entity = entities.find((e) => e.id === selectedEntityIds[0]);
      return entity?.shortName || entity?.name || "";
    }
    return `${selectedEntityIds.length} ${t("entity.companies_selected")}`;
  };

  /**
   * Get user initials from full name
   */
  const getUserInitials = (user: User): string => {
    if (!user.fullName) return "??";

    const parts = user.fullName.trim().split(" ");
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    // For Vietnamese names: take first letter of last name + first letter of first name
    const lastName = parts[0];
    const firstName = parts[parts.length - 1];
    return (lastName[0] + firstName[0]).toUpperCase();
  };

  /**
   * Format role for display
   */
  const formatRole = (role: string): string => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-card/80 backdrop-blur-xl px-4 md:px-6">
        {/* Left: Mobile menu */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </button>
        </div>

        {/* Center: Entity Selector (Multi-select) */}
        <div className="flex items-center gap-4">
          {isEntitiesLoading ? (
            <div className="h-10 w-48 animate-pulse rounded-xl bg-muted" />
          ) : (
            <EntitySelector
              entities={entities}
              selectedEntityIds={selectedEntityIds}
              onEntitiesChange={handleEntitiesChange}
              mode="multi"
              placeholder={t("entity.placeholder_multi")}
              allLabel={t("entity.all_companies")}
              showHierarchy={false}
            />
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Help / Feature Guide */}
          {guide && (
            <Button
              variant="ghost"
              size="icon"
              onClick={openGuide}
              className="relative h-10 w-10 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-950"
            >
              <Sparkles className="h-[18px] w-[18px] text-violet-600" />
            </Button>
          )}

          {/* Language Switcher */}
          <LanguageSwitcher
            variant="icon"
            Button={Button}
            DropdownMenu={DropdownMenu}
            DropdownMenuTrigger={DropdownMenuTrigger}
            DropdownMenuContent={DropdownMenuContent}
            DropdownMenuItem={DropdownMenuItem}
            className="h-10 w-10 rounded-xl"
          />

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl" onClick={fetchNotifications}>
                <Bell className="h-[18px] w-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white ring-2 ring-card">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <span className="font-semibold">{tHeader("notifications.title")}</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <CheckCheck className="h-3 w-3" />
                    {tHeader("notifications.markAllRead")}
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {isNotificationsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Bell className="h-8 w-8 mb-2 opacity-50" />
                    <span className="text-sm">{tHeader("notifications.empty")}</span>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const NotifIcon = getNotificationIcon(notif.category);
                    return (
                      <DropdownMenuItem
                        key={notif.id}
                        className={`flex items-start gap-3 p-3 cursor-pointer ${!notif.read ? "bg-primary/5" : ""}`}
                        onClick={() => {
                          if (notif.actionUrl) {
                            window.location.href = notif.actionUrl;
                          }
                        }}
                      >
                        <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg ${
                          notif.category === "lead" ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" :
                          notif.category === "customer" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" :
                          notif.category === "campaign" ? "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          <NotifIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{notif.title}</p>
                            {!notif.read && (
                              <span className="flex h-2 w-2 rounded-full bg-primary" />
                            )}
                          </div>
                          {notif.message && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{notif.message}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(notif.timestamp)}</p>
                        </div>
                      </DropdownMenuItem>
                    );
                  })
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile Dropdown */}
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2">
                  <Avatar className="h-9 w-9 border-2 border-primary/10 transition-all hover:border-primary/30">
                    <AvatarFallback className="bg-gradient-brand text-sm font-semibold text-white">
                      {getUserInitials(currentUser)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-3 px-2 py-2">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-gradient-brand text-sm font-semibold text-white">
                      {getUserInitials(currentUser)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{currentUser.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{formatRole(currentUser.role)}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <UserIcon className="h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={handleOpenSettings}>
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
          )}
        </div>
      </header>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings
            </DialogTitle>
            <DialogDescription>
              Configure your application settings and navigate to external resources.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Navigation Links */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Quick Links
              </p>
              <div className="space-y-1">
                <a
                  href="https://studio.lyzr.ai/agent-create/6963d365c57d451439d530a2"
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
                      <p className="text-xs text-muted-foreground">Configure AI agent in Lyzr Studio</p>
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
                      <p className="text-xs text-muted-foreground">Manage RAG knowledge base</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </a>
              </div>
            </div>

            {/* API Key Section */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                API Configuration
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
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
              Close
            </Button>
            {!hasEnvKey && (
              <Button onClick={handleSaveApiKey} disabled={!apiKeyInput || saved}>
                {saved ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Saved
                  </>
                ) : (
                  "Save"
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
