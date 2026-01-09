import "@tasco/ui/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SettingsProvider } from "@tasco/lyzr";
import { AppShell } from "../components/app-shell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Compliance QA - Tasco Group",
  description: "AI-powered compliance Q&A system for Tasco Group",
};

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
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased`}>
        <SettingsProvider
          defaultApiKey={LYZR_API_KEY}
          defaultRagUrl={RAG_BASE_URL}
          storageKey="compliance-qa-settings"
        >
          <AppShell>
            {children}
          </AppShell>
        </SettingsProvider>
      </body>
    </html>
  );
}
