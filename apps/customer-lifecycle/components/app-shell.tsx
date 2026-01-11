"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Sheet, SheetContent } from "@tasco/ui";
import { ChatProvider } from "@tasco/lyzr";

interface AppShellProps {
  children: React.ReactNode;
}

// Lyzr agent configuration (from environment variables)
const LYZR_AGENT_ID = process.env.NEXT_PUBLIC_LYZR_AGENT_ID;
const LYZR_API_KEY = process.env.NEXT_PUBLIC_LYZR_API_KEY;

export function AppShell({ children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <ChatProvider
      appId="customer-lifecycle"
      entityId="customer-lifecycle"
      agentId={LYZR_AGENT_ID}
      apiKey={LYZR_API_KEY}
    >
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Mobile Sidebar */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <Header onMenuClick={() => setMobileMenuOpen(true)} />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ChatProvider>
  );
}
