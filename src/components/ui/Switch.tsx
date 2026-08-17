import type { ComponentProps } from "react";
import { Switch as HeroSwitch } from "@heroui/react";

export type SwitchProps = ComponentProps<typeof HeroSwitch>;

export function Switch(props: SwitchProps) {
  return <HeroSwitch {...props} />;
}
