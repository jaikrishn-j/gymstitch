import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button, Input, TextArea } from "../ui";
import { ModalShell } from "./ModalShell";

export type PlanData = {
  name: string;
  description: string;
  price: number;
  offerPrice: string;
  days: number;
  features: string[];
};

export type NewPlanModalProps = {
  onSave: (data: PlanData) => void;
  onClose?: () => void;
};

export function NewPlanModal({ onSave, onClose }: NewPlanModalProps) {
  const [name, setName] = useState("Elite Pro");
  const [description, setDescription] = useState(
    "Full equipment access + locker room",
  );
  const [price, setPrice] = useState(2999);
  const [offerPrice, setOfferPrice] = useState("");
  const [days, setDays] = useState(90);
  const [features, setFeatures] = useState<string[]>([
    "Full equipment access",
    "Locker room & shower access",
  ]);

  const updateFeature = (index: number, value: string) =>
    setFeatures((prev) =>
      prev.map((f, i) => (i === index ? value : f)),
    );

  const removeFeature = (index: number) =>
    setFeatures((prev) => prev.filter((_, i) => i !== index));

  const addFeature = () => setFeatures((prev) => [...prev, ""]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      name,
      description,
      price,
      offerPrice,
      days,
      features: features.map((f) => f.trim()).filter(Boolean),
    });
  };

  return (
    <ModalShell
      title="New membership plan"
      subtitle="Create a structured pricing tier with duration & features."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onPress={onClose}>
            Cancel
          </Button>
          <Button onPress={handleSubmit}>Publish plan</Button>
        </>
      }
    >
      <div className="preview-card">
        <div className="preview-title">Live Preview Card</div>
        <div className="preview-content">
          <div>
            <div className="preview-name">{name.trim() || "Unnamed plan"}</div>
            <div className="text-xs text-muted">{days} days billing</div>
          </div>
          <div className="preview-price">
            ₹{Number(price || 0).toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      <Input
        label="Plan name *"
        placeholder="e.g. Elite Pro"
        value={name}
        onValueChange={setName}
        autoFocus
      />
      <TextArea
        label="Description (optional)"
        placeholder="Full gym access + sauna & locker"
        rows={2}
        value={description}
        onValueChange={setDescription}
      />
      <div className="form-grid">
        <Input
          label="Regular Price (₹) *"
          type="number"
          className="mono"
          value={String(price)}
          onValueChange={(v) => setPrice(Number(v))}
        />
        <Input
          label="Offer / Promo Price (₹)"
          type="number"
          className="mono"
          placeholder="Optional (e.g. 2499)"
          value={offerPrice}
          onValueChange={setOfferPrice}
        />
      </div>
      <Input
        label="Billing duration (days) *"
        type="number"
        className="mono"
        value={String(days)}
        onValueChange={(v) => setDays(Number(v))}
      />

      <div className="field">
        <span className="block text-[13px] font-semibold text-fg">
          Plan features
        </span>
        <div className="mt-2 space-y-2">
          {features.map((feature, index) => (
            <div className="feat-row" key={index}>
              <Input
                value={feature}
                onValueChange={(v) => updateFeature(index, v)}
                placeholder="e.g. Guest passes"
                fullWidth
              />
              <button
                type="button"
                className="feat-del"
                onClick={() => removeFeature(index)}
                aria-label="Remove feature"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="mt-2"
          onPress={addFeature}
        >
          <Plus size={16} />
          Add feature
        </Button>
      </div>
    </ModalShell>
  );
}
