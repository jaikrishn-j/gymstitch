import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { signOut } from "firebase/auth";
import { toast } from "@heroui/react";
import { auth } from "../../lib/firebase";
import { AdminDashboardPage } from "../../pages/AdminDashboardPage";
import type { AddMemberData } from "../../components/modals/AddMemberModal";
import type { PaymentData } from "../../components/modals/RecordPaymentModal";
import type { PlanData } from "../../components/modals/NewPlanModal";
import type { EquipmentData } from "../../components/modals/AddEquipmentModal";

export const Route = createFileRoute("/admin/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    toast.success("Signed out successfully.");
    navigate({ to: "/login" });
  };

  const handleAddMember = (data: AddMemberData) => {
    toast.success(`Member added: ${data.firstName} ${data.lastName}.`);
  };

  const handleRecordPayment = (data: PaymentData) => {
    toast.success(`Payment of ₹${data.amount} recorded.`);
  };

  const handleNewPlan = (data: PlanData) => {
    toast.success(`Plan created: ${data.name}.`);
  };

  const handleAddEquipment = (data: EquipmentData) => {
    toast.success(`Equipment added: ${data.name}.`);
  };

  const handleApproveRequest = (member: string) => {
    toast.success(`Approved approval request from ${member}.`);
  };

  const handleRejectRequest = (member: string) => {
    toast.warning(`Rejected approval request from ${member}.`);
  };

  return (
    <AdminDashboardPage
      onAddMember={handleAddMember}
      onRecordPayment={handleRecordPayment}
      onNewPlan={handleNewPlan}
      onAddEquipment={handleAddEquipment}
      onApproveRequest={handleApproveRequest}
      onRejectRequest={handleRejectRequest}
      onLogout={handleLogout}
    />
  );
}