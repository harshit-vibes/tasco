"use client";

import "@tasco/ui/globals.css";
import "./globals.css";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import { I18nProvider } from "@tasco/i18n";
import { AppShell } from "../components/app-shell";
import { Toaster } from "sonner";
import enApp from "../locales/en/app.json";
import viApp from "../locales/vi/app.json";
import enDashboard from "../locales/en/dashboard.json";
import viDashboard from "../locales/vi/dashboard.json";
import enLeads from "../locales/en/leads.json";
import viLeads from "../locales/vi/leads.json";
import enCustomers from "../locales/en/customers.json";
import viCustomers from "../locales/vi/customers.json";

const appResources = {
  en: {
    app: enApp,
    dashboard: enDashboard,
    leads: enLeads,
    customers: enCustomers,
  },
  vi: {
    app: viApp,
    dashboard: viDashboard,
    leads: viLeads,
    customers: viCustomers,
  },
};

// Premium typography for automotive luxury feel
const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext", "vietnamese"],
  variable: "--font-display",
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
        <title>Customer Lifecycle | Tasco Auto</title>
        <meta
          name="description"
          content="AI-powered customer lifecycle management for Tasco Auto"
        />
      </head>
      <body
        className={`${dmSans.variable} ${spaceGrotesk.variable} min-h-screen bg-mesh font-sans antialiased`}
      >
        <I18nProvider appResources={appResources}>
          <AppShell>{children}</AppShell>
        </I18nProvider>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
