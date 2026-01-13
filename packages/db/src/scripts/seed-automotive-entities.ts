/**
 * Seed automotive entities for customer-lifecycle app
 *
 * Usage:
 *   bun run db:seed-automotive
 *
 * This script adds car showrooms and B2B clients for Tasco Auto's CRM.
 * These entities have the automotive-showroom and automotive-b2b categories.
 */

import { createEntity, getEntity } from "../entities";
import type { CreateEntityInput } from "../entities";

// Automotive showrooms (Tasco Auto's dealership network)
const SHOWROOM_ENTITIES: CreateEntityInput[] = [
  {
    id: "showroom-hanoi-1",
    name: "Tasco Auto Showroom - Cầu Giấy",
    shortName: "Cầu Giấy",
    type: "subsidiary",
    category: "automotive-showroom",
    parentId: "tasco-auto",
    metadata: {
      location: "Cầu Giấy, Hanoi",
      employeeCount: 45,
      industry: "Car Dealership",
    },
  },
  {
    id: "showroom-hanoi-2",
    name: "Tasco Auto Showroom - Long Biên",
    shortName: "Long Biên",
    type: "subsidiary",
    category: "automotive-showroom",
    parentId: "tasco-auto",
    metadata: {
      location: "Long Biên, Hanoi",
      employeeCount: 38,
      industry: "Car Dealership",
    },
  },
  {
    id: "showroom-hcm-1",
    name: "Tasco Auto Showroom - Quận 7",
    shortName: "Quận 7",
    type: "subsidiary",
    category: "automotive-showroom",
    parentId: "tasco-auto",
    metadata: {
      location: "District 7, Ho Chi Minh",
      employeeCount: 52,
      industry: "Car Dealership",
    },
  },
  {
    id: "showroom-hcm-2",
    name: "Tasco Auto Showroom - Thủ Đức",
    shortName: "Thủ Đức",
    type: "subsidiary",
    category: "automotive-showroom",
    parentId: "tasco-auto",
    metadata: {
      location: "Thủ Đức, Ho Chi Minh",
      employeeCount: 41,
      industry: "Car Dealership",
    },
  },
  {
    id: "showroom-danang",
    name: "Tasco Auto Showroom - Hải Châu",
    shortName: "Hải Châu",
    type: "subsidiary",
    category: "automotive-showroom",
    parentId: "tasco-auto",
    metadata: {
      location: "Hải Châu, Da Nang",
      employeeCount: 35,
      industry: "Car Dealership",
    },
  },
  {
    id: "carpla-hanoi",
    name: "Carpla Certified - Hanoi",
    shortName: "Carpla Hanoi",
    type: "subsidiary",
    category: "automotive-showroom",
    parentId: "carpla",
    metadata: {
      location: "Hanoi",
      employeeCount: 28,
      industry: "Used Car Dealership",
    },
  },
  {
    id: "carpla-hcm",
    name: "Carpla Certified - HCM",
    shortName: "Carpla HCM",
    type: "subsidiary",
    category: "automotive-showroom",
    parentId: "carpla",
    metadata: {
      location: "Ho Chi Minh",
      employeeCount: 32,
      industry: "Used Car Dealership",
    },
  },
];

// B2B clients (corporate fleet customers)
const B2B_ENTITIES: CreateEntityInput[] = [
  {
    id: "b2b-vinfast-fleet",
    name: "VinFast Corporate Fleet",
    shortName: "VinFast",
    type: "subsidiary",
    category: "automotive-b2b",
    metadata: {
      location: "Hai Phong, Vietnam",
      employeeCount: 15000,
      industry: "Fleet Services",
      comments: "Major EV fleet partner",
    },
  },
  {
    id: "b2b-grab-vietnam",
    name: "Grab Vietnam",
    shortName: "Grab",
    type: "subsidiary",
    category: "automotive-b2b",
    metadata: {
      location: "Ho Chi Minh, Vietnam",
      employeeCount: 2500,
      industry: "Ride-hailing",
      comments: "Driver fleet programs",
    },
  },
  {
    id: "b2b-viettel-fleet",
    name: "Viettel Fleet Management",
    shortName: "Viettel",
    type: "subsidiary",
    category: "automotive-b2b",
    metadata: {
      location: "Hanoi, Vietnam",
      employeeCount: 35000,
      industry: "Telecommunications",
      comments: "Corporate vehicle fleet",
    },
  },
  {
    id: "b2b-fpt-automotive",
    name: "FPT Automotive",
    shortName: "FPT Auto",
    type: "subsidiary",
    category: "automotive-b2b",
    metadata: {
      location: "Hanoi, Vietnam",
      employeeCount: 28000,
      industry: "Technology",
      comments: "Executive vehicle program",
    },
  },
  {
    id: "b2b-masan-logistics",
    name: "Masan Logistics",
    shortName: "Masan",
    type: "subsidiary",
    category: "automotive-b2b",
    metadata: {
      location: "Ho Chi Minh, Vietnam",
      employeeCount: 8000,
      industry: "Retail/FMCG",
      comments: "Distribution fleet",
    },
  },
];

async function seedEntity(input: CreateEntityInput): Promise<boolean> {
  // Check if entity already exists
  const existing = await getEntity(input.id!);
  if (existing) {
    console.log(`  ⏭️  Skipping ${input.name} (already exists)`);
    return false;
  }

  await createEntity(input);
  console.log(`  ✓ Created ${input.name}`);
  return true;
}

async function main(): Promise<void> {
  console.log("\n=== Automotive Entities Seed Script ===\n");

  try {
    let createdCount = 0;
    let skippedCount = 0;

    // Seed showrooms
    console.log("Seeding showrooms...");
    for (const entity of SHOWROOM_ENTITIES) {
      const created = await seedEntity(entity);
      if (created) createdCount++;
      else skippedCount++;
    }

    // Seed B2B clients
    console.log("\nSeeding B2B clients...");
    for (const entity of B2B_ENTITIES) {
      const created = await seedEntity(entity);
      if (created) createdCount++;
      else skippedCount++;
    }

    console.log(`\n=== Seed completed ===`);
    console.log(`  Created: ${createdCount}`);
    console.log(`  Skipped: ${skippedCount}`);
    console.log("");
  } catch (error) {
    console.error("\n❌ Error seeding automotive entities:", error);
    process.exit(1);
  }
}

main();
