import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  Bell,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  Megaphone,
  Menu,
  ReceiptText,
  Settings,
  User,
  Users,
  Wrench,
} from "lucide-react";

export type AdminNavKey =
  | "dashboard"
  | "members"
  | "trainers"
  | "plans"
  | "equipment"
  | "payments"
  | "broadcast"
  | "settings";

const NAV: { section: string; items: { key: AdminNavKey; label: string; href: string; count?: number; icon: typeof Users }[] }[] = [
  {
    section: "Overview",
    items: [
      { key: "dashboard", label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { key: "members", label: "Members", href: "/admin/members", icon: Users, count: 128 },
      { key: "trainers", label: "Trainers", href: "/admin/trainers", icon: Dumbbell },
    ],
  },
  {
    section: "Manage",
    items: [
      { key: "plans", label: "Plans", href: "/admin/plans", icon: CreditCard },
      { key: "equipment", label: "Equipment", href: "/admin/equipment", icon: Wrench },
      { key: "payments", label: "Payments", href: "/admin/payments", icon: ReceiptText },
    ],
  },
  {
    section: "Comms",
    items: [
      { key: "broadcast", label: "Broadcast", href: "/admin/broadcast", icon: Megaphone },
      { key: "settings", label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export type AdminShellProps = {
  title: string;
  active: AdminNavKey;
  status?: { mode: "online" | "offline"; label: string };
  topbarActions?: ReactNode;
  sidebarFoot?: ReactNode;
  onNotifications?: () => void;
  children: ReactNode;
};

export function AdminShell({
  title,
  active,
  status,
  topbarActions,
  sidebarFoot,
  onNotifications,
  children,
}: AdminShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("body-drawer-open", drawerOpen);
    return () => document.body.classList.remove("body-drawer-open");
  }, [drawerOpen]);

  return (
    <div className="app">
      <div className="drawer-scrim" onClick={() => setDrawerOpen(false)} />
      <aside className="sidebar">
        <a className="brand" href="/">
          <span className="brand-mark">
            <DumbbellLogo />
          </span>
          <span className="brand-name">GymStitch</span>
        </a>
        {NAV.map((group) => (
          <div key={group.section}>
            <div className="nav-section">{group.section}</div>
            {group.items.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className={`nav-item${item.key === active ? " active" : ""}`}
                onClick={() => setDrawerOpen(false)}
              >
                <item.icon />
                {item.label}
                {item.count != null ? (
                  <span className="count-pill">{item.count}</span>
                ) : null}
              </a>
            ))}
          </div>
        ))}
        {sidebarFoot ? <div className="sidebar-foot">{sidebarFoot}</div> : null}
      </aside>
      <div className="main">
        <header className="topbar">
          <button
            type="button"
            className="menu-btn"
            aria-label="Open menu"
            onClick={() => setDrawerOpen((s) => !s)}
          >
            <Menu size={18} />
          </button>
          <div>
            <h1>{title}</h1>
          </div>
          <div style={{ marginLeft: "auto" }} className="flex items-center gap-2.5">
            {status ? (
              <span className={`status-pill${status.mode === "offline" ? " off" : ""}`}>
                <span className="dot" />
                {status.label}
              </span>
            ) : null}
            {topbarActions}
            <button
              type="button"
              className="icon-btn"
              aria-label="Notifications"
              onClick={onNotifications}
            >
              <span style={{ position: "relative" }}>
                <Bell size={18} />
                <i
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -3,
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "var(--color-accent)",
                  }}
                />
              </span>
            </button>
            <button type="button" className="icon-btn" aria-label="Account">
              <User size={18} />
            </button>
          </div>
        </header>
        <div className="content">{children}</div>
      </div>
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