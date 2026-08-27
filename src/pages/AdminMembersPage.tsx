import { useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import {
  AdminShell,
  Chip,
  Button,
  cn,
  EmptyState,
  SyncBar,
} from "../components/ui";
import { AdminModal } from "../components/modals/AdminModal";
import { useModal } from "../components/providers/ModalProvider";
import { localDateKey } from "../lib/offline";
import { RecordPaymentModal } from "../components/modals/RecordPaymentModal";
import type { PaymentData } from "../components/modals/RecordPaymentModal";
import { AddMemberModal } from "../components/modals/AddMemberModal";
import type {
  AddMemberData,
  PlanOption,
} from "../components/modals/AddMemberModal";

export type Member = {
  id: string;
  initials: string;
  tone: "accent" | "info" | "warn" | "danger";
  name: string;
  email: string;
  phone: string;
  plan: string;
  status: "active" | "expiring" | "expired";
  expires: string;
};

export type PaymentRow = {
  id: string;
  memberId: string;
  memberName: string;
  email?: string;
  planId: string;
  planName: string;
  amount: number;
  daysAdded: number;
  method: string;
  notes?: string;
  paidAt: Date;
  status?: "paid" | "pending";
};

export type AttendanceRow = {
  id: string;
  memberId: string;
  memberName: string;
  date: Date;
  timeIn: string;
  timeOut?: string | null;
  weight?: number | null;
};

type StatusFilter = "all" | "active" | "expiring" | "expired";

const DAY_MS = 86_400_000;

const STATUS_BADGE: Record<
  Member["status"],
  {
    tone: "success" | "warning" | "danger";
    label: string;
  }
> = {
  active: {
    tone: "success",
    label: "Active",
  },
  expiring: {
    tone: "warning",
    label: "Expiring",
  },
  expired: {
    tone: "danger",
    label: "Expired",
  },
};

export type AdminMembersPageProps = {
  members: Member[];
  plans: PlanOption[];
  payments: PaymentRow[];
  attendance: AttendanceRow[];
  pendingApprovals?: PaymentRow[];
  loading?: boolean;
  lastSyncedAt?: number | null;
  pendingCount?: number;
  isOnline?: boolean;
  syncing?: boolean;
  onSync?: () => void;
  onAddMember: (data: AddMemberData) => Promise<void>;
  onRecordPayment: (member: Member, data: PaymentData) => Promise<void>;
  onApprovePayment?: (payment: PaymentRow) => Promise<void>;
  onRejectPayment?: (payment: PaymentRow) => Promise<void>;
  onMarkAttendance: (member: Member) => Promise<void>;
  onUpdateWeight: (
    member: Member,
    attendanceId: string,
    weight: number,
  ) => Promise<void>;
  onLogout?: () => void;
};

export function AdminMembersPage({
  members,
  plans,
  payments,
  attendance,
  pendingApprovals = [],
  loading,
  lastSyncedAt,
  pendingCount = 0,
  isOnline = true,
  syncing = false,
  onSync,
  onAddMember,
  onRecordPayment,
  onApprovePayment,
  onRejectPayment,
  onMarkAttendance,
  onUpdateWeight,
  onLogout,
}: AdminMembersPageProps) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<Member | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const { open } = useModal();

  const closeModalRef = useRef<(() => void) | null>(null);

  const counts = useMemo(
    () => ({
      all: members.length,
      active: members.filter((m) => m.status === "active").length,
      expiring: members.filter((m) => m.status === "expiring").length,
      expired: members.filter((m) => m.status === "expired").length,
    }),
    [members],
  );

  const handleApprove = async (payment: PaymentRow) => {
    if (!onApprovePayment) return;
    setApprovingId(payment.id);
    try {
      await onApprovePayment(payment);
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (payment: PaymentRow) => {
    if (!onRejectPayment) return;
    setRejectingId(payment.id);
    try {
      await onRejectPayment(payment);
    } finally {
      setRejectingId(null);
    }
  };

  const filters: {
    key: StatusFilter;
    label: string;
  }[] = [
    {
      key: "all",
      label: `All members (${counts.all})`,
    },
    {
      key: "active",
      label: `Active (${counts.active})`,
    },
    {
      key: "expiring",
      label: `Expiring soon (${counts.expiring})`,
    },
    {
      key: "expired",
      label: `Expired (${counts.expired})`,
    },
  ];

  const visible = members.filter((m) => {
    if (filter !== "all" && m.status !== filter) {
      return false;
    }

    if (query) {
      const haystack =
        `${m.name} ${m.email} ${m.plan}`.toLowerCase();

      if (!haystack.includes(query.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  const openPaymentModal = (member: Member) => {
    const closeModal = () => {
      closeModalRef.current?.();
    };

    closeModalRef.current = open(
      <RecordPaymentModal
        plans={plans}
        memberName={member.name}
        memberId={`MBR-${member.id}`}
        memberMeta={`${member.email} · ${member.phone}`}
        onSave={async (data) => {
          await onRecordPayment(member, data);
          closeModal();
        }}
        onClose={closeModal}
      />,
      "md",
    );
  };

  const openAddMember = () => {
    const close = open(
      <AddMemberModal
        plans={plans}
        onSave={async (data) => {
          await onAddMember(data);
          close();
        }}
        onClose={() => close()}
      />,
      "lg",
    );
  };

  return (
    <AdminShell
      title="Member Management"
      active="members"
      status={{
        mode: isOnline ? "online" : "offline",
        label:
          pendingCount > 0
            ? `${isOnline ? "Online" : "Offline"} · ${pendingCount} pending sync`
            : isOnline
              ? "Online"
              : "Offline",
      }}
      pendingCount={pendingApprovals.length}
      onLogout={onLogout}
    >
      <div className="w-full min-w-0">
        {/* =========================================================
            PAGE HEADER
           ========================================================= */}
        <div className="mb-5 w-full min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Database & Directory
          </div>

          <h2 className="mt-1 text-xl font-semibold leading-tight sm:text-2xl">
            Active Members
          </h2>

          <p className="mt-1 max-w-2xl text-sm leading-5 text-[var(--color-muted)]">
            Search members, monitor subscription expiration, and record
            payments offline.
          </p>
        </div>

        {/* =========================================================
            PENDING APPROVAL REQUESTS
           ========================================================= */}
        {pendingApprovals.length > 0 ? (
          <div className="mb-5 w-full min-w-0 rounded-xl border border-[var(--color-warn)] bg-[var(--color-warn-soft)] p-4">
            <div className="mb-3 flex items-center gap-2">
              <Chip color="warning" variant="soft" size="sm">
                {pendingApprovals.length} pending
              </Chip>
              <span className="text-sm font-medium">
                Plan approval request{pendingApprovals.length !== 1 ? "s" : ""} awaiting review
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {pendingApprovals.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Initials tone="warn">
                      {payment.memberName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                    </Initials>
                    <div className="min-w-0">
                      <div className="truncate font-medium">
                        {payment.memberName}
                      </div>
                      <div className="text-xs text-[var(--color-muted)]">
                        {payment.planName} · ₹{payment.amount.toLocaleString("en-IN")} · +{payment.daysAdded} days
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      isDisabled={approvingId === payment.id}
                      onPress={() => handleApprove(payment)}
                    >
                      {approvingId === payment.id ? "Approving…" : "Approve"}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      isDisabled={rejectingId === payment.id}
                      onPress={() => handleReject(payment)}
                    >
                      {rejectingId === payment.id ? "Rejecting…" : "Reject"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* =========================================================
            TOOLBAR
           ========================================================= */}
        <div className="mb-4 flex w-full min-w-0 flex-col gap-3">
          {/* Search */}
          <div className="flex min-w-0 w-full items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
            <Search
              size={17}
              className="shrink-0 text-[var(--color-muted)]"
            />

            <input
              className="min-w-0 w-full border-0 bg-transparent text-sm outline-none placeholder:text-[var(--color-muted)]"
              placeholder="Search by name, email, or plan…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <SyncBar
                lastSyncedAt={lastSyncedAt}
                pendingCount={pendingCount}
                isOnline={isOnline}
                syncing={syncing}
                onSync={onSync ?? (() => {})}
              />
            </div>

            <div className="w-full sm:w-auto">
              <Button
                variant="secondary"
                onPress={openAddMember}
              >
                + Add member
              </Button>
            </div>
          </div>
        </div>

        {/* =========================================================
            STATUS FILTERS
           ========================================================= */}
        <div
          className="
            mb-5
            flex
            w-full
            min-w-0
            gap-2
            overflow-x-auto
            pb-1
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              className={cn(
                "shrink-0 whitespace-nowrap rounded-lg border px-3 py-2 text-sm transition-colors",
                "border-[var(--color-border)]",
                "text-[var(--color-muted)]",
                "hover:text-[var(--color-text)]",
                filter === f.key &&
                  "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
              )}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* =========================================================
            CONTENT
           ========================================================= */}
        {loading ? (
          <div className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center text-sm text-[var(--color-muted)]">
            Loading members…
          </div>
        ) : visible.length === 0 ? (
          <div className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-6">
            <EmptyState
              icon={<Search size={28} />}
              title={
                query || filter !== "all"
                  ? "No matching members"
                  : "No members yet"
              }
              description={
                query || filter !== "all"
                  ? "Try a different search or filter."
                  : "Add your first member to get started."
              }
            />
          </div>
        ) : (
          <div className="w-full min-w-0 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            {/* =====================================================
                MAIN MEMBERS TABLE

                The table itself intentionally has a minimum width.
                The parent scroll container handles mobile overflow,
                preventing the page/viewport from expanding.
               ===================================================== */}
            <div className="w-full min-w-0 overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="px-4 py-3 text-left font-medium">
                      Member
                    </th>

                    <th className="px-4 py-3 text-left font-medium">
                      Plan
                    </th>

                    <th className="px-4 py-3 text-left font-medium">
                      Status
                    </th>

                    <th className="px-4 py-3 text-right font-medium">
                      Expires
                    </th>

                    <th className="px-4 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {visible.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b border-[var(--color-border)] last:border-b-0"
                    >
                      {/* Member */}
                      <td className="px-4 py-3 align-middle">
                        <div className="flex min-w-0 items-center gap-3">
                          <Initials tone={m.tone}>
                            {m.initials}
                          </Initials>

                          <div className="min-w-0">
                            <div className="truncate font-medium">
                              {m.name}
                            </div>

                            <div className="mt-0.5 max-w-[280px] break-words text-xs leading-4 text-[var(--color-muted)]">
                              {m.email}
                              <span className="mx-1">·</span>
                              {m.phone}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="px-4 py-3 align-middle">
                        <div className="max-w-[180px] break-words">
                          {m.plan}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 align-middle">
                        <Chip
                          color={STATUS_BADGE[m.status].tone}
                          variant="soft"
                          size="sm"
                        >
                          {STATUS_BADGE[m.status].label}
                        </Chip>
                      </td>

                      {/* Expires */}
                      <td className="px-4 py-3 text-right align-middle">
                        <span className="whitespace-nowrap">
                          {m.expires}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right align-middle">
                        <div className="flex min-w-max justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onPress={() => setDetail(m)}
                          >
                            View
                          </Button>

                          <Button
                            variant="secondary"
                            size="sm"
                            onPress={() =>
                              openPaymentModal(m)
                            }
                          >
                            Record payment
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="border-t border-[var(--color-border)] px-3 py-3 text-xs text-[var(--color-muted)] sm:px-4">
              Showing{" "}
              <b className="text-[var(--color-text)]">
                {visible.length}
              </b>{" "}
              of {members.length} members
            </div>
          </div>
        )}

        {/* =========================================================
            DETAIL MODAL
           ========================================================= */}
        {detail ? (
          <MemberDetailModal
            member={detail}
            payments={payments.filter(
              (p) => p.memberId === detail.id,
            )}
            attendance={attendance.filter(
              (a) => a.memberId === detail.id,
            )}
            onMarkAttendance={onMarkAttendance}
            onUpdateWeight={onUpdateWeight}
            onClose={() => setDetail(null)}
          />
        ) : null}
      </div>
    </AdminShell>
  );
}

function MemberDetailModal({
  member,
  payments,
  attendance,
  onMarkAttendance,
  onUpdateWeight,
  onClose,
}: {
  member: Member;
  payments: PaymentRow[];
  attendance: AttendanceRow[];
  onMarkAttendance: (member: Member) => Promise<void>;
  onUpdateWeight: (
    member: Member,
    attendanceId: string,
    weight: number,
  ) => Promise<void>;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"att" | "pay">("att");

  const [marking, setMarking] = useState(false);

  const [editingWeightId, setEditingWeightId] =
    useState<string | null>(null);

  const [weightDraft, setWeightDraft] = useState("");

  const [savingWeightId, setSavingWeightId] =
    useState<string | null>(null);

  const lastPayment = payments[0];

  const todayKey = localDateKey(new Date());

  const todayRecord = attendance.find(
    (a) => localDateKey(a.date) === todayKey,
  );

  const weekly = useMemo(() => {
    const now = new Date();

    const day = (now.getDay() + 6) % 7;

    const weekStart = new Date(now);

    weekStart.setHours(0, 0, 0, 0);

    weekStart.setDate(now.getDate() - day);

    const counts = [0, 0, 0, 0, 0, 0, 0];

    for (const record of attendance) {
      const d = new Date(record.date);

      d.setHours(0, 0, 0, 0);

      const diff =
        (d.getTime() - weekStart.getTime()) / DAY_MS;

      if (diff >= 0 && diff < 7) {
        counts[diff] += 1;
      }
    }

    const max = Math.max(...counts, 1);

    return counts.map((count, i) => ({
      label: [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun",
      ][i],
      height: Math.round((count / max) * 100),
      count,
    }));
  }, [attendance]);

  const handleMark = async () => {
    setMarking(true);

    try {
      await onMarkAttendance(member);
    } catch {
      // Handled by the route
    } finally {
      setMarking(false);
    }
  };

  const startEditWeight = (record: AttendanceRow) => {
    setEditingWeightId(record.id);

    setWeightDraft(
      record.weight != null ? String(record.weight) : "",
    );
  };

  const handleWeightSave = async (
    record: AttendanceRow,
  ) => {
    const parsed = Number(weightDraft);

    if (Number.isNaN(parsed) || parsed <= 0) {
      return;
    }

    setSavingWeightId(record.id);

    try {
      await onUpdateWeight(
        member,
        record.id,
        parsed,
      );

      setEditingWeightId(null);
    } catch {
      // Handled by the route
    } finally {
      setSavingWeightId(null);
    }
  };

  return (
    <AdminModal
      open
      onClose={onClose}
      title={member.name}
      subtitle={`${member.email} · ${member.phone}`}
      size="lg"
      footer={
        <div className="flex w-full justify-end">
          <Button
            variant="secondary"
            onPress={onClose}
          >
            Close
          </Button>
        </div>
      }
    >
      {/* =========================================================
          MODAL CONTENT WRAPPER
         ========================================================= */}
      <div className="w-full min-w-0">
        {/* =======================================================
            TABS
           ======================================================= */}
        <div
          className="
            mb-5
            flex
            w-full
            min-w-0
            overflow-x-auto
            border-b
            border-[var(--color-border)]
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          <button
            type="button"
            className={cn(
              "shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              tab === "att"
                ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                : "border-transparent text-[var(--color-muted)]",
            )}
            onClick={() => setTab("att")}
          >
            Attendance &amp; Weights
          </button>

          <button
            type="button"
            className={cn(
              "shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              tab === "pay"
                ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                : "border-transparent text-[var(--color-muted)]",
            )}
            onClick={() => setTab("pay")}
          >
            Payments &amp; Plan
          </button>
        </div>

        {/* =======================================================
            ATTENDANCE TAB
           ======================================================= */}
        {tab === "att" ? (
          <>
            {/* Attendance action */}
            <div className="mb-4 flex w-full min-w-0 flex-wrap gap-2">
              {todayRecord ? (
                todayRecord.timeOut ? (
                  <div className="max-w-full">
                    <Chip
                      color="success"
                      variant="soft"
                      size="sm"
                    >
                      <span className="break-words">
                        Checked in {todayRecord.timeIn} → out{" "}
                        {todayRecord.timeOut}
                      </span>
                    </Chip>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    isDisabled={marking}
                    onPress={handleMark}
                  >
                    {marking
                      ? "Checking out…"
                      : `Check out · in at ${todayRecord.timeIn}`}
                  </Button>
                )
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  isDisabled={marking}
                  onPress={handleMark}
                >
                  {marking
                    ? "Marking…"
                    : "+ Mark today's check-in"}
                </Button>
              )}
            </div>

            {/* =====================================================
                WEEKLY CHART
               ===================================================== */}
            <div className="mb-4 w-full rounded-xl border border-[var(--color-border)] p-3 sm:p-4">
              <h3 className="text-base font-semibold">
                Weekly Attendance Frequency
              </h3>

              <div
                className="
                  mt-4
                  flex
                  h-28
                  w-full
                  min-w-0
                  items-end
                  justify-between
                  gap-1
                  sm:gap-2
                "
              >
                {weekly.map((b) => (
                  <div
                    className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                    key={b.label}
                  >
                    <div
                      className="flex w-full max-w-8 items-end justify-center"
                      style={{
                        height: "calc(100% - 22px)",
                      }}
                    >
                      <div
                        className="w-full rounded-t-md bg-[var(--color-accent)] transition-all"
                        style={{
                          height: `${Math.max(
                            b.height,
                            b.count > 0 ? 8 : 2,
                          )}%`,
                          opacity:
                            b.count > 0 ? 1 : 0.25,
                        }}
                      />
                    </div>

                    <span className="mt-1 whitespace-nowrap text-[10px] text-[var(--color-muted)] sm:text-xs">
                      {b.label}
                      {b.count > 0
                        ? ` · ${b.count}`
                        : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* =====================================================
                NO ATTENDANCE
               ===================================================== */}
            {attendance.length === 0 ? (
              <div className="w-full rounded-xl border border-[var(--color-border)] p-4 text-sm text-[var(--color-muted)]">
                No check-ins recorded yet. Mark today's
                check-in to get started.
              </div>
            ) : (
              /* ===================================================
                 ATTENDANCE TABLE
                 =================================================== */
              <div className="w-full min-w-0 overflow-hidden rounded-xl border border-[var(--color-border)]">
                <div className="w-full min-w-0 overflow-x-auto">
                  <table className="w-full min-w-[620px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-[var(--color-border)]">
                        <th className="px-3 py-3 text-left font-medium">
                          Date
                        </th>

                        <th className="px-3 py-3 text-left font-medium">
                          In
                        </th>

                        <th className="px-3 py-3 text-left font-medium">
                          Out
                        </th>

                        <th className="px-3 py-3 text-right font-medium">
                          Weight (kg)
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {attendance.map((record) => (
                        <tr
                          key={record.id}
                          className="border-b border-[var(--color-border)] last:border-b-0"
                        >
                          <td className="whitespace-nowrap px-3 py-3">
                            {record.date.toLocaleDateString(
                              "en-IN",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </td>

                          <td className="whitespace-nowrap px-3 py-3">
                            {record.timeIn}
                          </td>

                          <td className="whitespace-nowrap px-3 py-3">
                            {record.timeOut ?? "—"}
                          </td>

                          <td className="px-3 py-3 text-right">
                            {editingWeightId ===
                            record.id ? (
                              <div className="flex min-w-max items-center justify-end gap-2">
                                <input
                                  className="h-9 w-20 rounded-lg border border-[var(--color-border)] bg-transparent px-2 text-right text-sm outline-none focus:border-[var(--color-accent)]"
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={weightDraft}
                                  onChange={(e) =>
                                    setWeightDraft(
                                      e.target.value,
                                    )
                                  }
                                />

                                <Button
                                  size="sm"
                                  isDisabled={
                                    savingWeightId ===
                                    record.id
                                  }
                                  onPress={() =>
                                    handleWeightSave(
                                      record,
                                    )
                                  }
                                >
                                  {savingWeightId ===
                                  record.id
                                    ? "…"
                                    : "✓"}
                                </Button>
                              </div>
                            ) : (
                              <div className="flex min-w-max items-center justify-end gap-2">
                                <span className="whitespace-nowrap">
                                  {record.weight !=
                                  null
                                    ? `${record.weight} kg`
                                    : "—"}
                                </span>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onPress={() =>
                                    startEditWeight(
                                      record,
                                    )
                                  }
                                >
                                  Edit
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          /* =======================================================
             PAYMENTS TAB
             ======================================================= */
          <>
            {/* =====================================================
                PAYMENT STATS
               ===================================================== */}
            <div className="mb-5 grid w-full min-w-0 grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <div className="min-w-0 rounded-xl border border-[var(--color-border)] p-3">
                <b className="block truncate text-sm sm:text-base">
                  {member.plan}
                </b>

                <span className="mt-1 block text-xs text-[var(--color-muted)]">
                  Current plan
                </span>
              </div>

              <div className="min-w-0 rounded-xl border border-[var(--color-border)] p-3">
                <b className="mono block truncate text-base sm:text-lg">
                  {member.expires}
                </b>

                <span className="mt-1 block text-xs text-[var(--color-muted)]">
                  Expiration date
                </span>
              </div>

              <div className="min-w-0 rounded-xl border border-[var(--color-border)] p-3">
                <b className="block truncate text-sm sm:text-base">
                  ₹
                  {lastPayment
                    ? lastPayment.amount.toLocaleString(
                        "en-IN",
                      )
                    : "—"}
                </b>

                <span className="mt-1 block text-xs text-[var(--color-muted)]">
                  Last payment
                </span>
              </div>

              <div className="min-w-0 rounded-xl border border-[var(--color-border)] p-3">
                <b className="block truncate text-sm sm:text-base">
                  {payments.length}
                </b>

                <span className="mt-1 block text-xs text-[var(--color-muted)]">
                  Total payments
                </span>
              </div>
            </div>

            {/* =====================================================
                PAYMENT HEADER
               ===================================================== */}
            <div className="mb-4 flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="min-w-0 text-base font-semibold">
                Payment ledger history
              </h3>

              <div className="shrink-0">
                <Chip
                  color={
                    member.status === "active"
                      ? "success"
                      : member.status === "expiring"
                        ? "warning"
                        : "danger"
                  }
                  variant="soft"
                  size="sm"
                >
                  {member.status === "active"
                    ? "Active"
                    : member.status === "expiring"
                      ? "Expiring"
                      : "Expired"}
                </Chip>
              </div>
            </div>

            {/* =====================================================
                NO PAYMENTS
               ===================================================== */}
            {payments.length === 0 ? (
              <div className="w-full rounded-xl border border-[var(--color-border)] p-4 text-sm text-[var(--color-muted)]">
                No payments recorded yet. Payments also
                assign/extend the membership plan.
              </div>
            ) : (
              /* ===================================================
                 PAYMENT TABLE
                 =================================================== */
              <div className="w-full min-w-0 overflow-hidden rounded-xl border border-[var(--color-border)]">
                <div className="w-full min-w-0 overflow-x-auto">
                  <table className="w-full min-w-[680px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-[var(--color-border)]">
                        <th className="px-3 py-3 text-left font-medium">
                          Date
                        </th>

                        <th className="px-3 py-3 text-left font-medium">
                          Plan
                        </th>

                        <th className="px-3 py-3 text-left font-medium">
                          Days
                        </th>

                        <th className="px-3 py-3 text-left font-medium">
                          Method
                        </th>

                        <th className="px-3 py-3 text-right font-medium">
                          Amount
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {payments.map((payment) => (
                        <tr
                          key={payment.id}
                          className="border-b border-[var(--color-border)] last:border-b-0"
                        >
                          <td className="whitespace-nowrap px-3 py-3 text-[var(--color-muted)]">
                            {payment.paidAt.toLocaleDateString(
                              "en-IN",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </td>

                          <td className="max-w-[180px] break-words px-3 py-3">
                            {payment.planName}
                          </td>

                          <td className="whitespace-nowrap px-3 py-3">
                            +{payment.daysAdded} days
                          </td>

                          <td className="whitespace-nowrap px-3 py-3 uppercase text-[var(--color-muted)]">
                            {payment.method}
                          </td>

                          <td className="whitespace-nowrap px-3 py-3 text-right font-medium">
                            ₹
                            {payment.amount.toLocaleString(
                              "en-IN",
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminModal>
  );
}

function Initials({
  children,
  tone,
}: {
  children: string;
  tone: "accent" | "info" | "warn" | "danger";
}) {
  const map = {
    accent: [
      "var(--color-accent-soft)",
      "var(--color-accent)",
    ],
    info: [
      "var(--color-info-soft)",
      "var(--color-info)",
    ],
    warn: [
      "var(--color-warn-soft)",
      "var(--color-warn)",
    ],
    danger: [
      "var(--color-danger-soft)",
      "var(--color-danger)",
    ],
  } as const;

  return (
    <span
      className="
        grid
        h-9
        w-9
        shrink-0
        place-items-center
        rounded-full
        text-[13px]
        font-semibold
      "
      style={{
        background: map[tone][0],
        color: map[tone][1],
      }}
    >
      {children}
    </span>
  );
}