import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import {
  AdminShell,
  Chip,
  Button,
  SyncBar,
  EmptyState,
} from "../components/ui";

import { AdminModal } from "../components/modals/AdminModal";
import { useModal } from "../components/providers/ModalProvider";
import { RecordPaymentModal } from "../components/modals/RecordPaymentModal";

import type {
  PaymentData,
  PaymentMember,
} from "../components/modals/RecordPaymentModal";

import type { PlanOption } from "../components/modals/AddMemberModal";
import type { PaymentRow } from "./AdminMembersPage";

export type AdminPaymentsPageProps = {
  payments: PaymentRow[];
  pendingApprovals: PaymentRow[];
  members: PaymentMember[];
  plans: PlanOption[];
  loading: boolean;
  lastSyncedAt?: number | null;
  pendingCount?: number;
  isOnline?: boolean;
  syncing?: boolean;
  onSync?: () => void;

  onRecordPayment: (
    member: PaymentMember,
    data: PaymentData,
  ) => Promise<void>;

  onApprovePayment: (
    payment: PaymentRow,
    data: PaymentData,
  ) => Promise<void>;

  onRejectPayment: (
    payment: PaymentRow,
  ) => Promise<void>;

  onPrintReceipt: (
    payment: PaymentRow,
  ) => void;

  onLogout?: () => void;
};

const PER_PAGE = 10;

const METHOD_COLORS: Record<string, string> = {
  UPI: "var(--color-accent)",
  Card: "var(--color-info)",
  Cash: "var(--color-warn)",
};

function methodBucket(
  method: string,
): "UPI" | "Card" | "Cash" {
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
    .map(
      (part) =>
        part[0]?.toUpperCase() ?? "",
    )
    .join("");
}

export function AdminPaymentsPage({
  payments,
  pendingApprovals = [],
  members,
  plans,
  loading,
  lastSyncedAt,
  pendingCount = 0,
  isOnline = true,
  syncing = false,
  onSync,
  onRecordPayment,
  onApprovePayment,
  onRejectPayment,
  onPrintReceipt,
  onLogout,
}: AdminPaymentsPageProps) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] =
    useState<PaymentRow | null>(null);

  const { open } = useModal();

  /*
   * ============================================================
   * STATISTICS
   * ============================================================
   */

  const stats = useMemo(() => {
    const now = new Date();

    const total = payments.reduce(
      (sum, payment) =>
        sum + payment.amount,
      0,
    );

    const thisMonth = payments
      .filter(
        (payment) =>
          payment.paidAt.getMonth() ===
            now.getMonth() &&
          payment.paidAt.getFullYear() ===
            now.getFullYear(),
      )
      .reduce(
        (sum, payment) =>
          sum + payment.amount,
        0,
      );

    const buckets = {
      UPI: 0,
      Card: 0,
      Cash: 0,
    };

    for (const payment of payments) {
      buckets[
        methodBucket(payment.method)
      ] += 1;
    }

    const count = payments.length;

    const pct = (
      key: keyof typeof buckets,
    ) =>
      count
        ? Math.round(
            (buckets[key] / count) * 100,
          )
        : 0;

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

  /*
   * ============================================================
   * SEARCH
   * ============================================================
   */

  const visible = useMemo(
    () =>
      payments.filter((payment) => {
        if (!query.trim()) {
          return true;
        }

        const haystack =
          `${payment.memberName} ${
            payment.email ?? ""
          } ${payment.method} ${
            payment.planName
          }`.toLowerCase();

        return haystack.includes(
          query.toLowerCase(),
        );
      }),
    [payments, query],
  );

  /*
   * ============================================================
   * PAGINATION
   * ============================================================
   */

  const pageCount = Math.max(
    1,
    Math.ceil(
      visible.length / PER_PAGE,
    ),
  );

  const safePage = Math.min(
    page,
    pageCount,
  );

  const pageRows = visible.slice(
    (safePage - 1) * PER_PAGE,
    safePage * PER_PAGE,
  );

  /*
   * ============================================================
   * DONUT
   * ============================================================
   */

  const donutSegments = useMemo(() => {
    const total = Math.max(
      stats.count,
      1,
    );

    const circumference = 377;

    const segments: {
      key: "UPI" | "Card" | "Cash";
      len: number;
      offset: number;
    }[] = [];

    let acc = 0;

    for (const key of [
      "UPI",
      "Card",
      "Cash",
    ] as const) {
      const len =
        (stats.buckets[key] / total) *
        circumference;

      segments.push({
        key,
        len,
        offset: -acc,
      });

      acc += len;
    }

    return segments;
  }, [
    stats.buckets,
    stats.count,
  ]);

  /*
   * ============================================================
   * RECORD PAYMENT
   * ============================================================
   */

  const openPaymentModal = () => {
    const close = open(
      <RecordPaymentModal
        members={members}
        plans={plans}
        onSave={async (data) => {
          const member =
            members.find(
              (item) =>
                item.id ===
                data.memberId,
            );

          if (!member) {
            throw new Error(
              "member-required",
            );
          }

          await onRecordPayment(
            member,
            data,
          );

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
        mode: isOnline
          ? "online"
          : "offline",
        label:
          pendingCount > 0
            ? `${
                isOnline
                  ? "Online"
                  : "Offline"
              } · ${pendingCount} pending sync`
            : isOnline
              ? "Online"
              : "Offline",
      }}
      pendingCount={pendingApprovals.length}
      onNotifications={() => {}}
      onLogout={onLogout}
    >
      {/* ======================================================
          PAGE HEADER
          ====================================================== */}

      <div
        className="
          page-head
          flex
          flex-col
          gap-4
          lg:flex-row
          lg:items-start
          lg:justify-between
        "
      >
        <div className="min-w-0">
          <div className="eyebrow">
            Financials
          </div>

          <h2 className="break-words">
            Transaction Ledger
          </h2>

          <p className="sub max-w-3xl">
            Complete audit trail of online
            Razorpay collections and manual
            cash/UPI entries.
          </p>
        </div>

        <div
          className="
            actions
            w-full
            shrink-0
            sm:w-auto
          "
        >
          <Button
            onPress={openPaymentModal}
            isDisabled={
              members.length === 0
            }
            className="w-full sm:w-auto"
          >
            + Record manual payment
          </Button>
        </div>
      </div>

      {/* ======================================================
          STATISTICS
          ====================================================== */}

      <div
        className="
          stat-grid
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-2
          lg:grid-cols-4
        "
      >
        <div className="card stat-card card-hover reveal min-w-0">
          <div className="top">
            <span className="stat-label">
              Total collected
            </span>
          </div>

          <div className="stat-num break-words">
            {loading
              ? "…"
              : `₹${stats.total.toLocaleString(
                  "en-IN",
                )}`}
          </div>

          <span className="delta up">
            {stats.count} transactions
          </span>
        </div>

        <div className="card stat-card card-hover reveal min-w-0">
          <div className="top">
            <span className="stat-label">
              This month
            </span>
          </div>

          <div className="stat-num break-words">
            {loading
              ? "…"
              : `₹${stats.thisMonth.toLocaleString(
                  "en-IN",
                )}`}
          </div>

          <span className="delta up">
            Manual + online
          </span>
        </div>

        <div className="card stat-card card-hover reveal min-w-0">
          <div className="top">
            <span className="stat-label">
              Total transactions
            </span>
          </div>

          <div className="stat-num">
            {loading
              ? "…"
              : stats.count}
          </div>
        </div>

        <div className="card stat-card card-hover reveal min-w-0">
          <div className="top">
            <span className="stat-label">
              Pending sync
            </span>
          </div>

          <div
            className="
              stat-num
              text-[var(--color-warn)]
            "
          >
            {pendingCount}
          </div>
        </div>
      </div>

      {/* ======================================================
          PENDING APPROVALS
          ====================================================== */}

      {pendingApprovals.length > 0 && (
        <div
          className="
            card
            reveal
            mb-5
            overflow-hidden
          "
        >
          <div
            className="
              border-b
              border-[var(--color-border)]
              px-4
              py-4
              sm:px-5
            "
          >
            <div className="eyebrow mb-1">
              Pending approval requests
            </div>

            <p className="sub m-0">
              {pendingApprovals.length}{" "}
              member-initiated payment
              request
              {pendingApprovals.length !==
              1
                ? "s"
                : ""}{" "}
              awaiting your approval.
            </p>
          </div>

          <div className="flex flex-col">
            {pendingApprovals.map(
              (request) => (
                <PendingApprovalRow
                  key={request.id}
                  payment={request}
                  members={members}
                  plans={plans}
                  onApprove={
                    onApprovePayment
                  }
                  onReject={
                    onRejectPayment
                  }
                />
              ),
            )}
          </div>
        </div>
      )}

      {/* ======================================================
          MAIN CONTENT
          ====================================================== */}

      <div
        className="
          grid-pay
          grid
          grid-cols-1
          gap-5
          xl:grid-cols-[minmax(0,1fr)_320px]
        "
      >
        {/* ====================================================
            PAYMENT TABLE
            ==================================================== */}

        <div
          className="
            card
            reveal
            payments-table-card
            min-w-0
            overflow-hidden
          "
        >
          {/* ==================================================
              TOOLBAR
              ================================================== */}

          <div
            className="
              flex
              flex-col
              gap-3
              border-b
              border-[var(--color-border)]
              p-3
              sm:p-4
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            {/* Search */}

            <div
              className="
                search
                w-full
                min-w-0
                lg:max-w-xl
                lg:flex-1
              "
            >
              <Search
                className="
                  h-4
                  w-4
                  shrink-0
                "
              />

              <input
                className="
                  input
                  min-w-0
                  w-full
                  flex-1
                  text-sm
                "
                placeholder="Search by member, ID, method…"
                value={query}
                onChange={(event) => {
                  setQuery(
                    event.target.value,
                  );
                  setPage(1);
                }}
              />
            </div>

            {/* Sync */}

            <div
              className="
                w-full
                min-w-0
                lg:w-auto
                lg:shrink-0
              "
            >
              <SyncBar
                lastSyncedAt={
                  lastSyncedAt
                }
                pendingCount={
                  pendingCount
                }
                isOnline={isOnline}
                syncing={syncing}
                onSync={
                  onSync ??
                  (() => {})
                }
              />
            </div>
          </div>

          {/* ==================================================
              LOADING
              ================================================== */}

          {loading ? (
            <div className="card pad muted">
              Loading payments…
            </div>
          ) : pageRows.length === 0 ? (
            <div className="card pad">
              <EmptyState
                icon={
                  <Search size={28} />
                }
                title={
                  query
                    ? "No matching payments"
                    : "No payments yet"
                }
                description={
                  query
                    ? "Try a different search."
                    : "Record your first payment to start the ledger."
                }
              />
            </div>
          ) : (
            <>
              {/* ==================================================
                  TABLE
                  ================================================== */}

              <div
                className="
                  table-scroll
                  payments-table-scroll
                  w-full
                  max-w-full
                  overflow-x-auto
                  overscroll-x-contain
                "
              >
                <table
                  className="
                    table
                    table-responsive
                    payments-table
                    w-full
                    min-w-[920px]
                  "
                >
                  <thead>
                    <tr>
                      <th>
                        Member
                      </th>

                      <th>
                        Email
                      </th>

                      <th>
                        Plan
                      </th>

                      <th>
                        Method
                      </th>

                      <th className="td-right">
                        Amount
                      </th>

                      <th className="td-right">
                        Date
                      </th>

                      <th className="td-right">
                        Status
                      </th>

                      <th className="td-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {pageRows.map(
                      (payment) => (
                        <tr
                          key={
                            payment.id
                          }
                        >
                          <td data-label="Member">
                            <span className="mono small">
                              {initials(
                                payment.memberName,
                              )}
                            </span>{" "}
                            {payment.memberName}
                          </td>

                          <td
                            data-label="Email"
                            className="muted break-all"
                          >
                            {payment.email ??
                              "—"}
                          </td>

                          <td data-label="Plan">
                            {payment.planName}

                            {payment.daysAdded >
                            0 ? (
                              <span className="muted small">
                                {" "}
                                · +
                                {
                                  payment.daysAdded
                                }
                                d
                              </span>
                            ) : null}
                          </td>

                          <td data-label="Method">
                            <span className="muted uppercase">
                              {
                                payment.method
                              }
                            </span>
                          </td>

                          <td
                            data-label="Amount"
                            className="td-right amt whitespace-nowrap"
                          >
                            ₹
                            {payment.amount.toLocaleString(
                              "en-IN",
                            )}
                          </td>

                          <td
                            data-label="Date"
                            className="td-right muted whitespace-nowrap"
                          >
                            {payment.paidAt.toLocaleDateString(
                              "en-IN",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </td>

                          <td
                            data-label="Status"
                            className="td-right"
                          >
                            <Chip
                              color={
                                payment.status ===
                                "pending"
                                  ? "warning"
                                  : "success"
                              }
                              variant="soft"
                              size="sm"
                            >
                              {payment.status ===
                              "pending"
                                ? "Pending sync"
                                : "Paid"}
                            </Chip>
                          </td>

                          <td
                            data-label="Actions"
                            className="
                              td-right
                              payment-actions-cell
                              whitespace-nowrap
                            "
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              onPress={() =>
                                setDetail(
                                  payment,
                                )
                              }
                            >
                              Details
                            </Button>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              {/* ==================================================
                  PAGINATION
                  ================================================== */}

              <div
                className="
                  pagination
                  flex
                  flex-wrap
                  items-center
                  justify-center
                  gap-1
                  px-3
                  py-3
                  sm:px-5
                "
              >
                <button
                  type="button"
                  disabled={
                    safePage <= 1
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        Math.max(
                          1,
                          current - 1,
                        ),
                    )
                  }
                >
                  ‹
                </button>

                {Array.from(
                  {
                    length: pageCount,
                  },
                  (_, index) =>
                    index + 1,
                ).map(
                  (pageNumber) => (
                    <button
                      key={
                        pageNumber
                      }
                      type="button"
                      className={
                        pageNumber ===
                        safePage
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setPage(
                          pageNumber,
                        )
                      }
                    >
                      {pageNumber}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  disabled={
                    safePage >=
                    pageCount
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        Math.min(
                          pageCount,
                          current + 1,
                        ),
                    )
                  }
                >
                  ›
                </button>
              </div>

              {/* ==================================================
                  RESULT COUNT
                  ================================================== */}

              <div
                className="
                  muted
                  small
                  px-3
                  pb-3
                  text-center
                  sm:px-5
                  sm:text-left
                "
              >
                Showing{" "}
                <b>
                  {pageRows.length}
                </b>{" "}
                of {visible.length}{" "}
                payments
                {visible.length !==
                payments.length
                  ? ` (filtered from ${payments.length})`
                  : ""}
              </div>
            </>
          )}
        </div>

        {/* ====================================================
            PAYMENT SOURCE SPLIT
            ==================================================== */}

        <div
          className="
            card
            reveal
            payment-source-card
            min-w-0
            p-4
            sm:p-5
          "
        >
          <div className="eyebrow mb-4">
            Payment source split
          </div>

          <div className="flex flex-col gap-4">
            {(
              [
                "UPI",
                "Card",
                "Cash",
              ] as const
            ).map((key) => {
              const pct =
                key === "UPI"
                  ? stats.upiPct
                  : key === "Card"
                    ? stats.cardPct
                    : stats.cashPct;

              return (
                <div
                  key={key}
                  className="
                    payment-source-item
                    min-w-0
                  "
                >
                  <div
                    className="
                      mb-1
                      flex
                      items-center
                      justify-between
                      gap-3
                    "
                  >
                    <span className="muted text-sm">
                      {key}
                    </span>

                    <b className="src-num shrink-0">
                      {pct}%
                    </b>
                  </div>

                  <progress
                    className="
                      payment-progress
                      h-2
                      w-full
                      overflow-hidden
                      rounded
                    "
                    value={pct}
                    max={100}
                  />
                </div>
              );
            })}
          </div>

          <div
            className="
              eyebrow
              mb-4
              mt-7
            "
          >
            Method breakdown share
          </div>

          <div
            className="
              donut-wrap
              payment-donut-wrap
              flex
              flex-col
              items-center
              justify-center
              gap-5
              sm:flex-row
              sm:items-center
              sm:justify-start
            "
          >
            {/* Donut */}

            <div
              className="
                donut
                h-[120px]
                w-[120px]
                shrink-0
              "
            >
              <svg
                viewBox="0 0 150 150"
                className="h-full w-full"
              >
                <circle
                  className="track"
                  cx="75"
                  cy="75"
                  r="60"
                  strokeDasharray="377"
                  strokeDashoffset="0"
                  stroke="var(--color-border)"
                />

                {donutSegments.map(
                  (segment) => (
                    <circle
                      key={
                        segment.key
                      }
                      className="seg"
                      cx="75"
                      cy="75"
                      r="60"
                      stroke={
                        METHOD_COLORS[
                          segment.key
                        ]
                      }
                      strokeDasharray={`${segment.len} 377`}
                      strokeDashoffset={
                        segment.offset
                      }
                    />
                  ),
                )}
              </svg>

              <div className="center">
                <div>
                  <b>{stats.count}</b>
                  <span>
                    txns
                  </span>
                </div>
              </div>
            </div>

            {/* Legend */}

            <div
              className="
                legend
                payment-legend
                w-full
                min-w-0
                sm:w-auto
                sm:min-w-[120px]
              "
            >
              <LegendRow
                color={
                  METHOD_COLORS.UPI
                }
                label="UPI"
                value={`${stats.upiPct}%`}
              />

              <LegendRow
                color={
                  METHOD_COLORS.Card
                }
                label="Card"
                value={`${stats.cardPct}%`}
              />

              <LegendRow
                color={
                  METHOD_COLORS.Cash
                }
                label="Cash"
                value={`${stats.cashPct}%`}
              />
            </div>
          </div>

          <div
            className="
              muted
              small
              mt-5
            "
          >
            {stats.count === 0
              ? "No payments recorded yet."
              : `Distribution across ${stats.count} recorded transaction${
                  stats.count ===
                  1
                    ? ""
                    : "s"
                }.`}
          </div>
        </div>
      </div>

      {/* ======================================================
          PAYMENT DETAIL MODAL
          ====================================================== */}

      {detail ? (
        <PaymentDetailModal
          payment={detail}
          onClose={() =>
            setDetail(null)
          }
          onPrint={() =>
            onPrintReceipt(detail)
          }
        />
      ) : null}
    </AdminShell>
  );
}

/*
 * ============================================================
 * PAYMENT DETAIL MODAL
 * ============================================================
 */

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
      subtitle={`Payment reference · ${payment.id
        .slice(-8)
        .toUpperCase()}`}
      footer={
        <div
          className="
            flex
            w-full
            flex-col-reverse
            gap-2
            sm:flex-row
            sm:justify-end
          "
        >
          <Button
            variant="secondary"
            onPress={onClose}
            className="w-full sm:w-auto"
          >
            Close
          </Button>

          <Button
            onPress={onPrint}
            className="w-full sm:w-auto"
          >
            Print receipt
          </Button>
        </div>
      }
    >
      <div
        className="
          px-0
          pb-5
          pt-2
          text-center
        "
      >
        <div
          className="
            stat-num
            break-words
            text-[38px]
          "
        >
          ₹
          {payment.amount.toLocaleString(
            "en-IN",
          )}
        </div>

        <span
          className="
            ring-badge
            badge-green
            mt-2
          "
        >
          {payment.status ===
          "pending"
            ? "Pending sync"
            : "Verified · Success"}
        </span>
      </div>

      <div
        className="
          mb-4
          flex
          min-w-0
          items-center
          gap-3
          border-y
          border-[var(--color-border)]
          py-3.5
        "
      >
        <span
          className="
            grid
            h-[38px]
            w-[38px]
            shrink-0
            place-items-center
            rounded-full
            font-semibold
            text-[var(--color-accent)]
            [background:var(--color-accent-soft)]
          "
        >
          {initials(
            payment.memberName,
          )}
        </span>

        <div className="min-w-0">
          <div className="font-[550] break-words">
            {payment.memberName}
          </div>

          <div className="muted small break-all">
            {payment.memberId}
          </div>
        </div>
      </div>

      <div
        className="
          grid
          grid-cols-1
          gap-x-5
          gap-y-2
          text-sm
          sm:grid-cols-[1fr_auto]
        "
      >
        <div className="muted">
          Plan extended
        </div>

        <div className="break-words sm:text-right">
          <b>
            {payment.planName}
          </b>
        </div>

        <div className="muted">
          Days added
        </div>

        <div className="sm:text-right">
          +{payment.daysAdded}{" "}
          days
        </div>

        <div className="muted">
          Payment method
        </div>

        <div className="uppercase sm:text-right">
          {payment.method}
        </div>

        <div className="muted">
          Date &amp; Time
        </div>

        <div className="sm:text-right">
          {payment.paidAt.toLocaleString(
            "en-IN",
            {
              dateStyle:
                "medium",
              timeStyle:
                "short",
            },
          )}
        </div>
      </div>

      {payment.notes ? (
        <div className="mt-4">
          <div className="eyebrow mb-1.5">
            Notes
          </div>

          <div className="muted small break-words">
            {payment.notes}
          </div>
        </div>
      ) : null}
    </AdminModal>
  );
}

/*
 * ============================================================
 * LEGEND
 * ============================================================
 */

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
    <div
      className="
        li
        flex
        min-w-0
        items-center
        gap-2
      "
    >
      <span
        className="sw h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ background: color }}
      />

      <span className="truncate">
        {label}
      </span>

      <b className="v ml-auto shrink-0">
        {value}
      </b>
    </div>
  );
}

/*
 * ============================================================
 * PENDING APPROVAL
 * ============================================================
 */

function PendingApprovalRow({
  payment,
  members,
  plans,
  onApprove,
  onReject,
}: {
  payment: PaymentRow;
  members: PaymentMember[];
  plans: PlanOption[];

  onApprove: (
    payment: PaymentRow,
    data: PaymentData,
  ) => Promise<void>;

  onReject: (
    payment: PaymentRow,
  ) => Promise<void>;
}) {
  const { open } = useModal();

  const [rejecting, setRejecting] =
    useState(false);

  const handleApprove = () => {
    const member =
      members.find(
        (item) =>
          item.id ===
          payment.memberId,
      );

    if (!member) {
      return;
    }

    const close = open(
      <RecordPaymentModal
        memberName={
          payment.memberName
        }
        memberId={
          payment.memberId
        }
        plans={plans}
        onSave={async (data) => {
          await onApprove(
            payment,
            data,
          );

          close();
        }}
        onClose={() => close()}
      />,
      "md",
    );
  };

  const handleReject =
    async () => {
      setRejecting(true);

      try {
        await onReject(
          payment,
        );
      } finally {
        setRejecting(false);
      }
    };

  return (
    <div
      className="
        pending-row
        flex
        flex-col
        gap-4
        border-b
        border-[var(--color-border)]
        p-4
        last:border-b-0
        sm:px-5
        lg:flex-row
        lg:items-center
        lg:justify-between
      "
    >
      {/* Member */}

      <div
        className="
          flex
          min-w-0
          items-center
          gap-3
        "
      >
        <span
          className="
            grid
            h-[38px]
            w-[38px]
            shrink-0
            place-items-center
            rounded-full
            font-semibold
            text-[var(--color-accent)]
            [background:var(--color-accent-soft)]
          "
        >
          {initials(
            payment.memberName,
          )}
        </span>

        <div className="min-w-0">
          <div className="break-words font-[550]">
            {payment.memberName}
          </div>

          <div
            className="
              muted
              small
              break-words
            "
          >
            {payment.planName} · ₹
            {payment.amount.toLocaleString(
              "en-IN",
            )}{" "}
            · +
            {payment.daysAdded}{" "}
            days
          </div>
        </div>
      </div>

      {/* Actions */}

      <div
        className="
          pending-actions
          flex
          w-full
          flex-wrap
          items-center
          gap-2
          lg:w-auto
          lg:shrink-0
          lg:justify-end
        "
      >
        <Chip
          color="warning"
          variant="soft"
          size="sm"
        >
          Awaiting approval
        </Chip>

        <Button
          size="sm"
          onPress={handleApprove}
          className="flex-1 sm:flex-none"
        >
          Approve
        </Button>

        <Button
          size="sm"
          variant="ghost"
          isDisabled={rejecting}
          onPress={handleReject}
          className="flex-1 sm:flex-none"
        >
          {rejecting
            ? "Rejecting…"
            : "Reject"}
        </Button>
      </div>
    </div>
  );
}