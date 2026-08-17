import { createFileRoute } from "@tanstack/react-router";
import { toast } from "@heroui/react";
import { AdminSettingsPage } from "../../pages/AdminSettingsPage";
import type { GymSettings } from "../../pages/AdminSettingsPage";

export const Route = createFileRoute("/admin/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const handleSave = (settings: GymSettings) => {
    toast.success(`Settings saved — ${settings.gymName}.`);
  };

  const handleDiscard = () => {
    toast.info("Changes discarded.");
  };

  const handleTestConnection = () => {
    toast.info("Testing gateway connection…");
  };

  return (
    <AdminSettingsPage
      onSave={handleSave}
      onDiscard={handleDiscard}
      onTestConnection={handleTestConnection}
    />
  );
}