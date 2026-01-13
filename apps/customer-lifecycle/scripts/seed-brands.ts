#!/usr/bin/env bun
/**
 * Seed Automotive Brands as Entities
 *
 * Adds GWM, GAC, and Lotus as entities with category "automotive-brand"
 *
 * Run: bun run scripts/seed-brands.ts
 */

import {
  createEntity,
  getEntity,
  listEntitiesByCategory,
  type CreateEntityInput,
} from "@tasco/db";

// Brand definitions with metadata
const BRANDS: CreateEntityInput[] = [
  {
    id: "gwm",
    name: "Great Wall Motors",
    shortName: "GWM",
    type: "subsidiary",
    category: "automotive-brand",
    metadata: {
      country: "China",
      colorTheme: "red",
      colorClass: "text-red-500",
      bgClass: "bg-red-500/10",
      gradientClass: "from-red-500/15 to-red-600/5",
      borderClass: "border-red-500/30",
      accentClass: "bg-red-500",
      vinPrefix: "LGWEF",
      models: [
        { name: "Haval H6", variants: ["Lux", "Premium", "Ultra"] },
        { name: "Haval Jolion", variants: ["Lux", "Premium"] },
        { name: "Tank 300", variants: ["Standard", "Adventure"] },
        { name: "Tank 500", variants: ["Commander", "Luxury"] },
        { name: "Poer", variants: ["Standard", "Premium"] },
        { name: "Ora Good Cat", variants: ["Standard", "GT"] },
        { name: "Haval H6 HEV", variants: ["Premium", "Ultra"] },
      ],
      description: "Leading Chinese SUV and pickup truck manufacturer",
    },
  },
  {
    id: "gac",
    name: "GAC Motor",
    shortName: "GAC",
    type: "subsidiary",
    category: "automotive-brand",
    metadata: {
      country: "China",
      colorTheme: "blue",
      colorClass: "text-blue-500",
      bgClass: "bg-blue-500/10",
      gradientClass: "from-blue-500/15 to-blue-600/5",
      borderClass: "border-blue-500/30",
      accentClass: "bg-blue-500",
      vinPrefix: "LSGJA",
      models: [
        { name: "GS3", variants: ["Comfort", "Deluxe"] },
        { name: "GS4", variants: ["Comfort", "Premium"] },
        { name: "GS8", variants: ["Luxury", "Master"] },
        { name: "AION Y Plus", variants: ["Standard", "Long Range"] },
        { name: "AION S Plus", variants: ["Standard", "Elite"] },
      ],
      description: "Guangzhou Automobile Group - premium Chinese automaker",
    },
  },
  {
    id: "lotus",
    name: "Lotus Cars",
    shortName: "Lotus",
    type: "subsidiary",
    category: "automotive-brand",
    metadata: {
      country: "UK",
      colorTheme: "amber",
      colorClass: "text-amber-500",
      bgClass: "bg-amber-500/10",
      gradientClass: "from-amber-500/15 to-amber-600/5",
      borderClass: "border-amber-500/30",
      accentClass: "bg-amber-500",
      vinPrefix: "SCCLM",
      models: [
        { name: "Eletre", variants: ["S", "R"] },
        { name: "Emeya", variants: ["S", "R"] },
      ],
      description: "British luxury performance EV brand",
    },
  },
];

async function main() {
  console.log("\n🚗 SEEDING AUTOMOTIVE BRANDS\n");
  console.log("=".repeat(60));

  // Check existing brands
  const existingBrands = await listEntitiesByCategory("automotive-brand");
  console.log(`\n📋 Found ${existingBrands.length} existing brand entities\n`);

  if (existingBrands.length > 0) {
    console.log("Existing brands:");
    existingBrands.forEach((b) => console.log(`   - ${b.shortName}: ${b.name}`));
    console.log("\n⚠️  Brands already exist. Checking for missing ones...\n");
  }

  // Create missing brands
  let created = 0;
  let skipped = 0;

  for (const brandInput of BRANDS) {
    const existing = await getEntity(brandInput.id!);

    if (existing) {
      console.log(`⏭️  Skipping ${brandInput.shortName} (already exists)`);
      skipped++;
      continue;
    }

    try {
      console.log(`📄 Creating: ${brandInput.name} (${brandInput.shortName})`);
      const brand = await createEntity(brandInput);
      console.log(`   ✅ Created: ${brand.id}\n`);
      created++;
    } catch (error) {
      console.error(`   ❌ Failed: ${error}\n`);
    }
  }

  // Summary
  console.log("=".repeat(60));
  console.log("SEED SUMMARY");
  console.log("=".repeat(60));
  console.log(`\n✅ Created: ${created}`);
  console.log(`⏭️  Skipped: ${skipped}`);

  if (created > 0) {
    console.log("\n🎉 Brands seeded successfully!");
  }

  // Verify
  console.log("\n📋 Verifying brands in database:\n");
  const allBrands = await listEntitiesByCategory("automotive-brand");
  allBrands.forEach((b) => {
    const meta = b.metadata as Record<string, unknown>;
    console.log(`   ${b.shortName} (${b.id})`);
    console.log(`   └─ Models: ${(meta.models as Array<{name: string}>)?.map(m => m.name).join(", ")}`);
  });

  console.log("\n" + "=".repeat(60) + "\n");
}

main().catch(console.error);
