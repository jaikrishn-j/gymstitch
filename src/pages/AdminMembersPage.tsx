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
import type { AddMemberData, PlanOption } from "../components/modals/AddMemberModal";

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
  { tone: "success" | "warning" | "danger"; label: string }
> = {
  active: { tone: "success", label: "Active" },
  expiring: { tone: "warning", label: "Expiring" },
  expired: { tone: "danger", label: "Expired" },
};

export type AdminMembersPageProps = {
  members: Member[];
  plans: PlanOption[];
  payments: PaymentRow[];
  attendance: AttendanceRow[];
  loading?: boolean;
  lastSyncedAt?: number | null;
  pendingCount?: number;
  isOnline?: boolean;
  syncing?: boolean;
  onSync?: () => void;
  onAddMember: (data: AddMemberData) => Promise<void>;
  onRecordPayment: (member: Member, data: PaymentData) => Promise<void>;
  onMarkAttendance: (member: Member) => Promise<void>;
  onUpdateWeight: (member: Member, attendanceId: string, weight: number) => Promise<void>;
};

export function AdminMembersPage({
  members,
  plans,
  payments,
  attendance,
  loading,
  lastSyncedAt,
  pendingCount = 0,
  isOnline = true,
  syncing = false,
  onSync,
  onAddMember,
  onRecordPayment,
  onMarkAttendance,
  onUpdateWeight,
}: AdminMembersPageProps) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<Member | null>(null);
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

  const filters: { key: StatusFilter; label: string }[] = [
    { key: "all", label: `All members (${counts.all})` },
    { key: "active", label: `Active (${counts.active})` },
    { key: "expiring", label: `Expiring soon (${counts.expiring})` },
    { key: "expired", label: `Expired (${counts.expired})` },
  ];

  const visible = members.filter((m) => {
    if (filter !== "all" && m.status !== filter) return false;
    if (query) {
      const haystack = `${m.name} ${m.email} ${m.plan}`.toLowerCase();
      if (!haystack.includes(query.toLowerCase())) return false;
    }
    return true;
  });

  const openPaymentModal = (member: Member) => {
    const closeModal = () => closeModalRef.current?.();
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
    >
      <div className="page-head">
        <div>
          <div className="eyebrow">Database & Directory</div>
          <h2>Active Members</h2>
          <p className="sub">
            Search members, monitor subscription expiration, and record
            payments offline.
          </p>
        </div>
      </div>

      <div className="toolbar">
        <div className="search">
          <Search />
          <input
            className="input"
            placeholder="Search by name, email, or plan…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <SyncBar
          lastSyncedAt={lastSyncedAt}
          pendingCount={pendingCount}
          isOnline={isOnline}
          syncing={syncing}
          onSync={onSync ?? (() => {})}
        />
        <Button variant="secondary" onPress={openAddMember}>
          + Add member
        </Button>
      </div>

      <div className="status-filters">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            className={cn("status-filter", filter === f.key && "active")}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card pad muted">Loading members…</div>
      ) : visible.length === 0 ? (
        <div className="card pad">
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
      <div className="card table-wrap reveal in">
        <table className="table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Plan</th>
              <th>Status</th>
              <th className="td-right">Expires</th>
              <th className="td-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((m) => (
              <tr key={m.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Initials tone={m.tone}>{m.initials}</Initials>
                    <div>
                      <div style={{ fontWeight: 550 }}>{m.name}</div>
                      <div className="muted small">
                        {m.email} · {m.phone}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{m.plan}</td>
                <td>
                  <Chip color={STATUS_BADGE[m.status].tone} variant="soft" size="sm">
                    {STATUS_BADGE[m.status].label}
                  </Chip>
                </td>
                <td className="td-right amt">{m.expires}</td>
                <td className="td-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onPress={() => setDetail(m)}>
                      View
                    </Button>
                    <Button variant="secondary" size="sm" onPress={() => openPaymentModal(m)}>
                      Record payment
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="muted small" style={{ margin: 12 }}>
          Showing <b>{visible.length}</b> of {members.length} members
        </div>
      </div>
      )}

      {detail ? (
        <MemberDetailModal
          member={detail}
          payments={payments.filter((p) => p.memberId === detail.id)}
          attendance={attendance.filter((a) => a.memberId === detail.id)}
          onMarkAttendance={onMarkAttendance}
          onUpdateWeight={onUpdateWeight}
          onClose={() => setDetail(null)}
        />
      ) : null}
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
  onUpdateWeight: (member: Member, attendanceId: string, weight: number) => Promise<void>;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"att" | "pay">("att");
  const [marking, setMarking] = useState(false);
  const [editingWeightId, setEditingWeightId] = useState<string | null>(null);
  const [weightDraft, setWeightDraft] = useState("");
  const [savingWeightId, setSavingWeightId] = useState<string | null>(null);

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
      const diff = (d.getTime() - weekStart.getTime()) / DAY_MS;
      if (diff >= 0 && diff < 7) counts[diff] += 1;
    }
    const max = Math.max(...counts, 1);
    return counts.map((count, i) => ({
      label: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
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
    setWeightDraft(record.weight != null ? String(record.weight) : "");
  };

  const handleWeightSave = async (record: AttendanceRow) => {
    const parsed = Number(weightDraft);
    if (Number.isNaN(parsed) || parsed <= 0) return;
    setSavingWeightId(record.id);
    try {
      await onUpdateWeight(member, record.id, parsed);
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
        <>
          <Button variant="secondary" onPress={onClose}>
            Close
          </Button>
        </>
      }
    >
      <div className="tabs">
        <button
          type="button"
          className={cn(tab === "att" && "active")}
          onClick={() => setTab("att")}
        >
          Attendance &amp; Weights
        </button>
        <button
          type="button"
          className={cn(tab === "pay" && "active")}
          onClick={() => setTab("pay")}
        >
          Payments &amp; Plan
        </button>
      </div>

      {tab === "att" ? (
        <>
          <div className="flex flex-wrap gap-2.5">
            {todayRecord ? (
              todayRecord.timeOut ? (
                <Chip color="success" variant="soft" size="sm">
                  Checked in {todayRecord.timeIn} → out {todayRecord.timeOut}
                </Chip>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  isDisabled={marking}
                  onPress={handleMark}
                >
                  {marking ? "Checking out…" : `Check out · in at ${todayRecord.timeIn}`}
                </Button>
              )
            ) : (
              <Button
                variant="secondary"
                size="sm"
                isDisabled={marking}
                onPress={handleMark}
              >
                {marking ? "Marking…" : "+ Mark today's check-in"}
              </Button>
            )}
          </div>
          <div className="card pad">
            <h3 style={{ fontSize: 16 }}>Weekly Attendance Frequency</h3>
            <div className="bar-chart" style={{ height: 120, marginTop: 16 }}>
              {weekly.map((b) => (
                <div className="bar-wrap" key={b.label}>
                  <div className="bar" style={{ height: `${b.height}%` }} />
                  <span className="bar-label">
                    {b.label}
                    {b.count > 0 ? ` · ${b.count}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {attendance.length === 0 ? (
            <div className="card pad muted">
              No check-ins recorded yet. Mark today's check-in to get started.
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>In</th>
                    <th>Out</th>
                    <th className="td-right">Weight (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={record.id}>
                      <td>
                        {record.date.toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td>{record.timeIn}</td>
                      <td>{record.timeOut ?? "—"}</td>
                      <td className="td-right">
                        {editingWeightId === record.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <input
                              className="input"
                              style={{ width: 88, textAlign: "right" }}
                              type="number"
                              min="0"
                              step="0.1"
                              value={weightDraft}
                              onChange={(e) => setWeightDraft(e.target.value)}
                            />
                            <Button
                              size="sm"
                              isDisabled={savingWeightId === record.id}
                              onPress={() => handleWeightSave(record)}
                            >
                              {savingWeightId === record.id ? "…" : "✓"}
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <span>{record.weight != null ? `${record.weight} kg` : "—"}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onPress={() => startEditWeight(record)}
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
          )}
        </>
      ) : (
        <>
          <div className="detail-stats">
            <div className="detail-stat">
              <b>{member.plan}</b>
              <span>Current plan</span>
            </div>
            <div className="detail-stat">
              <b className="mono" style={{ fontSize: 18 }}>
                {member.expires}
              </b>
              <span>Expiration date</span>
            </div>
            <div className="detail-stat">
              <b>₹{lastPayment ? lastPayment.amount.toLocaleString("en-IN") : "—"}</b>
              <span>Last payment</span>
            </div>
            <div className="detail-stat">
              <b>{payments.length}</b>
              <span>Total payments</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <h3 style={{ fontSize: 16 }}>Payment ledger history</h3>
            <Chip color="success" variant="soft" size="sm">
              {member.status === "active" ? "Active" : member.status === "expiring" ? "Expiring" : "Expired"}
            </Chip>
          </div>
          {payments.length === 0 ? (
            <div className="card pad muted">
              No payments recorded yet. Payments also assign/extend the
              membership plan.
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Plan</th>
                    <th>Days</th>
                    <th>Method</th>
                    <th className="td-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="muted">
                        {payment.paidAt.toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td>{payment.planName}</td>
                      <td>+{payment.daysAdded} days</td>
                      <td className="muted uppercase">{payment.method}</td>
                      <td className="td-right amt">
                        ₹{payment.amount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
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
    accent: ["var(--color-accent-soft)", "var(--color-accent)"],
    info: ["var(--color-info-soft)", "var(--color-info)"],
    warn: ["var(--color-warn-soft)", "var(--color-warn)"],
    danger: ["var(--color-danger-soft)", "var(--color-danger)"],
  } as const;
  return (
    <span
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[13px] font-semibold"
      style={{ background: map[tone][0], color: map[tone][1] }}
    >
      {children}
    </span>
  );
}