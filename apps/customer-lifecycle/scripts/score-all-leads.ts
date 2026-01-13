#!/usr/bin/env bun
/**
 * Score All Leads Script
 *
 * Runs AI scoring on all existing leads in batch.
 *
 * Usage: bun run scripts/score-all-leads.ts
 */

const API_BASE = "http://localhost:3002";

async function scoreAllLeads() {
  console.log("🚀 Starting batch lead scoring...\n");

  // 1. Get all leads
  console.log("📋 Fetching all leads...");
  const leadsResponse = await fetch(`${API_BASE}/api/leads`);
  const leadsData = await leadsResponse.json();

  if (!leadsData.success || !leadsData.leads) {
    console.error("❌ Failed to fetch leads");
    process.exit(1);
  }

  const leads = leadsData.leads;
  console.log(`   Found ${leads.length} leads\n`);

  // 2. Filter leads without AI scores
  const leadsToScore = leads.filter((lead: any) => !lead.aiScore);
  console.log(`📊 Leads without AI score: ${leadsToScore.length}`);
  console.log(`✅ Leads already scored: ${leads.length - leadsToScore.length}\n`);

  if (leadsToScore.length === 0) {
    console.log("✅ All leads already have AI scores!");
    return;
  }

  // 3. Score leads in batches of 5 (to avoid rate limiting)
  const BATCH_SIZE = 5;
  let scored = 0;
  let failed = 0;

  for (let i = 0; i < leadsToScore.length; i += BATCH_SIZE) {
    const batch = leadsToScore.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(leadsToScore.length / BATCH_SIZE);

    console.log(`\n⏳ Batch ${batchNum}/${totalBatches} (${batch.length} leads)...`);

    // Process batch in parallel
    const results = await Promise.allSettled(
      batch.map(async (lead: any) => {
        const response = await fetch(`${API_BASE}/api/leads/${lead.id}/score`, {
          method: "POST",
        });
        const data = await response.json();

        if (data.success) {
          return {
            id: lead.id,
            name: lead.customer?.name || "Unknown",
            score: data.aiScore.overallScore,
            recommendation: data.aiScore.recommendation,
          };
        } else {
          throw new Error(data.error || "Unknown error");
        }
      })
    );

    // Log results
    for (const result of results) {
      if (result.status === "fulfilled") {
        const { name, score, recommendation } = result.value;
        const emoji = recommendation === "Hot" ? "🔥" : recommendation === "Warm" ? "☀️" : "❄️";
        console.log(`   ${emoji} ${name}: ${score} (${recommendation})`);
        scored++;
      } else {
        console.log(`   ❌ Failed: ${result.reason}`);
        failed++;
      }
    }

    // Small delay between batches
    if (i + BATCH_SIZE < leadsToScore.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("✅ Batch scoring complete!");
  console.log(`   Scored: ${scored}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total: ${leads.length}`);
}

scoreAllLeads().catch(console.error);
