import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Modal, useOverlayState } from "@heroui/react";
import { Bell, Check, Download, Info, LogOut, X } from "lucide-react";
import { Button, Input } from "../components/ui";
import { cn } from "../components/ui";

export type MemberPlan = {
  id: string;
  name: string;
  meta: string;
  price: number;
  days: number;
  badge?: string;
};

export type Receipt = {
  id: string;
  label: string;
  invoice: string;
  date: string;
  method: string;
  amount: number;
  tone: "accent" | "info";
};

export type GymMessage = {
  id: string;
  title: string;
  body: string;
  date: string;
  author: string;
  unread: boolean;
};

export type MemberDashboardPageProps = {
  name: string;
  onLogout: () => void;
  onLogWeight: (weightIn: number, weightOut: number) => void;
  onBuyPlan: (plan: MemberPlan) => void;
  onRequestApproval: (plan: MemberPlan) => void;
  onDownloadReceipt: (receipt: Receipt) => void;
  onMarkMessageRead: (id: string) => void;
  onMarkAllRead: () => void;
};

type ModalName = "plan" | "receipts" | "messages" | "logWeight" | "bell" | null;

export function MemberDashboardPage({
  name,
  onLogout,
  onLogWeight,
  onBuyPlan,
  onRequestApproval,
  onDownloadReceipt,
  onMarkMessageRead,
  onMarkAllRead,
}: MemberDashboardPageProps) {
  const [openModal, setOpenModal] = useState<ModalName>(null);
  const [selectedPlan, setSelectedPlan] = useState("annual");
  const [weightIn, setWeightIn] = useState("78.2");
  const [weightOut, setWeightOut] = useState("");

  const plans: MemberPlan[] = [
    { id: "monthly", name: "Monthly Starter", meta: "1 month · full access", price: 899, days: 30 },
    { id: "quarterly", name: "Quarterly Pro", meta: "3 months · paid ₹833/mo", price: 2499, days: 90, badge: "Save 7%" },
    { id: "annual", name: "Annual Unlimited", meta: "12 months · paid ₹500/mo", price: 5999, days: 365 },
  ];

  const currentPlan = plans.find((p) => p.id === selectedPlan) ?? plans[2];

  const receipts: Receipt[] = [
    {
      id: "INV-2026-0842",
      label: "Annual Unlimited Membership",
      invoice: "#INV-2026-0842 · Jun 12, 2026 · UPI",
      date: "Jun 12, 2026",
      method: "UPI",
      amount: 5999,
      tone: "accent",
    },
    {
      id: "INV-2026-0310",
      label: "Quarterly Pro Membership",
      invoice: "#INV-2026-0310 · Mar 12, 2026 · Card",
      date: "Mar 12, 2026",
      method: "Card",
      amount: 5999,
      tone: "info",
    },
  ];

  const messages: GymMessage[] = [
    {
      id: "m1",
      title: "Special Weekend Holiday Hours Notice",
      body: "Dear members, please note that our facility will operate on special holiday hours this upcoming weekend (Saturday & Sunday: 6:00 AM – 10:00 PM). Group fitness classes remain as scheduled.",
      date: "Aug 5, 2026",
      author: "Gym Management",
      unread: true,
    },
    {
      id: "m2",
      title: "New Olympic Lifting Platforms Installed",
      body: "We have upgraded Zone B with 4 brand new competition-grade Olympic lifting platforms and calibrated bumper plates. Feel free to ask trainers for orientation.",
      date: "Jul 28, 2026",
      author: "Equipment Team",
      unread: false,
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="mem-top">
        <div className="flex items-center gap-3">
          <span
            className="brand-mark"
            style={{ background: "var(--color-info)", color: "var(--color-accent-ink)" }}
          >
            <DumbbellLogo />
          </span>
          <div>
            <div className="brand-name">GymStitch</div>
            <div className="muted small">Member portal</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="icon-btn"
            aria-label="Notifications"
            onClick={() => setOpenModal("bell")}
          >
            <Bell size={18} />
          </button>
          <a href="/" className="btn btn-secondary btn-sm">
            Overview
          </a>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onLogout}
          >
            <LogOut size={14} />
            Log out
          </button>
          <Button size="sm" onPress={() => setOpenModal("logWeight")}>
            Log weight
          </Button>
        </div>
      </div>

      <div className="mem-body">
        <div className="mb-4.5 mt-6 flex items-center justify-between">
          <div>
            <div className="eyebrow">Welcome back</div>
            <h1 className="mt-1 text-[32px] font-display tracking-tight">
              Hi, {name}
            </h1>
          </div>
          <span className="status-pill">
            <span className="dot" />
            Online
          </span>
        </div>

        <div className="card plan-card">
          <div className="glow" />
          <div className="plan-head">
            <div>
              <h2>Annual Membership</h2>
              <div className="plan-meta">
                <span>
                  Expires <b className="mono">Jun 12, 2027</b>
                </span>
                <span>
                  <b className="mono">310</b> days left
                </span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="eyebrow" style={{ marginBottom: 2 }}>
                Days remaining
              </div>
              <div
                className="stat-num"
                style={{ fontSize: 30, color: "var(--color-success)" }}
              >
                310
              </div>
            </div>
          </div>
          <div className="progress">
            <div className="fill" style={{ width: "63%" }} />
          </div>
          <div className="flex justify-between text-xs text-muted">
            <span>Jan 12, 2026</span>
            <span>63% used</span>
            <span>Jun 12, 2027</span>
          </div>
          <div className="mt-5 flex gap-2.5">
            <Button onPress={() => setOpenModal("plan")}>Renew / extend</Button>
            <Button variant="ghost" onPress={() => setOpenModal("logWeight")}>
              Today's weight
            </Button>
          </div>
        </div>

        <div className="metric-cards">
          <div className="card sev-card">
            <h3>Attendance — this week</h3>
            <p className="sub">4 of 7 days · 57%</p>
            <div className="bar-chart" style={{ height: 120 }}>
              {[
                { h: 70, l: "M" },
                { h: 90, l: "T" },
                { h: 40, l: "W" },
                { h: 80, l: "T" },
                { h: 60, l: "F" },
                { h: 0, l: "S" },
                { h: 0, l: "S" },
              ].map((b) => (
                <div className="bar-wrap" key={b.l}>
                  <div className="bar" style={{ height: `${b.h}%` }} />
                  <span className="bar-label">{b.l}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card sev-card">
            <div className="mb-3.5 flex items-center justify-between">
              <h3>Weight progress</h3>
              <span className="ring-badge badge-green">−1.8 kg this month</span>
            </div>
            <div className="rings">
              <Ring pct={72} color="var(--color-success)" cap="Goal progress" />
              <Ring pct={85} color="var(--color-accent)" cap="Consistency" />
              <Ring pct={58} color="var(--color-info)" cap="This week" />
            </div>
          </div>
        </div>

        <div className="anon-grid">
          <div className="card pad">
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              Your payments
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="muted">Jun 12 · UPI</span>
                <b className="amount mono">₹5,999</b>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="muted">Mar 12 · Card</span>
                <b className="amount mono">₹5,999</b>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm mt-3.5 p-0 text-accent"
              onClick={() => setOpenModal("receipts")}
            >
              View receipts →
            </button>
          </div>
          <div className="card pad">
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              Gym messages
            </div>
            <div className="banner info mb-2.5">
              <Info size={16} />
              <span>
                <b>Holiday hours</b> — open 6a–10p this weekend.
              </span>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm p-0 text-accent"
              onClick={() => setOpenModal("messages")}
            >
              Open messages →
            </button>
          </div>
        </div>
      </div>

      {/* Plan selection sheet */}
      <MemberModal
        open={openModal === "plan"}
        onClose={() => setOpenModal(null)}
        title="Pick your next plan"
        subtitle="Buying before expiry extends your current plan"
      >
        <div className="flex flex-col gap-2.5">
          {plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              className={cn(
                "plan-sheet-card",
                selectedPlan === plan.id && "selected",
              )}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <div className="text-left">
                <div className="font-semibold">
                  {plan.name}
                  {plan.badge ? (
                    <span className="ring-badge badge-green ml-1.5">
                      {plan.badge}
                    </span>
                  ) : null}
                </div>
                <div className="muted small">{plan.meta}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <b className="stat-num" style={{ fontSize: 20 }}>
                  ₹{plan.price.toLocaleString("en-IN")}
                </b>
                <div className="muted small">{plan.days} days</div>
              </div>
            </button>
          ))}
        </div>
        <div className="breakdown">
          <div>
            <span className="muted">Plan</span>
            <span className="amt mono">
              ₹{currentPlan.price.toLocaleString("en-IN")}
            </span>
          </div>
          <div>
            <span className="muted">Days added to membership</span>
            <span className="amt mono">+{currentPlan.days} days</span>
          </div>
          <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 10 }}>
            <b>Total due now</b>
            <b className="stat-num mono" style={{ fontSize: 18 }}>
              ₹{currentPlan.price.toLocaleString("en-IN")}
            </b>
          </div>
        </div>
        <div className="flex gap-2.5">
          <Button fullWidth size="lg" onPress={() => onBuyPlan(currentPlan)}>
            Pay now
          </Button>
          <Button
            fullWidth
            size="lg"
            variant="secondary"
            onPress={() => onRequestApproval(currentPlan)}
          >
            Request approval
          </Button>
        </div>
        <div className="muted small mt-3 text-center">
          Secured payments by <b>Razorpay</b>
        </div>
      </MemberModal>

      {/* Receipts modal */}
      <MemberModal
        open={openModal === "receipts"}
        onClose={() => setOpenModal(null)}
        title="Payment Receipts & Invoices"
        subtitle="Download digital tax invoices and payment confirmations"
      >
        <div className="flex flex-col gap-3">
          {receipts.map((receipt) => (
            <div className="receipt-item" key={receipt.id}>
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "grid h-[38px] w-[38px] place-items-center rounded-full font-semibold",
                    receipt.tone === "accent"
                      ? "bg-accent-soft text-accent"
                      : "bg-info-soft text-info",
                  )}
                >
                  IN
                </div>
                <div>
                  <div className="font-semibold">{receipt.label}</div>
                  <div className="muted small">{receipt.invoice}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <b className="mono block text-[15px]">
                  ₹{receipt.amount.toLocaleString("en-IN")}
                </b>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-1.5"
                  onPress={() => onDownloadReceipt(receipt)}
                >
                  <Download size={14} />
                  Download PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      </MemberModal>

      {/* Messages modal */}
      <MemberModal
        open={openModal === "messages"}
        onClose={() => setOpenModal(null)}
        title="Gym Announcements & Messages"
        subtitle="Direct notices and updates from GymStitch management"
        footer={
          <>
            <Button variant="secondary" onPress={() => setOpenModal(null)}>
              Close
            </Button>
            <Button onPress={onMarkAllRead}>Mark all as read</Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn("msg-item", message.unread && "unread")}
            >
              <div className="mb-1.5 flex items-start justify-between">
                <h4 className="text-[15px] font-semibold">{message.title}</h4>
                {message.unread ? (
                  <span className="ring-badge badge-accent">Unread</span>
                ) : (
                  <span className="ring-badge badge-neutral">Read</span>
                )}
              </div>
              <p className="text-[13.5px] leading-relaxed text-muted">
                {message.body}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-muted">
                <span>
                  {message.date} · {message.author}
                </span>
                {message.unread ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => onMarkMessageRead(message.id)}
                  >
                    <Check size={14} />
                    Mark as read
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </MemberModal>

      {/* Log weight modal */}
      <MemberModal
        open={openModal === "logWeight"}
        onClose={() => setOpenModal(null)}
        title="Log today's weight"
        subtitle="Fri, Aug 7 · you're on a 6-day streak"
        footer={
          <>
            <Button variant="secondary" onPress={() => setOpenModal(null)}>
              Cancel
            </Button>
            <Button
              onPress={() => {
                onLogWeight(Number(weightIn), Number(weightOut));
                setOpenModal(null);
              }}
            >
              Save weight
            </Button>
          </>
        }
      >
        <Input
          label="Weight in (kg)"
          type="number"
          className="mono"
          value={weightIn}
          onValueChange={setWeightIn}
          autoFocus
        />
        <Input
          label="Weight out (kg) (optional)"
          type="number"
          className="mono"
          placeholder="e.g. 78.0"
          value={weightOut}
          onValueChange={setWeightOut}
        />
        <div className="banner green">
          <Check size={16} />
          <span>
            Logged successfully. You're <b>0.4 kg</b> lighter than yesterday.
          </span>
        </div>
      </MemberModal>

      {/* Bell modal */}
      <MemberModal
        open={openModal === "bell"}
        onClose={() => setOpenModal(null)}
        title="Notifications"
        subtitle="2 unread notifications"
      >
        <div className="flex flex-col gap-2.5">
          <div className="card pad-sm" style={{ borderColor: "var(--color-accent)" }}>
            <div className="text-sm font-semibold">Holiday hours</div>
            <div className="muted small">Open 6a–10p this weekend.</div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2.5"
              onPress={() => setOpenModal(null)}
            >
              Mark as read
            </Button>
          </div>
          <div className="card pad-sm" style={{ borderColor: "var(--color-accent)" }}>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Plan expiring soon</div>
              <span className="ring-badge badge-amber">3 days</span>
            </div>
            <div className="muted small" style={{ margin: "4px 0 10px" }}>
              Your Annual plan ends in 3 days.
            </div>
            <Button
              size="sm"
              onPress={() => {
                setOpenModal(null);
                setOpenModal("plan");
              }}
            >
              Renew now
            </Button>
          </div>
        </div>
      </MemberModal>
    </div>
  );
}

function MemberModal({
  open,
  onClose,
  title,
  subtitle,
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const state = useOverlayState({
    isOpen: open,
    onOpenChange: (next) => {
      if (!next) onClose();
    },
  });
  return (
    <Modal state={state}>
      <Modal.Dialog className="modal-dialog modal-size-md">
        <div className="m-head">
          <div>
            <h3>{title}</h3>
            {subtitle ? <div className="sub">{subtitle}</div> : null}
          </div>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="m-body">{children}</div>
        {footer ? <div className="m-foot">{footer}</div> : null}
      </Modal.Dialog>
    </Modal>
  );
}

function Ring({
  pct,
  color,
  cap,
}: {
  pct: number;
  color: string;
  cap: string;
}) {
  const offset = 267 - (267 * pct) / 100;
  return (
    <div>
      <div className="ring" style={{ "--ring": color } as CSSProperties}>
        <svg viewBox="0 0 96 96">
          <circle className="t" cx="48" cy="48" r="42.5" />
          <circle
            className="f"
            cx="48"
            cy="48"
            r="42.5"
            strokeDasharray="267"
            strokeDashoffset={offset}
          />
        </svg>
        <div className="mid">
          <b>{pct}%</b>
        </div>
      </div>
      <div className="cap">{cap}</div>
    </div>
  );
}

function DumbbellLogo() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6.5 6.5v11M17.5 6.5v11M10 20V4M14 20V4" />
    </svg>
  );
}