import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@heroui/react";

export type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("empty-state", className)}>
      <span className="empty-icon">{icon ?? <Inbox size={22} />}</span>
      <div className="empty-title">{title}</div>
      {description ? <div className="empty-desc">{description}</div> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
