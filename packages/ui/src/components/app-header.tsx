"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { EntitySelector, Entity } from "./entity-selector";
import { Button } from "./button";
import { Settings, Bell, User, HelpCircle } from "lucide-react";

export interface AppHeaderProps {
  appName: string;
  appIcon?: React.ReactNode;
  entities?: Entity[];
  selectedEntityId?: string | null;
  onEntityChange?: (entityId: string | null) => void;
  showEntitySelector?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

export function AppHeader({
  appName,
  appIcon,
  entities = [],
  selectedEntityId = null,
  onEntityChange,
  showEntitySelector = true,
  actions,
  className,
}: AppHeaderProps) {
  return (
    <header
      className={cn(
        "flex h-14 items-center justify-between border-b bg-background px-4",
        className
      )}
    >
      {/* Left: App Name & Entity Selector */}
      <div className="flex items-center gap-4">
        {appIcon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            {appIcon}
          </div>
        )}

        <h1 className="text-lg font-semibold">{appName}</h1>

        {showEntitySelector && entities.length > 0 && onEntityChange && (
          <>
            <div className="h-6 w-px bg-border" />
            <EntitySelector
              entities={entities}
              selectedEntityId={selectedEntityId}
              onEntityChange={onEntityChange}
              allowAll={true}
              allLabel="All Companies"
              showHierarchy={true}
            />
          </>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {actions}

        <Button variant="ghost" size="icon" className="h-8 w-8">
          <HelpCircle className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Bell className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8">
          <User className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}

// Simple header variant without entity selector
export function SimpleHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex h-14 items-center justify-between border-b bg-background px-4",
        className
      )}
    >
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
