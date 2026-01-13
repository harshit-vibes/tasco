import { NextResponse } from "next/server";
import {
  getAllLeads,
  getLeadsByEntity,
  getLeadStats,
  getAllCustomers,
  getCustomersByEntity,
  getCustomerStats,
  getAtRiskCustomers,
  getAllCampaigns,
  getCampaignsByEntity,
  getActiveCampaigns,
  getCampaignStats,
  getHighConfidenceRecommendations,
} from "@tasco/db";

// Helper function to compute lead stats from a list of leads
function computeLeadStats(leads: any[]) {
  const hot = leads.filter((l) => l.priority === "hot").length;
  const warm = leads.filter((l) => l.priority === "warm").length;
  const cold = leads.filter((l) => l.priority === "cold").length;
  const newLeads = leads.filter((l) => l.status === "new").length;
  const contacted = leads.filter((l) => l.status === "contacted").length;
  const qualified = leads.filter((l) => l.status === "qualified").length;
  const converted = leads.filter((l) => l.status === "converted").length;

  return {
    total: leads.length,
    hot,
    warm,
    cold,
    new: newLeads,
    contacted,
    qualified,
    conversionRate: leads.length > 0 ? (converted / leads.length) * 100 : 0,
  };
}

// Helper function to compute customer stats from a list of customers
function computeCustomerStats(customers: any[]) {
  const vip = customers.filter((c) => c.insights.segment === "vip").length;
  const regular = customers.filter((c) => c.insights.segment === "regular").length;
  const atRisk = customers.filter((c) => c.insights.segment === "at-risk").length;
  const newCustomers = customers.filter((c) => c.insights.segment === "new").length;
  const totalLifetimeValue = customers.reduce((sum, c) => sum + c.insights.lifetimeValue, 0);

  return {
    total: customers.length,
    vip,
    regular,
    atRisk,
    new: newCustomers,
    totalLifetimeValue,
    averageLifetimeValue: customers.length > 0 ? totalLifetimeValue / customers.length : 0,
  };
}

// Helper function to compute campaign stats from a list of campaigns
function computeCampaignStats(campaigns: any[]) {
  const active = campaigns.filter((c) => c.status === "active").length;
  const completed = campaigns.filter((c) => c.status === "completed").length;
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + (c.metrics.revenue || 0), 0);
  const averageROI = totalBudget > 0 ? (totalRevenue - totalBudget) / totalBudget : 0;

  return {
    total: campaigns.length,
    active,
    completed,
    totalBudget,
    totalRevenue,
    averageROI,
  };
}

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section");
    const entityIds = searchParams.get("entityIds");

    // Parse entity IDs
    const entityIdList = entityIds ? entityIds.split(",").filter(Boolean) : [];
    const hasEntityFilter = entityIdList.length > 0;

    // Helper to get data filtered by entities
    const getFilteredLeads = async () => {
      if (hasEntityFilter) {
        const promises = entityIdList.map(id => getLeadsByEntity(id));
        const results = await Promise.all(promises);
        return results.flat();
      }
      const result = await getAllLeads();
      return result.items;
    };

    const getFilteredCustomers = async () => {
      if (hasEntityFilter) {
        const promises = entityIdList.map(id => getCustomersByEntity(id));
        const results = await Promise.all(promises);
        return results.flat();
      }
      const result = await getAllCustomers();
      return result.items;
    };

    const getFilteredCampaigns = async () => {
      if (hasEntityFilter) {
        const promises = entityIdList.map(id => getCampaignsByEntity(id));
        const results = await Promise.all(promises);
        return results.flat();
      }
      return getAllCampaigns();
    };

    // Get specific section data
    if (section === "leads") {
      const leads = await getFilteredLeads();
      return NextResponse.json({ success: true, leads });
    }

    if (section === "atRisk") {
      const customers = await getAtRiskCustomers();
      // Filter by entity if provided
      const filtered = hasEntityFilter
        ? customers.filter(c => entityIdList.includes(c.entityId))
        : customers;
      return NextResponse.json({ success: true, customers: filtered });
    }

    if (section === "recommendations") {
      const recommendations = await getHighConfidenceRecommendations();
      // Filter by entity if provided
      const filtered = hasEntityFilter
        ? recommendations.filter((r: any) => entityIdList.includes(r.entityId))
        : recommendations;
      return NextResponse.json({ success: true, recommendations: filtered });
    }

    if (section === "campaigns") {
      const campaigns = await getActiveCampaigns();
      // Filter by entity if provided
      const filtered = hasEntityFilter
        ? campaigns.filter(c => entityIdList.includes(c.entityId))
        : campaigns;
      return NextResponse.json({ success: true, campaigns: filtered });
    }

    // Get full dashboard stats
    if (hasEntityFilter) {
      const [leads, customers, campaigns] = await Promise.all([
        getFilteredLeads(),
        getFilteredCustomers(),
        getFilteredCampaigns(),
      ]);

      return NextResponse.json({
        success: true,
        stats: {
          leads: computeLeadStats(leads),
          customers: computeCustomerStats(customers),
          campaigns: computeCampaignStats(campaigns),
        },
      });
    }

    // No entity filter - use regular stats functions
    const [leadStats, customerStats, campaignStats] = await Promise.all([
      getLeadStats(),
      getCustomerStats(),
      getCampaignStats(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        leads: leadStats,
        customers: customerStats,
        campaigns: campaignStats,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
