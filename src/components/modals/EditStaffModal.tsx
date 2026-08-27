import { useState } from "react";
import type { ReactNode } from "react";
import {
  CreditCard,
  Dumbbell,
  FileText,
  LayoutGrid,
  KeyRound,
  ShieldCheck,
  Users,
} from "lucide-react";
import { cn } from "@heroui/react";
import { Button } from "../ui";
import { ModalShell } from "./ModalShell";
import type { TrainerRole } from "./AddTrainerModal";
import type { PermLevel, PermModule, Permission } from "../../auth/auth-types";

export type EditStaffData = {
  uid: string;
  name: string;
  email: string;
  role: TrainerRole;
  permission?: Permission;
};

export type EditStaffModalProps = {
  staff: EditStaffData;
  onSave: (data: { role: TrainerRole; permission?: Permission }) => Promise<void>;
  onResetLink: (uid: string) => Promise<string>;
  onClose?: () => void;
};

type ModuleDef = {
  key: PermModule;
  label: string;
  hint: string;
  icon: ReactNode;
};

const MODULES: ModuleDef[] = [
  {
    key: "member",
    label: "Members",
    hint: "Profiles, attendance",
    icon: <Users size={16} />,
  },
  {
    key: "plan",
    label: "Plans",
    hint: "Membership pricing",
    icon: <FileText size={16} />,
  },
  {
    key: "equipment",
    label: "Equipment",
    hint: "Inventory & maintenance",
    icon: <Dumbbell size={16} />,
  },
  {
    key: "payments",
    label: "Payments",
    hint: "Ledger & transactions",
    icon: <CreditCard size={16} />,
  },
];

const LEVELS: { value: PermLevel | null; label: string }[] = [
  { value: null, label: "None" },
  { value: "read", label: "Read" },
  { value: "full", label: "Full" },
];

export function EditStaffModal({
  staff,
  onSave,
  onResetLink,
  onClose,
}: EditStaffModalProps) {
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<TrainerRole>(staff.role);
  const [permission, setPermission] = useState<Permission>(
    staff.permission ?? {
      member: null,
      plan: null,
      equipment: null,
      payments: null,
    },
  );
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [loadingReset, setLoadingReset] = useState(false);

  const isAdmin = role === "admin";

  const setLevel = (module: PermModule, level: PermLevel | null) =>
    setPermission((prev) => ({ ...prev, [module]: level }));

  const handleGenerateResetLink = async () => {
    setLoadingReset(true);
    try {
      const link = await onResetLink(staff.uid);
      setResetLink(link);
    } catch {
      // Keep open
    } finally {
      setLoadingReset(false);
    }
  };

  const handleCopy = async () => {
    if (!resetLink) return;
    try {
      await navigator.clipboard.writeText(resetLink);
    } catch {
      // Clipboard unavailable
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: { role: TrainerRole; permission?: Permission } = { role };
      if (role === "staff") payload.permission = permission;
      await onSave(payload);
      onClose?.();
    } catch {
      // Keep open
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      title={`Edit permissions · ${staff.name}`}
      subtitle={staff.email}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onPress={onClose} isDisabled={saving}>
            Cancel
          </Button>
          <Button onPress={handleSave} isDisabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </>
      }
    >
      <div className="sec-t">
        <ShieldCheck size={16} />
        Role selection
      </div>
      <div className="role-grid grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          className={cn("role-card text-left", role === "staff" && "selected")}
          onClick={() => setRole("staff")}
        >
          <b>Trainer / Staff</b>
          <span>Granular module permissions</span>
        </button>
        <button
          type="button"
          className={cn("role-card text-left", role === "admin" && "selected")}
          onClick={() => setRole("admin")}
        >
          <b>Admin</b>
          <span>Full unrestricted access</span>
        </button>
      </div>

      <div className={cn("sec-t", isAdmin && "matrix-off")}>
        <LayoutGrid size={16} />
        Module permissions
      </div>
      <div className={cn(isAdmin && "matrix-off")}>
        {MODULES.map((module) => (
          <div key={module.key} className="perm-section open">
            <div className="perm-head">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-accent">{module.icon}</span>
                <b>{module.label}</b>
                <span>{module.hint}</span>
              </div>
            </div>
            <div className="perm-body">
              <div className="perm-toggles">
                {LEVELS.map((level) => (
                  <button
                    key={level.label}
                    type="button"
                    className={cn(
                      "perm-toggle",
                      permission[module.key] === level.value && "on",
                    )}
                    onClick={() => setLevel(module.key, level.value)}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sec-t">
        <KeyRound size={16} />
        Password reset
      </div>
      {resetLink ? (
        <div className="field">
          <span className="mb-1.5 block text-[13px] font-semibold text-fg">
            Secure reset link
          </span>
          <input className="input mono" readOnly value={resetLink} />
          <Button
            fullWidth
            variant="secondary"
            className="mt-2"
            onPress={handleCopy}
          >
            Copy link
          </Button>
        </div>
      ) : (
        <Button
          fullWidth
          variant="secondary"
          isDisabled={loadingReset}
          onPress={handleGenerateResetLink}
        >
          {loadingReset ? "Generating..." : "Generate reset link"}
        </Button>
      )}
    </ModalShell>
  );
}
