import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "@heroui/react";
import { requireGuest } from "../auth/guard";
import { auth, db } from "../lib/firebase";
import { LoginPage } from "../pages/LoginPage";
import { useLoading } from "../components/providers/LoadingProvider";
import type { AppUser } from "../auth/auth-types";

export const Route = createFileRoute("/login")({
  beforeLoad: ({ context }) => {
    requireGuest(context.auth);
  },
  component: RouteComponent,
});

async function resolveRole(uid: string): Promise<AppUser["role"]> {
  const snap = await getDoc(doc(db, "users", uid));
  const role = snap.exists() ? snap.data().role : "member";
  return role === "admin" || role === "staff" ? role : "member";
}

function RouteComponent() {
  const navigate = useNavigate();
  const { show, hide } = useLoading();
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const goHome = async (uid: string) => {
    const role = await resolveRole(uid);
    navigate({ to: role === "member" ? "/member" : "/admin/dashboard" });
  };

  const handleLogin = async (email: string, password: string) => {
    setError(null);
    show("Signing you in…");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await goHome(cred.user.uid);
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      hide();
    }
  };

  const handleGoogle = async () => {
    setError(null);
    show("Connecting to Google…");
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      await goHome(cred.user.uid);
    } catch {
      setError("Google sign-in failed. Please try again.");
    } finally {
      hide();
    }
  };

 
  return (
    <LoginPage
      onLogin={handleLogin}
      onGoogleLogin={handleGoogle}
      onOtpVerify={(otp) => {
        toast.info(`Verifying OTP ${otp}…`);
        setOtpEmail(null);
      }}
      onResendCode={() => toast.info("A new verification code has been sent.")}
      onBackToSignIn={() => setOtpEmail(null)}
      otpEmail={otpEmail}
      error={error}
    />
  );
}