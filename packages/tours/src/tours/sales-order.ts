/**
 * Tour configurations for Order Data Entry Automation app
 */

import type { AppTours } from "./types";
import { BUTTONS, createWelcomeStep, createEntitySelectorStep, createFinalStep } from "./base";

export const salesOrderTours: AppTours = {
  onboarding: {
    id: "onboarding",
    name: "Getting Started with Order Automation",
    steps: [
      createWelcomeStep(
        "Order Data Entry Automation",
        "Automate order processing with AI-powered OCR and data extraction."
      ),
      createEntitySelectorStep({
        text: "Select your Inochi entity to manage orders for that business unit.",
      }),
      {
        id: "upload",
        title: "Upload Orders",
        text: "Upload order documents (PDFs, images, emails) here. The AI will automatically extract order details.",
        attachTo: { element: "[data-tour='upload']", on: "bottom" },
        buttons: [BUTTONS.back, BUTTONS.next],
      },
      {
        id: "extraction",
        title: "AI Extraction",
        text: "Review the AI-extracted data. The system highlights confidence levels and flags items that need verification.",
        attachTo: { element: "[data-tour='extraction']", on: "left" },
        buttons: [BUTTONS.back, BUTTONS.next],
      },
      {
        id: "validation",
        title: "Validation Queue",
        text: "Orders requiring human review appear here. Quickly approve, correct, or reject extracted data.",
        attachTo: { element: "[data-tour='validation']", on: "right" },
        buttons: [BUTTONS.back, BUTTONS.next],
      },
      {
        id: "metrics",
        title: "Processing Metrics",
        text: "Track automation performance: processing time, accuracy rates, and time saved versus manual entry.",
        attachTo: { element: "[data-tour='metrics']", on: "bottom" },
        buttons: [BUTTONS.back, BUTTONS.next],
      },
      createFinalStep(),
    ],
  },
};
