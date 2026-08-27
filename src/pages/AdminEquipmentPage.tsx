import { useState } from "react";
import type { ReactNode } from "react";
import { GridIcon, ListIcon, RefreshCcw, Trash2 } from "lucide-react";
import {
  AdminShell,
  Chip,
  Button,
  EmptyState,
  cn,
} from "../components/ui";
import { useModal } from "../components/providers/ModalProvider";
import { useConfirm } from "../components/providers/ConfirmProvider";
import { AddEquipmentModal } from "../components/modals/AddEquipmentModal";
import type { EquipmentData } from "../components/modals/AddEquipmentModal";

export type EquipmentRow = {
  id: string;
  name: string;
  category: string;
  zone: string;
  qty: number;
  maint: string;
  overdue?: boolean;
  status: "available" | "maintenance";
  imageUrl?: string;
  imagePath?: string;
  purchaseDate?: string;
  maintenanceDate?: string;
};

const ICONS: Record<string, ReactNode> = {
  Cardio: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
      <path d="M2 12h3l3-8M9 12h2l2-5M15 12h3l2-5M5 18h14M9 12h8l2 3" />
    </svg>
  ),
  Strength: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6h12M8 6l4 8 4-8M7 18h10M7 18l3-4M10 18l3-4M13 18l3-4" />
    </svg>
  ),
  "Recovery & Mobility": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="6" width="20" height="4" rx="2" />
      <rect x="4" y="14" width="16" height="4" rx="2" />
    </svg>
  ),
  Accessories: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="8" width="18" height="8" rx="2" />
      <path d="M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M9 14v2M15 14v2" />
    </svg>
  ),
};

function fallbackIcon(category: string): ReactNode {
  return ICONS[category] ?? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="8" width="18" height="8" rx="2" />
      <path d="M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M9 14v2M15 14v2" />
    </svg>
  );
}

export type AdminEquipmentPageProps = {
  items: EquipmentRow[];
  loading: boolean;
  onAddEquipment: (data: EquipmentData) => Promise<void>;
  onUpdateEquipment: (id: string, data: EquipmentData) => Promise<void>;
  onDeleteEquipment: (id: string) => Promise<void>;
  onToggleStatus: (id: string) => void;
  onLogout?: () => void;
};

export function AdminEquipmentPage({
  items,
  loading,
  onAddEquipment,
  onUpdateEquipment,
  onDeleteEquipment,
  onToggleStatus,
  onLogout,
}: AdminEquipmentPageProps) {
  const [view, setView] = useState<"grid" | "table">("grid");
  const [chip, setChip] = useState("all");
  const { open } = useModal();
  const { confirm } = useConfirm();

  const openEquipmentModal = (item?: EquipmentRow) => {
    const close = open(
      <AddEquipmentModal
        initial={
          item
            ? {
                name: item.name,
                category: item.category,
                status: item.status,
                quantity: item.qty,
                location: item.zone,
                purchaseDate: item.purchaseDate ?? "",
                maintenanceDate: item.maintenanceDate ?? "",
                imageUrl: item.imageUrl ?? "",
                imagePath: item.imagePath,
              }
            : undefined
        }
        onSave={(data) =>
          item ? onUpdateEquipment(item.id, data) : onAddEquipment(data)
        }
        onClose={() => close()}
      />,
      "lg",
    );
  };

  const handleDelete = async (item: EquipmentRow) => {
    const ok = await confirm({
      title: `Delete "${item.name}"?`,
      description:
        "This permanently removes the item from inventory and deletes its photo. This cannot be undone.",
      tone: "danger",
      confirmLabel: "Delete permanently",
    });
    if (!ok) return;
    try {
      await onDeleteEquipment(item.id);
    } catch {
      // Handled by the route
    }
  };

  const total = items.length;
  const available = items.filter((i) => i.status === "available").length;
  const maintenance = items.filter((i) => i.status === "maintenance").length;
  const overdue = items.filter((i) => i.overdue).length;

  const categories = Array.from(new Set(items.map((i) => i.category)));
  const chips = [
    { key: "all", label: "All items", count: total },
    ...categories.map((category) => ({
      key: category.toLowerCase(),
      label: category,
      count: items.filter((i) => i.category === category).length,
    })),
  ];

  const visible =
    chip === "all"
      ? items
      : items.filter((i) => i.category.toLowerCase() === chip);

  return (
    <AdminShell title="Equipment Inventory" active="equipment" status={{ mode: "online", label: "Online" }} onLogout={onLogout}>
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
          <Button onPress={() => openEquipmentModal()}>+ Add equipment</Button>
        </div>
      </div>

      <div className="stats-row">
        <div className="card stat-card card-hover reveal">
          <div className="top">
            <span className="stat-label">Total items</span>
          </div>
          <div className="stat-num">{total}</div>
        </div>
        <div className="card stat-card card-hover reveal">
          <div className="top">
            <span className="stat-label">Available</span>
          </div>
          <div className="stat-num">{available}</div>
        </div>
        <div className="card stat-card card-hover reveal">
          <div className="top">
            <span className="stat-label">Maintenance</span>
          </div>
          <div className="stat-num">{maintenance}</div>
        </div>
        <div className="card stat-card card-hover reveal">
          <div className="top">
            <span className="stat-label">Overdue</span>
          </div>
          <div className="stat-num" style={{ color: "var(--color-danger)" }}>
            {overdue}
          </div>
        </div>
      </div>

      <div className="chip-row">
        {chips.map((c) => (
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

      {loading ? (
        <div className="card" style={{ padding: "3rem", textAlign: "center", color: "var(--muted)" }}>
          Loading equipment…
        </div>
      ) : items.length === 0 ? (
        <div className="card" style={{ padding: "3rem" }}>
          <EmptyState
            title="No equipment yet"
            description="Add your first item to start tracking the inventory."
            action={
              <Button onPress={() => openEquipmentModal()}>+ Add equipment</Button>
            }
          />
        </div>
      ) : view === "grid" ? (
        <div className="equip-grid">
          {visible.map((item) => (
            <div key={item.id} className="card equip-card card-hover reveal">
              <div className={cn("e-img", item.status === "maintenance" && "maintenance")}>
                <span
                  className={cn(
                    "ring-badge e-status-badge",
                    item.status === "available" ? "badge-green" : "badge-amber",
                  )}
                >
                  {item.status === "available" ? "Available" : "Maintenance"}
                </span>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="equip-photo"
                  />
                ) : (
                  fallbackIcon(item.category)
                )}
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
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onPress={() => openEquipmentModal(item)}
                >
                  Edit item
                </Button>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Toggle status"
                  onClick={() => onToggleStatus(item.id)}
                >
                  <RefreshCcw size={16} />
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Delete item"
                  onClick={() => handleDelete(item)}
                >
                  <Trash2 size={16} />
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
              {visible.map((item) => (
                <tr key={item.id}>
                  <td data-label="Equipment">
                    <b>{item.name}</b>
                  </td>
                  <td data-label="Category">{item.category}</td>
                  <td data-label="Qty">{item.qty}</td>
                  <td data-label="Status">
                    <Chip
                      color={item.status === "available" ? "success" : "warning"}
                      variant="soft"
                      size="sm"
                    >
                      {item.status === "available" ? "Available" : "Maintenance"}
                    </Chip>
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
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => openEquipmentModal(item)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger"
                        onPress={() => handleDelete(item)}
                      >
                        Delete
                      </Button>
                    </div>
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