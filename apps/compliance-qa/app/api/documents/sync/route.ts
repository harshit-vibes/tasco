import { createSyncHandler, getSyncConfigFromEnv } from "@tasco/api";

// Force dynamic rendering - no caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Document sync handlers using the factory pattern
 * Configuration is read from environment variables:
 * - LYZR_KB_ID / NEXT_PUBLIC_LYZR_KB_ID
 * - LYZR_API_KEY / NEXT_PUBLIC_LYZR_API_KEY
 * - RAG_BASE_URL / NEXT_PUBLIC_RAG_BASE_URL
 */
const config = getSyncConfigFromEnv();

export const { GET, POST } = createSyncHandler(config);
