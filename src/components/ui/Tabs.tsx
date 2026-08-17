import type { ComponentProps } from "react";
import { Tabs as HeroTabs } from "@heroui/react";

export type TabsProps = ComponentProps<typeof HeroTabs>;

export function Tabs({ ...props }: TabsProps) {
  return <HeroTabs {...props} />;
}
