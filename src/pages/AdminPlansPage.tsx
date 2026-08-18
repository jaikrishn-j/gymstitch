import { useState } from "react";
import { GridIcon, ListIcon, RefreshCcw } from "lucide-react";
import { Tooltip } from "@heroui/react";
import { AdminShell, Chip, Button, cn } from "../components/ui";
import { useModal } from "../components/providers/ModalProvider";
import { useConfirm } from "../components/providers/ConfirmProvider";
import { NewPlanModal } from "../components/modals/NewPlanModal";
import type { PlanData } from "../components/modals/NewPlanModal";
import type { PlanRow } from "../routes/admin/plans";

export type AdminPlansPageProps = {
  plans: PlanRow[];
  loading: boolean;
  onNewPlan: (data: PlanData) => Promise<void>;
  onUpdatePlan: (id: string, data: PlanData) => Promise<void>;
  onTogglePlan: (id: string) => void;
};

export function AdminPlansPage({ plans, loading, onNewPlan, onUpdatePlan, onTogglePlan }: AdminPlansPageProps) {
  const [view, setView] = useState<"grid" | "table">("grid");
  const { open } = useModal();
  const { confirm } = useConfirm();

  const handleToggleClick = async (p: PlanRow) => {
    const isPausing = p.status === "active";
    const ok = await confirm({
      title: isPausing ? `Pause "${p.name}"?` : `Activate "${p.name}"?`,
      description: isPausing
        ? "This plan will be paused. Existing members on this plan will continue until their billing cycle ends, but renewals and new members will no longer be able to select it."
        : "This plan will be activated and available again for new members and renewals.",
      tone: isPausing ? "warning" : "success",
      confirmLabel: isPausing ? "Yes, pause plan" : "Yes, activate plan",
    });
    if (ok) onTogglePlan(p.id);
  };

  const openPlanModal = (plan?: PlanRow) => {
    const close = open(
      <NewPlanModal
        initial={plan}
        onSave={(data) => (plan ? onUpdatePlan(plan.id, data) : onNewPlan(data))}
        onClose={() => close()}
      />,
      "md",
    );
  };

  const activePlans = plans.filter((p) => p.status === "active");
  const pausedPlans = plans.filter((p) => p.status === "paused");
  const mostPopular = plans.find((p) => p.featured) ?? plans[0];

  const formatPrice = (price: number) => `₹${price.toLocaleString("en-IN")}`;

  const formatBill = (days: number) => {
    if (days >= 365) return `per year · ${days} days billing`;
    if (days >= 90) return `per quarter · ${days} days billing`;
    return `per month · ${days} days billing`;
  };

  return (
    <AdminShell title="Plans & Pricing" active="plans" status={{ mode: "online", label: "Online" }}>
      <div className="page-head">
        <div>
          <div className="eyebrow">Monetization</div>
          <h2>Plans &amp; Pricing Tiers</h2>
          <p className="sub">
            Configure structured membership plans, billing periods, and
            promotional pricing.
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
          <Button onPress={() => openPlanModal()}>+ New plan</Button>
        </div>
      </div>

      <div className="stats-row">
        <div className="card stat-card card-hover reveal">
          <div className="top">
            <span className="stat-label">Active plans</span>
          </div>
          <div className="stat-num">{activePlans.length}</div>
        </div>
        <div className="card stat-card card-hover reveal">
          <div className="top">
            <span className="stat-label">Most popular</span>
          </div>
          <div className="stat-num">{mostPopular?.name ?? "—"}</div>
        </div>
        <div className="card stat-card card-hover reveal">
          <div className="top">
            <span className="stat-label">Paused tiers</span>
          </div>
          <div className="stat-num">{pausedPlans.length}</div>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: "3rem", textAlign: "center", color: "var(--muted)" }}>
          Loading plans…
        </div>
      ) : plans.length === 0 ? (
        <div className="card" style={{ padding: "3rem", textAlign: "center", color: "var(--muted)" }}>
          No plans yet. Create your first plan to get started.
        </div>
      ) : view === "grid" ? (
        <div className="plan-grid">
          {plans.map((p) => (
              <div className={cn("card plan-card2 card-hover reveal", p.featured && "featured", p.status === "paused" && "plan-paused")}>
                {p.featured ? <div className="feature-tag">Most popular</div> : null}

              <div className="p-name">
                {p.name}
                {p.status === "paused" && (
                  <Chip color="default" variant="soft" size="sm" className="paused-badge">
                    Paused
                  </Chip>
                )}
              </div>
              <div className="p-desc">{p.description}</div>
              <div className="p-price">
                {p.offerPrice ? <s>{formatPrice(p.price)}</s> : null}
                <b>{formatPrice(p.offerPrice ? Number(p.offerPrice) : p.price)}</b>
              </div>
              <div className="p-bill">{formatBill(p.days)}</div>
              <ul className="p-feats">
                {p.features.map((f) => (
                  <li key={f}>
                    <CheckIcon />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="p-foot">
                <Button variant="secondary" size="sm" onPress={() => openPlanModal(p)}>
                  Edit plan
                </Button>
                <Tooltip.Root delay={150}>
                  <Tooltip.Trigger>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={p.status === "active" ? "Pause plan" : "Activate plan"}
                      onClick={() => handleToggleClick(p)}
                    >
                      <RefreshCcw size={16} />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    {p.status === "active" ? "Pause plan" : "Activate plan"}
                  </Tooltip.Content>
                </Tooltip.Root>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ overflowX: "auto" }}>
          <table className="table table-responsive">
            <thead>
              <tr>
                <th>Plan</th>
                <th>Price</th>
                <th>Billing</th>
                <th>Features</th>
                <th>Status</th>
                <th className="td-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((row) => (
                <tr key={row.id}>
                  <td data-label="Plan">
                    <b>{row.name}</b>
                  </td>
                  <td data-label="Price" className="amt">
                    {formatPrice(row.price)}
                  </td>
                  <td data-label="Billing">{row.days} days</td>
                  <td data-label="Features">{row.features.length}</td>
                  <td data-label="Status">
                    <Chip
                      color={row.status === "active" ? "success" : "default"}
                      variant="soft"
                      size="sm"
                    >
                      {row.status === "active" ? "Active" : "Paused"}
                    </Chip>
                  </td>
                  <td className="td-right thide">
                    <Button variant="ghost" size="sm" onPress={() => openPlanModal(row)}>
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

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
