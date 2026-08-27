import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { signOut } from "firebase/auth";
import { toast } from "@heroui/react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { CACHE_KEYS, TTL } from "../../lib/cache";
import { useCachedData } from "../../lib/useCachedData";
import { requirePermission } from "../../auth/guard";
import { AdminPlansPage } from "../../pages/AdminPlansPage";
import type { PlanData } from "../../components/modals/NewPlanModal";

export type PlanRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  offerPrice: string;
  days: number;
  features: string[];
  status: "active" | "paused";
  featured: boolean;
  requireApproval: boolean;
};

export const Route = createFileRoute("/admin/plans")({
  beforeLoad: ({ context }) => {
    requirePermission(context.auth, "plan");
  },
  component: RouteComponent,
});

const fetchPlans = async (): Promise<PlanRow[]> => {
  const snap = await getDocs(collection(db, "plans"));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name,
      description: data.description ?? "",
      price: data.price,
      offerPrice: data.offerPrice ?? "",
      days: data.days,
      features: data.features ?? [],
      status: data.status ?? "active",
      featured: data.featured ?? false,
      requireApproval: data.requireApproval ?? false,
    };
  });
};

function RouteComponent() {
  const navigate = useNavigate();
  const plans = useCachedData<PlanRow[]>({
    key: CACHE_KEYS.plans,
    ttl: TTL.plans,
    fetch: fetchPlans,
  });

  const handleLogout = async () => {
    await signOut(auth);
    toast.success("Signed out successfully.");
    navigate({ to: "/login" });
  };

  const handleSync = () => {
    void plans.refetch();
  };

  const handleNewPlan = async (data: PlanData) => {
    try {
      await addDoc(collection(db, "plans"), {
        name: data.name,
        description: data.description,
        price: data.price,
        offerPrice: data.offerPrice,
        days: data.days,
        features: data.features,
        status: "active",
        featured: false,
        createdAt: new Date().toISOString(),
      });
      toast.success(`Plan created: ${data.name}.`);
      void plans.refetch();
    } catch (error) {
      console.error(error);
      toast("Failed to create plan.", { variant: "danger" });
      throw error;
    }
  };

  const handleUpdatePlan = async (id: string, data: PlanData) => {
    try {
      await updateDoc(doc(db, "plans", id), {
        name: data.name,
        description: data.description,
        price: data.price,
        offerPrice: data.offerPrice,
        days: data.days,
        features: data.features,
      });
      toast.success(`Plan updated: ${data.name}.`);
      void plans.refetch();
    } catch (error) {
      console.error(error);
      toast("Failed to update plan.", { variant: "danger" });
      throw error;
    }
  };

  const handleTogglePlan = async (id: string) => {
    const plan = (plans.data ?? []).find((p) => p.id === id);
    if (!plan) return;
    const newStatus = plan.status === "active" ? "paused" : "active";
    try {
      await updateDoc(doc(db, "plans", id), { status: newStatus });
      toast.info(`Plan "${plan.name}" ${newStatus === "active" ? "activated" : "paused"}.`);
      void plans.refetch();
    } catch {
      toast("Failed to update plan status.", { variant: "danger" });
    }
  };

  return (
    <AdminPlansPage
      plans={plans.data ?? []}
      loading={plans.loading}
      lastSyncedAt={plans.lastSyncedAt}
      syncing={plans.syncing}
      onSync={handleSync}
      onNewPlan={handleNewPlan}
      onUpdatePlan={handleUpdatePlan}
      onTogglePlan={handleTogglePlan}
      onLogout={handleLogout}
    />
  );
}