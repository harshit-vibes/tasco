"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@tasco/ui";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  Database,
  Zap,
} from "@tasco/ui/icons";

interface MetricsCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: "activity" | "clock" | "alert" | "success" | "database" | "zap";
  variant?: "default" | "success" | "warning" | "danger";
}

const ICONS = {
  activity: Activity,
  clock: Clock,
  alert: AlertTriangle,
  success: CheckCircle,
  database: Database,
  zap: Zap,
};

const VARIANT_STYLES = {
  default: {
    icon: "bg-primary/10 text-primary",
    trend: "text-muted-foreground",
  },
  success: {
    icon: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    trend: "text-green-600 dark:text-green-400",
  },
  warning: {
    icon: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
    trend: "text-yellow-600 dark:text-yellow-400",
  },
  danger: {
    icon: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    trend: "text-red-600 dark:text-red-400",
  },
};

export function MetricsCard({
  title,
  value,
  description,
  trend,
  trendValue,
  icon = "activity",
  variant = "default",
}: MetricsCardProps) {
  const IconComponent = ICONS[icon];
  const styles = VARIANT_STYLES[variant];

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${styles.icon}`}>
          <IconComponent className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trendValue) && (
          <div className="flex items-center gap-2 mt-1">
            {trendValue && trend && (
              <span
                className={`flex items-center text-xs ${
                  trend === "up"
                    ? "text-green-600"
                    : trend === "down"
                      ? "text-red-600"
                      : "text-muted-foreground"
                }`}
              >
                <TrendIcon className="h-3 w-3 mr-1" />
                {trendValue}
              </span>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
