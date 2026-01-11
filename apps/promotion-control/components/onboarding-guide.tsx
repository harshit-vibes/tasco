"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button, Card } from "@tasco/ui";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Calendar,
  List,
  AlertTriangle,
  BarChart3,
  Sparkles,
  CheckCircle,
  Lightbulb,
} from "@tasco/ui/icons";
import { useTranslation } from "@tasco/i18n";

interface GuideStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string; // CSS selector to highlight
  position?: "center" | "top" | "bottom" | "left" | "right";
  tip?: string;
}

interface OnboardingGuideProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

const STORAGE_KEY = "inochi-onboarding-completed";

export function OnboardingGuide({ onComplete, forceShow }: OnboardingGuideProps) {
  const { t } = useTranslation("app");
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  const steps: GuideStep[] = [
    {
      id: "welcome",
      title: t("guide.welcome.title", "Welcome to Promotion Control"),
      description: t(
        "guide.welcome.description",
        "This AI-powered system helps you manage promotions without conflicts. Let's take a quick tour of the key features."
      ),
      icon: <Sparkles className="h-8 w-8 text-amber-500" />,
      position: "center",
      tip: t("guide.welcome.tip", "This tour takes about 2 minutes"),
    },
    {
      id: "calendar",
      title: t("guide.calendar.title", "Promotion Calendar"),
      description: t(
        "guide.calendar.description",
        "View all your promotions on a timeline. See what's active now, upcoming, and identify potential overlap periods at a glance."
      ),
      icon: <Calendar className="h-8 w-8 text-primary" />,
      position: "center",
      tip: t("guide.calendar.tip", "The calendar is your mission control for all promotions"),
    },
    {
      id: "promotions",
      title: t("guide.promotions.title", "Manage Promotions"),
      description: t(
        "guide.promotions.description",
        "Create, edit, and organize all your promotions. Set target segments, channels, dates, and discount rules."
      ),
      icon: <List className="h-8 w-8 text-blue-500" />,
      position: "center",
      tip: t("guide.promotions.tip", "Use filters to quickly find specific promotions"),
    },
    {
      id: "alerts",
      title: t("guide.alerts.title", "Conflict Detection"),
      description: t(
        "guide.alerts.description",
        "AI automatically detects conflicts like time overlaps, segment clashes, and stacking violations. Critical issues are highlighted for immediate attention."
      ),
      icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
      position: "center",
      tip: t("guide.alerts.tip", "Check alerts regularly to prevent revenue loss"),
    },
    {
      id: "analytics",
      title: t("guide.analytics.title", "Analytics Dashboard"),
      description: t(
        "guide.analytics.description",
        "Track promotion performance, see distributions by status, type, and segment. Make data-driven decisions about your promotion strategy."
      ),
      icon: <BarChart3 className="h-8 w-8 text-emerald-500" />,
      position: "center",
      tip: t("guide.analytics.tip", "Use analytics to optimize your promotion mix"),
    },
    {
      id: "complete",
      title: t("guide.complete.title", "You're All Set!"),
      description: t(
        "guide.complete.description",
        "You now know the basics. Start by exploring the calendar or create your first promotion. Need help? Click the help icon anytime."
      ),
      icon: <CheckCircle className="h-8 w-8 text-emerald-500" />,
      position: "center",
      tip: t("guide.complete.tip", "You can restart this tour from the help menu"),
    },
  ];

  useEffect(() => {
    setMounted(true);

    // Check if onboarding was completed before
    if (forceShow) {
      setIsVisible(true);
      return;
    }

    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // Small delay to let the page load first
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [forceShow]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, steps.length]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
    onComplete?.();
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;

      switch (e.key) {
        case "ArrowRight":
        case "Enter":
          if (currentStep < steps.length - 1) {
            handleNext();
          } else {
            handleComplete();
          }
          break;
        case "ArrowLeft":
          handlePrev();
          break;
        case "Escape":
          handleSkip();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, currentStep, handleNext, handlePrev, handleComplete, handleSkip, steps.length]);

  if (!mounted || !isVisible) return null;

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;

  const content = (
    <div className="guide-spotlight">
      {/* Animated background pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-amber-500/20 blur-3xl" />
      </div>

      {/* Guide Card */}
      <div className="flex h-full items-center justify-center p-4">
        <Card className="guide-tooltip relative w-full max-w-md border-0 bg-card/95 backdrop-blur-sm">
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={t("common.close", "Close")}
          >
            <X className="h-4 w-4" />
          </button>

          {/* Progress bar */}
          <div className="absolute left-0 right-0 top-0 h-1 overflow-hidden rounded-t-xl bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-amber-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-6 pt-8">
            {/* Icon */}
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-amber-500/10">
                {currentStepData.icon}
              </div>
            </div>

            {/* Title */}
            <h3 className="mb-2 text-center text-xl font-semibold">
              {currentStepData.title}
            </h3>

            {/* Description */}
            <p className="mb-4 text-center text-muted-foreground">
              {currentStepData.description}
            </p>

            {/* Tip */}
            {currentStepData.tip && (
              <div className="mb-6 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{currentStepData.tip}</span>
              </div>
            )}

            {/* Step indicators */}
            <div className="guide-progress mb-6 justify-center">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`guide-progress-dot ${index === currentStep ? "active" : ""} ${
                    index < currentStep ? "bg-primary" : ""
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                {t("guide.back", "Back")}
              </Button>

              <span className="text-sm text-muted-foreground">
                {currentStep + 1} / {steps.length}
              </span>

              {isLastStep ? (
                <Button onClick={handleComplete} className="btn-premium gap-1">
                  {t("guide.getStarted", "Get Started")}
                  <Sparkles className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleNext} className="gap-1">
                  {t("guide.next", "Next")}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Skip link */}
          {!isLastStep && (
            <div className="border-t px-6 py-3 text-center">
              <button
                onClick={handleSkip}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("guide.skipTour", "Skip tour")}
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

// Hook to trigger onboarding restart
export function useOnboardingGuide() {
  const resetOnboarding = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  const isOnboardingComplete = () => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  };

  return { resetOnboarding, isOnboardingComplete };
}
