/**
 * Tour configurations for Customer Lifecycle Management app
 */

import type { AppTours } from "./types";
import { BUTTONS, createWelcomeStep, createEntitySelectorStep, createFinalStep } from "./base";

export const customerLifecycleTours: AppTours = {
  onboarding: {
    id: "onboarding",
    name: "Getting Started with Customer Lifecycle",
    steps: [
      createWelcomeStep(
        "Customer Lifecycle",
        "Manage your leads, customers, and campaigns with AI-powered insights."
      ),
      createEntitySelectorStep({
        text: "Select your Tasco subsidiary to view and manage customers specific to that entity.",
      }),
      {
        id: "leads",
        title: "Lead Management",
        text: "View and manage your sales leads here. Track their status, priority, and conversion progress.",
        attachTo: { element: "[data-tour='leads']", on: "bottom" },
        buttons: [BUTTONS.back, BUTTONS.next],
      },
      {
        id: "customers",
        title: "Customer Database",
        text: "Access your customer database. View purchase history, interactions, and AI-generated recommendations.",
        attachTo: { element: "[data-tour='customers']", on: "bottom" },
        buttons: [BUTTONS.back, BUTTONS.next],
      },
      {
        id: "campaigns",
        title: "Campaign Management",
        text: "Create and manage marketing campaigns. The AI suggests optimal targeting based on customer segments.",
        attachTo: { element: "[data-tour='campaigns']", on: "bottom" },
        buttons: [BUTTONS.back, BUTTONS.next],
      },
      {
        id: "ai-recommendations",
        title: "AI Recommendations",
        text: "Get AI-powered suggestions for upselling, cross-selling, and customer retention strategies.",
        attachTo: { element: "[data-tour='ai-recommendations']", on: "left" },
        buttons: [BUTTONS.back, BUTTONS.next],
      },
      createFinalStep(),
    ],
  },
};
