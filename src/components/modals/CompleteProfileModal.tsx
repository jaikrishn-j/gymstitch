import { useRef, useState } from "react";
import { Clock, UserRound } from "lucide-react";
import { Button, Input, SelectField, TextArea } from "../ui";
import { Modal, useOverlayState } from "@heroui/react";
import { cn } from "@heroui/react";

export type ProfileData = {
  name: string;
  phone: string;
  bloodGroup: string;
  dob: string;
  address: string;
  emergencyName: string;
  emergencyPhone: string;
};

export type CompleteProfileModalProps = {
  initialName?: string;
  initialPhone?: string;
  onSave: (data: ProfileData) => Promise<void>;
  onLogout: () => void;
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

export function CompleteProfileModal({
  initialName = "",
  initialPhone = "",
  onSave,
  onLogout,
}: CompleteProfileModalProps) {
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<ProfileData>({
    name: initialName,
    phone: initialPhone,
    bloodGroup: "",
    dob: "",
    address: "",
    emergencyName: "",
    emergencyPhone: "",
  });

  const savedRef = useRef(false);
  const state = useOverlayState({
    defaultOpen: true,
    onOpenChange: (next) => {
      if (!next && !savedRef.current) onLogout();
    },
  });

  const set = <K extends keyof ProfileData>(key: K, value: string) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (
      !data.name.trim() ||
      !data.phone.trim() ||
      !data.bloodGroup ||
      !data.dob.trim() ||
      !data.address.trim() ||
      !data.emergencyName.trim() ||
      !data.emergencyPhone.trim()
    ) {
      return;
    }
    setSaving(true);
    try {
      savedRef.current = true;
      await onSave(data);
    } catch {
      savedRef.current = false;
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal state={state}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className={cn("modal-dialog", "modal-size-md")}>
            <div className="m-head">
              <div>
                <h3>Complete Your Profile</h3>
                <div className="sub">
                  Please fill in the required details to continue using the dashboard.
                </div>
              </div>
            </div>
            <div className="m-body">
              <div className="sec-t">
                <UserRound size={16} />
                Personal Details
              </div>
              <div className="form-grid">
                <Input
                  label="Full name *"
                  placeholder="Aarav Singh"
                  value={data.name}
                  onValueChange={(v) => set("name", v)}
                  autoFocus
                />
                <Input
                  label="Phone number *"
                  placeholder="+91 98765 43210"
                  type="tel"
                  className="mono"
                  value={data.phone}
                  onValueChange={(v) => set("phone", v)}
                />
              </div>
              <div className="form-grid">
                <SelectField
                  label="Blood group *"
                  options={[
                    { id: "", label: "Select group" },
                    ...BLOOD_GROUPS.map((g) => ({ id: g, label: g })),
                  ]}
                  selectedKey={data.bloodGroup || undefined}
                  onSelectionChange={(key) => set("bloodGroup", String(key ?? ""))}
                />
                <Input
                  label="Date of birth *"
                  type="date"
                  value={data.dob}
                  onValueChange={(v) => set("dob", v)}
                />
              </div>

              <div className="sec-t">
                <Clock size={16} />
                Emergency Contact
              </div>
              <TextArea
                label="Address *"
                placeholder="Street address, city, pin code"
                rows={2}
                value={data.address}
                onValueChange={(v) => set("address", v)}
              />
              <div className="form-grid">
                <Input
                  label="Emergency contact name *"
                  placeholder="e.g. Vikram Singh"
                  value={data.emergencyName}
                  onValueChange={(v) => set("emergencyName", v)}
                />
                <Input
                  label="Emergency phone *"
                  placeholder="+91 98765 00000"
                  type="tel"
                  className="mono"
                  value={data.emergencyPhone}
                  onValueChange={(v) => set("emergencyPhone", v)}
                />
              </div>
            </div>
            <div className="m-foot flex flex-wrap items-center justify-between gap-2">
              <Button variant="ghost" onPress={onLogout} isDisabled={saving}>
                Log out
              </Button>
              <Button onPress={handleSubmit} isDisabled={saving}>
                {saving ? "Saving..." : "Save & continue"}
              </Button>
            </div>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
