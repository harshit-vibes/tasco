import i18n, { Resource } from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Shared translations
import enCommon from "./locales/en/common.json";
import viCommon from "./locales/vi/common.json";
import enChat from "./locales/en/chat.json";
import viChat from "./locales/vi/chat.json";
import enSidebar from "./locales/en/sidebar.json";
import viSidebar from "./locales/vi/sidebar.json";
import enHeader from "./locales/en/header.json";
import viHeader from "./locales/vi/header.json";

export const defaultNS = "common";
export const supportedLocales = ["en", "vi"] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

export const localeLabels: Record<SupportedLocale, { name: string; nativeName: string; flag: string }> = {
  en: { name: "English", nativeName: "English", flag: "🇬🇧" },
  vi: { name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳" },
};

/**
 * Shared resources available across all apps
 */
export const sharedResources = {
  en: {
    common: enCommon,
    chat: enChat,
    sidebar: enSidebar,
    header: enHeader,
  },
  vi: {
    common: viCommon,
    chat: viChat,
    sidebar: viSidebar,
    header: viHeader,
  },
};

export type AppResources = Record<string, Record<string, unknown>>;

let isInitialized = false;

/**
 * Initialize i18next with shared and app-specific resources
 * @param appResources - Optional app-specific translation resources
 */
export function initI18n(appResources?: AppResources) {
  if (isInitialized) {
    // If already initialized and new resources provided, merge them
    if (appResources) {
      Object.entries(appResources).forEach(([locale, namespaces]) => {
        Object.entries(namespaces).forEach(([ns, translations]) => {
          i18n.addResourceBundle(locale, ns, translations, true, true);
        });
      });
    }
    return i18n;
  }

  // Merge shared and app-specific resources
  const resources: Resource = {};

  for (const locale of supportedLocales) {
    resources[locale] = {
      ...sharedResources[locale],
      ...(appResources?.[locale] || {}),
    };
  }

  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "en",
      defaultNS,
      supportedLngs: [...supportedLocales],

      detection: {
        order: ["cookie", "localStorage", "navigator"],
        caches: ["cookie", "localStorage"],
        cookieOptions: { path: "/", sameSite: "strict" },
      },

      interpolation: {
        escapeValue: false, // React already escapes values
      },

      react: {
        useSuspense: false, // Important for client components
      },
    });

  isInitialized = true;
  return i18n;
}

/**
 * Get the current locale
 */
export function getCurrentLocale(): SupportedLocale {
  return (i18n.language as SupportedLocale) || "en";
}

/**
 * Change the current locale
 */
export function changeLocale(locale: SupportedLocale) {
  return i18n.changeLanguage(locale);
}

export { i18n };
