"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "./dialog";
import { Button } from "./button";
import { ScrollArea } from "./scroll-area";
import {
  Sparkles,
  MessageSquare,
  Database,
  FileText,
  Search,
  Shield,
  BarChart3,
  Zap,
  Users,
  Globe,
  CheckCircle,
  Brain,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Target,
  Lightbulb,
  Layers,
  Cpu,
  Layout,
  Bot,
  BookOpen,
  ListChecks,
} from "lucide-react";
import { cn } from "../lib/utils";

// Icon mapping
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  sparkles: Sparkles,
  message: MessageSquare,
  database: Database,
  file: FileText,
  search: Search,
  shield: Shield,
  chart: BarChart3,
  zap: Zap,
  users: Users,
  globe: Globe,
  check: CheckCircle,
  brain: Brain,
  // New icons for one-pager
  target: Target,
  lightbulb: Lightbulb,
  layers: Layers,
  cpu: Cpu,
  layout: Layout,
  bot: Bot,
};

// Color mapping for icons
const ICON_COLOR_MAP: Record<string, string> = {
  primary: "text-primary",
  blue: "text-blue-600",
  green: "text-green-600",
  orange: "text-orange-600",
  purple: "text-purple-600",
  red: "text-red-600",
  cyan: "text-cyan-600",
  pink: "text-pink-600",
};

// Background gradient mapping
const BG_COLOR_MAP: Record<string, string> = {
  primary: "from-primary/20 to-violet-500/20",
  blue: "from-blue-500/20 to-cyan-500/20",
  green: "from-green-500/20 to-emerald-500/20",
  orange: "from-orange-500/20 to-amber-500/20",
  purple: "from-purple-500/20 to-pink-500/20",
  red: "from-red-500/20 to-rose-500/20",
  cyan: "from-cyan-500/20 to-teal-500/20",
  pink: "from-pink-500/20 to-fuchsia-500/20",
};

// Types
export interface GuideSlide {
  order: number;
  icon: string;
  iconColor: string;
  title: string;
  content: string;
  highlight?: string;
}

export interface OnePagerSection {
  title: string;
  icon: string;
  iconColor: string;
  content: string;
  bulletPoints?: string[];
}

export interface AppOnePager {
  problemStatement: OnePagerSection;
  lyzrSolution: OnePagerSection;
  demoCoverage: OnePagerSection;
  frontendExperience: OnePagerSection;
  backendInfra: OnePagerSection;
  agenticInfra: OnePagerSection;
  futureEnhancements?: OnePagerSection;
}

export interface AppGuide {
  id: string;
  appId: string;
  language: string;
  appName: string;
  appTagline: string;
  slides: GuideSlide[];
  onePager?: AppOnePager;
  ctaText?: string;
  enabled: boolean;
  updatedAt: string;
}

// View modes
type GuideView = "overview" | "features";

export interface GuideCarouselProps {
  guide: AppGuide;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Simple markdown renderer for basic formatting
function renderMarkdown(content: string): React.ReactNode {
  const lines = content.split("\n");

  return lines.map((line, i) => {
    // Bold text
    let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // List items
    if (processed.startsWith("- ")) {
      processed = `<li class="ml-4">${processed.slice(2)}</li>`;
    }

    // Empty lines become breaks
    if (processed.trim() === "") {
      return <br key={i} />;
    }

    return (
      <span
        key={i}
        dangerouslySetInnerHTML={{ __html: processed }}
        className="block"
      />
    );
  });
}

// One-pager section component
function OnePagerSectionCard({ section }: { section: OnePagerSection }) {
  const IconComponent = ICON_MAP[section.icon] || Sparkles;
  const iconColor = ICON_COLOR_MAP[section.iconColor] || ICON_COLOR_MAP.primary;
  const bgColor = BG_COLOR_MAP[section.iconColor] || BG_COLOR_MAP.primary;

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className={cn("h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0", bgColor)}>
          <IconComponent className={cn("h-5 w-5", iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1">{section.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {section.content}
          </p>
          {section.bulletPoints && section.bulletPoints.length > 0 && (
            <ul className="mt-2 space-y-1">
              {section.bulletPoints.map((point, idx) => (
                <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// Overview view component
function OnePagerView({
  guide,
  onViewFeatures,
  onClose
}: {
  guide: AppGuide;
  onViewFeatures: () => void;
  onClose: () => void;
}) {
  const onePager = guide.onePager;
  if (!onePager) return null;

  return (
    <>
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b bg-gradient-to-br from-primary/10 to-violet-500/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{guide.appName}</h2>
            <p className="text-sm text-muted-foreground">{guide.appTagline}</p>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <ScrollArea className="h-[400px]">
        <div className="px-6 py-4 space-y-3">
          {/* Problem & Solution */}
          <div className="space-y-3">
            <OnePagerSectionCard section={onePager.problemStatement} />
            <OnePagerSectionCard section={onePager.lyzrSolution} />
          </div>

          {/* Demo Coverage */}
          <div className="pt-2">
            <OnePagerSectionCard section={onePager.demoCoverage} />
          </div>

          {/* Technical Architecture */}
          <div className="pt-2 space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
              Technical Architecture
            </h4>
            <OnePagerSectionCard section={onePager.frontendExperience} />
            <OnePagerSectionCard section={onePager.backendInfra} />
            <OnePagerSectionCard section={onePager.agenticInfra} />
          </div>

          {/* Future Enhancements (optional) */}
          {onePager.futureEnhancements && (
            <div className="pt-2">
              <OnePagerSectionCard section={onePager.futureEnhancements} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer navigation */}
      <div className="px-6 py-4 border-t bg-muted/30">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewFeatures}
            className="gap-2"
          >
            <ListChecks className="h-4 w-4" />
            View Features
          </Button>
          <Button size="sm" onClick={onClose}>
            {guide.ctaText || "Get Started"}
          </Button>
        </div>
      </div>
    </>
  );
}

// Features carousel view component
function FeaturesView({
  guide,
  currentSlide,
  setCurrentSlide,
  onViewOverview,
  onClose,
  hasOverview,
}: {
  guide: AppGuide;
  currentSlide: number;
  setCurrentSlide: (index: number) => void;
  onViewOverview: () => void;
  onClose: () => void;
  hasOverview: boolean;
}) {
  const slides = guide.slides.sort((a, b) => a.order - b.order);
  const totalSlides = slides.length;
  const slide = slides[currentSlide];

  if (!slide) return null;

  const IconComponent = ICON_MAP[slide.icon] || Sparkles;
  const iconColor = ICON_COLOR_MAP[slide.iconColor] || ICON_COLOR_MAP.primary;
  const bgGradient = BG_COLOR_MAP[slide.iconColor] || BG_COLOR_MAP.primary;
  const isLastSlide = currentSlide === totalSlides - 1;

  const goToSlide = (index: number) => {
    setCurrentSlide(Math.max(0, Math.min(totalSlides - 1, index)));
  };

  return (
    <>
      {/* Slide Content */}
      <div className="relative">
        {/* Background gradient */}
        <div className={cn("absolute inset-0 bg-gradient-to-br", bgGradient)} />

        <div className="relative px-6 pt-8 pb-6">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-2xl bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <IconComponent className={cn("h-10 w-10", iconColor)} />
            </div>
          </div>

          {/* Highlight badge */}
          {slide.highlight && (
            <div className="flex justify-center mb-3">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-background/80 text-foreground">
                {slide.highlight}
              </span>
            </div>
          )}

          {/* Title & Description */}
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-3">{slide.title}</h2>
            <div className="text-muted-foreground leading-relaxed">
              {renderMarkdown(slide.content)}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 pb-6 pt-2">
        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "h-2 rounded-full transition-all",
                index === currentSlide
                  ? "w-6 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          {currentSlide === 0 && hasOverview ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onViewOverview}
              className="gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
              Overview
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToSlide(currentSlide - 1)}
              disabled={currentSlide === 0}
              className="gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
          )}

          {isLastSlide ? (
            <Button size="sm" onClick={onClose}>
              {guide.ctaText || "Get Started"}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => goToSlide(currentSlide + 1)}
              className="gap-1.5"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

export function GuideCarousel({ guide, open, onOpenChange }: GuideCarouselProps) {
  const [currentView, setCurrentView] = useState<GuideView>("overview");
  const [currentSlide, setCurrentSlide] = useState(0);
  const hasOverview = !!guide.onePager;
  const hasSlides = guide.slides.length > 0;

  // Reset to overview when opening (if available)
  useEffect(() => {
    if (open) {
      setCurrentView(hasOverview ? "overview" : "features");
      setCurrentSlide(0);
    }
  }, [open, hasOverview]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      } else if (currentView === "features") {
        if (e.key === "ArrowLeft") {
          if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
          } else if (hasOverview) {
            setCurrentView("overview");
          }
        } else if (e.key === "ArrowRight") {
          if (currentSlide < guide.slides.length - 1) {
            setCurrentSlide(prev => prev + 1);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, currentView, currentSlide, hasOverview, guide.slides.length, onOpenChange]);

  if (!guide.enabled || (!hasOverview && !hasSlides)) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <DialogTitle className="sr-only">{guide.appName}</DialogTitle>

        {currentView === "overview" && hasOverview ? (
          <OnePagerView
            guide={guide}
            onViewFeatures={() => {
              setCurrentView("features");
              setCurrentSlide(0);
            }}
            onClose={() => onOpenChange(false)}
          />
        ) : (
          <FeaturesView
            guide={guide}
            currentSlide={currentSlide}
            setCurrentSlide={setCurrentSlide}
            onViewOverview={() => setCurrentView("overview")}
            onClose={() => onOpenChange(false)}
            hasOverview={hasOverview}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// Trigger button component
export interface GuideTriggerProps {
  onClick: () => void;
  className?: string;
  variant?: "icon" | "button";
  label?: string;
}

export function GuideTrigger({
  onClick,
  className,
  variant = "icon",
  label = "App Guide"
}: GuideTriggerProps) {
  if (variant === "button") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onClick}
        className={cn("gap-2", className)}
      >
        <HelpCircle className="h-4 w-4" />
        {label}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn("h-9 w-9 text-muted-foreground hover:text-foreground", className)}
      aria-label={label}
    >
      <HelpCircle className="h-4 w-4" />
    </Button>
  );
}

// Hook to fetch and manage guide state
export function useAppGuide(appId: string, language: string = "en") {
  const [guide, setGuide] = useState<AppGuide | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function fetchGuide() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/guide?lang=${language}`);
        const data = await response.json();

        if (data.success && data.guide) {
          setGuide(data.guide);
        } else if (data.fallback && data.guide) {
          // Using fallback language
          setGuide(data.guide);
        } else {
          setError(data.error || "Guide not found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch guide");
      } finally {
        setIsLoading(false);
      }
    }

    fetchGuide();
  }, [appId, language]);

  const openGuide = useCallback(() => setIsOpen(true), []);
  const closeGuide = useCallback(() => setIsOpen(false), []);

  return {
    guide,
    isLoading,
    error,
    isOpen,
    setIsOpen,
    openGuide,
    closeGuide,
  };
}

export default GuideCarousel;
