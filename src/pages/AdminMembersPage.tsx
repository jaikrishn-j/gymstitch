import { useState } from "react";
import { Search } from "lucide-react";
import {
  AdminShell,
  Chip,
  Button,
  cn,
} from "../components/ui";
import { AdminModal } from "../components/modals/AdminModal";
import { useModal } from "../components/providers/ModalProvider";
import { RecordPaymentModal } from "../components/modals/RecordPaymentModal";
import type { PaymentData } from "../components/modals/RecordPaymentModal";
import { AddMemberModal } from "../components/modals/AddMemberModal";
import type { AddMemberData } from "../components/modals/AddMemberModal";

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

const MEMBERS: Member[] = [
  { id: "1", initials: "AS", tone: "accent", name: "Aarav Singh", email: "aarav@gmail.com", phone: "+91 98765 43210", plan: "Annual", status: "active", expires: "Jun 12, 2027" },
  { id: "2", initials: "PK", tone: "info", name: "Priya Kumar", email: "priya@gmail.com", phone: "+91 98765 43211", plan: "Quarterly", status: "active", expires: "Sep 2, 2026" },
  { id: "3", initials: "RM", tone: "warn", name: "Rahul Mehta", email: "rahul@gmail.com", phone: "+91 98765 43212", plan: "Monthly", status: "expiring", expires: "Aug 10, 2026" },
  { id: "4", initials: "NJ", tone: "danger", name: "Neha Joshi", email: "neha@gmail.com", phone: "+91 98765 43213", plan: "Monthly", status: "expired", expires: "Aug 1, 2026" },
  { id: "5", initials: "VS", tone: "accent", name: "Vikram Shah", email: "vikram@gmail.com", phone: "+91 98765 43214", plan: "Annual", status: "active", expires: "Mar 3, 2027" },
  { id: "6", initials: "SG", tone: "info", name: "Simran Gill", email: "simran@gmail.com", phone: "+91 98765 43215", plan: "Quarterly", status: "expired", expires: "Jul 22, 2026" },
];

type StatusFilter = "all" | "active" | "expiring" | "expired";

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All members (128)" },
  { key: "active", label: "Active (94)" },
  { key: "expiring", label: "Expiring soon (18)" },
  { key: "expired", label: "Expired (16)" },
];

const STATUS_BADGE: Record<
  Member["status"],
  { tone: "success" | "warning" | "danger"; label: string }
> = {
  active: { tone: "success", label: "Active" },
  expiring: { tone: "warning", label: "Expiring" },
  expired: { tone: "danger", label: "Expired" },
};

export type AdminMembersPageProps = {
  onAddMember: (data: AddMemberData) => Promise<void>;
  onRecordPayment: (data: PaymentData) => Promise<void>;
  onMarkAttendance: (member: Member) => void;
  onAssignPlan: (member: Member) => void;
};

export function AdminMembersPage({
  onAddMember,
  onRecordPayment,
  onMarkAttendance,
  onAssignPlan,
}: AdminMembersPageProps) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<Member | null>(null);
  const { open } = useModal();

  const visible = MEMBERS.filter((m) => {
    if (filter !== "all" && m.status !== filter) return false;
    if (query) {
      const haystack = `${m.name} ${m.email} ${m.plan}`.toLowerCase();
      if (!haystack.includes(query.toLowerCase())) return false;
    }
    return true;
  });

  const openPaymentModal = (member?: Member) => {
    const name = member?.name ?? "Aarav Singh";
    const id = member?.id ?? "MBR-1001";
    const email = member?.email ?? "aarav@gmail.com";
    const phone = member?.phone ?? "+91 98765 43210";
    const close = open(
      <RecordPaymentModal
        memberName={name}
        memberId={`MBR-${id}`}
        memberMeta={`${email} · ${phone}`}
        onSave={onRecordPayment}
        onClose={() => close()}
      />,
      "md",
    );
  };

  const openAddMember = () => {
    const close = open(
      <AddMemberModal
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
      status={{ mode: "offline", label: "Offline · 2 pending" }}
      topbarActions={
        <Button size="sm" onPress={() => openPaymentModal()}>
          Sync now
        </Button>
      }
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
        <Button variant="secondary" onPress={openAddMember}>
          + Add member
        </Button>
        <Button onPress={() => openPaymentModal()}>+ Record payment</Button>
      </div>

      <div className="status-filters">
        {FILTERS.map((f) => (
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
        <Button
          variant="secondary"
          size="sm"
          onPress={() => {
            const close = open(
              <RecordPaymentModal
                memberName={m.name}
                memberId={`MBR-${m.id}`}
                memberMeta={`${m.email} · ${m.phone}`}
                onSave={onRecordPayment}
                onClose={() => close()}
              />,
              "md",
            );
          }}
        >
          Record payment
        </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="muted small" style={{ margin: 12 }}>
          Showing <b>{visible.length}</b> of 128 members
        </div>
      </div>

      {detail ? <MemberDetailModal member={detail} onClose={() => setDetail(null)} onMarkAttendance={onMarkAttendance} onAssignPlan={onAssignPlan} /> : null}
    </AdminShell>
  );
}

function MemberDetailModal({
  member,
  onClose,
  onMarkAttendance,
  onAssignPlan,
}: {
  member: Member;
  onClose: () => void;
  onMarkAttendance: (member: Member) => void;
  onAssignPlan: (member: Member) => void;
}) {
  const [tab, setTab] = useState<"att" | "pay">("att");

  return (
    <AdminModal
      open
      onClose={onClose}
      title={member.name}
      subtitle={`${member.email} · ${member.phone} · Member since Jan 2024`}
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
            <Button
              variant="secondary"
              size="sm"
              onPress={() => onMarkAttendance(member)}
            >
              + Mark today's check-in
            </Button>
            <Button variant="ghost" size="sm" onPress={() => onAssignPlan(member)}>
              Assign new plan
            </Button>
          </div>
          <div className="card pad">
            <h3 style={{ fontSize: 16 }}>Weekly Attendance Frequency</h3>
            <div className="bar-chart" style={{ height: 120, marginTop: 16 }}>
              {[
                { h: 70, l: "Mon" },
                { h: 90, l: "Tue" },
                { h: 40, l: "Wed" },
                { h: 80, l: "Thu" },
                { h: 60, l: "Fri" },
                { h: 0, l: "Sat" },
                { h: 0, l: "Sun" },
              ].map((b) => (
                <div className="bar-wrap" key={b.l}>
                  <div className="bar" style={{ height: `${b.h}%` }} />
                  <span className="bar-label">{b.l}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>In</th>
                  <th>Out</th>
                  <th className="td-right">Weight</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Aug 7</td>
                  <td>09:10</td>
                  <td>10:05</td>
                  <td className="td-right">78.2 kg</td>
                </tr>
                <tr>
                  <td>Aug 6</td>
                  <td>08:40</td>
                  <td>09:30</td>
                  <td className="td-right">78.4 kg</td>
                </tr>
                <tr>
                  <td>Aug 5</td>
                  <td>09:55</td>
                  <td>10:45</td>
                  <td className="td-right">78.6 kg</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div className="detail-stats">
            <div className="detail-stat">
              <b>Annual Unlimited</b>
              <span>Current plan</span>
            </div>
            <div className="detail-stat">
              <b className="mono" style={{ fontSize: 18 }}>
                Jun 12, 2027
              </b>
              <span>Expiration date</span>
            </div>
            <div className="detail-stat">
              <b>₹5,999</b>
              <span>Last payment</span>
            </div>
            <div className="detail-stat">
              <b>3</b>
              <span>Total payments</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <h3 style={{ fontSize: 16 }}>Payment ledger history</h3>
            <Chip color="success" variant="soft" size="sm">
              Verified
            </Chip>
          </div>
          <div className="table-wrap">
            <table className="table">
              <tbody>
                <tr>
                  <td className="muted">Jun 12, 2026 · UPI</td>
                  <td className="td-right amt">₹5,999</td>
                </tr>
                <tr>
                  <td className="muted">Mar 12, 2026 · Card</td>
                  <td className="td-right amt">₹5,999</td>
                </tr>
                <tr>
                  <td className="muted">Jan 12, 2026 · UPI</td>
                  <td className="td-right amt">₹5,999</td>
                </tr>
              </tbody>
            </table>
          </div>
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