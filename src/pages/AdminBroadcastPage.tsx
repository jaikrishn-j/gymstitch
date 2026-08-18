import { useState } from "react";
import { Users, Globe, Shield } from "lucide-react";
import { AdminShell, Chip, Button, cn } from "../components/ui";

const TARGETS = [
  { key: "staff", label: "Staff Only", icon: <Shield size={20} /> },
  { key: "members", label: "Members Only", icon: <Users size={20} /> },
  { key: "both", label: "Everyone", icon: <Globe size={20} /> },
] as const;

const HISTORY = [
  { title: "Holiday Hours Notice", meta: "Aug 5 · Sent to Members · 112 reads", status: "Delivered", tone: "success" },
  { title: "New Strength Equipment Arrival", meta: "Jul 28 · Sent to Everyone · 145 reads", status: "Delivered", tone: "success" },
  { title: "Monthly Staff Coordination", meta: "Jul 20 · Sent to Staff Only · 6 reads", status: "Delivered", tone: "success" },
] as const;

export type AdminBroadcastPageProps = {
  onSend: (data: { title: string; message: string; audience: string }) => void;
};

type SendState = "idle" | "sending" | "sent";

export function AdminBroadcastPage({ onSend }: AdminBroadcastPageProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("staff");
  const [sendState, setSendState] = useState<SendState>("idle");

  const count = message.length;

  const handleSend = () => {
    if (!title.trim() || !message.trim()) return;
    setSendState("sending");
    onSend({ title, message, audience });
    window.setTimeout(() => {
      setSendState("sent");
      setTitle("");
      setMessage("");
      setAudience("staff");
      window.setTimeout(() => setSendState("idle"), 1400);
    }, 900);
  };

  return (
    <AdminShell title="Broadcast Center" active="broadcast" status={{ mode: "online", label: "Online" }}>
      <div className="page-head">
        <div>
          <div className="eyebrow">Communications</div>
          <h2>Broadcast Announcements</h2>
          <p className="sub">
            Send real-time pushes and app notifications to members, staff, or
            both.
          </p>
        </div>
      </div>

      <div className="bc-grid">
        <div className="card" style={{ padding: 20 }}>
          <div className="eyebrow accent" style={{ marginBottom: 16 }}>
            Compose announcement
          </div>
          <div className="field">
            <span className="mb-1.5 block text-[13px] font-semibold text-fg">
              Announcement title
            </span>
            <input
              className="input"
              placeholder="e.g. Special Holiday Hours / Maintenance Notice"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="field">
            <span className="mb-1.5 block text-[13px] font-semibold text-fg">
              Message body
            </span>
            <textarea
              className="input"
              rows={5}
              maxLength={500}
              placeholder="Write your announcement message here…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="count-bar">
              <div className="fill" style={{ width: `${(count / 500) * 100}%` }} />
            </div>
            <div className="mt-2 flex justify-between">
              <span className="hint">Keep announcements concise and informative.</span>
              <span className="hint mono">{count} / 500</span>
            </div>
          </div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            Target audience
          </div>
          <div className="target-grid">
            {TARGETS.map((t) => (
              <div
                key={t.key}
                className={cn("target-card", audience === t.key && "selected")}
                onClick={() => setAudience(t.key)}
              >
                {t.icon}
                <b>{t.label}</b>
              </div>
            ))}
          </div>
          <Button
            fullWidth
            size="lg"
            className="mt-4"
            isDisabled={sendState !== "idle" || !title.trim() || !message.trim()}
            onPress={handleSend}
          >
            {sendState === "idle"
              ? "Send broadcast now"
              : sendState === "sending"
                ? "Broadcasting…"
                : "Broadcast sent ✓"}
          </Button>
        </div>

        <div className="card reveal">
          <div
            className="flex items-center justify-between"
            style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)" }}
          >
            <h3 style={{ fontSize: 17 }}>Broadcast history</h3>
            <Chip color="default" variant="soft" size="sm">
              12 total sent
            </Chip>
          </div>
          {HISTORY.map((h) => (
            <div className="hist-item" key={h.title}>
              <div>
                <div className="font-semibold">{h.title}</div>
                <div className="muted small">{h.meta}</div>
              </div>
              <Chip color="success" variant="soft" size="sm">
                {h.status}
              </Chip>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}