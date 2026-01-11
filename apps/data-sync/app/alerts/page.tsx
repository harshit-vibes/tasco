"use client";

import { useState, useMemo } from "react";
import { Button } from "@tasco/ui";
import {
  AlertCircle,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Loader2,
  RefreshCw,
} from "@tasco/ui/icons";
import { useTranslation } from "@tasco/i18n";
import { useSyncStatus, useAlerts } from "../../lib/hooks";
import { formatTimeAgo } from "../../lib/mock-data";
import type { AlertSeverity, AlertStatus } from "../../lib/types";

export default function AlertsPage() {
  const { t } = useTranslation("app");
  const [statusFilter, setStatusFilter] = useState<AlertStatus | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | "all">("all");
  const [systemFilter, setSystemFilter] = useState<string | "all">("all");

  // Fetch data from API
  const { systems } = useSyncStatus();
  const {
    alerts,
    summary: alertSummary,
    loading,
    refresh,
    investigate,
    resolve,
    dismiss
  } = useAlerts({
    status: statusFilter,
    severity: severityFilter,
    system: systemFilter
  });

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (statusFilter !== "all" && alert.status !== statusFilter) return false;
      if (severityFilter !== "all" && alert.severity !== severityFilter) return false;
      if (
        systemFilter !== "all" &&
        alert.sourceSystem !== systemFilter &&
        alert.targetSystem !== systemFilter
      ) return false;
      return true;
    });
  }, [alerts, statusFilter, severityFilter, systemFilter]);

  const handleInvestigate = async (alertId: string, detectedAt: string) => {
    try {
      await investigate(alertId, detectedAt);
    } catch (err) {
      console.error("Failed to update alert:", err);
    }
  };

  const handleDismiss = async (alertId: string, detectedAt: string) => {
    try {
      await dismiss(alertId, detectedAt);
    } catch (err) {
      console.error("Failed to dismiss alert:", err);
    }
  };

  const handleResolve = async (alertId: string, detectedAt: string) => {
    try {
      await resolve(alertId, detectedAt);
    } catch (err) {
      console.error("Failed to resolve alert:", err);
    }
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setSeverityFilter("all");
    setSystemFilter("all");
  };

  const hasActiveFilters =
    statusFilter !== "all" || severityFilter !== "all" || systemFilter !== "all";

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case "critical": return "ds-severity-critical";
      case "high": return "ds-severity-high";
      case "medium": return "ds-severity-medium";
      default: return "ds-severity-low";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <AlertCircle className="h-4 w-4" />;
      case "investigating": return <Eye className="h-4 w-4" />;
      case "resolved": return <CheckCircle2 className="h-4 w-4" />;
      case "dismissed": return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="container py-8 space-y-8 ds-stagger">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--ds-text-primary))]">
            {t("alerts.title", "Sync Alerts")}
          </h1>
          <p className="text-[hsl(var(--ds-text-secondary))] mt-1">
            {t("alerts.subtitle", "Monitor and resolve data synchronization discrepancies")}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={refresh}
          disabled={loading}
          className="border-[hsl(var(--ds-border))] text-[hsl(var(--ds-text-secondary))] hover:bg-[hsl(var(--ds-surface-elevated))] hover:text-[hsl(var(--ds-text-primary))]"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          {t("alerts.refresh", "Refresh")}
        </Button>
      </div>

      {/* Alert Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="ds-card ds-card-danger p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--ds-flow-danger))]/10">
              <AlertCircle className="h-6 w-6 text-[hsl(var(--ds-flow-danger))]" />
            </div>
            <div>
              <div className="ds-metric text-3xl font-bold text-[hsl(var(--ds-flow-danger))]">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : alertSummary.open}
              </div>
              <p className="text-sm text-[hsl(var(--ds-text-secondary))]">
                {t("alerts.openAlerts", "Open Alerts")}
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
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : alertSummary.investigating}
              </div>
              <p className="text-sm text-[hsl(var(--ds-text-secondary))]">
                {t("alerts.investigating", "Investigating")}
              </p>
            </div>
          </div>
        </div>

        <div className="ds-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--ds-flow-danger))]/10">
              <AlertCircle className="h-6 w-6 text-[hsl(var(--ds-flow-danger))]" />
            </div>
            <div>
              <div className="ds-metric text-3xl font-bold text-[hsl(var(--ds-text-primary))]">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : alertSummary.critical}
              </div>
              <p className="text-sm text-[hsl(var(--ds-text-secondary))]">
                {t("alerts.critical", "Critical")}
              </p>
            </div>
          </div>
        </div>

        <div className="ds-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(38_92%_58%)]/10">
              <AlertCircle className="h-6 w-6 text-[hsl(38_92%_58%)]" />
            </div>
            <div>
              <div className="ds-metric text-3xl font-bold text-[hsl(var(--ds-text-primary))]">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : alertSummary.high}
              </div>
              <p className="text-sm text-[hsl(var(--ds-text-secondary))]">
                {t("alerts.highPriority", "High Priority")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="ds-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[hsl(var(--ds-text-primary))]">
            <Filter className="h-4 w-4" />
            <span className="font-medium">{t("alerts.filters", "Filters")}</span>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-[hsl(var(--ds-text-secondary))] hover:text-[hsl(var(--ds-text-primary))]"
            >
              {t("alerts.clearAll", "Clear All")}
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-6">
          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[hsl(var(--ds-text-secondary))]">
              {t("alerts.status", "Status")}
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {(["all", "open", "investigating", "resolved", "dismissed"] as const).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      statusFilter === status
                        ? "bg-[hsl(var(--ds-flow-primary))] text-[hsl(var(--ds-background))]"
                        : "bg-[hsl(var(--ds-surface-elevated))] text-[hsl(var(--ds-text-secondary))] hover:text-[hsl(var(--ds-text-primary))] border border-[hsl(var(--ds-border))]"
                    }`}
                  >
                    {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Severity Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[hsl(var(--ds-text-secondary))]">
              {t("alerts.severity", "Severity")}
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {(["all", "critical", "high", "medium", "low"] as const).map(
                (severity) => (
                  <button
                    key={severity}
                    onClick={() => setSeverityFilter(severity)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      severityFilter === severity
                        ? "bg-[hsl(var(--ds-flow-primary))] text-[hsl(var(--ds-background))]"
                        : "bg-[hsl(var(--ds-surface-elevated))] text-[hsl(var(--ds-text-secondary))] hover:text-[hsl(var(--ds-text-primary))] border border-[hsl(var(--ds-border))]"
                    }`}
                  >
                    {severity === "all" ? "All" : t(`severity.${severity}`, severity)}
                  </button>
                )
              )}
            </div>
          </div>

          {/* System Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[hsl(var(--ds-text-secondary))]">
              {t("alerts.system", "System")}
            </label>
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setSystemFilter("all")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  systemFilter === "all"
                    ? "bg-[hsl(var(--ds-flow-primary))] text-[hsl(var(--ds-background))]"
                    : "bg-[hsl(var(--ds-surface-elevated))] text-[hsl(var(--ds-text-secondary))] hover:text-[hsl(var(--ds-text-primary))] border border-[hsl(var(--ds-border))]"
                }`}
              >
                All
              </button>
              {systems.map((system) => (
                <button
                  key={system.id}
                  onClick={() => setSystemFilter(system.id)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    systemFilter === system.id
                      ? "bg-[hsl(var(--ds-flow-primary))] text-[hsl(var(--ds-background))]"
                      : "bg-[hsl(var(--ds-surface-elevated))] text-[hsl(var(--ds-text-secondary))] hover:text-[hsl(var(--ds-text-primary))] border border-[hsl(var(--ds-border))]"
                  }`}
                >
                  {system.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="ds-card overflow-hidden">
        <div className="p-5 border-b border-[hsl(var(--ds-border))]">
          <div className="flex items-center justify-between">
            <span className="font-medium text-[hsl(var(--ds-text-primary))]">
              {filteredAlerts.length} Alert{filteredAlerts.length !== 1 ? "s" : ""}
              {hasActiveFilters && (
                <span className="text-[hsl(var(--ds-text-muted))]"> (filtered)</span>
              )}
            </span>
          </div>
        </div>

        <div className="divide-y divide-[hsl(var(--ds-border))] max-h-[600px] overflow-y-auto">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-5 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-[hsl(var(--ds-surface-elevated))]" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-4 w-16 bg-[hsl(var(--ds-surface-elevated))] rounded" />
                      <div className="h-4 w-20 bg-[hsl(var(--ds-surface-elevated))] rounded" />
                    </div>
                    <div className="h-4 w-full bg-[hsl(var(--ds-surface-elevated))] rounded mb-2" />
                    <div className="h-3 w-3/4 bg-[hsl(var(--ds-surface-elevated))] rounded" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-12 text-[hsl(var(--ds-text-muted))]">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg">{t("alerts.noAlerts", "No Active Alerts")}</p>
              <p className="text-sm mt-1">{t("alerts.allNormal", "All systems are syncing normally")}</p>
            </div>
          ) : (
            filteredAlerts.map((alert, index) => (
              <div
                key={alert.id}
                className="p-5 hover:bg-[hsl(var(--ds-surface-elevated))]/50 transition-colors"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  {/* Severity Icon */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      alert.severity === "critical"
                        ? "bg-[hsl(var(--ds-flow-danger))]/10 text-[hsl(var(--ds-flow-danger))]"
                        : alert.severity === "high"
                        ? "bg-[hsl(38_92%_58%)]/10 text-[hsl(38_92%_58%)]"
                        : alert.severity === "medium"
                        ? "bg-[hsl(var(--ds-flow-warning))]/10 text-[hsl(var(--ds-flow-warning))]"
                        : "bg-[hsl(var(--ds-flow-info))]/10 text-[hsl(var(--ds-flow-info))]"
                    }`}
                  >
                    <AlertCircle className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityClass(alert.severity)}`}>
                        {t(`severity.${alert.severity}`, alert.severity)}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-[hsl(var(--ds-surface-elevated))] text-[hsl(var(--ds-text-secondary))] border border-[hsl(var(--ds-border))]">
                        {alert.type}
                      </span>
                      <span className="text-xs text-[hsl(var(--ds-text-muted))] font-mono flex items-center gap-1">
                        {getStatusIcon(alert.status)}
                        {alert.status}
                      </span>
                    </div>
                    <h3 className="font-medium text-[hsl(var(--ds-text-primary))] mb-1">
                      {alert.title}
                    </h3>
                    <p className="text-sm text-[hsl(var(--ds-text-secondary))] mb-2 line-clamp-2">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[hsl(var(--ds-text-muted))]">
                      <span className="font-mono">{alert.sourceSystem} &rarr; {alert.targetSystem}</span>
                      <span>&bull;</span>
                      <span>{formatTimeAgo(alert.detectedAt)}</span>
                      {alert.affectedRecords && (
                        <>
                          <span>&bull;</span>
                          <span>{alert.affectedRecords} records affected</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {(alert.status === "open" || alert.status === "investigating") && (
                    <div className="flex items-center gap-2 shrink-0">
                      {alert.status === "open" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleInvestigate(alert.id, alert.detectedAt)}
                          className="border-[hsl(var(--ds-border))] text-[hsl(var(--ds-text-secondary))] hover:bg-[hsl(var(--ds-surface-elevated))] hover:text-[hsl(var(--ds-text-primary))]"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          {t("alerts.investigate", "Investigate")}
                        </Button>
                      )}
                      {alert.status === "investigating" && (
                        <Button
                          size="sm"
                          onClick={() => handleResolve(alert.id, alert.detectedAt)}
                          className="ds-btn-glow"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                          {t("alerts.resolve", "Resolve")}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDismiss(alert.id, alert.detectedAt)}
                        className="text-[hsl(var(--ds-text-muted))] hover:text-[hsl(var(--ds-flow-danger))]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
