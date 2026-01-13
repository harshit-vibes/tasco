/**
 * Tour configuration registry.
 * Exports all app tours and provides getter functions.
 */

import type { AppTours, TourConfig } from "./types";
import { complianceQATours } from "./compliance-qa";
import { customerLifecycleTours } from "./customer-lifecycle";
import { salesPricingTours } from "./sales-pricing";
import { eLearningTours } from "./e-learning";
import { riskRadarTours } from "./risk-radar";
import { salesOrderTours } from "./sales-order";
import { dataSyncTours } from "./data-sync";
import { promotionControlTours } from "./promotion-control";

/**
 * All tours organized by app ID
 */
const ALL_TOURS: Record<string, AppTours> = {
  "compliance-qa": complianceQATours,
  "customer-lifecycle": customerLifecycleTours,
  "sales-pricing": salesPricingTours,
  "e-learning": eLearningTours,
  "risk-radar": riskRadarTours,
  "sales-order": salesOrderTours,
  "data-sync": dataSyncTours,
  "promotion-control": promotionControlTours,
};

/**
 * Get a specific tour configuration
 */
export function getTourConfig(appId: string, tourId: string): TourConfig | undefined {
  const appTours = ALL_TOURS[appId];
  if (!appTours) return undefined;
  return appTours[tourId];
}

/**
 * Get all tours for an app
 */
export function getAppTours(appId: string): AppTours | undefined {
  return ALL_TOURS[appId];
}

/**
 * Get all tour configurations across all apps
 */
export function getAllTourConfigs(): Record<string, AppTours> {
  return ALL_TOURS;
}

/**
 * Check if an app has a specific tour
 */
export function hasTour(appId: string, tourId: string): boolean {
  return !!getTourConfig(appId, tourId);
}

// Re-export types
export type { TourConfig, TourStep, TourButton, AppTours } from "./types";
