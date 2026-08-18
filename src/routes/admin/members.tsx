import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "@heroui/react";
import { AdminMembersPage } from "../../pages/AdminMembersPage";
import type { Member } from "../../pages/AdminMembersPage";
import type { PaymentData } from "../../components/modals/RecordPaymentModal";
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

function RouteComponent() {
  const [reset, setReset] = useState<CreateMemberResult & { email: string } | null>(null);

  const handleAddMember = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    planId?: string;
  }) => {
    try {
      const res = await createMember({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        planId: data.planId || undefined,
      });
      setReset({ ...res.data, email: data.email });
      toast.success("Member account created.");
    } catch {
      toast("Failed to create member.", { variant: "danger" });
      throw new Error("create-member-failed");
    }
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
    <>
      <AdminMembersPage
        onAddMember={handleAddMember}
        onRecordPayment={handleRecordPayment}
        onMarkAttendance={handleMarkAttendance}
        onAssignPlan={handleAssignPlan}
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