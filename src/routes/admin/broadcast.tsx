import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { signOut } from "firebase/auth";
import { toast } from "@heroui/react";
import { auth } from "../../lib/firebase";
import { AdminBroadcastPage } from "../../pages/AdminBroadcastPage";

export const Route = createFileRoute("/admin/broadcast")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    toast.success("Signed out successfully.");
    navigate({ to: "/login" });
  };

  const handleSend = async (data: {
    title: string;
    message: string;
    audience: string;
  }) => {
    toast.success(
      `Broadcast "${data.title}" queued for ${data.audience}.`,
    );
  };

  return <AdminBroadcastPage onSend={handleSend} onLogout={handleLogout} />;
}