/**
 * @tasco/tours - Interactive guided tours for Tasco apps.
 *
 * Provides ShepherdJS-based tours with auto-start for first-time users
 * and manual replay functionality.
 *
 * @example
 * ```tsx
 * // In app layout
 * import { TourProvider } from "@tasco/tours";
 * import "@tasco/tours/styles/shepherd.css";
 *
 * <TourProvider appId="compliance-qa">
 *   <AppShell>{children}</AppShell>
 * </TourProvider>
 *
 * // In app header
 * import { TourTrigger } from "@tasco/tours";
 *
 * <TourTrigger tourId="onboarding" />
 * ```
 */

// Provider & Hook
export { TourProvider, useTour } from "./provider";

// Components
export { TourTrigger } from "./components/tour-trigger";

// Tour configs (for extending/customizing)
export {
  getTourConfig,
  getAppTours,
  getAllTourConfigs,
  hasTour,
} from "./tours";

// Storage utilities
export {
  hasSeenTour,
  markTourAsSeen,
  resetTour,
  resetAllTours,
} from "./utils/storage";

// Types
export type {
  TourConfig,
  TourStep,
  TourButton,
  AppTours,
} from "./tours/types";
