import { useState } from "react";
import { GridIcon, ListIcon, RefreshCcw } from "lucide-react";
import { AdminShell, Badge, Button, cn } from "../components/ui";
import { useModal } from "../components/providers/ModalProvider";
import { NewPlanModal } from "../components/modals/NewPlanModal";
import type { PlanData } from "../components/modals/NewPlanModal";

type PlanRow = {
  name: string;
  price: string;
  billing: string;
  features: string[];
  status: "active" | "paused";
  featured?: boolean;
  desc: string;
  priceNote?: string;
  bill: string;
};

const PLANS: PlanRow[] = [
  {
    name: "Monthly Starter",
    desc: "Get stronger, month by month flexibility.",
    price: "₹899",
    priceNote: "₹1,099",
    bill: "per month · 30 days billing",
    billing: "30 days",
    features: ["Full gym floor access", "1 PT assessment session", "Locker & shower access"],
    status: "active",
    featured: true,
  },
  {
    name: "Quarterly Pro",
    desc: "Commit to 3 months of consistent progress.",
    price: "₹2,499",
    bill: "per quarter · 90 days billing",
    billing: "90 days",
    features: ["Everything in Monthly Starter", "2 PT sessions included"],
    status: "active",
  },
  {
    name: "Annual Unlimited",
    desc: "Best value for dedicated long-term fitness.",
    price: "₹5,999",
    priceNote: "₹9,899",
    bill: "per year · 365 days billing",
    billing: "365 days",
    features: ["Everything in Quarterly Pro", "Freezable up to 30 days", "6 PT sessions included"],
    status: "active",
  },
];

const TABLE_ROWS: { name: string; price: string; billing: string; features: number; status: "active" | "paused" }[] = [
  { name: "Monthly Starter", price: "₹899", billing: "30 days", features: 3, status: "active" },
  { name: "Quarterly Pro", price: "₹2,499", billing: "90 days", features: 2, status: "active" },
  { name: "Annual Unlimited", price: "₹5,999", billing: "365 days", features: 3, status: "active" },
  { name: "Student Tier", price: "₹699", billing: "30 days", features: 2, status: "paused" },
];

export type AdminPlansPageProps = {
  onNewPlan: (data: PlanData) => void;
  onTogglePlan: (name: string) => void;
};

export function AdminPlansPage({ onNewPlan, onTogglePlan }: AdminPlansPageProps) {
  const [view, setView] = useState<"grid" | "table">("grid");
  const { open } = useModal();

  const openPlanModal = () => {
    const close = open(
      <NewPlanModal onSave={onNewPlan} onClose={() => close()} />,
      "md",
    );
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
          <div className="stat-num">4</div>
        </div>
        <div className="card stat-card card-hover reveal">
          <div className="top">
            <span className="stat-label">Most popular</span>
          </div>
          <div className="stat-num">Monthly</div>
        </div>
        <div className="card stat-card card-hover reveal">
          <div className="top">
            <span className="stat-label">Paused tiers</span>
          </div>
          <div className="stat-num">1</div>
        </div>
      </div>

      {view === "grid" ? (
        <div className="plan-grid">
          {PLANS.map((p) => (
            <div key={p.name} className={cn("card plan-card2 card-hover reveal", p.featured && "featured")}>
              {p.featured ? <div className="feature-tag">Most popular</div> : null}
              <div className="p-name">{p.name}</div>
              <div className="p-desc">{p.desc}</div>
              <div className="p-price">
                <b>{p.price}</b>
                {p.priceNote ? <s>{p.priceNote}</s> : null}
              </div>
              <div className="p-bill">{p.bill}</div>
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
                  onClick={() => onTogglePlan(p.name)}
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
              {TABLE_ROWS.map((row) => (
                <tr key={row.name}>
                  <td data-label="Plan">
                    <b>{row.name}</b>
                  </td>
                  <td data-label="Price" className="amt">
                    {row.price}
                  </td>
                  <td data-label="Billing">{row.billing}</td>
                  <td data-label="Features">{row.features}</td>
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