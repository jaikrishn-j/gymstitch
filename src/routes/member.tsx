import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { signOut } from "firebase/auth";
import { toast } from "@heroui/react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { requireAuth } from "../auth/guard";
import { auth, db } from "../lib/firebase";
import { CACHE_KEYS, TTL, toISO } from "../lib/cache";
import { useCachedData } from "../lib/useCachedData";
import { createRazorpayOrder } from "../lib/functions";
import { MemberDashboardPage } from "../pages/MemberDashboardPage";
import type {
  MemberPlan,
  MemberPaymentRow,
  MemberAttendanceRow,
} from "../pages/MemberDashboardPage";
import { CompleteProfileModal } from "../components/modals/CompleteProfileModal";
import type { ProfileData } from "../components/modals/CompleteProfileModal";

export const Route = createFileRoute("/member")({
  beforeLoad: ({ context }) => {
    requireAuth(context.auth);
  },
  component: RouteComponent,
});

const DAY_MS = 86_400_000;

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, cb: (response: Record<string, unknown>) => void) => void };
  }
}

function useRazorpayScript() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.Razorpay) {
      setLoaded(true);
      return;
    }
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => setLoaded(true));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, []);
  return loaded;
}

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function newClientId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

// Fetchers

const fetchMemberProfile = async (uid: string) => {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid,
    name: data.name ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    role: data.role ?? "member",
    bloodGroup: data.bloodGroup ?? "",
    dob: data.dob ?? "",
    address: data.address ?? "",
    emergencyName: data.emergencyName ?? "",
    emergencyPhone: data.emergencyPhone ?? "",
    planId: data.planId ?? "",
    planName: data.planName ?? "",
    planStart: data.planStart,
    planExpiresAt: data.planExpiresAt,
    createdAt: data.createdAt,
  };
};

const fetchMemberPayments = async (uid: string) => {
  const q = query(collection(db, "payments"), where("memberId", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      planName: data.planName ?? "Unknown",
      amount: data.amount ?? 0,
      method: data.method ?? "cash",
      date: toISO(data.paidAt) ?? new Date().toISOString(),
      status: data.status ?? "paid",
    } as MemberPaymentRow;
  });
};

const fetchMemberAttendance = async (uid: string) => {
  const q = query(collection(db, "attendance"), where("memberId", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      date: toISO(data.date) ?? new Date().toISOString(),
      timeIn: data.timeIn ?? "",
      timeOut: data.timeOut ?? null,
      weight: data.weight ?? null,
    } as MemberAttendanceRow;
  });
};

const fetchActivePlans = async (): Promise<MemberPlan[]> => {
  const q = query(collection(db, "plans"), where("status", "==", "active"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name,
      meta: `${data.days} days · ₹${(data.price as number).toLocaleString("en-IN")}`,
      price: data.price,
      days: data.days,
      badge: data.featured ? "Popular" : undefined,
    };
  });
};

const fetchGymSettings = async () => {
  try {
    const snap = await getDoc(doc(db, "paymentGateway", "config"));
    if (!snap.exists()) return { gatewayEnabled: false };
    const data = snap.data();
    return { gatewayEnabled: Boolean(data.enabled) };
  } catch {
    return { gatewayEnabled: false };
  }
};

function RouteComponent() {
  const navigate = useNavigate();
  const user = Route.useRouteContext().auth.user!;
  const uid = user.uid;

  const [profileSaved, setProfileSaved] = useState(false);
  const razorpayLoaded = useRazorpayScript();

  const profile = useCachedData<Awaited<ReturnType<typeof fetchMemberProfile>>>({
    key: `${CACHE_KEYS.memberProfile}.${uid}`,
    ttl: TTL.memberProfile,
    fetch: () => fetchMemberProfile(uid),
  });

  const payments = useCachedData<MemberPaymentRow[]>({
    key: `${CACHE_KEYS.memberPayments}.${uid}`,
    ttl: TTL.memberPayments,
    fetch: () => fetchMemberPayments(uid),
  });

  const attendance = useCachedData<MemberAttendanceRow[]>({
    key: `${CACHE_KEYS.memberAttendance}.${uid}`,
    ttl: TTL.memberAttendance,
    fetch: () => fetchMemberAttendance(uid),
  });

  const plans = useCachedData<MemberPlan[]>({
    key: CACHE_KEYS.plans,
    ttl: TTL.plans,
    fetch: fetchActivePlans,
  });

  const gymSettings = useCachedData<{ gatewayEnabled: boolean }>({
    key: CACHE_KEYS.gymSettings,
    ttl: TTL.gymSettings,
    fetch: fetchGymSettings,
  });

  const profileData = profile.data;

  // Check profile completeness
  const isProfileComplete = useMemo(() => {
    if (!profileData) return false;
    return Boolean(
      profileData.name?.trim() &&
      profileData.phone?.trim() &&
      profileData.address?.trim() &&
      profileData.bloodGroup?.trim() &&
      profileData.dob?.trim() &&
      profileData.emergencyName?.trim() &&
      profileData.emergencyPhone?.trim()
    );
  }, [profileData]);

  // Show profile modal when profile is loaded and incomplete (and not yet saved)
  const showProfileModal = !profile.loading && !profileSaved && profileData != null && !isProfileComplete;

  // Use state with lazy initializer for stable time reference (avoid Date.now() in render)
  const [mountTime] = useState(() => Date.now());

  // Compute current plan info
  const currentPlanData = useMemo(() => {
    if (!profileData?.planExpiresAt) return null;
    const expiry = toISO(profileData.planExpiresAt);
    if (!expiry) return null;
    const expiryDate = new Date(expiry);
    if (expiryDate.getTime() < mountTime) return null;

    const daysLeft = Math.ceil((expiryDate.getTime() - mountTime) / DAY_MS);
    const start = toISO(profileData.planStart);
    const startDate = start ? new Date(start) : new Date(mountTime - 30 * DAY_MS);
    const totalDays = Math.ceil((expiryDate.getTime() - startDate.getTime()) / DAY_MS);
    const usedDays = totalDays - daysLeft;
    const progress = Math.min(100, Math.round((usedDays / totalDays) * 100));

    return {
      name: profileData.planName ?? "Active Plan",
      expires: expiryDate.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      daysLeft,
      progress,
    };
  }, [profileData, mountTime]);

  // Handlers

  const handleLogout = async () => {
    await signOut(auth);
    toast.success("Signed out successfully.");
    navigate({ to: "/login" });
  };

  const handleLogWeight = async (weightIn: number, weightOut: number) => {
    const todayKey = localDateKey(new Date());
    const existingToday = (attendance.data ?? []).find((a) => {
      const d = new Date(a.date);
      return localDateKey(d) === todayKey;
    });

    try {
      if (existingToday) {
        await updateDoc(doc(db, "attendance", existingToday.id), {
          weight: weightIn || weightOut || null,
        });
      } else {
        const clientId = newClientId("att");
        await setDoc(doc(db, "attendance", clientId), {
          memberId: uid,
          memberName: user.name,
          date: new Date(),
          timeIn: new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          timeOut: null,
          weight: weightIn || weightOut || null,
        });
      }
      toast.success(`Weight logged: ${weightIn} kg.`);
      void attendance.refetch();
    } catch {
      toast("Failed to log weight.", { variant: "danger" });
    }
  };

  const handleBuyPlan = async (plan: MemberPlan) => {
    const gatewayEnabled = gymSettings.data?.gatewayEnabled ?? false;
    if (gatewayEnabled) {
      if (!razorpayLoaded) {
        toast.info("Payment gateway is loading. Please try again.");
        return;
      }
      try {
        const { data } = await createRazorpayOrder({
          planId: plan.id,
          planName: plan.name,
          amount: plan.price,
          days: plan.days,
        });

        const rzp = new window.Razorpay({
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: "GymStitch",
          description: `${plan.name} — ${plan.days} days`,
          order_id: data.orderId,
          handler: (_response: Record<string, unknown>) => {
            toast.success(`Payment for ${plan.name} successful! Your plan is now active.`);
            void payments.refetch();
            void profile.refetch();
          },
          prefill: {
            name: profileData?.name || user.name || "",
            email: user.email || "",
            contact: profileData?.phone || "",
          },
          theme: {
            color: "#6366f1",
          },
          modal: {
            ondismiss: () => {
              toast.info("Payment was cancelled.");
            },
          },
        });

        rzp.on("payment.failed", (response: Record<string, unknown>) => {
          const error = response.error as { description?: string } | undefined;
          toast(`Payment failed: ${error?.description || "Unknown error"}`, { variant: "danger" });
        });

        rzp.open();
      } catch (err) {
        console.error("Failed to initiate payment:", err);
        toast("Could not start payment. Please try again.", { variant: "danger" });
      }
      return;
    }
    return handleRequestApproval(plan);
  };

  const handleRequestApproval = async (plan: MemberPlan) => {
    try {
      const clientId = newClientId("pay");
      await setDoc(doc(db, "payments", clientId), {
        memberId: uid,
        memberName: user.name,
        planId: plan.id,
        planName: plan.name,
        amount: plan.price,
        daysAdded: plan.days,
        method: "pending",
        notes: "Member-initiated pending approval",
        paidAt: new Date(),
        status: "pending",
      });
      toast.success(`Payment request for ${plan.name} submitted. Awaiting admin approval.`);
      void payments.refetch();
    } catch {
      toast("Failed to submit payment request.", { variant: "danger" });
    }
  };

  const handleDownloadReceipt = (receipt: { id: string }) => {
    toast.success(`Downloading receipt #${receipt.id}…`);
  };

  const handleMarkMessageRead = (id: string) => {
    toast.info(`Message ${id} marked as read.`);
  };

  const handleMarkAllRead = () => {
    toast.info("All notifications marked as read.");
  };

  const handleUpdateProfile = async (data: ProfileData) => {
    try {
      await updateDoc(doc(db, "users", uid), {
        name: data.name,
        phone: data.phone,
        bloodGroup: data.bloodGroup,
        dob: data.dob,
        address: data.address,
        emergencyName: data.emergencyName,
        emergencyPhone: data.emergencyPhone,
      });
      toast.success("Profile updated successfully.");
      setProfileSaved(true);
      void profile.refetch();
    } catch (err) {
      console.error("Profile update failed:", err);
      toast("Failed to update profile.", { variant: "danger" });
    }
  };

  const loading = profile.loading || payments.loading || attendance.loading || plans.loading;

  if (loading && !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <>
      <MemberDashboardPage
        name={profileData?.name || user.name || "Member"}
        profile={profileData ?? undefined}
        currentPlan={currentPlanData}
        payments={payments.data ?? []}
        attendance={attendance.data ?? []}
        plans={plans.data ?? []}
        gatewayEnabled={gymSettings.data?.gatewayEnabled ?? false}
        isProfileComplete={isProfileComplete}
        onLogout={handleLogout}
        onLogWeight={handleLogWeight}
        onBuyPlan={handleBuyPlan}
        onRequestApproval={handleRequestApproval}
        onDownloadReceipt={handleDownloadReceipt}
        onMarkMessageRead={handleMarkMessageRead}
        onMarkAllRead={handleMarkAllRead}
      />
      {showProfileModal && (
        <CompleteProfileModal
          key={`profile-modal-${profileSaved}`}
          initialName={profileData?.name ?? user.name}
          initialPhone={profileData?.phone ?? ""}
          onSave={handleUpdateProfile}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}
