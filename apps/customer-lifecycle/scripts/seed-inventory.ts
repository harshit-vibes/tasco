/**
 * Seed script for Inventory Module (Vehicles + Import Orders)
 * Creates realistic vehicle inventory and import orders for Tasco Auto
 *
 * Run: bun run scripts/seed-inventory.ts
 */

import {
  createVehicle,
  createImportOrder,
  getAllVehicles,
  getAllImportOrders,
  type CreateVehicleInput,
  type CreateImportOrderInput,
  type VehicleStatus,
  type VehicleBrand,
} from "@tasco/db";

console.log("\n=== Seeding Inventory Module Data ===\n");

const ENTITY_ID = "tasco-auto";

// ============================================
// GWM Models & Variants
// ============================================
const GWM_MODELS = [
  { model: "Haval H6", variants: ["Lux", "Premium", "Ultra"], basePrice: 28000 },
  { model: "Haval Jolion", variants: ["Active", "Lux", "Premium"], basePrice: 22000 },
  { model: "Haval H6 HEV", variants: ["Lux", "Premium"], basePrice: 32000 },
  { model: "Tank 300", variants: ["Adventure", "Expedition"], basePrice: 38000 },
  { model: "Tank 500", variants: ["Commander", "Executive"], basePrice: 55000 },
  { model: "Ora Good Cat", variants: ["Tech", "GT"], basePrice: 26000 },
  { model: "Poer", variants: ["Standard", "Premium"], basePrice: 24000 },
];

// ============================================
// GAC Models & Variants
// ============================================
const GAC_MODELS = [
  { model: "GS8", variants: ["Essence", "Master"], basePrice: 42000 },
  { model: "GS4", variants: ["Comfort", "Premium"], basePrice: 25000 },
  { model: "GS3", variants: ["Standard", "Deluxe"], basePrice: 20000 },
  { model: "Empow", variants: ["Sport", "GT"], basePrice: 35000 },
  { model: "AION Y Plus", variants: ["Standard Range", "Long Range"], basePrice: 30000 },
  { model: "AION S Plus", variants: ["Executive", "Elite"], basePrice: 32000 },
];

// ============================================
// Lotus Models & Variants
// ============================================
const LOTUS_MODELS = [
  { model: "Eletre", variants: ["S", "R"], basePrice: 95000 },
  { model: "Emeya", variants: ["S", "R"], basePrice: 110000 },
];

const COLORS = ["Pearl White", "Obsidian Black", "Phantom Grey", "Sapphire Blue", "Ruby Red", "Bronze Gold", "Forest Green"];

const SHOWROOMS = [
  "Showroom Hà Nội - Cầu Giấy",
  "Showroom Hà Nội - Long Biên",
  "Showroom TP.HCM - Quận 7",
  "Showroom TP.HCM - Quận 2",
  "Showroom Đà Nẵng",
  "Showroom Hải Phòng",
];

const STATUSES: VehicleStatus[] = [
  "ordered",
  "in_production",
  "shipped",
  "at_port",
  "customs",
  "inspection",
  "in_warehouse",
  "in_transit",
  "at_showroom",
  "reserved",
  "sold",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateVIN(brand: string): string {
  const prefixes: Record<string, string> = {
    GWM: "LGWEF",
    GAC: "LSGJA",
    Lotus: "SCCLM",
  };
  const prefix = prefixes[brand] || "XXXXX";
  const chars = "0123456789ABCDEFGHJKLMNPRSTUVWXYZ";
  let vin = prefix;
  for (let i = 0; i < 12; i++) {
    vin += chars[Math.floor(Math.random() * chars.length)];
  }
  return vin;
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
}

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

// ============================================
// Generate Import Orders
// ============================================
async function seedImportOrders(): Promise<string[]> {
  console.log("Creating import orders...");
  const orderIds: string[] = [];

  const importOrders: Array<{
    orderNumber: string;
    brand: VehicleBrand;
    vehicles: Array<{ model: string; variant: string; color: string; quantity: number; unitPrice: number }>;
    status: "draft" | "submitted" | "confirmed" | "in_production" | "shipped" | "arrived" | "completed";
    orderedAt: string;
    expectedArrivalDate: string;
    actualArrivalDate?: string;
  }> = [
    // GWM Orders
    {
      orderNumber: "PO-2025-GWM-001",
      brand: "GWM",
      vehicles: [
        { model: "Haval H6", variant: "Premium", color: "Pearl White", quantity: 8, unitPrice: 28000 },
        { model: "Haval H6", variant: "Ultra", color: "Obsidian Black", quantity: 5, unitPrice: 32000 },
        { model: "Haval Jolion", variant: "Lux", color: "Sapphire Blue", quantity: 10, unitPrice: 22000 },
      ],
      status: "completed",
      orderedAt: daysAgo(90),
      expectedArrivalDate: daysAgo(30),
      actualArrivalDate: daysAgo(28),
    },
    {
      orderNumber: "PO-2025-GWM-002",
      brand: "GWM",
      vehicles: [
        { model: "Tank 300", variant: "Adventure", color: "Forest Green", quantity: 4, unitPrice: 38000 },
        { model: "Tank 500", variant: "Commander", color: "Obsidian Black", quantity: 2, unitPrice: 55000 },
      ],
      status: "shipped",
      orderedAt: daysAgo(60),
      expectedArrivalDate: daysFromNow(10),
    },
    {
      orderNumber: "PO-2025-GWM-003",
      brand: "GWM",
      vehicles: [
        { model: "Ora Good Cat", variant: "GT", color: "Ruby Red", quantity: 6, unitPrice: 28000 },
        { model: "Haval H6 HEV", variant: "Premium", color: "Pearl White", quantity: 4, unitPrice: 34000 },
      ],
      status: "in_production",
      orderedAt: daysAgo(30),
      expectedArrivalDate: daysFromNow(45),
    },
    // GAC Orders
    {
      orderNumber: "PO-2025-GAC-001",
      brand: "GAC",
      vehicles: [
        { model: "GS8", variant: "Master", color: "Phantom Grey", quantity: 5, unitPrice: 45000 },
        { model: "GS4", variant: "Premium", color: "Pearl White", quantity: 8, unitPrice: 27000 },
      ],
      status: "arrived",
      orderedAt: daysAgo(75),
      expectedArrivalDate: daysAgo(15),
      actualArrivalDate: daysAgo(12),
    },
    {
      orderNumber: "PO-2025-GAC-002",
      brand: "GAC",
      vehicles: [
        { model: "AION Y Plus", variant: "Long Range", color: "Sapphire Blue", quantity: 6, unitPrice: 32000 },
        { model: "AION S Plus", variant: "Elite", color: "Pearl White", quantity: 4, unitPrice: 35000 },
      ],
      status: "confirmed",
      orderedAt: daysAgo(20),
      expectedArrivalDate: daysFromNow(60),
    },
    // Lotus Orders
    {
      orderNumber: "PO-2025-LOT-001",
      brand: "Lotus",
      vehicles: [
        { model: "Eletre", variant: "R", color: "Pearl White", quantity: 2, unitPrice: 110000 },
        { model: "Emeya", variant: "S", color: "Obsidian Black", quantity: 1, unitPrice: 115000 },
      ],
      status: "shipped",
      orderedAt: daysAgo(45),
      expectedArrivalDate: daysFromNow(15),
    },
  ];

  for (const order of importOrders) {
    const totalUnits = order.vehicles.reduce((sum, v) => sum + v.quantity, 0);
    const totalValue = order.vehicles.reduce((sum, v) => sum + v.quantity * v.unitPrice, 0);

    const input: CreateImportOrderInput = {
      orderNumber: order.orderNumber,
      brand: order.brand,
      vehicles: order.vehicles,
      orderedAt: order.orderedAt,
      expectedProductionComplete: daysFromNow(-30), // Approximate
      expectedShipDate: daysFromNow(-15), // Approximate
      expectedArrivalDate: order.expectedArrivalDate,
      actualArrivalDate: order.actualArrivalDate,
      status: order.status,
      totalValue,
      entityId: ENTITY_ID,
      notes: `Import order for ${totalUnits} ${order.brand} vehicles`,
    };

    try {
      const created = await createImportOrder(input);
      orderIds.push(created.id);
      console.log(`  ✓ Order: ${order.orderNumber} (${order.brand}, ${totalUnits} units, $${totalValue.toLocaleString()})`);
    } catch (error) {
      console.error(`  ✗ Failed to create order ${order.orderNumber}:`, error);
    }
  }

  return orderIds;
}

// ============================================
// Generate Vehicles
// ============================================
async function seedVehicles(orderIds: string[]): Promise<void> {
  console.log("\nCreating vehicles...");

  // Vehicles from completed orders (at various stages in showroom)
  const completedOrderVehicles = [
    // GWM vehicles from PO-2025-GWM-001 (arrived 28 days ago)
    { brand: "GWM" as VehicleBrand, model: "Haval H6", variant: "Premium", color: "Pearl White", status: "at_showroom" as VehicleStatus, arrivedDaysAgo: 28 },
    { brand: "GWM" as VehicleBrand, model: "Haval H6", variant: "Premium", color: "Pearl White", status: "sold" as VehicleStatus, arrivedDaysAgo: 28 },
    { brand: "GWM" as VehicleBrand, model: "Haval H6", variant: "Premium", color: "Pearl White", status: "at_showroom" as VehicleStatus, arrivedDaysAgo: 28 },
    { brand: "GWM" as VehicleBrand, model: "Haval H6", variant: "Ultra", color: "Obsidian Black", status: "reserved" as VehicleStatus, arrivedDaysAgo: 28 },
    { brand: "GWM" as VehicleBrand, model: "Haval H6", variant: "Ultra", color: "Obsidian Black", status: "at_showroom" as VehicleStatus, arrivedDaysAgo: 28 },
    { brand: "GWM" as VehicleBrand, model: "Haval Jolion", variant: "Lux", color: "Sapphire Blue", status: "at_showroom" as VehicleStatus, arrivedDaysAgo: 28 },
    { brand: "GWM" as VehicleBrand, model: "Haval Jolion", variant: "Lux", color: "Sapphire Blue", status: "sold" as VehicleStatus, arrivedDaysAgo: 28 },
    { brand: "GWM" as VehicleBrand, model: "Haval Jolion", variant: "Lux", color: "Sapphire Blue", status: "at_showroom" as VehicleStatus, arrivedDaysAgo: 28 },
  ];

  // Aging inventory (vehicles that arrived 60+ days ago - for alerts)
  const agingVehicles = [
    { brand: "GWM" as VehicleBrand, model: "Haval H6", variant: "Lux", color: "Bronze Gold", status: "at_showroom" as VehicleStatus, arrivedDaysAgo: 75 },
    { brand: "GWM" as VehicleBrand, model: "Poer", variant: "Standard", color: "Phantom Grey", status: "at_showroom" as VehicleStatus, arrivedDaysAgo: 92 },
    { brand: "GAC" as VehicleBrand, model: "GS3", variant: "Deluxe", color: "Ruby Red", status: "at_showroom" as VehicleStatus, arrivedDaysAgo: 68 },
    { brand: "GAC" as VehicleBrand, model: "GS4", variant: "Comfort", color: "Pearl White", status: "at_showroom" as VehicleStatus, arrivedDaysAgo: 105 },
  ];

  // Vehicles in transit (from shipped orders)
  const inTransitVehicles = [
    { brand: "GWM" as VehicleBrand, model: "Tank 300", variant: "Adventure", color: "Forest Green", status: "shipped" as VehicleStatus, arrivedDaysAgo: 0 },
    { brand: "GWM" as VehicleBrand, model: "Tank 300", variant: "Adventure", color: "Forest Green", status: "shipped" as VehicleStatus, arrivedDaysAgo: 0 },
    { brand: "GWM" as VehicleBrand, model: "Tank 500", variant: "Commander", color: "Obsidian Black", status: "shipped" as VehicleStatus, arrivedDaysAgo: 0 },
    { brand: "Lotus" as VehicleBrand, model: "Eletre", variant: "R", color: "Pearl White", status: "shipped" as VehicleStatus, arrivedDaysAgo: 0 },
    { brand: "Lotus" as VehicleBrand, model: "Emeya", variant: "S", color: "Obsidian Black", status: "shipped" as VehicleStatus, arrivedDaysAgo: 0 },
  ];

  // Vehicles at port/customs (from arrived orders)
  const atPortVehicles = [
    { brand: "GAC" as VehicleBrand, model: "GS8", variant: "Master", color: "Phantom Grey", status: "customs" as VehicleStatus, arrivedDaysAgo: 0 },
    { brand: "GAC" as VehicleBrand, model: "GS8", variant: "Master", color: "Phantom Grey", status: "inspection" as VehicleStatus, arrivedDaysAgo: 0 },
    { brand: "GAC" as VehicleBrand, model: "GS4", variant: "Premium", color: "Pearl White", status: "in_warehouse" as VehicleStatus, arrivedDaysAgo: 0 },
    { brand: "GAC" as VehicleBrand, model: "GS4", variant: "Premium", color: "Pearl White", status: "in_transit" as VehicleStatus, arrivedDaysAgo: 0 },
  ];

  // Vehicles in production
  const inProductionVehicles = [
    { brand: "GWM" as VehicleBrand, model: "Ora Good Cat", variant: "GT", color: "Ruby Red", status: "in_production" as VehicleStatus, arrivedDaysAgo: 0 },
    { brand: "GWM" as VehicleBrand, model: "Ora Good Cat", variant: "GT", color: "Ruby Red", status: "in_production" as VehicleStatus, arrivedDaysAgo: 0 },
    { brand: "GWM" as VehicleBrand, model: "Haval H6 HEV", variant: "Premium", color: "Pearl White", status: "ordered" as VehicleStatus, arrivedDaysAgo: 0 },
  ];

  // Vehicles on order (GAC AION)
  const orderedVehicles = [
    { brand: "GAC" as VehicleBrand, model: "AION Y Plus", variant: "Long Range", color: "Sapphire Blue", status: "ordered" as VehicleStatus, arrivedDaysAgo: 0 },
    { brand: "GAC" as VehicleBrand, model: "AION S Plus", variant: "Elite", color: "Pearl White", status: "confirmed" as VehicleStatus, arrivedDaysAgo: 0 },
  ];

  const allVehicles = [
    ...completedOrderVehicles,
    ...agingVehicles,
    ...inTransitVehicles,
    ...atPortVehicles,
    ...inProductionVehicles,
    ...orderedVehicles,
  ];

  const modelPrices: Record<string, number> = {
    "Haval H6": 850000000,
    "Haval Jolion": 650000000,
    "Haval H6 HEV": 980000000,
    "Tank 300": 1100000000,
    "Tank 500": 1600000000,
    "Ora Good Cat": 780000000,
    "Poer": 720000000,
    "GS8": 1200000000,
    "GS4": 750000000,
    "GS3": 600000000,
    "Empow": 950000000,
    "AION Y Plus": 850000000,
    "AION S Plus": 920000000,
    "Eletre": 2800000000,
    "Emeya": 3200000000,
  };

  for (const vehicle of allVehicles) {
    const basePrice = modelPrices[vehicle.model] || 800000000;
    const variantMultiplier = vehicle.variant.includes("Ultra") || vehicle.variant.includes("R") || vehicle.variant.includes("Master") ? 1.15 : 1;

    const input: CreateVehicleInput = {
      vin: generateVIN(vehicle.brand),
      brand: vehicle.brand,
      model: vehicle.model,
      variant: vehicle.variant,
      color: vehicle.color,
      year: 2025,
      importPrice: Math.round(basePrice / 25000), // USD equivalent
      listPrice: Math.round(basePrice * variantMultiplier),
      dealerPrice: Math.round(basePrice * variantMultiplier * 0.92),
      status: vehicle.status,
      assignedShowroom: randomFrom(SHOWROOMS),
      currentLocation: vehicle.status === "at_showroom" || vehicle.status === "reserved" || vehicle.status === "sold"
        ? randomFrom(SHOWROOMS)
        : vehicle.status === "shipped" ? "On Vessel - Pacific Ocean"
        : vehicle.status === "at_port" || vehicle.status === "customs" ? "Hai Phong Port"
        : vehicle.status === "inspection" ? "Customs Inspection Center"
        : vehicle.status === "in_warehouse" ? "Central Distribution Warehouse"
        : vehicle.status === "in_transit" ? "In Transit to Showroom"
        : "OEM Factory",
      orderedAt: daysAgo(randomBetween(30, 120)),
      expectedArrival: vehicle.arrivedDaysAgo > 0 ? daysAgo(vehicle.arrivedDaysAgo - 5) : daysFromNow(randomBetween(15, 60)),
      arrivedAt: vehicle.arrivedDaysAgo > 0 ? daysAgo(vehicle.arrivedDaysAgo) : undefined,
      soldAt: vehicle.status === "sold" ? daysAgo(randomBetween(1, 10)) : undefined,
      importOrderId: orderIds.length > 0 ? randomFrom(orderIds) : undefined,
      entityId: ENTITY_ID,
    };

    try {
      const created = await createVehicle(input);
      console.log(`  ✓ Vehicle: ${vehicle.brand} ${vehicle.model} ${vehicle.variant} (${vehicle.status})`);
    } catch (error) {
      console.error(`  ✗ Failed to create vehicle:`, error);
    }
  }
}

// ============================================
// Main Function
// ============================================
async function seedInventory() {
  try {
    // Check existing data
    const existingVehicles = await getAllVehicles();
    const existingOrders = await getAllImportOrders();

    if (existingVehicles.items.length > 0 || existingOrders.items.length > 0) {
      console.log(`⚠ Existing data found:`);
      console.log(`  - ${existingVehicles.items.length} vehicles`);
      console.log(`  - ${existingOrders.items.length} import orders`);
      console.log(`\nSkipping seed to avoid duplicates.`);
      console.log(`To reseed, delete existing data first.\n`);
      return;
    }

    // Seed import orders first (to get IDs for vehicles)
    const orderIds = await seedImportOrders();

    // Seed vehicles
    await seedVehicles(orderIds);

    // Final counts
    const finalVehicles = await getAllVehicles();
    const finalOrders = await getAllImportOrders();

    console.log("\n=== ✅ Inventory data seeded successfully! ===");
    console.log(`\nSummary:`);
    console.log(`  - ${finalOrders.items.length} import orders created`);
    console.log(`  - ${finalVehicles.items.length} vehicles created`);

    // Stats breakdown
    const byBrand: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    for (const v of finalVehicles.items) {
      byBrand[v.brand] = (byBrand[v.brand] || 0) + 1;
      byStatus[v.status] = (byStatus[v.status] || 0) + 1;
    }

    console.log(`\nBy Brand:`);
    for (const [brand, count] of Object.entries(byBrand)) {
      console.log(`  - ${brand}: ${count} vehicles`);
    }

    console.log(`\nBy Status:`);
    for (const [status, count] of Object.entries(byStatus)) {
      console.log(`  - ${status}: ${count} vehicles`);
    }

    console.log("\n");
  } catch (error) {
    console.error("\n❌ Error seeding inventory data:", error);
    process.exit(1);
  }
}

seedInventory();
