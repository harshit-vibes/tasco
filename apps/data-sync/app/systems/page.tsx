"use client";

import { useState } from "react";
import { Button } from "@tasco/ui";
import {
  Database,
  RefreshCw,
  Settings,
  Clock,
  Activity,
  CheckCircle,
  Zap,
  ArrowRight,
  Server,
  Globe,
  AlertTriangle,
  Loader2,
} from "@tasco/ui/icons";
import { useTranslation } from "@tasco/i18n";
import { useSyncStatus, useAlerts, getAlertsBySystem } from "../../lib/hooks";
import { formatTimeAgo, formatLatency } from "../../lib/mock-data";

export default function SystemsPage() {
  const { t } = useTranslation("app");
  const [testingSystem, setTestingSystem] = useState<string | null>(null);

  // Fetch data from API
  const {
    systems,
    summary: systemSummary,
    loading,
    refresh
  } = useSyncStatus();

  const { alerts } = useAlerts();

  const handleTestConnection = (systemId: string) => {
    setTestingSystem(systemId);
    setTimeout(() => setTestingSystem(null), 2000);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "connected": return "ds-status-connected";
      case "delayed": return "ds-status-delayed";
      default: return "ds-status-error";
    }
  };

  return (
    <div className="container py-8 space-y-8 ds-stagger">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--ds-text-primary))]">
            {t("systems.title", "Connected Systems")}
          </h1>
          <p className="text-[hsl(var(--ds-text-secondary))] mt-1">
            {t("systems.subtitle", "Manage and monitor data source connections")}
          </p>
        </div>
        <Button
          variant="outline"
          className="border-[hsl(var(--ds-border))] text-[hsl(var(--ds-text-secondary))] hover:bg-[hsl(var(--ds-surface-elevated))] hover:text-[hsl(var(--ds-text-primary))]"
        >
          <Settings className="h-4 w-4 mr-2" />
          {t("systems.configure", "Configure")}
        </Button>
      </div>

      {/* System Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="ds-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--ds-flow-primary))]/10">
              <Database className="h-6 w-6 text-[hsl(var(--ds-flow-primary))]" />
            </div>
            <div>
              <div className="ds-metric text-3xl font-bold text-[hsl(var(--ds-text-primary))]">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : systemSummary.total}
              </div>
              <p className="text-sm text-[hsl(var(--ds-text-secondary))]">
                {t("systems.totalSystems", "Total Systems")}
              </p>
            </div>
          </div>
        </div>

        <div className="ds-card ds-card-success p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--ds-flow-success))]/10">
              <CheckCircle className="h-6 w-6 text-[hsl(var(--ds-flow-success))]" />
            </div>
            <div>
              <div className="ds-metric text-3xl font-bold text-[hsl(var(--ds-flow-success))]">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : systemSummary.connected}
              </div>
              <p className="text-sm text-[hsl(var(--ds-text-secondary))]">
                {t("systems.connected", "Connected")}
              </p>
            </div>
          </div>
        </div>

        <div className="ds-card ds-card-warning p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--ds-flow-warning))]/10">
              <Clock className="h-6 w-6 text-[hsl(var(--ds-flow-warning))]" />
            </div>
            <div>
              <div className="ds-metric text-3xl font-bold text-[hsl(var(--ds-flow-warning))]">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : systemSummary.delayed}
              </div>
              <p className="text-sm text-[hsl(var(--ds-text-secondary))]">
                {t("systems.delayed", "Delayed")}
              </p>
            </div>
          </div>
        </div>

        <div className="ds-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--ds-flow-danger))]/10">
              <AlertTriangle className="h-6 w-6 text-[hsl(var(--ds-flow-danger))]" />
            </div>
            <div>
              <div className="ds-metric text-3xl font-bold text-[hsl(var(--ds-text-primary))]">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : systemSummary.error}
              </div>
              <p className="text-sm text-[hsl(var(--ds-text-secondary))]">
                {t("systems.errors", "Errors")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Systems Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="ds-card overflow-hidden animate-pulse">
              <div className="p-5 border-b border-[hsl(var(--ds-border))]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-[hsl(var(--ds-surface-elevated))]" />
                    <div>
                      <div className="h-4 w-32 bg-[hsl(var(--ds-surface-elevated))] rounded" />
                      <div className="h-3 w-24 bg-[hsl(var(--ds-surface-elevated))] rounded mt-2" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="ds-flow-line" />
              <div className="p-5">
                <div className="grid grid-cols-3 gap-4 mb-5">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-12 bg-[hsl(var(--ds-surface-elevated))] rounded" />
                  ))}
                </div>
                <div className="space-y-2.5 mb-5">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-4 bg-[hsl(var(--ds-surface-elevated))] rounded" />
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          systems.map((system, index) => {
            const systemAlerts = getAlertsBySystem(alerts, system.id);
            const openAlerts = systemAlerts.filter((a) => a.status === "open");

            return (
              <div
                key={system.id}
                className="ds-card overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Card header with status */}
                <div className="p-5 border-b border-[hsl(var(--ds-border))]">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--ds-surface-elevated))]">
                        <Server className="h-6 w-6 text-[hsl(var(--ds-text-secondary))]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[hsl(var(--ds-text-primary))]">
                          {system.name}
                        </h3>
                        <p className="text-sm text-[hsl(var(--ds-text-muted))] font-mono capitalize">
                          {system.type} System
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`ds-status-dot ${getStatusClass(system.status)}`} />
                      <span className="text-sm font-medium capitalize text-[hsl(var(--ds-text-secondary))]">
                        {t(`status.${system.status}`, system.status)}
                      </span>
                    </div>
                  </div>

                  {openAlerts.length > 0 && (
                    <div className="mt-3 px-3 py-2 rounded-lg bg-[hsl(var(--ds-flow-danger))]/10 border border-[hsl(var(--ds-flow-danger))]/20">
                      <span className="text-xs font-medium text-[hsl(var(--ds-flow-danger))]">
                        {openAlerts.length} active alert{openAlerts.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>

                {/* Animated flow line */}
                <div className="ds-flow-line" />

                {/* Metrics */}
                <div className="p-5">
                  <div className="grid grid-cols-3 gap-4 mb-5">
                    <div className="text-center">
                      <div className="ds-metric text-2xl font-bold text-[hsl(var(--ds-text-primary))]">
                        {system.recordsSyncedToday.toLocaleString()}
                      </div>
                      <p className="text-xs text-[hsl(var(--ds-text-muted))]">
                        {t("systems.syncedToday", "Synced Today")}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="ds-metric text-2xl font-bold text-[hsl(var(--ds-flow-warning))]">
                        {system.pendingRecords}
                      </div>
                      <p className="text-xs text-[hsl(var(--ds-text-muted))]">
                        {t("systems.pending", "Pending")}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="ds-metric text-2xl font-bold text-[hsl(var(--ds-text-primary))]">
                        {formatLatency(system.latencyMs || 0)}
                      </div>
                      <p className="text-xs text-[hsl(var(--ds-text-muted))]">
                        {t("systems.latency", "Latency")}
                      </p>
                    </div>
                  </div>

                  {/* Connection Details */}
                  <div className="space-y-2.5 mb-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[hsl(var(--ds-text-muted))] flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        {t("systems.lastSync", "Last Sync")}
                      </span>
                      <span className="text-[hsl(var(--ds-text-secondary))] font-mono">
                        {formatTimeAgo(system.lastSyncAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[hsl(var(--ds-text-muted))] flex items-center gap-2">
                        <Activity className="h-3.5 w-3.5" />
                        {t("systems.syncFrequency", "Sync Frequency")}
                      </span>
                      <span className="text-[hsl(var(--ds-text-secondary))] font-mono">
                        Every {system.config.syncFrequency} min
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[hsl(var(--ds-text-muted))] flex items-center gap-2">
                        <Zap className="h-3.5 w-3.5" />
                        {t("systems.timeout", "Timeout")}
                      </span>
                      <span className="text-[hsl(var(--ds-text-secondary))] font-mono">
                        {system.config.timeout / 1000}s
                      </span>
                    </div>
                  </div>

                  {/* API Endpoint */}
                  {system.apiEndpoint && (
                    <div className="p-3 rounded-lg bg-[hsl(var(--ds-surface-elevated))] border border-[hsl(var(--ds-border))] mb-4">
                      <p className="text-xs text-[hsl(var(--ds-text-muted))] mb-1 flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {t("systems.apiEndpoint", "API Endpoint")}
                      </p>
                      <p className="text-xs font-mono text-[hsl(var(--ds-text-secondary))] truncate">
                        {system.apiEndpoint}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-[hsl(var(--ds-border))] text-[hsl(var(--ds-text-secondary))] hover:bg-[hsl(var(--ds-surface-elevated))] hover:text-[hsl(var(--ds-text-primary))]"
                      onClick={() => handleTestConnection(system.id)}
                      disabled={testingSystem === system.id}
                    >
                      {testingSystem === system.id ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                          {t("systems.testing", "Testing...")}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                          {t("systems.testConnection", "Test Connection")}
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[hsl(var(--ds-text-muted))] hover:text-[hsl(var(--ds-text-primary))]"
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Data Flow Diagram */}
      <div className="ds-card p-6">
        <h3 className="text-lg font-semibold text-[hsl(var(--ds-text-primary))] mb-2">
          {t("systems.dataFlow", "Data Flow")}
        </h3>
        <p className="text-sm text-[hsl(var(--ds-text-secondary))] mb-8">
          {t("systems.dataFlowDesc", "How data synchronizes between systems")}
        </p>

        <div className="flex items-center justify-center gap-6 py-8 flex-wrap">
          {/* Source Systems */}
          <div className="flex flex-col gap-3 items-center">
            <span className="text-xs font-medium text-[hsl(var(--ds-text-muted))] uppercase tracking-wider">
              Sources
            </span>
            <div className="flex flex-col gap-2">
              {["Haravan", "Shopee", "Website"].map((source) => (
                <div
                  key={source}
                  className="px-4 py-2 rounded-lg bg-[hsl(var(--ds-surface-elevated))] border border-[hsl(var(--ds-border))] text-sm font-medium text-[hsl(var(--ds-text-secondary))]"
                >
                  {source}
                </div>
              ))}
            </div>
          </div>

          {/* Flow Arrow 1 */}
          <div className="relative">
            <div className="w-16 h-0.5 bg-[hsl(var(--ds-border))]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-0.5">
              <div className="h-full bg-[hsl(var(--ds-flow-primary))] animate-flow" />
            </div>
            <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-5 w-5 text-[hsl(var(--ds-flow-primary))]" />
          </div>

          {/* Data Sync Hub */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-medium text-[hsl(var(--ds-text-muted))] uppercase tracking-wider">
              Sync Engine
            </span>
            <div className="relative">
              <div className="absolute inset-0 bg-[hsl(var(--ds-flow-primary))] blur-xl opacity-20 rounded-full" />
              <div className="relative p-5 rounded-2xl bg-[hsl(var(--ds-flow-primary))]/10 border-2 border-[hsl(var(--ds-flow-primary))]/30">
                <RefreshCw className="h-10 w-10 text-[hsl(var(--ds-flow-primary))] animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </div>
            <span className="text-sm font-semibold text-gradient-flow">Data Sync</span>
          </div>

          {/* Flow Arrow 2 */}
          <div className="relative">
            <div className="w-16 h-0.5 bg-[hsl(var(--ds-border))]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-0.5">
              <div className="h-full bg-[hsl(var(--ds-flow-primary))] animate-flow" style={{ animationDelay: '1s' }} />
            </div>
            <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-5 w-5 text-[hsl(var(--ds-flow-primary))]" />
          </div>

          {/* Target Systems */}
          <div className="flex flex-col gap-3 items-center">
            <span className="text-xs font-medium text-[hsl(var(--ds-text-muted))] uppercase tracking-wider">
              Targets
            </span>
            <div className="flex flex-col gap-2">
              {["Bravo ERP", "Fulfillment"].map((target) => (
                <div
                  key={target}
                  className="px-4 py-2 rounded-lg bg-[hsl(var(--ds-surface-elevated))] border border-[hsl(var(--ds-border))] text-sm font-medium text-[hsl(var(--ds-text-secondary))]"
                >
                  {target}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
