/**
 * Tour configurations for Compliance AI (compliance-qa) app
 */

import type { AppTours } from "./types";
import { BUTTONS, createChatHistoryStep } from "./base";

export const complianceQATours: AppTours = {
  onboarding: {
    id: "onboarding",
    name: "Getting Started with Compliance AI",
    steps: [
      {
        id: "welcome",
        title: "Welcome to Compliance AI",
        text: "Your AI-powered assistant for navigating compliance documents and regulatory questions. Let's take a quick tour!",
        attachTo: { element: "[data-tour='welcome']", on: "right" },
        buttons: [BUTTONS.skip, BUTTONS.start],
      },
      {
        id: "knowledge-base",
        title: "Document Knowledge Base",
        text: "Access your organization's compliance documents, policies, and regulatory guidelines. The AI searches these to answer your questions.",
        attachTo: { element: "[data-tour='knowledge-base']", on: "right" },
        buttons: [BUTTONS.back, BUTTONS.next],
      },
      {
        id: "chat-input",
        title: "Ask Compliance Questions",
        text: "Type your compliance question here. For example: 'What are the data retention policies?' or 'How do we handle GDPR requests?'",
        attachTo: { element: "[data-tour='chat-input']", on: "top" },
        buttons: [BUTTONS.back, BUTTONS.next],
      },
      createChatHistoryStep({
        text: "Your previous conversations are saved here. Click any conversation to continue where you left off.",
      }),
      {
        id: "complete",
        title: "You're All Set!",
        text: "You've completed the tour. Click the play button in the header anytime to replay it. Happy exploring!",
        attachTo: { element: "[data-tour='welcome']", on: "right" },
        buttons: [BUTTONS.done],
      },
    ],
  },
};
