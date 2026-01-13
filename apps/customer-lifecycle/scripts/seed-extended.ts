/**
 * Extended seed script for Customer Lifecycle app
 * Creates 20 leads, 15 customers, interactions, purchases, campaigns, and recommendations
 *
 * Run: bun run scripts/seed-extended.ts
 */

import {
  createLead,
  createCustomer,
  createInteraction,
  createPurchase,
  createCampaign,
  createAIRecommendation,
} from "@tasco/db";

console.log("\n=== Seeding Extended Customer Lifecycle Data ===\n");

const ENTITY_ID = "tasco-auto";

// Vietnamese names for realistic data
const firstNames = [
  "An", "Bình", "Cường", "Dũng", "Em", "Giang", "Hải", "Hùng", "Khoa", "Linh",
  "Minh", "Nam", "Phong", "Quang", "Sơn", "Thảo", "Tùng", "Uyên", "Vân", "Xuân",
  "Yến", "Tuấn", "Hương", "Lan", "Mai", "Nhung", "Oanh", "Phúc", "Quyên", "Trang"
];
const lastNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ"];
const locations = ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Biên Hòa", "Nha Trang", "Huế", "Vinh", "Quy Nhơn"];
const brands = ["Toyota", "Honda", "Ford", "Mazda", "Hyundai", "Kia", "VinFast", "Mitsubishi", "Nissan", "Suzuki"];
const vehicleTypes = ["SUV", "Sedan", "Pickup", "Hatchback", "Crossover", "MPV"];
const sources = ["website", "referral", "walk-in", "social", "advertisement", "event"] as const;
const statuses = ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"] as const;
const priorities = ["hot", "warm", "cold"] as const;
const stages = ["new", "active", "loyal", "at-risk", "churned"] as const;
const segments = ["vip", "regular", "at-risk", "new"] as const;

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhone(): string {
  return `+84 ${randomBetween(90, 99)} ${randomBetween(100, 999)} ${randomBetween(1000, 9999)}`;
}

function generateEmail(firstName: string, lastName: string): string {
  const domain = randomFrom(["gmail.com", "email.com", "yahoo.com", "outlook.com"]);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
}

function generateDate(yearsAgo: number, monthsVariance: number = 6): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - yearsAgo);
  date.setMonth(date.getMonth() + randomBetween(-monthsVariance, monthsVariance));
  date.setDate(randomBetween(1, 28));
  return date.toISOString().split("T")[0];
}

// ============================================
// Generate Leads
// ============================================

const leadsData = [];
for (let i = 0; i < 20; i++) {
  const firstName = randomFrom(firstNames);
  const lastName = randomFrom(lastNames);
  const priority = randomFrom(priorities);
  const status = randomFrom(statuses);

  leadsData.push({
    customer: {
      name: `${lastName} ${firstName}`,
      email: generateEmail(firstName, lastName),
      phone: generatePhone(),
      location: randomFrom(locations),
    },
    source: randomFrom(sources),
    status,
    priority,
    score: priority === "hot" ? randomBetween(80, 98) : priority === "warm" ? randomBetween(50, 79) : randomBetween(20, 49),
    interest: {
      brands: [randomFrom(brands), randomFrom(brands)].filter((v, i, a) => a.indexOf(v) === i),
      vehicleTypes: [randomFrom(vehicleTypes), randomFrom(vehicleTypes)].filter((v, i, a) => a.indexOf(v) === i),
      budget: `${randomBetween(5, 15) * 100}M - ${randomBetween(8, 20) * 100}M VNĐ`,
      timeline: randomFrom(["Trong 1 tuần", "Trong 2 tuần", "Trong 1 tháng", "Trong 3 tháng", "Chưa xác định"]),
    },
    assignedTo: status !== "new" ? `${randomFrom(lastNames)} ${randomFrom(firstNames)}` : undefined,
    entityId: ENTITY_ID,
  });
}

// ============================================
// Generate Customers
// ============================================

const customersData = [];
for (let i = 0; i < 15; i++) {
  const firstName = randomFrom(firstNames);
  const lastName = randomFrom(lastNames);
  const segment = randomFrom(segments);
  const stage = segment === "vip" ? "loyal" : segment === "at-risk" ? "at-risk" : randomFrom(stages);
  const totalPurchases = segment === "vip" ? randomBetween(2, 5) : randomBetween(1, 2);
  const avgOrder = randomBetween(5, 18) * 100000000;

  customersData.push({
    profile: {
      name: `${lastName} ${firstName}`,
      email: generateEmail(firstName, lastName),
      phone: generatePhone(),
      location: randomFrom(locations),
      dateOfBirth: generateDate(randomBetween(25, 55), 0),
    },
    lifecycle: {
      stage: stage as any,
      firstPurchaseDate: generateDate(randomBetween(1, 5)),
      lastPurchaseDate: segment === "at-risk" ? generateDate(2) : generateDate(0, 6),
    },
    insights: {
      lifetimeValue: avgOrder * totalPurchases,
      totalPurchases,
      averageOrderValue: avgOrder,
      segment: segment as any,
      churnRisk: segment === "at-risk" ? randomBetween(70, 95) / 100 : segment === "vip" ? randomBetween(5, 20) / 100 : randomBetween(20, 50) / 100,
      satisfactionScore: segment === "at-risk" ? randomBetween(40, 65) : segment === "vip" ? randomBetween(85, 98) : randomBetween(65, 85),
      recommendedActions: segment === "at-risk"
        ? ["Urgent retention outreach", "Offer service discount", "Schedule customer care call"]
        : segment === "vip"
          ? ["VIP exclusive preview", "Loyalty reward offer", "Premium service package"]
          : ["Regular follow-up", "Newsletter subscription", "Service reminder"],
    },
    preferences: {
      brands: [randomFrom(brands), randomFrom(brands)].filter((v, i, a) => a.indexOf(v) === i),
      communicationChannels: [randomFrom(["email", "phone", "chat", "in-person"]), "email"],
      serviceInterests: [randomFrom(["maintenance", "parts", "accessories", "warranty", "insurance"])],
    },
    entityId: ENTITY_ID,
  });
}

// ============================================
// Generate Campaigns
// ============================================

const campaignsData = [
  { name: "Tết 2025 - Ưu đãi đặc biệt", type: "email" as const, status: "active" as const, targetSegment: "all-customers", budget: 100000000 },
  { name: "Flash Sale cuối tuần", type: "sms" as const, status: "active" as const, targetSegment: "hot-leads", budget: 30000000 },
  { name: "VIP Exclusive - Test Drive", type: "event" as const, status: "active" as const, targetSegment: "vip-customers", budget: 150000000 },
  { name: "Chương trình giới thiệu bạn bè", type: "referral" as const, status: "active" as const, targetSegment: "loyal-customers", budget: 80000000 },
  { name: "Bảo dưỡng định kỳ Q1", type: "email" as const, status: "scheduled" as const, targetSegment: "service-due", budget: 40000000 },
  { name: "Ra mắt xe mới 2025", type: "event" as const, status: "scheduled" as const, targetSegment: "high-value-leads", budget: 200000000 },
  { name: "Khách hàng cũ quay lại", type: "email" as const, status: "active" as const, targetSegment: "at-risk", budget: 60000000 },
  { name: "Trade-in Program", type: "advertisement" as const, status: "active" as const, targetSegment: "existing-owners", budget: 120000000 },
];

// ============================================
// Main seeding function
// ============================================

async function seedExtendedData() {
  try {
    console.log("Creating leads...");
    const createdLeads = [];
    for (const lead of leadsData) {
      const created = await createLead(lead);
      createdLeads.push(created);
      console.log(`  ✓ Lead: ${created.customer.name} (${created.priority}, ${created.status})`);
    }

    console.log("\nCreating customers...");
    const createdCustomers = [];
    for (const customer of customersData) {
      const created = await createCustomer(customer);
      createdCustomers.push(created);
      console.log(`  ✓ Customer: ${created.profile.name} (${created.insights.segment})`);
    }

    console.log("\nCreating interactions...");
    // Lead interactions
    for (const lead of createdLeads) {
      const numInteractions = lead.status === "new" ? 0 : randomBetween(1, 4);
      for (let i = 0; i < numInteractions; i++) {
        await createInteraction({
          leadId: lead.id,
          type: randomFrom(["call", "email", "meeting", "message"]) as any,
          channel: randomFrom(["phone", "email", "in-person", "chat"]) as any,
          notes: randomFrom([
            "Initial contact - discussed requirements",
            "Follow-up call - customer interested",
            "Sent quotation and financing options",
            "Test drive scheduled",
            "Price negotiation discussion",
            "Customer requested more info",
            "Shared brochure and specs",
            "Discussed trade-in options",
          ]),
          sentiment: randomFrom(["positive", "neutral", "positive", "positive"]) as any,
          entityId: ENTITY_ID,
        });
      }
      if (numInteractions > 0) console.log(`  ✓ ${numInteractions} interactions for lead: ${lead.customer.name}`);
    }

    // Customer interactions
    for (const customer of createdCustomers) {
      const numInteractions = randomBetween(2, 6);
      for (let i = 0; i < numInteractions; i++) {
        await createInteraction({
          customerId: customer.id,
          type: randomFrom(["support", "inquiry", "follow-up", "purchase", "service"]) as any,
          channel: randomFrom(["phone", "email", "in-person", "chat"]) as any,
          notes: randomFrom([
            "Satisfied with recent purchase",
            "Service appointment completed",
            "Inquired about accessories",
            "Warranty question resolved",
            "Feedback collection call",
            "Anniversary appreciation call",
            "Service reminder sent",
            "Cross-sell discussion - insurance",
          ]),
          sentiment: customer.insights.segment === "at-risk"
            ? randomFrom(["negative", "neutral"]) as any
            : randomFrom(["positive", "positive", "neutral"]) as any,
          entityId: ENTITY_ID,
        });
      }
      console.log(`  ✓ ${numInteractions} interactions for customer: ${customer.profile.name}`);
    }

    console.log("\nCreating purchases...");
    for (const customer of createdCustomers) {
      const numPurchases = customer.insights.totalPurchases;
      for (let i = 0; i < numPurchases; i++) {
        const brand = customer.preferences.brands[i % customer.preferences.brands.length];
        const models: Record<string, string[]> = {
          "Toyota": ["Fortuner", "Corolla Cross", "Camry", "Vios", "Land Cruiser"],
          "Honda": ["CR-V", "City", "Civic", "HR-V", "Accord"],
          "Ford": ["Ranger", "Everest", "Territory", "Explorer"],
          "Mazda": ["CX-5", "CX-8", "Mazda3", "Mazda6", "BT-50"],
          "Hyundai": ["Santa Fe", "Tucson", "Accent", "Elantra", "Creta"],
          "Kia": ["Seltos", "Sportage", "Sorento", "Carnival", "K5"],
          "VinFast": ["VF8", "VF9", "VFe34", "Lux A2.0", "Lux SA2.0"],
          "Mitsubishi": ["Xpander", "Outlander", "Pajero Sport", "Triton"],
          "Nissan": ["X-Trail", "Navara", "Almera", "Kicks"],
          "Suzuki": ["XL7", "Ertiga", "Swift", "Ciaz"],
        };

        await createPurchase({
          customerId: customer.id,
          brand,
          vehicleModel: randomFrom(models[brand] || ["Unknown Model"]),
          year: randomBetween(2022, 2025),
          amount: customer.insights.averageOrderValue,
          paymentMethod: randomFrom(["finance", "cash", "lease"]) as any,
          salesRep: `${randomFrom(lastNames)} ${randomFrom(firstNames)}`,
          purchaseDate: i === 0 ? customer.lifecycle.firstPurchaseDate : customer.lifecycle.lastPurchaseDate!,
          entityId: ENTITY_ID,
        });
      }
      console.log(`  ✓ ${numPurchases} purchase(s) for: ${customer.profile.name}`);
    }

    console.log("\nCreating campaigns...");
    for (const campaign of campaignsData) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + randomBetween(-30, 30));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + randomBetween(7, 60));

      const created = await createCampaign({
        ...campaign,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        metrics: {
          sent: randomBetween(500, 5000),
          delivered: randomBetween(400, 4500),
          opened: randomBetween(100, 2000),
          clicked: randomBetween(50, 500),
          converted: randomBetween(5, 50),
        },
        entityId: ENTITY_ID,
      });
      console.log(`  ✓ Campaign: ${created.name}`);
    }

    console.log("\nCreating AI recommendations...");
    // Hot lead recommendations
    for (const lead of createdLeads.filter(l => l.priority === "hot")) {
      await createAIRecommendation({
        targetId: lead.id,
        targetType: "lead",
        type: "next_best_action",
        title: "Schedule immediate test drive",
        description: `High-intent lead interested in ${lead.interest.brands.join(" & ")}. Timeline: ${lead.interest.timeline}. Act within 24 hours for best conversion.`,
        confidence: randomBetween(85, 98) / 100,
        priority: "high",
        entityId: ENTITY_ID,
      });
    }

    // At-risk customer recommendations
    for (const customer of createdCustomers.filter(c => c.insights.segment === "at-risk")) {
      await createAIRecommendation({
        targetId: customer.id,
        targetType: "customer",
        type: "churn_prevention",
        title: "Urgent: Retention action required",
        description: `Customer showing ${(customer.insights.churnRisk * 100).toFixed(0)}% churn probability. Satisfaction score: ${customer.insights.satisfactionScore}%. Recommend personalized outreach with service incentive.`,
        confidence: randomBetween(88, 96) / 100,
        priority: "urgent",
        entityId: ENTITY_ID,
      });
    }

    // VIP customer recommendations
    for (const customer of createdCustomers.filter(c => c.insights.segment === "vip")) {
      await createAIRecommendation({
        targetId: customer.id,
        targetType: "customer",
        type: "upsell",
        title: "VIP upgrade opportunity",
        description: `High-value customer with ${customer.insights.totalPurchases} purchases. LTV: ${(customer.insights.lifetimeValue / 1000000000).toFixed(1)}B VNĐ. Recommend exclusive preview of 2025 models.`,
        confidence: randomBetween(75, 90) / 100,
        priority: "medium",
        entityId: ENTITY_ID,
      });
    }

    console.log("\n=== ✅ Extended data seeded successfully! ===");
    console.log(`\nSummary:`);
    console.log(`  - ${createdLeads.length} leads created`);
    console.log(`  - ${createdCustomers.length} customers created`);
    console.log(`  - ${campaignsData.length} campaigns created`);
    console.log(`  - Multiple interactions, purchases, and AI recommendations`);
    console.log("\n");
  } catch (error) {
    console.error("\n❌ Error seeding data:", error);
    process.exit(1);
  }
}

seedExtendedData();
