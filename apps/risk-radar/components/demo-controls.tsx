"use client";

import { useState, useCallback, createContext, useContext, ReactNode } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  Badge,
} from "@tasco/ui";
import {
  Play,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from "@tasco/ui/icons";
import { useTranslation } from "@tasco/i18n";
import { addNotification } from "@/lib/notifications";

// Demo state types
interface DemoMetric {
  value: string;
  numericValue: number;
  change: string;
  trend: "up" | "down" | "stable";
  status: "healthy" | "warning" | "critical";
}

interface DemoState {
  lossRatio: DemoMetric;
  combinedRatio: DemoMetric;
  premiums: DemoMetric;
  claims: DemoMetric;
  isSimulating: boolean;
}

const initialDemoState: DemoState = {
  lossRatio: {
    value: "62.4%",
    numericValue: 62.4,
    change: "-2.3%",
    trend: "down",
    status: "healthy",
  },
  combinedRatio: {
    value: "95.2%",
    numericValue: 95.2,
    change: "+1.8%",
    trend: "up",
    status: "warning",
  },
  premiums: {
    value: "₫48.2B",
    numericValue: 48.2,
    change: "+12.5%",
    trend: "up",
    status: "healthy",
  },
  claims: {
    value: "₫30.1B",
    numericValue: 30.1,
    change: "+8.2%",
    trend: "up",
    status: "warning",
  },
  isSimulating: false,
};

// Context for demo state
interface DemoContextType {
  demoState: DemoState;
  triggerLossRatioSpike: () => void;
  triggerClaimsSurge: () => void;
  triggerPremiumGrowth: () => void;
  resetDemo: () => void;
  startSimulation: () => void;
  stopSimulation: () => void;
}

const DemoContext = createContext<DemoContextType | null>(null);

export function useDemoContext() {
  const context = useContext(DemoContext);
  if (!context) {
    return null; // Demo context is optional
  }
  return context;
}

// Demo Provider
export function DemoProvider({ children }: { children: ReactNode }) {
  const [demoState, setDemoState] = useState<DemoState>(initialDemoState);
  const [simulationInterval, setSimulationInterval] = useState<NodeJS.Timeout | null>(null);

  const triggerLossRatioSpike = useCallback(() => {
    const newValue = Math.min(85, demoState.lossRatio.numericValue + 15);
    setDemoState((prev) => ({
      ...prev,
      lossRatio: {
        value: `${newValue.toFixed(1)}%`,
        numericValue: newValue,
        change: `+${(newValue - 62.4).toFixed(1)}%`,
        trend: "up",
        status: newValue > 75 ? "critical" : newValue > 65 ? "warning" : "healthy",
      },
    }));

    // Add alert notification
    addNotification({
      id: `demo-loss-${Date.now()}`,
      title: "Loss Ratio Spike Detected",
      description: `Motor insurance loss ratio increased to ${newValue.toFixed(1)}% in Ho Chi Minh region`,
      severity: newValue > 75 ? "critical" : "warning",
      timestamp: new Date(),
      read: false,
      type: "alert",
      metric: "Loss Ratio",
      value: `${newValue.toFixed(1)}%`,
    });
  }, [demoState.lossRatio.numericValue]);

  const triggerClaimsSurge = useCallback(() => {
    const newValue = demoState.claims.numericValue * 1.25;
    setDemoState((prev) => ({
      ...prev,
      claims: {
        value: `₫${newValue.toFixed(1)}B`,
        numericValue: newValue,
        change: `+${((newValue / 30.1 - 1) * 100).toFixed(1)}%`,
        trend: "up",
        status: "critical",
      },
    }));

    addNotification({
      id: `demo-claims-${Date.now()}`,
      title: "Claims Surge Alert",
      description: `Unusual spike in health insurance claims detected in Hanoi district`,
      severity: "critical",
      timestamp: new Date(),
      read: false,
      type: "alert",
      metric: "Claims",
      value: `₫${newValue.toFixed(1)}B`,
    });
  }, [demoState.claims.numericValue]);

  const triggerPremiumGrowth = useCallback(() => {
    const newValue = demoState.premiums.numericValue * 1.15;
    setDemoState((prev) => ({
      ...prev,
      premiums: {
        value: `₫${newValue.toFixed(1)}B`,
        numericValue: newValue,
        change: `+${((newValue / 48.2 - 1) * 100).toFixed(1)}%`,
        trend: "up",
        status: "healthy",
      },
    }));

    addNotification({
      id: `demo-premium-${Date.now()}`,
      title: "Premium Growth Milestone",
      description: `Premiums earned exceeded quarterly target by 15%`,
      severity: "info",
      timestamp: new Date(),
      read: false,
      type: "alert",
      metric: "Premiums",
      value: `₫${newValue.toFixed(1)}B`,
    });
  }, [demoState.premiums.numericValue]);

  const resetDemo = useCallback(() => {
    setDemoState(initialDemoState);
  }, []);

  const startSimulation = useCallback(() => {
    if (simulationInterval) return;

    setDemoState((prev) => ({ ...prev, isSimulating: true }));

    const interval = setInterval(() => {
      // Randomly trigger events
      const random = Math.random();
      if (random < 0.3) {
        triggerLossRatioSpike();
      } else if (random < 0.5) {
        triggerClaimsSurge();
      } else if (random < 0.7) {
        triggerPremiumGrowth();
      }
    }, 5000);

    setSimulationInterval(interval);
  }, [simulationInterval, triggerLossRatioSpike, triggerClaimsSurge, triggerPremiumGrowth]);

  const stopSimulation = useCallback(() => {
    if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
    }
    setDemoState((prev) => ({ ...prev, isSimulating: false }));
  }, [simulationInterval]);

  return (
    <DemoContext.Provider
      value={{
        demoState,
        triggerLossRatioSpike,
        triggerClaimsSurge,
        triggerPremiumGrowth,
        resetDemo,
        startSimulation,
        stopSimulation,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

// Demo Controls Panel Component
export function DemoControlsPanel() {
  const { t } = useTranslation("app");
  const demoContext = useDemoContext();
  const [isOpen, setIsOpen] = useState(false);

  if (!demoContext) return null;

  const {
    demoState,
    triggerLossRatioSpike,
    triggerClaimsSurge,
    triggerPremiumGrowth,
    resetDemo,
    startSimulation,
    stopSimulation,
  } = demoContext;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-gradient-to-r from-primary/10 to-cyan-500/10 border-primary/30 hover:border-primary/50 hover:bg-primary/10"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="hidden sm:inline">Demo Controls</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Demo Mode
          </DialogTitle>
          <DialogDescription>
            Simulate risk events to see how the dashboard responds in real-time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Simulation Status */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  demoState.isSimulating
                    ? "bg-green-500 animate-pulse"
                    : "bg-muted-foreground/30"
                }`}
              />
              <Label className="text-sm">
                {demoState.isSimulating ? "Simulation Active" : "Simulation Paused"}
              </Label>
            </div>
            <Button
              variant={demoState.isSimulating ? "destructive" : "default"}
              size="sm"
              onClick={demoState.isSimulating ? stopSimulation : startSimulation}
              className="gap-1.5"
            >
              {demoState.isSimulating ? (
                <>Stop</>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  Auto-Simulate
                </>
              )}
            </Button>
          </div>

          {/* Manual Triggers */}
          <div className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Trigger Events
            </Label>

            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3 hover:border-red-500/50 hover:bg-red-500/5"
              onClick={() => {
                triggerLossRatioSpike();
                setIsOpen(false);
              }}
            >
              <div className="h-9 w-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                <TrendingUp className="h-4 w-4 text-red-500" />
              </div>
              <div className="text-left">
                <p className="font-medium">Loss Ratio Spike</p>
                <p className="text-xs text-muted-foreground">
                  Simulate a sudden increase in claims
                </p>
              </div>
              <Badge variant="outline" className="ml-auto text-red-500 border-red-500/30">
                Critical
              </Badge>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3 hover:border-orange-500/50 hover:bg-orange-500/5"
              onClick={() => {
                triggerClaimsSurge();
                setIsOpen(false);
              }}
            >
              <div className="h-9 w-9 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </div>
              <div className="text-left">
                <p className="font-medium">Claims Surge</p>
                <p className="text-xs text-muted-foreground">
                  Trigger unusual claims volume
                </p>
              </div>
              <Badge variant="outline" className="ml-auto text-orange-500 border-orange-500/30">
                Warning
              </Badge>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3 hover:border-green-500/50 hover:bg-green-500/5"
              onClick={() => {
                triggerPremiumGrowth();
                setIsOpen(false);
              }}
            >
              <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                <TrendingDown className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-left">
                <p className="font-medium">Premium Growth</p>
                <p className="text-xs text-muted-foreground">
                  Positive revenue milestone
                </p>
              </div>
              <Badge variant="outline" className="ml-auto text-green-500 border-green-500/30">
                Good
              </Badge>
            </Button>
          </div>

          {/* Reset */}
          <Button
            variant="ghost"
            className="w-full gap-2"
            onClick={resetDemo}
          >
            <RefreshCw className="h-4 w-4" />
            Reset to Default Values
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DemoControlsPanel;
