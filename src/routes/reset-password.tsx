import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  confirmPasswordReset,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "@heroui/react";
import { auth, db } from "../lib/firebase";
import { useLoading } from "../components/providers/LoadingProvider";
import { ResetPasswordPage } from "../pages/ResetPasswordPage";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    oobCode: typeof search.oobCode === "string" ? search.oobCode : null,
    mode: typeof search.mode === "string" ? search.mode : null,
    email: typeof search.email === "string" ? search.email : null,
  }),
  component: RouteComponent,
});

async function resolveHome(
  uid: string,
): Promise<"/admin/dashboard" | "/member"> {
  const snap = await getDoc(doc(db, "users", uid));
  const role = snap.exists() ? snap.data().role : "member";
  return role === "admin" || role === "staff" ? "/admin/dashboard" : "/member";
}

function RouteComponent() {
  const navigate = useNavigate();
  const { show, hide } = useLoading();
  const search = Route.useSearch();
  const [error, setError] = useState<string | null>(null);

  const validLink = Boolean(search.oobCode);

  const handleReset = async (password: string) => {
    if (!search.oobCode) return;
    if (!search.email) {
      setError("We couldn't identify this account. Please sign in instead.");
      return;
    }
    setError(null);
    show("Setting up your account…");
    try {
      await confirmPasswordReset(auth, search.oobCode, password);
      const cred = await signInWithEmailAndPassword(
        auth,
        search.email,
        password,
      );
      hide();
      toast.success("Password set. Welcome!");
      navigate({ to: await resolveHome(cred.user.uid) });
    } catch {
      hide();
      setError("This link is invalid or has expired. Please request a new one.");
    }
  };

  return (
    <ResetPasswordPage
      email={search.email}
      error={error}
      invalid={!validLink}
      onReset={handleReset}
      onBackToLogin={() => navigate({ to: "/login" })}
    />
  );
}
