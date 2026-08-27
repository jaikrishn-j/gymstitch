import { useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { signOut } from "firebase/auth";
import { toast } from "@heroui/react";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { CACHE_KEYS, TTL, capPayments, toDate, toISO } from "../../lib/cache";
import { useCachedData } from "../../lib/useCachedData";
import { usePaymentSync } from "../../lib/usePaymentSync";
import type { PendingPayment } from "../../lib/offline";
import type { RawMember } from "../../lib/offline";
import { requirePermission } from "../../auth/guard";
import { AdminPaymentsPage } from "../../pages/AdminPaymentsPage";
import type { PaymentRow } from "../../pages/AdminMembersPage";
import type { PaymentData } from "../../components/modals/RecordPaymentModal";
import type { PaymentMember } from "../../components/modals/RecordPaymentModal";
import type { PlanOption } from "../../components/modals/AddMemberModal";

export const Route = createFileRoute("/admin/payments")({
  beforeLoad: ({ context }) => {
    requirePermission(context.auth, "payments");
  },
  component: RouteComponent,
});

const DAY_MS = 86_400_000;

type CachedPayment = Omit<PaymentRow, "paidAt"> & { paidAt: string };

const fetchPayments = async (): Promise<CachedPayment[]> => {
  const snap = await getDocs(collection(db, "payments"));
  const rows: CachedPayment[] = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      memberId: data.memberId,
      memberName: data.memberName,
      planId: data.planId,
      planName: data.planName,
      amount: data.amount,
      daysAdded: data.daysAdded,
      method: data.method,
      notes: data.notes,
      paidAt: toISO(data.paidAt) ?? new Date().toISOString(),
      status: data.status ?? "paid",
    };
  });
  rows.sort((a, b) => (a.paidAt < b.paidAt ? 1 : -1));
  return capPayments(rows);
};

const fetchMembers = async (): Promise<RawMember[]> => {
  const q = query(collection(db, "users"), where("role", "==", "member"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      uid: d.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      planId: data.planId,
      planName: data.planName,
      planStart: toISO(data.planStart),
      planExpiresAt: toISO(data.planExpiresAt),
      createdAt: toISO(data.createdAt),
    } as RawMember;
  });
};

const fetchPlans = async (): Promise<PlanOption[]> => {
  const snap = await getDocs(collection(db, "plans"));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name,
      price: data.price,
      days: data.days,
      offerPrice: data.offerPrice ?? null,
    };
  });
};

function RouteComponent() {
  const navigate = useNavigate();
  const payments = useCachedData<CachedPayment[]>({
    key: CACHE_KEYS.payments,
    ttl: TTL.payments,
    fetch: fetchPayments,
  });
  const members = useCachedData<RawMember[]>({
    key: CACHE_KEYS.members,
    ttl: TTL.members,
    fetch: fetchMembers,
  });
  const plans = useCachedData<PlanOption[]>({
    key: CACHE_KEYS.plans,
    ttl: TTL.plans,
    fetch: fetchPlans,
  });

  const handleLogout = async () => {
    await signOut(auth);
    toast.success("Signed out successfully.");
    navigate({ to: "/login" });
  };

  const paymentSync = usePaymentSync(({ flushed }) => {
    if (flushed > 0) {
      void payments.refetch();
      void members.refetch();
    }
  });

  const paymentRows = useMemo(
    () =>
      (payments.data ?? []).map((p) => {
        const member = (members.data ?? []).find((m) => m.uid === p.memberId);
        return { ...p, paidAt: toDate(p.paidAt) ?? new Date(), email: member?.email };
      }),
    [payments.data, members.data],
  );

  const pendingApprovals = useMemo(
    () => paymentRows.filter((p) => p.status === "pending" && p.method === "pending"),
    [paymentRows],
  );

  const approvedPayments = useMemo(
    () => paymentRows.filter((p) => !(p.status === "pending" && p.method === "pending")),
    [paymentRows],
  );

  const memberOptions: PaymentMember[] = useMemo(
    () =>
      (members.data ?? []).map((m) => ({
        id: m.uid,
        name: m.name ?? "",
        email: m.email ?? "",
        phone: m.phone,
      })),
    [members.data],
  );

  const loading = payments.loading || members.loading || plans.loading;
  const syncing =
    payments.syncing || members.syncing || plans.syncing || paymentSync.flushing;

  const lastSyncedAt = useMemo(() => {
    const times = [payments.lastSyncedAt, members.lastSyncedAt, plans.lastSyncedAt];
    let min: number | null = null;
    for (const t of times) {
      if (t == null) continue;
      min = min == null ? t : Math.min(min, t);
    }
    return min;
  }, [payments.lastSyncedAt, members.lastSyncedAt, plans.lastSyncedAt]);

  const handleSync = async () => {
    await paymentSync.syncNow();
    void Promise.all([
      payments.refetch(),
      members.refetch(),
      plans.refetch(),
    ]);
  };

  const applyOptimisticPayment = (payload: PendingPayment, queued: boolean) => {
    payments.mutate((prev) => {
      const row: CachedPayment = {
        id: payload.clientId,
        memberId: payload.memberId,
        memberName: payload.memberName,
        planId: payload.planId,
        planName: payload.planName,
        amount: payload.amount,
        daysAdded: payload.daysAdded,
        method: payload.method,
        notes: payload.notes,
        paidAt: payload.paidAt,
        status: queued ? "pending" : "paid",
      };
      return capPayments([row, ...(prev ?? [])]);
    });
  };

  const handleRecordPayment = async (member: PaymentMember, data: PaymentData) => {
    const raw = (members.data ?? []).find((m) => m.uid === member.id);
    const { queued, payload } = await paymentSync.recordPayment(
      { id: member.id, name: member.name },
      raw,
      data,
    );
    applyOptimisticPayment(payload, queued);

    if (queued) {
      toast.warning(
        `Payment of ₹${data.amount.toLocaleString("en-IN")} for ${member.name} queued — will sync when back online.`,
      );
    } else {
      toast.success(
        `Payment of ₹${data.amount.toLocaleString("en-IN")} recorded for ${member.name}.`,
      );
    }
  };

  const handleApprovePayment = async (payment: PaymentRow, data: PaymentData) => {
    try {
      await updateDoc(doc(db, "payments", payment.id), {
        status: "paid",
        method: data.method,
        notes: data.notes || `Approved — ${data.method}`,
        paidAt: new Date(),
      });

      const member = (members.data ?? []).find((m) => m.uid === payment.memberId);
      const currentExpiry = member?.planExpiresAt
        ? new Date(member.planExpiresAt as string)
        : undefined;
      const hasActivePlan = currentExpiry != null && currentExpiry.getTime() > Date.now();
      const base = hasActivePlan ? currentExpiry!.getTime() : Date.now();
      const planStart = hasActivePlan && member?.planStart
        ? new Date(member.planStart as string)
        : new Date();
      const planExpiresAt = new Date(base + payment.daysAdded * DAY_MS);

      await updateDoc(doc(db, "users", payment.memberId), {
        planId: payment.planId,
        planName: payment.planName,
        planStart,
        planExpiresAt,
      });

      toast.success(
        `Payment of ₹${payment.amount.toLocaleString("en-IN")} approved for ${payment.memberName}. Plan activated.`,
      );

      void payments.refetch();
      void members.refetch();
    } catch (err) {
      console.error("Failed to approve payment:", err);
      toast("Failed to approve payment.", { variant: "danger" });
    }
  };

  const handleRejectPayment = async (payment: PaymentRow) => {
    try {
      await updateDoc(doc(db, "payments", payment.id), {
        status: "rejected",
        notes: "Rejected by admin",
      });

      toast.info(`Payment request from ${payment.memberName} rejected.`);
      void payments.refetch();
    } catch (err) {
      console.error("Failed to reject payment:", err);
      toast("Failed to reject payment.", { variant: "danger" });
    }
  };

  const handlePrintReceipt = (payment: PaymentRow) => {
    const receipt = window.open("", "_blank", "width=400,height=600");
    if (!receipt) {
      toast("Popup blocked. Allow popups to print receipts.", { variant: "danger" });
      return;
    }
    const amt = payment.amount.toLocaleString("en-IN");
    const date = payment.paidAt.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    receipt.document.write(`<!doctype html><html><head><title>Receipt</title>
<style>
body{font-family:monospace;max-width:340px;margin:24px auto;padding:16px;color:#111}
h1{font-size:18px;margin:0 0 4px}
.muted{color:#666;font-size:12px}
hr{border:0;border-top:1px dashed #999;margin:14px 0}
.row{display:flex;justify-content:space-between;margin:6px 0;font-size:13px}
.total{display:flex;justify-content:space-between;font-size:15px;font-weight:bold;margin-top:8px}
.center{text-align:center}
</style></head><body>
<div class="center">
  <h1>GymStitch</h1>
  <div class="muted">Payment Receipt</div>
  <div class="muted">${date}</div>
</div>
<hr>
<div class="row"><span>Member</span><span>${payment.memberName}</span></div>
<div class="row"><span>Plan</span><span>${payment.planName}</span></div>
<div class="row"><span>Days added</span><span>+${payment.daysAdded} days</span></div>
<div class="row"><span>Method</span><span>${payment.method.toUpperCase()}</span></div>
<div class="row"><span>Ref</span><span>${payment.id.slice(-8).toUpperCase()}</span></div>
<hr>
<div class="total"><span>Total</span><span>₹${amt}</span></div>
<div class="center muted" style="margin-top:20px">Thank you!</div>
<script>window.print();</script>
</body></html>`);
    receipt.document.close();
  };

  return (
    <AdminPaymentsPage
      payments={approvedPayments}
      pendingApprovals={pendingApprovals}
      members={memberOptions}
      plans={plans.data ?? []}
      loading={loading}
      lastSyncedAt={lastSyncedAt}
      pendingCount={paymentSync.pendingCount}
      isOnline={paymentSync.isOnline}
      syncing={syncing}
      onSync={handleSync}
      onRecordPayment={handleRecordPayment}
      onApprovePayment={handleApprovePayment}
      onRejectPayment={handleRejectPayment}
      onPrintReceipt={handlePrintReceipt}
      onLogout={handleLogout}
    />
  );
}
