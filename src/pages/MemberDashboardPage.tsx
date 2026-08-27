import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Modal, useOverlayState } from "@heroui/react";
import {
  Bell,
  Check,
  Clock,
  Download,
  Info,
  LogOut,
  X,
} from "lucide-react";

import { Button, Input, cn } from "../components/ui";

/* ============================================================
   TYPES
   ============================================================ */

export type MemberPlan = {
  id: string;
  name: string;
  meta: string;
  price: number;
  offerPrice?: number | null;
  days: number;
  badge?: string;
  requireApproval?: boolean;
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

export type MemberProfile = {
  bloodGroup?: string;
  dob?: string;
  address?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  planId?: string;
  planName?: string;
  planStart?: unknown;
  planExpiresAt?: unknown;
};

export type MemberPaymentRow = {
  id: string;
  planName: string;
  amount: number;
  method: string;
  date: string;
  status: string;
};

export type MemberAttendanceRow = {
  id: string;
  date: string;
  timeIn: string;
  timeOut: string | null;
  weight: number | null;
};

export type MemberPendingRequest = {
  id: string;
  planId: string;
  planName: string;
  amount: number;
  daysAdded: number;
  requestedAt?: string;
};

export type MemberDashboardPageProps = {
  name: string;
  profile?: MemberProfile;

  currentPlan?: {
    name: string;
    expires: string;
    daysLeft: number;
    progress: number;
  } | null;

  payments?: MemberPaymentRow[];
  attendance?: MemberAttendanceRow[];
  plans?: MemberPlan[];
  pendingRequests?: MemberPendingRequest[];

  gatewayEnabled?: boolean;
  isProfileComplete?: boolean;

  onLogout: () => void;

  onLogWeight: (
    weightIn: number,
    weightOut: number,
  ) => void;

  onBuyPlan: (plan: MemberPlan) => void;

  onRequestApproval: (
    plan: MemberPlan,
  ) => void;

  onCancelRequest: (
    requestId: string,
  ) => void;

  onDownloadReceipt: (
    receipt: Receipt,
  ) => void;

  onMarkMessageRead: (
    id: string,
  ) => void;

  onMarkAllRead: () => void;
};

type ModalName =
  | "plan"
  | "logWeight"
  | "bell"
  | null;

/* ============================================================
   HELPERS
   ============================================================ */

function safeNumber(
  value: unknown,
  fallback = 0,
): number {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function getPlanPrice(
  plan: MemberPlan | undefined,
): number {
  if (!plan) return 0;

  const offerPrice = safeNumber(
    plan.offerPrice,
    NaN,
  );

  if (Number.isFinite(offerPrice)) {
    return offerPrice;
  }

  return safeNumber(plan.price, 0);
}

function formatPrice(
  value: unknown,
): string {
  return `₹${safeNumber(value).toLocaleString(
    "en-IN",
  )}`;
}

function hasOfferPrice(
  plan: MemberPlan,
): boolean {
  const offerPrice = safeNumber(
    plan.offerPrice,
    NaN,
  );

  const originalPrice = safeNumber(
    plan.price,
    0,
  );

  return (
    Number.isFinite(offerPrice) &&
    offerPrice >= 0 &&
    offerPrice < originalPrice
  );
}

function clampPercentage(
  value: unknown,
): number {
  return Math.max(
    0,
    Math.min(
      100,
      safeNumber(value, 0),
    ),
  );
}

/* ============================================================
   MAIN PAGE
   ============================================================ */

export function MemberDashboardPage({
  name,
  currentPlan: currentPlanData,
  payments = [],
  attendance = [],
  plans: plansProp,
  pendingRequests = [],
  gatewayEnabled = false,
  onLogout,
  onLogWeight,
  onBuyPlan,
  onRequestApproval,
  onCancelRequest,
  onDownloadReceipt,
  onMarkMessageRead,
  onMarkAllRead,
}: MemberDashboardPageProps) {
  const [
    openModal,
    setOpenModal,
  ] = useState<ModalName>(null);

  const [
    selectedPlanId,
    setSelectedPlanId,
  ] = useState("");

  const [
    weightIn,
    setWeightIn,
  ] = useState("");

  const [
    weightOut,
    setWeightOut,
  ] = useState("");

  const [
    userMenuOpen,
    setUserMenuOpen,
  ] = useState(false);

  const [
    drawerOpen,
    setDrawerOpen,
  ] = useState<
    "receipts" | "messages" | null
  >(null);

  const [
    paymentsVisible,
    setPaymentsVisible,
  ] = useState(5);

  const [
    messagesVisible,
    setMessagesVisible,
  ] = useState(5);

  const userMenuRef =
    useRef<HTMLDivElement>(null);

  /* ==========================================================
     CLICK OUTSIDE USER MENU
     ========================================================== */

  useEffect(() => {
    if (!userMenuOpen) return;

    const handleClick = (
      event: MouseEvent,
    ) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(
          event.target as Node,
        )
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClick,
      );
    };
  }, [userMenuOpen]);

  /* ==========================================================
     DEFAULT PLANS
     ========================================================== */

  const defaultPlans: MemberPlan[] = [
    {
      id: "monthly",
      name: "Monthly Starter",
      meta: "1 month · full access",
      price: 899,
      offerPrice: 899,
      days: 30,
    },
    {
      id: "quarterly",
      name: "Quarterly Pro",
      meta: "3 months · full access",
      price: 2999,
      offerPrice: 2499,
      days: 90,
      badge: "Save 17%",
    },
    {
      id: "annual",
      name: "Annual Unlimited",
      meta: "12 months · full access",
      price: 6999,
      offerPrice: 5999,
      days: 365,
      badge: "Save 14%",
    },
  ];

  /* ==========================================================
     NORMALIZE FIRESTORE PLANS
     ========================================================== */

  const plans: MemberPlan[] =
    plansProp?.length
      ? plansProp.map((plan) => ({
          ...plan,
          price: safeNumber(
            plan.price,
            0,
          ),
          offerPrice:
            plan.offerPrice !==
              undefined &&
            plan.offerPrice !== null
              ? safeNumber(
                  plan.offerPrice,
                  0,
                )
              : null,
          days: safeNumber(
            plan.days,
            0,
          ),
        }))
      : defaultPlans;

  const selectedPlan =
    plans.find(
      (plan) =>
        plan.id === selectedPlanId,
    ) ?? plans[0];

  const selectedPlanPrice =
    getPlanPrice(selectedPlan);

  /* ==========================================================
     RECEIPTS
     ========================================================== */

  const receipts: Receipt[] =
    payments.map((payment) => ({
      id: payment.id,
      label: payment.planName,
      invoice: `#${payment.id} · ${payment.date} · ${payment.method}`,
      date: payment.date,
      method: payment.method,
      amount: safeNumber(
        payment.amount,
        0,
      ),
      tone:
        payment.status === "paid"
          ? "accent"
          : "info",
    }));

  /* ==========================================================
     MESSAGES
     ========================================================== */

  const messages: GymMessage[] = [
    {
      id: "m1",
      title:
        "Special Weekend Holiday Hours Notice",
      body:
        "Dear members, please note that our facility will operate on special holiday hours this upcoming weekend (Saturday & Sunday: 6:00 AM – 10:00 PM). Group fitness classes remain as scheduled.",
      date: "Aug 5, 2026",
      author: "Gym Management",
      unread: true,
    },
    {
      id: "m2",
      title:
        "New Olympic Lifting Platforms Installed",
      body:
        "We have upgraded Zone B with 4 brand new competition-grade Olympic lifting platforms and calibrated bumper plates. Feel free to ask trainers for orientation.",
      date: "Jul 28, 2026",
      author: "Equipment Team",
      unread: false,
    },
  ];

  /* ==========================================================
     ATTENDANCE
     ========================================================== */

  const now = new Date();

  const weekStart = new Date(now);

  weekStart.setDate(
    now.getDate() - now.getDay(),
  );

  weekStart.setHours(
    0,
    0,
    0,
    0,
  );

  const weekAttendance =
    attendance.filter((entry) => {
      const date = new Date(
        entry.date,
      );

      return (
        date >= weekStart &&
        date <= now
      );
    });

  const attendedDays =
    weekAttendance.length;

  const totalDays = 7;

  const attendancePct =
    Math.round(
      (attendedDays /
        totalDays) *
        100,
    );

  /* ==========================================================
     WEEK CHART
     ========================================================== */

  const dayLabels = [
    "S",
    "M",
    "T",
    "W",
    "T",
    "F",
    "S",
  ];

  const barData = dayLabels.map(
    (label, index) => {
      const dayDate =
        new Date(weekStart);

      dayDate.setDate(
        weekStart.getDate() +
          index,
      );

      const hasAttendance =
        attendance.some(
          (entry) => {
            const date = new Date(
              entry.date,
            );

            return (
              date.toDateString() ===
              dayDate.toDateString()
            );
          },
        );

      return {
        label,
        hasAttendance,
      };
    },
  );

  /* ==========================================================
     WEIGHT
     ========================================================== */

  const weightEntries =
    attendance
      .filter(
        (entry) =>
          entry.weight != null,
      )
      .sort(
        (a, b) =>
          new Date(
            b.date,
          ).getTime() -
          new Date(
            a.date,
          ).getTime(),
      );

  const latestWeight =
    weightEntries[0]?.weight ??
    null;

  const previousWeight =
    weightEntries[1]?.weight ??
    null;

  const weightDelta =
    latestWeight != null &&
    previousWeight != null
      ? latestWeight -
        previousWeight
      : null;

  /* ==========================================================
     STREAK
     ========================================================== */

  let streak = 0;

  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0,
  );

  for (
    let index = 0;
    index < 30;
    index++
  ) {
    const checkDate =
      new Date(today);

    checkDate.setDate(
      today.getDate() -
        index,
    );

    const hasDay =
      attendance.some(
        (entry) => {
          const date = new Date(
            entry.date,
          );

          return (
            date.toDateString() ===
            checkDate.toDateString()
          );
        },
      );

    if (hasDay) {
      streak++;
    } else {
      break;
    }
  }

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div className="member-page min-h-screen">
      {/* HEADER */}

      <header className="mem-top member-header">
        <div className="member-brand">
          <span className="brand-mark member-brand-mark">
            <DumbbellLogo />
          </span>

          <div className="member-brand-copy">
            <div className="brand-name">
              GymStitch
            </div>

            <div className="muted small">
              Member portal
            </div>
          </div>
        </div>

        <div className="member-header-actions">
          <button
            type="button"
            className="icon-btn member-header-icon"
            aria-label="Notifications"
            onClick={() =>
              setOpenModal("bell")
            }
          >
            <Bell size={18} />
          </button>

          <Button
            size="sm"
            onPress={() =>
              setOpenModal(
                "logWeight",
              )
            }
          >
            <span className="member-log-weight-full">
              Log weight
            </span>

            <span className="member-log-weight-short">
              Weight
            </span>
          </Button>

          <div
            className="user-dropdown"
            ref={userMenuRef}
          >
            <button
              type="button"
              className="user-avatar"
              aria-label="User menu"
              onClick={() =>
                setUserMenuOpen(
                  (value) => !value,
                )
              }
            >
              {name
                .charAt(0)
                .toUpperCase()}
            </button>

            <div
              className={cn(
                "user-menu",
                userMenuOpen &&
                  "open",
              )}
            >
              <a
                href="/"
                className="user-menu-item"
              >
                <Info size={15} />
                Overview
              </a>

              <button
                type="button"
                className="user-menu-item danger"
                onClick={() => {
                  setUserMenuOpen(
                    false,
                  );
                  onLogout();
                }}
              >
                <LogOut size={15} />
                Log out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* BODY */}

      <main className="mem-body member-body">
        {/* WELCOME */}

        <section className="member-welcome">
          <div className="member-welcome-copy">
            <div className="eyebrow">
              Welcome back
            </div>

            <h1 className="member-title">
              Hi, {name}
            </h1>
          </div>

          <span className="status-pill member-online-pill">
            <span className="dot" />
            Online
          </span>
        </section>

        {/* PENDING PLAN REQUEST */}

        {pendingRequests.length > 0 ? (
          <section
            className="card"
            role="status"
            aria-live="polite"
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 14,
              padding: "16px 20px",
              border: "1px solid color-mix(in oklch, var(--color-warn) 55%, transparent)",
              background:
                "color-mix(in oklch, var(--color-warn) 12%, transparent)",
            }}
          >
            <span
              className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full"
              style={{
                background: "var(--color-warn-soft)",
                color: "var(--color-warn)",
              }}
            >
              <Clock size={19} />
            </span>

            <div className="min-w-0 flex-1">
              <div
                className="eyebrow"
                style={{ color: "var(--color-warn)" }}
              >
                Plan request pending approval
              </div>

              <div className="text-sm text-fg">
                You've requested{" "}
                <b>{pendingRequests[0].planName}</b>
                {pendingRequests[0].amount > 0 ? (
                  <>
                    {" "}
                    · ₹
                    {pendingRequests[0].amount.toLocaleString(
                      "en-IN",
                    )}
                  </>
                ) : null}{" "}
                · +{pendingRequests[0].daysAdded} days. Please
                wait for an admin to approve your request.
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onPress={() =>
                onCancelRequest(pendingRequests[0].id)
              }
            >
              <X size={14} />
              Cancel request
            </Button>
          </section>
        ) : null}

        {/* ACTIVE PLAN */}

        <section className="card plan-card member-plan-card">
          <div className="glow" />

          <div className="plan-head member-plan-head">
            <div className="plan-info">
              <div className="eyebrow member-plan-eyebrow">
                Current membership
              </div>

              <h2>
                {currentPlanData?.name ??
                  "No Active Plan"}
              </h2>

              <div className="plan-meta">
                {currentPlanData ? (
                  <>
                    <span>
                      Expires{" "}
                      <b className="mono">
                        {
                          currentPlanData.expires
                        }
                      </b>
                    </span>

                    <span className="member-plan-divider">
                      •
                    </span>

                    <span>
                      <b className="mono">
                        {
                          currentPlanData.daysLeft
                        }
                      </b>{" "}
                      days left
                    </span>
                  </>
                ) : (
                  <span>
                    No active membership.
                    Choose a plan to get
                    started.
                  </span>
                )}
              </div>
            </div>

            {currentPlanData ? (
              <div className="plan-days">
                <div className="eyebrow plan-days-label">
                  Days remaining
                </div>

                <div className="stat-num plan-days-number">
                  {
                    currentPlanData.daysLeft
                  }
                </div>
              </div>
            ) : null}
          </div>

          {currentPlanData ? (
            <>
              <ProgressBar
                percentage={
                  currentPlanData.progress
                }
              />

              <div className="plan-progress-meta">
                <span>
                  {
                    currentPlanData.expires
                  }
                </span>

                <span>
                  {clampPercentage(
                    currentPlanData.progress,
                  )}
                  % used
                </span>
              </div>
            </>
          ) : null}

          <div className="member-plan-actions">
            <Button
              onPress={() =>
                setOpenModal("plan")
              }
            >
              {currentPlanData
                ? "Renew / extend"
                : "Choose a plan"}
            </Button>

            <Button
              variant="ghost"
              onPress={() =>
                setOpenModal(
                  "logWeight",
                )
              }
            >
              Today's weight
            </Button>
          </div>
        </section>

        {/* METRICS */}

        <div className="metric-cards member-metric-grid">
          {/* ATTENDANCE */}

          <section className="card sev-card member-metric-card">
            <div className="member-metric-heading">
              <div>
                <h3>
                  Attendance — this week
                </h3>

                <p className="sub">
                  {attendedDays} of{" "}
                  {totalDays} days ·{" "}
                  {attendancePct}%
                </p>
              </div>

              <div className="member-metric-value">
                {attendancePct}%
              </div>
            </div>

            <div className="bar-chart member-bar-chart">
              {barData.map(
                (bar, index) => (
                  <div
                    className="bar-wrap"
                    key={index}
                  >
                    <div
                      className={cn(
                        "bar",
                        bar.hasAttendance &&
                          "bar-active",
                      )}
                    />

                    <span className="bar-label">
                      {bar.label}
                    </span>
                  </div>
                ),
              )}
            </div>
          </section>

          {/* WEIGHT */}

          <section className="card sev-card member-metric-card">
            <div className="member-weight-head">
              <div>
                <h3>
                  Weight progress
                </h3>

                <p className="sub">
                  Your latest tracking
                </p>
              </div>

              {weightDelta != null ? (
                <span
                  className={cn(
                    "ring-badge",
                    weightDelta <= 0
                      ? "badge-green"
                      : "badge-amber",
                  )}
                >
                  {weightDelta > 0
                    ? "+"
                    : ""}
                  {weightDelta.toFixed(
                    1,
                  )}{" "}
                  kg
                </span>
              ) : latestWeight !=
                null ? (
                <span className="ring-badge badge-info">
                  {latestWeight} kg
                </span>
              ) : (
                <span className="ring-badge badge-neutral">
                  No data
                </span>
              )}
            </div>

            <div className="rings member-rings">
              <Ring
                pct={attendancePct}
                colorClass="ring-success"
                cap="This week"
              />

              <Ring
                pct={
                  streak > 0
                    ? Math.min(
                        100,
                        Math.round(
                          (streak /
                            7) *
                            100,
                        ),
                      )
                    : 0
                }
                colorClass="ring-accent"
                cap={`${streak}-day streak`}
              />

              <Ring
                pct={
                  latestWeight !=
                  null
                    ? 85
                    : 0
                }
                colorClass="ring-info"
                cap={
                  latestWeight !=
                  null
                    ? `${latestWeight} kg`
                    : "No weight"
                }
              />
            </div>
          </section>
        </div>

        {/* PAYMENTS + MESSAGES */}

        <div className="anon-grid member-info-grid">
          <section className="card pad borderless member-info-card">
            <div className="eyebrow member-section-label">
              Your payments
            </div>

            <div className="member-payment-list">
              {payments.length > 0 ? (
                payments
                  .slice(0, 3)
                  .map((payment) => (
                    <div
                      className="member-payment-row"
                      key={payment.id}
                    >
                      <span className="muted member-payment-meta">
                        {payment.date} ·{" "}
                        {payment.method}
                      </span>

                      <b className="amount mono member-payment-amount">
                        {formatPrice(
                          payment.amount,
                        )}
                      </b>
                    </div>
                  ))
              ) : (
                <div className="text-sm muted">
                  No payments yet
                </div>
              )}
            </div>

            {payments.length > 0 ? (
              <button
                type="button"
                className="btn btn-ghost btn-sm member-link-button"
                onClick={() => {
                  setDrawerOpen(
                    "receipts",
                  );
                  setPaymentsVisible(
                    5,
                  );
                }}
              >
                View receipts →
              </button>
            ) : null}
          </section>

          <section className="card pad borderless member-info-card">
            <div className="eyebrow member-section-label">
              Gym messages
            </div>

            <div className="banner info member-message-banner">
              <Info size={16} />

              <span>
                <b>
                  Holiday hours
                </b>{" "}
                — open 6a–10p this
                weekend.
              </span>
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-sm member-link-button"
              onClick={() => {
                setDrawerOpen(
                  "messages",
                );
                setMessagesVisible(
                  5,
                );
              }}
            >
              Open messages →
            </button>
          </section>
        </div>
      </main>

      {/* ======================================================
          PLAN MODAL
          ====================================================== */}

      <MemberModal
        open={
          openModal === "plan"
        }
        onClose={() =>
          setOpenModal(null)
        }
        title="Pick your next plan"
        subtitle="Choose the membership that works best for you"
      >
        {plans.length > 0 ? (
          <>
            <div className="plan-sheet-list">
              {plans.map((plan) => {
                const displayPrice =
                  getPlanPrice(plan);

                const discounted =
                  hasOfferPrice(plan);

                return (
                  <button
                    key={plan.id}
                    type="button"
                    className={cn(
                      "plan-sheet-card",
                      selectedPlanId ===
                        plan.id &&
                        "selected",
                    )}
                    onClick={() =>
                      setSelectedPlanId(
                        plan.id,
                      )
                    }
                  >
                    <div className="plan-sheet-content">
                      <div className="plan-sheet-name">
                        <span>
                          {plan.name}
                        </span>

                        {plan.badge ? (
                          <span className="ring-badge badge-green plan-badge">
                            {
                              plan.badge
                            }
                          </span>
                        ) : null}

                        {plan.requireApproval ? (
                          <span className="ring-badge badge-amber plan-badge">
                            Approval required
                          </span>
                        ) : null}
                      </div>

                      <div className="muted small plan-sheet-meta">
                        {plan.meta}
                      </div>
                    </div>

                    <div className="plan-sheet-price">
                      {discounted ? (
                        <span className="plan-original-price">
                          {formatPrice(
                            plan.price,
                          )}
                        </span>
                      ) : null}

                      <b className="stat-num plan-current-price">
                        {formatPrice(
                          displayPrice,
                        )}
                      </b>

                      <div className="muted small">
                        {safeNumber(
                          plan.days,
                        )}{" "}
                        days
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedPlan ? (
              <>
                <div className="breakdown member-breakdown">
                  <div>
                    <span className="muted">
                      Plan
                    </span>

                    <span className="amt mono">
                      {formatPrice(
                        selectedPlanPrice,
                      )}
                    </span>
                  </div>

                  <div>
                    <span className="muted">
                      Days added
                    </span>

                    <span className="amt mono">
                      +
                      {safeNumber(
                        selectedPlan.days,
                      )}{" "}
                      days
                    </span>
                  </div>

                  <div className="member-breakdown-total">
                    <b>
                      Total due now
                    </b>

                    <b className="stat-num mono member-total-price">
                      {formatPrice(
                        selectedPlanPrice,
                      )}
                    </b>
                  </div>
                </div>

                <div className="member-payment-actions">
                  {gatewayEnabled && !selectedPlan.requireApproval ? (
                    <>
                      <Button
                        fullWidth
                        size="lg"
                        onPress={() =>
                          onBuyPlan(
                            selectedPlan,
                          )
                        }
                      >
                        Pay{" "}
                        {formatPrice(
                          selectedPlanPrice,
                        )}
                      </Button>

                      <Button
                        fullWidth
                        size="lg"
                        variant="secondary"
                        onPress={() =>
                          onRequestApproval(
                            selectedPlan,
                          )
                        }
                      >
                        Request approval
                      </Button>
                    </>
                  ) : (
                    <Button
                      fullWidth
                      size="lg"
                      variant="primary"
                      onPress={() =>
                        onRequestApproval(
                          selectedPlan,
                        )
                      }
                    >
                      Request approval
                    </Button>
                  )}
                </div>

                <div className="muted small member-payment-note">
                  {gatewayEnabled && !selectedPlan.requireApproval ? (
                    <>
                      Secured payments by{" "}
                      <b>Razorpay</b>
                    </>
                  ) : (
                    <>
                      Admin will review and
                      approve your request
                    </>
                  )}
                </div>
              </>
            ) : null}
          </>
        ) : (
          <div className="member-no-plans">
            <div className="member-empty-icon">
              <Info size={20} />
            </div>

            <div>
              <b>No plans available</b>
              <p className="muted small">
                Please check again later.
              </p>
            </div>
          </div>
        )}
      </MemberModal>

      {/* ======================================================
          RECEIPTS DRAWER
          ====================================================== */}

      <BottomDrawer
        open={
          drawerOpen ===
          "receipts"
        }
        onClose={() =>
          setDrawerOpen(null)
        }
        title="Payment Receipts"
        subtitle={`${receipts.length} total payments`}
      >
        <div className="member-drawer-list">
          {receipts
            .slice(
              0,
              paymentsVisible,
            )
            .map((receipt) => (
              <div
                className="receipt-item"
                key={receipt.id}
              >
                <div className="receipt-main">
                  <div
                    className={cn(
                      "receipt-icon",
                      receipt.tone ===
                        "accent"
                        ? "bg-accent-soft text-accent"
                        : "bg-info-soft text-info",
                    )}
                  >
                    IN
                  </div>

                  <div className="receipt-info">
                    <div className="font-semibold">
                      {
                        receipt.label
                      }
                    </div>

                    <div className="muted small receipt-invoice">
                      {
                        receipt.invoice
                      }
                    </div>
                  </div>
                </div>

                <div className="receipt-actions">
                  <b className="mono receipt-amount">
                    {formatPrice(
                      receipt.amount,
                    )}
                  </b>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="receipt-download"
                    onPress={() =>
                      onDownloadReceipt(
                        receipt,
                      )
                    }
                  >
                    <Download
                      size={14}
                    />
                    <span>
                      Download PDF
                    </span>
                  </Button>
                </div>
              </div>
            ))}
        </div>

        {paymentsVisible <
        receipts.length ? (
          <button
            type="button"
            className="btn btn-ghost btn-sm member-load-more"
            onClick={() =>
              setPaymentsVisible(
                (value) =>
                  value + 5,
              )
            }
          >
            Load more
          </button>
        ) : null}

        {paymentsVisible >=
          receipts.length &&
        receipts.length > 5 ? (
          <div className="end-msg">
            All payments loaded
          </div>
        ) : null}
      </BottomDrawer>

      {/* ======================================================
          MESSAGES DRAWER
          ====================================================== */}

      <BottomDrawer
        open={
          drawerOpen ===
          "messages"
        }
        onClose={() =>
          setDrawerOpen(null)
        }
        title="Gym Messages"
        subtitle={`${
          messages.filter(
            (message) =>
              message.unread,
          ).length
        } unread`}
        footer={
          <Button
            size="sm"
            onPress={onMarkAllRead}
          >
            Mark all as read
          </Button>
        }
      >
        <div className="member-drawer-list">
          {messages
            .slice(
              0,
              messagesVisible,
            )
            .map((message) => (
              <div
                key={message.id}
                className={cn(
                  "msg-item",
                  message.unread &&
                    "unread",
                )}
              >
                <div className="member-message-title-row">
                  <h4 className="member-message-title">
                    {message.title}
                  </h4>

                  <span
                    className={cn(
                      "ring-badge",
                      message.unread
                        ? "badge-accent"
                        : "badge-neutral",
                    )}
                  >
                    {message.unread
                      ? "Unread"
                      : "Read"}
                  </span>
                </div>

                <p className="member-message-body">
                  {message.body}
                </p>

                <div className="member-message-footer">
                  <span>
                    {message.date} ·{" "}
                    {message.author}
                  </span>

                  {message.unread ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() =>
                        onMarkMessageRead(
                          message.id,
                        )
                      }
                    >
                      <Check
                        size={14}
                      />
                      Mark as read
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
        </div>

        {messagesVisible <
        messages.length ? (
          <button
            type="button"
            className="btn btn-ghost btn-sm member-load-more"
            onClick={() =>
              setMessagesVisible(
                (value) =>
                  value + 5,
              )
            }
          >
            Load more
          </button>
        ) : null}

        {messagesVisible >=
          messages.length &&
        messages.length > 5 ? (
          <div className="end-msg">
            All messages loaded
          </div>
        ) : null}
      </BottomDrawer>

      {/* ======================================================
          LOG WEIGHT
          ====================================================== */}

      <MemberModal
        open={
          openModal ===
          "logWeight"
        }
        onClose={() =>
          setOpenModal(null)
        }
        title="Log today's weight"
        subtitle={
          streak > 0
            ? `You're on a ${streak}-day streak`
            : "Start your streak today"
        }
        footer={
          <>
            <Button
              variant="secondary"
              onPress={() =>
                setOpenModal(null)
              }
            >
              Cancel
            </Button>

            <Button
              onPress={() => {
                const inWeight =
                  Number(
                    weightIn,
                  );

                const outWeight =
                  weightOut
                    ? Number(
                        weightOut,
                      )
                    : 0;

                if (
                  !Number.isFinite(
                    inWeight,
                  ) ||
                  inWeight <= 0
                ) {
                  return;
                }

                onLogWeight(
                  inWeight,
                  outWeight,
                );

                setOpenModal(
                  null,
                );

                setWeightIn("");
                setWeightOut("");
              }}
            >
              Save weight
            </Button>
          </>
        }
      >
        <div className="member-input-stack">
          <Input
            label="Weight in (kg)"
            type="number"
            className="mono"
            value={weightIn}
            onValueChange={
              setWeightIn
            }
            autoFocus
          />

          <Input
            label="Weight out (kg) (optional)"
            type="number"
            className="mono"
            placeholder="e.g. 78.0"
            value={weightOut}
            onValueChange={
              setWeightOut
            }
          />

          {latestWeight !=
          null ? (
            <div className="banner green">
              <Check size={16} />

              <span>
                Last logged:{" "}
                <b>
                  {
                    latestWeight
                  }{" "}
                  kg
                </b>

                {weightDelta !=
                null ? (
                  <>
                    {" · "}
                    {weightDelta <=
                    0
                      ? `${Math.abs(
                          weightDelta,
                        ).toFixed(
                          1,
                        )} kg less`
                      : `${weightDelta.toFixed(
                          1,
                        )} kg more`}{" "}
                    than previous
                  </>
                ) : null}
              </span>
            </div>
          ) : null}
        </div>
      </MemberModal>

      {/* ======================================================
          NOTIFICATIONS
          ====================================================== */}

      <MemberModal
        open={
          openModal ===
          "bell"
        }
        onClose={() =>
          setOpenModal(null)
        }
        title="Notifications"
        subtitle={`${
          messages.filter(
            (message) =>
              message.unread,
          ).length
        } unread notifications`}
      >
        <div className="member-notification-list">
          {messages
            .filter(
              (message) =>
                message.unread,
            )
            .map((message) => (
              <div
                key={message.id}
                className="card pad-sm member-notification-card"
              >
                <div className="text-sm font-semibold">
                  {message.title}
                </div>

                <div className="muted small">
                  {message.body.slice(
                    0,
                    80,
                  )}
                  ...
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="member-notification-action"
                  onPress={() =>
                    onMarkMessageRead(
                      message.id,
                    )
                  }
                >
                  Mark as read
                </Button>
              </div>
            ))}

          {currentPlanData &&
          currentPlanData.daysLeft <=
            7 ? (
            <div className="card pad-sm member-notification-card">
              <div className="member-expiry-head">
                <div className="text-sm font-semibold">
                  Plan expiring soon
                </div>

                <span className="ring-badge badge-amber">
                  {
                    currentPlanData.daysLeft
                  }{" "}
                  days
                </span>
              </div>

              <div className="muted small member-expiry-copy">
                Your{" "}
                {
                  currentPlanData.name
                }{" "}
                plan ends in{" "}
                {
                  currentPlanData.daysLeft
                }{" "}
                days.
              </div>

              <Button
                size="sm"
                onPress={() =>
                  setOpenModal(
                    "plan",
                  )
                }
              >
                Renew now
              </Button>
            </div>
          ) : null}

          {messages.filter(
            (message) =>
              message.unread,
          ).length === 0 &&
          (!currentPlanData ||
            currentPlanData.daysLeft >
              7) ? (
            <div className="member-no-notifications">
              <Check size={18} />
              <span>
                No new notifications
              </span>
            </div>
          ) : null}
        </div>
      </MemberModal>
    </div>
  );
}

/* ============================================================
   PROGRESS BAR
   ============================================================ */

function ProgressBar({
  percentage,
}: {
  percentage: number;
}) {
  const pct = clampPercentage(
    percentage,
  );

  const level =
    pct === 0
      ? "progress-0"
      : pct <= 10
        ? "progress-10"
        : pct <= 20
          ? "progress-20"
          : pct <= 30
            ? "progress-30"
            : pct <= 40
              ? "progress-40"
              : pct <= 50
                ? "progress-50"
                : pct <= 60
                  ? "progress-60"
                  : pct <= 70
                    ? "progress-70"
                    : pct <= 80
                      ? "progress-80"
                      : pct <= 90
                        ? "progress-90"
                        : "progress-100";

  return (
    <div className="progress member-progress">
      <div
        className={cn(
          "fill",
          level,
        )}
      />
    </div>
  );
}

/* ============================================================
   MODAL
   ============================================================ */

function MemberModal({
  open,
  onClose,
  title,
  subtitle,
  footer,
  size = "md",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}) {
  const state =
    useOverlayState({
      isOpen: open,
      onOpenChange: (
        next,
      ) => {
        if (!next) {
          onClose();
        }
      },
    });

  return (
    <Modal state={state}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog
            className={cn(
              "modal-dialog",
              `modal-size-${size}`,
              "member-modal-dialog",
            )}
          >
            <div className="m-head member-modal-head">
              <div className="member-modal-title">
                <h3>{title}</h3>

                {subtitle ? (
                  <div className="sub">
                    {subtitle}
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                className="icon-btn"
                aria-label="Close"
                onClick={onClose}
              >
                <X size={18} />
              </button>
            </div>

            <div className="m-body member-modal-body">
              {children}
            </div>

            {footer ? (
              <div className="m-foot member-modal-foot">
                {footer}
              </div>
            ) : null}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

/* ============================================================
   RING
   ============================================================ */

function Ring({
  pct,
  colorClass,
  cap,
}: {
  pct: number;
  colorClass:
    | "ring-success"
    | "ring-accent"
    | "ring-info";
  cap: string;
}) {
  const safePct =
    clampPercentage(pct);

  const offset =
    267 -
    (267 * safePct) /
      100;

  return (
    <div className="member-ring-item">
      <div
        className={cn(
          "ring",
          colorClass,
        )}
      >
        <svg viewBox="0 0 96 96">
          <circle
            className="t"
            cx="48"
            cy="48"
            r="42.5"
          />

          <circle
            className="f"
            cx="48"
            cy="48"
            r="42.5"
            strokeDasharray="267"
            strokeDashoffset={
              offset
            }
          />
        </svg>

        <div className="mid">
          <b>
            {Math.round(
              safePct,
            )}
            %
          </b>
        </div>
      </div>

      <div className="cap">
        {cap}
      </div>
    </div>
  );
}

/* ============================================================
   BOTTOM DRAWER
   ============================================================ */

function BottomDrawer({
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
  const bodyRef =
    useRef<HTMLDivElement>(
      null,
    );

  useEffect(() => {
    if (open) {
      document.body.style.overflow =
        "hidden";
    } else {
      document.body.style.overflow =
        "";
    }

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [open]);

  return (
    <>
      <div
        className={cn(
          "drawer-scrim",
          open && "open",
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          "bottom-drawer",
          open && "open",
          "member-bottom-drawer",
        )}
      >
        <button
          type="button"
          className="drawer-handle"
          aria-label="Close drawer"
          onClick={onClose}
        >
          <span />
        </button>

        <div className="drawer-head member-drawer-head">
          <div>
            <h3>{title}</h3>

            {subtitle ? (
              <div className="sub">
                {subtitle}
              </div>
            ) : null}
          </div>

          {footer}
        </div>

        <div
          className="drawer-body member-drawer-body"
          ref={bodyRef}
        >
          {children}
        </div>
      </div>
    </>
  );
}

/* ============================================================
   LOGO
   ============================================================ */

function DumbbellLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6.5 6.5v11M17.5 6.5v11M10 20V4M14 20V4" />
    </svg>
  );
}