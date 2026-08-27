import { useState } from "react";
import type { ReactNode } from "react";
import {
  CreditCard,
  Dumbbell,
  FileText,
  LayoutGrid,
  ShieldCheck,
  Users,
} from "lucide-react";
import { cn } from "@heroui/react";
import { Button, Input } from "../ui";
import { ModalShell } from "./ModalShell";
import type { PermLevel, PermModule, Permission } from "../../auth/auth-types";

export type TrainerRole = "staff" | "admin";

export type TrainerData = {
  firstName: string;
  lastName: string;
  email: string;
  role: TrainerRole;
  permission?: Permission;
};

export type AddTrainerModalProps = {
  onSave: (data: TrainerData) => Promise<void>;
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

const LEVELS: { value: PermLevel | null; label: string; hint: string }[] = [
  { value: null, label: "None", hint: "Restricted" },
  { value: "read", label: "Read", hint: "View only" },
  { value: "full", label: "Full", hint: "Full access" },
];

function defaultPermission(): Permission {
  return {
    member: "read",
    plan: null,
    equipment: null,
    payments: null,
  };
}

export function AddTrainerModal({ onSave, onClose }: AddTrainerModalProps) {
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TrainerRole>("staff");
  const [permission, setPermission] = useState<Permission>(defaultPermission);

  const setLevel = (module: PermModule, level: PermLevel | null) =>
    setPermission((prev) => ({ ...prev, [module]: level }));

  const handleSubmit = async () => {
    if (!firstName.trim() || !email.trim()) return;
    setSaving(true);
    try {
      const payload: TrainerData = {
        firstName,
        lastName,
        email,
        role,
      };
      if (role === "staff") payload.permission = permission;
      await onSave(payload);
      onClose?.();
    } catch {
      // Keep open
    } finally {
      setSaving(false);
    }
  };

  const isAdmin = role === "admin";

  return (
    <ModalShell
      title="Add staff member / trainer"
      subtitle="Create staff account with role assignments & module permissions."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onPress={onClose} isDisabled={saving}>
            Cancel
          </Button>
          <Button onPress={handleSubmit} isDisabled={saving}>
            {saving ? "Creating..." : "Create staff & send invite"}
          </Button>
        </>
      }
    >
      <div className="form-grid">
        <Input
          label="First name *"
          placeholder="Arjun"
          value={firstName}
          onValueChange={setFirstName}
          autoFocus
        />
        <Input
          label="Last name *"
          placeholder="Rao"
          value={lastName}
          onValueChange={setLastName}
        />
      </div>
      <Input
        label="Email address *"
        placeholder="arjun@gymstitch.in"
        type="email"
        value={email}
        onValueChange={setEmail}
      />

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
              <div className="perm-preset">
                <span>
                  {permission[module.key] === "full"
                    ? "Full access"
                    : permission[module.key] === "read"
                      ? "Read only"
                      : "Completely restricted"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ModalShell>
  );
}
