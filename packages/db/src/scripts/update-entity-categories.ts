/**
 * Update existing entities with category field
 *
 * Usage:
 *   bun run db:update-categories
 *
 * This script adds the "tasco-group" category to existing Tasco Group entities.
 * This allows the customer-lifecycle app to filter them out and show only
 * automotive entities.
 */

import { listEntities, updateEntity } from "../entities";
import type { EntityCategory } from "../entities";

// Existing Tasco Group entity IDs that should get "tasco-group" category
const TASCO_GROUP_IDS = [
  "tasco-group",
  "tasco-insurance",
  "tasco-life",
  "tasco-general",
  "tasco-auto",
  "inochi",
  "thang-long",
  "dnp-water",
  "dnp-holding",
  "dnp-energy",
  "carpla",
];

async function main(): Promise<void> {
  console.log("\n=== Update Entity Categories Script ===\n");

  try {
    // Get all entities
    const { items: entities } = await listEntities(1000);
    console.log(`Found ${entities.length} total entities\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const entity of entities) {
      // Skip if already has a category
      if (entity.category) {
        console.log(`  ⏭️  ${entity.name} (already has category: ${entity.category})`);
        skippedCount++;
        continue;
      }

      // Determine the category based on entity ID
      let newCategory: EntityCategory | undefined;

      if (TASCO_GROUP_IDS.includes(entity.id)) {
        newCategory = "tasco-group";
      }

      if (newCategory) {
        await updateEntity(entity.id, { category: newCategory });
        console.log(`  ✓ Updated ${entity.name} → category: ${newCategory}`);
        updatedCount++;
      } else {
        console.log(`  ⚠️  ${entity.name} - no category mapping found`);
        skippedCount++;
      }
    }

    console.log(`\n=== Update completed ===`);
    console.log(`  Updated: ${updatedCount}`);
    console.log(`  Skipped: ${skippedCount}`);
    console.log("");
  } catch (error) {
    console.error("\n❌ Error updating entity categories:", error);
    process.exit(1);
  }
}

main();
