"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Plus, Loader2, Check } from "lucide-react";

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

import { logWeight } from "@/app/(member)/dashboard/actions";

interface LogWeightDialogProps {
  currentWeight: number;
  hasLoggedToday: boolean;
}

export function LogWeightDialog({
  currentWeight,
  hasLoggedToday,
}: LogWeightDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [weight, setWeight] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(weight);
    if (isNaN(value) || value <= 0) {
      toast.error("Please enter a valid weight.");
      return;
    }

    setLoading(true);
    try {
      const result = await logWeight(value);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Weight logged successfully!");
        setOpen(false);
        setWeight("");
        window.location.reload();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (hasLoggedToday) {
    return (
      <Badge variant="secondary" className="gap-1.5 shrink-0 px-3 py-1.5 text-sm">
        <Check className="h-3.5 w-3.5 text-emerald-500" />
        Weight Logged Today
      </Badge>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<div />} nativeButton={false}>
        <Button className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Log Weight
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Weight Entry</DialogTitle>
          <DialogDescription>
            Keep your progress up-to-date by logging your current weight.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="weight">Current Weight</Label>
            <div className="relative">
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="1"
                placeholder={currentWeight > 0 ? currentWeight.toString() : "e.g. 72.5"}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="pr-12"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                kg
              </span>
            </div>
            {currentWeight > 0 && (
              <p className="text-xs text-muted-foreground">
                Last recorded weight was{" "}
                <span className="font-medium text-foreground">
                  {currentWeight} kg
                </span>
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Entry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
