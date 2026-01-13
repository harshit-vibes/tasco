"use client";

import "@tasco/ui/globals.css";
import "./globals.css";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import { I18nProvider } from "@tasco/i18n";
import { SettingsProvider } from "@tasco/lyzr";
import { AppShell } from "../components/app-shell";
import { EntityFilterProvider } from "../lib/entity-filter-context";
import { BrandsProvider } from "../lib/brands-context";
import { Toaster } from "sonner";
import enApp from "../locales/en/app.json";
import viApp from "../locales/vi/app.json";
import enDashboard from "../locales/en/dashboard.json";
import viDashboard from "../locales/vi/dashboard.json";
import enLeads from "../locales/en/leads.json";
import viLeads from "../locales/vi/leads.json";
import enCustomers from "../locales/en/customers.json";
import viCustomers from "../locales/vi/customers.json";
import enMarketing from "../locales/en/marketing.json";
import viMarketing from "../locales/vi/marketing.json";
import enSidebar from "../locales/en/sidebar.json";
import viSidebar from "../locales/vi/sidebar.json";
import enEntities from "../locales/en/entities.json";
import viEntities from "../locales/vi/entities.json";

const appResources = {
  en: {
    app: enApp,
    dashboard: enDashboard,
    leads: enLeads,
    customers: enCustomers,
    marketing: enMarketing,
    sidebar: enSidebar,
    entities: enEntities,
  },
  vi: {
    app: viApp,
    dashboard: viDashboard,
    leads: viLeads,
    customers: viCustomers,
    marketing: viMarketing,
    sidebar: viSidebar,
    entities: viEntities,
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
        <SettingsProvider
          defaultApiKey={process.env.NEXT_PUBLIC_LYZR_API_KEY || ""}
        >
          <I18nProvider appResources={appResources}>
            <EntityFilterProvider>
              <BrandsProvider>
                <AppShell>{children}</AppShell>
              </BrandsProvider>
            </EntityFilterProvider>
          </I18nProvider>
        </SettingsProvider>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
