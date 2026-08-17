import { createFileRoute } from "@tanstack/react-router";
import { toast } from "@heroui/react";
import { AdminPlansPage } from "../../pages/AdminPlansPage";
import type { PlanData } from "../../components/modals/NewPlanModal";

export const Route = createFileRoute("/admin/plans")({
  component: RouteComponent,
});

function RouteComponent() {
  const handleNewPlan = (data: PlanData) => {
    toast.success(`Plan created: ${data.name}.`);
  };

  const handleTogglePlan = (name: string) => {
    toast.info(`Toggled plan status for ${name}.`);
  };

  return (
    <AdminPlansPage onNewPlan={handleNewPlan} onTogglePlan={handleTogglePlan} />
  );
}