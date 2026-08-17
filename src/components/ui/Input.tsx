import type { ComponentProps, ReactNode } from "react";
import {
  Description,
  FieldError,
  Input as HeroInput,
  Label,
  TextField,
} from "@heroui/react";

export type InputProps = Omit<
  ComponentProps<typeof HeroInput>,
  "className"
> & {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  fullWidth?: boolean;
  className?: string;
  onValueChange?: (value: string) => void;
};

export function Input({
  label,
  description,
  errorMessage,
  fullWidth = true,
  className,
  onValueChange,
  ...props
}: InputProps) {
  return (
    <TextField
      fullWidth={fullWidth}
      className={className}
      isInvalid={Boolean(errorMessage)}
    >
      {label ? <Label>{label}</Label> : null}
      <HeroInput
        {...props}
        onChange={(e) => {
          props.onChange?.(e);
          onValueChange?.(e.target.value);
        }}
      />
      {description ? <Description>{description}</Description> : null}
      {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
    </TextField>
  );
}