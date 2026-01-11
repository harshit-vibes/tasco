"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "./dialog";
import { Button } from "./button";
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

export interface AppGuide {
  id: string;
  appId: string;
  language: string;
  appName: string;
  appTagline: string;
  slides: GuideSlide[];
  ctaText?: string;
  enabled: boolean;
  updatedAt: string;
}

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

export function GuideCarousel({ guide, open, onOpenChange }: GuideCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = guide.slides.sort((a, b) => a.order - b.order);
  const totalSlides = slides.length;

  // Reset to first slide when opening
  useEffect(() => {
    if (open) {
      setCurrentSlide(0);
    }
  }, [open]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(Math.max(0, Math.min(totalSlides - 1, index)));
  }, [totalSlides]);

  const goToPrevious = useCallback(() => {
    goToSlide(currentSlide - 1);
  }, [currentSlide, goToSlide]);

  const goToNext = useCallback(() => {
    goToSlide(currentSlide + 1);
  }, [currentSlide, goToSlide]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, goToPrevious, goToNext, onOpenChange]);

  if (!guide.enabled || slides.length === 0) {
    return null;
  }

  const slide = slides[currentSlide];
  const IconComponent = ICON_MAP[slide.icon] || Sparkles;
  const iconColor = ICON_COLOR_MAP[slide.iconColor] || ICON_COLOR_MAP.primary;
  const bgGradient = BG_COLOR_MAP[slide.iconColor] || BG_COLOR_MAP.primary;
  const isLastSlide = currentSlide === totalSlides - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <DialogTitle className="sr-only">{guide.appName}</DialogTitle>

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
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevious}
              disabled={currentSlide === 0}
              className="gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {isLastSlide ? (
              <Button size="sm" onClick={() => onOpenChange(false)}>
                {guide.ctaText || "Get Started"}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={goToNext}
                className="gap-1.5"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
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
