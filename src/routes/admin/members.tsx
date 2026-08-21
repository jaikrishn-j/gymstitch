import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "@heroui/react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { CACHE_KEYS, TTL, capAttendance, capPayments, toDate, toISO } from "../../lib/cache";
import { useCachedData } from "../../lib/useCachedData";
import { usePaymentSync } from "../../lib/usePaymentSync";
import { localDateKey } from "../../lib/offline";
import type { PendingPayment, RawMember } from "../../lib/offline";
import { AdminMembersPage } from "../../pages/AdminMembersPage";
import type { Member, PaymentRow, AttendanceRow } from "../../pages/AdminMembersPage";
import type { PaymentData } from "../../components/modals/RecordPaymentModal";
import type { AddMemberData, PlanOption } from "../../components/modals/AddMemberModal";
import { ResetLinkModal } from "../../components/modals/ResetLinkModal";
import { createMember } from "../../lib/functions";
import type { CreateMemberResult } from "../../lib/functions";
import { requirePermission } from "../../auth/guard";

export const Route = createFileRoute("/admin/members")({
  beforeLoad: ({ context }) => {
    requirePermission(context.auth, "member");
  },
  component: RouteComponent,
});

const TONES = ["accent", "info", "warn", "danger"] as const;
const DAY_MS = 86_400_000;

type CachedPayment = Omit<PaymentRow, "paidAt"> & { paidAt: string };
type CachedAttendance = Omit<AttendanceRow, "date"> & { date: string };

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function toMember(raw: RawMember, plans: Map<string, PlanOption>, index: number): Member {
  const expiry = toDate(raw.planExpiresAt);
  const plan = raw.planId ? plans.get(raw.planId) : undefined;

  let planLabel = "No plan";
  let expires = "—";
  let status: Member["status"] = "expired";

  if (expiry) {
    planLabel = raw.planName ?? plan?.name ?? "Custom";
    expires = expiry.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const now = Date.now();
    if (expiry.getTime() < now) status = "expired";
    else if (expiry.getTime() - now < 30 * DAY_MS) status = "expiring";
    else status = "active";
  }

  return {
    id: raw.uid,
    initials: initials(raw.name ?? ""),
    tone: TONES[index % TONES.length],
    name: raw.name ?? "",
    email: raw.email ?? "",
    phone: raw.phone ?? "",
    plan: planLabel,
    status,
    expires,
  };
}

const fetchPlansList = async (): Promise<PlanOption[]> => {
  const snap = await getDocs(collection(db, "plans"));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name,
      price: data.price,
      days: data.days,
    };
  });
};

const fetchMembersList = async (): Promise<RawMember[]> => {
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

const fetchPaymentsList = async (): Promise<CachedPayment[]> => {
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
      status: "paid",
    };
  });
  rows.sort((a, b) => (a.paidAt < b.paidAt ? 1 : -1));
  return capPayments(rows);
};

const fetchAttendanceList = async (): Promise<CachedAttendance[]> => {
  const snap = await getDocs(collection(db, "attendance"));
  const rows: CachedAttendance[] = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      memberId: data.memberId,
      memberName: data.memberName,
      date: toISO(data.date) ?? new Date().toISOString(),
      timeIn: data.timeIn,
      timeOut: data.timeOut,
      weight: data.weight ?? null,
    };
  });
  rows.sort((a, b) => (a.date < b.date ? 1 : -1));
  return capAttendance(rows);
};

function RouteComponent() {
  const [reset, setReset] = useState<CreateMemberResult & { email: string } | null>(null);

  const plans = useCachedData<PlanOption[]>({
    key: CACHE_KEYS.plans,
    ttl: TTL.plans,
    fetch: fetchPlansList,
  });
  const members = useCachedData<RawMember[]>({
    key: CACHE_KEYS.members,
    ttl: TTL.members,
    fetch: fetchMembersList,
  });
  const payments = useCachedData<CachedPayment[]>({
    key: CACHE_KEYS.payments,
    ttl: TTL.payments,
    fetch: fetchPaymentsList,
  });
  const attendance = useCachedData<CachedAttendance[]>({
    key: CACHE_KEYS.attendance,
    ttl: TTL.attendance,
    fetch: fetchAttendanceList,
  });

  const forceRefetchAll = useMemo(
    () => () => {
      void Promise.all([
        plans.refetch(),
        members.refetch(),
        payments.refetch(),
        attendance.refetch(),
      ]);
    },
    [plans, members, payments, attendance],
  );

  const paymentSync = usePaymentSync(({ flushed }) => {
    if (flushed > 0) forceRefetchAll();
  });

  const plansMap = useMemo(
    () => new Map((plans.data ?? []).map((plan) => [plan.id, plan])),
    [plans.data],
  );

  const memberRows = useMemo(
    () => (members.data ?? []).map((raw, i) => toMember(raw, plansMap, i)),
    [members.data, plansMap],
  );

  const paymentRows = useMemo(
    () => (payments.data ?? []).map((p) => ({ ...p, paidAt: toDate(p.paidAt) ?? new Date() })),
    [payments.data],
  );

  const attendanceRows = useMemo(
    () => (attendance.data ?? []).map((a) => ({ ...a, date: toDate(a.date) ?? new Date() })),
    [attendance.data],
  );

  const loading = plans.loading || members.loading || payments.loading || attendance.loading;
  const syncing = plans.syncing || members.syncing || payments.syncing || attendance.syncing || paymentSync.flushing;

  const lastSyncedAt = useMemo(() => {
    const times = [
      plans.lastSyncedAt,
      members.lastSyncedAt,
      payments.lastSyncedAt,
      attendance.lastSyncedAt,
    ];
    let min: number | null = null;
    for (const t of times) {
      if (t == null) continue;
      min = min == null ? t : Math.min(min, t);
    }
    return min;
  }, [plans.lastSyncedAt, members.lastSyncedAt, payments.lastSyncedAt, attendance.lastSyncedAt]);

  const handleSync = async () => {
    await paymentSync.syncNow();
    forceRefetchAll();
  };

  const handleAddMember = async (data: AddMemberData) => {
    try {
      const res = await createMember({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        planId: data.planId || undefined,
        whatsapp: data.whatsapp || undefined,
        bloodGroup: data.bloodGroup || undefined,
        dob: data.dob || undefined,
        address: data.address || undefined,
        emergencyName: data.emergencyName || undefined,
        emergencyPhone: data.emergencyPhone || undefined,
      });
      setReset({ ...res.data, email: data.email });
      toast.success("Member account created.");
      void members.refetch();
    } catch {
      toast("Failed to create member.", { variant: "danger" });
      throw new Error("create-member-failed");
    }
  };

  const applyOptimisticPayment = (
    payload: PendingPayment,
    queued: boolean,
  ) => {
    if (payload.planExpiresAt) {
      members.mutate((prev) =>
        (prev ?? []).map((m) =>
          m.uid === payload.memberId
            ? {
                ...m,
                planId: payload.planId,
                planName: payload.planName,
                planStart: payload.planStart ?? undefined,
                planExpiresAt: payload.planExpiresAt,
              }
            : m,
        ),
      );
    }
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

  const handleRecordPayment = async (member: Member, data: PaymentData) => {
    const raw = (members.data ?? []).find((r) => r.uid === member.id);
    const { queued, payload } = await paymentSync.recordPayment(member, raw, data);
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

const findTodayAttendance = (rows: CachedAttendance[], memberId: string) => {
  const todayKey = localDateKey(new Date());
  return (rows ?? []).find(
    (a) =>
      a.memberId === memberId &&
      localDateKey(toDate(a.date) ?? new Date()) === todayKey,
  );
};

const handleMarkAttendance = async (member: Member) => {
  const todayRow = findTodayAttendance(attendance.data ?? [], member.id);

  if (todayRow) {
    if (todayRow.timeOut) {
      toast.info(`${member.name} is already checked out today.`);
      return;
    }
    const { queued, payload } = await paymentSync.checkoutAttendance(
      member,
      todayRow.id,
    );
    attendance.mutate((prev) =>
      (prev ?? []).map((r) =>
        r.id === todayRow.id ? { ...r, timeOut: payload.fields.timeOut ?? null } : r,
      ),
    );
    if (queued) {
      toast.warning(`Check-out for ${member.name} queued — will sync when back online.`);
    } else {
      toast.success(`Checked out ${member.name}.`);
    }
    return;
  }

  const { queued, payload } = await paymentSync.recordAttendance(member);
  attendance.mutate((prev) => {
    const row: CachedAttendance = {
      id: payload.clientId,
      memberId: payload.memberId,
      memberName: payload.memberName,
      date: payload.date,
      timeIn: payload.timeIn,
      timeOut: payload.timeOut,
      weight: null,
    };
    return capAttendance([row, ...(prev ?? [])]);
  });
  if (queued) {
    toast.warning(`Check-in for ${member.name} queued — will sync when back online.`);
  } else {
    toast.success(`Check-in marked for ${member.name}.`);
  }
};

const handleUpdateWeight = async (
  member: Member,
  attendanceId: string,
  weight: number,
) => {
  const { queued, payload } = await paymentSync.updateAttendanceWeight(
    member,
    attendanceId,
    weight,
  );
  attendance.mutate((prev) =>
    (prev ?? []).map((r) =>
      r.id === attendanceId ? { ...r, weight: payload.fields.weight ?? r.weight } : r,
    ),
  );
  if (queued) {
    toast.warning(`Weight for ${member.name} queued — will sync when back online.`);
  } else {
    toast.success(`Weight logged for ${member.name}: ${weight} kg.`);
  }
};

  return (
    <>
      <AdminMembersPage
        members={memberRows}
        plans={plans.data ?? []}
        payments={paymentRows}
        attendance={attendanceRows}
        loading={loading}
        lastSyncedAt={lastSyncedAt}
        pendingCount={paymentSync.pendingCount}
        isOnline={paymentSync.isOnline}
        syncing={syncing}
        onSync={handleSync}
        onAddMember={handleAddMember}
        onRecordPayment={handleRecordPayment}
        onMarkAttendance={handleMarkAttendance}
        onUpdateWeight={handleUpdateWeight}
      />
      <ResetLinkModal
        open={reset != null}
        email={reset?.email ?? ""}
        link={reset?.resetLink ?? ""}
        onClose={() => setReset(null)}
      />
    </>
  );
}