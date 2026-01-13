import { NextResponse } from "next/server";
import {
  getAllCampaigns,
  getActiveCampaigns,
  getCampaignById,
  getCampaignsByEntity,
  getCampaignStats,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  createNotification,
} from "@tasco/db";
import { syncCampaignToRAG } from "../../../lib/rag-sync";

const APP_ID = "customer-lifecycle";

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const active = searchParams.get("active");
    const stats = searchParams.get("stats");
    const entityIds = searchParams.get("entityIds");

    // Get campaign by ID
    if (id) {
      const campaign = await getCampaignById(id);
      if (!campaign) {
        return NextResponse.json(
          { success: false, error: "Campaign not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, campaign });
    }

    // Get campaign stats (filtered by entities if provided)
    if (stats === "true") {
      if (entityIds) {
        // Get campaigns for selected entities and compute stats
        const entityIdList = entityIds.split(",").filter(Boolean);
        const campaignPromises = entityIdList.map(id => getCampaignsByEntity(id));
        const results = await Promise.all(campaignPromises);
        const campaigns = results.flat();

        const activeCount = campaigns.filter((c) => c.status === "active").length;
        const completed = campaigns.filter((c) => c.status === "completed").length;
        const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
        const totalRevenue = campaigns.reduce((sum, c) => sum + (c.metrics.revenue || 0), 0);
        const averageROI = totalBudget > 0 ? (totalRevenue - totalBudget) / totalBudget : 0;

        return NextResponse.json({
          success: true,
          stats: {
            total: campaigns.length,
            active: activeCount,
            completed,
            totalBudget,
            totalRevenue,
            averageROI,
          }
        });
      }
      const campaignStats = await getCampaignStats();
      return NextResponse.json({ success: true, stats: campaignStats });
    }

    // Get active campaigns only
    if (active === "true") {
      const campaigns = await getActiveCampaigns();
      // Filter by entity if provided
      if (entityIds) {
        const entityIdList = entityIds.split(",").filter(Boolean);
        const filteredCampaigns = campaigns.filter(c => entityIdList.includes(c.entityId));
        return NextResponse.json({ success: true, campaigns: filteredCampaigns });
      }
      return NextResponse.json({ success: true, campaigns });
    }

    // Get campaigns filtered by entityIds
    if (entityIds) {
      const entityIdList = entityIds.split(",").filter(Boolean);
      const campaignPromises = entityIdList.map(id => getCampaignsByEntity(id));
      const results = await Promise.all(campaignPromises);
      const campaigns = results.flat();
      return NextResponse.json({ success: true, campaigns });
    }

    // Get all campaigns
    const campaigns = await getAllCampaigns();
    return NextResponse.json({ success: true, campaigns });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch campaigns" },
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

    // Create notification (async, don't block response)
    createNotification({
      type: "created",
      category: "campaign",
      title: `New campaign: ${campaign.name}`,
      message: `${campaign.type} campaign created for ${campaign.targetSegment} segment`,
      appId: APP_ID,
      priority: "high",
      actionUrl: `/marketing?id=${campaign.id}`,
      metadata: { campaignId: campaign.id },
    }).catch((err) => console.error("[Notification] Failed to create:", err));

    return NextResponse.json(
      { success: true, campaign, message: `Campaign "${campaign.name}" created successfully` },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create campaign" },
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

    // Determine notification type based on status change
    const notifType = campaign.status === "active" ? "launched" : campaign.status === "completed" ? "completed" : "updated";

    // Create notification (async, don't block response)
    createNotification({
      type: notifType,
      category: "campaign",
      title: `Campaign ${notifType}: ${campaign.name}`,
      message: `Campaign status is now "${campaign.status}"`,
      appId: APP_ID,
      priority: notifType === "launched" ? "high" : "medium",
      actionUrl: `/marketing?id=${campaign.id}`,
      metadata: { campaignId: campaign.id },
    }).catch((err) => console.error("[Notification] Failed to create:", err));

    return NextResponse.json({
      success: true,
      campaign,
      message: `Campaign "${campaign.name}" updated successfully`,
    });
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update campaign" },
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
    await deleteCampaign(id);

    // Create notification (async, don't block response)
    createNotification({
      type: "deleted",
      category: "campaign",
      title: `Campaign deleted: ${campaign.name}`,
      message: `Campaign has been removed from the system`,
      appId: APP_ID,
      priority: "low",
      actionUrl: `/marketing`,
      metadata: { campaignId: id },
    }).catch((err) => console.error("[Notification] Failed to create:", err));

    return NextResponse.json({
      success: true,
      message: `Campaign "${campaign.name}" deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}
