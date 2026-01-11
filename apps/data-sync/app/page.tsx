"use client";

import { useState } from "react";
import { Button } from "@tasco/ui";
import {
  RefreshCw,
  AlertCircle,
  Clock,
  Activity,
  ArrowRight,
  Database,
  Zap,
  TrendingUp,
  Server,
  Loader2,
} from "@tasco/ui/icons";
import { useTranslation } from "@tasco/i18n";
import { useSyncStatus, useAlerts } from "../lib/hooks";
import { formatTimeAgo } from "../lib/mock-data";
import Link from "next/link";

export default function DashboardPage() {
  const { t } = useTranslation("app");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch data from API
  const {
    systems,
    metrics,
    summary: systemSummary,
    loading: statusLoading,
    refresh: refreshStatus
  } = useSyncStatus();

  const {
    alerts,
    summary: alertSummary,
    loading: alertsLoading,
    refresh: refreshAlerts
  } = useAlerts();

  const openAlerts = alerts.filter(
    (a) => a.status === "open" || a.status === "investigating"
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refreshStatus(), refreshAlerts()]);
    setIsRefreshing(false);
  };

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case "critical":
        return "ds-severity-critical";
      case "high":
        return "ds-severity-high";
      case "medium":
        return "ds-severity-medium";
      default:
        return "ds-severity-low";
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "connected":
        return "ds-status-connected";
      case "delayed":
        return "ds-status-delayed";
      default:
        return "ds-status-error";
    }
  };

  const loading = statusLoading || alertsLoading;

  // Default metrics when loading
  const displayMetrics = metrics || {
    totalRecordsSynced: 0,
    pendingRecords: 0,
    failedRecords: 0,
    averageLatencyMs: 0,
    throughputPerMinute: 0,
    errorRate: 0,
    lastSuccessfulSync: new Date().toISOString(),
    uptimePercentage: 0,
  };

  return (
    <div className="container py-8 space-y-8 ds-stagger">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--ds-text-primary))]">
            {t("dashboard.title", "Sync Dashboard")}
          </h1>
          <p className="text-[hsl(var(--ds-text-secondary))] mt-1">
            {t("dashboard.subtitle", "Real-time data synchronization status for Inochi systems")}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing || loading}
          className="border-[hsl(var(--ds-border))] text-[hsl(var(--ds-text-secondary))] hover:bg-[hsl(var(--ds-surface-elevated))] hover:text-[hsl(var(--ds-text-primary))]"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {t("dashboard.refresh", "Refresh")}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Records Synced */}
        <div className="ds-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--ds-flow-success))]/10">
              <Database className="h-5 w-5 text-[hsl(var(--ds-flow-success))]" />
            </div>
            <span className="flex items-center gap-1 text-xs text-[hsl(var(--ds-flow-success))]">
              <TrendingUp className="h-3 w-3" />
              +12%
            </span>
          </div>
          <div className="ds-metric ds-metric-large">
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              displayMetrics.totalRecordsSynced.toLocaleString()
            )}
          </div>
          <p className="text-sm text-[hsl(var(--ds-text-secondary))] mt-2">
            {t("metrics.recordsSynced", "Records Synced Today")}
          </p>
        </div>

        {/* Pending Sync */}
        <div className="ds-card ds-card-warning p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--ds-flow-warning))]/10">
              <Clock className="h-5 w-5 text-[hsl(var(--ds-flow-warning))]" />
            </div>
            <span className="text-xs text-[hsl(var(--ds-flow-danger))]">
              {displayMetrics.failedRecords} {t("metrics.failed", "failed")}
            </span>
          </div>
          <div className="ds-metric text-4xl font-semibold text-[hsl(var(--ds-flow-warning))]">
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              displayMetrics.pendingRecords.toLocaleString()
            )}
          </div>
          <p className="text-sm text-[hsl(var(--ds-text-secondary))] mt-2">
            {t("metrics.pendingSync", "Pending Sync")}
          </p>
        </div>

        {/* Average Latency */}
        <div className="ds-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--ds-flow-primary))]/10">
              <Zap className="h-5 w-5 text-[hsl(var(--ds-flow-primary))]" />
            </div>
            <span className="text-xs text-[hsl(var(--ds-text-muted))]">
              {displayMetrics.throughputPerMinute}{t("metrics.throughput", "/min throughput")}
            </span>
          </div>
          <div className="ds-metric text-4xl font-semibold text-[hsl(var(--ds-text-primary))]">
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              `${(displayMetrics.averageLatencyMs / 1000).toFixed(1)}s`
            )}
          </div>
          <p className="text-sm text-[hsl(var(--ds-text-secondary))] mt-2">
            {t("metrics.averageLatency", "Average Latency")}
          </p>
        </div>

        {/* System Uptime */}
        <div className="ds-card ds-card-success p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--ds-flow-success))]/10">
              <Activity className="h-5 w-5 text-[hsl(var(--ds-flow-success))]" />
            </div>
            <span className="text-xs text-[hsl(var(--ds-flow-success))]">
              {systemSummary.connected}/{systemSummary.total} {t("metrics.systemsOnline", "systems online")}
            </span>
          </div>
          <div className="ds-metric text-4xl font-semibold text-[hsl(var(--ds-flow-success))]">
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              `${displayMetrics.uptimePercentage}%`
            )}
          </div>
          <p className="text-sm text-[hsl(var(--ds-text-secondary))] mt-2">
            {t("metrics.systemUptime", "System Uptime")}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Systems Status - 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[hsl(var(--ds-text-primary))]">
              {t("dashboard.systemStatus", "System Status")}
            </h2>
            <Link href="/systems">
              <Button
                variant="ghost"
                size="sm"
                className="text-[hsl(var(--ds-text-secondary))] hover:text-[hsl(var(--ds-text-primary))]"
              >
                {t("dashboard.viewAll", "View All")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="ds-card p-4 animate-pulse">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[hsl(var(--ds-surface-elevated))]" />
                      <div>
                        <div className="h-4 w-24 bg-[hsl(var(--ds-surface-elevated))] rounded" />
                        <div className="h-3 w-16 bg-[hsl(var(--ds-surface-elevated))] rounded mt-1" />
                      </div>
                    </div>
                  </div>
                  <div className="ds-flow-line mb-3" />
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-12 bg-[hsl(var(--ds-surface-elevated))] rounded" />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              systems.map((system) => (
                <div key={system.id} className="ds-card p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--ds-surface-elevated))]">
                        <Server className="h-5 w-5 text-[hsl(var(--ds-text-secondary))]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-[hsl(var(--ds-text-primary))]">
                          {system.name}
                        </h3>
                        <p className="text-xs text-[hsl(var(--ds-text-muted))] font-mono">
                          {system.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`ds-status-dot ${getStatusClass(system.status)}`} />
                      <span className="text-xs font-medium capitalize text-[hsl(var(--ds-text-secondary))]">
                        {t(`status.${system.status}`, system.status)}
                      </span>
                    </div>
                  </div>
                  <div className="ds-flow-line mb-3" />
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-semibold ds-metric text-[hsl(var(--ds-text-primary))]">
                        {system.recordsSyncedToday.toLocaleString()}
                      </div>
                      <p className="text-xs text-[hsl(var(--ds-text-muted))]">
                        {t("systems.syncedToday", "Synced")}
                      </p>
                    </div>
                    <div>
                      <div className="text-lg font-semibold ds-metric text-[hsl(var(--ds-flow-warning))]">
                        {system.pendingRecords}
                      </div>
                      <p className="text-xs text-[hsl(var(--ds-text-muted))]">
                        {t("systems.pending", "Pending")}
                      </p>
                    </div>
                    <div>
                      <div className="text-lg font-semibold ds-metric text-[hsl(var(--ds-text-primary))]">
                        {system.latencyMs || 0}ms
                      </div>
                      <p className="text-xs text-[hsl(var(--ds-text-muted))]">
                        {t("systems.latency", "Latency")}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Alerts - 1 column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-[hsl(var(--ds-text-primary))]">
                {t("dashboard.recentAlerts", "Recent Alerts")}
              </h2>
              {alertSummary.open > 0 && (
                <span className="flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-[hsl(var(--ds-flow-danger))] text-white text-xs font-medium">
                  {alertSummary.open}
                </span>
              )}
            </div>
            <Link href="/alerts">
              <Button
                variant="ghost"
                size="sm"
                className="text-[hsl(var(--ds-text-secondary))] hover:text-[hsl(var(--ds-text-primary))]"
              >
                {t("dashboard.viewAll", "View All")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="ds-card p-4 space-y-3 max-h-[400px] overflow-y-auto">
            {alertsLoading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 rounded-lg bg-[hsl(var(--ds-surface-elevated))] animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="h-4 w-4 rounded bg-[hsl(var(--ds-border))]" />
                    <div className="flex-1">
                      <div className="h-3 w-20 bg-[hsl(var(--ds-border))] rounded mb-2" />
                      <div className="h-4 w-full bg-[hsl(var(--ds-border))] rounded" />
                    </div>
                  </div>
                </div>
              ))
            ) : openAlerts.length === 0 ? (
              <div className="text-center py-8 text-[hsl(var(--ds-text-muted))]">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{t("alerts.noAlerts", "No Active Alerts")}</p>
                <p className="text-xs mt-1">{t("alerts.allNormal", "All systems are syncing normally")}</p>
              </div>
            ) : (
              openAlerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-lg bg-[hsl(var(--ds-surface-elevated))] border border-[hsl(var(--ds-border))]"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      className={`h-4 w-4 mt-0.5 ${
                        alert.severity === "critical"
                          ? "text-[hsl(var(--ds-flow-danger))]"
                          : alert.severity === "high"
                          ? "text-[hsl(38_92%_58%)]"
                          : "text-[hsl(var(--ds-flow-warning))]"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityClass(
                            alert.severity
                          )}`}
                        >
                          {t(`severity.${alert.severity}`, alert.severity)}
                        </span>
                        <span className="text-xs text-[hsl(var(--ds-text-muted))] font-mono">
                          {alert.sourceSystem}
                        </span>
                      </div>
                      <p className="text-sm text-[hsl(var(--ds-text-primary))] line-clamp-2">
                        {alert.title}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Sync Summary */}
      <div className="ds-card p-6">
        <h3 className="text-lg font-semibold text-[hsl(var(--ds-text-primary))] mb-6">
          {t("dashboard.syncSummary", "Sync Summary")}
        </h3>
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { from: "Haravan", to: "Bravo", count: 1247, pending: 89, failed: 15, progress: 85 },
            { from: "Shopee", to: "Bravo", count: 856, pending: 5, failed: 2, progress: 98 },
            { from: "Haravan", to: "Fulfillment", count: 1089, pending: 3, failed: 3, progress: 99 },
            { from: "Fulfillment", to: "Bravo", count: 423, pending: 12, failed: 3, progress: 96 },
          ].map((flow, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--ds-text-primary))]">
                <span className="font-mono">{flow.from}</span>
                <ArrowRight className="h-3 w-3 text-[hsl(var(--ds-flow-primary))]" />
                <span className="font-mono">{flow.to}</span>
              </div>
              <div className="ds-metric text-2xl font-bold text-[hsl(var(--ds-text-primary))]">
                {flow.count.toLocaleString()}
              </div>
              <p className="text-xs text-[hsl(var(--ds-text-muted))]">
                {flow.pending} pending &bull; {flow.failed} failed
              </p>
              <div className="ds-progress">
                <div
                  className="ds-progress-fill"
                  style={{
                    width: `${flow.progress}%`,
                    background: flow.progress >= 95
                      ? "hsl(var(--ds-flow-success))"
                      : flow.progress >= 80
                      ? "hsl(var(--ds-flow-warning))"
                      : "hsl(var(--ds-flow-danger))"
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
