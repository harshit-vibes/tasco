import { NextResponse } from "next/server";
import {
  getAllCampaigns,
  getActiveCampaigns,
  getCampaignById,
  getCampaignsByEntities,
  getCampaignStats,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from "@tasco/db/mongodb/lifecycle";
import { syncCampaignToRAG } from "../../../lib/rag-sync";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

const APP_ID = "customer-lifecycle";

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const active = searchParams.get("active");
    const stats = searchParams.get("stats");
    const entityIds = searchParams.get("entityIds");

    console.log("[campaigns] GET request", { id, active, stats, entityIds });

    // Get campaign by ID
    if (id) {
      const campaign = await getCampaignById(id);
      if (!campaign) {
        return NextResponse.json(
          { success: false, error: "Campaign not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, campaign, source: "mongodb" });
    }

    // Get campaign stats (filtered by entities if provided)
    if (stats === "true") {
      const entityIdList = entityIds ? entityIds.split(",").filter(Boolean) : undefined;
      const campaignStats = await getCampaignStats(entityIdList);
      return NextResponse.json({ success: true, stats: campaignStats, source: "mongodb" });
    }

    // Get active campaigns only
    if (active === "true") {
      const entityIdList = entityIds ? entityIds.split(",").filter(Boolean) : undefined;
      const campaigns = await getActiveCampaigns(entityIdList);
      return NextResponse.json({ success: true, campaigns, source: "mongodb" });
    }

    // Get campaigns filtered by entityIds
    if (entityIds) {
      const entityIdList = entityIds.split(",").filter(Boolean);
      const campaigns = await getCampaignsByEntities(entityIdList);
      return NextResponse.json({ success: true, campaigns, source: "mongodb" });
    }

    // Get all campaigns
    const result = await getAllCampaigns();
    return NextResponse.json({ success: true, campaigns: result.items, source: "mongodb" });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { name, type, targetSegment, budget, startDate, endDate, status, entityId, createdBy } = body;

    if (!name || !type || !budget || !startDate) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, type, budget, startDate" },
        { status: 400 }
      );
    }

    const campaign = await createCampaign({
      name,
      type,
      targetSegment: targetSegment || "all",
      budget: Number(budget),
      startDate,
      endDate,
      status: status || "draft",
      entityId: entityId || "default",
      createdBy: createdBy || "user",
    });

    // Sync to RAG (async, don't block response)
    syncCampaignToRAG(campaign).catch((err) =>
      console.error("[RAG Sync] Background sync failed:", err)
    );

    console.log("[campaigns] Created campaign:", campaign.id);

    return NextResponse.json(
      { success: true, campaign, message: `Campaign "${campaign.name}" created successfully`, source: "mongodb" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create campaign" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Update the campaign
    const campaign = await updateCampaign(id, body);

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Sync to RAG (async, don't block response)
    syncCampaignToRAG(campaign).catch((err) =>
      console.error("[RAG Sync] Background sync failed:", err)
    );

    console.log("[campaigns] Updated campaign:", campaign.id);

    return NextResponse.json({
      success: true,
      campaign,
      message: `Campaign "${campaign.name}" updated successfully`,
      source: "mongodb",
    });
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update campaign" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // Get campaign first for the message
    const campaign = await getCampaignById(id);
    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Delete the campaign
    const deleted = await deleteCampaign(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Failed to delete campaign" },
        { status: 500 }
      );
    }

    console.log("[campaigns] Deleted campaign:", id);

    return NextResponse.json({
      success: true,
      message: `Campaign "${campaign.name}" deleted successfully`,
      source: "mongodb",
    });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete campaign" },
      { status: 500 }
    );
  }
}
