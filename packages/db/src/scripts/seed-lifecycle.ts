/**
 * Seed DynamoDB with Customer Lifecycle demo data
 *
 * Usage:
 *   bun run db:seed-lifecycle
 *
 * This script populates the lifecycle tables with demo data for Tasco Auto
 */

import {
  createLead,
  createCustomer,
  createInteraction,
  createPurchase,
  createCampaign,
  createAIRecommendation,
} from "../lifecycle";

console.log("\n=== Seeding Customer Lifecycle Data ===\n");

// Entity ID for Tasco Auto (should be created via seed-entities first)
const ENTITY_ID = "tasco-auto";

// ============================================
// Leads
// ============================================

const leads = [
  {
    customer: {
      name: "Nguyễn Văn An",
      email: "an.nguyen@email.com",
      phone: "+84 90 123 4567",
      location: "Hà Nội",
    },
    source: "website" as const,
    status: "new" as const,
    priority: "hot" as const,
    score: 85,
    interest: {
      brands: ["Toyota", "Honda"],
      vehicleTypes: ["SUV", "Sedan"],
      budget: "800M - 1.2B VNĐ",
      timeline: "Trong 1 tháng",
    },
    entityId: ENTITY_ID,
  },
  {
    customer: {
      name: "Trần Thị Bình",
      email: "binh.tran@email.com",
      phone: "+84 91 234 5678",
      location: "TP. Hồ Chí Minh",
    },
    source: "referral" as const,
    status: "contacted" as const,
    priority: "hot" as const,
    score: 92,
    interest: {
      brands: ["Ford", "Mazda"],
      vehicleTypes: ["Pickup", "SUV"],
      budget: "900M - 1.5B VNĐ",
      timeline: "Trong 2 tuần",
    },
    assignedTo: "Phạm Văn Nam",
    entityId: ENTITY_ID,
  },
  {
    customer: {
      name: "Lê Minh Cường",
      email: "cuong.le@email.com",
      phone: "+84 92 345 6789",
      location: "Đà Nẵng",
    },
    source: "walk-in" as const,
    status: "qualified" as const,
    priority: "warm" as const,
    score: 78,
    interest: {
      brands: ["Honda", "Mazda"],
      vehicleTypes: ["Sedan"],
      budget: "600M - 900M VNĐ",
      timeline: "Trong 2 tháng",
    },
    entityId: ENTITY_ID,
  },
];

// ============================================
// Customers
// ============================================

const customers = [
  {
    profile: {
      name: "Phạm Hoàng Long",
      email: "long.pham@email.com",
      phone: "+84 93 456 7890",
      location: "Hà Nội",
      dateOfBirth: "1985-03-15",
    },
    lifecycle: {
      stage: "loyal" as const,
      firstPurchaseDate: "2020-05-10",
      lastPurchaseDate: "2024-11-20",
    },
    insights: {
      lifetimeValue: 1800000000,
      totalPurchases: 2,
      averageOrderValue: 900000000,
      segment: "vip" as const,
      churnRisk: 0.1,
      satisfactionScore: 95,
      recommendedActions: [
        "Schedule service appointment for 2nd vehicle",
        "Offer VIP test drive for new models",
      ],
    },
    preferences: {
      brands: ["Toyota", "Honda"],
      communicationChannels: ["email", "phone"],
      serviceInterests: ["maintenance", "parts", "accessories"],
    },
    entityId: ENTITY_ID,
  },
  {
    profile: {
      name: "Võ Thị Mai",
      email: "mai.vo@email.com",
      phone: "+84 94 567 8901",
      location: "TP. Hồ Chí Minh",
      dateOfBirth: "1990-07-22",
    },
    lifecycle: {
      stage: "at-risk" as const,
      firstPurchaseDate: "2022-01-15",
      lastPurchaseDate: "2022-01-15",
    },
    insights: {
      lifetimeValue: 850000000,
      totalPurchases: 1,
      averageOrderValue: 850000000,
      segment: "at-risk" as const,
      churnRisk: 0.85,
      satisfactionScore: 65,
      recommendedActions: [
        "Reach out to address service concerns",
        "Offer complimentary maintenance check",
        "Survey to understand dissatisfaction",
      ],
    },
    preferences: {
      brands: ["Mazda"],
      communicationChannels: ["email"],
      serviceInterests: ["warranty", "service"],
    },
    entityId: ENTITY_ID,
  },
];

// ============================================
// Campaigns
// ============================================

const campaigns = [
  {
    name: "Khuyến mãi cuối năm 2024",
    type: "email" as const,
    status: "active" as const,
    targetSegment: "all-customers",
    budget: 50000000,
    startDate: "2024-12-01",
    endDate: "2024-12-31",
    entityId: ENTITY_ID,
  },
  {
    name: "Ra mắt mẫu xe mới 2025",
    type: "event" as const,
    status: "active" as const,
    targetSegment: "vip-customers",
    budget: 100000000,
    startDate: "2025-01-10",
    endDate: "2025-01-15",
    entityId: ENTITY_ID,
  },
];

// ============================================
// Main seeding function
// ============================================

async function seedLifecycleData() {
  try {
    console.log("Seeding leads...");
    const createdLeads = [];
    for (const lead of leads) {
      const created = await createLead(lead);
      createdLeads.push(created);
      console.log(`  ✓ Created lead: ${created.customer.name}`);
    }

    console.log("\nSeeding customers...");
    const createdCustomers = [];
    for (const customer of customers) {
      const created = await createCustomer(customer);
      createdCustomers.push(created);
      console.log(`  ✓ Created customer: ${created.profile.name}`);
    }

    console.log("\nSeeding interactions...");
    // Create sample interactions for leads
    for (const lead of createdLeads.slice(0, 2)) {
      await createInteraction({
        leadId: lead.id,
        type: "call",
        channel: "phone",
        notes: "Initial contact - discussed vehicle preferences",
        sentiment: "positive",
        entityId: ENTITY_ID,
      });
      console.log(`  ✓ Created interaction for lead: ${lead.customer.name}`);
    }

    // Create sample interactions for customers
    for (const customer of createdCustomers) {
      await createInteraction({
        customerId: customer.id,
        type: "support",
        channel: "email",
        notes: "Follow-up on recent purchase satisfaction",
        sentiment: customer.insights.churnRisk > 0.7 ? "negative" : "positive",
        entityId: ENTITY_ID,
      });
      console.log(
        `  ✓ Created interaction for customer: ${customer.profile.name}`
      );
    }

    console.log("\nSeeding purchases...");
    // Create purchases for customers
    for (const customer of createdCustomers) {
      const purchaseData = {
        customerId: customer.id,
        brand: customer.preferences.brands[0],
        vehicleModel:
          customer.preferences.brands[0] === "Toyota"
            ? "Fortuner"
            : customer.preferences.brands[0] === "Honda"
              ? "CR-V"
              : "CX-5",
        year: 2022,
        amount: customer.insights.averageOrderValue,
        paymentMethod: "finance" as const,
        salesRep: "Nguyễn Văn A",
        purchaseDate: customer.lifecycle.firstPurchaseDate,
        entityId: ENTITY_ID,
      };
      await createPurchase(purchaseData);
      console.log(
        `  ✓ Created purchase for customer: ${customer.profile.name}`
      );

      // Add second purchase for loyal customers
      if (customer.insights.totalPurchases > 1) {
        await createPurchase({
          ...purchaseData,
          vehicleModel: "Accord",
          year: 2024,
          purchaseDate: customer.lifecycle.lastPurchaseDate!,
        });
        console.log(
          `  ✓ Created 2nd purchase for customer: ${customer.profile.name}`
        );
      }
    }

    console.log("\nSeeding campaigns...");
    for (const campaign of campaigns) {
      const created = await createCampaign(campaign);
      console.log(`  ✓ Created campaign: ${created.name}`);
    }

    console.log("\nSeeding AI recommendations...");
    // Create recommendations for hot leads
    for (const lead of createdLeads.filter((l) => l.priority === "hot")) {
      await createAIRecommendation({
        targetId: lead.id,
        targetType: "lead",
        type: "next_best_action",
        title: "Schedule test drive",
        description: `Lead shows high interest in ${lead.interest.brands.join(", ")}. Recommend scheduling test drive within 48 hours.`,
        confidence: 0.88,
        priority: "high",
        entityId: ENTITY_ID,
      });
      console.log(
        `  ✓ Created recommendation for lead: ${lead.customer.name}`
      );
    }

    // Create recommendations for at-risk customers
    for (const customer of createdCustomers.filter(
      (c) => c.insights.segment === "at-risk"
    )) {
      await createAIRecommendation({
        targetId: customer.id,
        targetType: "customer",
        type: "churn_prevention",
        title: "Urgent: Retention action needed",
        description: `Customer at high churn risk (${(customer.insights.churnRisk * 100).toFixed(0)}%). Recommend immediate outreach with service incentive.`,
        confidence: 0.92,
        priority: "urgent",
        entityId: ENTITY_ID,
      });
      console.log(
        `  ✓ Created churn prevention recommendation for: ${customer.profile.name}`
      );
    }

    console.log("\n=== ✅ All lifecycle data seeded successfully ===\n");
  } catch (error) {
    console.error("\n❌ Error seeding lifecycle data:", error);
    process.exit(1);
  }
}

seedLifecycleData();
