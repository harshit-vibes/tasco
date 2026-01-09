import { handleListEntities, handleCreateEntity } from "@tasco/api";
import type { CreateEntityInput } from "@tasco/db/entities";

// Enable Next.js revalidation
export const revalidate = 60;

// App-specific seed data
const SEED_ENTITIES: CreateEntityInput[] = [
  {
    id: "tasco-group",
    name: "Tasco Group Holdings",
    shortName: "Tasco Group",
    type: "parent",
    metadata: {
      location: "Hanoi, Vietnam",
      employeeCount: 15000,
      industry: "Conglomerate",
    },
  },
  {
    id: "tasco-insurance",
    name: "Tasco Insurance JSC",
    shortName: "Tasco Insurance",
    type: "holding",
    parentId: "tasco-group",
    metadata: {
      location: "Hanoi, Vietnam",
      employeeCount: 1800,
      industry: "Insurance",
    },
  },
  {
    id: "tasco-life",
    name: "Tasco Life Insurance",
    shortName: "Tasco Life",
    type: "subsidiary",
    parentId: "tasco-insurance",
    metadata: {
      location: "Hanoi, Vietnam",
      employeeCount: 650,
      industry: "Life Insurance",
    },
  },
  {
    id: "tasco-general",
    name: "Tasco General Insurance",
    shortName: "Tasco General",
    type: "subsidiary",
    parentId: "tasco-insurance",
    metadata: {
      location: "Hanoi, Vietnam",
      employeeCount: 480,
      industry: "General Insurance",
    },
  },
  {
    id: "tasco-auto",
    name: "Tasco Auto JSC",
    shortName: "Tasco Auto",
    type: "subsidiary",
    parentId: "tasco-group",
    metadata: {
      location: "Hanoi, Vietnam",
      employeeCount: 1200,
      industry: "Automotive",
    },
  },
  {
    id: "inochi",
    name: "Inochi Vietnam JSC",
    shortName: "Inochi",
    type: "subsidiary",
    parentId: "tasco-group",
    metadata: {
      location: "Tan Phu, Vietnam",
      employeeCount: 950,
      industry: "Consumer Goods",
    },
  },
  {
    id: "thang-long",
    name: "Thang Long Materials JSC",
    shortName: "Thang Long",
    type: "subsidiary",
    parentId: "tasco-group",
    metadata: {
      location: "Hanoi, Vietnam",
      employeeCount: 420,
      industry: "Construction Materials",
    },
  },
  {
    id: "dnp-water",
    name: "DNP Water JSC",
    shortName: "DNP Water",
    type: "subsidiary",
    parentId: "tasco-group",
    metadata: {
      location: "Hanoi, Vietnam",
      employeeCount: 850,
      industry: "Water Treatment",
    },
  },
];

export async function GET() {
  return handleListEntities({ seedData: SEED_ENTITIES, cacheDuration: 60 });
}

export async function POST(request: Request) {
  return handleCreateEntity(request);
}
