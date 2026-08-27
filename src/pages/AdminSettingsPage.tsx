import { useState, useEffect } from "react";
import { Bell, Building2, CreditCard, Eye, EyeOff, IndianRupee } from "lucide-react";
import { AdminShell, Button, cn } from "../components/ui";

export type GymSettings = {
  gymName: string;
  supportEmail: string;
  contactPhone: string;
  currency: string;
  registrationFee: string;
  gracePeriod: string;
  gatewayEnabled: boolean;
  envMode: "test" | "live";
  keyId: string;
  secretKey: string;
  webhookSecret: string;
  expiryReminder: boolean;
  paymentReceipt: boolean;
};

export type AdminSettingsPageProps = {
  initial?: Partial<GymSettings>;
  onSave: (settings: GymSettings) => void;
  onDiscard: () => void;
  onTestConnection: () => void;
  onLogout?: () => void;
};

export function AdminSettingsPage({
  initial,
  onSave,
  onDiscard,
  onTestConnection,
  onLogout,
}: AdminSettingsPageProps) {
  const [gymName, setGymName] = useState(initial?.gymName ?? "GymStitch Elite Fitness");
  const [supportEmail, setSupportEmail] = useState(initial?.supportEmail ?? "support@gymstitch.com");
  const [contactPhone, setContactPhone] = useState(initial?.contactPhone ?? "+91 98765 43210");
  const [currency, setCurrency] = useState(initial?.currency ?? "INR (₹) — Indian Rupee");
  const [registrationFee, setRegistrationFee] = useState(initial?.registrationFee ?? "500");
  const [gracePeriod, setGracePeriod] = useState(initial?.gracePeriod ?? "3 Days grace");
  const [gatewayEnabled, setGatewayEnabled] = useState(initial?.gatewayEnabled ?? false);
  const [envMode, setEnvMode] = useState<"test" | "live">(initial?.envMode ?? "test");
  const [keyId, setKeyId] = useState(initial?.keyId ?? "");
  const [secretKey, setSecretKey] = useState(initial?.secretKey ?? "");
  const [webhookSecret, setWebhookSecret] = useState(initial?.webhookSecret ?? "");
  const [showSecret, setShowSecret] = useState(false);
  const [expiryReminder, setExpiryReminder] = useState(initial?.expiryReminder ?? true);
  const [paymentReceipt, setPaymentReceipt] = useState(initial?.paymentReceipt ?? true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (initial) {
      if (initial.gymName !== undefined) setGymName(initial.gymName);
      if (initial.supportEmail !== undefined) setSupportEmail(initial.supportEmail);
      if (initial.contactPhone !== undefined) setContactPhone(initial.contactPhone);
      if (initial.currency !== undefined) setCurrency(initial.currency);
      if (initial.registrationFee !== undefined) setRegistrationFee(initial.registrationFee);
      if (initial.gracePeriod !== undefined) setGracePeriod(initial.gracePeriod);
      if (initial.gatewayEnabled !== undefined) setGatewayEnabled(initial.gatewayEnabled);
      if (initial.envMode !== undefined) setEnvMode(initial.envMode);
      if (initial.keyId !== undefined) setKeyId(initial.keyId);
      if (initial.secretKey !== undefined) setSecretKey(initial.secretKey);
      if (initial.webhookSecret !== undefined) setWebhookSecret(initial.webhookSecret);
      if (initial.expiryReminder !== undefined) setExpiryReminder(initial.expiryReminder);
      if (initial.paymentReceipt !== undefined) setPaymentReceipt(initial.paymentReceipt);
    }
  }, [initial]);

  const switchEnv = (mode: "test" | "live") => {
    setEnvMode(mode);
  };

  const handleSave = () => {
    setSaving(true);
    onSave({
      gymName,
      supportEmail,
      contactPhone,
      currency,
      registrationFee,
      gracePeriod,
      gatewayEnabled,
      envMode,
      keyId,
      secretKey,
      webhookSecret,
      expiryReminder,
      paymentReceipt,
    });
    window.setTimeout(() => setSaving(false), 800);
  };

  return (
    <AdminShell title="Settings & Configuration" active="settings" status={{ mode: "online", label: "Online" }} onLogout={onLogout}>
      <div className="page-head">
        <div>
          <div className="eyebrow">Platform Administration</div>
          <h2>Gym &amp; Gateway Settings</h2>
          <p className="sub">
            Manage gym profile, registration fees, online payments, and
            notification preferences.
          </p>
        </div>
      </div>

      <div className="settings-layout">
        <div className="card settings-section reveal">
          <h3>
            <Building2 size={20} />
            Gym Profile &amp; Branding
          </h3>
          <div className="settings-desc">
            Core business identity displayed across member portals, receipts,
            and broadcast messages.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div className="field">
              <label>Gym Name</label>
              <input className="input" value={gymName} onChange={(e) => setGymName(e.target.value)} />
            </div>
            <div className="field">
              <label>Support Email</label>
              <input className="input" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="field">
              <label>Contact Phone</label>
              <input className="input mono" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </div>
            <div className="field">
              <label>Currency &amp; Locale</label>
              <select className="select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option>INR (₹) — Indian Rupee</option>
                <option>USD ($) — US Dollar</option>
                <option>EUR (€) — Euro</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card settings-section reveal">
          <h3>
            <IndianRupee size={20} />
            Membership &amp; Registration Fees
          </h3>
          <div className="settings-desc">
            Configure default onboarding fees and membership grace periods.
          </div>
          <div className="settings-row">
            <div className="s-txt">
              <b>Initial registration fee</b>
              <span>One-time onboarding fee charged automatically when new members subscribe.</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 600, color: "var(--color-muted)" }}>₹</span>
              <input
                className="input mono"
                style={{ width: 110, textAlign: "right" }}
                value={registrationFee}
                onChange={(e) => setRegistrationFee(e.target.value)}
              />
            </div>
          </div>
          <div className="settings-row">
            <div className="s-txt">
              <b>Membership expiry grace period</b>
              <span>Number of days after plan expiration before check-in access is restricted.</span>
            </div>
            <select
              className="select"
              style={{ width: 130 }}
              value={gracePeriod}
              onChange={(e) => setGracePeriod(e.target.value)}
            >
              <option>0 Days (Strict)</option>
              <option>3 Days grace</option>
              <option>7 Days grace</option>
            </select>
          </div>
        </div>

        <div className="card settings-section reveal">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            <h3>
              <CreditCard size={20} />
              Online Payments (Razorpay)
            </h3>
            <span className={cn("connection-status", !gatewayEnabled && "disconnected")}>
              <span className="dot" />
              {gatewayEnabled ? `Connected · ${envMode === "live" ? "Live" : "Test"} Mode` : "Disabled"}
            </span>
          </div>
          <div className="settings-desc">
            Enable online fee collection via UPI, credit/debit cards, and netbanking.
          </div>
          <div className="settings-row">
            <div className="s-txt">
              <b>Enable online payments</b>
              <span>Allows members to pay instantly from the dashboard and auto-renew plans.</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-label="Gateway Toggle"
              className={cn("switch", gatewayEnabled && "on")}
              onClick={() => setGatewayEnabled((v) => !v)}
            >
              <span className="knob" />
            </button>
          </div>

          <div
            style={{
              marginTop: 20,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              transition: "opacity var(--duration-base) var(--ease-out)",
              opacity: gatewayEnabled ? 1 : 0.4,
              pointerEvents: gatewayEnabled ? undefined : "none",
            }}
          >
            <div className="settings-row" style={{ paddingTop: 0 }}>
              <div className="s-txt">
                <b>Environment mode</b>
                <span>Select test mode for sandbox transactions or live mode for real collections.</span>
              </div>
              <div className="env-selector">
                <button
                  type="button"
                  className={cn("env-btn", envMode === "test" && "active")}
                  onClick={() => switchEnv("test")}
                >
                  Test Mode
                </button>
                <button
                  type="button"
                  className={cn("env-btn", envMode === "live" && "active")}
                  onClick={() => switchEnv("live")}
                >
                  Live Mode
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="field">
                <label>Razorpay Key ID</label>
                <input className="input mono" value={keyId} onChange={(e) => setKeyId(e.target.value)} />
              </div>
              <div className="field">
                <label>Secret Key</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="input mono"
                    type={showSecret ? "text" : "password"}
                    style={{ paddingRight: 46 }}
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                  />
                  <button
                    type="button"
                    className="pw-eye"
                    aria-label="Toggle secret visibility"
                    onClick={() => setShowSecret((s) => !s)}
                  >
                    {showSecret ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="field">
              <label>Webhook Secret</label>
              <input
                className="input mono"
                type={showSecret ? "text" : "password"}
                placeholder="whsec_..."
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
              />
              <span className="muted small">Used to verify Razorpay webhook signatures. Set this in your Razorpay dashboard.</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 10,
                padding: "12px 16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5 }}>
                <InfoIcon />
                <span>Verify credentials before saving changes</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                isDisabled={testing}
                onPress={() => {
                  setTesting(true);
                  window.setTimeout(() => {
                    setTesting(false);
                    onTestConnection();
                  }, 900);
                }}
              >
                {testing ? "Testing…" : "Test connection"}
              </Button>
            </div>
          </div>
        </div>

        <div className="card settings-section reveal">
          <h3>
            <Bell size={20} />
            Notifications &amp; Reminders
          </h3>
          <div className="settings-desc">
            Automated alerts sent to members regarding plan renewals and payment receipts.
          </div>
          <div className="settings-row">
            <div className="s-txt">
              <b>Membership expiry reminder</b>
              <span>Send push/broadcast alert 3 days before a member's plan expires.</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-label="Expiry reminder toggle"
              className={cn("switch", expiryReminder && "on")}
              onClick={() => setExpiryReminder((v) => !v)}
            >
              <span className="knob" />
            </button>
          </div>
          <div className="settings-row">
            <div className="s-txt">
              <b>Payment success receipt</b>
              <span>Instantly log and make digital receipts available in member dashboard.</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-label="Receipt toggle"
              className={cn("switch", paymentReceipt && "on")}
              onClick={() => setPaymentReceipt((v) => !v)}
            >
              <span className="knob" />
            </button>
          </div>
        </div>

        <div className="action-bar">
          <div style={{ fontSize: 13.5, color: "var(--color-muted)" }}>
            <span>✨ All changes auto-saved to cloud</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Button
              variant="secondary"
              onPress={() => {
                setGymName("GymStitch Elite Fitness");
                setSupportEmail("support@gymstitch.com");
                setContactPhone("+91 98765 43210");
                setCurrency("INR (₹) — Indian Rupee");
                setRegistrationFee("500");
                setGracePeriod("3 Days grace");
                setGatewayEnabled(false);
                setEnvMode("test");
                setKeyId("");
                setSecretKey("");
                setWebhookSecret("");
                onDiscard();
              }}
            >
              Discard
            </Button>
            <Button onPress={handleSave}>{saving ? "Saving…" : "Save changes"}</Button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}