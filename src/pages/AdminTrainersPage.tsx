import { useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { AdminShell, Button, EmptyState } from "../components/ui";
import { useModal } from "../components/providers/ModalProvider";
import { useConfirm } from "../components/providers/ConfirmProvider";
import { AddTrainerModal } from "../components/modals/AddTrainerModal";
import type { TrainerData } from "../components/modals/AddTrainerModal";
import { EditStaffModal } from "../components/modals/EditStaffModal";
import type { PermModule, Permission } from "../auth/auth-types";

export type StaffRow = {
  uid: string;
  name: string;
  email: string;
  role: "staff" | "admin";
  permission?: Permission;
};

export type AdminTrainersPageProps = {
  trainers: StaffRow[];
  loading?: boolean;
  onAddTrainer: (data: TrainerData) => Promise<void>;
  onUpdateStaff: (
    uid: string,
    data: { role: "staff" | "admin"; permission?: Permission },
  ) => Promise<void>;
  onResetStaffLink: (uid: string) => Promise<string>;
  onDeleteStaff: (uid: string) => Promise<void>;
};

const MODULE_LABELS: Record<PermModule, string> = {
  member: "Members",
  plan: "Plans",
  equipment: "Equipment",
  payments: "Payments",
};

const TONES = ["accent", "info", "warn", "danger"] as const;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function buildChips(t: StaffRow) {
  if (t.role === "admin") {
    return [{ label: "Full Unrestricted Access", on: true }];
  }
  const perm = t.permission ?? ({} as Permission);
  const chips: { label: string; on: boolean }[] = [];
  for (const key of Object.keys(MODULE_LABELS) as PermModule[]) {
    const level = perm[key];
    if (level) {
      chips.push({
        label: `${MODULE_LABELS[key]}: ${level === "full" ? "Full" : "Read"}`,
        on: true,
      });
    }
  }
  if (chips.length === 0) {
    chips.push({ label: "No access", on: false });
  }
  return chips;
}

export function AdminTrainersPage({
  trainers,
  loading,
  onAddTrainer,
  onUpdateStaff,
  onResetStaffLink,
  onDeleteStaff,
}: AdminTrainersPageProps) {
  const [query, setQuery] = useState("");
  const { open } = useModal();
  const { confirm } = useConfirm();

  const openAddTrainer = () => {
    const close = open(
      <AddTrainerModal onSave={onAddTrainer} onClose={() => close()} />,
      "lg",
    );
  };

  const openEdit = (t: StaffRow) => {
    const close = open(
      <EditStaffModal
        staff={{
          uid: t.uid,
          name: t.name,
          email: t.email,
          role: t.role,
          permission: t.permission,
        }}
        onSave={(data) => onUpdateStaff(t.uid, data)}
        onResetLink={onResetStaffLink}
        onClose={() => close()}
      />,
      "lg",
    );
  };

  const handleDelete = async (t: StaffRow) => {
    const ok = await confirm({
      title: `Delete ${t.name}?`,
      description:
        "This permanently removes the staff member's login and profile. This cannot be undone.",
      tone: "danger",
      confirmLabel: "Delete permanently",
    });
    if (!ok) return;
    try {
      await onDeleteStaff(t.uid);
    } catch {
      // Handled by the route
    }
  };

  const visible = trainers.filter((t) => {
    if (!query) return true;
    const haystack = `${t.name} ${t.email}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const fullAccessCount = trainers.filter(
    (t) =>
      t.role === "admin" ||
      Object.values(t.permission ?? {}).includes("full"),
  ).length;
  const restrictedCount = trainers.filter(
    (t) =>
      t.role === "staff" &&
      !Object.values(t.permission ?? {}).some((v) => v != null),
  ).length;

  return (
    <AdminShell title="Trainers & Staff" active="trainers" status={{ mode: "online", label: "Online" }}>
      <div className="page-head">
        <div>
          <div className="eyebrow">Access Control</div>
          <h2>Staff Directory &amp; Permissions</h2>
          <p className="sub">
            Manage staff accounts, administrative rights, and granular module
            permissions.
          </p>
        </div>
        <div className="actions">
          <Button onPress={openAddTrainer}>+ Add staff</Button>
        </div>
      </div>

      <div className="stat-roll">
        <div className="card stat-card card-hover reveal">
          <div className="top">
            <span className="stat-label">Total staff</span>
          </div>
          <div className="stat-num">{loading ? "…" : trainers.length}</div>
        </div>
        <div className="card stat-card card-hover reveal">
          <div className="top">
            <span className="stat-label">Full access</span>
          </div>
          <div className="stat-num">{loading ? "…" : fullAccessCount}</div>
        </div>
        <div className="card stat-card card-hover reveal">
          <div className="top">
            <span className="stat-label">Restricted</span>
          </div>
          <div className="stat-num">{loading ? "…" : restrictedCount}</div>
        </div>
      </div>

      <div className="toolbar" style={{ marginBottom: 20 }}>
        <div className="search">
          <Search />
          <input
            className="input"
            placeholder="Search staff by name or email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="card pad muted">Loading staff…</div>
      ) : visible.length === 0 ? (
        <div className="card pad">
          <EmptyState
            icon={<Search size={28} />}
            title={query ? "No matching staff" : "No staff yet"}
            description={
              query
                ? "Try a different name or email."
                : "Add your first staff member to get started."
            }
          />
        </div>
      ) : (
        <div className="staff-grid">
          {visible.map((t, i) => {
            const tone = TONES[i % TONES.length];
            return (
              <div key={t.uid} className="card staff-card card-hover reveal">
                <div
                  className="s-avatar"
                  style={{
                    background: `var(--color-${tone}-soft)`,
                    color: `var(--color-${tone})`,
                  }}
                >
                  {initials(t.name) || t.email[0]?.toUpperCase()}
                </div>
                <h3>{t.name}</h3>
                <div className="s-role">
                  {t.role === "admin" ? "Administrator" : "Trainer / Staff"}
                </div>
                <div className="muted small">{t.email}</div>
                <div className="role-meta">
                  {buildChips(t).map((c) => (
                    <span
                      key={c.label}
                      className={`perm-chip ${c.on ? "on" : "off"}`}
                    >
                      {c.label}
                    </span>
                  ))}
                </div>
                <div className="s-foot">
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      fullWidth
                      onPress={() => openEdit(t)}
                    >
                      Edit permissions
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-danger"
                      onPress={() => handleDelete(t)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
