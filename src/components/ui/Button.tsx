import type { CSSProperties, ComponentProps } from "react";
import { Button as HeroButton } from "@heroui/react";

type HeroVariant =
  | "danger"
  | "danger-soft"
  | "ghost"
  | "outline"
  | "primary"
  | "secondary"
  | "tertiary";

export type ButtonVariant =
  | HeroVariant
  | "success"
  | "success-soft"
  | "warn"
  | "warn-soft"
  | "info";

export type ButtonProps = Omit<ComponentProps<typeof HeroButton>, "variant"> & {
  variant?: ButtonVariant;
};

const COLOR_OVERRIDES: Partial<Record<ButtonVariant, CSSProperties>> = {
  success: {
    "--button-bg": "var(--success)",
    "--button-bg-hover": "var(--success-hover)",
    "--button-bg-pressed": "var(--success-hover)",
    "--button-fg": "var(--success-foreground)",
  } as CSSProperties,
  "success-soft": {
    "--button-bg": "var(--success-soft)",
    "--button-bg-hover": "var(--success-soft-hover)",
    "--button-bg-pressed": "var(--success-soft-hover)",
    "--button-fg": "var(--success-soft-foreground)",
  } as CSSProperties,
  warn: {
    "--button-bg": "var(--warning)",
    "--button-bg-hover": "var(--warning-hover)",
    "--button-bg-pressed": "var(--warning-hover)",
    "--button-fg": "var(--warning-foreground)",
  } as CSSProperties,
  "warn-soft": {
    "--button-bg": "var(--warning-soft)",
    "--button-bg-hover": "var(--warning-soft-hover)",
    "--button-bg-pressed": "var(--warning-soft-hover)",
    "--button-fg": "var(--warning-soft-foreground)",
  } as CSSProperties,
  info: {
    "--button-bg": "var(--color-info)",
    "--button-bg-hover": "#2563eb",
    "--button-bg-pressed": "#2563eb",
    "--button-fg": "#ffffff",
  } as CSSProperties,
};

function mapToHeroVariant(variant: ButtonVariant): HeroVariant {
  if (variant in COLOR_OVERRIDES) return "primary";
  return variant as HeroVariant;
}

export function Button({
  variant = "primary",
  style,
  className,
  ...props
}: ButtonProps) {
  const override = COLOR_OVERRIDES[variant];
  return (
    <HeroButton
      variant={mapToHeroVariant(variant)}
      style={override ? { ...override, ...style } : style}
      className={className}
      {...props}
    />
  );
}
