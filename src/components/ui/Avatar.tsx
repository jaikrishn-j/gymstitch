import type { ComponentProps } from "react";
import { Avatar as HeroAvatar } from "@heroui/react";

export type AvatarProps = ComponentProps<typeof HeroAvatar>;

export function Avatar({
  size = "sm",
  color = "accent",
  variant = "soft",
  ...props
}: AvatarProps) {
  return (
    <HeroAvatar size={size} color={color} variant={variant} {...props} />
  );
}
