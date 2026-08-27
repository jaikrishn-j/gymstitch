import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { signOut } from "firebase/auth";
import { toast } from "@heroui/react";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { CACHE_KEYS, TTL, toISO } from "../../lib/cache";
import { useCachedData } from "../../lib/useCachedData";
import { AdminDashboardPage } from "../../pages/AdminDashboardPage";
import type { PendingRequest } from "../../pages/AdminDashboardPage";
import type { AddMemberData, PlanOption } from "../../components/modals/AddMemberModal";
import type { PaymentData, PaymentMember } from "../../components/modals/RecordPaymentModal";
import type { PlanData } from "../../components/modals/NewPlanModal";
import type { EquipmentData } from "../../components/modals/AddEquipmentModal";
import type { RawMember } from "../../lib/offline";

export const Route = createFileRoute("/admin/dashboard")({
  component: RouteComponent,
});

const DAY_MS = 86_400_000;

type CachedPayment = {
  id: string;
  memberId: string;
  memberName: string;
  planId: string;
  planName: string;
  amount: number;
  daysAdded: number;
  method: string;
  notes?: string;
  paidAt: string;
  status: string;
};

const mapPendingPayment = (
  d: { id: string; data: () => Record<string, unknown> },
): CachedPayment => {
  const data = d.data();
  return {
    id: d.id,
    memberId: data.memberId as string,
    memberName: data.memberName as string,
    planId: data.planId as string,
    planName: data.planName as string,
    amount: data.amount as number,
    daysAdded: data.daysAdded as number,
    method: data.method as string,
    notes: data.notes as string | undefined,
    paidAt: toISO(data.paidAt) ?? new Date().toISOString(),
    status: (data.status as string) ?? "pending",
  };
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

const fetchDashboardPlans = async (): Promise<PlanOption[]> => {
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

  // Live subscription for member plan requests. A cached one-shot fetch is not
  // enough here: the localStorage cache goes stale for up to TTL.payments (5
  // min) and only re-runs on remount, so a freshly submitted request would
  // never show up in the notification bell while the admin is on the dashboard.
  const [pendingPayments, setPendingPayments] = useState<CachedPayment[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "payments"),
      where("status", "==", "pending"),
      where("method", "==", "pending"),
    );
    const unsub = onSnapshot(
      q,
      (snap) => setPendingPayments(snap.docs.map(mapPendingPayment)),
      (err) => console.error("[dashboard] pending payments listener failed:", err),
    );
    return unsub;
  }, []);

  const members = useCachedData<RawMember[]>({
    key: CACHE_KEYS.members,
    ttl: TTL.members,
    fetch: fetchMembers,
  });

  const plans = useCachedData<PlanOption[]>({
    key: CACHE_KEYS.plans,
    ttl: TTL.plans,
    fetch: fetchDashboardPlans,
  });

  const pendingRequests: PendingRequest[] = useMemo(
    () =>
      pendingPayments.map((p) => ({
        id: p.id,
        memberId: p.memberId,
        memberName: p.memberName,
        planId: p.planId,
        planName: p.planName,
        amount: p.amount,
        daysAdded: p.daysAdded,
      })),
    [pendingPayments],
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

  const handleLogout = async () => {
    await signOut(auth);
    toast.success("Signed out successfully.");
    navigate({ to: "/login" });
  };

  const handleAddMember = async (data: AddMemberData) => {
    toast.success(`Member added: ${data.firstName} ${data.lastName}.`);
  };

  const handleRecordPayment = async (data: PaymentData) => {
    toast.success(`Payment of ₹${data.amount} recorded.`);
  };

  const handleNewPlan = async (data: PlanData) => {
    toast.success(`Plan created: ${data.name}.`);
  };

  const handleAddEquipment = async (data: EquipmentData) => {
    toast.success(`Equipment added: ${data.name}.`);
  };

  const handleApproveRequest = async (
    request: PendingRequest,
    data: PaymentData,
  ) => {
    try {
      const payment = pendingPayments.find((p) => p.id === request.id);
      if (!payment) {
        toast("Payment record not found.", { variant: "danger" });
        return;
      }

      // Mark the pending request as paid using the details confirmed in the modal.
      await updateDoc(doc(db, "payments", payment.id), {
        status: "paid",
        method: data.method,
        amount: data.amount,
        daysAdded: data.days,
        planId: data.planId,
        planName: data.planName,
        notes: data.notes || "Approved by admin from dashboard",
        paidAt: new Date(),
      });

      const member = (members.data ?? []).find((m) => m.uid === payment.memberId);
      const currentExpiry = member?.planExpiresAt
        ? new Date(member.planExpiresAt as string)
        : undefined;
      const hasActivePlan = currentExpiry != null && currentExpiry.getTime() > Date.now();
      const base = hasActivePlan ? currentExpiry!.getTime() : Date.now();
      const planExpiresAt = new Date(base + data.days * DAY_MS);

      await updateDoc(doc(db, "users", payment.memberId), {
        planId: data.planId,
        planName: data.planName,
        planStart: hasActivePlan && member?.planStart
          ? new Date(member.planStart as string)
          : new Date(),
        planExpiresAt,
      });

      toast.success(
        `Payment of ₹${data.amount.toLocaleString("en-IN")} recorded for ${payment.memberName}. Plan activated.`,
      );

      // No manual refetch needed — the onSnapshot listener picks up the
      // status change and the request drops out of the notification list.
      void members.refetch();
    } catch (err) {
      console.error("Failed to approve request:", err);
      toast("Failed to approve request.", { variant: "danger" });
      throw err;
    }
  };

  const handleRejectRequest = async (request: PendingRequest) => {
    try {
      await updateDoc(doc(db, "payments", request.id), {
        status: "rejected",
        notes: "Rejected by admin from dashboard",
      });

      toast.info(`Payment request from ${request.memberName} rejected.`);
    } catch (err) {
      console.error("Failed to reject request:", err);
      toast("Failed to reject request.", { variant: "danger" });
    }
  };

  return (
    <AdminDashboardPage
      onAddMember={handleAddMember}
      onRecordPayment={handleRecordPayment}
      onNewPlan={handleNewPlan}
      onAddEquipment={handleAddEquipment}
      plans={plans.data ?? []}
      members={memberOptions}
      pendingRequests={pendingRequests}
      onApproveRequest={handleApproveRequest}
      onRejectRequest={handleRejectRequest}
      onLogout={handleLogout}
    />
  );
}
