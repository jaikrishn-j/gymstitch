"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Copy,
  Check,
  Plus,
  X,
} from "lucide-react";

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
  const [editDescriptions, setEditDescriptions] = useState(
    plan.descriptions || "",
  );
  const [editAmount, setEditAmount] = useState(plan.amount);
  const [editOfferPrice, setEditOfferPrice] = useState(
    plan.offerPrice || "",
  );
  const [editDurationInDays, setEditDurationInDays] = useState(
    plan.durationInDays,
  );
  const [editIsAvailable, setEditIsAvailable] = useState(plan.isAvailable);
  const [editFeatures, setEditFeatures] = useState<string[]>(
    plan.includedFeatures,
  );
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

  const handleEditFeatureKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEditFeature();
    }
  };

  async function handleEditSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    if (!editName.trim()) {
      toast.error("Plan name is required");
      return;
    }

    if (!editAmount || Number(editAmount) <= 0) {
      toast.error("Valid amount is required");
      return;
    }

    if (editFeatures.filter((feature) => feature.trim()).length === 0) {
      toast.error("At least one feature is required");
      return;
    }

    const planData: Partial<PlanInput> = {
      name: editName.trim(),
      descriptions: editDescriptions.trim() || undefined,
      amount: editAmount,
      offerPrice: editOfferPrice || undefined,
      includedFeatures: editFeatures.filter((feature) => feature.trim()),
      isAvailable: editIsAvailable,
      durationInDays: editDurationInDays,
    };

    setLoading(true);

    try {
      await updatePlan(plan.id, planData);
      toast.success("Plan updated successfully");
      setEditOpen(false);
      refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update plan",
      );
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
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete plan",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="h-8 w-8" />
          }
        >
          <span className="sr-only">Open actions</span>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
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
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete plan
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Plan Details</DialogTitle>
            <DialogDescription>
              View information for {plan.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label className="text-muted-foreground">
                  Plan Name
                </Label>
                <p className="text-sm font-medium">{plan.name}</p>
              </div>

              <div className="grid gap-2">
                <Label className="text-muted-foreground">
                  Status
                </Label>
                <div>
                  <Badge
                    variant={
                      plan.isAvailable ? "default" : "secondary"
                    }
                  >
                    {plan.isAvailable ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>

            {plan.descriptions && (
              <div className="grid gap-2">
                <Label className="text-muted-foreground">
                  Description
                </Label>
                <p className="text-sm">{plan.descriptions}</p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label className="text-muted-foreground">
                  Amount
                </Label>
                <p className="text-sm font-medium">
                  ₹{Number(plan.amount).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="grid gap-2">
                <Label className="text-muted-foreground">
                  Offer Price
                </Label>
                <p className="text-sm font-medium">
                  {plan.offerPrice
                    ? `₹${Number(plan.offerPrice).toLocaleString("en-IN")}`
                    : "—"}
                </p>
              </div>

              <div className="grid gap-2">
                <Label className="text-muted-foreground">
                  Duration
                </Label>
                <p className="text-sm font-medium">
                  {plan.durationInDays} days
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-muted-foreground">
                Included Features
              </Label>

              {plan.includedFeatures.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {plan.includedFeatures.map((feature, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="font-normal"
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No features
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label className="text-muted-foreground">
                Plan ID
              </Label>
              <p className="break-all font-mono text-xs text-muted-foreground">
                {plan.id}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="flex max-h-[calc(100vh-2rem)] flex-col sm:max-w-2xl">
          <form
            onSubmit={handleEditSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <DialogHeader className="shrink-0">
              <DialogTitle>Edit Plan</DialogTitle>
              <DialogDescription>
                Update plan information and features.
              </DialogDescription>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto py-6 pr-1">
              <div className="space-y-6">
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
                    <Label htmlFor="edit-descriptions">
                      Description
                    </Label>
                    <Input
                      id="edit-descriptions"
                      value={editDescriptions}
                      onChange={(e) =>
                        setEditDescriptions(e.target.value)
                      }
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-amount">
                        Amount (₹)
                      </Label>
                      <Input
                        id="edit-amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={editAmount}
                        onChange={(e) =>
                          setEditAmount(e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="edit-offerPrice">
                        Offer Price (₹)
                      </Label>
                      <Input
                        id="edit-offerPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={editOfferPrice}
                        onChange={(e) =>
                          setEditOfferPrice(e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-duration">
                        Duration (days)
                      </Label>
                      <Input
                        id="edit-duration"
                        type="number"
                        min="1"
                        value={editDurationInDays}
                        onChange={(e) =>
                          setEditDurationInDays(
                            Number(e.target.value),
                          )
                        }
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="edit-isAvailable">
                        Availability
                      </Label>

                      <label
                        htmlFor="edit-isAvailable"
                        className="flex h-10 cursor-pointer items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          id="edit-isAvailable"
                          checked={editIsAvailable}
                          onChange={(e) =>
                            setEditIsAvailable(e.target.checked)
                          }
                          className="h-4 w-4 rounded border-input accent-primary"
                        />
                        Active
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label>Included Features</Label>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Add the features included with this plan.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={editFeatureInput}
                      onChange={(e) =>
                        setEditFeatureInput(e.target.value)
                      }
                      onKeyDown={handleEditFeatureKeyDown}
                      placeholder="Add a feature and press Enter"
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addEditFeature}
                      aria-label="Add feature"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {editFeatures.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {editFeatures.map((feature, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="gap-1 pr-1 font-normal"
                        >
                          {feature}

                          <button
                            type="button"
                            onClick={() =>
                              removeEditFeature(index)
                            }
                            className="ml-1 rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
                            aria-label={`Remove ${feature}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="shrink-0 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                disabled={loading}
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

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{plan.name}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}