import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { requireGuest } from "../auth/guard";
import { auth, db } from "../lib/firebase";
import { RegisterPage } from "../pages/RegisterPage";
import { useLoading } from "../components/providers/LoadingProvider";
import type { UserRole } from "../auth/auth-types";

export const Route = createFileRoute("/register")({
  beforeLoad: ({ context }) => {
    requireGuest(context.auth);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { show, hide } = useLoading();
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async ({
    name,
    email,
    phone,
    password,
  }: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    setError(null);
    show("Creating your account…");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });

      const defaultRole: UserRole = "member"

      await setDoc(doc(db, "users", cred.user.uid), {
        name,
        email,
        phone,
        role: defaultRole,
        createdAt: new Date().toISOString(),
      });
      navigate({ to: "/admin/dashboard" });
    } catch {
      setError("Registration failed. This email may already be in use.");
    } finally {
      hide();
    }
  };

  const handleGoogle = async () => {
    setError(null);
    show("Connecting to Google…");
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      const defaultRole: UserRole = "member"
      await setDoc(doc(db, "users", cred.user.uid), {
        name: cred.user.displayName ?? "",
        email: cred.user.email ?? "",
        phone: "",
        role: defaultRole,
        createdAt: new Date().toISOString(),
      });
      navigate({ to: "/member" });
    } catch (error: any) {
      setError("Google sign-up failed. Please try again.");
    } finally {
      hide();
    }
  };

  return <RegisterPage onRegister={handleRegister} onGoogleLogin={handleGoogle} error={error} />;
}