import { NextResponse } from "next/server";
import {
  getAllLeads,
  getLeadById,
  getLeadsByEntity,
  getLeadsByPriority,
  getLeadsByStatus,
  getLeadStats,
  createLead,
  updateLead,
  deleteLead,
  createNotification,
} from "@tasco/db";
import { syncLeadToRAG } from "../../../lib/rag-sync";

const APP_ID = "customer-lifecycle";

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const priority = searchParams.get("priority");
    const status = searchParams.get("status");
    const stats = searchParams.get("stats");
    const entityIds = searchParams.get("entityIds");

    // Get lead by ID
    if (id) {
      const lead = await getLeadById(id);
      if (!lead) {
        return NextResponse.json(
          { success: false, error: "Lead not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, lead });
    }

    // Get lead stats (filtered by entities if provided)
    if (stats === "true") {
      if (entityIds) {
        // Get leads for selected entities and compute stats
        const entityIdList = entityIds.split(",").filter(Boolean);
        const leadPromises = entityIdList.map(id => getLeadsByEntity(id));
        const results = await Promise.all(leadPromises);
        const leads = results.flat();

        const hot = leads.filter((l) => l.priority === "hot").length;
        const warm = leads.filter((l) => l.priority === "warm").length;
        const cold = leads.filter((l) => l.priority === "cold").length;
        const newLeads = leads.filter((l) => l.status === "new").length;
        const contacted = leads.filter((l) => l.status === "contacted").length;
        const qualified = leads.filter((l) => l.status === "qualified").length;
        const converted = leads.filter((l) => l.status === "converted").length;

        return NextResponse.json({
          success: true,
          stats: {
            total: leads.length,
            hot,
            warm,
            cold,
            new: newLeads,
            contacted,
            qualified,
            conversionRate: leads.length > 0 ? (converted / leads.length) * 100 : 0,
          }
        });
      }
      const leadStats = await getLeadStats();
      return NextResponse.json({ success: true, stats: leadStats });
    }

    // Get leads by priority
    if (priority) {
      const leads = await getLeadsByPriority(priority as "hot" | "warm" | "cold");
      // Filter by entity if provided
      if (entityIds) {
        const entityIdList = entityIds.split(",").filter(Boolean);
        const filteredLeads = leads.filter(l => entityIdList.includes(l.entityId));
        return NextResponse.json({ success: true, leads: filteredLeads });
      }
      return NextResponse.json({ success: true, leads });
    }

    // Get leads by status
    if (status) {
      const leads = await getLeadsByStatus(status as "new" | "contacted" | "qualified" | "converted" | "lost");
      // Filter by entity if provided
      if (entityIds) {
        const entityIdList = entityIds.split(",").filter(Boolean);
        const filteredLeads = leads.filter(l => entityIdList.includes(l.entityId));
        return NextResponse.json({ success: true, leads: filteredLeads });
      }
      return NextResponse.json({ success: true, leads });
    }

    // Get leads filtered by entityIds
    if (entityIds) {
      const entityIdList = entityIds.split(",").filter(Boolean);
      const leadPromises = entityIdList.map(id => getLeadsByEntity(id));
      const results = await Promise.all(leadPromises);
      const leads = results.flat();
      return NextResponse.json({ success: true, leads });
    }

    // Get all leads
    const result = await getAllLeads();
    return NextResponse.json({ success: true, leads: result.items });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leads" },
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

    // Create notification (async, don't block response)
    createNotification({
      type: "created",
      category: "lead",
      title: `New lead: ${lead.customer.name}`,
      message: `Lead with priority "${lead.priority}" has been created`,
      appId: APP_ID,
      priority: lead.priority === "hot" ? "high" : "medium",
      actionUrl: `/leads?id=${lead.id}`,
      metadata: { leadId: lead.id },
    }).catch((err) => console.error("[Notification] Failed to create:", err));

    return NextResponse.json(
      { success: true, lead, message: `Lead "${lead.customer.name}" created successfully` },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create lead" },
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

    // Create notification (async, don't block response)
    createNotification({
      type: "updated",
      category: "lead",
      title: `Lead updated: ${lead.customer.name}`,
      message: `Lead status changed to "${lead.status}"`,
      appId: APP_ID,
      priority: "low",
      actionUrl: `/leads?id=${lead.id}`,
      metadata: { leadId: lead.id },
    }).catch((err) => console.error("[Notification] Failed to create:", err));

    return NextResponse.json({
      success: true,
      lead,
      message: `Lead "${lead.customer.name}" updated successfully`,
    });
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update lead" },
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
    await deleteLead(id);

    // Create notification (async, don't block response)
    createNotification({
      type: "deleted",
      category: "lead",
      title: `Lead deleted: ${lead.customer.name}`,
      message: `Lead has been removed from the system`,
      appId: APP_ID,
      priority: "low",
      actionUrl: `/leads`,
      metadata: { leadId: id },
    }).catch((err) => console.error("[Notification] Failed to create:", err));

    return NextResponse.json({
      success: true,
      message: `Lead "${lead.customer.name}" deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete lead" },
      { status: 500 }
    );
  }
}
