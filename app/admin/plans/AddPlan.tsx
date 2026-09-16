"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { createPlan, type PlanInput } from "./action";
import { usePlansRefresh } from "./plans-context";

export const AddPlan = () => {
  const refresh = usePlansRefresh();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const [name, setName] = React.useState("");
  const [descriptions, setDescriptions] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [offerPrice, setOfferPrice] = React.useState("");
  const [durationInDays, setDurationInDays] = React.useState<number>(30);
  const [isAvailable, setIsAvailable] = React.useState(true);
  const [features, setFeatures] = React.useState<string[]>([""]);
  const [featureInput, setFeatureInput] = React.useState("");

  const resetForm = () => {
    setName("");
    setDescriptions("");
    setAmount("");
    setOfferPrice("");
    setDurationInDays(30);
    setIsAvailable(true);
    setFeatures([""]);
    setFeatureInput("");
  };

  const addFeature = () => {
    const trimmed = featureInput.trim();
    if (trimmed && !features.includes(trimmed)) {
      setFeatures([...features, trimmed]);
      setFeatureInput("");
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleFeatureKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addFeature();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Plan name is required");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Valid amount is required");
      return;
    }
    if (features.filter((f) => f.trim()).length === 0) {
      toast.error("At least one feature is required");
      return;
    }

    const planData: PlanInput = {
      name: name.trim(),
      descriptions: descriptions.trim() || undefined,
      amount,
      offerPrice: offerPrice || undefined,
      includedFeatures: features.filter((f) => f.trim()),
      isAvailable,
      durationInDays,
    };

    setLoading(true);
    try {
      await createPlan(planData);
      toast.success("Plan created successfully");
      setOpen(false);
      resetForm();
      refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to create plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <span className="mr-1 text-base leading-none">+</span>
            New Plan
          </Button>
        }
      />

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Plan</DialogTitle>
          <DialogDescription>
            Create a new membership plan with pricing and features.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Monthly Basic"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="descriptions">Description</Label>
              <Input
                id="descriptions"
                value={descriptions}
                onChange={(e) => setDescriptions(e.target.value)}
                placeholder="Brief description of the plan"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="offerPrice">Offer Price (₹)</Label>
                <Input
                  id="offerPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (days)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={durationInDays}
                  onChange={(e) => setDurationInDays(Number(e.target.value))}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label>Availability</Label>
                <div className="flex items-center gap-2 h-10">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isAvailable" className="cursor-pointer">
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
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={handleFeatureKeyDown}
                placeholder="Add a feature and press Enter"
              />
              <Button type="button" variant="outline" onClick={addFeature}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {features.map((feature, index) => (
                feature.trim() && (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPlan;
