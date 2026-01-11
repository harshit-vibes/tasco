import { NextResponse } from "next/server";
import {
  listSyncSystems,
  getSystemStatusSummary,
  getTodayGlobalMetrics,
  listSyncMetrics,
  getTodayDate,
  type SyncSystem,
  type SyncMetrics,
} from "@tasco/db";

const APP_ID = "data-sync";

export async function GET() {
  try {
    // Fetch systems from database
    const systems = await listSyncSystems(APP_ID);
    const systemSummary = await getSystemStatusSummary(APP_ID);

    // Fetch global metrics for today
    const today = getTodayDate();
    let globalMetrics = await getTodayGlobalMetrics();

    // If no global metrics exist, calculate from system data
    if (!globalMetrics) {
      globalMetrics = calculateGlobalMetrics(systems);
    }

    // Fetch per-system metrics for today
    const systemMetrics = await Promise.all(
      systems.map(async (system) => {
        const metrics = await listSyncMetrics(system.id, today, today);
        if (metrics.length > 0) {
          return metrics[0];
        }
        // Return default metrics based on system data
        return {
          systemId: system.id,
          recordsSynced: system.recordsSyncedToday,
          pendingRecords: system.pendingRecords,
          failedRecords: system.failedRecords || 0,
          latencyMs: system.latencyMs || 0,
          lastSync: system.lastSyncAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        systems,
        metrics: {
          totalRecordsSynced: globalMetrics?.recordsSynced || 0,
          pendingRecords: globalMetrics?.pendingRecords || 0,
          failedRecords: globalMetrics?.failedRecords || 0,
          averageLatencyMs: globalMetrics?.averageLatencyMs || 0,
          throughputPerMinute: globalMetrics?.throughputPerMinute || 0,
          errorRate: globalMetrics?.errorRate || 0,
          uptimePercentage: globalMetrics?.uptimePercentage || 99,
          lastSuccessfulSync: globalMetrics?.lastSuccessfulSync || new Date().toISOString(),
        },
        systemMetrics,
        summary: systemSummary,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching sync status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sync status" },
      { status: 500 }
    );
  }
}

/**
 * Calculate global metrics from system data
 */
function calculateGlobalMetrics(systems: SyncSystem[]): Partial<SyncMetrics> {
  if (systems.length === 0) {
    return {
      recordsSynced: 0,
      pendingRecords: 0,
      failedRecords: 0,
      averageLatencyMs: 0,
      throughputPerMinute: 0,
      errorRate: 0,
      uptimePercentage: 100,
      lastSuccessfulSync: new Date().toISOString(),
    };
  }

  const totalSynced = systems.reduce((sum, s) => sum + s.recordsSyncedToday, 0);
  const totalPending = systems.reduce((sum, s) => sum + s.pendingRecords, 0);
  const totalFailed = systems.reduce((sum, s) => sum + (s.failedRecords || 0), 0);

  const latencies = systems.filter((s) => s.latencyMs).map((s) => s.latencyMs!);
  const avgLatency = latencies.length > 0
    ? Math.round(latencies.reduce((sum, l) => sum + l, 0) / latencies.length)
    : 0;

  const connectedCount = systems.filter((s) => s.status === "connected").length;
  const uptimePercentage = Math.round((connectedCount / systems.length) * 100 * 10) / 10;

  const errorRate = totalSynced > 0
    ? Math.round((totalFailed / totalSynced) * 100 * 100) / 100
    : 0;

  // Find most recent sync
  const lastSync = systems
    .map((s) => s.lastSyncAt)
    .sort()
    .reverse()[0] || new Date().toISOString();

  return {
    recordsSynced: totalSynced,
    pendingRecords: totalPending,
    failedRecords: totalFailed,
    averageLatencyMs: avgLatency,
    throughputPerMinute: Math.round(totalSynced / 60), // Rough estimate
    errorRate,
    uptimePercentage,
    lastSuccessfulSync: lastSync,
  };
}
