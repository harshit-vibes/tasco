import { NextRequest, NextResponse } from "next/server";
import {
  getCustomerById,
  getPurchasesByCustomerId,
  getInteractionsByCustomerId,
  updateCustomer,
  type UpdateCustomerInput,
} from "../../../../lib/data-layer";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams): Promise<Response> {
  try {
    const { id: customerId } = await params;
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section");

    // Get customer by ID
    const customer = await getCustomerById(customerId);

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    // If specific section requested, return only that section
    if (section === "purchases") {
      const purchases = await getPurchasesByCustomerId(customerId);
      return NextResponse.json({ success: true, purchases });
    }

    if (section === "interactions") {
      const interactions = await getInteractionsByCustomerId(customerId);
      return NextResponse.json({ success: true, interactions });
    }

    // Default: return all data
    const [purchases, interactions] = await Promise.all([
      getPurchasesByCustomerId(customerId),
      getInteractionsByCustomerId(customerId),
    ]);

    return NextResponse.json({
      success: true,
      customer,
      purchases,
      interactions,
    });
  } catch (error) {
    console.error("Error fetching customer details:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customer details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  try {
    const { id: customerId } = await params;
    const body = await request.json();

    // Verify customer exists
    const existingCustomer = await getCustomerById(customerId);
    if (!existingCustomer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    // Build update payload
    const updates: UpdateCustomerInput = {};

    // Profile updates
    if (body.profile) {
      updates.profile = {
        ...existingCustomer.profile,
        ...body.profile,
      };
    }

    // Lifecycle updates
    if (body.lifecycle) {
      updates.lifecycle = {
        ...existingCustomer.lifecycle,
        ...body.lifecycle,
      };
    }

    // Preferences updates
    if (body.preferences) {
      updates.preferences = {
        ...existingCustomer.preferences,
        ...body.preferences,
      };
    }

    // Insights updates
    if (body.insights) {
      updates.insights = {
        ...existingCustomer.insights,
        ...body.insights,
      };
    }

    // Direct field updates
    if (body.entityId !== undefined) updates.entityId = body.entityId;

    // Update the customer
    const updatedCustomer = await updateCustomer(customerId, updates);

    if (!updatedCustomer) {
      return NextResponse.json(
        { success: false, error: "Failed to update customer" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update customer" },
      { status: 500 }
    );
  }
}
