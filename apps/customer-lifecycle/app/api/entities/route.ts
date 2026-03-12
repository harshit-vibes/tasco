import { NextResponse, type NextRequest } from "next/server";
import {
  listEntities,
  listEntitiesByCategory,
  batchCreateEntities,
  isEntitiesEmpty,
  type CreateEntityInput,
} from "@tasco/db/mongodb/lifecycle";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Track if entities have been checked for seeding
let hasCheckedSeed = false;

// Automotive entities seed data (only created if no entities exist)
const AUTOMOTIVE_SEED_DATA: CreateEntityInput[] = [
  // Showrooms
  {
    id: "showroom-hanoi-1",
    name: "Tasco Auto Showroom - Cầu Giấy",
    shortName: "Cầu Giấy",
    type: "subsidiary",
    category: "automotive-showroom",
    parentId: "tasco-auto",
    metadata: {
      location: "Cầu Giấy, Hanoi",
      employeeCount: 45,
      industry: "Car Dealership",
    },
  },
  {
    id: "showroom-hanoi-2",
    name: "Tasco Auto Showroom - Long Biên",
    shortName: "Long Biên",
    type: "subsidiary",
    category: "automotive-showroom",
    parentId: "tasco-auto",
    metadata: {
      location: "Long Biên, Hanoi",
      employeeCount: 38,
      industry: "Car Dealership",
    },
  },
  {
    id: "showroom-hcm-1",
    name: "Tasco Auto Showroom - Quận 7",
    shortName: "Quận 7",
    type: "subsidiary",
    category: "automotive-showroom",
    parentId: "tasco-auto",
    metadata: {
      location: "District 7, Ho Chi Minh",
      employeeCount: 52,
      industry: "Car Dealership",
    },
  },
  {
    id: "showroom-hcm-2",
    name: "Tasco Auto Showroom - Thủ Đức",
    shortName: "Thủ Đức",
    type: "subsidiary",
    category: "automotive-showroom",
    parentId: "tasco-auto",
    metadata: {
      location: "Thủ Đức, Ho Chi Minh",
      employeeCount: 41,
      industry: "Car Dealership",
    },
  },
  {
    id: "showroom-danang",
    name: "Tasco Auto Showroom - Hải Châu",
    shortName: "Hải Châu",
    type: "subsidiary",
    category: "automotive-showroom",
    parentId: "tasco-auto",
    metadata: {
      location: "Hải Châu, Da Nang",
      employeeCount: 35,
      industry: "Car Dealership",
    },
  },
  {
    id: "carpla-hanoi",
    name: "Carpla Certified - Hanoi",
    shortName: "Carpla Hanoi",
    type: "subsidiary",
    category: "automotive-showroom",
    parentId: "carpla",
    metadata: {
      location: "Hanoi",
      employeeCount: 28,
      industry: "Used Car Dealership",
    },
  },
  {
    id: "carpla-hcm",
    name: "Carpla Certified - HCM",
    shortName: "Carpla HCM",
    type: "subsidiary",
    category: "automotive-showroom",
    parentId: "carpla",
    metadata: {
      location: "Ho Chi Minh",
      employeeCount: 32,
      industry: "Used Car Dealership",
    },
  },
  // B2B Clients
  {
    id: "b2b-vinfast-fleet",
    name: "VinFast Corporate Fleet",
    shortName: "VinFast",
    type: "subsidiary",
    category: "automotive-b2b",
    metadata: {
      location: "Hai Phong, Vietnam",
      employeeCount: 15000,
      industry: "Fleet Services",
      comments: "Major EV fleet partner",
    },
  },
  {
    id: "b2b-grab-vietnam",
    name: "Grab Vietnam",
    shortName: "Grab",
    type: "subsidiary",
    category: "automotive-b2b",
    metadata: {
      location: "Ho Chi Minh, Vietnam",
      employeeCount: 2500,
      industry: "Ride-hailing",
      comments: "Driver fleet programs",
    },
  },
  {
    id: "b2b-viettel-fleet",
    name: "Viettel Fleet Management",
    shortName: "Viettel",
    type: "subsidiary",
    category: "automotive-b2b",
    metadata: {
      location: "Hanoi, Vietnam",
      employeeCount: 35000,
      industry: "Telecommunications",
      comments: "Corporate vehicle fleet",
    },
  },
  {
    id: "b2b-fpt-automotive",
    name: "FPT Automotive",
    shortName: "FPT Auto",
    type: "subsidiary",
    category: "automotive-b2b",
    metadata: {
      location: "Hanoi, Vietnam",
      employeeCount: 28000,
      industry: "Technology",
      comments: "Executive vehicle program",
    },
  },
  {
    id: "b2b-masan-logistics",
    name: "Masan Logistics",
    shortName: "Masan",
    type: "subsidiary",
    category: "automotive-b2b",
    metadata: {
      location: "Ho Chi Minh, Vietnam",
      employeeCount: 8000,
      industry: "Retail/FMCG",
      comments: "Distribution fleet",
    },
  },
];

/**
 * GET handler - returns entities from MongoDB
 * Use ?all=true to get all entities, otherwise returns automotive entities only
 * Auto-seeds if collection is empty
 */
export async function GET(request: NextRequest): Promise<Response> {
  try {
    console.log("[entities] Fetching entities from MongoDB...");

    // Seed automotive entities if collection is empty
    if (!hasCheckedSeed) {
      const isEmpty = await isEntitiesEmpty();
      if (isEmpty) {
        console.log(
          "[entities] Collection empty, seeding automotive entities..."
        );
        await batchCreateEntities(AUTOMOTIVE_SEED_DATA);
      }
      hasCheckedSeed = true;
    }

    // Check if all entities requested
    const searchParams = request.nextUrl.searchParams;
    const fetchAll = searchParams.get("all") === "true";

    let entities;
    if (fetchAll) {
      // Fetch all entities including tasco-group hierarchy
      const result = await listEntities(500);
      entities = result.items;
    } else {
      // Fetch only brand portfolio entities (showrooms, B2B clients, brands)
      entities = await listEntitiesByCategory([
        "automotive-showroom",
        "automotive-b2b",
        "automotive-brand",
      ]);
    }

    console.log(`[entities] Found ${entities.length} entities`);

    return NextResponse.json(
      {
        success: true,
        entities,
        count: entities.length,
        source: "mongodb",
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1500",
        },
      }
    );
  } catch (error) {
    console.error("[entities] Error fetching entities:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch entities" },
      { status: 500 }
    );
  }
}
