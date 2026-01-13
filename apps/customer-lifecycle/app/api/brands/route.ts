import { NextResponse } from "next/server";
import { listEntitiesByCategory } from "@tasco/db";

/**
 * GET /api/brands
 * Fetch all automotive brands from entities table
 *
 * Returns brands with their metadata (colors, models, etc.)
 */
export async function GET() {
  try {
    const brands = await listEntitiesByCategory("automotive-brand");

    // Transform to a more usable format
    const formattedBrands = brands.map((brand) => {
      const metadata = brand.metadata as Record<string, unknown> || {};

      return {
        id: brand.id,
        name: brand.name,
        shortName: brand.shortName || brand.name,
        // Styling
        colorTheme: metadata.colorTheme || "gray",
        colorClass: metadata.colorClass || "text-gray-500",
        bgClass: metadata.bgClass || "bg-gray-500/10",
        gradientClass: metadata.gradientClass || "from-gray-500/15 to-gray-600/5",
        borderClass: metadata.borderClass || "border-gray-500/30",
        accentClass: metadata.accentClass || "bg-gray-500",
        // Data
        country: metadata.country,
        vinPrefix: metadata.vinPrefix,
        models: metadata.models || [],
        description: metadata.description,
      };
    });

    // Sort by name for consistent ordering
    formattedBrands.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      brands: formattedBrands,
      count: formattedBrands.length,
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}
