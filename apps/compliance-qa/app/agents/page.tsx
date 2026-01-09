"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from "@tasco/ui";
import { Bot, ExternalLink, Loader2 } from "@tasco/ui/icons";

interface Agent {
  _id: string;
  name: string;
  description?: string;
  agent_role?: string;
  model?: string;
  provider_id?: string;
}

export default function AgentsPage() {
  const agentId = process.env.NEXT_PUBLIC_LYZR_AGENT_ID;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAgent() {
      if (!agentId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/agents/${agentId}`);
        const data = await response.json();

        if (data.success) {
          setAgent(data.agent);
        } else {
          setError(data.error || "Failed to fetch agent");
        }
      } catch (err) {
        console.error("Error fetching agent:", err);
        setError("Failed to fetch agent");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAgent();
  }, [agentId]);

  return (
    <div className="flex h-full flex-col p-6 overflow-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Agents</h1>
        <p className="text-sm text-muted-foreground">
          Configure AI agents for your Compliance QA system
        </p>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          <Card className="overflow-hidden">
            <CardContent className="py-12 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : agent ? (
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {agent.name}
                    </CardTitle>
                    {agent.description && (
                      <CardDescription className="mt-1">
                        {agent.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => window.open(`https://studio.lyzr.ai/agent-create/${agentId}`, "_blank")}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Lyzr Studio
                </Button>
              </div>
            </CardHeader>
          </Card>
        ) : error ? (
          <Card className="overflow-hidden">
            <CardContent className="py-12 text-center">
              <div className="mx-auto h-12 w-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <Bot className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Failed to Load Agent</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                {error}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <CardContent className="py-12 text-center">
              <div className="mx-auto h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                <Bot className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Agent Configured</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                Configure a Lyzr agent to enable AI-powered compliance Q&A capabilities.
              </p>
              <p className="text-xs text-muted-foreground">
                Set <code className="bg-muted px-1.5 py-0.5 rounded">NEXT_PUBLIC_LYZR_AGENT_ID</code> in your environment.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
