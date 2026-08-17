import { useState } from "react";
import { GridIcon, ListIcon, RefreshCcw } from "lucide-react";
import { AdminShell, Badge, Button, cn } from "../components/ui";
import { useModal } from "../components/providers/ModalProvider";
import { NewPlanModal } from "../components/modals/NewPlanModal";
import type { PlanData } from "../components/modals/NewPlanModal";
import type { PlanRow } from "../routes/admin/plans";

export type AdminPlansPageProps = {
  plans: PlanRow[];
  loading: boolean;
  onNewPlan: (data: PlanData) => Promise<void>;
  onTogglePlan: (id: string) => void;
};

export function AdminPlansPage({ plans, loading, onNewPlan, onTogglePlan }: AdminPlansPageProps) {
  const [view, setView] = useState<"grid" | "table">("grid");
  const { open } = useModal();

  const openPlanModal = () => {
    const close = open(
      <NewPlanModal onSave={onNewPlan} onClose={() => close()} />,
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
          <Button onPress={openPlanModal}>+ New plan</Button>
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
            <div key={p.id} className={cn("card plan-card2 card-hover reveal", p.featured && "featured")}>
              {p.featured ? <div className="feature-tag">Most popular</div> : null}
              <div className="p-name">{p.name}</div>
              <div className="p-desc">{p.description}</div>
              <div className="p-price">
                <b>{formatPrice(p.price)}</b>
                {p.offerPrice ? <s>{formatPrice(Number(p.offerPrice))}</s> : null}
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
                <Button variant="secondary" size="sm" onPress={openPlanModal}>
                  Edit plan
                </Button>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Toggle active"
                  onClick={() => onTogglePlan(p.id)}
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
                    <Badge
                      color={row.status === "active" ? "success" : "default"}
                      variant="soft"
                      size="sm"
                    >
                      {row.status === "active" ? "Active" : "Paused"}
                    </Badge>
                  </td>
                  <td className="td-right thide">
                    <Button variant="ghost" size="sm" onPress={openPlanModal}>
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
