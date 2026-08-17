import { createFileRoute } from "@tanstack/react-router";
import { toast } from "@heroui/react";
import { AdminTrainersPage } from "../../pages/AdminTrainersPage";
import type { TrainerData } from "../../components/modals/AddTrainerModal";

export const Route = createFileRoute("/admin/trainers")({
  component: RouteComponent,
});

function RouteComponent() {
  const handleAddTrainer = async (data: TrainerData) => {
    toast.success(`Trainer added: ${data.firstName} ${data.lastName}.`);
  };

  const handleResetLink = (name: string) => {
    toast.info(`Password reset link sent to ${name}.`);
  };

  return (
    <AdminTrainersPage onAddTrainer={handleAddTrainer} onResetLink={handleResetLink} />
  );
}