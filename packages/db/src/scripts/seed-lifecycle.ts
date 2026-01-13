/**
 * Seed DynamoDB with Customer Lifecycle demo data
 *
 * Usage:
 *   bun run db:seed-lifecycle
 *
 * This script populates the lifecycle tables with demo data for Tasco Auto
 * distributed across automotive showrooms and B2B clients.
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

// Automotive entity IDs (showrooms and B2B clients)
const SHOWROOM_ENTITIES = [
  "showroom-hanoi-1",  // Cầu Giấy
  "showroom-hanoi-2",  // Long Biên
  "showroom-hcm-1",    // Quận 7
  "showroom-hcm-2",    // Thủ Đức
  "showroom-danang",   // Hải Châu
  "carpla-hanoi",      // Carpla Hanoi
  "carpla-hcm",        // Carpla HCM
];

const B2B_ENTITIES = [
  "b2b-vinfast-fleet",
  "b2b-grab-vietnam",
  "b2b-viettel-fleet",
  "b2b-fpt-automotive",
  "b2b-masan-logistics",
];

// ============================================
// Leads (distributed across showrooms)
// ============================================

const leads = [
  // Showroom Hanoi 1 - Cầu Giấy
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
    entityId: "showroom-hanoi-1",
  },
  {
    customer: {
      name: "Hoàng Thị Lan",
      email: "lan.hoang@email.com",
      phone: "+84 90 234 5678",
      location: "Hà Nội",
    },
    source: "referral" as const,
    status: "contacted" as const,
    priority: "warm" as const,
    score: 72,
    interest: {
      brands: ["Honda"],
      vehicleTypes: ["Sedan"],
      budget: "500M - 700M VNĐ",
      timeline: "Trong 3 tháng",
    },
    entityId: "showroom-hanoi-1",
  },
  // Showroom Hanoi 2 - Long Biên
  {
    customer: {
      name: "Đặng Văn Minh",
      email: "minh.dang@email.com",
      phone: "+84 91 345 6789",
      location: "Hà Nội",
    },
    source: "walk-in" as const,
    status: "qualified" as const,
    priority: "hot" as const,
    score: 90,
    interest: {
      brands: ["Toyota"],
      vehicleTypes: ["SUV"],
      budget: "1B - 1.5B VNĐ",
      timeline: "Trong 2 tuần",
    },
    assignedTo: "Nguyễn Văn Nam",
    entityId: "showroom-hanoi-2",
  },
  // Showroom HCM 1 - Quận 7
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
    entityId: "showroom-hcm-1",
  },
  {
    customer: {
      name: "Lê Văn Hùng",
      email: "hung.le@email.com",
      phone: "+84 91 456 7890",
      location: "TP. Hồ Chí Minh",
    },
    source: "social" as const,
    status: "new" as const,
    priority: "warm" as const,
    score: 68,
    interest: {
      brands: ["Mazda", "Kia"],
      vehicleTypes: ["Sedan", "Hatchback"],
      budget: "400M - 600M VNĐ",
      timeline: "Trong 2 tháng",
    },
    entityId: "showroom-hcm-1",
  },
  // Showroom HCM 2 - Thủ Đức
  {
    customer: {
      name: "Phạm Thị Mai",
      email: "mai.pham@email.com",
      phone: "+84 92 567 8901",
      location: "TP. Hồ Chí Minh",
    },
    source: "event" as const,
    status: "nurturing" as const,
    priority: "cold" as const,
    score: 45,
    interest: {
      brands: ["Hyundai"],
      vehicleTypes: ["SUV"],
      budget: "700M - 900M VNĐ",
      timeline: "Trong 6 tháng",
    },
    entityId: "showroom-hcm-2",
  },
  // Showroom Da Nang - Hải Châu
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
    entityId: "showroom-danang",
  },
  {
    customer: {
      name: "Ngô Văn Thành",
      email: "thanh.ngo@email.com",
      phone: "+84 92 678 9012",
      location: "Đà Nẵng",
    },
    source: "website" as const,
    status: "new" as const,
    priority: "hot" as const,
    score: 82,
    interest: {
      brands: ["Toyota", "Ford"],
      vehicleTypes: ["Pickup"],
      budget: "800M - 1B VNĐ",
      timeline: "Trong 1 tháng",
    },
    entityId: "showroom-danang",
  },
  // Carpla Hanoi (used cars)
  {
    customer: {
      name: "Vũ Đình Tâm",
      email: "tam.vu@email.com",
      phone: "+84 93 789 0123",
      location: "Hà Nội",
    },
    source: "website" as const,
    status: "contacted" as const,
    priority: "warm" as const,
    score: 70,
    interest: {
      brands: ["Toyota", "Honda"],
      vehicleTypes: ["Sedan", "SUV"],
      budget: "400M - 600M VNĐ",
      timeline: "Trong 1 tháng",
    },
    entityId: "carpla-hanoi",
  },
  // Carpla HCM (used cars)
  {
    customer: {
      name: "Trương Thị Hoa",
      email: "hoa.truong@email.com",
      phone: "+84 93 890 1234",
      location: "TP. Hồ Chí Minh",
    },
    source: "referral" as const,
    status: "qualified" as const,
    priority: "hot" as const,
    score: 88,
    interest: {
      brands: ["Mazda"],
      vehicleTypes: ["SUV"],
      budget: "500M - 700M VNĐ",
      timeline: "Trong 2 tuần",
    },
    entityId: "carpla-hcm",
  },
  // B2B Lead - Grab
  {
    customer: {
      name: "Trần Minh Đức (Grab Fleet)",
      email: "duc.tran@grab.com",
      phone: "+84 94 901 2345",
      location: "TP. Hồ Chí Minh",
    },
    source: "referral" as const,
    status: "qualified" as const,
    priority: "hot" as const,
    score: 95,
    interest: {
      brands: ["Toyota", "Hyundai"],
      vehicleTypes: ["Sedan"],
      budget: "Fleet 50 xe",
      timeline: "Q1 2025",
    },
    assignedTo: "B2B Team Lead",
    entityId: "b2b-grab-vietnam",
  },
  // B2B Lead - Viettel
  {
    customer: {
      name: "Nguyễn Hữu Long (Viettel)",
      email: "long.nguyen@viettel.com.vn",
      phone: "+84 94 012 3456",
      location: "Hà Nội",
    },
    source: "event" as const,
    status: "contacted" as const,
    priority: "warm" as const,
    score: 75,
    interest: {
      brands: ["Ford", "Toyota"],
      vehicleTypes: ["Pickup", "Van"],
      budget: "Fleet 30 xe",
      timeline: "Q2 2025",
    },
    entityId: "b2b-viettel-fleet",
  },
];

// ============================================
// Customers (distributed across entities)
// ============================================

const customers = [
  // Showroom Hanoi 1
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
    entityId: "showroom-hanoi-1",
  },
  {
    profile: {
      name: "Trần Văn Đức",
      email: "duc.tran@email.com",
      phone: "+84 93 567 8901",
      location: "Hà Nội",
      dateOfBirth: "1978-09-22",
    },
    lifecycle: {
      stage: "active" as const,
      firstPurchaseDate: "2023-08-15",
    },
    insights: {
      lifetimeValue: 950000000,
      totalPurchases: 1,
      averageOrderValue: 950000000,
      segment: "regular" as const,
      churnRisk: 0.25,
      satisfactionScore: 82,
    },
    preferences: {
      brands: ["Honda"],
      communicationChannels: ["phone"],
      serviceInterests: ["maintenance"],
    },
    entityId: "showroom-hanoi-1",
  },
  // Showroom HCM 1
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
    entityId: "showroom-hcm-1",
  },
  {
    profile: {
      name: "Lê Thanh Tùng",
      email: "tung.le@email.com",
      phone: "+84 94 678 9012",
      location: "TP. Hồ Chí Minh",
      dateOfBirth: "1988-11-05",
    },
    lifecycle: {
      stage: "active" as const,
      firstPurchaseDate: "2024-06-20",
    },
    insights: {
      lifetimeValue: 720000000,
      totalPurchases: 1,
      averageOrderValue: 720000000,
      segment: "new" as const,
      churnRisk: 0.15,
      satisfactionScore: 90,
    },
    preferences: {
      brands: ["Ford"],
      communicationChannels: ["email", "chat"],
      serviceInterests: ["accessories", "maintenance"],
    },
    entityId: "showroom-hcm-1",
  },
  // Showroom Da Nang
  {
    profile: {
      name: "Nguyễn Thị Hương",
      email: "huong.nguyen@email.com",
      phone: "+84 95 789 0123",
      location: "Đà Nẵng",
      dateOfBirth: "1992-04-18",
    },
    lifecycle: {
      stage: "active" as const,
      firstPurchaseDate: "2024-03-10",
    },
    insights: {
      lifetimeValue: 680000000,
      totalPurchases: 1,
      averageOrderValue: 680000000,
      segment: "regular" as const,
      churnRisk: 0.2,
      satisfactionScore: 85,
    },
    preferences: {
      brands: ["Honda"],
      communicationChannels: ["phone", "chat"],
      serviceInterests: ["maintenance"],
    },
    entityId: "showroom-danang",
  },
  // Carpla HCM (used car customer)
  {
    profile: {
      name: "Đỗ Văn Khánh",
      email: "khanh.do@email.com",
      phone: "+84 95 890 1234",
      location: "TP. Hồ Chí Minh",
      dateOfBirth: "1995-12-30",
    },
    lifecycle: {
      stage: "active" as const,
      firstPurchaseDate: "2024-09-05",
    },
    insights: {
      lifetimeValue: 420000000,
      totalPurchases: 1,
      averageOrderValue: 420000000,
      segment: "new" as const,
      churnRisk: 0.3,
      satisfactionScore: 78,
    },
    preferences: {
      brands: ["Toyota"],
      communicationChannels: ["chat"],
      serviceInterests: ["warranty", "inspection"],
    },
    entityId: "carpla-hcm",
  },
  // B2B Customer - FPT
  {
    profile: {
      name: "FPT Automotive Division",
      email: "fleet@fpt.com.vn",
      phone: "+84 96 123 4567",
      location: "Hà Nội",
      dateOfBirth: "2000-01-01", // Company founding
    },
    lifecycle: {
      stage: "loyal" as const,
      firstPurchaseDate: "2021-03-15",
      lastPurchaseDate: "2024-10-20",
    },
    insights: {
      lifetimeValue: 8500000000,
      totalPurchases: 25,
      averageOrderValue: 340000000,
      segment: "vip" as const,
      churnRisk: 0.05,
      satisfactionScore: 92,
      recommendedActions: [
        "Propose 2025 fleet renewal program",
        "Discuss EV transition options",
      ],
    },
    preferences: {
      brands: ["Toyota", "Honda", "VinFast"],
      communicationChannels: ["email"],
      serviceInterests: ["fleet-management", "maintenance-contract"],
    },
    entityId: "b2b-fpt-automotive",
  },
  // B2B Customer - Masan
  {
    profile: {
      name: "Masan Logistics Fleet",
      email: "fleet@masan.com.vn",
      phone: "+84 96 234 5678",
      location: "TP. Hồ Chí Minh",
      dateOfBirth: "2000-01-01",
    },
    lifecycle: {
      stage: "at-risk" as const,
      firstPurchaseDate: "2022-06-10",
      lastPurchaseDate: "2023-02-15",
    },
    insights: {
      lifetimeValue: 4200000000,
      totalPurchases: 15,
      averageOrderValue: 280000000,
      segment: "at-risk" as const,
      churnRisk: 0.65,
      satisfactionScore: 70,
      recommendedActions: [
        "Schedule meeting to discuss service issues",
        "Offer competitive renewal package",
      ],
    },
    preferences: {
      brands: ["Ford", "Isuzu"],
      communicationChannels: ["email", "phone"],
      serviceInterests: ["fleet-management", "parts"],
    },
    entityId: "b2b-masan-logistics",
  },
];

// ============================================
// Campaigns (distributed across entities)
// ============================================

const campaigns = [
  // Showroom campaigns
  {
    name: "Khuyến mãi cuối năm 2024 - Hanoi",
    type: "email" as const,
    status: "active" as const,
    targetSegment: "all-customers",
    budget: 30000000,
    startDate: "2024-12-01",
    endDate: "2024-12-31",
    entityId: "showroom-hanoi-1",
  },
  {
    name: "Khuyến mãi cuối năm 2024 - HCM",
    type: "email" as const,
    status: "active" as const,
    targetSegment: "all-customers",
    budget: 35000000,
    startDate: "2024-12-01",
    endDate: "2024-12-31",
    entityId: "showroom-hcm-1",
  },
  {
    name: "Ra mắt mẫu xe mới 2025 - VIP Event",
    type: "event" as const,
    status: "active" as const,
    targetSegment: "vip-customers",
    budget: 80000000,
    startDate: "2025-01-10",
    endDate: "2025-01-15",
    entityId: "showroom-hanoi-1",
  },
  {
    name: "Chương trình lái thử SUV",
    type: "event" as const,
    status: "active" as const,
    targetSegment: "hot-leads",
    budget: 25000000,
    startDate: "2024-12-15",
    endDate: "2024-12-22",
    entityId: "showroom-hcm-2",
  },
  // Carpla campaigns
  {
    name: "Xe cũ chính hãng - Giảm 10%",
    type: "social" as const,
    status: "active" as const,
    targetSegment: "all",
    budget: 15000000,
    startDate: "2024-12-01",
    endDate: "2025-01-31",
    entityId: "carpla-hanoi",
  },
  {
    name: "Carpla HCM - Ưu đãi Tết",
    type: "sms" as const,
    status: "draft" as const,
    targetSegment: "all-customers",
    budget: 10000000,
    startDate: "2025-01-15",
    endDate: "2025-02-10",
    entityId: "carpla-hcm",
  },
  // B2B campaigns
  {
    name: "B2B Fleet Renewal Program 2025",
    type: "direct-mail" as const,
    status: "active" as const,
    targetSegment: "b2b-fleet",
    budget: 50000000,
    startDate: "2024-11-01",
    endDate: "2025-03-31",
    entityId: "b2b-fpt-automotive",
  },
  {
    name: "Grab Driver Partner Program",
    type: "email" as const,
    status: "completed" as const,
    targetSegment: "grab-drivers",
    budget: 40000000,
    startDate: "2024-06-01",
    endDate: "2024-09-30",
    entityId: "b2b-grab-vietnam",
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
      console.log(`  ✓ Created lead: ${created.customer.name} (${created.entityId})`);
    }

    console.log("\nSeeding customers...");
    const createdCustomers = [];
    for (const customer of customers) {
      const created = await createCustomer(customer);
      createdCustomers.push(created);
      console.log(`  ✓ Created customer: ${created.profile.name} (${created.entityId})`);
    }

    console.log("\nSeeding interactions...");
    // Create sample interactions for leads
    for (const lead of createdLeads.slice(0, 5)) {
      await createInteraction({
        leadId: lead.id,
        type: "call",
        channel: "phone",
        notes: "Initial contact - discussed vehicle preferences",
        sentiment: "positive",
        entityId: lead.entityId,
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
        entityId: customer.entityId,
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
              : customer.preferences.brands[0] === "Ford"
                ? "Ranger"
                : "CX-5",
        year: 2023,
        amount: customer.insights.averageOrderValue,
        paymentMethod: "finance" as const,
        salesRep: "Sales Team",
        purchaseDate: customer.lifecycle.firstPurchaseDate,
        entityId: customer.entityId,
      };
      await createPurchase(purchaseData);
      console.log(
        `  ✓ Created purchase for customer: ${customer.profile.name}`
      );

      // Add second purchase for loyal customers
      if (customer.insights.totalPurchases > 1 && customer.lifecycle.lastPurchaseDate) {
        await createPurchase({
          ...purchaseData,
          vehicleModel: "Accord",
          year: 2024,
          purchaseDate: customer.lifecycle.lastPurchaseDate,
        });
        console.log(
          `  ✓ Created 2nd purchase for customer: ${customer.profile.name}`
        );
      }
    }

    console.log("\nSeeding campaigns...");
    for (const campaign of campaigns) {
      const created = await createCampaign(campaign);
      console.log(`  ✓ Created campaign: ${created.name} (${created.entityId})`);
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
        entityId: lead.entityId,
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
        entityId: customer.entityId,
      });
      console.log(
        `  ✓ Created churn prevention recommendation for: ${customer.profile.name}`
      );
    }

    console.log("\n=== ✅ All lifecycle data seeded successfully ===\n");
    console.log("Summary:");
    console.log(`  - Leads: ${createdLeads.length}`);
    console.log(`  - Customers: ${createdCustomers.length}`);
    console.log(`  - Campaigns: ${campaigns.length}`);
    console.log("");
  } catch (error) {
    console.error("\n❌ Error seeding lifecycle data:", error);
    process.exit(1);
  }
}

seedLifecycleData();
