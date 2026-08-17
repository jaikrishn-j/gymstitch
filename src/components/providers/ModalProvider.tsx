import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Modal, useOverlayState } from "@heroui/react";
import { cn } from "@heroui/react";

export type ModalSize = "sm" | "md" | "lg" | "xl";

type ModalItem = {
  id: number;
  node: ReactNode;
  size: ModalSize;
};

type ModalContextValue = {
  open: (node: ReactNode, size?: ModalSize) => () => void;
  close: (id: number) => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within ModalProvider");
  return ctx;
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modals, setModals] = useState<ModalItem[]>([]);
  const idRef = useRef(0);

  const close = useCallback((id: number) => {
    setModals((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const open = useCallback(
    (node: ReactNode, size: ModalSize = "md") => {
      const id = ++idRef.current;
      setModals((prev) => [...prev, { id, node, size }]);
      return () => close(id);
    },
    [close],
  );

  const value = useMemo<ModalContextValue>(() => ({ open, close }), [open, close]);

  return (
    <ModalContext.Provider value={value}>
      {children}
      {modals.map((m) => (
        <ModalController
          key={m.id}
          size={m.size}
          onClose={() => close(m.id)}
        >
          {m.node}
        </ModalController>
      ))}
    </ModalContext.Provider>
  );
}

function ModalController({
  children,
  size,
  onClose,
}: {
  children: ReactNode;
  size: ModalSize;
  onClose: () => void;
}) {
  const state = useOverlayState({
    defaultOpen: true,
    onOpenChange: (isOpen) => {
      if (!isOpen) onClose();
    },
  });

  const sizeClass =
    size === "sm"
      ? "modal-size-sm"
      : size === "lg"
        ? "modal-size-lg"
        : size === "xl"
          ? "modal-size-xl"
          : "modal-size-md";

  return (
    <Modal state={state}>
      <Modal.Dialog className={cn("modal-dialog", sizeClass)}>
        {children}
      </Modal.Dialog>
    </Modal>
  );
}
