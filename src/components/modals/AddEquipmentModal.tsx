import { useState } from "react";
import { ImagePlus, Minus, Plus } from "lucide-react";
import { Button, Input, SelectField } from "../ui";
import { ModalShell } from "./ModalShell";

export type EquipmentData = {
  name: string;
  category: string;
  status: string;
  quantity: number;
  location: string;
  purchaseDate: string;
  maintenanceDate: string;
  imageUrl: string;
};

export type AddEquipmentModalProps = {
  onSave: (data: EquipmentData) => Promise<void>;
  onClose?: () => void;
};

const CATEGORIES = [
  "Cardio",
  "Strength",
  "Recovery & Mobility",
  "Accessories",
];

export function AddEquipmentModal({
  onSave,
  onClose,
}: AddEquipmentModalProps) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Strength");
  const [status, setStatus] = useState("available");
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("2026-01-15");
  const [maintenanceDate, setMaintenanceDate] = useState("2026-09-15");
  const [imageUrl, setImageUrl] = useState("");

  const stepQuantity = (amount: number) =>
    setQuantity((prev) => Math.max(1, prev + amount));

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name,
        category,
        status,
        quantity,
        location,
        purchaseDate,
        maintenanceDate,
        imageUrl,
      });
      onClose?.();
    } catch {
      // Keep open
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      title="Add equipment"
      subtitle="Add a new item to the gym inventory & maintenance schedule."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onPress={onClose} isDisabled={saving}>
            Cancel
          </Button>
          <Button onPress={handleSubmit} isDisabled={saving}>
            {saving ? "Adding..." : "Add equipment"}
          </Button>
        </>
      }
    >
      <Input
        label="Equipment name *"
        placeholder="e.g. Olympic Bench Press"
        value={name}
        onValueChange={setName}
        autoFocus
      />
      <div className="form-grid">
        <SelectField
          label="Category"
          options={CATEGORIES.map((c) => ({ id: c, label: c }))}
          selectedKey={category}
          onSelectionChange={(key) => setCategory(String(key))}
        />
        <SelectField
          label="Initial Status"
          options={[
            { id: "available", label: "Available" },
            { id: "maintenance", label: "Under Maintenance" },
          ]}
          selectedKey={status}
          onSelectionChange={(key) => setStatus(String(key))}
        />
      </div>
      <div className="form-grid">
        <div className="field">
          <span className="block text-[13px] font-semibold text-fg">
            Quantity
          </span>
          <div className="stepper mt-2">
            <button
              type="button"
              onClick={() => stepQuantity(-1)}
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <input
              className="mono"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, Number(e.target.value)))
              }
            />
            <button
              type="button"
              onClick={() => stepQuantity(1)}
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
        <Input
          label="Location / Zone"
          placeholder="e.g. Zone A - Free Weights"
          value={location}
          onValueChange={setLocation}
        />
      </div>
      <div className="form-grid">
        <Input
          label="Purchase date"
          type="date"
          value={purchaseDate}
          onValueChange={setPurchaseDate}
        />
        <Input
          label="Next maintenance"
          type="date"
          value={maintenanceDate}
          onValueChange={setMaintenanceDate}
        />
      </div>

      <div className="field">
        <span className="block text-[13px] font-semibold text-fg">
          Equipment image <span className="muted small">(optional)</span>
        </span>
        <label className="image-drop mt-2 block cursor-pointer">
          <ImagePlus size={28} />
          <div className="txt">Click to upload photo or paste image URL</div>
          <div className="subtxt">PNG, JPG, WebP up to 5MB</div>
        </label>
        <Input
          className="mt-2"
          placeholder="https://images.unsplash.com/photo-..."
          value={imageUrl}
          onValueChange={setImageUrl}
        />
      </div>
    </ModalShell>
  );
}
