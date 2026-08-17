import type { ReactNode } from "react";
import { Modal, useOverlayState } from "@heroui/react";
import { ModalShell } from "./ModalShell";

export type AdminModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  size?: string;
  children: ReactNode;
};

export function AdminModal({
  open,
  onClose,
  title,
  subtitle,
  footer,
  size = "modal-size-md",
  children,
}: AdminModalProps) {
  const state = useOverlayState({
    isOpen: open,
    onOpenChange: (next) => {
      if (!next) onClose();
    },
  });
  return (
    <Modal state={state}>
      <Modal.Dialog className={`modal-dialog ${size}`}>
        <ModalShell title={title} subtitle={subtitle} onClose={onClose} footer={footer}>
          {children}
        </ModalShell>
      </Modal.Dialog>
    </Modal>
  );
}