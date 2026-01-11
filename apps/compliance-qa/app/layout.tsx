"use client";

import "./globals.css";
import { Inter, Source_Serif_4 } from "next/font/google";
import { Toaster } from "sonner";
import { SettingsProvider } from "@tasco/lyzr";
import { I18nProvider } from "@tasco/i18n";
import { AppShell } from "../components/app-shell";

// Import app-specific translations
import enCompliance from "../locales/en/compliance.json";
import viCompliance from "../locales/vi/compliance.json";

// App-specific i18n resources
const appResources = {
  en: { compliance: enCompliance },
  vi: { compliance: viCompliance },
};

// Typography: Inter for body, Source Serif 4 for headings
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  weight: ["400", "600", "700"],
});

// Get API key from environment (available at build time for NEXT_PUBLIC_ vars)
const LYZR_API_KEY = process.env.NEXT_PUBLIC_LYZR_API_KEY || "";
const RAG_BASE_URL = process.env.NEXT_PUBLIC_RAG_URL || "https://rag-prod.studio.lyzr.ai";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Compliance Super AI - Tasco Group</title>
        <meta name="description" content="AI-powered compliance Q&A system for Tasco Group" />
      </head>
      <body className={`${inter.variable} ${sourceSerif.variable} min-h-screen bg-background font-sans antialiased`}>
        <I18nProvider appResources={appResources}>
          <SettingsProvider
            defaultApiKey={LYZR_API_KEY}
            defaultRagUrl={RAG_BASE_URL}
            storageKey="compliance-qa-settings"
          >
            <AppShell>
              {children}
            </AppShell>
          </SettingsProvider>
        </I18nProvider>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
