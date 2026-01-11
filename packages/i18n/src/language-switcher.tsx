"use client";

import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";
import { supportedLocales, localeLabels, type SupportedLocale } from "./config";

export interface LanguageSwitcherProps {
  /** Display variant: 'icon' shows globe only, 'full' shows flag + name */
  variant?: "icon" | "full";
  /** Additional CSS classes */
  className?: string;
  /** Button component to use (from @tasco/ui) - accepts any Button-like component */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Button?: React.ComponentType<any>;
  /** DropdownMenu components to use (from @tasco/ui) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DropdownMenu?: React.ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DropdownMenuTrigger?: React.ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DropdownMenuContent?: React.ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DropdownMenuItem?: React.ComponentType<any>;
}

/**
 * Language Switcher Component
 *
 * A dropdown button that allows users to switch between supported languages.
 * The selected language is persisted to cookies/localStorage.
 *
 * @example
 * ```tsx
 * import { LanguageSwitcher } from "@tasco/i18n";
 * import { Button, DropdownMenu, ... } from "@tasco/ui";
 *
 * <LanguageSwitcher
 *   variant="icon"
 *   Button={Button}
 *   DropdownMenu={DropdownMenu}
 *   DropdownMenuTrigger={DropdownMenuTrigger}
 *   DropdownMenuContent={DropdownMenuContent}
 *   DropdownMenuItem={DropdownMenuItem}
 * />
 * ```
 */
export function LanguageSwitcher({
  variant = "icon",
  className,
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const currentLocale = (i18n.language as SupportedLocale) || "en";

  const handleLocaleChange = (locale: SupportedLocale) => {
    i18n.changeLanguage(locale);
  };

  // If no UI components provided, render a simple select fallback
  if (!Button || !DropdownMenu || !DropdownMenuTrigger || !DropdownMenuContent || !DropdownMenuItem) {
    return (
      <select
        value={currentLocale}
        onChange={(e) => handleLocaleChange(e.target.value as SupportedLocale)}
        className={className}
        aria-label="Select language"
      >
        {supportedLocales.map((locale) => (
          <option key={locale} value={locale}>
            {localeLabels[locale].flag} {localeLabels[locale].nativeName}
          </option>
        ))}
      </select>
    );
  }

  const currentLabel = localeLabels[currentLocale];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={variant === "icon" ? "icon" : "sm"}
          className={className}
        >
          {variant === "icon" ? (
            <Globe className="h-4 w-4" />
          ) : (
            <>
              <span className="mr-1">{currentLabel.flag}</span>
              <span>{currentLabel.nativeName}</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {supportedLocales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={currentLocale === locale ? "bg-accent" : ""}
          >
            <span className="mr-2">{localeLabels[locale].flag}</span>
            <span className="flex-1">{localeLabels[locale].nativeName}</span>
            {currentLocale === locale && (
              <Check className="ml-2 h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
