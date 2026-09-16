"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";

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
  const [durationInDays, setDurationInDays] = React.useState(30);
  const [isAvailable, setIsAvailable] = React.useState(true);
  const [features, setFeatures] = React.useState<string[]>([]);
  const [featureInput, setFeatureInput] = React.useState("");

  const resetForm = () => {
    setName("");
    setDescriptions("");
    setAmount("");
    setOfferPrice("");
    setDurationInDays(30);
    setIsAvailable(true);
    setFeatures([]);
    setFeatureInput("");
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);

    if (!value && !loading) {
      resetForm();
    }
  };

  const addFeature = () => {
    const trimmed = featureInput.trim();

    if (trimmed && !features.includes(trimmed)) {
      setFeatures((current) => [...current, trimmed]);
      setFeatureInput("");
    }
  };

  const removeFeature = (index: number) => {
    setFeatures((current) =>
      current.filter((_, i) => i !== index),
    );
  };

  const handleFeatureKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addFeature();
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Plan name is required");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Valid amount is required");
      return;
    }

    if (features.length === 0) {
      toast.error("At least one feature is required");
      return;
    }

    const planData: PlanInput = {
      name: name.trim(),
      descriptions: descriptions.trim() || undefined,
      amount,
      offerPrice: offerPrice || undefined,
      includedFeatures: features.filter((feature) => feature.trim()),
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
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create plan",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="mr-1 h-4 w-4" />
            New Plan
          </Button>
        }
      />

      <DialogContent className="flex max-h-[calc(100vh-2rem)] flex-col sm:max-w-2xl">
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <DialogHeader className="shrink-0">
            <DialogTitle>Add New Plan</DialogTitle>
            <DialogDescription>
              Create a new membership plan with pricing and
              features.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto py-6 pr-1">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Plan Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Monthly Basic"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="descriptions">
                    Description
                  </Label>
                  <Input
                    id="descriptions"
                    value={descriptions}
                    onChange={(e) =>
                      setDescriptions(e.target.value)
                    }
                    placeholder="Brief description of the plan"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={amount}
                      onChange={(e) =>
                        setAmount(e.target.value)
                      }
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="offerPrice">
                      Offer Price (₹)
                    </Label>
                    <Input
                      id="offerPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={offerPrice}
                      onChange={(e) =>
                        setOfferPrice(e.target.value)
                      }
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="duration">
                      Duration (days)
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={durationInDays}
                      onChange={(e) =>
                        setDurationInDays(
                          Number(e.target.value),
                        )
                      }
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="isAvailable">
                      Availability
                    </Label>

                    <label
                      htmlFor="isAvailable"
                      className="flex h-10 cursor-pointer items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        id="isAvailable"
                        checked={isAvailable}
                        onChange={(e) =>
                          setIsAvailable(e.target.checked)
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
                    value={featureInput}
                    onChange={(e) =>
                      setFeatureInput(e.target.value)
                    }
                    onKeyDown={handleFeatureKeyDown}
                    placeholder="Add a feature and press Enter"
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addFeature}
                    aria-label="Add feature"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {features.map((feature, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="gap-1 pr-1 font-normal"
                      >
                        {feature}

                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
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
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>

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