import { createFileRoute } from "@tanstack/react-router";
import { toast } from "@heroui/react";
import { requirePermission } from "../../auth/guard";
import { AdminEquipmentPage } from "../../pages/AdminEquipmentPage";
import type { EquipmentData } from "../../components/modals/AddEquipmentModal";

export const Route = createFileRoute("/admin/equipment")({
  beforeLoad: ({ context }) => {
    requirePermission(context.auth, "equipment");
  },
  component: RouteComponent,
});

function RouteComponent() {
  const handleAddEquipment = async (data: EquipmentData) => {
    toast.success(`Equipment added: ${data.name}.`);
  };

  const handleToggleStatus = (name: string) => {
    toast.info(`Toggled maintenance status for ${name}.`);
  };

  return (
    <AdminEquipmentPage
      onAddEquipment={handleAddEquipment}
      onToggleStatus={handleToggleStatus}
    />
  );
}