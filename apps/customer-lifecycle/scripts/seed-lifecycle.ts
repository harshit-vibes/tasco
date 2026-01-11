/**
 * Seed script for Customer Lifecycle demo data
 *
 * Run with: bun run scripts/seed-lifecycle.ts
 */

import {
  createLead,
  createCustomer,
  createInteraction,
  createPurchase,
  createCampaign,
  createAIRecommendation,
  type CreateLeadInput,
  type CreateCustomerInput,
  type CreateInteractionInput,
  type CreatePurchaseInput,
  type CreateCampaignInput,
  type CreateAIRecommendationInput,
} from "@tasco/db";

// Vietnamese names for realistic demo
const vietnameseNames = [
  "Nguyễn Văn Minh",
  "Trần Thị Hương",
  "Lê Hoàng Nam",
  "Phạm Thị Mai",
  "Hoàng Đức Anh",
  "Vũ Thị Lan",
  "Đặng Văn Tuấn",
  "Bùi Thị Thu",
  "Ngô Minh Khoa",
  "Đỗ Thị Nga",
  "Trương Văn Hải",
  "Lý Thị Thảo",
  "Phan Đức Long",
  "Đinh Thị Hạnh",
  "Cao Văn Dũng",
  "Hồ Thị Yến",
  "Võ Minh Quân",
  "Lưu Thị Kim",
  "Mai Văn Phong",
  "Dương Thị Hoa",
  "Nguyễn Thị Linh",
  "Trần Văn Bình",
  "Lê Thị Ngọc",
  "Phạm Văn Tùng",
  "Hoàng Thị Lan Anh",
];

const locations = [
  "Quận 1, TP.HCM",
  "Quận 7, TP.HCM",
  "Quận Tân Bình, TP.HCM",
  "Quận Bình Thạnh, TP.HCM",
  "Quận 2, TP.HCM",
  "Quận Gò Vấp, TP.HCM",
  "Quận Phú Nhuận, TP.HCM",
  "Ba Đình, Hà Nội",
  "Cầu Giấy, Hà Nội",
  "Hoàn Kiếm, Hà Nội",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "Biên Hòa, Đồng Nai",
  "Vũng Tàu",
];

const carBrands = ["Toyota", "Honda", "Mazda", "Hyundai", "Kia", "Ford", "Mitsubishi", "Nissan", "Suzuki", "Vinfast"];
const vehicleTypes = ["Sedan", "SUV", "Crossover", "Hatchback", "Pickup", "MPV"];
const budgetRanges = ["500M - 800M VND", "800M - 1.2B VND", "1.2B - 1.8B VND", "1.8B - 2.5B VND", "2.5B+ VND"];
const timelines = ["Immediately", "Within 1 month", "1-3 months", "3-6 months", "6+ months"];

const vehicleModels: Record<string, string[]> = {
  Toyota: ["Camry", "Corolla Cross", "Fortuner", "Innova Cross", "Vios", "Land Cruiser Prado"],
  Honda: ["Civic", "CR-V", "HR-V", "City", "Accord"],
  Mazda: ["Mazda3", "CX-5", "CX-8", "Mazda6", "CX-30"],
  Hyundai: ["Tucson", "Santa Fe", "Accent", "Elantra", "Creta"],
  Kia: ["Seltos", "Sorento", "K3", "K5", "Carnival"],
  Ford: ["Ranger", "Everest", "Territory", "Explorer"],
  Mitsubishi: ["Xpander", "Pajero Sport", "Outlander", "Triton"],
  Nissan: ["X-Trail", "Navara", "Almera", "Kicks"],
  Suzuki: ["XL7", "Ertiga", "Swift", "Ciaz"],
  Vinfast: ["VF8", "VF9", "Lux A2.0", "Lux SA2.0", "VF e34"],
};

// Entity IDs from the existing entities table
const entityIds = [
  "entity_tasco_auto_hcm",
  "entity_tasco_auto_hanoi",
  "entity_carpla_hcm",
];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomElements<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - randomInt(0, daysAgo));
  date.setHours(randomInt(8, 18), randomInt(0, 59), 0, 0);
  return date.toISOString();
}

function generateEmail(name: string): string {
  const normalized = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/\s+/g, ".");
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "email.com"];
  return `${normalized}${randomInt(1, 99)}@${randomElement(domains)}`;
}

function generatePhone(): string {
  const prefixes = ["090", "091", "093", "094", "096", "097", "098", "032", "033", "034", "035", "036", "037", "038", "039"];
  return `${randomElement(prefixes)}${randomInt(1000000, 9999999)}`;
}

async function seedLeads(): Promise<string[]> {
  console.log("🌱 Seeding leads...");
  const leadIds: string[] = [];

  for (let i = 0; i < 25; i++) {
    const name = vietnameseNames[i];
    const brands = randomElements(carBrands, randomInt(1, 3));
    const priority = randomElement(["hot", "warm", "cold"] as const);
    const status = randomElement(["new", "contacted", "qualified", "nurturing"] as const);
    const score = priority === "hot" ? randomInt(75, 95) : priority === "warm" ? randomInt(50, 74) : randomInt(20, 49);

    const leadInput: CreateLeadInput = {
      customer: {
        name,
        email: generateEmail(name),
        phone: generatePhone(),
        location: randomElement(locations),
      },
      source: randomElement(["website", "referral", "walk-in", "event", "social"] as const),
      status,
      priority,
      score,
      interest: {
        brands,
        vehicleTypes: randomElements(vehicleTypes, randomInt(1, 2)),
        budget: randomElement(budgetRanges),
        timeline: randomElement(timelines),
      },
      entityId: randomElement(entityIds),
    };

    const lead = await createLead(leadInput);
    leadIds.push(lead.id);
    console.log(`  ✓ Created lead: ${name} (${priority})`);
  }

  return leadIds;
}

async function seedCustomers(): Promise<string[]> {
  console.log("🌱 Seeding customers...");
  const customerIds: string[] = [];

  for (let i = 0; i < 20; i++) {
    const name = vietnameseNames[i];
    const churnRisk = Math.random();
    const segment = churnRisk > 0.7 ? "at-risk" : randomElement(["vip", "regular", "new"] as const);
    const lifetimeValue = segment === "vip" ? randomInt(2000000000, 5000000000) : randomInt(500000000, 2000000000);

    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - randomInt(25, 55));

    const firstPurchase = new Date();
    firstPurchase.setMonth(firstPurchase.getMonth() - randomInt(6, 36));

    const customerInput: CreateCustomerInput = {
      profile: {
        name,
        email: generateEmail(name),
        phone: generatePhone(),
        location: randomElement(locations),
        dateOfBirth: dob.toISOString().split("T")[0],
      },
      lifecycle: {
        stage: segment === "at-risk" ? "at-risk" : segment === "vip" ? "loyal" : "active",
        firstPurchaseDate: firstPurchase.toISOString(),
      },
      insights: {
        lifetimeValue,
        totalPurchases: segment === "vip" ? randomInt(3, 8) : randomInt(1, 3),
        averageOrderValue: Math.round(lifetimeValue / (segment === "vip" ? randomInt(3, 8) : randomInt(1, 3))),
        segment,
        churnRisk: segment === "at-risk" ? randomInt(70, 95) / 100 : randomInt(5, 40) / 100,
        satisfactionScore: segment === "at-risk" ? randomInt(40, 60) : randomInt(70, 95),
      },
      preferences: {
        brands: randomElements(carBrands, randomInt(1, 3)),
        communicationChannels: randomElements(["phone", "email", "chat", "sms"], randomInt(1, 3)),
        serviceInterests: randomElements(["maintenance", "warranty", "accessories", "insurance", "financing"], randomInt(2, 4)),
      },
      entityId: randomElement(entityIds),
    };

    const customer = await createCustomer(customerInput);
    customerIds.push(customer.id);
    console.log(`  ✓ Created customer: ${name} (${segment})`);
  }

  return customerIds;
}

async function seedInteractions(leadIds: string[], customerIds: string[]): Promise<void> {
  console.log("🌱 Seeding interactions...");

  const interactionNotes = [
    "Discussed financing options and test drive scheduling",
    "Follow-up call about promotional offers",
    "Customer inquired about trade-in valuation",
    "Sent detailed quotation via email",
    "Test drive completed - very interested in the model",
    "Discussed warranty and service packages",
    "Customer comparing with competitor brands",
    "Scheduled showroom visit for next week",
    "Provided information about upcoming models",
    "Customer requested accessories catalog",
    "Resolved inquiry about delivery timeline",
    "Discussed fleet purchase options",
    "Customer interested in extended warranty",
    "Follow-up on service appointment",
    "Addressed concerns about vehicle specifications",
  ];

  // Create interactions for leads
  for (const leadId of leadIds.slice(0, 15)) {
    const numInteractions = randomInt(1, 4);
    for (let i = 0; i < numInteractions; i++) {
      const interactionInput: CreateInteractionInput = {
        leadId,
        type: randomElement(["call", "email", "meeting", "note"] as const),
        channel: randomElement(["phone", "email", "in-person", "chat"] as const),
        notes: randomElement(interactionNotes),
        sentiment: randomElement(["positive", "neutral", "negative"] as const),
        entityId: randomElement(entityIds),
      };
      await createInteraction(interactionInput);
    }
  }

  // Create interactions for customers
  for (const customerId of customerIds.slice(0, 12)) {
    const numInteractions = randomInt(2, 6);
    for (let i = 0; i < numInteractions; i++) {
      const interactionInput: CreateInteractionInput = {
        customerId,
        type: randomElement(["call", "email", "meeting", "support", "note"] as const),
        channel: randomElement(["phone", "email", "in-person", "chat"] as const),
        notes: randomElement(interactionNotes),
        sentiment: randomElement(["positive", "neutral", "negative"] as const),
        entityId: randomElement(entityIds),
      };
      await createInteraction(interactionInput);
    }
  }

  console.log("  ✓ Created interactions for leads and customers");
}

async function seedPurchases(customerIds: string[]): Promise<void> {
  console.log("🌱 Seeding purchases...");

  for (const customerId of customerIds) {
    const numPurchases = randomInt(1, 3);
    for (let i = 0; i < numPurchases; i++) {
      const brand = randomElement(carBrands);
      const model = randomElement(vehicleModels[brand] || ["Standard Model"]);
      const amount = randomInt(500000000, 3000000000);

      const purchaseDate = new Date();
      purchaseDate.setMonth(purchaseDate.getMonth() - randomInt(1, 24));

      const purchaseInput: CreatePurchaseInput = {
        customerId,
        brand,
        vehicleModel: model,
        year: randomElement([2023, 2024, 2025]),
        amount,
        paymentMethod: randomElement(["cash", "finance", "lease"] as const),
        purchaseDate: purchaseDate.toISOString(),
        entityId: randomElement(entityIds),
      };
      await createPurchase(purchaseInput);
    }
  }

  console.log("  ✓ Created purchase records");
}

async function seedCampaigns(): Promise<void> {
  console.log("🌱 Seeding campaigns...");

  const campaigns: CreateCampaignInput[] = [
    {
      name: "Tết 2025 - Rước Xế Đón Xuân",
      type: "email",
      status: "active",
      targetSegment: "all",
      budget: 500000000,
      startDate: new Date("2025-01-01").toISOString(),
      endDate: new Date("2025-02-15").toISOString(),
      entityId: entityIds[0],
    },
    {
      name: "SUV Summer Sale",
      type: "social",
      status: "active",
      targetSegment: "suv-interested",
      budget: 300000000,
      startDate: new Date("2025-01-10").toISOString(),
      endDate: new Date("2025-03-31").toISOString(),
      entityId: entityIds[0],
    },
    {
      name: "VIP Customer Appreciation",
      type: "event",
      status: "active",
      targetSegment: "vip",
      budget: 200000000,
      startDate: new Date("2025-01-15").toISOString(),
      endDate: new Date("2025-01-30").toISOString(),
      entityId: entityIds[1],
    },
    {
      name: "Electric Vehicle Launch",
      type: "email",
      status: "draft",
      targetSegment: "eco-conscious",
      budget: 400000000,
      startDate: new Date("2025-02-01").toISOString(),
      entityId: entityIds[0],
    },
    {
      name: "Trade-In Bonus Program",
      type: "sms",
      status: "active",
      targetSegment: "existing-customers",
      budget: 150000000,
      startDate: new Date("2025-01-05").toISOString(),
      endDate: new Date("2025-04-30").toISOString(),
      entityId: entityIds[2],
    },
  ];

  for (const campaign of campaigns) {
    await createCampaign(campaign);
    console.log(`  ✓ Created campaign: ${campaign.name}`);
  }
}

async function seedRecommendations(leadIds: string[], customerIds: string[]): Promise<void> {
  console.log("🌱 Seeding AI recommendations...");

  const recommendations: Partial<CreateAIRecommendationInput>[] = [
    { type: "next_best_action", title: "Schedule Test Drive", description: "High intent detected - customer viewed 3+ models. Recommend scheduling test drive within 48 hours.", priority: "high" },
    { type: "churn_prevention", title: "Retention Outreach", description: "Customer hasn't visited in 6+ months. Send personalized service reminder with loyalty discount.", priority: "urgent" },
    { type: "upsell", title: "Premium Package Offer", description: "Based on purchase history, customer likely to be interested in premium accessories package.", priority: "medium" },
    { type: "cross_sell", title: "Insurance Renewal", description: "Vehicle insurance expiring in 30 days. Offer renewal with bundle discount.", priority: "high" },
    { type: "lead_nurturing", title: "Send Financing Options", description: "Lead expressed budget concerns. Share flexible financing plans to move forward.", priority: "medium" },
    { type: "service_reminder", title: "Service Due", description: "Vehicle approaching 10,000km service milestone. Schedule maintenance appointment.", priority: "low" },
  ];

  // Add recommendations for leads
  for (let i = 0; i < 10; i++) {
    const rec = randomElement(recommendations);
    const recInput: CreateAIRecommendationInput = {
      targetId: randomElement(leadIds),
      targetType: "lead",
      type: rec.type!,
      title: rec.title!,
      description: rec.description!,
      confidence: randomInt(70, 95) / 100,
      priority: rec.priority as any,
      entityId: randomElement(entityIds),
    };
    await createAIRecommendation(recInput);
  }

  // Add recommendations for customers
  for (let i = 0; i < 10; i++) {
    const rec = randomElement(recommendations);
    const recInput: CreateAIRecommendationInput = {
      targetId: randomElement(customerIds),
      targetType: "customer",
      type: rec.type!,
      title: rec.title!,
      description: rec.description!,
      confidence: randomInt(70, 95) / 100,
      priority: rec.priority as any,
      entityId: randomElement(entityIds),
    };
    await createAIRecommendation(recInput);
  }

  console.log("  ✓ Created AI recommendations");
}

async function main() {
  console.log("\n🚀 Starting Customer Lifecycle data seeding...\n");

  try {
    const leadIds = await seedLeads();
    const customerIds = await seedCustomers();
    await seedInteractions(leadIds, customerIds);
    await seedPurchases(customerIds);
    await seedCampaigns();
    await seedRecommendations(leadIds, customerIds);

    console.log("\n✅ Data seeding completed successfully!\n");
    console.log(`   📊 Summary:`);
    console.log(`      - ${leadIds.length} leads created`);
    console.log(`      - ${customerIds.length} customers created`);
    console.log(`      - Interactions, purchases, campaigns, and recommendations seeded`);
    console.log("");
  } catch (error) {
    console.error("\n❌ Error seeding data:", error);
    process.exit(1);
  }
}

main();
