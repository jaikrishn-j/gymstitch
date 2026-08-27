import { useState } from "react";
import { UserRound } from "lucide-react";
import { Button, Input, Segmented, SelectField, TextArea } from "../ui";
import { ModalShell } from "./ModalShell";

export type PaymentMethod = "cash" | "upi" | "card";

export type PaymentData = {
  planId: string;
  planName: string;
  amount: number;
  days: number;
  method: PaymentMethod;
  notes: string;
  memberId?: string;
  memberName?: string;
};

export type PaymentMember = {
  id: string;
  name: string;
  email: string;
  phone?: string;
};

export type RecordPaymentModalProps = {
  memberName?: string;
  memberId?: string;
  memberMeta?: string;
  members?: PaymentMember[];
  plans?: {
    id: string;
    name: string;
    price: number;
    days: number;
    offerPrice?: number | string | null;
  }[];
  /** Pre-select a specific plan (e.g. the plan a member requested approval for). */
  defaultPlanId?: string;
  /** Fallback amount used when the default plan can't be resolved to a known plan. */
  presetAmount?: number;
  /** Fallback days used when the default plan can't be resolved to a known plan. */
  presetDays?: number;
  onSave: (data: PaymentData) => Promise<void>;
  onClose?: () => void;
};

const CUSTOM_PLAN_ID = "custom";

/**
 * Resolve the chargeable price for a plan — always prefer the offer price when
 * one is present; fall back to the original price otherwise.
 */
function effectivePlanPrice(plan: {
  price: number;
  offerPrice?: number | string | null;
}): number {
  if (plan.offerPrice != null && plan.offerPrice !== "") {
    const parsed = Number(plan.offerPrice);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return plan.price;
}

const METHOD_OPTIONS: { id: PaymentMethod; label: string }[] = [
  { id: "cash", label: "Cash" },
  { id: "upi", label: "UPI" },
  { id: "card", label: "Card" },
];

export function RecordPaymentModal({
  memberName,
  memberId,
  memberMeta,
  members,
  plans = [],
  defaultPlanId,
  presetAmount,
  presetDays,
  onSave,
  onClose,
}: RecordPaymentModalProps) {
  const selectorMode = Array.isArray(members) && members.length > 0;
  const defaultPlan =
    plans.find((p) => p.id === defaultPlanId) ?? plans[0] ?? null;
  const initialAmount = defaultPlan
    ? effectivePlanPrice(defaultPlan)
    : presetAmount ?? 0;
  const initialDays = defaultPlan ? defaultPlan.days : presetDays ?? 0;
  const [saving, setSaving] = useState(false);
  const [planId, setPlanId] = useState(
    defaultPlan ? defaultPlan.id : CUSTOM_PLAN_ID,
  );
  const [amount, setAmount] = useState(initialAmount);
  const [days, setDays] = useState(initialDays);
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [notes, setNotes] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [memberError, setMemberError] = useState(false);

  const selectedMember = selectorMode
    ? members?.find((m) => m.id === selectedMemberId)
    : undefined;

  const planOptions = [
    ...plans.map((plan) => {
      const effective = effectivePlanPrice(plan);
      const hasOffer = effective !== plan.price;
      return {
        id: plan.id,
        label: plan.name,
        description: hasOffer
          ? `₹${effective.toLocaleString("en-IN")} (offer) · was ₹${plan.price.toLocaleString("en-IN")} · ${plan.days} days`
          : `₹${effective.toLocaleString("en-IN")} · ${plan.days} days`,
      };
    }),
    {
      id: CUSTOM_PLAN_ID,
      label: "Custom plan",
      description: "Set amount & days manually",
    },
  ];

  const memberOptions =
    members?.map((m) => ({
      id: m.id,
      label: m.name,
      description: `${m.email}${m.phone ? ` · ${m.phone}` : ""}`,
    })) ?? [];

  const isCustom = planId === CUSTOM_PLAN_ID;

  const handlePlanChange = (key: string) => {
    setPlanId(key);
    if (key === CUSTOM_PLAN_ID) {
      setAmount(0);
      setDays(0);
      return;
    }
    const plan = plans.find((p) => p.id === key);
    if (plan) {
      setAmount(effectivePlanPrice(plan));
      setDays(plan.days);
    }
  };

  const handleSubmit = async () => {
    if (selectorMode && !selectedMember) {
      setMemberError(true);
      return;
    }
    if (Number.isNaN(amount) || amount < 0) return;
    if (Number.isNaN(days) || days < 0) return;
    setSaving(true);
    try {
      const selectedPlan = plans.find((p) => p.id === planId);
      await onSave({
        planId,
        planName: selectedPlan ? selectedPlan.name : "Custom",
        amount,
        days,
        method,
        notes,
        memberId: selectorMode ? selectedMember!.id : memberId,
        memberName: selectorMode ? selectedMember!.name : memberName,
      });
      onClose?.();
    } catch {
      // Keep open
    } finally {
      setSaving(false);
    }
  };

  const displayName = selectorMode ? selectedMember?.name ?? "" : memberName ?? "";
  const displayId = selectorMode ? `MBR-${selectedMember?.id ?? ""}` : memberId ?? "";
  const displayMeta = selectorMode
    ? `${selectedMember?.email ?? ""}${selectedMember?.phone ? ` · ${selectedMember.phone}` : ""}`
    : memberMeta ?? "";

  return (
    <ModalShell
      title="Record manual payment"
      subtitle="Log cash, UPI, or card payment & extend member plan."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onPress={onClose} isDisabled={saving}>
            Cancel
          </Button>
          <Button onPress={handleSubmit} isDisabled={saving}>
            {saving ? "Saving..." : "Save payment & extend"}
          </Button>
        </>
      }
    >
      {selectorMode ? (
        <>
          <SelectField
            label="Select Member *"
            placeholder="Choose a member"
            options={memberOptions}
            selectedKey={selectedMemberId}
            isInvalid={memberError}
            onSelectionChange={(key) => {
              setSelectedMemberId(String(key));
              setMemberError(false);
            }}
          />
          {memberError ? (
            <span className="block text-[12px] font-medium" style={{ color: "var(--color-danger)" }}>
              Please select a member to continue.
            </span>
          ) : null}
          {selectedMember ? (
            <div
              className="user-info-banner w-full min-w-0"
              style={{ marginTop: 14 }}
            >
              <UserRound size={22} />
              <div className="min-w-0">
                <div className="ui-name break-words">{displayName}</div>
                <div className="ui-id break-words">
                  ID: {displayId} · {displayMeta}
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <div className="user-info-banner w-full min-w-0">
          <UserRound size={22} />
          <div className="min-w-0">
            <div className="ui-name break-words">{displayName}</div>
            <div className="ui-id break-words">
              ID: {displayId} · {displayMeta}
            </div>
          </div>
        </div>
      )}

      <SelectField
        label="Select Membership Plan"
        options={planOptions}
        selectedKey={planId}
        onSelectionChange={(key) => handlePlanChange(String(key))}
      />

      <div className="form-grid">
        <Input
          label="Amount (₹) *"
          type="number"
          className="mono"
          value={String(amount)}
          onValueChange={(v) => setAmount(Number(v))}
        />
        <Input
          label="Days to add *"
          type="number"
          className="mono"
          value={String(days)}
          onValueChange={(v) => setDays(Number(v))}
        />
      </div>

      <div className="calc-summary">
        <span>Plan extension preview:</span>
        <b>
          {isCustom
            ? `Custom payment · ₹${amount.toLocaleString("en-IN")} · +${days} days`
            : `+${days} days added to membership`}
        </b>
      </div>

      <div className="field">
        <span className="block text-[13px] font-semibold text-fg">
          Payment method
        </span>
        <Segmented
          className="mt-2 w-full"
          options={METHOD_OPTIONS}
          value={method}
          onChange={setMethod}
        />
      </div>

      <TextArea
        label="Transaction Notes (optional)"
        placeholder="e.g. Paid via QR scan at front desk / receipt #1042"
        rows={2}
        value={notes}
        onValueChange={setNotes}
      />
    </ModalShell>
  );
}
