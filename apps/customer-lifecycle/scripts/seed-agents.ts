#!/usr/bin/env bun
/**
 * Seed Agents with Suggestions for Customer Lifecycle App
 *
 * Creates agent records with "try asking" suggestions in DynamoDB
 *
 * Run: bun run scripts/seed-agents.ts
 */

import { createAgent, getAgentsByApp, type CreateAgentInput } from "@tasco/db";

const APP_ID = "customer-lifecycle";

// Agent definitions with suggestions
const AGENTS: CreateAgentInput[] = [
  {
    appId: APP_ID,
    agentKey: "assistant",
    lyzrAgentId: process.env.NEXT_PUBLIC_LYZR_AGENT_ID || "",
    name: "General Assistant",
    shortName: "Assistant",
    description: "Your general-purpose AI assistant for customer lifecycle management",
    icon: "Sparkles",
    colorClass: "text-violet-600",
    bgClass: "bg-violet-100",
    isDefault: true,
    isEnabled: true,
    order: 0,
    suggestions: [
      {
        id: "assist-1",
        query: "Give me an overview of our business performance",
        icon: "TrendingUp",
        category: "Analytics",
      },
      {
        id: "assist-2",
        query: "What's our conversion rate this quarter?",
        icon: "TrendingUp",
        category: "Analytics",
      },
      {
        id: "assist-3",
        query: "Summarize today's key metrics",
        icon: "BarChart3",
        category: "Dashboard",
      },
    ],
  },
  {
    appId: APP_ID,
    agentKey: "lead-expert",
    lyzrAgentId: process.env.NEXT_PUBLIC_LYZR_LEAD_EXPERT_ID || "",
    name: "Lead Expert",
    shortName: "Leads",
    description: "Specialist in lead scoring, qualification, and sales pipeline",
    icon: "Target",
    colorClass: "text-amber-600",
    bgClass: "bg-amber-100",
    kbId: process.env.LYZR_LEAD_KB_ID,
    isDefault: false,
    isEnabled: true,
    order: 1,
    suggestions: [
      {
        id: "lead-1",
        query: "List hot leads waiting for follow-up",
        icon: "Target",
        category: "Sales",
      },
      {
        id: "lead-2",
        query: "Which leads should I prioritize today?",
        icon: "AlertTriangle",
        category: "Priority",
      },
      {
        id: "lead-3",
        query: "Find leads interested in SUVs",
        icon: "Users",
        category: "Leads",
      },
      {
        id: "lead-4",
        query: "Show me leads by source breakdown",
        icon: "PieChart",
        category: "Analytics",
      },
      {
        id: "lead-5",
        query: "What's our lead conversion rate?",
        icon: "TrendingUp",
        category: "Metrics",
      },
    ],
  },
  {
    appId: APP_ID,
    agentKey: "customer-expert",
    lyzrAgentId: process.env.NEXT_PUBLIC_LYZR_CUSTOMER_EXPERT_ID || "",
    name: "Customer Expert",
    shortName: "Customers",
    description: "Expert in customer retention, lifetime value, and satisfaction",
    icon: "Users",
    colorClass: "text-emerald-600",
    bgClass: "bg-emerald-100",
    kbId: process.env.LYZR_CUSTOMER_KB_ID,
    isDefault: false,
    isEnabled: true,
    order: 2,
    suggestions: [
      {
        id: "cust-1",
        query: "Show me customers due for service this month",
        icon: "Calendar",
        category: "Service",
      },
      {
        id: "cust-2",
        query: "Which customers are at risk of churn?",
        icon: "AlertTriangle",
        category: "Retention",
      },
      {
        id: "cust-3",
        query: "Show VIP customers with recent purchases",
        icon: "User",
        category: "Customers",
      },
      {
        id: "cust-4",
        query: "List customers with highest lifetime value",
        icon: "DollarSign",
        category: "Value",
      },
      {
        id: "cust-5",
        query: "Who are our most satisfied customers?",
        icon: "Star",
        category: "Satisfaction",
      },
    ],
  },
  {
    appId: APP_ID,
    agentKey: "inventory-expert",
    lyzrAgentId: process.env.NEXT_PUBLIC_LYZR_INVENTORY_EXPERT_ID || "",
    name: "Inventory Expert",
    shortName: "Inventory",
    description: "Specialist in vehicle inventory, import orders, and stock management",
    icon: "Car",
    colorClass: "text-blue-600",
    bgClass: "bg-blue-100",
    kbId: process.env.LYZR_INVENTORY_KB_ID,
    isDefault: false,
    isEnabled: true,
    order: 3,
    suggestions: [
      {
        id: "inv-1",
        query: "What vehicles are aging in stock?",
        icon: "Clock",
        category: "Aging",
      },
      {
        id: "inv-2",
        query: "Show available vehicles at showrooms",
        icon: "Car",
        category: "Inventory",
      },
      {
        id: "inv-3",
        query: "List pending import orders",
        icon: "Package",
        category: "Orders",
      },
      {
        id: "inv-4",
        query: "Which vehicles are reserved but not sold?",
        icon: "Lock",
        category: "Reserved",
      },
      {
        id: "inv-5",
        query: "Show inventory by brand breakdown",
        icon: "PieChart",
        category: "Analytics",
      },
    ],
  },
  {
    appId: APP_ID,
    agentKey: "campaign-expert",
    lyzrAgentId: process.env.NEXT_PUBLIC_LYZR_CAMPAIGN_EXPERT_ID || "",
    name: "Campaign Expert",
    shortName: "Campaigns",
    description: "Expert in marketing campaigns, ROI analysis, and audience targeting",
    icon: "Megaphone",
    colorClass: "text-pink-600",
    bgClass: "bg-pink-100",
    kbId: process.env.LYZR_CAMPAIGN_KB_ID,
    isDefault: false,
    isEnabled: true,
    order: 4,
    suggestions: [
      {
        id: "camp-1",
        query: "Which campaigns have highest ROI?",
        icon: "TrendingUp",
        category: "Performance",
      },
      {
        id: "camp-2",
        query: "Show active marketing campaigns",
        icon: "Megaphone",
        category: "Campaigns",
      },
      {
        id: "camp-3",
        query: "What's our email open rate this month?",
        icon: "Mail",
        category: "Metrics",
      },
      {
        id: "camp-4",
        query: "Which segments respond best to promotions?",
        icon: "Users",
        category: "Targeting",
      },
      {
        id: "camp-5",
        query: "Compare campaign performance by type",
        icon: "BarChart3",
        category: "Analytics",
      },
    ],
  },
];

async function main() {
  console.log("\n🤖 SEEDING AGENTS FOR CUSTOMER LIFECYCLE APP\n");
  console.log("=".repeat(60));

  // Check existing agents
  const existingAgents = await getAgentsByApp(APP_ID);
  console.log(`\n📋 Found ${existingAgents.length} existing agents\n`);

  if (existingAgents.length > 0) {
    console.log("Existing agents:");
    existingAgents.forEach((a) => console.log(`   - ${a.agentKey}: ${a.name}`));
    console.log("\n⚠️  Skipping seed - agents already exist");
    console.log("   To re-seed, delete existing agents first\n");
    return;
  }

  // Validate environment variables
  const missingEnvVars: string[] = [];
  if (!process.env.NEXT_PUBLIC_LYZR_AGENT_ID) missingEnvVars.push("NEXT_PUBLIC_LYZR_AGENT_ID");
  if (!process.env.NEXT_PUBLIC_LYZR_LEAD_EXPERT_ID) missingEnvVars.push("NEXT_PUBLIC_LYZR_LEAD_EXPERT_ID");
  if (!process.env.NEXT_PUBLIC_LYZR_CUSTOMER_EXPERT_ID) missingEnvVars.push("NEXT_PUBLIC_LYZR_CUSTOMER_EXPERT_ID");
  if (!process.env.NEXT_PUBLIC_LYZR_INVENTORY_EXPERT_ID) missingEnvVars.push("NEXT_PUBLIC_LYZR_INVENTORY_EXPERT_ID");
  if (!process.env.NEXT_PUBLIC_LYZR_CAMPAIGN_EXPERT_ID) missingEnvVars.push("NEXT_PUBLIC_LYZR_CAMPAIGN_EXPERT_ID");

  if (missingEnvVars.length > 0) {
    console.error("❌ Missing environment variables:");
    missingEnvVars.forEach((v) => console.error(`   - ${v}`));
    process.exit(1);
  }

  // Create agents
  console.log("Creating agents...\n");

  let created = 0;
  let failed = 0;

  for (const agentInput of AGENTS) {
    try {
      console.log(`📄 Creating: ${agentInput.name}`);
      console.log(`   Key: ${agentInput.agentKey}`);
      console.log(`   Lyzr ID: ${agentInput.lyzrAgentId}`);
      console.log(`   Suggestions: ${agentInput.suggestions.length}`);

      const agent = await createAgent(agentInput);
      console.log(`   ✅ Created: ${agent.pk}/${agent.sk}\n`);
      created++;
    } catch (error) {
      console.error(`   ❌ Failed: ${error}\n`);
      failed++;
    }
  }

  // Summary
  console.log("=".repeat(60));
  console.log("SEED SUMMARY");
  console.log("=".repeat(60));
  console.log(`\n✅ Created: ${created}`);
  console.log(`❌ Failed: ${failed}`);

  if (created > 0) {
    console.log("\n🎉 Agents seeded successfully!");
    console.log("\n📋 Next: Update ai-command-bar.tsx to fetch from DB");
  }

  console.log("\n" + "=".repeat(60) + "\n");
}

main().catch(console.error);
