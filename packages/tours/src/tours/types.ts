/**
 * Tour step configuration
 */
export interface TourStep {
  /** Unique identifier for the step */
  id: string;
  /** Title displayed in the step header */
  title: string;
  /** Content text (supports HTML) */
  text: string;
  /** Element to attach the step to */
  attachTo: {
    /** CSS selector for the target element */
    element: string;
    /** Position relative to the element */
    on: "top" | "bottom" | "left" | "right" | "top-start" | "top-end" | "bottom-start" | "bottom-end";
  };
  /** Navigation buttons for this step */
  buttons?: TourButton[];
  /** Optional promise to wait for before showing the step */
  beforeShowPromise?: () => Promise<void>;
  /** Whether to scroll to the element */
  scrollTo?: boolean;
}

/**
 * Button configuration for tour steps
 */
export interface TourButton {
  /** Button label */
  text: string;
  /** Action to perform when clicked */
  action: "next" | "back" | "cancel" | "complete";
  /** Additional CSS classes */
  classes?: string;
}

/**
 * Complete tour configuration
 */
export interface TourConfig {
  /** Unique identifier for the tour */
  id: string;
  /** Display name for the tour */
  name: string;
  /** Ordered list of steps */
  steps: TourStep[];
}

/**
 * All tours for an app, keyed by tour ID
 */
export type AppTours = Record<string, TourConfig>;
