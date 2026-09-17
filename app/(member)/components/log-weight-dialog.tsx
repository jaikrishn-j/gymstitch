"use client";

import React from "react";
import { Plus } from "lucide-react";

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

interface LogWeightDialogProps {
  currentWeight: number;
}

export function LogWeightDialog({ currentWeight }: LogWeightDialogProps) {
  return (
    <Dialog>
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

        <form className="space-y-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="weight">Current Weight</Label>
            <div className="relative">
              <Input
                id="weight"
                name="weight"
                type="number"
                step="0.1"
                min="1"
                placeholder={currentWeight.toString()}
                className="pr-12"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                kg
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Last recorded weight was{" "}
              <span className="font-medium text-foreground">
                {currentWeight} kg
              </span>
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button type="submit">Save Entry</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}