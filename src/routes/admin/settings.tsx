import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { signOut } from "firebase/auth";
import { toast } from "@heroui/react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { savePaymentGatewayConfig } from "../../lib/functions";
import { AdminSettingsPage } from "../../pages/AdminSettingsPage";
import type { GymSettings } from "../../pages/AdminSettingsPage";

export const Route = createFileRoute("/admin/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [initial, setInitial] = useState<Partial<GymSettings> | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await signOut(auth);
    toast.success("Signed out successfully.");
    navigate({ to: "/login" });
  };

  useEffect(() => {
    async function loadSettings() {
      try {
        const [gatewaySnap, gymSnap] = await Promise.all([
          getDoc(doc(db, "paymentGateway", "config")),
          getDoc(doc(db, "gymSettings", "main")),
        ]);

        const gateway = gatewaySnap.exists() ? gatewaySnap.data() : {};
        const gym = gymSnap.exists() ? gymSnap.data() : {};

        setInitial({
          gymName: gym.gymName ?? "GymStitch Elite Fitness",
          supportEmail: gym.supportEmail ?? "support@gymstitch.com",
          contactPhone: gym.contactPhone ?? "+91 98765 43210",
          currency: gym.currency ?? "INR (₹) — Indian Rupee",
          registrationFee: gym.registrationFee ?? "500",
          gracePeriod: gym.gracePeriod ?? "3 Days grace",
          expiryReminder: Boolean(gym.expiryReminder ?? true),
          paymentReceipt: Boolean(gym.paymentReceipt ?? true),
          gatewayEnabled: Boolean(gateway.enabled ?? false),
          envMode: gateway.envMode ?? "test",
          keyId: gateway.keyId ?? "",
          secretKey: gateway.secretKey ?? "",
          webhookSecret: gateway.webhookSecret ?? "",
        });
      } catch (err) {
        console.error("Failed to load settings:", err);
        toast("Failed to load settings.", { variant: "danger" });
      } finally {
        setLoading(false);
      }
    }
    void loadSettings();
  }, []);

  const handleSave = async (settings: GymSettings) => {
    try {
      // Save Razorpay config via Cloud Function (server-side, keeps secret key secure)
      await savePaymentGatewayConfig({
        keyId: settings.keyId,
        secretKey: settings.secretKey,
        webhookSecret: settings.webhookSecret,
        envMode: settings.envMode,
        enabled: settings.gatewayEnabled,
      });

      toast.success(`Settings saved — ${settings.gymName}.`);
    } catch (err) {
      console.error("Failed to save settings:", err);
      toast("Failed to save settings.", { variant: "danger" });
    }
  };

  const handleDiscard = () => {
    toast.info("Changes discarded.");
  };

  const handleTestConnection = () => {
    toast.info("Testing gateway connection…");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted">Loading settings…</div>
      </div>
    );
  }

  return (
    <AdminSettingsPage
      initial={initial}
      onSave={handleSave}
      onDiscard={handleDiscard}
      onTestConnection={handleTestConnection}
      onLogout={handleLogout}
    />
  );
}