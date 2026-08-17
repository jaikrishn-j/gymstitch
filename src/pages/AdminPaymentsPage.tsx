import { useState } from "react";
import { Search } from "lucide-react";
import { AdminShell, Badge, Button } from "../components/ui";
import { AdminModal } from "../components/modals/AdminModal";
import { useModal } from "../components/providers/ModalProvider";
import { RecordPaymentModal } from "../components/modals/RecordPaymentModal";
import type { PaymentData } from "../components/modals/RecordPaymentModal";

type Txn = {
  initials: string;
  name: string;
  method: string;
  amount: string;
  date: string;
  status: "paid" | "pending";
};

const TXNS: Txn[] = [
  { initials: "AS", name: "Aarav Singh", method: "UPI", amount: "₹5,999", date: "Jun 12", status: "paid" },
  { initials: "PK", name: "Priya Kumar", method: "Card", amount: "₹2,499", date: "Aug 2", status: "paid" },
  { initials: "RM", name: "Rahul Mehta", method: "Cash", amount: "₹899", date: "Jul 28", status: "pending" },
  { initials: "NJ", name: "Neha Joshi", method: "UPI", amount: "₹1,499", date: "Jul 21", status: "paid" },
  { initials: "VS", name: "Vikram Shah", method: "Card", amount: "₹5,999", date: "Jul 14", status: "paid" },
];

const SOURCES = [
  { label: "Online (Razorpay)", pct: "58%", color: "var(--color-accent)" },
  { label: "Manual · Cash", pct: "19%", color: "var(--color-warn)" },
  { label: "Manual · UPI / Card", pct: "23%", color: "var(--color-info)" },
];

export type AdminPaymentsPageProps = {
  onRecordPayment: (data: PaymentData) => void;
  onPrintReceipt: () => void;
};

export function AdminPaymentsPage({
  onRecordPayment,
  onPrintReceipt,
}: AdminPaymentsPageProps) {
  const [detail, setDetail] = useState<Txn | null>(null);
  const { open } = useModal();

  const openPaymentModal = () => {
    const close = open(
      <RecordPaymentModal
        memberName="Aarav Singh"
        memberId="MBR-1001"
        memberMeta="aarav@gmail.com · +91 98765 43210"
        onSave={onRecordPayment}
        onClose={() => close()}
      />,
      "md",
    );
  };

  return (
    <AdminShell title="Payments Ledger" active="payments" status={{ mode: "online", label: "Online" }}>
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
          <Button onPress={openPaymentModal}>+ Record manual payment</Button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="card stat-card card-hover reveal">
          <div className="top">
            <span className="stat-label">Total collected</span>
          </div>
          <div className="stat-num">₹12,89,000</div>
          <span className="delta up">+15% this year</span>
        </div>
        <div className="card stat-card card-hover reveal">
          <div className="top">
            <span className="stat-label">This month</span>
          </div>
          <div className="stat-num">₹4,21,800</div>
          <span className="delta up">+12.4% vs last mo</span>
        </div>
        <div className="card stat-card card-hover reveal">
          <div className="top">
            <span className="stat-label">Total transactions</span>
          </div>
          <div className="stat-num">94</div>
        </div>
        <div className="card stat-card card-hover reveal">
          <div className="top">
            <span className="stat-label">Pending sync</span>
          </div>
          <div className="stat-num" style={{ color: "var(--color-warn)" }}>
            3
          </div>
        </div>
      </div>

      <div className="grid-pay">
        <div className="card reveal">
          <div className="toolbar" style={{ padding: "16px 20px", margin: 0, borderBottom: "1px solid var(--color-border)" }}>
            <div className="search">
              <Search />
              <input className="input" placeholder="Search by member or ID…" />
            </div>
            <Button variant="secondary" size="sm" onPress={openPaymentModal}>
              Record payment
            </Button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Method</th>
                <th>Amount</th>
                <th className="td-right">Date</th>
                <th className="td-right">Status</th>
                <th className="td-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {TXNS.map((t) => (
                <tr key={t.name} onClick={() => setDetail(t)}>
                  <td data-label="Member">
                    <span className="mono small">{t.initials}</span> {t.name}
                  </td>
                  <td data-label="Method">{t.method}</td>
                  <td data-label="Amount" className="amt">
                    {t.amount}
                  </td>
                  <td data-label="Date" className="td-right">
                    {t.date}
                  </td>
                  <td data-label="Status" className="td-right">
                    <Badge
                      color={t.status === "paid" ? "success" : "warning"}
                      variant="soft"
                      size="sm"
                    >
                      {t.status === "paid" ? "Paid" : "Pending"}
                    </Badge>
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
            <button type="button" disabled>
              ‹
            </button>
            {["1", "2", "3", "4"].map((p) => (
              <button key={p} type="button" className={p === "1" ? "active" : ""}>
                {p}
              </button>
            ))}
            <button type="button">›</button>
          </div>
        </div>

        <div className="card reveal" style={{ padding: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>
            Payment source split
          </div>
          <div className="flex flex-col gap-4">
            {SOURCES.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between" style={{ marginBottom: 4 }}>
                  <span className="muted text-sm">{s.label}</span>
                  <b className="src-num">{s.pct}</b>
                </div>
                <div
                  className="progress"
                  style={{ height: 8, background: "var(--color-border)", borderRadius: 4, overflow: "hidden" }}
                >
                  <div
                    className="fill"
                    style={{ width: s.pct, height: "100%", background: s.color }}
                  />
                </div>
              </div>
            ))}
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
                <circle
                  className="seg"
                  cx="75"
                  cy="75"
                  r="60"
                  style={{
                    stroke: "var(--color-accent)",
                    strokeDasharray: "184.7 377",
                    strokeDashoffset: 0,
                  }}
                />
                <circle
                  className="seg"
                  cx="75"
                  cy="75"
                  r="60"
                  style={{
                    stroke: "var(--color-info)",
                    strokeDasharray: "120.6 377",
                    strokeDashoffset: -184.7,
                  }}
                />
                <circle
                  className="seg"
                  cx="75"
                  cy="75"
                  r="60"
                  style={{
                    stroke: "var(--color-warn)",
                    strokeDasharray: "71.6 377",
                    strokeDashoffset: -305.3,
                  }}
                />
              </svg>
              <div className="center">
                <div>
                  <b>94</b>
                  <span>txns</span>
                </div>
              </div>
            </div>
            <div className="legend">
              <LegendRow color="var(--color-accent)" label="UPI" value="49%" />
              <LegendRow color="var(--color-info)" label="Card" value="32%" />
              <LegendRow color="var(--color-warn)" label="Cash" value="19%" />
            </div>
          </div>
        </div>
      </div>

      {detail ? <TxnDetailModal txn={detail} onClose={() => setDetail(null)} onPrint={onPrintReceipt} /> : null}
    </AdminShell>
  );
}

function TxnDetailModal({
  txn,
  onClose,
  onPrint,
}: {
  txn: Txn;
  onClose: () => void;
  onPrint: () => void;
}) {
  return (
    <AdminModal
      open
      onClose={onClose}
      title="Transaction details"
      subtitle="PAY-2026-0842 · UPI · Razorpay Gateway"
      footer={
        <>
          <Button variant="secondary" onPress={onClose}>
            Close
          </Button>
          <Button
            onPress={() => {
              onPrint();
              onClose();
            }}
          >
            Print receipt
          </Button>
        </>
      }
    >
      <div style={{ textAlign: "center", padding: "8px 0 18px" }}>
        <div className="stat-num" style={{ fontSize: 38 }}>
          ₹5,999
        </div>
        <span className="ring-badge badge-green" style={{ marginTop: 8 }}>
          Verified · Success
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
          {txn.initials}
        </span>
        <div>
          <div style={{ fontWeight: 550 }}>{txn.name}</div>
          <div className="muted small">aarav@gmail.com</div>
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
          <b>+365 days</b>
        </div>
        <div className="muted">Payment method</div>
        <div className="td-right">UPI (Razorpay)</div>
        <div className="muted">Date &amp; Time</div>
        <div className="td-right">Jun 12, 2026, 14:22</div>
        <div className="muted">Recorded by</div>
        <div className="td-right">Auto-gateway</div>
      </div>
      <div style={{ marginTop: 16 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>
          Gateway Reference ID
        </div>
        <code
          className="mono muted small"
          style={{
            background: "var(--color-surface)",
            padding: "6px 10px",
            borderRadius: 6,
            display: "block",
          }}
        >
          pay_2026_razorpay_8f3a92
        </code>
      </div>
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