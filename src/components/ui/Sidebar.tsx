import type { ReactNode } from "react";
import { Dumbbell } from "lucide-react";
import { cn } from "@heroui/react";

export type SidebarItem = {
  key: string;
  label: string;
  icon: ReactNode;
  badge?: string | number;
  active?: boolean;
  onClick?: () => void;
};

export type SidebarSection = {
  title?: string;
  items: SidebarItem[];
};

export type SidebarProps = {
  brandMark?: ReactNode;
  brandName: string;
  sections: SidebarSection[];
  footer?: ReactNode;
  className?: string;
};

export function Sidebar({
  brandMark,
  brandName,
  sections,
  footer,
  className,
}: SidebarProps) {
  return (
    <aside className={cn("sidebar", className)}>
      <div className="brand">
        <span className="brand-mark">
          {brandMark ?? <Dumbbell size={17} />}
        </span>
        <span className="brand-name">{brandName}</span>
      </div>

      {sections.map((section, idx) => (
        <div key={section.title ?? idx}>
          {section.title ? (
            <div className="nav-section">{section.title}</div>
          ) : null}
          {section.items.map((item) => (
            <button
              key={item.key}
              type="button"
              className={cn("nav-item w-full text-left", item.active && "active")}
              onClick={item.onClick}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="count-pill">{item.badge}</span>
              )}
            </button>
          ))}
        </div>
      ))}

      {footer ? <div className="sidebar-foot">{footer}</div> : null}
    </aside>
  );
}
