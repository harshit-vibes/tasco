"use client";

import "./globals.css";
import { AppShell } from "../components/app-shell";
import { SettingsProvider } from "@tasco/lyzr";
import { I18nProvider } from "@tasco/i18n";

import enElearning from "../locales/en/elearning.json";
import viElearning from "../locales/vi/elearning.json";

const appResources = {
  en: { elearning: enElearning },
  vi: { elearning: viElearning },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>AI Learning Factory | Tasco Insurance</title>
        <meta name="description" content="AI-powered e-learning platform for insurance training" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <I18nProvider appResources={appResources}>
          <SettingsProvider>
            <AppShell>{children}</AppShell>
          </SettingsProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
