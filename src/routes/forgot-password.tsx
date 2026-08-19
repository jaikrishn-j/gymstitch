import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { toast } from "@heroui/react";
import { requireGuest } from "../auth/guard";
import { auth, db } from "../lib/firebase";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage";
import { useLoading } from "../components/providers/LoadingProvider";

export const Route = createFileRoute("/forgot-password")({
  beforeLoad: ({ context }) => {
    requireGuest(context.auth);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { show, hide } = useLoading();
  const [error, setError] = useState<string | null>(null);
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSend = async (email: string) => {
    setError(null);
    setSubmitting(true);
    show("Checking your account…");
    try {
      const snap = await getDocs(
        query(collection(db, "users"), where("email", "==", email)),
      );
      if (snap.empty) {
        setError("No account found with this email.");
        return;
      }

      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: true,
      });
      setSentEmail(email);
      toast.success("Password reset link sent. Check your inbox.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
      hide();
    }
  };

  return (
    <ForgotPasswordPage
      onSubmit={handleSend}
      onBackToLogin={() => navigate({ to: "/login" })}
      error={error}
      submitting={submitting}
      sentEmail={sentEmail}
    />
  );
}