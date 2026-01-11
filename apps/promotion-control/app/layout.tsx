"use client";

import "./globals.css";
import { DM_Sans, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
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

// Premium Typography System for Inochi
const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700"],
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
        <title>Promotion Control | Inochi</title>
        <meta
          name="description"
          content="AI-powered promotion overlap control for Inochi"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${dmSans.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <I18nProvider appResources={appResources}>
          <AppShell>{children}</AppShell>
        </I18nProvider>
        <Toaster
          position="bottom-right"
          richColors
          toastOptions={{
            style: {
              fontFamily: 'var(--font-plus-jakarta)',
            },
          }}
        />
      </body>
    </html>
  );
}
