import { useState } from "react";
import type { ReactNode } from "react";
import {
  ChevronDown,
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

export type TrainerRole = "trainer" | "admin";
export type PermissionKey = "create" | "read" | "update" | "delete";

export type TrainerData = {
  firstName: string;
  lastName: string;
  email: string;
  role: TrainerRole;
  permissions: Record<string, Record<PermissionKey, boolean>>;
};

export type AddTrainerModalProps = {
  onSave: (data: TrainerData) => void;
  onClose?: () => void;
};

type ModuleDef = {
  key: string;
  label: string;
  hint: string;
  icon: ReactNode;
  defaults: Record<PermissionKey, boolean>;
};

const MODULES: ModuleDef[] = [
  {
    key: "members",
    label: "Members",
    hint: "Profiles, attendance",
    icon: <Users size={16} />,
    defaults: { create: true, read: true, update: true, delete: false },
  },
  {
    key: "plans",
    label: "Plans",
    hint: "Membership pricing",
    icon: <FileText size={16} />,
    defaults: { create: false, read: true, update: false, delete: false },
  },
  {
    key: "equipment",
    label: "Equipment",
    hint: "Inventory & maintenance",
    icon: <Dumbbell size={16} />,
    defaults: { create: false, read: true, update: false, delete: false },
  },
  {
    key: "payments",
    label: "Payments",
    hint: "Ledger & transactions",
    icon: <CreditCard size={16} />,
    defaults: { create: true, read: true, update: false, delete: false },
  },
];

const PERMISSION_KEYS: PermissionKey[] = ["create", "read", "update", "delete"];

function defaultPermissions(): Record<string, Record<PermissionKey, boolean>> {
  return Object.fromEntries(
    MODULES.map((m) => [m.key, { ...m.defaults }]),
  );
}

export function AddTrainerModal({ onSave, onClose }: AddTrainerModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TrainerRole>("trainer");
  const [permissions, setPermissions] = useState(defaultPermissions);
  const [openModules, setOpenModules] = useState<Set<string>>(
    new Set(["members"]),
  );

  const toggleModule = (key: string) =>
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const togglePermission = (module: string, perm: PermissionKey) =>
    setPermissions((prev) => ({
      ...prev,
      [module]: { ...prev[module], [perm]: !prev[module][perm] },
    }));

  const applyPreset = (module: string, mode: "all" | "read" | "none") =>
    setPermissions((prev) => ({
      ...prev,
      [module]: Object.fromEntries(
        PERMISSION_KEYS.map((k) => [
          k,
          mode === "all" ? true : mode === "read" ? k === "read" : false,
        ]),
      ) as Record<PermissionKey, boolean>,
    }));

  const handleSubmit = () => {
    if (!firstName.trim() || !email.trim()) return;
    onSave({ firstName, lastName, email, role, permissions });
  };

  const isAdmin = role === "admin";

  return (
    <ModalShell
      title="Add staff member / trainer"
      subtitle="Create staff account with role assignments & module permissions."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onPress={onClose}>
            Cancel
          </Button>
          <Button onPress={handleSubmit}>Create trainer & send invite</Button>
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
      <div className="role-grid">
        <button
          type="button"
          className={cn("role-card text-left", role === "trainer" && "selected")}
          onClick={() => setRole("trainer")}
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
        {MODULES.map((module) => {
          const isOpen = openModules.has(module.key);
          return (
            <div
              key={module.key}
              className={cn("perm-section", isOpen && "open")}
            >
              <div
                className="perm-head"
                role="button"
                tabIndex={0}
                onClick={() => toggleModule(module.key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleModule(module.key);
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-accent">{module.icon}</span>
                  <b>{module.label}</b>
                  <span>{module.hint}</span>
                </div>
                <ChevronDown size={16} className="perm-chev" />
              </div>
              <div className="perm-body">
                <div className="perm-toggles">
                  {PERMISSION_KEYS.map((perm) => (
                    <button
                      key={perm}
                      type="button"
                      className={cn(
                        "perm-toggle",
                        permissions[module.key][perm] && "on",
                      )}
                      onClick={() => togglePermission(module.key, perm)}
                    >
                      {perm[0].toUpperCase() + perm.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="perm-preset">
                  <span>Presets:</span>
                  <button type="button" onClick={() => applyPreset(module.key, "all")}>
                    Select All
                  </button>
                  <button type="button" onClick={() => applyPreset(module.key, "read")}>
                    Read Only
                  </button>
                  <button type="button" onClick={() => applyPreset(module.key, "none")}>
                    Clear
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ModalShell>
  );
}
