/**
 * Tour configurations for AI E-Learning Factory app
 */

import type { AppTours } from "./types";
import { BUTTONS, createWelcomeStep, createFinalStep } from "./base";

export const eLearningTours: AppTours = {
  onboarding: {
    id: "onboarding",
    name: "Getting Started with E-Learning Factory",
    steps: [
      createWelcomeStep(
        "AI E-Learning Factory",
        "Create engaging training courses with AI-powered content generation."
      ),
      {
        id: "courses",
        title: "Course Library",
        text: "Browse and manage all your training courses here. Filter by category, status, or difficulty level.",
        attachTo: { element: "[data-tour='courses']", on: "bottom" },
        buttons: [BUTTONS.back, BUTTONS.next],
      },
      {
        id: "create-course",
        title: "Create New Course",
        text: "Start building a new course with our AI-powered wizard. Describe your topic and let AI generate the structure.",
        attachTo: { element: "[data-tour='create-course']", on: "bottom" },
        buttons: [BUTTONS.back, BUTTONS.next],
      },
      {
        id: "ai-content",
        title: "AI Content Generation",
        text: "Our AI generates lesson content, quizzes, and assessments based on your requirements. Review and customize as needed.",
        attachTo: { element: "[data-tour='ai-content']", on: "left" },
        buttons: [BUTTONS.back, BUTTONS.next],
      },
      {
        id: "progress-tracking",
        title: "Progress Tracking",
        text: "Monitor learner progress and completion rates. View analytics and identify areas for improvement.",
        attachTo: { element: "[data-tour='progress']", on: "right" },
        buttons: [BUTTONS.back, BUTTONS.next],
      },
      createFinalStep(),
    ],
  },
};
