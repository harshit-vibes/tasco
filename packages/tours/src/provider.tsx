"use client";

/**
 * TourProvider - Context provider for ShepherdJS tours.
 * Manages tour state and provides methods to start/end tours.
 */

import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";
import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { getTourConfig } from "./tours";
import { hasSeenTour, markTourAsSeen } from "./utils/storage";

interface TourContextType {
  /** Whether a tour is currently active */
  isActive: boolean;
  /** ID of the currently running tour, or null */
  currentTourId: string | null;
  /** Start a tour by ID */
  startTour: (tourId: string) => void;
  /** End the current tour */
  endTour: () => void;
  /** Check if a tour has been seen/completed */
  hasSeenTour: (tourId: string) => boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

interface TourProviderProps {
  /** The app ID (e.g., "compliance-qa") */
  appId: string;
  /** Child components */
  children: ReactNode;
  /** Whether to auto-start the onboarding tour for first-time users */
  autoStart?: boolean;
  /** Delay in ms before auto-starting tour (default: 800) */
  autoStartDelay?: number;
}

export function TourProvider({
  appId,
  children,
  autoStart = true,
  autoStartDelay = 800,
}: TourProviderProps) {
  const [tour, setTour] = useState<InstanceType<typeof Shepherd.Tour> | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentTourId, setCurrentTourId] = useState<string | null>(null);

  const startTour = useCallback(
    (tourId: string) => {
      // Cancel any existing tour
      if (tour) {
        tour.cancel();
      }

      const config = getTourConfig(appId, tourId);
      if (!config) {
        console.warn(`Tour "${tourId}" not found for app "${appId}"`);
        return;
      }

      const newTour = new Shepherd.Tour({
        useModalOverlay: true,
        defaultStepOptions: {
          cancelIcon: { enabled: true },
          classes: "shepherd-theme-tasco",
          scrollTo: { behavior: "smooth", block: "center" },
        },
      });

      // Filter steps to only include those with existing DOM elements
      const validSteps = config.steps.filter((step) => {
        const element = document.querySelector(step.attachTo.element);
        if (!element) {
          console.warn(`Tour step "${step.id}" skipped: element not found [${step.attachTo.element}]`);
          return false;
        }
        return true;
      });

      if (validSteps.length === 0) {
        console.warn(`No valid steps found for tour "${tourId}" - all elements missing`);
        return;
      }

      validSteps.forEach((step, index) => {
        // Determine correct buttons based on position in filtered steps
        const isFirst = index === 0;
        const isLast = index === validSteps.length - 1;

        newTour.addStep({
          id: step.id,
          title: step.title,
          text: step.text,
          attachTo: step.attachTo,
          scrollTo: step.scrollTo !== false,
          buttons: step.buttons?.map((btn) => ({
            text: btn.text,
            classes: btn.classes || (btn.action === "next" || btn.action === "complete" ? "shepherd-button-primary" : "shepherd-button-secondary"),
            action: function () {
              if (btn.action === "next") newTour.next();
              else if (btn.action === "back") newTour.back();
              else if (btn.action === "cancel") newTour.cancel();
              else if (btn.action === "complete") newTour.complete();
            },
          })),
          beforeShowPromise: step.beforeShowPromise,
        });
      });

      newTour.on("complete", () => {
        markTourAsSeen(appId, tourId);
        setIsActive(false);
        setCurrentTourId(null);
        setTour(null);
      });

      newTour.on("cancel", () => {
        markTourAsSeen(appId, tourId);
        setIsActive(false);
        setCurrentTourId(null);
        setTour(null);
      });

      setTour(newTour);
      setCurrentTourId(tourId);
      setIsActive(true);
      newTour.start();
    },
    [appId, tour]
  );

  // Auto-start onboarding tour for first-time users
  useEffect(() => {
    if (autoStart && !hasSeenTour(appId, "onboarding")) {
      // Delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startTour("onboarding");
      }, autoStartDelay);
      return () => clearTimeout(timer);
    }
  }, [appId, autoStart, autoStartDelay, startTour]);

  const endTour = useCallback(() => {
    tour?.cancel();
  }, [tour]);

  const checkHasSeenTour = useCallback(
    (tourId: string) => hasSeenTour(appId, tourId),
    [appId]
  );

  return (
    <TourContext.Provider
      value={{
        isActive,
        currentTourId,
        startTour,
        endTour,
        hasSeenTour: checkHasSeenTour,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

/**
 * Hook to access tour functionality
 */
export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
}
