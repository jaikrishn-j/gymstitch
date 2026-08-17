import type { ReactNode } from "react";
import { Modal, cn } from "@heroui/react";

export type ModalShellProps = {
  title: string;
  subtitle?: string;
  onClose?: () => void;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function ModalShell({
  title,
  subtitle,
  onClose,
  footer,
  children,
  className,
}: ModalShellProps) {
  return (
    <>
      <Modal.Header>
        <div className="flex w-full items-start justify-between gap-4">
          <div className="min-w-0">
            <Modal.Heading>{title}</Modal.Heading>
            {subtitle ? (
              <p className="mt-1 text-sm text-muted">{subtitle}</p>
            ) : null}
          </div>
          {onClose ? <Modal.CloseTrigger /> : null}
        </div>
      </Modal.Header>
      <Modal.Body className={cn("space-y-4", className)}>{children}</Modal.Body>
      {footer ? (
        <Modal.Footer className="flex justify-end gap-3">
          {footer}
        </Modal.Footer>
      ) : null}
    </>
  );
}
