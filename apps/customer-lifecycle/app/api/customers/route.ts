import { NextResponse } from "next/server";
import {
  getAllCustomers,
  getCustomerById,
  getCustomersByEntities,
  getCustomersBySegment,
  getAtRiskCustomers,
  getCustomerStats,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  type CustomerSegment,
} from "@tasco/db/mongodb/lifecycle";
import { syncCustomerToRAG } from "../../../lib/rag-sync";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

const APP_ID = "customer-lifecycle";

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const segment = searchParams.get("segment");
    const atRisk = searchParams.get("atRisk");
    const stats = searchParams.get("stats");
    const entityIds = searchParams.get("entityIds");

    console.log("[customers] GET request", { id, segment, atRisk, stats, entityIds });

    // Get customer by ID
    if (id) {
      const customer = await getCustomerById(id);
      if (!customer) {
        return NextResponse.json(
          { success: false, error: "Customer not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, customer, source: "mongodb" });
    }

    // Get customer stats (filtered by entities if provided)
    if (stats === "true") {
      const entityIdList = entityIds ? entityIds.split(",").filter(Boolean) : undefined;
      const customerStats = await getCustomerStats(entityIdList);
      return NextResponse.json({ success: true, stats: customerStats, source: "mongodb" });
    }

    // Get at-risk customers
    if (atRisk === "true") {
      const entityIdList = entityIds ? entityIds.split(",").filter(Boolean) : undefined;
      const customers = await getAtRiskCustomers(entityIdList);
      return NextResponse.json({ success: true, customers, source: "mongodb" });
    }

    // Get customers by segment
    if (segment) {
      let customers = await getCustomersBySegment(segment as CustomerSegment);
      // Filter by entity if provided
      if (entityIds) {
        const entityIdList = entityIds.split(",").filter(Boolean);
        customers = customers.filter(c => entityIdList.includes(c.entityId));
      }
      return NextResponse.json({ success: true, customers, source: "mongodb" });
    }

    // Get customers filtered by entityIds
    if (entityIds) {
      const entityIdList = entityIds.split(",").filter(Boolean);
      const customers = await getCustomersByEntities(entityIdList);
      return NextResponse.json({ success: true, customers, source: "mongodb" });
    }

    // Get all customers
    const result = await getAllCustomers();
    return NextResponse.json({ success: true, customers: result.items, source: "mongodb" });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();

    // Create the customer
    const customer = await createCustomer(body);

    // Sync to RAG (async, don't block response)
    syncCustomerToRAG(customer).catch((err) =>
      console.error("[RAG Sync] Background sync failed:", err)
    );

    console.log("[customers] Created customer:", customer.id);

    return NextResponse.json(
      { success: true, customer, message: `Customer "${customer.profile.name}" created successfully`, source: "mongodb" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create customer" },
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
        { success: false, error: "Customer ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Update the customer
    const customer = await updateCustomer(id, body);

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    // Sync to RAG (async, don't block response)
    syncCustomerToRAG(customer).catch((err) =>
      console.error("[RAG Sync] Background sync failed:", err)
    );

    console.log("[customers] Updated customer:", customer.id);

    return NextResponse.json({
      success: true,
      customer,
      message: `Customer "${customer.profile.name}" updated successfully`,
      source: "mongodb",
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update customer" },
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
        { success: false, error: "Customer ID is required" },
        { status: 400 }
      );
    }

    // Get customer first for the message
    const customer = await getCustomerById(id);
    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    // Delete the customer
    const deleted = await deleteCustomer(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Failed to delete customer" },
        { status: 500 }
      );
    }

    console.log("[customers] Deleted customer:", id);

    return NextResponse.json({
      success: true,
      message: `Customer "${customer.profile.name}" deleted successfully`,
      source: "mongodb",
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete customer" },
      { status: 500 }
    );
  }
}
