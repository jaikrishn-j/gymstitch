import { useState } from "react";
import { Search, Trash2 } from "lucide-react";
import {
  AdminShell,
  Button,
  EmptyState,
  SyncBar,
} from "../components/ui";
import { useModal } from "../components/providers/ModalProvider";
import { useConfirm } from "../components/providers/ConfirmProvider";
import { AddTrainerModal } from "../components/modals/AddTrainerModal";
import type { TrainerData } from "../components/modals/AddTrainerModal";
import { EditStaffModal } from "../components/modals/EditStaffModal";
import type {
  PermModule,
  Permission,
} from "../auth/auth-types";

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
  lastSyncedAt?: number | null;
  syncing?: boolean;
  onSync?: () => void;
  onAddTrainer: (data: TrainerData) => Promise<void>;
  onUpdateStaff: (
    uid: string,
    data: {
      role: "staff" | "admin";
      permission?: Permission;
    },
  ) => Promise<void>;
  onResetStaffLink: (uid: string) => Promise<string>;
  onDeleteStaff: (uid: string) => Promise<void>;
  onLogout?: () => void;
};

const MODULE_LABELS: Record<PermModule, string> = {
  member: "Members",
  plan: "Plans",
  equipment: "Equipment",
  payments: "Payments",
};

const TONES = [
  "accent",
  "info",
  "warn",
  "danger",
] as const;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (part) =>
        part[0]?.toUpperCase() ?? "",
    )
    .join("");
}

function buildChips(t: StaffRow) {
  if (t.role === "admin") {
    return [
      {
        label: "Full Unrestricted Access",
        on: true,
      },
    ];
  }

  const perm = t.permission ?? ({} as Permission);

  const chips: {
    label: string;
    on: boolean;
  }[] = [];

  for (const key of Object.keys(
    MODULE_LABELS,
  ) as PermModule[]) {
    const level = perm[key];

    if (level) {
      chips.push({
        label: `${MODULE_LABELS[key]}: ${
          level === "full" ? "Full" : "Read"
        }`,
        on: true,
      });
    }
  }

  if (chips.length === 0) {
    chips.push({
      label: "No access",
      on: false,
    });
  }

  return chips;
}

export function AdminTrainersPage({
  trainers,
  loading,
  lastSyncedAt,
  syncing = false,
  onSync,
  onAddTrainer,
  onUpdateStaff,
  onResetStaffLink,
  onDeleteStaff,
  onLogout,
}: AdminTrainersPageProps) {
  const [query, setQuery] = useState("");

  const { open } = useModal();
  const { confirm } = useConfirm();

  const openAddTrainer = () => {
    const close = open(
      <AddTrainerModal
        onSave={onAddTrainer}
        onClose={() => close()}
      />,
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
        onSave={(data) =>
          onUpdateStaff(t.uid, data)
        }
        onResetLink={onResetStaffLink}
        onClose={() => close()}
      />,
      "lg",
    );
  };

  const handleDelete = async (
    t: StaffRow,
  ) => {
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

    const haystack =
      `${t.name} ${t.email}`.toLowerCase();

    return haystack.includes(
      query.toLowerCase(),
    );
  });

  const fullAccessCount =
    trainers.filter(
      (t) =>
        t.role === "admin" ||
        Object.values(
          t.permission ?? {},
        ).includes("full"),
    ).length;

  const restrictedCount =
    trainers.filter(
      (t) =>
        t.role === "staff" &&
        !Object.values(
          t.permission ?? {},
        ).some((v) => v != null),
    ).length;

  return (
    <AdminShell
      title="Trainers & Staff"
      active="trainers"
      status={{
        mode: "online",
        label: "Online",
      }}
      onLogout={onLogout}
    >
      {/* =========================================================
          PAGE WRAPPER

          min-w-0 is important here. It prevents flex/grid
          children from forcing the entire page wider than the
          viewport on mobile.
         ========================================================= */}
      <div className="w-full min-w-0">
        {/* =======================================================
            PAGE HEADER
           ======================================================= */}
        <div
          className="
            mb-5
            flex
            w-full
            min-w-0
            flex-col
            gap-4
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
              Access Control
            </div>

            <h2 className="mt-1 break-words text-xl font-semibold leading-tight sm:text-2xl">
              Staff Directory &amp; Permissions
            </h2>

            <p className="mt-1 max-w-2xl text-sm leading-5 text-[var(--color-muted)]">
              Manage staff accounts, administrative
              rights, and granular module permissions.
            </p>
          </div>

          <div className="w-full shrink-0 sm:w-auto">
            <Button
              onPress={openAddTrainer}
              fullWidth
            >
              + Add staff
            </Button>
          </div>
        </div>

        {/* =======================================================
            STAT CARDS

            1 column on very narrow screens,
            2 columns on small screens,
            3 columns from md upwards.
           ======================================================= */}
        <div
          className="
            mb-5
            grid
            w-full
            min-w-0
            grid-cols-1
            gap-3
            sm:grid-cols-2
            md:grid-cols-3
          "
        >
          {/* Total staff */}
          <div
            className="
              min-w-0
              rounded-xl
              border
              border-[var(--color-border)]
              bg-[var(--color-surface)]
              p-4
              transition
              sm:p-5
            "
          >
            <div className="mb-2 text-xs font-medium text-[var(--color-muted)]">
              Total staff
            </div>

            <div className="text-2xl font-semibold leading-none sm:text-3xl">
              {loading
                ? "…"
                : trainers.length}
            </div>
          </div>

          {/* Full access */}
          <div
            className="
              min-w-0
              rounded-xl
              border
              border-[var(--color-border)]
              bg-[var(--color-surface)]
              p-4
              transition
              sm:p-5
            "
          >
            <div className="mb-2 text-xs font-medium text-[var(--color-muted)]">
              Full access
            </div>

            <div className="text-2xl font-semibold leading-none sm:text-3xl">
              {loading
                ? "…"
                : fullAccessCount}
            </div>
          </div>

          {/* Restricted */}
          <div
            className="
              min-w-0
              rounded-xl
              border
              border-[var(--color-border)]
              bg-[var(--color-surface)]
              p-4
              transition
              sm:p-5
            "
          >
            <div className="mb-2 text-xs font-medium text-[var(--color-muted)]">
              Restricted
            </div>

            <div className="text-2xl font-semibold leading-none sm:text-3xl">
              {loading
                ? "…"
                : restrictedCount}
            </div>
          </div>
        </div>

        {/* =======================================================
            TOOLBAR
           ======================================================= */}
        <div className="mb-5 flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div
            className="
              flex
              min-w-0
              w-full
              flex-1
              items-center
              gap-2
              rounded-xl
              border
              border-[var(--color-border)]
              bg-[var(--color-surface)]
              px-3
              py-2
            "
          >
            <Search
              size={17}
              className="shrink-0 text-[var(--color-muted)]"
            />

            <input
              className="
                min-w-0
                w-full
                border-0
                bg-transparent
                text-sm
                outline-none
                placeholder:text-[var(--color-muted)]
              "
              placeholder="Search staff by name or email…"
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
            />
          </div>

          {/* Sync */}
          <div className="min-w-0 w-full sm:w-auto">
            <SyncBar
              lastSyncedAt={lastSyncedAt}
              isOnline
              syncing={syncing}
              onSync={
                onSync ?? (() => {})
              }
            />
          </div>
        </div>

        {/* =======================================================
            CONTENT STATES
           ======================================================= */}
        {loading ? (
          <div
            className="
              w-full
              rounded-xl
              border
              border-[var(--color-border)]
              bg-[var(--color-surface)]
              p-5
              text-center
              text-sm
              text-[var(--color-muted)]
              sm:p-6
            "
          >
            Loading staff…
          </div>
        ) : visible.length === 0 ? (
          <div
            className="
              w-full
              rounded-xl
              border
              border-[var(--color-border)]
              bg-[var(--color-surface)]
              p-4
              sm:p-6
            "
          >
            <EmptyState
              icon={<Search size={28} />}
              title={
                query
                  ? "No matching staff"
                  : "No staff yet"
              }
              description={
                query
                  ? "Try a different name or email."
                  : "Add your first staff member to get started."
              }
            />
          </div>
        ) : (
          /* =====================================================
             STAFF GRID

             This replaces the dependency on the global
             .staff-grid responsive rules.
            ===================================================== */
          <div
            className="
              grid
              w-full
              min-w-0
              grid-cols-1
              gap-4
              sm:grid-cols-2
              xl:grid-cols-3
            "
          >
            {visible.map((t, i) => {
              const tone =
                TONES[i % TONES.length];

              return (
                <div
                  key={t.uid}
                  className="
                    flex
                    min-w-0
                    w-full
                    flex-col
                    overflow-hidden
                    rounded-xl
                    border
                    border-[var(--color-border)]
                    bg-[var(--color-surface)]
                    p-4
                    sm:p-5
                  "
                >
                  {/* =================================================
                      PROFILE HEADER
                     ================================================= */}
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className="
                        grid
                        h-11
                        w-11
                        shrink-0
                        place-items-center
                        rounded-full
                        text-sm
                        font-semibold
                      "
                      style={{
                        background: `var(--color-${tone}-soft)`,
                        color: `var(--color-${tone})`,
                      }}
                    >
                      {initials(t.name) ||
                        t.email[0]?.toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-base font-semibold leading-5">
                        {t.name}
                      </h3>

                      <div className="mt-1 text-sm text-[var(--color-muted)]">
                        {t.role === "admin"
                          ? "Administrator"
                          : "Trainer / Staff"}
                      </div>
                    </div>
                  </div>

                  {/* =================================================
                      EMAIL
                     ================================================= */}
                  <div className="mt-3 min-w-0 break-all text-xs leading-5 text-[var(--color-muted)]">
                    {t.email}
                  </div>

                  {/* =================================================
                      PERMISSIONS

                      flex-wrap prevents chips from forcing the
                      card wider than the viewport.
                     ================================================= */}
                  <div
                    className="
                      mt-4
                      flex
                      min-w-0
                      flex-wrap
                      gap-1.5
                    "
                  >
                    {buildChips(t).map(
                      (c) => (
                        <span
                          key={c.label}
                          className={`
                            inline-flex
                            max-w-full
                            break-words
                            rounded-full
                            border
                            px-2.5
                            py-1
                            text-[11px]
                            leading-4
                            ${
                              c.on
                                ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                                : "border-[var(--color-border)] bg-transparent text-[var(--color-muted)]"
                            }
                          `}
                        >
                          {c.label}
                        </span>
                      ),
                    )}
                  </div>

                  {/* =================================================
                      CARD FOOTER
                     ================================================= */}
                  <div className="mt-5 border-t border-[var(--color-border)] pt-4">
                    <div className="flex w-full min-w-0 gap-2">
                      <div className="min-w-0 flex-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          fullWidth
                          onPress={() =>
                            openEdit(t)
                          }
                        >
                          Edit permissions
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 text-danger"
                        onPress={() =>
                          handleDelete(t)
                        }
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
      </div>
    </AdminShell>
  );
}