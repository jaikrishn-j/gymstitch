import type { ReactNode } from "react";
import { cn } from "@heroui/react";

export type SegmentedOption<T extends string> = {
  id: T;
  label: ReactNode;
};

export type SegmentedProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
};

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedProps<T>) {
  return (
    <div className={cn("seg", className)} role="tablist">
      <span
        className="seg-indicator"
        style={{
          width: `${100 / options.length}%`,
          transform: `translateX(${options.findIndex((o) => o.id === value) * 100}%)`,
        }}
      />
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="tab"
          aria-selected={value === option.id}
          className={cn(value === option.id && "active")}
          style={{ flex: 1 }}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
