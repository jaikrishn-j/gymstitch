import type { ReactNode } from "react";

export type PageHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, subtitle, eyebrow, actions }: PageHeaderProps) {
  return (
    <div className="page-head">
      <div>
        {eyebrow ? <div className="eyebrow accent">{eyebrow}</div> : null}
        <h2>{title}</h2>
        {subtitle ? <div className="sub">{subtitle}</div> : null}
      </div>
      {actions ? <div className="actions">{actions}</div> : null}
    </div>
  );
}
