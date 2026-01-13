"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
} from "react";

/**
 * Brand model definition
 */
export interface BrandModel {
  name: string;
  variants: string[];
}

/**
 * Brand definition from database
 */
export interface Brand {
  id: string;
  name: string;
  shortName: string;
  // Styling
  colorTheme: string;
  colorClass: string;
  bgClass: string;
  gradientClass: string;
  borderClass: string;
  accentClass: string;
  // Data
  country?: string;
  vinPrefix?: string;
  models: BrandModel[];
  description?: string;
}

/**
 * Brand style configuration (for easy access in components)
 */
export interface BrandStyle {
  gradient: string;
  border: string;
  accent: string;
  text: string;
  bg: string;
}

/**
 * Brands context type
 */
interface BrandsContextType {
  /** All available brands */
  brands: Brand[];
  /** Brand IDs for filtering (e.g., ["gwm", "gac", "lotus"]) */
  brandIds: string[];
  /** Brand short names for display (e.g., ["GWM", "GAC", "Lotus"]) */
  brandNames: string[];
  /** Get brand by ID */
  getBrand: (id: string) => Brand | undefined;
  /** Get brand by short name (case-insensitive) */
  getBrandByName: (name: string) => Brand | undefined;
  /** Get brand style for a brand ID */
  getBrandStyle: (id: string) => BrandStyle;
  /** Get models for a brand */
  getModels: (brandId: string) => BrandModel[];
  /** Loading state */
  isLoading: boolean;
  /** Refresh brands from API */
  refreshBrands: () => Promise<void>;
}

// Default brand style (fallback)
const DEFAULT_BRAND_STYLE: BrandStyle = {
  gradient: "from-gray-500/15 to-gray-600/5",
  border: "border-gray-500/30",
  accent: "bg-gray-500",
  text: "text-gray-500",
  bg: "bg-gray-500/10",
};

const BrandsContext = createContext<BrandsContextType | undefined>(undefined);

export interface BrandsProviderProps {
  children: ReactNode;
}

/**
 * Provider for brands context
 * Fetches brand data from the database
 */
export function BrandsProvider({ children }: BrandsProviderProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch brands from API
  const fetchBrands = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/brands");
      if (!response.ok) {
        throw new Error("Failed to fetch brands");
      }
      const data = await response.json();

      if (data.brands && data.brands.length > 0) {
        setBrands(data.brands);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch brands on mount
  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  // Brand IDs for filtering
  const brandIds = useMemo(() => brands.map((b) => b.id), [brands]);

  // Brand short names for display
  const brandNames = useMemo(() => brands.map((b) => b.shortName), [brands]);

  // Get brand by ID
  const getBrand = useCallback(
    (id: string): Brand | undefined => {
      return brands.find((b) => b.id === id.toLowerCase());
    },
    [brands]
  );

  // Get brand by short name
  const getBrandByName = useCallback(
    (name: string): Brand | undefined => {
      const lowerName = name.toLowerCase();
      return brands.find(
        (b) =>
          b.shortName.toLowerCase() === lowerName ||
          b.name.toLowerCase() === lowerName
      );
    },
    [brands]
  );

  // Get brand style
  const getBrandStyle = useCallback(
    (id: string): BrandStyle => {
      const brand = getBrand(id) || getBrandByName(id);
      if (!brand) return DEFAULT_BRAND_STYLE;

      return {
        gradient: brand.gradientClass,
        border: brand.borderClass,
        accent: brand.accentClass,
        text: brand.colorClass,
        bg: brand.bgClass,
      };
    },
    [getBrand, getBrandByName]
  );

  // Get models for a brand
  const getModels = useCallback(
    (brandId: string): BrandModel[] => {
      const brand = getBrand(brandId) || getBrandByName(brandId);
      return brand?.models || [];
    },
    [getBrand, getBrandByName]
  );

  const value = useMemo(
    () => ({
      brands,
      brandIds,
      brandNames,
      getBrand,
      getBrandByName,
      getBrandStyle,
      getModels,
      isLoading,
      refreshBrands: fetchBrands,
    }),
    [
      brands,
      brandIds,
      brandNames,
      getBrand,
      getBrandByName,
      getBrandStyle,
      getModels,
      isLoading,
      fetchBrands,
    ]
  );

  return (
    <BrandsContext.Provider value={value}>{children}</BrandsContext.Provider>
  );
}

/**
 * Hook to access brands context
 */
export function useBrands() {
  const context = useContext(BrandsContext);
  if (context === undefined) {
    throw new Error("useBrands must be used within a BrandsProvider");
  }
  return context;
}

/**
 * Get brand style by ID or name (utility for components not in context)
 */
export function getBrandStyleStatic(brandKey: string): BrandStyle {
  // Fallback static styles when context isn't available
  const staticStyles: Record<string, BrandStyle> = {
    gwm: {
      gradient: "from-red-500/15 to-red-600/5",
      border: "border-red-500/30",
      accent: "bg-red-500",
      text: "text-red-500",
      bg: "bg-red-500/10",
    },
    gac: {
      gradient: "from-blue-500/15 to-blue-600/5",
      border: "border-blue-500/30",
      accent: "bg-blue-500",
      text: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    lotus: {
      gradient: "from-amber-500/15 to-amber-600/5",
      border: "border-amber-500/30",
      accent: "bg-amber-500",
      text: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  };

  return staticStyles[brandKey.toLowerCase()] || DEFAULT_BRAND_STYLE;
}
