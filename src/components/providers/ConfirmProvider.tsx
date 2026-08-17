import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertDialog, useOverlayState } from "@heroui/react";
import { Button } from "../ui";

export type ConfirmTone = "danger" | "accent" | "warning" | "success";

export type ConfirmOptions = {
  title: string;
  description?: string;
  tone?: ConfirmTone;
  confirmLabel?: string;
  cancelLabel?: string;
};

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((result: boolean) => void) | null>(null);

  const state = useOverlayState({
    defaultOpen: false,
    onOpenChange: (isOpen) => {
      if (!isOpen) {
        resolverRef.current?.(false);
        resolverRef.current = null;
        setOptions(null);
      }
    },
  });

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setOptions(opts);
      state.open();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const settle = useCallback(
    (result: boolean) => {
      resolverRef.current?.(result);
      resolverRef.current = null;
      setOptions(null);
      state.close();
    },
    [state],
  );

  const value = useMemo<ConfirmContextValue>(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {options ? (
        <AlertDialog
          isOpen={state.isOpen}
          onOpenChange={state.setOpen}
        >
          <AlertDialog.Container placement="center" size="xs">
            <AlertDialog.Dialog>
              <AlertDialog.Icon status={options.tone ?? "danger"} />
              <AlertDialog.Heading>{options.title}</AlertDialog.Heading>
              {options.description ? (
                <AlertDialog.Body>
                  <p className="text-sm text-muted">{options.description}</p>
                </AlertDialog.Body>
              ) : null}
              <AlertDialog.Footer>
                <Button variant="ghost" onPress={() => settle(false)}>
                  {options.cancelLabel ?? "Cancel"}
                </Button>
                <Button
                  variant={
                    options.tone === "warning"
                      ? "warn"
                      : options.tone === "success"
                        ? "success"
                        : options.tone === "accent"
                          ? "primary"
                          : "danger"
                  }
                  onPress={() => settle(true)}
                >
                  {options.confirmLabel ?? "Confirm"}
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog>
      ) : null}
    </ConfirmContext.Provider>
  );
}
