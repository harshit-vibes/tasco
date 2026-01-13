/**
 * Debug endpoint to check environment variables at runtime
 * DELETE THIS AFTER DEBUGGING
 */
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    hasEnvVars: {
      TASCO_AWS_REGION: !!process.env.TASCO_AWS_REGION,
      TASCO_AWS_ACCESS_KEY_ID: !!process.env.TASCO_AWS_ACCESS_KEY_ID,
      TASCO_AWS_SECRET_ACCESS_KEY: !!process.env.TASCO_AWS_SECRET_ACCESS_KEY,
      AWS_REGION: !!process.env.AWS_REGION,
      AWS_ACCESS_KEY_ID: !!process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: !!process.env.AWS_SECRET_ACCESS_KEY,
      NEXT_PUBLIC_AWS_REGION: !!process.env.NEXT_PUBLIC_AWS_REGION,
      NEXT_PUBLIC_AWS_ACCESS_KEY_ID: !!process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
      NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY: !!process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
    },
    partialValues: {
      TASCO_AWS_REGION: process.env.TASCO_AWS_REGION?.slice(0, 5) || "(empty)",
      TASCO_AWS_ACCESS_KEY_ID: process.env.TASCO_AWS_ACCESS_KEY_ID?.slice(0, 8) || "(empty)",
      NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION?.slice(0, 5) || "(empty)",
      NEXT_PUBLIC_AWS_ACCESS_KEY_ID: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID?.slice(0, 8) || "(empty)",
    },
  });
}
