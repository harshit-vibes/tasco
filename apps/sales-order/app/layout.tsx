"use client";

import "./globals.css";
import { Inter, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { I18nProvider } from "@tasco/i18n";
import { AppShell } from "../components/app-shell";

// Import app-specific translations
import enApp from "../locales/en/app.json";
import viApp from "../locales/vi/app.json";

// App-specific i18n resources
const appResources = {
  en: { app: enApp },
  vi: { app: viApp },
};

// Vietnamese Industrial Typography System
const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-ibm-plex",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-jetbrains",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Sales Order AI | Inochi</title>
        <meta
          name="description"
          content="AI-powered order data entry automation for Inochi"
        />
      </head>
      <body
        className={`${inter.variable} ${ibmPlexSans.variable} ${jetbrainsMono.variable} min-h-screen bg-background font-body antialiased`}
      >
        <I18nProvider appResources={appResources}>
          <AppShell>{children}</AppShell>
        </I18nProvider>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
