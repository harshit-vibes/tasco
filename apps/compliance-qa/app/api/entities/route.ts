/**
 * Entities API Route - Uses local MongoDB handlers
 */

import { handleListEntities } from "@/lib/handlers";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return handleListEntities();
}
