import { useMemo, useState } from "react";
import { MailCheck, ShieldCheck, Zap } from "lucide-react";
import { Button, Input } from "../components/ui";

export type ForgotPasswordPageProps = {
  onSubmit: (email: string) => void;
  onBackToLogin: () => void;
  error?: string | null;
  submitting?: boolean;
  sentEmail?: string | null;
};

export function ForgotPasswordPage({
  onSubmit,
  onBackToLogin,
  error,
  submitting = false,
  sentEmail = null,
}: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  const emailValid = useMemo(
    () => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email),
    [email],
  );

  const handleSubmit = () => {
    setEmailError(emailValid ? null : "Please enter a valid email address.");
    if (emailValid) {
      onSubmit(email);
    }
  };

  return (
    <div className="auth-body">
      <aside className="auth-brand">
        <a className="flex items-center gap-2.5" href="/">
          <span className="brand-mark">
            <DumbbellLogo />
          </span>
          <span className="brand-name">GymStitch</span>
        </a>
        <div className="quote">
          <div className="eyebrow accent">Secure Enterprise Access</div>
          <h2>Reset your password.</h2>
          <p>
            Enter your account email and we'll send you a secure link to set a
            new password and get back to the gym.
          </p>
          <div className="feature-pills">
            <div className="feature-pill">
              <ShieldCheck size={14} />
              Role-based security
            </div>
            <div className="feature-pill">
              <Zap size={14} />
              Offline IndexedDB sync
            </div>
          </div>
        </div>
        <div className="muted small">
          © {new Date().getFullYear()} GymStitch Platform. All rights reserved.
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card anim-fade-up">
          {sentEmail ? (
            <>
              <div className="mb-4 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent)]/15 text-accent">
                  <MailCheck size={28} />
                </div>
              </div>
              <h3>Check your email</h3>
              <p className="sub">
                We sent a password reset link to{" "}
                <b className="text-accent">{sentEmail}</b>. Follow the link to
                set a new password.
              </p>
              <div className="banner mb-2 mt-2">
                <span>
                  Didn't receive it? Check your spam folder, or request another
                  link.
                </span>
              </div>
              <Button
                fullWidth
                size="lg"
                className="mt-4"
                onPress={onBackToLogin}
              >
                Back to sign in
              </Button>
            </>
          ) : (
            <>
              <h3>Forgot your password?</h3>
              <p className="sub">
                No worries. Enter your email and we'll send you a reset link.
              </p>

              {error ? (
                <div className="banner danger mb-2">
                  <span>{error}</span>
                </div>
              ) : null}

              <div className="field">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="rohan@gymstitch.in"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onValueChange={setEmail}
                  errorMessage={emailError ?? undefined}
                />
              </div>

              <Button
                fullWidth
                size="lg"
                isDisabled={submitting}
                onPress={handleSubmit}
              >
                Send reset link
              </Button>

              <div className="form-foot justify-center">
                <span className="muted">
                  Remembered it?{" "}
                  <a
                    href="/login"
                    onClick={(e) => {
                      e.preventDefault();
                      onBackToLogin();
                    }}
                  >
                    Back to sign in
                  </a>
                </span>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function DumbbellLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6.5 6.5v11M17.5 6.5v11M10 20V4M14 20V4" />
    </svg>
  );
}