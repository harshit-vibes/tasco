/**
 * Tour configurations for Sales & Revenue Data Sync app
 */

import type { AppTours } from "./types";
import { BUTTONS, createWelcomeStep, createFinalStep } from "./base";

export const dataSyncTours: AppTours = {
  onboarding: {
    id: "onboarding",
    name: "Getting Started with Data Sync",
    steps: [
      createWelcomeStep(
        "Sales & Revenue Data Sync",
        "Keep your sales and revenue data synchronized across all systems in real-time."
      ),
      {
        id: "dashboard",
        title: "Sync Dashboard",
        text: "Monitor the health of all your data connections. Green means synced, yellow means delayed, red means errors.",
        attachTo: { element: "[data-tour='dashboard']", on: "bottom" },
        buttons: [BUTTONS.back, BUTTONS.next],
      },
      {
        id: "systems",
        title: "Connected Systems",
        text: "View all connected data sources and destinations. Add new connections or modify existing ones.",
        attachTo: { element: "[data-tour='systems']", on: "right" },
        buttons: [BUTTONS.back, BUTTONS.next],
      },
      {
        id: "alerts",
        title: "Sync Alerts",
        text: "Get notified of sync failures, data discrepancies, or unusual patterns. AI helps identify root causes.",
        attachTo: { element: "[data-tour='alerts']", on: "left" },
        buttons: [BUTTONS.back, BUTTONS.next],
      },
      {
        id: "sync-now",
        title: "Manual Sync",
        text: "Trigger an immediate sync when needed. Useful for urgent data updates or after fixing issues.",
        attachTo: { element: "[data-tour='sync-now']", on: "bottom" },
        buttons: [BUTTONS.back, BUTTONS.next],
      },
      createFinalStep(),
    ],
  },
};
