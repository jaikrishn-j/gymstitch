import { useState } from "react";
import { UserRound } from "lucide-react";
import { Button, Input, Segmented, SelectField, TextArea } from "../ui";
import { ModalShell } from "./ModalShell";

export type PaymentMethod = "cash" | "upi" | "card";

export type PaymentData = {
  planId: string;
  amount: number;
  days: number;
  method: PaymentMethod;
  notes: string;
};

export type RecordPaymentModalProps = {
  memberName: string;
  memberId: string;
  memberMeta: string;
  onSave: (data: PaymentData) => void;
  onClose?: () => void;
};

const PLAN_OPTIONS = [
  { id: "9999|365", label: "Annual Unlimited (₹9,999 / 365 days)" },
  { id: "2999|90", label: "Quarterly Pro (₹2,999 / 90 days)" },
  { id: "1199|30", label: "Monthly Starter (₹1,199 / 30 days)" },
  { id: "0|custom", label: "Custom Amount / Ad-hoc Payment" },
];

const METHOD_OPTIONS: { id: PaymentMethod; label: string }[] = [
  { id: "cash", label: "Cash" },
  { id: "upi", label: "UPI" },
  { id: "card", label: "Card" },
];

export function RecordPaymentModal({
  memberName,
  memberId,
  memberMeta,
  onSave,
  onClose,
}: RecordPaymentModalProps) {
  const [planId, setPlanId] = useState("2999|90");
  const [amount, setAmount] = useState(2999);
  const [days, setDays] = useState(90);
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [notes, setNotes] = useState("");

  const handlePlanChange = (key: string) => {
    setPlanId(key);
    if (key !== "0|custom") {
      const [amt, d] = key.split("|");
      setAmount(Number(amt));
      setDays(Number(d));
    }
  };

  const isCustom = planId === "0|custom";

  const handleSubmit = () => {
    if (!amount || amount <= 0) return;
    onSave({ planId, amount, days, method, notes });
  };

  return (
    <ModalShell
      title="Record manual payment"
      subtitle="Log cash, UPI, or card payment & extend member plan."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onPress={onClose}>
            Cancel
          </Button>
          <Button onPress={handleSubmit}>Save payment & extend</Button>
        </>
      }
    >
      <div className="user-info-banner">
        <UserRound size={22} />
        <div>
          <div className="ui-name">{memberName}</div>
          <div className="ui-id">
            ID: {memberId} · {memberMeta}
          </div>
        </div>
      </div>

      <SelectField
        label="Select Membership Plan"
        options={PLAN_OPTIONS}
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
            ? "Custom ad-hoc payment recorded"
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
