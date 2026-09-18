"use client";

import React from "react";
import { Plus, MoreHorizontal, Trash2 } from "lucide-react";
import { createPlan, deletePlan } from "@/app/admin/plans/action";
import type { Plan } from "@/app/admin/plans/columns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CreatePlanDialog() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const featuresRaw = formData.get("includedFeatures") as string;

    await createPlan({
      name: formData.get("name") as string,
      descriptions: formData.get("descriptions") as string,
      amount: formData.get("amount") as string,
      offerPrice: (formData.get("offerPrice") as string) || undefined,
      includedFeatures: featuresRaw ? featuresRaw.split(",").map((f) => f.trim()) : [],
      durationInDays: Number(formData.get("durationInDays")),
      isAvailable: formData.get("isAvailable") === "on",
    });

    setLoading(false);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2"><Plus className="h-4 w-4" /> Create New Plan</Button>} />
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Membership Plan</DialogTitle>
            <DialogDescription>Create a new tier available for members to purchase.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input id="name" name="name" placeholder="e.g. Annual Gold Pass" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="descriptions">Description</Label>
              <Input id="descriptions" name="descriptions" placeholder="Brief outline of benefits" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Regular Amount ($)</Label>
                <Input id="amount" name="amount" type="number" step="0.01" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="offerPrice">Offer Amount ($)</Label>
                <Input id="offerPrice" name="offerPrice" type="number" step="0.01" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="durationInDays">Duration (Days)</Label>
              <Input id="durationInDays" name="durationInDays" type="number" defaultValue={30} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="includedFeatures">Features (comma-separated)</Label>
              <Input id="includedFeatures" name="includedFeatures" placeholder="Locker Access, Sauna, Free Trainer" />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="isAvailable" name="isAvailable" defaultChecked className="rounded border-gray-300" />
              <Label htmlFor="isAvailable" className="cursor-pointer">Available for purchase immediately</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Create Plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PlanActionsMenu({ plan }: { plan: Plan }) {
  const [loading, setLoading] = React.useState(false);

  async function handleDelete() {
    if (confirm(`Are you sure you want to delete "${plan.name}"?`)) {
      setLoading(true);
      await deletePlan(plan.id);
      setLoading(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive cursor-pointer">
          <Trash2 className="mr-2 h-4 w-4" /> Delete Plan
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
