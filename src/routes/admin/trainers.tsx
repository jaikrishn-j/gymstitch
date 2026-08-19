import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "@heroui/react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { CACHE_KEYS, TTL } from "../../lib/cache";
import { useCachedData } from "../../lib/useCachedData";
import { AdminTrainersPage } from "../../pages/AdminTrainersPage";
import type { StaffRow } from "../../pages/AdminTrainersPage";
import type { TrainerData } from "../../components/modals/AddTrainerModal";
import { ResetLinkModal } from "../../components/modals/ResetLinkModal";
import {
  createStaff,
  deleteStaff,
  getStaffResetLink,
  updateStaff,
} from "../../lib/functions";
import type { CreateStaffResult } from "../../lib/functions";
import { requireRole } from "../../auth/guard";
import type { Permission } from "../../auth/auth-types";

export const Route = createFileRoute("/admin/trainers")({
  beforeLoad: ({ context }) => {
    requireRole(context.auth, ["admin"]);
  },
  component: RouteComponent,
});

const fetchStaffList = async (): Promise<StaffRow[]> => {
  const q = query(collection(db, "users"), where("role", "==", "staff"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      uid: d.id,
      name: data.name ?? "",
      email: data.email ?? "",
      role: data.role === "admin" ? "admin" : "staff",
      permission: data.permission,
    };
  });
};

function RouteComponent() {
  const [reset, setReset] = useState<CreateStaffResult & { email: string } | null>(null);

  const staff = useCachedData<StaffRow[]>({
    key: CACHE_KEYS.staff,
    ttl: TTL.staff,
    fetch: fetchStaffList,
  });

  const handleSync = () => {
    void staff.refetch();
  };

  const handleAddTrainer = async (data: TrainerData) => {
    try {
      const res = await createStaff({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        permission: data.permission,
      });
      setReset({ ...res.data, email: data.email });
      toast.success("Staff account created.");
      void staff.refetch();
    } catch {
      toast("Failed to create staff.", { variant: "danger" });
      throw new Error("create-staff-failed");
    }
  };

  const handleUpdateStaff = async (
    uid: string,
    data: { role: "staff" | "admin"; permission?: Permission },
  ) => {
    try {
      await updateStaff({ uid, role: data.role, permission: data.permission });
      toast.success("Staff permissions updated.");
      void staff.refetch();
    } catch {
      toast("Failed to update staff.", { variant: "danger" });
      throw new Error("update-staff-failed");
    }
  };

  const handleResetStaffLink = async (uid: string) => {
    try {
      const res = await getStaffResetLink({ uid });
      return res.data.resetLink;
    } catch {
      toast("Failed to generate reset link.", { variant: "danger" });
      throw new Error("reset-link-failed");
    }
  };

  const handleDeleteStaff = async (uid: string) => {
    try {
      await deleteStaff({ uid });
      toast.success("Staff account deleted.");
      void staff.refetch();
    } catch {
      toast("Failed to delete staff.", { variant: "danger" });
      throw new Error("delete-staff-failed");
    }
  };

  return (
    <>
      <AdminTrainersPage
        trainers={staff.data ?? []}
        loading={staff.loading}
        lastSyncedAt={staff.lastSyncedAt}
        syncing={staff.syncing}
        onSync={handleSync}
        onAddTrainer={handleAddTrainer}
        onUpdateStaff={handleUpdateStaff}
        onResetStaffLink={handleResetStaffLink}
        onDeleteStaff={handleDeleteStaff}
      />
      <ResetLinkModal
        open={reset != null}
        email={reset?.email ?? ""}
        link={reset?.resetLink ?? ""}
        onClose={() => setReset(null)}
      />
    </>
  );
}