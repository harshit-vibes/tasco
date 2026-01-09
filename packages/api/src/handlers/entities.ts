import { NextResponse } from "next/server";
import {
  listEntities,
  createEntity,
  batchCreateEntities,
  isEntitiesEmpty,
} from "@tasco/db/entities";
import type { CreateEntityInput } from "@tasco/db/entities";

// Track if entities have been seeded
let hasCheckedSeed = false;

export interface EntitiesHandlerConfig {
  /** Seed data for initial population */
  seedData?: CreateEntityInput[];
  /** Cache duration in seconds */
  cacheDuration?: number;
}

/**
 * GET handler for listing entities
 * Auto-seeds if empty on first request
 */
export async function handleListEntities(config: EntitiesHandlerConfig = {}) {
  const { seedData = [], cacheDuration = 60 } = config;

  try {
    // Only check seed on first request
    if (!hasCheckedSeed && seedData.length > 0) {
      const isEmpty = await isEntitiesEmpty();
      if (isEmpty) {
        console.log("Entities collection empty, seeding default data...");
        await batchCreateEntities(seedData);
      }
      hasCheckedSeed = true;
    }

    const result = await listEntities(200);
    return NextResponse.json(
      {
        success: true,
        entities: result.items,
        count: result.items.length,
      },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${cacheDuration}, stale-while-revalidate=${cacheDuration * 5}`,
        },
      }
    );
  } catch (error) {
    console.error("Error fetching entities:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch entities" },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating an entity
 */
export async function handleCreateEntity(request: Request) {
  try {
    const body = await request.json();
    const entity = await createEntity(body);
    return NextResponse.json({ success: true, entity }, { status: 201 });
  } catch (error) {
    console.error("Error creating entity:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create entity" },
      { status: 500 }
    );
  }
}
