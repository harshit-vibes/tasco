"use client";

import "./globals.css";
import { I18nProvider } from "@tasco/i18n";
import { ChatProvider } from "@tasco/lyzr";
import { GuideCarousel, useAppGuide } from "@tasco/ui";

import enApp from "../locales/en/app.json";
import viApp from "../locales/vi/app.json";
import { AppShell } from "../components/app-shell";

const appResources = {
  en: { app: enApp },
  vi: { app: viApp },
};

// Lyzr agent configuration (from environment variables)
const LYZR_AGENT_ID = process.env.NEXT_PUBLIC_LYZR_AGENT_ID;
const LYZR_API_KEY = process.env.NEXT_PUBLIC_LYZR_API_KEY;

function AppContent({ children }: { children: React.ReactNode }) {
  const {
    guide,
    isOpen: isGuideOpen,
    setIsOpen: setIsGuideOpen,
    openGuide,
  } = useAppGuide("data-sync");

  return (
    <>
      <AppShell onOpenGuide={openGuide}>{children}</AppShell>
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Data Sync | Inochi</title>
        <meta
          name="description"
          content="AI-powered sales and revenue data synchronization for Inochi"
        />
      </head>
      <body className="min-h-screen bg-[hsl(var(--ds-background))] font-sans antialiased">
        <I18nProvider appResources={appResources}>
          <ChatProvider
            appId="data-sync"
            entityId="data-sync"
            agentId={LYZR_AGENT_ID}
            apiKey={LYZR_API_KEY}
          >
            <AppContent>{children}</AppContent>
          </ChatProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
