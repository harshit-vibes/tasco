"use client";

import { useState, useEffect } from "react";
import { Button } from "@tasco/ui";
import {
  X,
  ArrowRight,
  ArrowLeft,
  LayoutDashboard,
  AlertCircle,
  Database,
  MessageSquare,
  Sparkles,
  CheckCircle,
} from "@tasco/ui/icons";
import { useTranslation } from "@tasco/i18n";

interface GuideStep {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
  target?: string;
}

const GUIDE_STEPS: GuideStep[] = [
  {
    id: "welcome",
    titleKey: "guide.welcome.title",
    descriptionKey: "guide.welcome.description",
    icon: <Sparkles className="h-8 w-8" />,
  },
  {
    id: "dashboard",
    titleKey: "guide.dashboard.title",
    descriptionKey: "guide.dashboard.description",
    icon: <LayoutDashboard className="h-8 w-8" />,
    target: "/",
  },
  {
    id: "alerts",
    titleKey: "guide.alerts.title",
    descriptionKey: "guide.alerts.description",
    icon: <AlertCircle className="h-8 w-8" />,
    target: "/alerts",
  },
  {
    id: "systems",
    titleKey: "guide.systems.title",
    descriptionKey: "guide.systems.description",
    icon: <Database className="h-8 w-8" />,
    target: "/systems",
  },
  {
    id: "chat",
    titleKey: "guide.chat.title",
    descriptionKey: "guide.chat.description",
    icon: <MessageSquare className="h-8 w-8" />,
    target: "/chat",
  },
  {
    id: "complete",
    titleKey: "guide.complete.title",
    descriptionKey: "guide.complete.description",
    icon: <CheckCircle className="h-8 w-8" />,
  },
];

interface OnboardingGuideProps {
  onClose: () => void;
  isOpen: boolean;
}

export function OnboardingGuide({ onClose, isOpen }: OnboardingGuideProps) {
  const { t } = useTranslation("app");
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const step = GUIDE_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === GUIDE_STEPS.length - 1;
  const progress = ((currentStep + 1) / GUIDE_STEPS.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
      return;
    }
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
      setIsAnimating(false);
    }, 150);
  };

  const handlePrev = () => {
    if (isFirstStep) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((prev) => prev - 1);
      setIsAnimating(false);
    }, 150);
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Guide Card */}
      <div
        className={`
          relative z-10 w-full max-w-lg mx-4
          ds-card p-0 overflow-hidden
          transition-all duration-300
          ${isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"}
        `}
      >
        {/* Progress bar */}
        <div className="ds-progress">
          <div
            className="ds-progress-fill transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4 text-[hsl(var(--ds-text-secondary))]" />
        </button>

        {/* Content */}
        <div className="p-8 pt-10">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {GUIDE_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`
                  h-1.5 rounded-full transition-all duration-300
                  ${idx === currentStep ? "w-8 bg-[hsl(var(--ds-flow-primary))]" : "w-1.5 bg-[hsl(var(--ds-border))]"}
                `}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="mb-6">
            <div className="inline-flex p-4 rounded-2xl bg-[hsl(var(--ds-flow-primary))]/10 text-[hsl(var(--ds-flow-primary))]">
              {step.icon}
            </div>
          </div>

          {/* Text */}
          <h2 className="text-2xl font-semibold mb-3 text-[hsl(var(--ds-text-primary))]">
            {t(step.titleKey, step.titleKey.split(".").pop())}
          </h2>
          <p className="text-[hsl(var(--ds-text-secondary))] leading-relaxed mb-8">
            {t(step.descriptionKey, step.descriptionKey.split(".").pop())}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div>
              {!isFirstStep && (
                <Button
                  variant="ghost"
                  onClick={handlePrev}
                  className="gap-2 text-[hsl(var(--ds-text-secondary))] hover:text-[hsl(var(--ds-text-primary))]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("guide.back", "Back")}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {!isLastStep && (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-[hsl(var(--ds-text-secondary))]"
                >
                  {t("guide.skip", "Skip")}
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="ds-btn-glow gap-2 px-6"
              >
                {isLastStep ? t("guide.getStarted", "Get Started") : t("guide.next", "Next")}
                {!isLastStep && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-[hsl(var(--ds-flow-primary))]/5 blur-3xl" />
        <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-[hsl(var(--ds-flow-info))]/5 blur-3xl" />
      </div>
    </div>
  );
}

// Hook to manage onboarding state
export function useOnboarding() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeenGuide, setHasSeenGuide] = useState(true);

  useEffect(() => {
    const seen = localStorage.getItem("data-sync-guide-seen");
    if (!seen) {
      setHasSeenGuide(false);
      setIsOpen(true);
    }
  }, []);

  const closeGuide = () => {
    setIsOpen(false);
    localStorage.setItem("data-sync-guide-seen", "true");
  };

  const openGuide = () => {
    setIsOpen(true);
  };

  const resetGuide = () => {
    localStorage.removeItem("data-sync-guide-seen");
    setHasSeenGuide(false);
    setIsOpen(true);
  };

  return {
    isOpen,
    hasSeenGuide,
    openGuide,
    closeGuide,
    resetGuide,
  };
}
