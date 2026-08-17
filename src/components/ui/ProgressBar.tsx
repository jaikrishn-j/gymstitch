import type { ComponentProps } from "react";
import { ProgressBar as HeroProgressBar, Spinner as HeroSpinner } from "@heroui/react";

export type SpinnerProps = ComponentProps<typeof HeroSpinner>;

export function Spinner({ size = "md", color = "accent", ...props }: SpinnerProps) {
  return <HeroSpinner size={size} color={color} {...props} />;
}

export type ProgressBarProps = ComponentProps<typeof HeroProgressBar>;

export function ProgressBar({
  color = "accent",
  size = "md",
  ...props
}: ProgressBarProps) {
  return <HeroProgressBar color={color} size={size} {...props} />;
}
