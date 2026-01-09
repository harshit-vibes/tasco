"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Settings {
  lyzrApiKey: string;
  ragBaseUrl: string;
}

export interface SettingsContextType {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  isLoaded: boolean;
}

export interface SettingsProviderProps {
  children: ReactNode;
  /** Unique storage key for this app's settings */
  storageKey?: string;
  /** Default Lyzr API key (usually from env) */
  defaultApiKey?: string;
  /** Default RAG base URL */
  defaultRagUrl?: string;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({
  children,
  storageKey = "tasco-app-settings",
  defaultApiKey = "",
  defaultRagUrl = "https://rag-prod.studio.lyzr.ai",
}: SettingsProviderProps) {
  const defaultSettings: Settings = {
    lyzrApiKey: defaultApiKey,
    ragBaseUrl: defaultRagUrl,
  };

  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({
          ...defaultSettings,
          ...parsed,
          // Always use env API key if available (for local dev)
          lyzrApiKey: defaultApiKey || parsed.lyzrApiKey || "",
        });
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
    setIsLoaded(true);
  }, [storageKey, defaultApiKey]);

  // Save settings to localStorage on change
  const updateSettings = (updates: Partial<Settings>) => {
    setSettings((prev) => {
      const newSettings = { ...prev, ...updates };
      try {
        localStorage.setItem(storageKey, JSON.stringify(newSettings));
      } catch (err) {
        console.error("Failed to save settings:", err);
      }
      return newSettings;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoaded }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

/** Helper hook to get the effective API key */
export function useLyzrApiKey(defaultApiKey?: string): string {
  const { settings } = useSettings();

  // Prioritize: env variable > settings > empty
  if (defaultApiKey) {
    return defaultApiKey;
  }
  return settings.lyzrApiKey;
}
