"use client";

import { ChatProvider } from "@tasco/lyzr";
import { CourseProvider } from "../lib/course-context";
import { ProgressProvider } from "../lib/progress-context";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface AppShellProps {
  children: React.ReactNode;
}

// Lyzr agent configuration (from environment variables)
const LYZR_AGENT_ID = process.env.NEXT_PUBLIC_LYZR_AGENT_ID;
const LYZR_VALIDATION_AGENT_ID = process.env.NEXT_PUBLIC_LYZR_VALIDATION_AGENT_ID;
const LYZR_API_KEY = process.env.NEXT_PUBLIC_LYZR_API_KEY;

export function AppShell({ children }: AppShellProps) {
  return (
    <CourseProvider>
      <ProgressProvider>
        <ChatProvider
          appId="e-learning"
          entityId="e-learning"
          agentId={LYZR_AGENT_ID}
          validationAgentId={LYZR_VALIDATION_AGENT_ID}
          apiKey={LYZR_API_KEY}
          enableValidation={!!LYZR_VALIDATION_AGENT_ID}
        >
          <div className="flex h-screen w-screen overflow-hidden bg-background">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col min-w-0">
              {/* Header */}
              <Header />

              {/* Page Content */}
              <main className="flex-1 overflow-y-auto scrollbar-thin">
                {children}
              </main>
            </div>
          </div>
        </ChatProvider>
      </ProgressProvider>
    </CourseProvider>
  );
}
