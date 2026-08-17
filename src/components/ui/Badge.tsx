import type { ComponentProps } from "react";
import { Badge as HeroBadge, Chip as HeroChip } from "@heroui/react";

export type BadgeProps = ComponentProps<typeof HeroBadge>;

export function Badge({
  variant = "soft",
  color = "accent",
  size = "md",
  ...props
}: BadgeProps) {
  return (
    <HeroBadge variant={variant} color={color} size={size} {...props} />
  );
}

export type ChipProps = ComponentProps<typeof HeroChip>;

export type ChipTone = "accent" | "success" | "warning" | "danger" | "default";

export function Chip({
  color = "default",
  size = "sm",
  variant = "soft",
  ...props
}: ChipProps) {
  return <HeroChip color={color} size={size} variant={variant} {...props} />;
}
