/**
 * Tour configurations for AI Risk & Profitability Radar app
 */

import type { AppTours } from "./types";
import { BUTTONS, createWelcomeStep, createEntitySelectorStep, createFinalStep } from "./base";

export const riskRadarTours: AppTours = {
  onboarding: {
    id: "onboarding",
    name: "Getting Started with Risk Radar",
    steps: [
      createWelcomeStep(
        "AI Risk & Profitability Radar",
        "Monitor risk metrics and profitability across your insurance portfolio."
      ),
      createEntitySelectorStep({
        text: "Select the Tasco Insurance entity to view its risk dashboard and profitability metrics.",
      }),
      {
        id: "dashboard",
        title: "Risk Dashboard",
        text: "Get a bird's-eye view of your risk exposure. Key metrics, trends, and alerts are displayed here.",
        attachTo: { element: "[data-tour='dashboard']", on: "bottom" },
        buttons: [BUTTONS.back, BUTTONS.next],
      },
      {
        id: "alerts",
        title: "Risk Alerts",
        text: "AI-generated alerts notify you of unusual patterns, potential losses, or opportunities for intervention.",
        attachTo: { element: "[data-tour='alerts']", on: "left" },
        buttons: [BUTTONS.back, BUTTONS.next],
      },
      {
        id: "analysis",
        title: "Deep Analysis",
        text: "Drill down into specific risk factors. View historical trends, predictions, and recommended actions.",
        attachTo: { element: "[data-tour='analysis']", on: "right" },
        buttons: [BUTTONS.back, BUTTONS.next],
      },
      {
        id: "profitability",
        title: "Profitability Metrics",
        text: "Track profitability by product line, customer segment, or time period. Identify your most valuable portfolios.",
        attachTo: { element: "[data-tour='profitability']", on: "bottom" },
        buttons: [BUTTONS.back, BUTTONS.next],
      },
      createFinalStep(),
    ],
  },
};
