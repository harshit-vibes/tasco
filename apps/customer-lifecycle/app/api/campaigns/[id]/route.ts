import { NextRequest, NextResponse } from "next/server";
import {
  getCampaignById,
  updateCampaign,
  createNotification,
  type UpdateCampaignInput,
} from "@tasco/db";
import { syncCampaignToRAG } from "../../../../lib/rag-sync";

const APP_ID = "customer-lifecycle";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  try {
    const { id: campaignId } = await params;

    // Get campaign by ID
    const campaign = await getCampaignById(campaignId);

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      campaign,
    });
  } catch (error) {
    console.error("Error fetching campaign details:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch campaign details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  try {
    const { id: campaignId } = await params;
    const body = await request.json();

    // Verify campaign exists
    const existingCampaign = await getCampaignById(campaignId);
    if (!existingCampaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Build update payload
    const updates: UpdateCampaignInput = {};

    // Direct field updates
    if (body.name !== undefined) updates.name = body.name;
    if (body.status !== undefined) updates.status = body.status;
    if (body.targetSegment !== undefined) updates.targetSegment = body.targetSegment;
    if (body.budget !== undefined) updates.budget = Number(body.budget);
    if (body.endDate !== undefined) updates.endDate = body.endDate;

    // Metrics updates (if provided)
    if (body.metrics) {
      updates.metrics = {
        ...existingCampaign.metrics,
        ...body.metrics,
      };
    }

    // Update the campaign
    const updatedCampaign = await updateCampaign(campaignId, updates);

    if (!updatedCampaign) {
      return NextResponse.json(
        { success: false, error: "Failed to update campaign" },
        { status: 500 }
      );
    }

    // Sync to RAG (async, don't block response)
    syncCampaignToRAG(updatedCampaign).catch((err) =>
      console.error("[RAG Sync] Background sync failed:", err)
    );

    // Determine notification type based on status change
    const statusChanged = body.status && body.status !== existingCampaign.status;
    const notifType = statusChanged
      ? updatedCampaign.status === "active"
        ? "launched"
        : updatedCampaign.status === "completed"
          ? "completed"
          : "updated"
      : "updated";

    // Create notification (async, don't block response)
    createNotification({
      type: notifType,
      category: "campaign",
      title: `Campaign ${notifType}: ${updatedCampaign.name}`,
      message: statusChanged
        ? `Campaign status changed to "${updatedCampaign.status}"`
        : `Campaign details have been updated`,
      appId: APP_ID,
      priority: notifType === "launched" ? "high" : "medium",
      actionUrl: `/marketing?id=${updatedCampaign.id}`,
      metadata: { campaignId: updatedCampaign.id },
    }).catch((err) => console.error("[Notification] Failed to create:", err));

    return NextResponse.json({
      success: true,
      campaign: updatedCampaign,
    });
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}
