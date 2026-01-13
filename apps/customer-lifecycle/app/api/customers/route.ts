import { NextResponse } from "next/server";
import {
  getAllCustomers,
  getCustomerById,
  getCustomersByEntity,
  getCustomersBySegment,
  getAtRiskCustomers,
  getCustomerStats,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  createNotification,
} from "@tasco/db";
import { syncCustomerToRAG } from "../../../lib/rag-sync";

const APP_ID = "customer-lifecycle";

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const segment = searchParams.get("segment");
    const atRisk = searchParams.get("atRisk");
    const stats = searchParams.get("stats");
    const entityIds = searchParams.get("entityIds");

    // Get customer by ID
    if (id) {
      const customer = await getCustomerById(id);
      if (!customer) {
        return NextResponse.json(
          { success: false, error: "Customer not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, customer });
    }

    // Get customer stats (filtered by entities if provided)
    if (stats === "true") {
      if (entityIds) {
        // Get customers for selected entities and compute stats
        const entityIdList = entityIds.split(",").filter(Boolean);
        const customerPromises = entityIdList.map(id => getCustomersByEntity(id));
        const results = await Promise.all(customerPromises);
        const customers = results.flat();

        const vip = customers.filter((c) => c.insights.segment === "vip").length;
        const regular = customers.filter((c) => c.insights.segment === "regular").length;
        const atRiskCount = customers.filter((c) => c.insights.segment === "at-risk").length;
        const newCustomers = customers.filter((c) => c.insights.segment === "new").length;
        const totalLifetimeValue = customers.reduce((sum, c) => sum + c.insights.lifetimeValue, 0);

        return NextResponse.json({
          success: true,
          stats: {
            total: customers.length,
            vip,
            regular,
            atRisk: atRiskCount,
            new: newCustomers,
            totalLifetimeValue,
            averageLifetimeValue: customers.length > 0 ? totalLifetimeValue / customers.length : 0,
          }
        });
      }
      const customerStats = await getCustomerStats();
      return NextResponse.json({ success: true, stats: customerStats });
    }

    // Get at-risk customers
    if (atRisk === "true") {
      const customers = await getAtRiskCustomers();
      // Filter by entity if provided
      if (entityIds) {
        const entityIdList = entityIds.split(",").filter(Boolean);
        const filteredCustomers = customers.filter(c => entityIdList.includes(c.entityId));
        return NextResponse.json({ success: true, customers: filteredCustomers });
      }
      return NextResponse.json({ success: true, customers });
    }

    // Get customers by segment
    if (segment) {
      const customers = await getCustomersBySegment(segment as "vip" | "regular" | "at-risk" | "new");
      // Filter by entity if provided
      if (entityIds) {
        const entityIdList = entityIds.split(",").filter(Boolean);
        const filteredCustomers = customers.filter(c => entityIdList.includes(c.entityId));
        return NextResponse.json({ success: true, customers: filteredCustomers });
      }
      return NextResponse.json({ success: true, customers });
    }

    // Get customers filtered by entityIds
    if (entityIds) {
      const entityIdList = entityIds.split(",").filter(Boolean);
      const customerPromises = entityIdList.map(id => getCustomersByEntity(id));
      const results = await Promise.all(customerPromises);
      const customers = results.flat();
      return NextResponse.json({ success: true, customers });
    }

    // Get all customers
    const result = await getAllCustomers();
    return NextResponse.json({ success: true, customers: result.items });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customers" },
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

    // Create notification (async, don't block response)
    createNotification({
      type: "created",
      category: "customer",
      title: `New customer: ${customer.profile.name}`,
      message: `Customer added with segment "${customer.insights.segment}"`,
      appId: APP_ID,
      priority: customer.insights.segment === "vip" ? "high" : "medium",
      actionUrl: `/customers?id=${customer.id}`,
      metadata: { customerId: customer.id },
    }).catch((err) => console.error("[Notification] Failed to create:", err));

    return NextResponse.json(
      { success: true, customer, message: `Customer "${customer.profile.name}" created successfully` },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create customer" },
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

    // Create notification (async, don't block response)
    createNotification({
      type: "updated",
      category: "customer",
      title: `Customer updated: ${customer.profile.name}`,
      message: `Customer segment is now "${customer.insights.segment}"`,
      appId: APP_ID,
      priority: "low",
      actionUrl: `/customers?id=${customer.id}`,
      metadata: { customerId: customer.id },
    }).catch((err) => console.error("[Notification] Failed to create:", err));

    return NextResponse.json({
      success: true,
      customer,
      message: `Customer "${customer.profile.name}" updated successfully`,
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update customer" },
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
    await deleteCustomer(id);

    // Create notification (async, don't block response)
    createNotification({
      type: "deleted",
      category: "customer",
      title: `Customer deleted: ${customer.profile.name}`,
      message: `Customer has been removed from the system`,
      appId: APP_ID,
      priority: "low",
      actionUrl: `/customers`,
      metadata: { customerId: id },
    }).catch((err) => console.error("[Notification] Failed to create:", err));

    return NextResponse.json({
      success: true,
      message: `Customer "${customer.profile.name}" deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
