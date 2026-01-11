"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  Separator,
} from "@tasco/ui";
import {
  Settings,
  Key,
  User,
  Bell,
  Shield,
  Save,
  ExternalLink,
} from "@tasco/ui/icons";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your sales and pricing cockpit preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Settings */}
        <div className="space-y-6 lg:col-span-2">
          {/* API Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Configuration
              </CardTitle>
              <CardDescription>
                Configure your Lyzr API key for AI-powered features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Lyzr API Key</label>
                <div className="flex gap-2">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    placeholder="Enter your Lyzr API key..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? "Hide" : "Show"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your API key is stored locally and never sent to our servers.
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Agent Status</p>
                  <p className="text-sm text-muted-foreground">
                    Pricing Assistant AI Agent
                  </p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30">
                  Connected
                </Badge>
              </div>

              <Button className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save API Configuration
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Quote Approvals</p>
                  <p className="text-sm text-muted-foreground">
                    Notify when quotes are approved or rejected
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">High-Risk Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Alert when high-risk quotes need attention
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">AI Insights</p>
                  <p className="text-sm text-muted-foreground">
                    Receive AI-generated pricing recommendations
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          {/* Pricing Defaults */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Pricing Defaults
              </CardTitle>
              <CardDescription>
                Default settings for quote generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Coverage Type</label>
                  <select className="w-full rounded-md border bg-background px-3 py-2">
                    <option value="comprehensive">Comprehensive</option>
                    <option value="third-party">Third Party Only</option>
                    <option value="basic">Basic</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Deductible</label>
                  <select className="w-full rounded-md border bg-background px-3 py-2">
                    <option value="0">No Deductible</option>
                    <option value="1000000">1,000,000 VND</option>
                    <option value="2000000">2,000,000 VND</option>
                    <option value="5000000">5,000,000 VND</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Quote Validity Period (days)</label>
                <Input type="number" defaultValue="30" className="max-w-xs" />
              </div>

              <Button variant="outline" className="w-full">
                Reset to Defaults
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a
                  href="https://agent.lyzr.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Lyzr Agent Studio
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a
                  href="https://docs.lyzr.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Documentation
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* App Info */}
          <Card>
            <CardHeader>
              <CardTitle>App Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">App Name</span>
                <span className="font-medium">Sales & Pricing</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Proposal</span>
                <span className="font-medium">INS2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Business Unit</span>
                <span className="font-medium">Tasco Insurance</span>
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground">
                AI-powered sales and pricing cockpit for motor vehicle insurance.
                Part of Tasco Innovation Day demos.
              </p>
            </CardContent>
          </Card>

          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Current User
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white font-medium">
                  SA
                </div>
                <div>
                  <p className="font-medium">Sales Agent</p>
                  <p className="text-sm text-muted-foreground">
                    Tasco Insurance Branch
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
