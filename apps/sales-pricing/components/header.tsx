"use client";

import { useState, useEffect } from "react";
import {
  Button,
  EntitySelector,
  GuideCarousel,
  GuideTrigger,
  useAppGuide,
} from "@tasco/ui";
import { Bell, Menu, Plus } from "@tasco/ui/icons";
import Link from "next/link";

// Entity type (simplified for now)
interface Entity {
  id: string;
  name: string;
  shortName: string;
  type: "parent" | "holding" | "subsidiary";
  parentId?: string;
}

interface HeaderProps {
  onMenuClick?: () => void;
  selectedEntityId: string | null;
  onEntityChange: (entityId: string | null) => void;
  entities: Entity[];
  isLoading?: boolean;
}

export function Header({
  onMenuClick,
  selectedEntityId,
  onEntityChange,
  entities,
  isLoading = false,
}: HeaderProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  // App guide (feature showcase)
  const {
    guide,
    isOpen: isGuideOpen,
    setIsOpen: setIsGuideOpen,
    openGuide,
  } = useAppGuide("sales-pricing");

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </button>

        {/* Entity Selector */}
        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="h-9 w-64 animate-pulse rounded-md bg-muted" />
          ) : (
            <EntitySelector
              entities={entities}
              selectedEntityId={selectedEntityId}
              onEntityChange={onEntityChange}
              mode="single"
              placeholder="Select branch..."
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Action: New Quote */}
          <Link href="/quote">
            <Button size="sm" className="hidden bg-emerald-600 hover:bg-emerald-700 md:flex">
              <Plus className="mr-1 h-4 w-4" />
              New Quote
            </Button>
          </Link>

          {/* Help / Feature Guide */}
          {guide && <GuideTrigger onClick={openGuide} />}

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>

          {/* User placeholder */}
          <div className="hidden items-center gap-2 rounded-lg border px-3 py-2 md:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white text-sm font-medium">
              SA
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Sales Agent</p>
              <p className="text-xs text-muted-foreground">Tasco Insurance</p>
            </div>
          </div>
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
