/**
 * Tour configurations for AI Sales & Pricing Cockpit app
 */

import type { AppTours } from "./types";
import { BUTTONS, createWelcomeStep, createEntitySelectorStep, createChatInputStep, createFinalStep } from "./base";

export const salesPricingTours: AppTours = {
  onboarding: {
    id: "onboarding",
    name: "Getting Started with Sales & Pricing",
    steps: [
      createWelcomeStep(
        "AI Sales & Pricing Cockpit",
        "Generate accurate insurance quotes and pricing with AI-powered risk assessment."
      ),
      createEntitySelectorStep({
        text: "Select the Tasco Insurance branch you're working with. Pricing rules and products may vary by entity.",
      }),
      {
        id: "new-quote",
        title: "Create New Quote",
        text: "Start a new insurance quote here. The AI will guide you through the process and calculate optimal pricing.",
        attachTo: { element: "[data-tour='new-quote']", on: "bottom" },
        buttons: [BUTTONS.back, BUTTONS.next],
      },
      {
        id: "pricing-factors",
        title: "Pricing Factors",
        text: "View the factors that influence pricing: risk assessment, customer history, market conditions, and more.",
        attachTo: { element: "[data-tour='pricing-factors']", on: "left" },
        buttons: [BUTTONS.back, BUTTONS.next],
      },
      createChatInputStep({
        text: "Ask pricing questions or request quote adjustments. For example: 'What if we add comprehensive coverage?' or 'Show me similar policies'.",
      }),
      {
        id: "quote-history",
        title: "Quote History",
        text: "Access all your previous quotes here. Compare options and track conversion rates.",
        attachTo: { element: "[data-tour='quote-history']", on: "right" },
        buttons: [BUTTONS.back, BUTTONS.next],
      },
      createFinalStep(),
    ],
  },
};
