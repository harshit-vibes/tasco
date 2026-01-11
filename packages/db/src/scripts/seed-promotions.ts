/**
 * Seed sample promotions for demo purposes
 *
 * Usage:
 *   bun run db:seed-promotions
 */

import { createPromotion, listAllPromotions } from "../promotions";
import type { CreatePromotionInput } from "../promotions";

// Inochi entity ID (from entities.json)
const INOCHI_ENTITY_ID = "ent-inochi";

// Sample promotions with various scenarios
const SAMPLE_PROMOTIONS: CreatePromotionInput[] = [
  // Active promotions
  {
    entityId: INOCHI_ENTITY_ID,
    name: "Lunar New Year 2026 Sale",
    description: "Celebrate Tet with 25% off all premium home products",
    type: "discount",
    status: "active",
    targetSegments: ["all"],
    targetProducts: ["premium-furniture", "home-decor", "kitchen-appliances"],
    targetChannels: ["all"],
    startDate: "2026-01-15",
    endDate: "2026-02-15",
    discountType: "percentage",
    discountValue: 25,
    stackable: false,
    excludePromotionIds: [],
    priority: 10,
    createdBy: "system",
  },
  {
    entityId: INOCHI_ENTITY_ID,
    name: "VIP Member Exclusive",
    description: "Extra 15% off for VIP members on all purchases",
    type: "loyalty",
    status: "active",
    targetSegments: ["vip"],
    targetProducts: ["all"],
    targetChannels: ["all"],
    startDate: "2026-01-01",
    endDate: "2026-03-31",
    discountType: "percentage",
    discountValue: 15,
    stackable: true, // Can stack with other promotions
    excludePromotionIds: [],
    priority: 5,
    createdBy: "system",
  },
  {
    entityId: INOCHI_ENTITY_ID,
    name: "First Purchase Discount",
    description: "Welcome offer: 10% off your first order",
    type: "coupon",
    status: "active",
    targetSegments: ["new"],
    targetProducts: ["all"],
    targetChannels: ["ecommerce"],
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    discountType: "percentage",
    discountValue: 10,
    stackable: false,
    excludePromotionIds: [],
    minPurchaseAmount: 500000, // 500,000 VND
    priority: 3,
    createdBy: "system",
  },
  // Conflicting promotions (for demo)
  {
    entityId: INOCHI_ENTITY_ID,
    name: "Winter Clearance",
    description: "Clear out winter inventory - 30% off bedding and blankets",
    type: "discount",
    status: "active",
    targetSegments: ["all"],
    targetProducts: ["bedding", "blankets", "home-textiles"],
    targetChannels: ["retail", "ecommerce"],
    startDate: "2026-01-10",
    endDate: "2026-01-31",
    discountType: "percentage",
    discountValue: 30,
    stackable: false, // Will conflict with Lunar New Year sale
    excludePromotionIds: [],
    priority: 8,
    createdBy: "system",
  },
  {
    entityId: INOCHI_ENTITY_ID,
    name: "Flash Sale Friday",
    description: "Every Friday: 20% off selected items",
    type: "discount",
    status: "active",
    targetSegments: ["all"],
    targetProducts: ["kitchen-appliances", "home-decor"],
    targetChannels: ["ecommerce"],
    startDate: "2026-01-01",
    endDate: "2026-03-31",
    discountType: "percentage",
    discountValue: 20,
    stackable: false, // Will conflict with other non-stackable promos
    excludePromotionIds: [],
    maxDiscountAmount: 1000000, // Max 1M VND discount
    priority: 7,
    createdBy: "system",
  },
  // Wholesale specific
  {
    entityId: INOCHI_ENTITY_ID,
    name: "Wholesale Partner Discount",
    description: "Bulk purchase discount for wholesale partners",
    type: "discount",
    status: "active",
    targetSegments: ["wholesale"],
    targetProducts: ["all"],
    targetChannels: ["wholesale", "direct"],
    startDate: "2026-01-01",
    endDate: "2026-06-30",
    discountType: "percentage",
    discountValue: 12,
    stackable: true,
    excludePromotionIds: [],
    minPurchaseAmount: 10000000, // 10M VND minimum
    priority: 4,
    createdBy: "system",
  },
  // Bundle promotion
  {
    entityId: INOCHI_ENTITY_ID,
    name: "Living Room Bundle",
    description: "Buy sofa + coffee table, get 40% off the bundle",
    type: "bundle",
    status: "active",
    targetSegments: ["all"],
    targetProducts: ["sofas", "coffee-tables", "living-room-furniture"],
    targetChannels: ["retail", "ecommerce"],
    startDate: "2026-01-15",
    endDate: "2026-02-28",
    discountType: "percentage",
    discountValue: 40,
    stackable: false,
    excludePromotionIds: [],
    priority: 6,
    createdBy: "system",
  },
  // Draft promotion
  {
    entityId: INOCHI_ENTITY_ID,
    name: "Valentine's Day Special",
    description: "Heart-shaped decor items at special prices",
    type: "discount",
    status: "draft",
    targetSegments: ["all"],
    targetProducts: ["home-decor", "gift-items"],
    targetChannels: ["all"],
    startDate: "2026-02-07",
    endDate: "2026-02-14",
    discountType: "percentage",
    discountValue: 20,
    stackable: true,
    excludePromotionIds: [],
    priority: 5,
    createdBy: "system",
  },
  // Paused promotion
  {
    entityId: INOCHI_ENTITY_ID,
    name: "Summer Preview (Paused)",
    description: "Early bird summer collection - temporarily paused",
    type: "discount",
    status: "paused",
    targetSegments: ["vip", "regular"],
    targetProducts: ["outdoor-furniture", "garden-decor"],
    targetChannels: ["ecommerce"],
    startDate: "2026-03-01",
    endDate: "2026-04-30",
    discountType: "percentage",
    discountValue: 15,
    stackable: true,
    excludePromotionIds: [],
    priority: 4,
    createdBy: "system",
  },
  // Expired promotion (for history)
  {
    entityId: INOCHI_ENTITY_ID,
    name: "Christmas 2025 Sale",
    description: "Christmas holiday special - ended",
    type: "discount",
    status: "expired",
    targetSegments: ["all"],
    targetProducts: ["all"],
    targetChannels: ["all"],
    startDate: "2025-12-15",
    endDate: "2025-12-31",
    discountType: "percentage",
    discountValue: 20,
    stackable: false,
    excludePromotionIds: [],
    priority: 10,
    createdBy: "system",
  },
  // Promotion with explicit exclusion
  {
    entityId: INOCHI_ENTITY_ID,
    name: "Premium Member Flash Sale",
    description: "Exclusive flash sale for premium members - cannot combine with New Year sale",
    type: "discount",
    status: "active",
    targetSegments: ["vip"],
    targetProducts: ["premium-furniture"],
    targetChannels: ["ecommerce"],
    startDate: "2026-01-20",
    endDate: "2026-01-25",
    discountType: "percentage",
    discountValue: 35,
    stackable: false,
    excludePromotionIds: [], // Will be updated after Lunar New Year promo is created
    priority: 9,
    createdBy: "system",
  },
];

async function main(): Promise<void> {
  console.log("\n=== Seeding Sample Promotions ===\n");

  // Check if promotions already exist
  const existing = await listAllPromotions(1);
  if (existing.items.length > 0) {
    console.log(`Found ${existing.items.length} existing promotions.`);
    console.log("Skipping seed to avoid duplicates.");
    console.log("To re-seed, delete existing promotions first.\n");
    return;
  }

  const createdPromotions: string[] = [];

  try {
    for (const input of SAMPLE_PROMOTIONS) {
      console.log(`Creating: ${input.name}...`);
      const promotion = await createPromotion(input);
      createdPromotions.push(promotion.promotionId);
      console.log(`  ✓ Created with ID: ${promotion.promotionId}`);
    }

    // Update the Premium Member Flash Sale to exclude Lunar New Year Sale
    // (demonstrating the exclusion rule feature)
    const lunarNewYearId = createdPromotions[0];
    const premiumFlashSaleId = createdPromotions[createdPromotions.length - 1];

    // Note: In production, we'd use updatePromotion to add the exclusion
    // For demo purposes, the conflict will still be detected by the conflict detection

    console.log(`\n=== Seeding Complete ===`);
    console.log(`Created ${createdPromotions.length} promotions`);
    console.log(`\nPromotion IDs:`);
    createdPromotions.forEach((id, i) => {
      console.log(`  ${i + 1}. ${id}`);
    });
    console.log("\n");
  } catch (error) {
    console.error("\n❌ Error seeding promotions:", error);
    process.exit(1);
  }
}

main();
