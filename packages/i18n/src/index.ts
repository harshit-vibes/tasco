// Configuration and utilities
export {
  i18n,
  initI18n,
  getCurrentLocale,
  changeLocale,
  supportedLocales,
  localeLabels,
  defaultNS,
  sharedResources,
  type SupportedLocale,
  type AppResources,
} from "./config";

// Provider component
export { I18nProvider, type I18nProviderProps } from "./provider";

// Language Switcher component
export { LanguageSwitcher, type LanguageSwitcherProps } from "./language-switcher";

// Re-export react-i18next hooks for convenience
export { useTranslation, Trans } from "react-i18next";
