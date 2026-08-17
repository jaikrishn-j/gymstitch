import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "@heroui/react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
} from "lucide-react";
import { Button, cn } from "../components/ui";
import { useConfirm } from "../components/providers/ConfirmProvider";

type LogEntry = { text: string; time: string };

function useLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([
    { text: "System initialized. Ready for triggers.", time: "Just now" },
  ]);
  const add = (text: string) =>
    setLogs((prev) => [...prev.slice(-8), { text, time: "Just now" }]);
  const clear = () => setLogs([{ text: "Log cleared.", time: "Just now" }]);
  return { logs, add, clear };
}

function LogPanel({ logs, onClear, heading }: { logs: LogEntry[]; onClear: () => void; heading: string }) {
  return (
    <div className="log-section">
      <div className="log-header">
        <h3 style={{ fontSize: 16, fontWeight: 600 }}>{heading}</h3>
        <Button variant="ghost" size="sm" onPress={onClear}>
          Clear Log
        </Button>
      </div>
      <div className="log-list">
        {logs.map((l, i) => (
          <div className="log-item" key={i}>
            <span>{l.text}</span>
            <span>{l.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionCard({
  title,
  desc,
  icon,
  children,
}: {
  title: string;
  desc: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="action-card">
      <div>
        {icon ? <div className="mb-2">{icon}</div> : null}
        <div style={{ fontWeight: 600, fontSize: 15 }}>{title}</div>
        <div className="muted small" style={{ marginTop: 4 }}>
          {desc}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

const TOAST_VARIANTS = [
  {
    key: "success" as const,
    label: "Trigger Success Toast",
    title: "Success!",
    msg: "Gym membership successfully extended by 30 days.",
  },
  {
    key: "warning" as const,
    label: "Trigger Warning Toast",
    title: "Subscription Expiring",
    msg: "Your gym plan expires in 3 days. Please renew.",
  },
  {
    key: "danger" as const,
    label: "Trigger Error Toast",
    title: "Action Failed",
    msg: "Unable to process payment. Razorpay gateway timed out.",
  },
  {
    key: "info" as const,
    label: "Trigger Info Toast",
    title: "Offline Mode Active",
    msg: "Changes saved to local cache. Will sync upon reconnection.",
  },
];

function ToastSection() {
  const { logs, add, clear } = useLogs();
  return (
    <section style={{ marginBottom: "3rem" }}>
      <div className="hero-section">
        <h1>Toast Notifications</h1>
        <p>
          Non-blocking feedback banners with auto-dismiss countdowns, rich
          status indicators, and smooth physics-based stacking.
        </p>
      </div>
      <div className="card-grid">
        {TOAST_VARIANTS.map((t) => (
          <ActionCard
            key={t.key}
            title={TOAST_TITLES[t.key]}
            desc={TOAST_DESCS[t.key]}
            icon={TOAST_ICONS[t.key]}
          >
            <Button
              variant={t.key === "success" ? "success" : t.key === "warning" ? "warn" : t.key === "danger" ? "danger" : "secondary"}
              onPress={() => {
                const fn =
                  t.key === "success"
                    ? toast.success
                    : t.key === "warning"
                      ? toast.warning
                      : t.key === "danger"
                        ? toast.danger
                        : toast.info;
                fn(t.title, { description: t.msg });
                add(`Triggered [${t.key.toUpperCase()}] — ${t.title}`);
              }}
            >
              {t.label}
            </Button>
          </ActionCard>
        ))}
      </div>
      <LogPanel logs={logs} onClear={clear} heading="Toast Activity Stream" />
    </section>
  );
}

const TOAST_TITLES: Record<string, string> = {
  success: "Success Toast",
  warning: "Warning Toast",
  danger: "Error Toast",
  info: "Info Toast",
};
const TOAST_DESCS: Record<string, string> = {
  success: "Triggered upon successful server actions (e.g., membership renewed, payment verified).",
  warning: "Alerts users to impending thresholds (e.g., subscription expiring in 3 days).",
  danger: "Informs users of failed operations, network errors, or validation rejections.",
  info: "Provides neutral system updates or synchronization notices.",
};
const TOAST_ICONS: Record<string, ReactNode> = {
  success: <CheckCircle2 size={22} style={{ color: "var(--color-success)" }} />,
  warning: <AlertTriangle size={22} style={{ color: "var(--color-warn)" }} />,
  danger: <XCircle size={22} style={{ color: "var(--color-danger)" }} />,
  info: <Info size={22} style={{ color: "var(--color-info)" }} />,
};

const DIALOGS = [
  {
    key: "success" as const,
    label: "Open Success Dialog",
    tone: "success" as const,
    title: "Plan Activated Successfully",
    desc: "Your membership plan has been upgraded to Elite GymPass. All benefits are now active.",
    confirm: "Confirm",
    icon: <CheckCircle2 size={24} />,
  },
  {
    key: "warning" as const,
    label: "Open Warning Dialog",
    tone: "warning" as const,
    title: "Revoke Trainer Access?",
    desc: "Are you sure you want to revoke staff permissions for this trainer? They will lose dashboard access immediately.",
    confirm: "Proceed",
    icon: <AlertTriangle size={24} />,
  },
  {
    key: "danger" as const,
    label: "Open Error Dialog",
    tone: "danger" as const,
    title: "Delete Member Record?",
    desc: "This action cannot be undone. All attendance logs, payment ledgers, and subscriptions will be permanently removed.",
    confirm: "Yes, Delete",
    icon: <XCircle size={24} />,
  },
  {
    key: "info" as const,
    label: "Open Info Dialog",
    tone: "accent" as const,
    title: "Gym Maintenance Notice",
    desc: "Scheduled equipment maintenance will take place on Sunday from 01:00 AM to 05:00 AM. Cardio area will be temporarily closed.",
    confirm: "Confirm",
    icon: <Info size={24} />,
  },
];

function PopupSection() {
  const { logs, add, clear } = useLogs();
  const { confirm } = useConfirm();

  return (
    <section style={{ marginBottom: "3rem" }}>
      <div className="hero-section">
        <h1>Popup Dialogs & Modals</h1>
        <p>
          Focused modal dialogs with backdrop blur, spring-physics scale
          animation, and explicit user action confirmation.
        </p>
      </div>
      <div className="card-grid">
        {DIALOGS.map((d) => (
          <ActionCard key={d.key} title={`${d.label.replace("Open ", "").replace(" Dialog", "")} Dialog`} desc={d.desc} icon={d.icon}>
            <Button
              variant={d.tone === "danger" ? "danger" : d.tone === "warning" ? "warn" : d.tone === "success" ? "success" : "primary"}
              onPress={async () => {
                add(`Opened [${d.key.toUpperCase()}] modal: "${d.title}"`);
                const ok = await confirm({
                  title: d.title,
                  description: d.desc,
                  tone: d.tone,
                  confirmLabel: d.confirm,
                  cancelLabel: "Cancel",
                });
                if (ok) add(`Confirmed action on [${d.key.toUpperCase()}] modal.`);
                else add("Closed modal dialog.");
              }}
            >
              {d.label}
            </Button>
          </ActionCard>
        ))}
      </div>
      <LogPanel logs={logs} onClear={clear} heading="Popup Event Stream" />
    </section>
  );
}

const WORKFLOWS: Record<string, { label: string; steps: string[] }> = {
  "Offline Sync": {
    label: "Run Offline Sync",
    steps: [
      "Opening IndexedDB",
      "Reading pending_syncs queue",
      "Posting batch to PostgreSQL",
      "Clearing local queue",
    ],
  },
  "Razorpay Payment": {
    label: "Run Payment Flow",
    steps: [
      "Creating order via API",
      "Opening Razorpay Checkout",
      "Verifying HMAC Signature",
      "Activating Membership Plan",
    ],
  },
  "Analytics Export": {
    label: "Run Analytics Export",
    steps: [
      "Querying attendance table",
      "Calculating monthly revenue",
      "Formatting CSV payload",
      "Triggering file download",
    ],
  },
};

function LoaderSection() {
  const { logs, add, clear } = useLogs();
  const [workflow, setWorkflow] = useState<string | null>(null);
  const [current, setCurrent] = useState(-1);
  const [done, setDone] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const runWorkflow = (name: string) => {
    if (workflow) return;
    setWorkflow(name);
    setCurrent(0);
    setDone(false);
    add(`Started workflow: ${name}`);
    const steps = WORKFLOWS[name].steps;
    steps.forEach((step, i) => {
      timerRef.current = window.setTimeout(() => {
        setCurrent(i);
        add(`Step ${i + 1}/${steps.length}: ${step}`);
        if (i === steps.length - 1) {
          window.setTimeout(() => {
            setDone(true);
            add(`Workflow completed successfully: ${name}`);
          }, 600);
        }
      }, 900 * (i + 1));
    });
  };

  const percent = done
    ? 100
    : workflow && current >= 0
      ? Math.round((current / (WORKFLOWS[workflow].steps.length - 1)) * 100)
      : 0;

  return (
    <section style={{ marginBottom: "3rem" }}>
      <div className="hero-section">
        <h1>Responsive Live Action Loader</h1>
        <p>
          Real-time multi-step progress indicators that update users on
          background tasks, offline synchronization, and gateway processing.
        </p>
      </div>
      <div className="loader-display-box">
        <div className="flex items-center gap-4">
          <div className={cn("spinner-ring", done && "complete")}>
            {done ? <span style={{ color: "var(--color-success)" }}>✓</span> : null}
          </div>
          <div>
            <div className="font-display" style={{ fontSize: 18, fontWeight: 650 }}>
              {workflow ? `Running: ${workflow}` : "System Idle"}
            </div>
            <div className="muted small">
              {done
                ? `${workflow} completed successfully!`
                : workflow
                  ? `Current Action: ${WORKFLOWS[workflow].steps[current] ?? ""}...`
                  : "Select an action below to run the responsive live loader."}
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="font-display" style={{ fontSize: 24, fontWeight: 700 }}>
              {percent}%
            </div>
          </div>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
        </div>
        <div className="steps-list">
          {workflow
            ? WORKFLOWS[workflow].steps.map((s, i) => (
                <div
                  key={s}
                  className={cn(
                    "step-item",
                    i < current || (done && i === current) ? "done" : i === current ? "active" : "",
                  )}
                >
                  <span className="step-bullet">{i < current || (done && i === current) ? "✓" : i + 1}</span>
                  {s}
                </div>
              ))
            : null}
        </div>
      </div>
      <div className="card-grid">
        {Object.entries(WORKFLOWS).map(([name, w]) => (
          <ActionCard key={name} title={name} desc={WORKFLOW_DESCS[name]}>
            <Button onPress={() => runWorkflow(name)} isDisabled={!!workflow}>
              {w.label}
            </Button>
          </ActionCard>
        ))}
      </div>
      <LogPanel logs={logs} onClear={clear} heading="Loader Activity Stream" />
    </section>
  );
}

const WORKFLOW_DESCS: Record<string, string> = {
  "Offline Sync": "Flushes IndexedDB pending sync queue to PostgreSQL database.",
  "Razorpay Payment": "Initiates secure payment order and verifies HMAC signature.",
  "Analytics Export": "Aggregates attendance trends, revenue ledgers, and membership counts.",
};

const SCENARIOS: Record<string, { label: string; steps: { label: string; desc: string }[] }> = {
  "member-onboarding": {
    label: "New Member Onboarding & Plan Assignment",
    steps: [
      { label: "Register Clerk User Profile", desc: "Creating user identity and generating auth session tokens." },
      { label: "Assign Membership Plan", desc: "Linking user to GymPass Elite subscription in Drizzle ORM." },
      { label: "Record Initial Payment", desc: "Logging manual cash/UPI payment into ledger table." },
      { label: "Send Welcome Broadcast", desc: "Dispatching automated welcome message and notification." },
    ],
  },
  "payment-reconciliation": {
    label: "Razorpay Ledger Reconciliation",
    steps: [
      { label: "Fetch Gateway Transactions", desc: "Querying Razorpay API for successful payment logs." },
      { label: "Compare with Local DB Ledger", desc: "Cross-referencing payment IDs with PostgreSQL records." },
      { label: "Resolve Discrepancies", desc: "Upserting missing entries and marking offline syncs." },
      { label: "Generate Audit Report", desc: "Compiling summary statement for admin financial review." },
    ],
  },
  "db-migration": {
    label: "PostgreSQL Schema Migration & Indexing",
    steps: [
      { label: "Check Drizzle Migrations", desc: "Inspecting migration journal in drizzle/ folder." },
      { label: "Apply Schema Diffs", desc: "Executing ALTER TABLE statements on PostgreSQL database." },
      { label: "Rebuild Indexes", desc: "Optimizing query performance on clerkUserId and dates." },
      { label: "Verify Health Check", desc: "Running connection ping and validating foreign keys." },
    ],
  },
};

function DelayLoaderSection() {
  const { logs, add, clear } = useLogs();
  const [delay, setDelay] = useState<string>("1200");
  const [scenarioKey, setScenarioKey] = useState("member-onboarding");
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [current, setCurrent] = useState(-1);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const scenario = SCENARIOS[scenarioKey];
  const manual = delay === "manual";

  const resetRunner = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setRunning(false);
    setCompleted(false);
    setCurrent(-1);
    add("Runner reset to idle state.");
  };

  const advance = (n: number) => {
    const total = scenario.steps.length;
    setCurrent(n);
    add(`Executing Step ${n + 1}: ${scenario.steps[n].label}`);
    if (n === total - 1) {
      setCompleted(true);
      add("Scenario finished successfully.");
    }
  };

  const startRunner = () => {
    if (running) return;
    setRunning(true);
    setCompleted(false);
    setCurrent(-1);
    add(`Started scenario: ${scenario.label} [Mode: ${delay}]`);
    if (manual) return;
    const d = Number(delay);
    scenario.steps.forEach((_, i) => {
      timerRef.current = window.setTimeout(() => advance(i), d * (i + 1));
    });
  };

  return (
    <section style={{ marginBottom: "3rem" }}>
      <div className="hero-section">
        <h1>Manual & Timed Delay Loader</h1>
        <p>
          Configurable async step runner for debugging UX latency, step delays,
          and user communication during heavy database transactions.
        </p>
      </div>
      <div className="control-panel">
        <div className="control-row">
          <div className="control-group" style={{ flex: 1, minWidth: 240 }}>
            <label>Step Delay Duration</label>
            <select className="select" value={delay} onChange={(e) => setDelay(e.target.value)}>
              <option value="600">Fast (600ms per step)</option>
              <option value="1200">Standard (1.2s per step)</option>
              <option value="2500">Slow / Demo (2.5s per step)</option>
              <option value="manual">Manual Step-by-Step (Click Next)</option>
            </select>
          </div>
          <div className="control-group" style={{ flex: 1, minWidth: 240 }}>
            <label>Simulation Scenario</label>
            <select className="select" value={scenarioKey} onChange={(e) => setScenarioKey(e.target.value)}>
              {Object.entries(SCENARIOS).map(([k, s]) => (
                <option key={k} value={k}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="btn-group">
            <Button onPress={startRunner} isDisabled={running}>
              Start Runner
            </Button>
            <Button
              variant="secondary"
              isDisabled={!running || completed || !manual}
              onPress={() => advance(current + 1)}
            >
              Next Step →
            </Button>
            <Button variant="secondary" onPress={resetRunner}>
              Reset
            </Button>
          </div>
        </div>
      </div>
      <div className="runner-box">
        <div className="flex items-center justify-between">
          <div className="runner-stage-title">
            {running ? scenario.label : "Ready to Execute Scenario"}
          </div>
          <span className={cn("status-pill", !running && !completed && "off")}>
            <span className="dot" />
            {completed ? "Status: Completed" : running ? "Status: Running" : "Status: Idle"}
          </span>
        </div>
        <div className="runner-timeline">
          {scenario.steps.map((s, i) => (
            <div
              key={s.label}
              className={cn(
                "timeline-step",
                (completed && i <= current) || (running && i < current) ? "completed" : running && i === current ? "active" : "",
              )}
            >
              <div className="timeline-icon">
                {completed && i <= current ? "✓" : i + 1}
              </div>
              <div>
                <div style={{ fontWeight: 550, fontSize: 14 }}>{s.label}</div>
                <div className="muted small">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <LogPanel logs={logs} onClear={clear} heading="Step Runner Event Stream" />
    </section>
  );
}

function MicroSection() {
  const [toggles, setToggles] = useState({ sync: true, cache: false });
  const [tab, setTab] = useState(0);
  const tabs = ["Overview", "Analytics", "Settings"];

  return (
    <section style={{ marginBottom: "2rem" }}>
      <div className="hero-section">
        <h1>Micro-UI Transitions & Interactions</h1>
        <p>
          Polished motion details, spring physics toggles, tab sliding
          indicators, and responsive feedback states.
        </p>
      </div>
      <div className="grid-2" style={{ marginTop: 0 }}>
        <div className="showcase-card">
          <div className="showcase-title">Button Press Physics &amp; Glow</div>
          <p className="muted small">
            Tactile scale feedback (0.96 scale on tap-down) with smooth shadow
            elevation.
          </p>
          <div className="flex gap-3">
            <Button onPress={() => toast.info("Primary CTA Clicked!")}>
              Primary Action
            </Button>
            <Button variant="secondary" onPress={() => toast.info("Secondary Clicked!")}>
              Secondary Action
            </Button>
          </div>
        </div>

        <div className="showcase-card">
          <div className="showcase-title">Spring-Physics Toggles</div>
          <p className="muted small">
            Smooth cubic-bezier spring animation with subtle shadow depth.
          </p>
          <div>
            <div className="switch-wrapper">
              <span>Gateway Auto-Sync</span>
              <span
                className={cn("slider", toggles.sync && "on")}
                onClick={() => setToggles((t) => ({ ...t, sync: !t.sync }))}
              />
            </div>
            <div className="switch-wrapper">
              <span>Offline Cache Mode</span>
              <span
                className={cn("slider", toggles.cache && "on")}
                onClick={() => setToggles((t) => ({ ...t, cache: !t.cache }))}
              />
            </div>
          </div>
        </div>

        <div className="showcase-card">
          <div className="showcase-title">Sliding Tab Indicator</div>
          <p className="muted small">
            Fluid pill indicator that glides between active tabs.
          </p>
          <div className="tab-group">
            <span
              className="tab-indicator"
              style={{
                width: `calc(${100 / tabs.length}% - 4px)`,
                transform: `translateX(${tab * 100}%)`,
              }}
            />
            {tabs.map((t, i) => (
              <button
                key={t}
                type="button"
                className={cn("tab-btn", tab === i && "active")}
                onClick={() => setTab(i)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="showcase-card">
          <div className="showcase-title">Live Status &amp; Sync Badges</div>
          <p className="muted small">
            Real-time pulsing indicator for online connection and sync state.
          </p>
          <div className="flex gap-3">
            <span className="badge-live">
              <span className="pulse-dot" />
              System Online
            </span>
            <span className="badge-live" style={{ color: "var(--color-warn)" }}>
              <span className="pulse-dot" style={{ background: "var(--color-warn)" }} />
              Pending Sync (2)
            </span>
          </div>
        </div>

        <div className="hover-lift-card" onClick={() => toast.info("Card clicked!")}>
          <h4 style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>
            Elite Membership Pass
          </h4>
          <p className="muted small">
            Click or hover to inspect smooth elevation physics.
          </p>
        </div>
      </div>
    </section>
  );
}

export function UiSuitePage() {
  return (
    <div className="suite-shell">
      <header className="suite-header">
        <a href="/" className="flex items-center gap-2.5">
          <span className="brand-mark">
            <DumbbellLogo />
          </span>
          <span className="brand-name">GymStitch UI Suite</span>
        </a>
        <nav className="nav-links">
          <a href="#toasts">Toasts</a>
          <a href="#popups">Popups</a>
          <a href="#loader">Live Loader</a>
          <a href="#steps">Async Step Runner</a>
          <a href="#micro">Micro UI</a>
          <a href="/">Overview</a>
        </nav>
      </header>
      <main className="suite-main">
        <div id="toasts">
          <ToastSection />
        </div>
        <div id="popups">
          <PopupSection />
        </div>
        <div id="loader">
          <LoaderSection />
        </div>
        <div id="steps">
          <DelayLoaderSection />
        </div>
        <div id="micro">
          <MicroSection />
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