"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Sheet, SheetContent } from "@tasco/ui";

interface Entity {
  id: string;
  name: string;
  shortName: string;
  type: "parent" | "holding" | "subsidiary";
  parentId?: string;
}

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEntities() {
      try {
        const response = await fetch("/api/entities");
        const data = await response.json();
        if (data.success && data.data) {
          setEntities(data.data);
          // Default to first entity
          if (data.data.length > 0 && !selectedEntityId) {
            setSelectedEntityId(data.data[0].id);
          }
        }
      } catch (error) {
        console.error("Error loading entities:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadEntities();
  }, []);

  const handleEntityChange = (entityId: string | null) => {
    setSelectedEntityId(entityId);
    // Close mobile menu when entity changes
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <Header
          onMenuClick={() => setIsMobileMenuOpen(true)}
          selectedEntityId={selectedEntityId}
          onEntityChange={handleEntityChange}
          entities={entities}
          isLoading={isLoading}
        />
        <main className="flex-1 overflow-auto bg-muted/30">{children}</main>
      </div>
    </div>
  );
}
