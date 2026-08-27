import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { CalendarCheck, CreditCard, Megaphone, ShoppingCart, UserPlus, Wrench } from "lucide-react";
import {
  AdminShell,
  Chip,
  Button,
  cn,
} from "../components/ui";
import { AdminModal } from "../components/modals/AdminModal";
import { useModal } from "../components/providers/ModalProvider";
import { AddMemberModal } from "../components/modals/AddMemberModal";
import type { AddMemberData, PlanOption } from "../components/modals/AddMemberModal";
import { RecordPaymentModal } from "../components/modals/RecordPaymentModal";
import type { PaymentData, PaymentMember } from "../components/modals/RecordPaymentModal";
import { NewPlanModal } from "../components/modals/NewPlanModal";
import type { PlanData } from "../components/modals/NewPlanModal";
import { AddEquipmentModal } from "../components/modals/AddEquipmentModal";
import type { EquipmentData } from "../components/modals/AddEquipmentModal";

export type PendingRequest = {
  id: string;
  memberId: string;
  memberName: string;
  planId: string;
  planName: string;
  amount: number;
  daysAdded: number;
};

export type AdminDashboardPageProps = {
  onAddMember: (data: AddMemberData) => Promise<void>;
  onRecordPayment: (data: PaymentData) => Promise<void>;
  onNewPlan: (data: PlanData) => Promise<void>;
  onAddEquipment: (data: EquipmentData) => Promise<void>;
  plans?: PlanOption[];
  members?: PaymentMember[];
  pendingRequests: PendingRequest[];
  onApproveRequest: (
    request: PendingRequest,
    data: PaymentData,
  ) => Promise<void>;
  onRejectRequest: (request: PendingRequest) => void;
  onLogout: () => void;
};

const REV_BARS = [
  { label: "Feb", val: "2.1L", w: 46 },
  { label: "Mar", val: "2.7L", w: 58 },
  { label: "Apr", val: "2.4L", w: 50 },
  { label: "May", val: "3.5L", w: 74 },
  { label: "Jun", val: "3.2L", w: 68 },
  { label: "Jul", val: "3.8L", w: 80 },
  { label: "Aug", val: "4.2L", w: 96, hi: true },
];

export function AdminDashboardPage({
  onAddMember,
  onRecordPayment,
  onNewPlan,
  onAddEquipment,
  plans = [],
  members = [],
  pendingRequests,
  onApproveRequest,
  onRejectRequest,
  onLogout,
}: AdminDashboardPageProps) {
  const [period, setPeriod] = useState<"6M" | "1Y">("6M");
  const [showNotif, setShowNotif] = useState(false);
  const { open } = useModal();
  const approveModalCloseRef = useRef<(() => void) | null>(null);

  const openMemberModal = () => {
    const close = open(
      <AddMemberModal onSave={onAddMember} plans={plans} onClose={() => close()} />,
      "lg",
    );
  };
  const openPaymentModal = () => {
    const close = open(
      <RecordPaymentModal
        members={members}
        plans={plans}
        onSave={onRecordPayment}
        onClose={() => close()}
      />,
      "md",
    );
  };

  /** Opens the record-payment modal pre-filled with the member's requested plan. */
  const openApproveModal = (request: PendingRequest) => {
    const closeModal = () => {
      approveModalCloseRef.current?.();
    };

    approveModalCloseRef.current = open(
      <RecordPaymentModal
        memberName={request.memberName}
        memberId={request.memberId}
        plans={plans}
        defaultPlanId={request.planId}
        presetAmount={request.amount}
        presetDays={request.daysAdded}
        onSave={async (data) => {
          await onApproveRequest(request, data);
          closeModal();
        }}
        onClose={closeModal}
      />,
      "md",
    );
  };
  const openPlanModal = () => {
    const close = open(
      <NewPlanModal onSave={onNewPlan} onClose={() => close()} />,
      "md",
    );
  };
  const openEquipmentModal = () => {
    const close = open(
      <AddEquipmentModal onSave={onAddEquipment} onClose={() => close()} />,
      "lg",
    );
  };

  return (
    <AdminShell
      title="GymStitch Admin"
      active="dashboard"
      status={{ mode: "online", label: "Live Sync" }}
      sidebarFoot={
        <a className="nav-item" href="/">
          View overview
        </a>
      }
      pendingCount={pendingRequests.length}
      onNotifications={() => setShowNotif(true)}
      onLogout={onLogout}
    >
      <div className="greeting">
        <div>
          <div className="eyebrow">Monday, August 7 · Elite Fitness HQ</div>
          <h2 className="g">Good morning, Rohan.</h2>
        </div>
        <Button onPress={openMemberModal}>+ Quick Add Member</Button>
      </div>

      <div className="stat-grid">
        <div className="card stat-card card-hover reveal">
          <div className="stat-label">Active members</div>
          <div className="stat-num">128</div>
          <div className="delta up">+8 this month</div>
        </div>
        <div className="card stat-card card-hover reveal">
          <div className="stat-label">Revenue this month</div>
          <div className="stat-num">₹4,21,800</div>
          <div className="delta up">+12.4% vs last mo</div>
        </div>
        <div className="card stat-card card-hover reveal">
          <div className="stat-label">Today's check-ins</div>
          <div className="stat-num">42</div>
          <div className="delta up">vs 38 daily avg</div>
        </div>
        <div className="card stat-card card-hover reveal">
          <div className="stat-label">Pending requests</div>
          <div className="stat-num" style={{ color: "var(--color-accent)" }}>
            {pendingRequests.length}
          </div>
          {pendingRequests.length > 0 ? (
            <button
              type="button"
              className="delta down"
              style={{ color: "var(--color-accent)", border: 0, background: "none", cursor: "pointer" }}
              onClick={() => setShowNotif(true)}
            >
              Review requests →
            </button>
          ) : (
            <div className="delta">No pending requests</div>
          )}
        </div>
      </div>

      <div className="quick">
        <QuickLink href="/admin/members" label="Mark attendance" icon={<CalendarCheck />} />
        <QuickAction label="Add member" icon={<UserPlus />} onClick={openMemberModal} />
        <QuickAction label="Record payment" icon={<CreditCard />} onClick={openPaymentModal} />
        <QuickAction label="New plan" icon={<ShoppingCart />} onClick={openPlanModal} />
        <QuickAction label="Add equipment" icon={<Wrench />} onClick={openEquipmentModal} />
        <QuickLink href="/admin/broadcast" label="Send broadcast" icon={<Megaphone />} />
      </div>

      <div className="grid-2">
        <div className="card chart-card reveal">
          <div className="card-head pad">
            <div>
              <h3>Monthly revenue</h3>
              <div className="eyebrow" style={{ marginTop: 4 }}>
                Last 7 months performance
              </div>
            </div>
            <div className="filter-pills">
              <button
                type="button"
                className={cn("filter-pill", period === "6M" && "active")}
                onClick={() => setPeriod("6M")}
              >
                6M
              </button>
              <button
                type="button"
                className={cn("filter-pill", period === "1Y" && "active")}
                onClick={() => setPeriod("1Y")}
              >
                1Y
              </button>
            </div>
          </div>
          <div style={{ padding: "8px 20px 24px" }}>
            <div className="bar-chart" style={{ height: 230 }}>
              {REV_BARS.map((b) => (
                <div className="bar-wrap" key={b.label}>
                  <div
                    className={cn("bar", b.hi && "hi")}
                    style={{ height: `${b.w}%` }}
                  />
                  <span className="bar-val">{b.val}</span>
                  <span className="bar-label">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card chart-card reveal">
          <div className="card-head pad">
            <div>
              <h3>Payment methods</h3>
              <div className="eyebrow" style={{ marginTop: 4 }}>
                Transaction volume share
              </div>
            </div>
          </div>
          <div style={{ padding: "8px 20px 24px" }}>
            <div className="donut-wrap">
              <div className="donut">
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
                    <span>transactions</span>
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
      </div>

      <div className="grid-half">
        <div className="card reveal">
          <div
            className="pad"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <h3 style={{ fontSize: 17 }}>Member growth</h3>
            <Chip color="success" variant="soft" size="sm">
              +12.4%
            </Chip>
          </div>
          <div style={{ padding: "14px 20px 22px" }}>
            <div className="mini-bars">
              <i style={{ height: "18%" }} />
              <i style={{ height: "30%" }} />
              <i style={{ height: "40%" }} />
              <i style={{ height: "35%" }} />
              <i style={{ height: "55%" }} />
              <i style={{ height: "62%" }} />
              <i style={{ height: "75%" }} />
              <i className="on" style={{ height: "85%" }} />
            </div>
            <div
              className="legend"
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 10,
              }}
            >
              <span className="muted small">Jan</span>
              <span className="muted small">Aug (Current)</span>
            </div>
          </div>
        </div>

        <div className="card reveal">
          <div
            className="pad"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <h3 style={{ fontSize: 17 }}>Recent payments</h3>
            <a href="/admin/payments" className="muted small font-semibold" style={{ color: "var(--color-accent)" }}>
              View all ledger →
            </a>
          </div>
          <div style={{ padding: "6px 20px 18px" }}>
            <div className="t-row">
              <Initials tone="accent">AS</Initials>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="font-semibold">Aarav Singh</div>
                <div className="muted small">UPI · ₹2,999</div>
              </div>
              <Chip color="success" variant="soft" size="sm">Paid</Chip>
            </div>
            <div className="t-row">
              <Initials tone="info">PK</Initials>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="font-semibold">Priya Kumar</div>
                <div className="muted small">Card · ₹5,499</div>
              </div>
              <Chip color="success" variant="soft" size="sm">Paid</Chip>
            </div>
            <div className="t-row">
              <Initials tone="warn">RM</Initials>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="font-semibold">Rahul Mehta</div>
                <div className="muted small">Cash · ₹1,499 · offline</div>
              </div>
              <Chip color="warning" variant="soft" size="sm">Pending</Chip>
            </div>
          </div>
        </div>
      </div>

      <AdminModal
        open={showNotif}
        onClose={() => setShowNotif(false)}
        title="Pending plan requests"
        subtitle={`${pendingRequests.length} member plan enrollment request${pendingRequests.length !== 1 ? "s" : ""} require approval`}
      >
        {pendingRequests.length === 0 ? (
          <div className="py-8 text-center text-sm text-[var(--color-muted)]">
            No pending requests at this time.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pendingRequests.map((r) => (
              <div
                key={r.id}
                className="user-info-banner"
                style={{
                  justifyContent: "space-between",
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div className="flex items-center gap-3">
                  <Initials tone="accent">{r.memberName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}</Initials>
                  <div>
                    <div className="ui-name">{r.memberName}</div>
                    <div className="muted small">
                      Requested <b className="text-accent">{r.planName}</b> · ₹{r.amount.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onPress={() => {
                      openApproveModal(r);
                      setShowNotif(false);
                    }}
                  >
                    Approve &amp; Record
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onPress={() => {
                      onRejectRequest(r);
                      setShowNotif(false);
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminModal>
    </AdminShell>
  );
}

function QuickLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <a href={href} className="card card-hover">
      {icon}
      {label}
    </a>
  );
}

function QuickAction({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="card card-hover"
      style={{ textAlign: "left", border: 0, cursor: "pointer" }}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

function Initials({
  children,
  tone,
}: {
  children: string;
  tone: "accent" | "info" | "warn";
}) {
  const bg =
    tone === "accent"
      ? "var(--color-accent-soft)"
      : tone === "info"
        ? "var(--color-info-soft)"
        : "var(--color-warn-soft)";
  const fg =
    tone === "accent"
      ? "var(--color-accent)"
      : tone === "info"
        ? "var(--color-info)"
        : "var(--color-warn)";
  return (
    <span
      className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full text-[13px] font-semibold"
      style={{ background: bg, color: fg }}
    >
      {children}
    </span>
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
      <span className="v">{value}</span>
    </div>
  );
}
