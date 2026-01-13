/**
 * Shared step templates and utilities for tour configurations.
 */

import type { TourButton, TourStep } from "./types";

/**
 * Standard button configurations
 */
export const BUTTONS = {
  skip: { text: "Skip", action: "cancel" } as TourButton,
  next: { text: "Next", action: "next" } as TourButton,
  back: { text: "Back", action: "back" } as TourButton,
  done: { text: "Done", action: "complete" } as TourButton,
  start: { text: "Start Tour", action: "next" } as TourButton,
  letsGo: { text: "Let's Go!", action: "next" } as TourButton,
};

/**
 * Create a welcome step
 */
export function createWelcomeStep(
  appName: string,
  description: string,
  options?: Partial<TourStep>
): TourStep {
  return {
    id: "welcome",
    title: `Welcome to ${appName}`,
    text: `${description} Let's take a quick tour!`,
    attachTo: { element: "header", on: "bottom" },
    buttons: [BUTTONS.skip, BUTTONS.start],
    ...options,
  };
}

/**
 * Create a final "done" step
 */
export function createFinalStep(options?: Partial<TourStep>): TourStep {
  return {
    id: "complete",
    title: "You're All Set!",
    text: "You've completed the tour. You can always replay it from the help menu. Happy exploring!",
    attachTo: { element: "header", on: "bottom" },
    buttons: [BUTTONS.done],
    ...options,
  };
}

/**
 * Common step for entity selector
 */
export function createEntitySelectorStep(options?: Partial<TourStep>): TourStep {
  return {
    id: "entity-selector",
    title: "Select Your Entity",
    text: "Choose which Tasco subsidiary you're working with. Your queries and data will be scoped to this entity.",
    attachTo: { element: "[data-tour='entity-selector']", on: "bottom" },
    buttons: [BUTTONS.back, BUTTONS.next],
    ...options,
  };
}

/**
 * Common step for chat input
 */
export function createChatInputStep(options?: Partial<TourStep>): TourStep {
  return {
    id: "chat-input",
    title: "Ask Questions",
    text: "Type your question here. The AI assistant will help you find answers from your knowledge base.",
    attachTo: { element: "[data-tour='chat-input']", on: "top" },
    buttons: [BUTTONS.back, BUTTONS.next],
    ...options,
  };
}

/**
 * Common step for chat history/sidebar
 */
export function createChatHistoryStep(options?: Partial<TourStep>): TourStep {
  return {
    id: "chat-history",
    title: "Conversation History",
    text: "All your previous conversations are saved here. Click any conversation to continue where you left off.",
    attachTo: { element: "[data-tour='chat-history']", on: "right" },
    buttons: [BUTTONS.back, BUTTONS.next],
    ...options,
  };
}
