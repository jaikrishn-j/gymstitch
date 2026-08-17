import type { ComponentProps, ReactNode } from "react";
import { Label, ListBox, Select as HeroSelect } from "@heroui/react";

export type SelectOption = {
  id: string | number;
  label: string;
  description?: string;
};

type HeroSelectProps = ComponentProps<typeof HeroSelect>;

export type SelectFieldProps = Omit<HeroSelectProps, "children"> & {
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
  label?: ReactNode;
};

export function SelectField({
  options,
  placeholder = "Select an item",
  fullWidth = true,
  label,
  ...props
}: SelectFieldProps) {
  return (
    <HeroSelect fullWidth={fullWidth} placeholder={placeholder} {...props}>
      {label ? <Label>{label}</Label> : null}
      <HeroSelect.Trigger>
        <HeroSelect.Value />
        <HeroSelect.Indicator />
      </HeroSelect.Trigger>
      <HeroSelect.Popover>
        <ListBox>
          {options.map((option) => (
            <ListBox.Item
              key={option.id}
              id={option.id}
              textValue={option.label}
            >
              {option.description ? (
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{option.label}</span>
                  <span className="text-xs text-muted">
                    {option.description}
                  </span>
                </div>
              ) : (
                option.label
              )}
            </ListBox.Item>
          ))}
        </ListBox>
      </HeroSelect.Popover>
    </HeroSelect>
  );
}

export const Select = HeroSelect;
