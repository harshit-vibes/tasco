"use client";

import "./globals.css";
import { I18nProvider } from "@tasco/i18n";
import { AppShell } from "@/components/app-shell";

import enApp from "../locales/en/app.json";
import viApp from "../locales/vi/app.json";

const appResources = {
  en: { app: enApp },
  vi: { app: viApp },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Risk Radar | Tasco Insurance</title>
        <meta
          name="description"
          content="AI-powered risk and profitability monitoring for Tasco Insurance"
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <I18nProvider appResources={appResources}>
          <AppShell>{children}</AppShell>
        </I18nProvider>
      </body>
    </html>
  );
}
