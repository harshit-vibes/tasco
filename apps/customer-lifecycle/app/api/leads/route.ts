import { NextResponse } from "next/server";
import {
  getAllLeads,
  getLeadById,
  getLeadsByEntities,
  getLeadsByPriority,
  getLeadsByStatus,
  getLeadStats,
  createLead,
  updateLead,
  deleteLead,
  type LeadPriority,
  type LeadStatus,
} from "@tasco/db/mongodb/lifecycle";
import {
  createConversation,
  createMessage,
} from "@tasco/db/mongodb";
import { syncLeadToRAG } from "../../../lib/rag-sync";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

const APP_ID = "customer-lifecycle";

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const priority = searchParams.get("priority");
    const status = searchParams.get("status");
    const stats = searchParams.get("stats");
    const entityIds = searchParams.get("entityIds");

    console.log("[leads] GET request", { id, priority, status, stats, entityIds });

    // Get lead by ID
    if (id) {
      const lead = await getLeadById(id);
      if (!lead) {
        return NextResponse.json(
          { success: false, error: "Lead not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, lead, source: "mongodb" });
    }

    // Get lead stats (filtered by entities if provided)
    if (stats === "true") {
      const entityIdList = entityIds ? entityIds.split(",").filter(Boolean) : undefined;
      const leadStats = await getLeadStats(entityIdList);
      return NextResponse.json({ success: true, stats: leadStats, source: "mongodb" });
    }

    // Get leads by priority
    if (priority) {
      let leads = await getLeadsByPriority(priority as LeadPriority);
      // Filter by entity if provided
      if (entityIds) {
        const entityIdList = entityIds.split(",").filter(Boolean);
        leads = leads.filter(l => entityIdList.includes(l.entityId));
      }
      return NextResponse.json({ success: true, leads, source: "mongodb" });
    }

    // Get leads by status
    if (status) {
      let leads = await getLeadsByStatus(status as LeadStatus);
      // Filter by entity if provided
      if (entityIds) {
        const entityIdList = entityIds.split(",").filter(Boolean);
        leads = leads.filter(l => entityIdList.includes(l.entityId));
      }
      return NextResponse.json({ success: true, leads, source: "mongodb" });
    }

    // Get leads filtered by entityIds
    if (entityIds) {
      const entityIdList = entityIds.split(",").filter(Boolean);
      const leads = await getLeadsByEntities(entityIdList);
      return NextResponse.json({ success: true, leads, source: "mongodb" });
    }

    // Get all leads
    const result = await getAllLeads();
    return NextResponse.json({ success: true, leads: result.items, source: "mongodb" });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();

    // Create the lead
    const lead = await createLead(body);

    // Sync to RAG (async, don't block response)
    syncLeadToRAG(lead).catch((err) =>
      console.error("[RAG Sync] Background sync failed:", err)
    );

    console.log("[leads] Created lead:", lead.id);

    return NextResponse.json(
      { success: true, lead, message: `Lead "${lead.customer.name}" created successfully`, source: "mongodb" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create lead" },
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
        { success: false, error: "Lead ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Update the lead
    const lead = await updateLead(id, body);

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    // Sync to RAG (async, don't block response)
    syncLeadToRAG(lead).catch((err) =>
      console.error("[RAG Sync] Background sync failed:", err)
    );

    console.log("[leads] Updated lead:", lead.id);

    return NextResponse.json({
      success: true,
      lead,
      message: `Lead "${lead.customer.name}" updated successfully`,
      source: "mongodb",
    });
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update lead" },
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
        { success: false, error: "Lead ID is required" },
        { status: 400 }
      );
    }

    // Get lead first for the message
    const lead = await getLeadById(id);
    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    // Delete the lead
    const deleted = await deleteLead(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Failed to delete lead" },
        { status: 500 }
      );
    }

    console.log("[leads] Deleted lead:", id);

    return NextResponse.json({
      success: true,
      message: `Lead "${lead.customer.name}" deleted successfully`,
      source: "mongodb",
    });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete lead" },
      { status: 500 }
    );
  }
}
