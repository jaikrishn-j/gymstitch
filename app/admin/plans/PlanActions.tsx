"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal, Eye, Pencil, Trash2, Copy, Check, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updatePlan, deletePlan, type PlanInput } from "./action";
import { type Plan } from "./columns";
import { usePlansRefresh } from "./plans-context";

interface PlanActionsProps {
  plan: Plan;
}

export function PlanActions({ plan }: PlanActionsProps) {
  const refresh = usePlansRefresh();
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const [editName, setEditName] = useState(plan.name);
  const [editDescriptions, setEditDescriptions] = useState(plan.descriptions || "");
  const [editAmount, setEditAmount] = useState(plan.amount);
  const [editOfferPrice, setEditOfferPrice] = useState(plan.offerPrice || "");
  const [editDurationInDays, setEditDurationInDays] = useState(plan.durationInDays);
  const [editIsAvailable, setEditIsAvailable] = useState(plan.isAvailable);
  const [editFeatures, setEditFeatures] = useState<string[]>(plan.includedFeatures);
  const [editFeatureInput, setEditFeatureInput] = useState("");

  function handleCopyId() {
    navigator.clipboard.writeText(String(plan.id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const handleOpenEdit = () => {
    setEditName(plan.name);
    setEditDescriptions(plan.descriptions || "");
    setEditAmount(plan.amount);
    setEditOfferPrice(plan.offerPrice || "");
    setEditDurationInDays(plan.durationInDays);
    setEditIsAvailable(plan.isAvailable);
    setEditFeatures([...plan.includedFeatures]);
    setEditFeatureInput("");
    setEditOpen(true);
  };

  const addEditFeature = () => {
    const trimmed = editFeatureInput.trim();
    if (trimmed && !editFeatures.includes(trimmed)) {
      setEditFeatures([...editFeatures, trimmed]);
      setEditFeatureInput("");
    }
  };

  const removeEditFeature = (index: number) => {
    setEditFeatures(editFeatures.filter((_, i) => i !== index));
  };

  const handleEditFeatureKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEditFeature();
    }
  };

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error("Plan name is required");
      return;
    }
    if (!editAmount || Number(editAmount) <= 0) {
      toast.error("Valid amount is required");
      return;
    }
    if (editFeatures.filter((f) => f.trim()).length === 0) {
      toast.error("At least one feature is required");
      return;
    }

    const planData: Partial<PlanInput> = {
      name: editName.trim(),
      descriptions: editDescriptions.trim() || undefined,
      amount: editAmount,
      offerPrice: editOfferPrice || undefined,
      includedFeatures: editFeatures.filter((f) => f.trim()),
      isAvailable: editIsAvailable,
      durationInDays: editDurationInDays,
    };

    setLoading(true);
    try {
      await updatePlan(plan.id, planData);
      toast.success("Plan updated successfully");
      setEditOpen(false);
      refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update plan");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    try {
      await deletePlan(plan.id);
      toast.success("Plan deleted successfully");
      setDeleteOpen(false);
      refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete plan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <span className="sr-only">Open actions</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          }
        />

        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={handleCopyId}>
            {copied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy plan ID"}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setViewOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View plan
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleOpenEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit plan
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete plan
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Plan Details</DialogTitle>
            <DialogDescription>
              View information for {plan.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-muted-foreground">Plan Name</Label>
              <p className="text-sm font-medium">{plan.name}</p>
            </div>

            {plan.descriptions && (
              <div className="grid gap-2">
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-sm">{plan.descriptions}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-muted-foreground">Amount</Label>
                <p className="text-sm font-medium">
                  ₹{Number(plan.amount).toLocaleString("en-IN")}
                </p>
              </div>

              {plan.offerPrice && (
                <div className="grid gap-2">
                  <Label className="text-muted-foreground">Offer Price</Label>
                  <p className="text-sm font-medium text-green-600">
                    ₹{Number(plan.offerPrice).toLocaleString("en-IN")}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-muted-foreground">Duration</Label>
                <p className="text-sm">{plan.durationInDays} days</p>
              </div>

              <div className="grid gap-2">
                <Label className="text-muted-foreground">Status</Label>
                <Badge variant={plan.isAvailable ? "default" : "secondary"}>
                  {plan.isAvailable ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-muted-foreground">Included Features</Label>
              {plan.includedFeatures.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {plan.includedFeatures.map((feature, i) => (
                    <Badge key={i} variant="secondary" className="font-normal">
                      {feature}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No features</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label className="text-muted-foreground">Plan ID</Label>
              <p className="font-mono text-xs text-muted-foreground">{plan.id}</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Plan</DialogTitle>
            <DialogDescription>
              Update plan information and features.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Plan Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-descriptions">Description</Label>
                <Input
                  id="edit-descriptions"
                  value={editDescriptions}
                  onChange={(e) => setEditDescriptions(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-amount">Amount (₹)</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-offerPrice">Offer Price (₹)</Label>
                  <Input
                    id="edit-offerPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editOfferPrice}
                    onChange={(e) => setEditOfferPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-duration">Duration (days)</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    min="1"
                    value={editDurationInDays}
                    onChange={(e) => setEditDurationInDays(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Availability</Label>
                  <div className="flex items-center gap-2 h-10">
                    <input
                      type="checkbox"
                      id="edit-isAvailable"
                      checked={editIsAvailable}
                      onChange={(e) => setEditIsAvailable(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="edit-isAvailable" className="cursor-pointer">
                      Active
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Included Features</Label>
              <div className="flex gap-2">
                <Input
                  value={editFeatureInput}
                  onChange={(e) => setEditFeatureInput(e.target.value)}
                  onKeyDown={handleEditFeatureKeyDown}
                  placeholder="Add a feature and press Enter"
                />
                <Button type="button" variant="outline" onClick={addEditFeature}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editFeatures.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeEditFeature(index)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{plan.name}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
