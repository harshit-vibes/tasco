/**
 * Seed script for Data Sync app
 *
 * Populates the database with initial sync systems, metrics, and alerts.
 *
 * Run with: cd apps/data-sync && bun run scripts/seed-data.ts
 */

import {
  batchCreateSyncSystems,
  upsertSyncMetrics,
  createNotification,
  getTodayDate,
  type CreateSyncSystemInput,
  type CreateSyncMetricsInput,
  type CreateNotificationInput,
  type NotificationType,
} from "@tasco/db";

const APP_ID = "data-sync";
const ENTITY_ID = "inochi";

// ============================================
// Seed Data: Systems
// ============================================

const SEED_SYSTEMS: CreateSyncSystemInput[] = [
  {
    id: "haravan",
    entityId: ENTITY_ID,
    name: "Haravan",
    type: "ecommerce",
    apiEndpoint: "https://api.haravan.com/v1",
    config: {
      syncFrequency: 5,
      retryAttempts: 3,
      timeout: 30000,
      latencyMs: 245,
    },
  },
  {
    id: "shopee",
    entityId: ENTITY_ID,
    name: "Shopee",
    type: "marketplace",
    apiEndpoint: "https://partner.shopeemobile.com/api/v2",
    config: {
      syncFrequency: 10,
      retryAttempts: 3,
      timeout: 45000,
      latencyMs: 312,
    },
  },
  {
    id: "bravo",
    entityId: ENTITY_ID,
    name: "Bravo ERP",
    type: "erp",
    apiEndpoint: "https://bravo.inochi.vn/api",
    config: {
      syncFrequency: 15,
      retryAttempts: 5,
      timeout: 60000,
      latencyMs: 1850,
    },
  },
  {
    id: "fulfillment",
    entityId: ENTITY_ID,
    name: "Fulfillment",
    type: "warehouse",
    apiEndpoint: "https://fulfill.inochi.vn/api",
    config: {
      syncFrequency: 5,
      retryAttempts: 3,
      timeout: 30000,
      latencyMs: 178,
    },
  },
];

// ============================================
// Seed Data: Alerts (as Notifications)
// ============================================

interface SeedAlert {
  type: "missing" | "mismatch" | "delayed" | "connection";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  message: string;
  sourceSystem: string;
  targetSystem: string;
  affectedRecordId?: string;
  affectedRecordType?: string;
  expectedValue?: string;
  actualValue?: string;
}

const SEED_ALERTS: SeedAlert[] = [
  {
    type: "missing",
    severity: "high",
    title: "Order #INO-12345 missing in Bravo",
    message:
      "Order exists in Haravan but has not been synced to Bravo ERP after 2 hours",
    sourceSystem: "haravan",
    targetSystem: "bravo",
    affectedRecordId: "INO-12345",
    affectedRecordType: "order",
    expectedValue: "Order Total: 2,450,000 VND",
  },
  {
    type: "mismatch",
    severity: "medium",
    title: "Revenue mismatch detected",
    message:
      "Daily revenue totals do not match between Haravan and Bravo for today",
    sourceSystem: "haravan",
    targetSystem: "bravo",
    expectedValue: "45,670,000 VND",
    actualValue: "44,220,000 VND",
  },
  {
    type: "delayed",
    severity: "high",
    title: "Bravo sync delayed by 2 hours",
    message:
      "Last successful sync was 2 hours ago. 89 records pending synchronization.",
    sourceSystem: "haravan",
    targetSystem: "bravo",
  },
  {
    type: "missing",
    severity: "medium",
    title: "Order #INO-12298 missing in Bravo",
    message: "Shopee order not found in Bravo ERP system",
    sourceSystem: "shopee",
    targetSystem: "bravo",
    affectedRecordId: "INO-12298",
    affectedRecordType: "order",
    expectedValue: "Order Total: 890,000 VND",
  },
  {
    type: "connection",
    severity: "critical",
    title: "Bravo API connection timeout",
    message:
      "Failed to connect to Bravo API after 5 retry attempts. Last error: Connection timeout after 60s",
    sourceSystem: "data-sync",
    targetSystem: "bravo",
  },
  {
    type: "missing",
    severity: "high",
    title: "Invoice #INV-7823 not generated",
    message: "Order completed in Fulfillment but invoice not created in Bravo",
    sourceSystem: "fulfillment",
    targetSystem: "bravo",
    affectedRecordId: "INV-7823",
    affectedRecordType: "invoice",
  },
];

// Map alert type to notification type
const ALERT_TYPE_MAP: Record<SeedAlert["type"], NotificationType> = {
  missing: "sync_missing",
  mismatch: "sync_mismatch",
  delayed: "sync_delayed",
  connection: "sync_connection",
};

// Map severity to priority
const SEVERITY_MAP: Record<
  SeedAlert["severity"],
  "low" | "medium" | "high" | "urgent"
> = {
  low: "low",
  medium: "medium",
  high: "high",
  critical: "urgent",
};

// ============================================
// Seed Functions
// ============================================

async function seedSystems() {
  console.log("📦 Seeding sync systems...");

  try {
    const systems = await batchCreateSyncSystems(SEED_SYSTEMS, APP_ID);
    console.log(`   ✅ Created ${systems.length} systems`);

    // Update statuses to match mock data
    const { updateSyncSystem } = await import("@tasco/db");

    // Haravan - connected
    await updateSyncSystem(
      "haravan",
      {
        status: "connected",
        latencyMs: 245,
        recordsSyncedToday: 1247,
        pendingRecords: 12,
        lastSyncAt: new Date(Date.now() - 120000).toISOString(),
      },
      APP_ID
    );

    // Shopee - connected
    await updateSyncSystem(
      "shopee",
      {
        status: "connected",
        latencyMs: 312,
        recordsSyncedToday: 856,
        pendingRecords: 5,
        lastSyncAt: new Date(Date.now() - 180000).toISOString(),
      },
      APP_ID
    );

    // Bravo - delayed
    await updateSyncSystem(
      "bravo",
      {
        status: "delayed",
        latencyMs: 1850,
        recordsSyncedToday: 423,
        pendingRecords: 89,
        failedRecords: 15,
        lastSyncAt: new Date(Date.now() - 7200000).toISOString(),
      },
      APP_ID
    );

    // Fulfillment - connected
    await updateSyncSystem(
      "fulfillment",
      {
        status: "connected",
        latencyMs: 178,
        recordsSyncedToday: 1089,
        pendingRecords: 3,
        lastSyncAt: new Date(Date.now() - 90000).toISOString(),
      },
      APP_ID
    );

    console.log("   ✅ Updated system statuses");
  } catch (error) {
    console.error("   ❌ Error seeding systems:", error);
    throw error;
  }
}

async function seedMetrics() {
  console.log("📊 Seeding sync metrics...");

  const today = getTodayDate();

  try {
    // Global metrics
    const globalMetrics: CreateSyncMetricsInput = {
      systemId: "GLOBAL",
      date: today,
      recordsSynced: 3615,
      pendingRecords: 109,
      failedRecords: 23,
      averageLatencyMs: 646,
      throughputPerMinute: 42,
      errorRate: 0.64,
      uptimePercentage: 99.2,
      lastSuccessfulSync: new Date(Date.now() - 90000).toISOString(),
    };

    await upsertSyncMetrics(globalMetrics);
    console.log("   ✅ Created global metrics");

    // Per-system metrics
    const systemMetrics: CreateSyncMetricsInput[] = [
      {
        systemId: "haravan",
        date: today,
        recordsSynced: 1247,
        pendingRecords: 12,
        failedRecords: 3,
        averageLatencyMs: 245,
        lastSuccessfulSync: new Date(Date.now() - 120000).toISOString(),
      },
      {
        systemId: "shopee",
        date: today,
        recordsSynced: 856,
        pendingRecords: 5,
        failedRecords: 2,
        averageLatencyMs: 312,
        lastSuccessfulSync: new Date(Date.now() - 180000).toISOString(),
      },
      {
        systemId: "bravo",
        date: today,
        recordsSynced: 423,
        pendingRecords: 89,
        failedRecords: 15,
        averageLatencyMs: 1850,
        lastSuccessfulSync: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        systemId: "fulfillment",
        date: today,
        recordsSynced: 1089,
        pendingRecords: 3,
        failedRecords: 3,
        averageLatencyMs: 178,
        lastSuccessfulSync: new Date(Date.now() - 90000).toISOString(),
      },
    ];

    for (const metrics of systemMetrics) {
      await upsertSyncMetrics(metrics);
    }
    console.log(`   ✅ Created ${systemMetrics.length} system metrics`);
  } catch (error) {
    console.error("   ❌ Error seeding metrics:", error);
    throw error;
  }
}

async function seedAlerts() {
  console.log("🚨 Seeding sync alerts...");

  try {
    let created = 0;

    for (const alert of SEED_ALERTS) {
      const notification: CreateNotificationInput = {
        type: ALERT_TYPE_MAP[alert.type],
        category: "sync",
        title: alert.title,
        message: alert.message,
        appId: APP_ID,
        entityId: ENTITY_ID,
        priority: SEVERITY_MAP[alert.severity],
        actionUrl: `/alerts`,
        metadata: {
          alertType: alert.type,
          severity: alert.severity,
          sourceSystem: alert.sourceSystem,
          targetSystem: alert.targetSystem,
          affectedRecordId: alert.affectedRecordId,
          affectedRecordType: alert.affectedRecordType,
          expectedValue: alert.expectedValue,
          actualValue: alert.actualValue,
        },
      };

      await createNotification(notification);
      created++;
    }

    console.log(`   ✅ Created ${created} alerts`);
  } catch (error) {
    console.error("   ❌ Error seeding alerts:", error);
    throw error;
  }
}

// ============================================
// Main
// ============================================

async function main() {
  console.log("\n🌱 Data Sync Seed Script");
  console.log("========================\n");

  try {
    await seedSystems();
    await seedMetrics();
    await seedAlerts();

    console.log("\n✅ Seed completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Seed failed:", error);
    process.exit(1);
  }
}

main();
