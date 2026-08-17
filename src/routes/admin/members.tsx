import { createFileRoute } from "@tanstack/react-router";
import { toast } from "@heroui/react";
import { AdminMembersPage } from "../../pages/AdminMembersPage";
import type { Member } from "../../pages/AdminMembersPage";
import type { PaymentData } from "../../components/modals/RecordPaymentModal";

export const Route = createFileRoute("/admin/members")({
  component: RouteComponent,
});

function RouteComponent() {
  const handleAddMember = () => {
    toast.info("Use the dashboard to add a new member.");
  };

  const handleRecordPayment = async (data: PaymentData) => {
    toast.success(`Payment of ₹${data.amount} recorded.`);
  };

  const handleMarkAttendance = (member: Member) => {
    toast.success(`Attendance marked for ${member.name} (${member.id}).`);
  };

  const handleAssignPlan = (member: Member) => {
    toast.info(`Opening plan assignment for ${member.name}…`);
  };

  return (
    <AdminMembersPage
      onAddMember={handleAddMember}
      onRecordPayment={handleRecordPayment}
      onMarkAttendance={handleMarkAttendance}
      onAssignPlan={handleAssignPlan}
    />
  );
}