"use client";

import { useState, useEffect, useCallback } from "react";
import type { SyncSystem, SyncAlert, SyncMetrics, SystemMetrics } from "./types";

// API Response types
interface SyncStatusResponse {
  success: boolean;
  data: {
    systems: SyncSystem[];
    metrics: SyncMetrics;
    systemMetrics: SystemMetrics[];
    summary: {
      total: number;
      connected: number;
      delayed: number;
      disconnected: number;
      error: number;
    };
    timestamp: string;
  };
  error?: string;
}

interface AlertsResponse {
  success: boolean;
  data: {
    alerts: SyncAlert[];
    summary: {
      open: number;
      investigating: number;
      critical: number;
      high: number;
      total: number;
    };
    total: number;
    filtered: number;
  };
  error?: string;
}

interface AlertUpdateResponse {
  success: boolean;
  data: {
    alertId: string;
    action: string;
    newStatus: string;
    updatedAt: string;
  };
  error?: string;
}

/**
 * Hook for fetching sync status (systems + metrics)
 */
export function useSyncStatus() {
  const [systems, setSystems] = useState<SyncSystem[]>([]);
  const [metrics, setMetrics] = useState<SyncMetrics | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    connected: 0,
    delayed: 0,
    disconnected: 0,
    error: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/sync-status");
      const data: SyncStatusResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch sync status");
      }

      setSystems(data.data.systems);
      setMetrics(data.data.metrics);
      setSystemMetrics(data.data.systemMetrics);
      setSummary(data.data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    systems,
    metrics,
    systemMetrics,
    summary,
    loading,
    error,
    refresh: fetchStatus,
  };
}

/**
 * Hook for fetching and managing alerts
 */
export function useAlerts(filters?: {
  status?: string;
  severity?: string;
  system?: string;
}) {
  const [alerts, setAlerts] = useState<SyncAlert[]>([]);
  const [summary, setSummary] = useState({
    open: 0,
    investigating: 0,
    critical: 0,
    high: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.status && filters.status !== "all") {
        params.set("status", filters.status);
      }
      if (filters?.severity && filters.severity !== "all") {
        params.set("severity", filters.severity);
      }
      if (filters?.system && filters.system !== "all") {
        params.set("system", filters.system);
      }

      const url = `/api/alerts${params.toString() ? `?${params}` : ""}`;
      const response = await fetch(url);
      const data: AlertsResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch alerts");
      }

      setAlerts(data.data.alerts);
      setSummary(data.data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [filters?.status, filters?.severity, filters?.system]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const updateAlertStatus = useCallback(
    async (alertId: string, action: "investigate" | "resolve" | "dismiss", timestamp?: string) => {
      try {
        const response = await fetch("/api/alerts", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alertId, action, timestamp }),
        });
        const data: AlertUpdateResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to update alert");
        }

        // Update local state optimistically
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === alertId
              ? {
                  ...alert,
                  status: data.data.newStatus as SyncAlert["status"],
                  resolvedAt:
                    action === "resolve" ? data.data.updatedAt : alert.resolvedAt,
                }
              : alert
          )
        );

        // Refresh to get accurate summary
        await fetchAlerts();

        return data.data;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        throw err;
      }
    },
    [fetchAlerts]
  );

  return {
    alerts,
    summary,
    loading,
    error,
    refresh: fetchAlerts,
    investigate: (alertId: string, timestamp?: string) =>
      updateAlertStatus(alertId, "investigate", timestamp),
    resolve: (alertId: string, timestamp?: string) =>
      updateAlertStatus(alertId, "resolve", timestamp),
    dismiss: (alertId: string, timestamp?: string) =>
      updateAlertStatus(alertId, "dismiss", timestamp),
  };
}

/**
 * Get alerts for a specific system (client-side filter)
 */
export function getAlertsBySystem(alerts: SyncAlert[], systemId: string) {
  return alerts.filter(
    (a) => a.sourceSystem === systemId || a.targetSystem === systemId
  );
}
