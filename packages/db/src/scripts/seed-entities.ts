/**
 * Seed entities data into DynamoDB
 *
 * Usage:
 *   bun run db:seed-entities
 *
 * This script seeds the entities collection with Tasco Group entity data.
 * It only seeds if the collection is empty.
 */

import { batchCreateEntities, isEntitiesEmpty } from "../entities";
import type { CreateEntityInput } from "../entities";

// Tasco Group entity hierarchy
const SEED_ENTITIES: CreateEntityInput[] = [
  {
    id: "tasco-group",
    name: "Tasco Group Holdings",
    shortName: "Tasco Group",
    type: "parent",
    metadata: {
      location: "Hanoi, Vietnam",
      employeeCount: 15000,
      industry: "Conglomerate",
    },
  },
  {
    id: "tasco-insurance",
    name: "Tasco Insurance JSC",
    shortName: "Tasco Insurance",
    type: "holding",
    parentId: "tasco-group",
    metadata: {
      location: "Hanoi, Vietnam",
      employeeCount: 1800,
      industry: "Insurance",
    },
  },
  {
    id: "tasco-life",
    name: "Tasco Life Insurance",
    shortName: "Tasco Life",
    type: "subsidiary",
    parentId: "tasco-insurance",
    metadata: {
      location: "Hanoi, Vietnam",
      employeeCount: 650,
      industry: "Life Insurance",
    },
  },
  {
    id: "tasco-general",
    name: "Tasco General Insurance",
    shortName: "Tasco General",
    type: "subsidiary",
    parentId: "tasco-insurance",
    metadata: {
      location: "Hanoi, Vietnam",
      employeeCount: 480,
      industry: "General Insurance",
    },
  },
  {
    id: "tasco-auto",
    name: "Tasco Auto JSC",
    shortName: "Tasco Auto",
    type: "subsidiary",
    parentId: "tasco-group",
    metadata: {
      location: "Hanoi, Vietnam",
      employeeCount: 1200,
      industry: "Automotive",
    },
  },
  {
    id: "inochi",
    name: "Inochi Vietnam JSC",
    shortName: "Inochi",
    type: "subsidiary",
    parentId: "tasco-group",
    metadata: {
      location: "Tan Phu, Vietnam",
      employeeCount: 950,
      industry: "Consumer Goods",
    },
  },
  {
    id: "thang-long",
    name: "Thang Long Materials JSC",
    shortName: "Thang Long",
    type: "subsidiary",
    parentId: "tasco-group",
    metadata: {
      location: "Hanoi, Vietnam",
      employeeCount: 420,
      industry: "Construction Materials",
    },
  },
  {
    id: "dnp-water",
    name: "DNP Water JSC",
    shortName: "DNP Water",
    type: "subsidiary",
    parentId: "tasco-group",
    metadata: {
      location: "Hanoi, Vietnam",
      employeeCount: 850,
      industry: "Water Treatment",
    },
  },
  {
    id: "dnp-holding",
    name: "DNP Holding JSC",
    shortName: "DNP Holding",
    type: "holding",
    parentId: "tasco-group",
    metadata: {
      location: "Hanoi, Vietnam",
      employeeCount: 2500,
      industry: "Diversified Holdings",
    },
  },
  {
    id: "dnp-energy",
    name: "DNP Energy JSC",
    shortName: "DNP Energy",
    type: "subsidiary",
    parentId: "dnp-holding",
    metadata: {
      location: "Hanoi, Vietnam",
      employeeCount: 600,
      industry: "Energy",
    },
  },
  {
    id: "carpla",
    name: "Carpla Vietnam JSC",
    shortName: "Carpla",
    type: "subsidiary",
    parentId: "tasco-auto",
    metadata: {
      location: "Ho Chi Minh City, Vietnam",
      employeeCount: 350,
      industry: "Used Car Platform",
    },
  },
];

async function main(): Promise<void> {
  console.log("\n=== Tasco Entities Seed Script ===\n");

  try {
    const isEmpty = await isEntitiesEmpty();

    if (!isEmpty) {
      console.log("Entities collection already contains data. Skipping seed.");
      console.log("To re-seed, delete the existing entities first.\n");
      return;
    }

    console.log(`Seeding ${SEED_ENTITIES.length} entities...`);

    const created = await batchCreateEntities(SEED_ENTITIES);

    console.log(`\n✓ Successfully seeded ${created.length} entities:\n`);

    // Group by type for display
    const byType = created.reduce(
      (acc, entity) => {
        acc[entity.type] = acc[entity.type] || [];
        acc[entity.type].push(entity);
        return acc;
      },
      {} as Record<string, typeof created>
    );

    for (const [type, entities] of Object.entries(byType)) {
      console.log(`  ${type.toUpperCase()}:`);
      for (const entity of entities) {
        console.log(`    - ${entity.name} (${entity.id})`);
      }
    }

    console.log("\n=== Seed completed successfully ===\n");
  } catch (error) {
    console.error("\n❌ Error seeding entities:", error);
    process.exit(1);
  }
}

main();
