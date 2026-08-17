import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { cn } from "@heroui/react";

export type TopbarProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  onMenuClick?: () => void;
  className?: string;
};

export function Topbar({
  title,
  subtitle,
  actions,
  onMenuClick,
  className,
}: TopbarProps) {
  return (
    <header className={cn("topbar", className)}>
      {onMenuClick ? (
        <button
          type="button"
          className="menu-btn"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
      ) : null}
      <div className="min-w-0 flex-1">
        <h1>{title}</h1>
        {subtitle ? <div className="topbar-sub">{subtitle}</div> : null}
      </div>
      {actions ? <div className="actions">{actions}</div> : null}
    </header>
  );
}
