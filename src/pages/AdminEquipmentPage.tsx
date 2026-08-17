import { useState } from "react";
import type { ReactNode } from "react";
import { GridIcon, ListIcon, RefreshCcw } from "lucide-react";
import { AdminShell, Badge, Button, cn } from "../components/ui";
import { useModal } from "../components/providers/ModalProvider";
import { AddEquipmentModal } from "../components/modals/AddEquipmentModal";
import type { EquipmentData } from "../components/modals/AddEquipmentModal";

type Item = {
  name: string;
  category: string;
  zone: string;
  qty: number;
  maint: string;
  overdue?: boolean;
  status: "available" | "maintenance";
  icon: ReactNode;
};

const ICONS = {
  treadmill: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
      <path d="M2 12h3l3-8M9 12h2l2-5M15 12h3l2-5M5 18h14M9 12h8l2 3" />
    </svg>
  ),
  squat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6h12M8 6l4 8 4-8M7 18h10M7 18l3-4M10 18l3-4M13 18l3-4" />
    </svg>
  ),
  legpress: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 10h4M4 14h4M4 6h6M4 18h6M14 4v16M20 8l4 4-4 4" />
    </svg>
  ),
  roller: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="6" width="20" height="4" rx="2" />
      <rect x="4" y="14" width="16" height="4" rx="2" />
    </svg>
  ),
};

const ITEMS: Item[] = [
  { name: "Commercial Treadmill", category: "Cardio", zone: "Zone A", qty: 4, maint: "Sep 2", status: "available", icon: ICONS.treadmill },
  { name: "Heavy Squat Rack", category: "Strength", zone: "Zone B", qty: 2, maint: "Aug 20", status: "available", icon: ICONS.squat },
  { name: "45° Leg Press Machine", category: "Strength", zone: "Zone C", qty: 1, maint: "Overdue", overdue: true, status: "maintenance", icon: ICONS.legpress },
  { name: "Pro Foam Rollers Set", category: "Recovery", zone: "Studio", qty: 8, maint: "Dec 1", status: "available", icon: ICONS.roller },
];

const CHIPS: { key: string; label: string; count: number }[] = [
  { key: "all", label: "All items", count: 24 },
  { key: "cardio", label: "Cardio", count: 9 },
  { key: "strength", label: "Strength", count: 10 },
  { key: "recovery", label: "Recovery", count: 5 },
];

export type AdminEquipmentPageProps = {
  onAddEquipment: (data: EquipmentData) => void;
  onToggleStatus: (name: string) => void;
};

export function AdminEquipmentPage({
  onAddEquipment,
  onToggleStatus,
}: AdminEquipmentPageProps) {
  const [view, setView] = useState<"grid" | "table">("grid");
  const [chip, setChip] = useState("all");
  const { open } = useModal();

  const openEquipmentModal = () => {
    const close = open(
      <AddEquipmentModal onSave={onAddEquipment} onClose={() => close()} />,
      "lg",
    );
  };

  return (
    <AdminShell title="Equipment Inventory" active="equipment" status={{ mode: "online", label: "Online" }}>
      <div className="page-head">
        <div>
          <div className="eyebrow">Facility &amp; Assets</div>
          <h2>Equipment Inventory</h2>
          <p className="sub">
            Track equipment status, category allocation, and maintenance
            schedules.
          </p>
        </div>
        <div className="actions">
          <div className="view-toggle">
            <button
              type="button"
              className={cn(view === "grid" && "active")}
              aria-label="Grid view"
              onClick={() => setView("grid")}
            >
              <GridIcon />
            </button>
            <button
              type="button"
              className={cn(view === "table" && "active")}
              aria-label="Table view"
              onClick={() => setView("table")}
            >
              <ListIcon />
            </button>
          </div>
          <Button onPress={openEquipmentModal}>+ Add equipment</Button>
        </div>
      </div>

      <div className="stats-row">
        <div className="card stat-card card-hover reveal">
          <div className="top">
            <span className="stat-label">Total items</span>
          </div>
          <div className="stat-num">24</div>
        </div>
        <div className="card stat-card card-hover reveal">
          <div className="top">
            <span className="stat-label">Available</span>
          </div>
          <div className="stat-num">18</div>
        </div>
        <div className="card stat-card card-hover reveal">
          <div className="top">
            <span className="stat-label">Maintenance</span>
          </div>
          <div className="stat-num">4</div>
        </div>
        <div className="card stat-card card-hover reveal">
          <div className="top">
            <span className="stat-label">Overdue</span>
          </div>
          <div className="stat-num" style={{ color: "var(--color-danger)" }}>
            1
          </div>
        </div>
      </div>

      <div className="chip-row">
        {CHIPS.map((c) => (
          <button
            key={c.key}
            type="button"
            className={cn("chip", chip === c.key && "active")}
            onClick={() => setChip(c.key)}
          >
            {c.label} <span className="cnt">{c.count}</span>
          </button>
        ))}
      </div>

      {view === "grid" ? (
        <div className="equip-grid">
          {ITEMS.map((item) => (
            <div key={item.name} className="card equip-card card-hover reveal">
              <div className={cn("e-img", item.status === "maintenance" && "maintenance")}>
                <span
                  className={cn(
                    "ring-badge e-status-badge",
                    item.status === "available" ? "badge-green" : "badge-amber",
                  )}
                >
                  {item.status === "available" ? "Available" : "Maintenance"}
                </span>
                {item.icon}
              </div>
              <div className="e-body">
                <div className="e-name">{item.name}</div>
                <div className="e-cat">
                  {item.category} · {item.zone}
                </div>
                <div className="e-meta">
                  <span>Qty: {item.qty}</span>
                  {item.overdue ? (
                    <span style={{ color: "var(--color-danger)", fontWeight: 600 }}>
                      {item.maint}
                    </span>
                  ) : (
                    <span>Next maint: {item.maint}</span>
                  )}
                </div>
              </div>
              <div className="e-actions">
                <Button variant="secondary" size="sm" fullWidth onPress={openEquipmentModal}>
                  Edit item
                </Button>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Toggle status"
                  onClick={() => onToggleStatus(item.name)}
                >
                  <RefreshCcw size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table className="table table-responsive">
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Status</th>
                <th>Next maintenance</th>
                <th className="td-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ITEMS.map((item) => (
                <tr key={item.name}>
                  <td data-label="Equipment">
                    <b>{item.name}</b>
                  </td>
                  <td data-label="Category">{item.category}</td>
                  <td data-label="Qty">{item.qty}</td>
                  <td data-label="Status">
                    <Badge
                      color={item.status === "available" ? "success" : "warning"}
                      variant="soft"
                      size="sm"
                    >
                      {item.status === "available" ? "Available" : "Maintenance"}
                    </Badge>
                  </td>
                  <td data-label="Next maintenance">
                    {item.overdue ? (
                      <span style={{ color: "var(--color-danger)", fontWeight: 600 }}>
                        Overdue
                      </span>
                    ) : (
                      item.maint
                    )}
                  </td>
                  <td className="td-right thide">
                    <Button variant="ghost" size="sm" onPress={openEquipmentModal}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}