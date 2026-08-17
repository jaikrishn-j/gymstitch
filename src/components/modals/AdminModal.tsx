import type { ReactNode } from "react";
import { Modal, useOverlayState } from "@heroui/react";
import { cn } from "@heroui/react";
import { ModalShell } from "./ModalShell";

export type AdminModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  children: ReactNode;
};

export function AdminModal({
  open,
  onClose,
  title,
  subtitle,
  footer,
  size = "md",
  children,
}: AdminModalProps) {
  const state = useOverlayState({
    isOpen: open,
    onOpenChange: (next) => {
      if (!next) onClose();
    },
  });

  const sizeClass = `modal-size-${size}`;

  return (
    <Modal state={state}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className={cn("modal-dialog", sizeClass)}>
            <ModalShell
              title={title}
              subtitle={subtitle}
              onClose={onClose}
              footer={footer}
            >
              {children}
            </ModalShell>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}