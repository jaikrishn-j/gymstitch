import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button, Input } from "../components/ui";

export type ResetPasswordPageProps = {
  email?: string | null;
  error?: string | null;
  invalid?: boolean;
  submitting?: boolean;
  onReset: (password: string) => void;
  onBackToLogin: () => void;
};

export function ResetPasswordPage({
  email,
  error,
  invalid = false,
  submitting = false,
  onReset,
  onBackToLogin,
}: ResetPasswordPageProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const handleSubmit = () => {
    setPasswordError(
      password.length >= 6 ? null : "Password must be at least 6 characters.",
    );
    setConfirmError(confirm === password ? null : "Passwords do not match.");
    if (password.length >= 6 && confirm === password) {
      onReset(password);
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
          <h2>Set a new password.</h2>
          <p>
            Choose a strong password to secure your account and get back to the
            gym.
          </p>
        </div>
        <div className="muted small">
          © {new Date().getFullYear()} GymStitch Platform. All rights reserved.
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card anim-fade-up">
          <h3>Reset your password</h3>
          <p className="sub">
            {email ? (
              <>
                Set a new password for <b className="text-accent">{email}</b>
              </>
            ) : (
              "Set a new password for your account"
            )}
          </p>

          {error ? (
            <div className="banner danger mb-2">
              <span>{error}</span>
            </div>
          ) : null}

          {invalid ? (
            <Button
              fullWidth
              size="lg"
              className="mt-4"
              onPress={onBackToLogin}
            >
              Back to sign in
            </Button>
          ) : (
            <>
              <div className="field">
                <span className="mb-1.5 block text-[13px] font-semibold text-fg">
                  New password
                </span>
                <div className="pw-wrap">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    autoFocus
                    value={password}
                    onValueChange={setPassword}
                    errorMessage={passwordError ?? undefined}
                  />
                  <button
                    type="button"
                    className="eye"
                    aria-label="Toggle password visibility"
                    onClick={() => setShowPassword((s) => !s)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="field">
                <span className="mb-1.5 block text-[13px] font-semibold text-fg">
                  Confirm new password
                </span>
                <div className="pw-wrap">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    value={confirm}
                    onValueChange={setConfirm}
                    errorMessage={confirmError ?? undefined}
                  />
                  <button
                    type="button"
                    className="eye"
                    aria-label="Toggle password visibility"
                    onClick={() => setShowPassword((s) => !s)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Button
                fullWidth
                size="lg"
                isDisabled={submitting}
                onPress={handleSubmit}
              >
                Set password
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
