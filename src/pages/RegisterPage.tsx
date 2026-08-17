import { useMemo, useState } from "react";
import { Eye, EyeOff, ShieldCheck, Zap } from "lucide-react";
import { Button, Input } from "../components/ui";

export type RegisterPageProps = {
  onRegister: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => void;
  onGoogleLogin: () => void;
  error?: string | null;
};

export function RegisterPage({
  onRegister,
  onGoogleLogin,
  error,
}: RegisterPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const emailValid = useMemo(
    () => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email),
    [email],
  );

  const handleSubmit = () => {
    setNameError(name.trim() ? null : "Please enter your name.");
    setEmailError(emailValid ? null : "Please enter a valid email address.");
    setPasswordError(
      password.length >= 6 ? null : "Password must be at least 6 characters.",
    );
    if (name.trim() && emailValid && password.length >= 6) {
      onRegister({ name, email, phone, password });
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
          <h2>Manage gym operations seamlessly.</h2>
          <p>
            Sign in to access your administrative suite, staff schedules,
            member portals, and real-time payment ledgers.
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
          <h3>Create your account</h3>
          <p className="sub">Start managing your gym on GymStitch</p>

          <Button fullWidth variant="secondary" className="oauth-btn mb-4" onPress={onGoogleLogin}>
            <GoogleIcon />
            Continue with Google
          </Button>

          <div className="divider">or sign up with email</div>

          {error ? (
            <div className="banner danger mb-2">
              <span>{error}</span>
            </div>
          ) : null}

          <div className="field">
            <Input
              label="Full name *"
              placeholder="Rohan Sharma"
              autoComplete="name"
              autoFocus
              value={name}
              onValueChange={setName}
              errorMessage={nameError ?? undefined}
            />
          </div>
          <div className="field">
            <Input
              label="Email address *"
              type="email"
              placeholder="rohan@gymstitch.in"
              autoComplete="email"
              value={email}
              onValueChange={setEmail}
              errorMessage={emailError ?? undefined}
            />
          </div>
          <div className="field">
            <Input
              label="Phone number"
              type="tel"
              placeholder="+91 98765 43210"
              autoComplete="tel"
              className="mono"
              value={phone}
              onValueChange={setPhone}
            />
          </div>
          <div className="field">
            <span className="mb-1.5 block text-[13px] font-semibold text-fg">
              Password *
            </span>
            <div className="pw-wrap">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
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

          <Button fullWidth size="lg" onPress={handleSubmit}>
            Create account
          </Button>

          <div className="form-foot justify-center">
            <span className="muted">
              Already have an account?{" "}
              <a href="/login">Sign in</a>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

function DumbbellLogo() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6.5 6.5v11M17.5 6.5v11M10 20V4M14 20V4" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path fill="#EA4335" d="M12 5.5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 2.3 14.8 1.3 12 1.3 7.7 1.3 4 3.9 2.3 7.6l3.6 2.8C6.8 7.4 9.2 5.5 12 5.5z" />
      <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4.2h6.5c-.1 1-.8 2.5-2.3 3.5l3.5 2.7c2-1.9 3.8-4.5 3.8-8.2z" />
      <path fill="#FBBC05" d="M5.9 14.4c-.2-.7-.4-1.4-.4-2.2s.1-1.5.4-2.2L2.3 7.1C1.4 8.7 1 10.4 1 12.2c0 1.8.5 3.5 1.3 5.1l3.6-2.9z" />
      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-2.9l-3.5-2.7c-1 .7-2.3 1.2-4.5 1.2-2.8 0-5.2-1.9-6.1-4.5L1.9 17.2C3.6 21 7.5 23 12 23z" />
    </svg>
  );
}