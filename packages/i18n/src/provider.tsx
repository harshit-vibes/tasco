"use client";

import { ReactNode, useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { initI18n, i18n, type AppResources, getCurrentLocale } from "./config";

export interface I18nProviderProps {
  children: ReactNode;
  /** App-specific translation resources */
  appResources?: AppResources;
}

/**
 * I18n Provider for Next.js App Router
 *
 * Wraps the application with i18next context and initializes translations.
 * Supports both shared translations (from @tasco/i18n) and app-specific translations.
 *
 * @example
 * ```tsx
 * // In app/layout.tsx
 * import { I18nProvider } from "@tasco/i18n";
 * import enApp from "../locales/en/app.json";
 * import viApp from "../locales/vi/app.json";
 *
 * const appResources = {
 *   en: { app: enApp },
 *   vi: { app: viApp },
 * };
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <I18nProvider appResources={appResources}>
 *       {children}
 *     </I18nProvider>
 *   );
 * }
 * ```
 */
export function I18nProvider({ children, appResources }: I18nProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");

  useEffect(() => {
    initI18n(appResources);
    setCurrentLang(getCurrentLocale());
    setIsInitialized(true);

    // Listen for language changes to update document lang attribute
    const handleLanguageChanged = (lng: string) => {
      setCurrentLang(lng);
      document.documentElement.lang = lng;
    };

    i18n.on("languageChanged", handleLanguageChanged);

    // Set initial lang attribute
    document.documentElement.lang = getCurrentLocale();

    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, [appResources]);

  // Show nothing until i18n is initialized to prevent hydration mismatch
  if (!isInitialized) {
    return null;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
