import { NextRequest, NextResponse } from "next/server";
import {
  getLeadById,
  getInteractionsByLeadId,
  getRecommendationsByTargetIdAndType,
  updateLead,
  type UpdateLeadInput,
} from "../../../../lib/data-layer";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams): Promise<Response> {
  try {
    const { id: leadId } = await params;
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section");

    // Get lead by ID
    const lead = await getLeadById(leadId);

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    // If specific section requested, return only that section
    if (section === "interactions") {
      const interactions = await getInteractionsByLeadId(leadId);
      return NextResponse.json({ success: true, interactions });
    }

    if (section === "recommendations") {
      const recommendations = await getRecommendationsByTargetIdAndType(leadId);
      return NextResponse.json({ success: true, recommendations });
    }

    // Default: return all data
    const [interactions, recommendations] = await Promise.all([
      getInteractionsByLeadId(leadId),
      getRecommendationsByTargetIdAndType(leadId),
    ]);

    return NextResponse.json({
      success: true,
      lead,
      interactions,
      recommendations,
    });
  } catch (error) {
    console.error("Error fetching lead details:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch lead details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  try {
    const { id: leadId } = await params;
    const body = await request.json();

    // Verify lead exists
    const existingLead = await getLeadById(leadId);
    if (!existingLead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    // Build update payload
    const updates: UpdateLeadInput = {};

    // Customer info updates
    if (body.customer) {
      updates.customer = {
        ...existingLead.customer,
        ...body.customer,
      };
    }

    // Direct field updates
    if (body.source !== undefined) updates.source = body.source;
    if (body.status !== undefined) updates.status = body.status;
    if (body.priority !== undefined) updates.priority = body.priority;
    if (body.assignedTo !== undefined) updates.assignedTo = body.assignedTo;
    if (body.score !== undefined) updates.score = body.score;
    if (body.aiScore !== undefined) updates.aiScore = body.aiScore;

    // Interest updates (budget, timeline, brands, vehicleTypes)
    if (body.interest) {
      updates.interest = {
        ...existingLead.interest,
        ...body.interest,
      };
    }

    // Update the lead
    const updatedLead = await updateLead(leadId, updates);

    if (!updatedLead) {
      return NextResponse.json(
        { success: false, error: "Failed to update lead" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      lead: updatedLead,
    });
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update lead" },
      { status: 500 }
    );
  }
}
