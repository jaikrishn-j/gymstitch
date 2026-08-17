import type { ComponentProps } from "react";
import { Table as HeroTable } from "@heroui/react";

export type TableProps = ComponentProps<typeof HeroTable>;

export function Table({ ...props }: TableProps) {
  return <HeroTable {...props} />;
}
