/**
 * Tour configurations for Promotion Overlap Control app
 */

import type { AppTours } from "./types";
import { BUTTONS, createWelcomeStep, createEntitySelectorStep, createFinalStep } from "./base";

export const promotionControlTours: AppTours = {
  onboarding: {
    id: "onboarding",
    name: "Getting Started with Promotion Control",
    steps: [
      createWelcomeStep(
        "Promotion Overlap Control",
        "Manage promotions and prevent conflicts with AI-powered overlap detection."
      ),
      createEntitySelectorStep({
        text: "Select your Inochi entity to manage promotions for that business unit.",
      }),
      {
        id: "promotions",
        title: "Active Promotions",
        text: "View all current and upcoming promotions. The timeline shows when each promotion is active.",
        attachTo: { element: "[data-tour='promotions']", on: "bottom" },
        buttons: [BUTTONS.back, BUTTONS.next],
      },
      {
        id: "conflicts",
        title: "Conflict Detection",
        text: "AI automatically detects overlapping promotions that could cause pricing conflicts or margin issues.",
        attachTo: { element: "[data-tour='conflicts']", on: "left" },
        buttons: [BUTTONS.back, BUTTONS.next],
      },
      {
        id: "create-promotion",
        title: "Create Promotion",
        text: "Set up new promotions with target products, discount rules, and date ranges. AI validates before saving.",
        attachTo: { element: "[data-tour='create-promotion']", on: "right" },
        buttons: [BUTTONS.back, BUTTONS.next],
      },
      {
        id: "analytics",
        title: "Promotion Analytics",
        text: "Track promotion performance: redemption rates, revenue impact, and customer engagement metrics.",
        attachTo: { element: "[data-tour='analytics']", on: "bottom" },
        buttons: [BUTTONS.back, BUTTONS.next],
      },
      createFinalStep(),
    ],
  },
};
