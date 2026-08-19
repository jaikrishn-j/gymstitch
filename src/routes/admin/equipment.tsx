import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "@heroui/react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { db, storage } from "../../lib/firebase";
import { requirePermission } from "../../auth/guard";
import { AdminEquipmentPage } from "../../pages/AdminEquipmentPage";
import type { EquipmentRow } from "../../pages/AdminEquipmentPage";
import type { EquipmentData } from "../../components/modals/AddEquipmentModal";

export const Route = createFileRoute("/admin/equipment")({
  beforeLoad: ({ context }) => {
    requirePermission(context.auth, "equipment");
  },
  component: RouteComponent,
});

type RawEquipment = {
  id: string;
  name: string;
  category: string;
  status: string;
  quantity: number;
  location: string;
  purchaseDate?: string;
  maintenanceDate?: string;
  imageUrl?: string;
  imagePath?: string;
};

function formatDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

function toRow(raw: RawEquipment): EquipmentRow {
  const maint = raw.maintenanceDate ? new Date(raw.maintenanceDate) : null;
  const overdue =
    maint != null &&
    !Number.isNaN(maint.getTime()) &&
    maint.getTime() < Date.now();
  return {
    id: raw.id,
    name: raw.name,
    category: raw.category ?? "Uncategorized",
    zone: raw.location ?? "—",
    qty: raw.quantity ?? 1,
    maint: formatDate(raw.maintenanceDate),
    overdue,
    status: raw.status === "maintenance" ? "maintenance" : "available",
    imageUrl: raw.imageUrl,
    imagePath: raw.imagePath,
    purchaseDate: raw.purchaseDate,
    maintenanceDate: raw.maintenanceDate,
  };
}

function RouteComponent() {
  const [items, setItems] = useState<EquipmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "equipment"),
      (snap) => {
        setItems(
          snap.docs.map((d) =>
            toRow({ ...(d.data() as object), id: d.id } as RawEquipment),
          ),
        );
        setLoading(false);
      },
      (error) => {
        console.error(error);
        toast("Failed to load equipment.", { variant: "danger" });
        setLoading(false);
      },
    );
    return unsub;
  }, []);

  const uploadImage = async (
    file: File,
  ): Promise<{ imageUrl: string; imagePath: string }> => {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const imagePath = `equipment/${Date.now()}-${safeName}`;
    const imageRef = ref(storage, imagePath);
    await uploadBytes(imageRef, file);
    const imageUrl = await getDownloadURL(imageRef);
    return { imageUrl, imagePath };
  };

  const deleteImage = async (imagePath?: string) => {
    if (!imagePath) return;
    try {
      await deleteObject(ref(storage, imagePath));
    } catch (error) {
      console.warn("Failed to delete image from storage:", error);
    }
  };

  const handleAddEquipment = async (data: EquipmentData) => {
    try {
      let imageUrl = data.imageUrl ?? "";
      let imagePath: string | null = null;
      if (data.imageFile) {
        const image = await uploadImage(data.imageFile);
        imageUrl = image.imageUrl;
        imagePath = image.imagePath;
      }
      await addDoc(collection(db, "equipment"), {
        name: data.name,
        category: data.category,
        status: data.status,
        quantity: data.quantity,
        location: data.location,
        purchaseDate: data.purchaseDate,
        maintenanceDate: data.maintenanceDate,
        imageUrl,
        imagePath,
        createdAt: new Date().toISOString(),
      });
      toast.success(`Equipment added: ${data.name}.`);
    } catch (error) {
      console.error(error);
      toast("Failed to add equipment.", { variant: "danger" });
      throw new Error("add-equipment-failed", { cause: error });
    }
  };

  const handleUpdateEquipment = async (id: string, data: EquipmentData) => {
    const current = items.find((i) => i.id === id);
    try {
      let imageUrl = data.imageUrl ?? "";
      let imagePath = data.imagePath ?? current?.imagePath ?? null;

      if (data.imageFile) {
        const image = await uploadImage(data.imageFile);
        imageUrl = image.imageUrl;
        imagePath = image.imagePath;
        if (current?.imagePath && current.imagePath !== image.imagePath) {
          await deleteImage(current.imagePath);
        }
      }

      if (!imageUrl && current?.imagePath) {
        await deleteImage(current.imagePath);
        imagePath = null;
      }

      await updateDoc(doc(db, "equipment", id), {
        name: data.name,
        category: data.category,
        status: data.status,
        quantity: data.quantity,
        location: data.location,
        purchaseDate: data.purchaseDate,
        maintenanceDate: data.maintenanceDate,
        imageUrl,
        imagePath,
        updatedAt: new Date().toISOString(),
      });
      toast.success(`Equipment updated: ${data.name}.`);
    } catch (error) {
      console.error(error);
      toast("Failed to update equipment.", { variant: "danger" });
      throw new Error("update-equipment-failed", { cause: error });
    }
  };

  const handleDeleteEquipment = async (id: string) => {
    const item = items.find((i) => i.id === id);
    try {
      await deleteImage(item?.imagePath);
      await deleteDoc(doc(db, "equipment", id));
      toast.success(`Equipment deleted: ${item?.name ?? "Item"}.`);
    } catch (error) {
      console.error(error);
      toast("Failed to delete equipment.", { variant: "danger" });
      throw new Error("delete-equipment-failed", { cause: error });
    }
  };

  const handleToggleStatus = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const next = item.status === "available" ? "maintenance" : "available";
    try {
      await updateDoc(doc(db, "equipment", id), { status: next });
      toast.info(
        `"${item.name}" marked ${next === "available" ? "available" : "under maintenance"}.`,
      );
    } catch {
      toast("Failed to update status.", { variant: "danger" });
    }
  };

  return (
    <AdminEquipmentPage
      items={items}
      loading={loading}
      onAddEquipment={handleAddEquipment}
      onUpdateEquipment={handleUpdateEquipment}
      onDeleteEquipment={handleDeleteEquipment}
      onToggleStatus={handleToggleStatus}
    />
  );
}