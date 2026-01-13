/**
 * Seed DynamoDB with Vehicle Inventory demo data
 *
 * Usage:
 *   bun run db:seed-inventory
 *
 * This script populates the inventory tables with demo data for Tasco Auto
 * including vehicles at various stages and import orders from OEMs.
 */

import {
  createVehicle,
  createImportOrder,
  type CreateVehicleInput,
  type CreateImportOrderInput,
} from "../lifecycle";

console.log("\n=== Seeding Vehicle Inventory Data ===\n");

// Showroom entities for vehicle distribution
const SHOWROOM_ENTITIES = [
  "showroom-hanoi-1", // Cầu Giấy
  "showroom-hanoi-2", // Long Biên
  "showroom-hcm-1", // Quận 7
  "showroom-hcm-2", // Thủ Đức
  "showroom-danang", // Hải Châu
];

// Helper to generate VIN
function generateVIN(brand: string, index: number): string {
  const brandCode = brand === "GWM" ? "LGW" : brand === "GAC" ? "LGA" : "LLO";
  const year = "2024";
  const seq = String(index).padStart(6, "0");
  return `${brandCode}${year}VN${seq}`;
}

// Helper to get date strings
function getDateString(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split("T")[0];
}

// ============================================
// Import Orders (Supply Chain)
// ============================================

const importOrders: CreateImportOrderInput[] = [
  // GWM Orders
  {
    orderNumber: "PO-2024-GWM-001",
    brand: "GWM",
    vehicles: [
      { model: "Haval H6", variant: "Premium", color: "White Pearl", quantity: 15, unitPrice: 25000 },
      { model: "Haval H6", variant: "Sport", color: "Black Metallic", quantity: 10, unitPrice: 27000 },
      { model: "Haval Jolion", variant: "Luxury", color: "Silver", quantity: 8, unitPrice: 22000 },
    ],
    orderedAt: getDateString(-90),
    expectedProductionComplete: getDateString(-60),
    expectedShipDate: getDateString(-50),
    expectedArrivalDate: getDateString(-20),
    totalValue: 33 * 25000, // Approximate
    lcNumber: "LC-2024-001",
    lcOpenedAt: getDateString(-85),
    lcExpiryAt: getDateString(30),
    notes: "Q4 2024 shipment - priority order",
    entityId: "showroom-hanoi-1",
  },
  {
    orderNumber: "PO-2024-GWM-002",
    brand: "GWM",
    vehicles: [
      { model: "Tank 300", variant: "Offroad", color: "Desert Sand", quantity: 5, unitPrice: 38000 },
      { model: "Tank 500", variant: "Premium", color: "Black", quantity: 3, unitPrice: 52000 },
    ],
    orderedAt: getDateString(-60),
    expectedProductionComplete: getDateString(-30),
    expectedShipDate: getDateString(-20),
    expectedArrivalDate: getDateString(10),
    totalValue: 5 * 38000 + 3 * 52000,
    lcNumber: "LC-2024-002",
    lcOpenedAt: getDateString(-55),
    lcExpiryAt: getDateString(60),
    notes: "Special order - Tank series for HCM market",
    entityId: "showroom-hcm-1",
  },
  {
    orderNumber: "PO-2025-GWM-001",
    brand: "GWM",
    vehicles: [
      { model: "Haval H6", variant: "Hybrid", color: "Blue", quantity: 20, unitPrice: 29000 },
      { model: "Haval H6", variant: "Premium", color: "White Pearl", quantity: 15, unitPrice: 25000 },
      { model: "ORA Good Cat", variant: "GT", color: "Pink", quantity: 10, unitPrice: 32000 },
    ],
    orderedAt: getDateString(-30),
    expectedProductionComplete: getDateString(15),
    expectedShipDate: getDateString(25),
    expectedArrivalDate: getDateString(60),
    totalValue: 20 * 29000 + 15 * 25000 + 10 * 32000,
    notes: "Q1 2025 order - includes new Hybrid models",
    entityId: "showroom-hanoi-2",
  },
  // GAC Orders
  {
    orderNumber: "PO-2024-GAC-001",
    brand: "GAC",
    vehicles: [
      { model: "GS8", variant: "Flagship", color: "Midnight Blue", quantity: 8, unitPrice: 42000 },
      { model: "GS4", variant: "Plus", color: "White", quantity: 12, unitPrice: 28000 },
      { model: "M8", variant: "Master", color: "Black", quantity: 5, unitPrice: 55000 },
    ],
    orderedAt: getDateString(-75),
    expectedProductionComplete: getDateString(-45),
    expectedShipDate: getDateString(-35),
    expectedArrivalDate: getDateString(-5),
    totalValue: 8 * 42000 + 12 * 28000 + 5 * 55000,
    lcNumber: "LC-2024-GAC-001",
    lcOpenedAt: getDateString(-70),
    lcExpiryAt: getDateString(45),
    entityId: "showroom-hcm-2",
  },
  {
    orderNumber: "PO-2025-GAC-001",
    brand: "GAC",
    vehicles: [
      { model: "AION S", variant: "Plus", color: "Silver", quantity: 15, unitPrice: 35000 },
      { model: "AION Y", variant: "Young", color: "Green", quantity: 10, unitPrice: 28000 },
    ],
    orderedAt: getDateString(-15),
    expectedProductionComplete: getDateString(30),
    expectedShipDate: getDateString(45),
    expectedArrivalDate: getDateString(90),
    totalValue: 15 * 35000 + 10 * 28000,
    notes: "EV expansion order for Da Nang market",
    entityId: "showroom-danang",
  },
  // Lotus Orders
  {
    orderNumber: "PO-2024-LOT-001",
    brand: "Lotus",
    vehicles: [
      { model: "Eletre", variant: "S", color: "Lotus Yellow", quantity: 3, unitPrice: 95000 },
      { model: "Eletre", variant: "R", color: "Kaimu Grey", quantity: 2, unitPrice: 120000 },
    ],
    orderedAt: getDateString(-120),
    expectedProductionComplete: getDateString(-90),
    expectedShipDate: getDateString(-75),
    expectedArrivalDate: getDateString(-45),
    totalValue: 3 * 95000 + 2 * 120000,
    lcNumber: "LC-2024-LOT-001",
    lcOpenedAt: getDateString(-115),
    lcExpiryAt: getDateString(15),
    notes: "Premium Lotus order - VIP allocation",
    entityId: "showroom-hanoi-1",
  },
];

// ============================================
// Vehicles (Various stages in supply chain)
// ============================================

const vehicles: CreateVehicleInput[] = [
  // === AT SHOWROOM (Available for sale) ===
  // Showroom Hanoi 1 - GWM
  {
    vin: generateVIN("GWM", 1),
    brand: "GWM",
    model: "Haval H6",
    variant: "Premium",
    color: "White Pearl",
    year: 2024,
    importPrice: 25000,
    listPrice: 1050000000,
    dealerPrice: 980000000,
    status: "at_showroom",
    assignedShowroom: "showroom-hanoi-1",
    currentLocation: "showroom-hanoi-1",
    orderedAt: getDateString(-120),
    expectedArrival: getDateString(-30),
    arrivedAt: getDateString(-28),
    entityId: "showroom-hanoi-1",
  },
  {
    vin: generateVIN("GWM", 2),
    brand: "GWM",
    model: "Haval H6",
    variant: "Sport",
    color: "Black Metallic",
    year: 2024,
    importPrice: 27000,
    listPrice: 1120000000,
    status: "at_showroom",
    assignedShowroom: "showroom-hanoi-1",
    currentLocation: "showroom-hanoi-1",
    orderedAt: getDateString(-120),
    expectedArrival: getDateString(-30),
    arrivedAt: getDateString(-28),
    entityId: "showroom-hanoi-1",
  },
  {
    vin: generateVIN("GWM", 3),
    brand: "GWM",
    model: "Haval Jolion",
    variant: "Luxury",
    color: "Silver",
    year: 2024,
    importPrice: 22000,
    listPrice: 920000000,
    status: "at_showroom",
    assignedShowroom: "showroom-hanoi-1",
    currentLocation: "showroom-hanoi-1",
    orderedAt: getDateString(-110),
    expectedArrival: getDateString(-25),
    arrivedAt: getDateString(-23),
    entityId: "showroom-hanoi-1",
  },
  // Showroom HCM 1 - GAC
  {
    vin: generateVIN("GAC", 1),
    brand: "GAC",
    model: "GS8",
    variant: "Flagship",
    color: "Midnight Blue",
    year: 2024,
    importPrice: 42000,
    listPrice: 1350000000,
    status: "at_showroom",
    assignedShowroom: "showroom-hcm-1",
    currentLocation: "showroom-hcm-1",
    orderedAt: getDateString(-100),
    expectedArrival: getDateString(-20),
    arrivedAt: getDateString(-18),
    entityId: "showroom-hcm-1",
  },
  {
    vin: generateVIN("GAC", 2),
    brand: "GAC",
    model: "GS4",
    variant: "Plus",
    color: "White",
    year: 2024,
    importPrice: 28000,
    listPrice: 880000000,
    status: "at_showroom",
    assignedShowroom: "showroom-hcm-1",
    currentLocation: "showroom-hcm-1",
    orderedAt: getDateString(-95),
    expectedArrival: getDateString(-15),
    arrivedAt: getDateString(-12),
    entityId: "showroom-hcm-1",
  },
  // Showroom Da Nang - Lotus
  {
    vin: generateVIN("Lotus", 1),
    brand: "Lotus",
    model: "Eletre",
    variant: "S",
    color: "Lotus Yellow",
    year: 2024,
    importPrice: 95000,
    listPrice: 4200000000,
    status: "at_showroom",
    assignedShowroom: "showroom-danang",
    currentLocation: "showroom-danang",
    orderedAt: getDateString(-150),
    expectedArrival: getDateString(-45),
    arrivedAt: getDateString(-43),
    entityId: "showroom-danang",
  },

  // === RESERVED (Customer has reserved) ===
  {
    vin: generateVIN("GWM", 4),
    brand: "GWM",
    model: "Tank 300",
    variant: "Offroad",
    color: "Desert Sand",
    year: 2024,
    importPrice: 38000,
    listPrice: 1480000000,
    status: "reserved",
    assignedShowroom: "showroom-hcm-2",
    currentLocation: "showroom-hcm-2",
    orderedAt: getDateString(-80),
    expectedArrival: getDateString(-10),
    arrivedAt: getDateString(-8),
    entityId: "showroom-hcm-2",
  },
  {
    vin: generateVIN("GAC", 3),
    brand: "GAC",
    model: "M8",
    variant: "Master",
    color: "Black",
    year: 2024,
    importPrice: 55000,
    listPrice: 2100000000,
    status: "reserved",
    assignedShowroom: "showroom-hanoi-2",
    currentLocation: "showroom-hanoi-2",
    orderedAt: getDateString(-90),
    expectedArrival: getDateString(-20),
    arrivedAt: getDateString(-18),
    entityId: "showroom-hanoi-2",
  },

  // === IN TRANSIT (Being delivered to showroom) ===
  {
    vin: generateVIN("GWM", 5),
    brand: "GWM",
    model: "Haval H6",
    variant: "Hybrid",
    color: "Blue",
    year: 2025,
    importPrice: 29000,
    listPrice: 1180000000,
    status: "in_transit",
    assignedShowroom: "showroom-hanoi-1",
    currentLocation: "Central Warehouse Hanoi",
    orderedAt: getDateString(-60),
    expectedArrival: getDateString(3),
    entityId: "showroom-hanoi-1",
  },
  {
    vin: generateVIN("GWM", 6),
    brand: "GWM",
    model: "Haval H6",
    variant: "Premium",
    color: "White Pearl",
    year: 2025,
    importPrice: 25000,
    listPrice: 1050000000,
    status: "in_transit",
    assignedShowroom: "showroom-hcm-1",
    currentLocation: "Central Warehouse HCM",
    orderedAt: getDateString(-55),
    expectedArrival: getDateString(5),
    entityId: "showroom-hcm-1",
  },

  // === IN WAREHOUSE (At central warehouse) ===
  {
    vin: generateVIN("GAC", 4),
    brand: "GAC",
    model: "GS8",
    variant: "Flagship",
    color: "White",
    year: 2024,
    importPrice: 42000,
    listPrice: 1350000000,
    status: "in_warehouse",
    assignedShowroom: "showroom-danang",
    currentLocation: "Central Warehouse Da Nang",
    orderedAt: getDateString(-70),
    expectedArrival: getDateString(7),
    entityId: "showroom-danang",
  },
  {
    vin: generateVIN("Lotus", 2),
    brand: "Lotus",
    model: "Eletre",
    variant: "R",
    color: "Kaimu Grey",
    year: 2024,
    importPrice: 120000,
    listPrice: 5200000000,
    status: "in_warehouse",
    assignedShowroom: "showroom-hanoi-1",
    currentLocation: "Central Warehouse Hanoi",
    orderedAt: getDateString(-130),
    expectedArrival: getDateString(10),
    entityId: "showroom-hanoi-1",
  },

  // === INSPECTION (Quality inspection) ===
  {
    vin: generateVIN("GWM", 7),
    brand: "GWM",
    model: "ORA Good Cat",
    variant: "GT",
    color: "Pink",
    year: 2025,
    importPrice: 32000,
    listPrice: 1280000000,
    status: "inspection",
    assignedShowroom: "showroom-hcm-2",
    currentLocation: "Inspection Center HCM",
    orderedAt: getDateString(-45),
    expectedArrival: getDateString(12),
    entityId: "showroom-hcm-2",
  },

  // === CUSTOMS (At customs clearance) ===
  {
    vin: generateVIN("GAC", 5),
    brand: "GAC",
    model: "AION S",
    variant: "Plus",
    color: "Silver",
    year: 2025,
    importPrice: 35000,
    listPrice: 1150000000,
    status: "customs",
    assignedShowroom: "showroom-danang",
    currentLocation: "Hai Phong Port",
    orderedAt: getDateString(-40),
    expectedArrival: getDateString(20),
    entityId: "showroom-danang",
  },
  {
    vin: generateVIN("GAC", 6),
    brand: "GAC",
    model: "AION Y",
    variant: "Young",
    color: "Green",
    year: 2025,
    importPrice: 28000,
    listPrice: 920000000,
    status: "customs",
    assignedShowroom: "showroom-hcm-1",
    currentLocation: "Cat Lai Port",
    orderedAt: getDateString(-38),
    expectedArrival: getDateString(22),
    entityId: "showroom-hcm-1",
  },

  // === AT PORT (Just arrived at Vietnam port) ===
  {
    vin: generateVIN("GWM", 8),
    brand: "GWM",
    model: "Tank 500",
    variant: "Premium",
    color: "Black",
    year: 2024,
    importPrice: 52000,
    listPrice: 1980000000,
    status: "at_port",
    assignedShowroom: "showroom-hcm-1",
    currentLocation: "Cat Lai Port",
    orderedAt: getDateString(-50),
    expectedArrival: getDateString(25),
    entityId: "showroom-hcm-1",
  },

  // === SHIPPED (On vessel) ===
  {
    vin: generateVIN("GWM", 9),
    brand: "GWM",
    model: "Haval H6",
    variant: "Hybrid",
    color: "Blue",
    year: 2025,
    importPrice: 29000,
    listPrice: 1180000000,
    status: "shipped",
    assignedShowroom: "showroom-hanoi-2",
    currentLocation: "MV Pacific Star - South China Sea",
    orderedAt: getDateString(-35),
    expectedArrival: getDateString(35),
    entityId: "showroom-hanoi-2",
  },
  {
    vin: generateVIN("GWM", 10),
    brand: "GWM",
    model: "Haval H6",
    variant: "Premium",
    color: "Red",
    year: 2025,
    importPrice: 25000,
    listPrice: 1050000000,
    status: "shipped",
    assignedShowroom: "showroom-danang",
    currentLocation: "MV Pacific Star - South China Sea",
    orderedAt: getDateString(-35),
    expectedArrival: getDateString(35),
    entityId: "showroom-danang",
  },

  // === IN PRODUCTION (Being manufactured) ===
  {
    vin: generateVIN("GAC", 7),
    brand: "GAC",
    model: "AION S",
    variant: "Max",
    color: "White",
    year: 2025,
    importPrice: 38000,
    listPrice: 1250000000,
    status: "in_production",
    assignedShowroom: "showroom-hanoi-1",
    currentLocation: "GAC Factory - Guangzhou",
    orderedAt: getDateString(-20),
    expectedArrival: getDateString(60),
    entityId: "showroom-hanoi-1",
  },
  {
    vin: generateVIN("Lotus", 3),
    brand: "Lotus",
    model: "Emeya",
    variant: "S",
    color: "British Racing Green",
    year: 2025,
    importPrice: 110000,
    listPrice: 4800000000,
    status: "in_production",
    assignedShowroom: "showroom-hcm-1",
    currentLocation: "Lotus Factory - Wuhan",
    orderedAt: getDateString(-15),
    expectedArrival: getDateString(75),
    entityId: "showroom-hcm-1",
  },

  // === ORDERED (PO placed, not yet in production) ===
  {
    vin: generateVIN("GWM", 11),
    brand: "GWM",
    model: "Tank 700",
    variant: "Hi4-T",
    color: "Army Green",
    year: 2025,
    importPrice: 65000,
    listPrice: 2500000000,
    status: "ordered",
    assignedShowroom: "showroom-hanoi-1",
    currentLocation: "GWM Factory - Baoding",
    orderedAt: getDateString(-5),
    expectedArrival: getDateString(90),
    entityId: "showroom-hanoi-1",
  },

  // === SOLD (Recently sold, awaiting delivery) ===
  {
    vin: generateVIN("GWM", 12),
    brand: "GWM",
    model: "Haval H6",
    variant: "Premium",
    color: "Grey",
    year: 2024,
    importPrice: 25000,
    listPrice: 1050000000,
    status: "sold",
    assignedShowroom: "showroom-hanoi-1",
    currentLocation: "showroom-hanoi-1",
    orderedAt: getDateString(-100),
    expectedArrival: getDateString(-30),
    arrivedAt: getDateString(-28),
    soldAt: getDateString(-2),
    entityId: "showroom-hanoi-1",
  },
  {
    vin: generateVIN("GAC", 8),
    brand: "GAC",
    model: "GS4",
    variant: "Plus",
    color: "Red",
    year: 2024,
    importPrice: 28000,
    listPrice: 880000000,
    status: "sold",
    assignedShowroom: "showroom-hcm-1",
    currentLocation: "showroom-hcm-1",
    orderedAt: getDateString(-90),
    expectedArrival: getDateString(-25),
    arrivedAt: getDateString(-23),
    soldAt: getDateString(-1),
    entityId: "showroom-hcm-1",
  },

  // === DELIVERED (Completed sales) ===
  {
    vin: generateVIN("GWM", 13),
    brand: "GWM",
    model: "Haval Jolion",
    variant: "Luxury",
    color: "Blue",
    year: 2024,
    importPrice: 22000,
    listPrice: 920000000,
    status: "delivered",
    assignedShowroom: "showroom-hanoi-2",
    currentLocation: "Customer",
    orderedAt: getDateString(-120),
    expectedArrival: getDateString(-50),
    arrivedAt: getDateString(-48),
    soldAt: getDateString(-15),
    entityId: "showroom-hanoi-2",
  },
  {
    vin: generateVIN("Lotus", 4),
    brand: "Lotus",
    model: "Eletre",
    variant: "S",
    color: "Black",
    year: 2024,
    importPrice: 95000,
    listPrice: 4200000000,
    status: "delivered",
    assignedShowroom: "showroom-hcm-2",
    currentLocation: "Customer",
    orderedAt: getDateString(-140),
    expectedArrival: getDateString(-60),
    arrivedAt: getDateString(-58),
    soldAt: getDateString(-20),
    entityId: "showroom-hcm-2",
  },

  // === AGING VEHICLES (>60 days in inventory - for testing alerts) ===
  {
    vin: generateVIN("GWM", 14),
    brand: "GWM",
    model: "Haval H6",
    variant: "Sport",
    color: "Silver",
    year: 2024,
    importPrice: 27000,
    listPrice: 1120000000,
    status: "at_showroom",
    assignedShowroom: "showroom-hanoi-1",
    currentLocation: "showroom-hanoi-1",
    orderedAt: getDateString(-150),
    expectedArrival: getDateString(-70),
    arrivedAt: getDateString(-68), // 68 days - WARNING
    entityId: "showroom-hanoi-1",
  },
  {
    vin: generateVIN("GAC", 9),
    brand: "GAC",
    model: "GS8",
    variant: "Flagship",
    color: "Grey",
    year: 2024,
    importPrice: 42000,
    listPrice: 1350000000,
    status: "at_showroom",
    assignedShowroom: "showroom-hcm-1",
    currentLocation: "showroom-hcm-1",
    orderedAt: getDateString(-180),
    expectedArrival: getDateString(-100),
    arrivedAt: getDateString(-95), // 95 days - CRITICAL
    entityId: "showroom-hcm-1",
  },
  {
    vin: generateVIN("GWM", 15),
    brand: "GWM",
    model: "Haval Jolion",
    variant: "Standard",
    color: "White",
    year: 2024,
    importPrice: 20000,
    listPrice: 850000000,
    status: "at_showroom",
    assignedShowroom: "showroom-danang",
    currentLocation: "showroom-danang",
    orderedAt: getDateString(-160),
    expectedArrival: getDateString(-85),
    arrivedAt: getDateString(-82), // 82 days - WARNING
    entityId: "showroom-danang",
  },
];

// ============================================
// Main seeding function
// ============================================

async function seedInventoryData() {
  try {
    console.log("Seeding import orders...");
    const createdOrders = [];
    for (const order of importOrders) {
      const created = await createImportOrder(order);
      createdOrders.push(created);
      console.log(
        `  ✓ Created order: ${created.orderNumber} - ${created.brand} (${created.totalUnits} units, $${created.totalValue.toLocaleString()})`
      );
    }

    console.log("\nSeeding vehicles...");
    const createdVehicles = [];
    const statusCounts: Record<string, number> = {};

    for (const vehicle of vehicles) {
      const created = await createVehicle(vehicle);
      createdVehicles.push(created);
      statusCounts[created.status] = (statusCounts[created.status] || 0) + 1;
      console.log(
        `  ✓ Created vehicle: ${created.brand} ${created.model} ${created.variant} (${created.vin}) - ${created.status}`
      );
    }

    console.log("\n=== ✅ All inventory data seeded successfully ===\n");
    console.log("Summary:");
    console.log(`  Import Orders: ${createdOrders.length}`);
    console.log(`  Vehicles: ${createdVehicles.length}`);
    console.log("\n  Vehicles by Status:");
    Object.entries(statusCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([status, count]) => {
        console.log(`    - ${status}: ${count}`);
      });

    // Count aging vehicles
    const agingVehicles = createdVehicles.filter(
      (v) => v.ageAlert !== "none" && !["sold", "delivered"].includes(v.status)
    );
    if (agingVehicles.length > 0) {
      console.log(`\n  ⚠️  Aging Vehicles: ${agingVehicles.length}`);
      const warnings = agingVehicles.filter((v) => v.ageAlert === "warning");
      const criticals = agingVehicles.filter((v) => v.ageAlert === "critical");
      if (warnings.length) console.log(`    - Warning (>60d): ${warnings.length}`);
      if (criticals.length) console.log(`    - Critical (>90d): ${criticals.length}`);
    }

    console.log("");
  } catch (error) {
    console.error("\n❌ Error seeding inventory data:", error);
    process.exit(1);
  }
}

seedInventoryData();
