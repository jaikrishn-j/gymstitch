import { useState } from "react";
import { Clock, FileText, UserRound } from "lucide-react";
import { Button, Input, SelectField, TextArea } from "../ui";
import { ModalShell } from "./ModalShell";

export type AddMemberData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp: string;
  planId: string;
  bloodGroup: string;
  dob: string;
  address: string;
  emergencyName: string;
  emergencyPhone: string;
};

export type PlanOption = {
  id: string;
  name: string;
  price: number;
  days: number;
  offerPrice?: number | string | null;
};

/** Chargeable price — prefer the offer price when present, else the original. */
export function planEffectivePrice(
  plan: Pick<PlanOption, "price" | "offerPrice">,
): number {
  if (plan.offerPrice != null && plan.offerPrice !== "") {
    const parsed = Number(plan.offerPrice);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return plan.price;
}

export type AddMemberModalProps = {
  onSave: (data: AddMemberData) => Promise<void>;
  onClose?: () => void;
  plans?: PlanOption[];
};

const BLOOD_GROUPS = [
  "O+",
  "O-",
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
];

export function AddMemberModal({
  onSave,
  onClose,
  plans = [],
}: AddMemberModalProps) {
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<AddMemberData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    whatsapp: "",
    planId: "",
    bloodGroup: "",
    dob: "",
    address: "",
    emergencyName: "",
    emergencyPhone: "",
  });

  const planOptions = [
    { id: "", label: "No plan right now (Register only)" },
    ...plans.map((plan) => {
      const effective = planEffectivePrice(plan);
      const hasOffer = effective !== plan.price;
      return {
        id: plan.id,
        label: plan.name,
        description: hasOffer
          ? `₹${effective.toLocaleString("en-IN")} (offer) · was ₹${plan.price.toLocaleString("en-IN")} · ${plan.days} days`
          : `₹${effective.toLocaleString("en-IN")} · ${plan.days} days`,
      };
    }),
  ];

  const set = <K extends keyof AddMemberData>(key: K, value: string) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (
      !data.firstName.trim() ||
      !data.lastName.trim() ||
      !data.email.trim() ||
      !data.phone.trim()
    ) {
      return;
    }
    setSaving(true);
    try {
      await onSave(data);
      onClose?.();
    } catch {
      // Keep open
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      title="Add new member"
      subtitle="Register a member & assign initial plan. Required fields marked with *"
      className="modal-body-scroll"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onPress={onClose} isDisabled={saving}>
            Cancel
          </Button>
          <Button onPress={handleSubmit} isDisabled={saving}>
            {saving ? "Creating..." : "Create member"}
          </Button>
        </>
      }
    >
      <div className="sec-t">
        <UserRound size={16} />
        Basic Information
      </div>
      <div className="form-grid">
        <Input
          label="First name *"
          placeholder="Aarav"
          value={data.firstName}
          onValueChange={(v) => set("firstName", v)}
          autoFocus
        />
        <Input
          label="Last name *"
          placeholder="Singh"
          value={data.lastName}
          onValueChange={(v) => set("lastName", v)}
        />
      </div>
      <Input
        label="Email address *"
        placeholder="aarav@gmail.com"
        type="email"
        value={data.email}
        onValueChange={(v) => set("email", v)}
      />
      <div className="form-grid">
        <Input
          label="Phone number *"
          placeholder="+91 98765 43210"
          type="tel"
          className="mono"
          value={data.phone}
          onValueChange={(v) => set("phone", v)}
        />
        <Input
          label="WhatsApp number (optional)"
          placeholder="Same as phone"
          type="tel"
          className="mono"
          value={data.whatsapp}
          onValueChange={(v) => set("whatsapp", v)}
        />
      </div>

      <div className="sec-t">
        <FileText size={16} />
        Initial Membership Plan
      </div>
      <SelectField
        label="Membership plan"
        options={planOptions}
        selectedKey={data.planId}
        onSelectionChange={(key) =>
          set("planId", key == null ? "" : String(key))
        }
      />

      <div className="sec-t">
        <Clock size={16} />
        Additional Profile Details{" "}
        <span className="muted small normal-case">(optional)</span>
      </div>
      <div className="form-grid">
        <SelectField
          label="Blood group"
          options={[
            { id: "", label: "Select group" },
            ...BLOOD_GROUPS.map((g) => ({ id: g, label: g })),
          ]}
          selectedKey={data.bloodGroup || undefined}
          onSelectionChange={(key) => set("bloodGroup", String(key ?? ""))}
        />
        <Input
          label="Date of birth"
          type="date"
          value={data.dob}
          onValueChange={(v) => set("dob", v)}
        />
      </div>
      <TextArea
        label="Address"
        placeholder="Street address, city, pin code"
        rows={2}
        value={data.address}
        onValueChange={(v) => set("address", v)}
      />
      <div className="form-grid">
        <Input
          label="Emergency contact name"
          placeholder="e.g. Vikram Singh"
          value={data.emergencyName}
          onValueChange={(v) => set("emergencyName", v)}
        />
        <Input
          label="Emergency phone"
          placeholder="+91 98765 00000"
          type="tel"
          className="mono"
          value={data.emergencyPhone}
          onValueChange={(v) => set("emergencyPhone", v)}
        />
      </div>
    </ModalShell>
  );
}
