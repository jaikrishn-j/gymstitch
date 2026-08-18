import { AdminModal } from "./AdminModal";
import { Button } from "../ui";

export type ResetLinkModalProps = {
  open: boolean;
  email: string;
  link: string;
  onClose: () => void;
};

export function ResetLinkModal({
  open,
  email,
  link,
  onClose,
}: ResetLinkModalProps) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Clipboard unavailable
    }
    onClose();
  };

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title="Send invite link"
      subtitle="Token valid for 24 hours"
    >
      <div className="banner info">
        <span>
          Send this secure one-time link to let {email} set their own password.
        </span>
      </div>
      <div className="field">
        <span className="mb-1.5 block text-[13px] font-semibold text-fg">
          Secure reset link
        </span>
        <input className="input mono" readOnly value={link} />
      </div>
      <Button fullWidth onPress={copy}>
        Copy link
      </Button>
    </AdminModal>
  );
}