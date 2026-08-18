import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "@heroui/react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
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
};

export const Route = createFileRoute("/admin/plans")({
  beforeLoad: ({ context }) => {
    requirePermission(context.auth, "plan");
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "plans"));
      const rows: PlanRow[] = snap.docs.map((d) => {
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
        };
      });
      setPlans(rows);
    } catch {
      toast("Failed to load plans.", { variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

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
      fetchPlans();
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
      fetchPlans();
    } catch (error) {
      console.error(error);
      toast("Failed to update plan.", { variant: "danger" });
      throw error;
    }
  };

  const handleTogglePlan = async (id: string) => {
    const plan = plans.find((p) => p.id === id);
    if (!plan) return;
    const newStatus = plan.status === "active" ? "paused" : "active";
    try {
      await updateDoc(doc(db, "plans", id), { status: newStatus });
      toast.info(`Plan "${plan.name}" ${newStatus === "active" ? "activated" : "paused"}.`);
      fetchPlans();
    } catch {
      toast("Failed to update plan status.", { variant: "danger" });
    }
  };

  return (
    <AdminPlansPage
      plans={plans}
      loading={loading}
      onNewPlan={handleNewPlan}
      onUpdatePlan={handleUpdatePlan}
      onTogglePlan={handleTogglePlan}
    />
  );
}
