import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { ImagePlus, Minus, Plus } from "lucide-react";
import { toast } from "@heroui/react";
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
  imagePath?: string;
  imageFile?: File | null;
};

export type AddEquipmentModalProps = {
  onSave: (data: EquipmentData) => Promise<void>;
  onClose?: () => void;
  initial?: EquipmentData;
};

const CATEGORIES = [
  "Cardio",
  "Strength",
  "Recovery & Mobility",
  "Accessories",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const IMAGE_TYPES = /^image\/(png|jpe?g|webp)$/i;

export function AddEquipmentModal({
  onSave,
  onClose,
  initial,
}: AddEquipmentModalProps) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "Strength");
  const [status, setStatus] = useState(initial?.status ?? "available");
  const [quantity, setQuantity] = useState(initial?.quantity ?? 1);
  const [location, setLocation] = useState(initial?.location ?? "");
  const [purchaseDate, setPurchaseDate] = useState(
    initial?.purchaseDate ?? "2026-01-15",
  );
  const [maintenanceDate, setMaintenanceDate] = useState(
    initial?.maintenanceDate ?? "2026-09-15",
  );
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(initial?.imageUrl ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stepQuantity = (amount: number) =>
    setQuantity((prev) => Math.max(1, prev + amount));

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    event.target.value = "";
    if (!selected) return;
    if (!IMAGE_TYPES.test(selected.type)) {
      toast("Only PNG, JPG or WebP images are supported.", {
        variant: "danger",
      });
      return;
    }
    if (selected.size > MAX_IMAGE_SIZE) {
      toast("Image must be under 5MB.", { variant: "danger" });
      return;
    }
    setFile(selected);
    setImageUrl("");
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(selected);
  };

  const handleRemoveImage = () => {
    setFile(null);
    setPreview("");
    setImageUrl("");
  };

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
        imagePath: initial?.imagePath,
        imageFile: file,
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
      title={initial ? "Edit equipment" : "Add equipment"}
      subtitle={
        initial
          ? "Update the inventory details & maintenance schedule for this item."
          : "Add a new item to the gym inventory & maintenance schedule."
      }
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onPress={onClose} isDisabled={saving}>
            Cancel
          </Button>
          <Button onPress={handleSubmit} isDisabled={saving}>
            {saving
              ? initial
                ? "Saving..."
                : "Adding..."
              : initial
                ? "Save changes"
                : "Add equipment"}
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
        {preview ? (
          <div className="image-drop mt-2">
            <img
              src={preview}
              alt="Equipment preview"
              className="equip-preview"
            />
            <div className="mt-2 flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onPress={handlePickFile}
                isDisabled={saving}
              >
                Replace photo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onPress={handleRemoveImage}
                isDisabled={saving}
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="image-drop mt-2 block cursor-pointer"
            onClick={handlePickFile}
          >
            <ImagePlus size={28} />
            <div className="txt">Click to upload photo or paste image URL</div>
            <div className="subtxt">PNG, JPG, WebP up to 5MB</div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        <Input
          className="mt-2"
          placeholder="https://images.unsplash.com/photo-..."
          value={imageUrl}
          onValueChange={(v) => {
            setImageUrl(v);
            if (v) {
              setFile(null);
              setPreview(v);
            }
          }}
        />
      </div>
    </ModalShell>
  );
}