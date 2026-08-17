import type { ComponentProps } from "react";
import { Card as HeroCard, cn } from "@heroui/react";

export type CardProps = ComponentProps<typeof HeroCard>;

export function Card({ className, ...props }: CardProps) {
  return <HeroCard className={cn("card", className)} {...props} />;
}
