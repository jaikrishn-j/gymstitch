import type { ReactNode } from "react";
import { cn } from "@heroui/react";

export type StatCardTone = "accent" | "success" | "warn" | "danger" | "info";

export type StatCardProps = {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  tone?: StatCardTone;
  delta?: string;
  trend?: "up" | "down";
};

export function StatCard({
  label,
  value,
  icon,
  tone = "accent",
  delta,
  trend,
}: StatCardProps) {
  return (
    <div className="stat-card card">
      <div className="top">
        <span className="stat-label">{label}</span>
        <span className={cn("stat-icon", tone !== "accent" && tone)}>
          {icon}
        </span>
      </div>
      <div className="stat-num">{value}</div>
      {delta ? (
        <span className={cn("delta", trend)}>{delta}</span>
      ) : null}
    </div>
  );
}
