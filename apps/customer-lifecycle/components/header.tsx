"use client";

import { useState, useEffect } from "react";
import { Button, EntitySelector, GuideCarousel, GuideTrigger, useAppGuide } from "@tasco/ui";
import { Bell, Menu, Search, Sparkles } from "@tasco/ui/icons";
import { getAllEntities, getUnreadNotificationCountForApp, getUsersByRole, type Entity, type User } from "../lib/data-layer";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntityIds, setSelectedEntityIds] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // App guide (feature showcase)
  const { guide, isOpen: isGuideOpen, setIsOpen: setIsGuideOpen, openGuide } = useAppGuide("customer-lifecycle");

  useEffect(() => {
    async function loadData() {
      try {
        const entitiesData = await getAllEntities();
        setEntities(entitiesData);

        // Default to first entity if available
        if (entitiesData.length > 0 && selectedEntityIds.length === 0) {
          setSelectedEntityIds([entitiesData[0].id]);
        }

        // Load unread notification count
        const count = await getUnreadNotificationCountForApp();
        setUnreadCount(count);

        // Load current user (first manager as demo)
        const managers = await getUsersByRole("manager");
        if (managers.length > 0) {
          setCurrentUser(managers[0]);
        }
      } catch (error) {
        console.error("Error loading header data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const handleEntityChange = (entityId: string | null) => {
    setSelectedEntityIds(entityId ? [entityId] : []);
    // TODO: Trigger data refresh for selected entities
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
        {/* Left: Mobile menu + Search */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </button>

          {/* Search */}
          <div className="hidden md:flex relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search leads, customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-64 rounded-xl border-0 bg-muted/50 pl-10 pr-4 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all focus:w-80"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
        </div>

        {/* Center: Entity Selector */}
        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="h-10 w-48 animate-pulse rounded-xl bg-muted" />
          ) : (
            <EntitySelector
              entities={entities}
              selectedEntityId={selectedEntityIds[0] || null}
              onEntityChange={handleEntityChange}
              mode="single"
              placeholder="Select showroom..."
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

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl">
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white ring-2 ring-card">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>

          {/* User Profile */}
          {currentUser ? (
            <button className="hidden items-center gap-3 rounded-xl border bg-card px-3 py-2 transition-all hover:border-primary/20 hover:shadow-md md:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand text-sm font-semibold text-white shadow-md">
                {getUserInitials(currentUser)}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium leading-tight">{currentUser.fullName}</p>
                <p className="text-[11px] text-muted-foreground">{formatRole(currentUser.role)}</p>
              </div>
            </button>
          ) : (
            <div className="hidden items-center gap-3 rounded-xl border px-3 py-2 md:flex">
              <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
              <div className="space-y-1">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-3 w-16 animate-pulse rounded bg-muted" />
              </div>
            </div>
          )}
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
