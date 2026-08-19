import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AdminShell, Chip, Button, SyncBar, EmptyState } from "../components/ui";
import { AdminModal } from "../components/modals/AdminModal";
import { useModal } from "../components/providers/ModalProvider";
import { RecordPaymentModal } from "../components/modals/RecordPaymentModal";
import type { PaymentData, PaymentMember } from "../components/modals/RecordPaymentModal";
import type { PlanOption } from "../components/modals/AddMemberModal";
import type { PaymentRow } from "./AdminMembersPage";

export type AdminPaymentsPageProps = {
  payments: PaymentRow[];
  members: PaymentMember[];
  plans: PlanOption[];
  loading: boolean;
  lastSyncedAt?: number | null;
  pendingCount?: number;
  isOnline?: boolean;
  syncing?: boolean;
  onSync?: () => void;
  onRecordPayment: (member: PaymentMember, data: PaymentData) => Promise<void>;
  onPrintReceipt: (payment: PaymentRow) => void;
};

const PER_PAGE = 10;

const METHOD_COLORS: Record<string, string> = {
  UPI: "var(--color-accent)",
  Card: "var(--color-info)",
  Cash: "var(--color-warn)",
};

function methodBucket(method: string): "UPI" | "Card" | "Cash" {
  const s = (method ?? "").toLowerCase();
  if (s.includes("upi")) return "UPI";
  if (s.includes("card")) return "Card";
  return "Cash";
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AdminPaymentsPage({
  payments,
  members,
  plans,
  loading,
  lastSyncedAt,
  pendingCount = 0,
  isOnline = true,
  syncing = false,
  onSync,
  onRecordPayment,
  onPrintReceipt,
}: AdminPaymentsPageProps) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<PaymentRow | null>(null);
  const { open } = useModal();

  const stats = useMemo(() => {
    const now = new Date();
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    const thisMonth = payments
      .filter(
        (p) =>
          p.paidAt.getMonth() === now.getMonth() &&
          p.paidAt.getFullYear() === now.getFullYear(),
      )
      .reduce((sum, p) => sum + p.amount, 0);
    const buckets = { UPI: 0, Card: 0, Cash: 0 };
    for (const p of payments) buckets[methodBucket(p.method)] += 1;
    const count = payments.length;
    const pct = (key: keyof typeof buckets) =>
      count ? Math.round((buckets[key] / count) * 100) : 0;
    return {
      total,
      thisMonth,
      count,
      buckets,
      upiPct: pct("UPI"),
      cardPct: pct("Card"),
      cashPct: pct("Cash"),
    };
  }, [payments]);

  const visible = useMemo(
    () =>
      payments.filter((p) => {
        if (!query) return true;
        const haystack = `${p.memberName} ${p.memberId} ${p.method} ${p.planName}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      }),
    [payments, query],
  );

  const pageCount = Math.max(1, Math.ceil(visible.length / PER_PAGE));
  const safePage = Math.min(page, pageCount);
  const pageRows = visible.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const donutSegments = useMemo(() => {
    const total = Math.max(stats.count, 1);
    const circumference = 377;
    const segments = [];
    let acc = 0;
    for (const key of ["UPI", "Card", "Cash"] as const) {
      const len = (stats.buckets[key] / total) * circumference;
      segments.push({ key, len, offset: -acc });
      acc += len;
    }
    return segments;
  }, [stats.buckets, stats.count]);

  const openPaymentModal = () => {
    const close = open(
      <RecordPaymentModal
        members={members}
        plans={plans}
        onSave={async (data) => {
          const member = members.find((m) => m.id === data.memberId);
          if (!member) throw new Error("member-required");
          await onRecordPayment(member, data);
          close();
        }}
        onClose={() => close()}
      />,
      "md",
    );
  };

  return (
    <AdminShell
      title="Payments Ledger"
      active="payments"
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
          <div className="eyebrow">Financials</div>
          <h2>Transaction Ledger</h2>
          <p className="sub">
            Complete audit trail of online Razorpay collections and manual
            cash/UPI entries.
          </p>
        </div>
        <div className="actions">
          <Button onPress={openPaymentModal} isDisabled={members.length === 0}>
            + Record manual payment
          </Button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="card stat-card card-hover reveal">
          <div className="top">
            <span className="stat-label">Total collected</span>
          </div>
          <div className="stat-num">
            {loading ? "…" : `₹${stats.total.toLocaleString("en-IN")}`}
          </div>
          <span className="delta up">{stats.count} transactions</span>
        </div>
        <div className="card stat-card card-hover reveal">
          <div className="top">
            <span className="stat-label">This month</span>
          </div>
          <div className="stat-num">
            {loading ? "…" : `₹${stats.thisMonth.toLocaleString("en-IN")}`}
          </div>
          <span className="delta up">Manual + online</span>
        </div>
        <div className="card stat-card card-hover reveal">
          <div className="top">
            <span className="stat-label">Total transactions</span>
          </div>
          <div className="stat-num">{loading ? "…" : stats.count}</div>
        </div>
        <div className="card stat-card card-hover reveal">
          <div className="top">
            <span className="stat-label">Pending sync</span>
          </div>
          <div className="stat-num" style={{ color: "var(--color-warn)" }}>
            {pendingCount}
          </div>
        </div>
      </div>

      <div className="grid-pay">
        <div className="card reveal">
          <div className="toolbar" style={{ padding: "16px 20px", margin: 0, borderBottom: "1px solid var(--color-border)" }}>
            <div className="search">
              <Search />
              <input
                className="input"
                placeholder="Search by member, ID, method…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <SyncBar
              lastSyncedAt={lastSyncedAt}
              pendingCount={pendingCount}
              isOnline={isOnline}
              syncing={syncing}
              onSync={onSync ?? (() => {})}
            />
          </div>

          {loading ? (
            <div className="card pad muted">Loading payments…</div>
          ) : pageRows.length === 0 ? (
            <div className="card pad">
              <EmptyState
                icon={<Search size={28} />}
                title={query ? "No matching payments" : "No payments yet"}
                description={
                  query
                    ? "Try a different search."
                    : "Record your first payment to start the ledger."
                }
              />
            </div>
          ) : (
            <>
              <table className="table table-responsive">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Plan</th>
                    <th>Method</th>
                    <th className="td-right">Amount</th>
                    <th className="td-right">Date</th>
                    <th className="td-right">Status</th>
                    <th className="td-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((t) => (
                    <tr key={t.id}>
                      <td data-label="Member">
                        <span className="mono small">{initials(t.memberName)}</span> {t.memberName}
                      </td>
                      <td data-label="Plan">
                        {t.planName}
                        {t.daysAdded > 0 ? (
                          <span className="muted small"> · +{t.daysAdded}d</span>
                        ) : null}
                      </td>
                      <td data-label="Method">
                        <span className="muted uppercase">{t.method}</span>
                      </td>
                      <td data-label="Amount" className="td-right amt">
                        ₹{t.amount.toLocaleString("en-IN")}
                      </td>
                      <td data-label="Date" className="td-right muted">
                        {t.paidAt.toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td data-label="Status" className="td-right">
                        <Chip
                          color={t.status === "pending" ? "warning" : "success"}
                          variant="soft"
                          size="sm"
                        >
                          {t.status === "pending" ? "Pending sync" : "Paid"}
                        </Chip>
                      </td>
                      <td className="td-right">
                        <Button variant="ghost" size="sm" onPress={() => setDetail(t)}>
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ‹
                </button>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={p === safePage ? "active" : ""}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={safePage >= pageCount}
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                >
                  ›
                </button>
              </div>
              <div className="muted small" style={{ padding: "8px 20px" }}>
                Showing <b>{pageRows.length}</b> of {visible.length} payments
                {visible.length !== payments.length ? ` (filtered from ${payments.length})` : ""}
              </div>
            </>
          )}
        </div>

        <div className="card reveal" style={{ padding: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>
            Payment source split
          </div>
          <div className="flex flex-col gap-4">
            {(["UPI", "Card", "Cash"] as const).map((key) => {
              const pct =
                key === "UPI"
                  ? stats.upiPct
                  : key === "Card"
                    ? stats.cardPct
                    : stats.cashPct;
              return (
                <div key={key}>
                  <div className="flex justify-between" style={{ marginBottom: 4 }}>
                    <span className="muted text-sm">{key}</span>
                    <b className="src-num">{pct}%</b>
                  </div>
                  <div
                    className="progress"
                    style={{ height: 8, background: "var(--color-border)", borderRadius: 4, overflow: "hidden" }}
                  >
                    <div
                      className="fill"
                      style={{ width: `${pct}%`, height: "100%", background: METHOD_COLORS[key] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="eyebrow" style={{ margin: "28px 0 16px" }}>
            Method breakdown share
          </div>
          <div className="donut-wrap" style={{ gap: 18 }}>
            <div className="donut" style={{ width: 120, height: 120 }}>
              <svg viewBox="0 0 150 150">
                <circle
                  className="track"
                  cx="75"
                  cy="75"
                  r="60"
                  strokeDasharray="377"
                  strokeDashoffset="0"
                  style={{ stroke: "var(--color-border)" }}
                />
                {donutSegments.map((seg) => (
                  <circle
                    key={seg.key}
                    className="seg"
                    cx="75"
                    cy="75"
                    r="60"
                    style={{
                      stroke: METHOD_COLORS[seg.key],
                      strokeDasharray: `${seg.len} 377`,
                      strokeDashoffset: seg.offset,
                    }}
                  />
                ))}
              </svg>
              <div className="center">
                <div>
                  <b>{stats.count}</b>
                  <span>txns</span>
                </div>
              </div>
            </div>
            <div className="legend">
              <LegendRow color={METHOD_COLORS.UPI} label="UPI" value={`${stats.upiPct}%`} />
              <LegendRow color={METHOD_COLORS.Card} label="Card" value={`${stats.cardPct}%`} />
              <LegendRow color={METHOD_COLORS.Cash} label="Cash" value={`${stats.cashPct}%`} />
            </div>
          </div>

          <div className="muted small" style={{ marginTop: 18 }}>
            {stats.count === 0
              ? "No payments recorded yet."
              : `Distribution across ${stats.count} recorded transaction${stats.count === 1 ? "" : "s"}.`}
          </div>
        </div>
      </div>

      {detail ? (
        <PaymentDetailModal
          payment={detail}
          onClose={() => setDetail(null)}
          onPrint={() => onPrintReceipt(detail)}
        />
      ) : null}
    </AdminShell>
  );
}

function PaymentDetailModal({
  payment,
  onClose,
  onPrint,
}: {
  payment: PaymentRow;
  onClose: () => void;
  onPrint: () => void;
}) {
  return (
    <AdminModal
      open
      onClose={onClose}
      title={payment.memberName}
      subtitle={`Payment reference · ${payment.id.slice(-8).toUpperCase()}`}
      footer={
        <>
          <Button variant="secondary" onPress={onClose}>
            Close
          </Button>
          <Button onPress={onPrint}>Print receipt</Button>
        </>
      }
    >
      <div style={{ textAlign: "center", padding: "8px 0 18px" }}>
        <div className="stat-num" style={{ fontSize: 38 }}>
          ₹{payment.amount.toLocaleString("en-IN")}
        </div>
        <span className="ring-badge badge-green" style={{ marginTop: 8 }}>
          {payment.status === "pending" ? "Pending sync" : "Verified · Success"}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 0",
          borderTop: "1px solid var(--color-border)",
          borderBottom: "1px solid var(--color-border)",
          marginBottom: 14,
        }}
      >
        <span
          className="grid h-[38px] w-[38px] place-items-center rounded-full font-semibold"
          style={{ background: "var(--color-accent-soft)", color: "var(--color-accent)" }}
        >
          {initials(payment.memberName)}
        </span>
        <div>
          <div style={{ fontWeight: 550 }}>{payment.memberName}</div>
          <div className="muted small">{payment.memberId}</div>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px 20px",
          fontSize: 14,
        }}
      >
        <div className="muted">Plan extended</div>
        <div className="td-right">
          <b>{payment.planName}</b>
        </div>
        <div className="muted">Days added</div>
        <div className="td-right">+{payment.daysAdded} days</div>
        <div className="muted">Payment method</div>
        <div className="td-right uppercase">{payment.method}</div>
        <div className="muted">Date &amp; Time</div>
        <div className="td-right">
          {payment.paidAt.toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </div>
      </div>
      {payment.notes ? (
        <div style={{ marginTop: 16 }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            Notes
          </div>
          <div className="muted small">{payment.notes}</div>
        </div>
      ) : null}
    </AdminModal>
  );
}

function LegendRow({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="li">
      <span className="sw" style={{ background: color }} />
      {label}
      <b className="v">{value}</b>
    </div>
  );
}