import { createFileRoute } from "@tanstack/react-router";
import { toast } from "@heroui/react";
import { AdminBroadcastPage } from "../../pages/AdminBroadcastPage";

export const Route = createFileRoute("/admin/broadcast")({
  component: RouteComponent,
});

function RouteComponent() {
  const handleSend = async (data: {
    title: string;
    message: string;
    audience: string;
  }) => {
    toast.success(
      `Broadcast "${data.title}" queued for ${data.audience}.`,
    );
  };

  return <AdminBroadcastPage onSend={handleSend} />;
}