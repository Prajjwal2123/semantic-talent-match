import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "accent";
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
}: StatsCardProps) {
  return (
    <Card variant="glass" className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={cn(
              "text-3xl font-display font-bold mt-1",
              variant === "primary" && "text-primary",
              variant === "accent" && "text-accent",
              variant === "default" && "text-foreground"
            )}>
              {value}
            </p>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className={cn(
                "flex items-center gap-1 text-sm mt-2",
                trend.isPositive ? "text-accent" : "text-destructive"
              )}>
                <span>{trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%</span>
                <span className="text-muted-foreground">vs last week</span>
              </div>
            )}
          </div>
          
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            variant === "primary" && "bg-primary/10",
            variant === "accent" && "bg-accent/10",
            variant === "default" && "bg-muted"
          )}>
            <Icon className={cn(
              "w-6 h-6",
              variant === "primary" && "text-primary",
              variant === "accent" && "text-accent",
              variant === "default" && "text-muted-foreground"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
