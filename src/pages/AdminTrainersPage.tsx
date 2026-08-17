import { useState } from "react";
import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { AdminShell, Button } from "../components/ui";
import { AdminModal } from "../components/modals/AdminModal";
import { useModal } from "../components/providers/ModalProvider";
import { AddTrainerModal } from "../components/modals/AddTrainerModal";
import type { TrainerData } from "../components/modals/AddTrainerModal";

type Trainer = {
  initials: string;
  tone: "accent" | "info" | "warn" | "danger";
  name: string;
  role: string;
  chips: { label: string; on: boolean }[];
  foot: ReactNode;
};

export type AdminTrainersPageProps = {
  onAddTrainer: (data: TrainerData) => Promise<void>;
  onResetLink: (name: string) => void;
};

export function AdminTrainersPage({
  onAddTrainer,
  onResetLink,
}: AdminTrainersPageProps) {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkFor, setLinkFor] = useState("");
  const { open } = useModal();

  const openAddTrainer = () => {
    const close = open(
      <AddTrainerModal onSave={onAddTrainer} onClose={() => close()} />,
      "lg",
    );
  };

  const trainers: Trainer[] = [
    {
      initials: "AR",
      tone: "accent",
      name: "Arjun Rao",
      role: "Front Desk & Senior Coach",
      chips: [
        { label: "Members R/W", on: true },
        { label: "Payments C", on: true },
      ],
      foot: (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onPress={() => {
              setLinkFor("Arjun Rao");
              setShowLinkModal(true);
            }}
          >
            Reset link
          </Button>
          <Button variant="ghost" size="sm" onPress={openAddTrainer}>
            Edit
          </Button>
        </div>
      ),
    },
    {
      initials: "MI",
      tone: "info",
      name: "Maya Iyer",
      role: "Fitness Coach",
      chips: [
        { label: "Members R", on: true },
        { label: "Plans R", on: true },
      ],
      foot: (
        <Button variant="secondary" size="sm" fullWidth onPress={openAddTrainer}>
          Edit permissions
        </Button>
      ),
    },
    {
      initials: "RO",
      tone: "warn",
      name: "Rohan Agrawal",
      role: "Gym Owner & Admin",
      chips: [{ label: "Full Unrestricted Access", on: true }],
      foot: (
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          isDisabled
          style={{ color: "var(--color-muted)" }}
        >
          Primary Admin
        </Button>
      ),
    },
    {
      initials: "NK",
      tone: "danger",
      name: "Nikhil K.",
      role: "Front Desk Support",
      chips: [
        { label: "Payments R", on: true },
        { label: "Suspended", on: false },
      ],
      foot: (
        <Button variant="secondary" size="sm" fullWidth onPress={openAddTrainer}>
          Reactivate
        </Button>
      ),
    },
  ];

  return (
    <AdminShell title="Trainers & Staff" active="trainers" status={{ mode: "online", label: "Online" }}>
      <div className="page-head">
        <div>
          <div className="eyebrow">Access Control</div>
          <h2>Staff Directory &amp; Permissions</h2>
          <p className="sub">
            Manage staff accounts, administrative rights, and granular module
            permissions.
          </p>
        </div>
        <div className="actions">
          <Button onPress={openAddTrainer}>+ Add trainer</Button>
        </div>
      </div>

      <div className="stat-roll">
        <div className="card stat-card card-hover reveal">
          <div className="top">
            <span className="stat-label">Total staff</span>
          </div>
          <div className="stat-num">6</div>
        </div>
        <div className="card stat-card card-hover reveal">
          <div className="top">
            <span className="stat-label">Active duty</span>
          </div>
          <div className="stat-num">5</div>
        </div>
        <div className="card stat-card card-hover reveal">
          <div className="top">
            <span className="stat-label">Administrators</span>
          </div>
          <div className="stat-num">1</div>
        </div>
      </div>

      <div className="toolbar" style={{ marginBottom: 20 }}>
        <div className="search">
          <Search />
          <input className="input" placeholder="Search trainers by name or role…" />
        </div>
        <Button onPress={openAddTrainer}>+ Add trainer</Button>
      </div>

      <div className="staff-grid">
        {trainers.map((t) => (
          <div key={t.name} className="card staff-card card-hover reveal">
            <div
              className="s-avatar"
              style={{
                background: toneBg(t.tone),
                color: toneFg(t.tone),
              }}
            >
              {t.initials}
            </div>
            <h3>{t.name}</h3>
            <div className="s-role">{t.role}</div>
            <div className="role-meta">
              {t.chips.map((c) => (
                <span key={c.label} className={`perm-chip ${c.on ? "on" : "off"}`}>
                  {c.label}
                </span>
              ))}
            </div>
            <div className="s-foot">{t.foot}</div>
          </div>
        ))}
      </div>

      <AdminModal
        open={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        title="Share password reset link"
        subtitle="Generated token valid for 24 hours"
      >
        <div className="banner info">
          <span>
            Send this secure one-time token link to let the staff member set a
            new login password.
          </span>
        </div>
        <div className="field">
          <span className="mb-1.5 block text-[13px] font-semibold text-fg">
            Secure reset link
          </span>
          <input
            className="input mono"
            readOnly
            value="https://app.gymstitch.in/auth/reset?tok=8f3A92bC"
          />
        </div>
        <Button
          fullWidth
          onPress={() => {
            onResetLink(linkFor);
            setShowLinkModal(false);
          }}
        >
          Copy link
        </Button>
      </AdminModal>
    </AdminShell>
  );
}

function toneBg(tone: Trainer["tone"]) {
  return {
    accent: "var(--color-accent-soft)",
    info: "var(--color-info-soft)",
    warn: "var(--color-warn-soft)",
    danger: "var(--color-danger-soft)",
  }[tone];
}
function toneFg(tone: Trainer["tone"]) {
  return {
    accent: "var(--color-accent)",
    info: "var(--color-info)",
    warn: "var(--color-warn)",
    danger: "var(--color-danger)",
  }[tone];
}