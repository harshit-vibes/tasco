"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Button,
} from "@tasco/ui";
import { Key, Check, Eye, EyeOff } from "@tasco/ui/icons";
import { useSettings } from "@tasco/lyzr";

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveApiKey = () => {
    updateSettings({ lyzrApiKey: apiKeyInput });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const envApiKey = process.env.NEXT_PUBLIC_LYZR_API_KEY;
  const hasEnvKey = !!envApiKey;
  const displayKey = hasEnvKey ? envApiKey : settings.lyzrApiKey;

  return (
    <div className="flex h-full flex-col p-6 overflow-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure your Compliance QA system
        </p>
      </div>

      <div className="max-w-2xl">
        {/* API Key Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              <CardTitle className="text-lg">Lyzr API Key</CardTitle>
            </div>
            <CardDescription>
              Configure your Lyzr API key for RAG and AI features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasEnvKey ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  API key configured via environment variable
                </p>
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
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    placeholder="sk-..."
                    value={apiKeyInput || settings.lyzrApiKey}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button onClick={handleSaveApiKey} disabled={!apiKeyInput}>
                    {saved ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Saved
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your Lyzr API key to enable RAG and AI features. Get your key from{" "}
                  <a href="https://studio.lyzr.ai" target="_blank" rel="noopener" className="text-primary underline">
                    Lyzr Studio
                  </a>
                  .
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
