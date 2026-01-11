"use client";

import { useState } from "react";
import { useTranslation } from "@tasco/i18n";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Label,
} from "@tasco/ui";
import {
  Settings,
  Key,
  Globe,
  Eye,
  EyeOff,
  Check,
  Moon,
  Sun,
  Bot,
  Database,
  ExternalLink,
} from "@tasco/ui/icons";
import { useSettings } from "@tasco/lyzr";
import { LanguageSwitcher } from "@tasco/i18n";

export default function SettingsPage() {
  const { t } = useTranslation("app");
  const { settings, updateSettings } = useSettings();

  const [apiKeyInput, setApiKeyInput] = useState(settings.lyzrApiKey || "");
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const envApiKey = process.env.NEXT_PUBLIC_LYZR_API_KEY;
  const hasEnvKey = !!envApiKey;
  const displayKey = hasEnvKey ? envApiKey : settings.lyzrApiKey;

  const handleSaveApiKey = () => {
    updateSettings({ lyzrApiKey: apiKeyInput });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("settings.subtitle")}</p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t("settings.general.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <Label>{t("settings.general.language")}</Label>
                <p className="text-xs text-muted-foreground">
                  Select your preferred language
                </p>
              </div>
            </div>
            <LanguageSwitcher
              variant="full"
              Button={Button as any}
              DropdownMenu={require("@tasco/ui").DropdownMenu}
              DropdownMenuTrigger={require("@tasco/ui").DropdownMenuTrigger}
              DropdownMenuContent={require("@tasco/ui").DropdownMenuContent}
              DropdownMenuItem={require("@tasco/ui").DropdownMenuItem}
            />
          </div>

          {/* Theme */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                {theme === "light" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </div>
              <div>
                <Label>{t("settings.general.theme")}</Label>
                <p className="text-xs text-muted-foreground">
                  Choose between light and dark mode
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              {theme === "light" ? t("settings.general.dark") : t("settings.general.light")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Key className="h-5 w-5" />
            {t("settings.api.title")}
          </CardTitle>
          <CardDescription>{t("settings.api.apiKeyDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasEnvKey ? (
            <div className="space-y-2">
              <Label>Lyzr API Key (Environment)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={displayKey}
                  readOnly
                  className="font-mono text-sm bg-muted"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                API key is configured via environment variable
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>{t("settings.api.apiKey")}</Label>
              <div className="flex items-center gap-2">
                <Input
                  type={showApiKey ? "text" : "password"}
                  placeholder="sk-..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Get your API key from{" "}
                <a
                  href="https://studio.lyzr.ai"
                  target="_blank"
                  rel="noopener"
                  className="text-primary underline"
                >
                  Lyzr Studio
                </a>
              </p>
              <Button
                onClick={handleSaveApiKey}
                disabled={!apiKeyInput || saved}
                className="mt-2"
              >
                {saved ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Saved
                  </>
                ) : (
                  t("settings.api.save")
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Links</CardTitle>
          <CardDescription>
            Access external tools and resources
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <a
            href="https://studio.lyzr.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Agent Builder</p>
                <p className="text-sm text-muted-foreground">
                  Configure AI agent in Lyzr Studio
                </p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
          </a>

          <a
            href="https://studio.lyzr.ai/knowledge-base"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Database className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Knowledge Base</p>
                <p className="text-sm text-muted-foreground">
                  Manage RAG knowledge base
                </p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
