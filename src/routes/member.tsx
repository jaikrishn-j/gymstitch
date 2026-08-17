import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { signOut } from "firebase/auth";
import { toast } from "@heroui/react";
import { requireAuth } from "../auth/guard";
import { auth } from "../lib/firebase";
import { MemberDashboardPage } from "../pages/MemberDashboardPage";
import type { MemberPlan, Receipt } from "../pages/MemberDashboardPage";

export const Route = createFileRoute("/member")({
  beforeLoad: ({ context }) => {
    requireAuth(context.auth);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const user = Route.useRouteContext().auth.user!;

  const handleLogout = async () => {
    await signOut(auth);
    toast.success("Signed out successfully.");
    navigate({ to: "/login" });
  };

  const handleLogWeight = (weightIn: number, weightOut: number) => {
    toast.success(`Weight logged: ${weightIn} kg → ${weightOut} kg.`);
  };

  const handleBuyPlan = (plan: MemberPlan) => {
    toast.success(`Proceeding to checkout for ${plan.name}.`);
  };

  const handleRequestApproval = (plan: MemberPlan) => {
    toast.info(`Approval requested for ${plan.name}. Admin will review it.`);
  };

  const handleDownloadReceipt = (receipt: Receipt) => {
    toast.success(`Downloading receipt #${receipt.id}…`);
  };

  const handleMarkMessageRead = (id: string) => {
    toast.info(`Message ${id} marked as read.`);
  };

  const handleMarkAllRead = () => {
    toast.info("All notifications marked as read.");
  };

  return (
    <MemberDashboardPage
      name={user.name}
      onLogout={handleLogout}
      onLogWeight={handleLogWeight}
      onBuyPlan={handleBuyPlan}
      onRequestApproval={handleRequestApproval}
      onDownloadReceipt={handleDownloadReceipt}
      onMarkMessageRead={handleMarkMessageRead}
      onMarkAllRead={handleMarkAllRead}
    />
  );
}