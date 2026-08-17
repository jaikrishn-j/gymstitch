import type { ComponentProps, ReactNode } from "react";
import {
  Description,
  FieldError,
  Label,
  TextArea as HeroTextArea,
  TextField,
} from "@heroui/react";

export type TextAreaProps = Omit<
  ComponentProps<typeof HeroTextArea>,
  "className"
> & {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  fullWidth?: boolean;
  className?: string;
  rows?: number;
  onValueChange?: (value: string) => void;
};

export function TextArea({
  label,
  description,
  errorMessage,
  fullWidth = true,
  className,
  rows = 3,
  onValueChange,
  ...props
}: TextAreaProps) {
  return (
    <TextField
      fullWidth={fullWidth}
      className={className}
      isInvalid={Boolean(errorMessage)}
    >
      {label ? <Label>{label}</Label> : null}
      <HeroTextArea
        rows={rows}
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