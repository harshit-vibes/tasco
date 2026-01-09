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
} from "@tasco/ui";
import {
  ArrowLeft,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  User,
  Key,
  Check,
  Eye,
  EyeOff,
  MessageSquare,
  Trash2,
  Clock,
} from "@tasco/ui/icons";
import { useSettings, useChatContext } from "@tasco/lyzr";
import {
  type Notification,
  getNotifications,
  getPreviousConversationIds,
  setPreviousConversationIds,
  addNotification,
  markAllAsRead as markAllAsReadStore,
  clearNotifications as clearNotificationsStore,
  getUnreadCount,
  subscribe,
  formatTime,
} from "@/lib/notifications";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { settings, updateSettings } = useSettings();
  const { conversations } = useChatContext();

  const [notifications, setNotifications] = useState<Notification[]>(getNotifications());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  // Subscribe to notification changes
  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setNotifications(getNotifications());
    });
    return unsubscribe;
  }, []);

  // Track conversation changes and generate notifications
  useEffect(() => {
    const previousIds = getPreviousConversationIds();

    if (!conversations || conversations.length === 0) {
      // Initialize previous IDs on first load
      if (previousIds.size === 0) {
        setPreviousConversationIds(new Set(conversations?.map((c) => c.id) || []));
      }
      return;
    }

    const currentIds = new Set(conversations.map((c) => c.id));

    // Check for new conversations
    conversations.forEach((conv) => {
      if (!previousIds.has(conv.id) && previousIds.size > 0) {
        addNotification({
          id: `notif-${Date.now()}-${conv.id}`,
          type: "created",
          title: conv.title || "New conversation",
          timestamp: new Date(),
          read: false,
        });
      }
    });

    // Check for deleted conversations
    previousIds.forEach((id) => {
      if (!currentIds.has(id)) {
        addNotification({
          id: `notif-${Date.now()}-deleted-${id}`,
          type: "deleted",
          title: "Conversation deleted",
          timestamp: new Date(),
          read: false,
        });
      }
    });

    setPreviousConversationIds(currentIds);
  }, [conversations]);

  const unreadCount = getUnreadCount();

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
              <span>Back</span>
            </Button>
          )}
        </div>

        {/* Right side - Help, Notifications, Profile */}
        <div className="flex items-center gap-1">
          {/* Help */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={() => window.open("https://docs.lyzr.ai", "_blank")}
          >
            <HelpCircle className="h-4 w-4" />
          </Button>

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
                  <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <span className="font-semibold text-sm">Notifications</span>
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground"
                    onClick={clearNotifications}
                  >
                    Clear all
                  </Button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No notifications</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Activity will appear here
                  </p>
                </div>
              ) : (
                <ScrollArea className="max-h-[300px]">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 px-3 py-2.5 border-b last:border-0 ${
                        !notification.read ? "bg-primary/5" : ""
                      }`}
                    >
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                          notification.type === "created"
                            ? "bg-green-100 dark:bg-green-900/30"
                            : "bg-red-100 dark:bg-red-900/30"
                        }`}
                      >
                        {notification.type === "created" ? (
                          <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {notification.type === "created"
                            ? "New conversation"
                            : "Conversation deleted"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {notification.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {formatTime(notification.timestamp)}
                        </p>
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
                    TC
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
                Settings
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
              <Key className="h-5 w-5" />
              Lyzr API Key
            </DialogTitle>
            <DialogDescription>
              Configure your Lyzr API key for RAG and AI features.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Cancel
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
    </>
  );
}
