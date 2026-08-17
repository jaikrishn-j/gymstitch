import type { ComponentProps } from "react";
import { Toast } from "@heroui/react";

export type ToastProviderProps = ComponentProps<typeof Toast.Provider>;

export function ToastProvider({
  children,
  placement = "bottom end",
  ...props
}: ToastProviderProps) {
  return (
    <>
      {children}
      <Toast.Provider placement={placement} {...props} />
    </>
  );
}
