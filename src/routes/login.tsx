import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { toast } from "@heroui/react";
import { requireGuest } from "../auth/guard";
import { useAuth } from "../auth/auth-context";
import { auth } from "../lib/firebase";
import { LoginPage } from "../pages/LoginPage";
import { useLoading } from "../components/providers/LoadingProvider";

export const Route = createFileRoute("/login")({
  beforeLoad: ({ context }) => {
    requireGuest(context.auth);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { show, hide } = useLoading();
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    navigate({ to: user.role === "member" ? "/member" : "/admin/dashboard" });
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (email: string, password: string) => {
    setError(null);
    show("Signing you in…");
    try {
      await signInWithEmailAndPassword(auth, email, password);
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
      await signInWithPopup(auth, new GoogleAuthProvider());
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