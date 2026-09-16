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
import { PERMISSION_MODULES } from "@/types/permissions";
import { createStaff } from "./actions";
import { useStaffRefresh } from "./staff-context";

const PERMISSION_OPTIONS = [
  { value: "null", label: "None" },
  { value: "read", label: "Read" },
  { value: "full", label: "Full" },
] as const;

export const AddStaff = () => {
  const refresh = useStaffRefresh();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [permissions, setPermissions] = React.useState<Record<string, string>>(
    Object.fromEntries(PERMISSION_MODULES.map((mod) => [mod.key, "null"]))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    // Build permissions array from current state
    const permissionList = Object.entries(permissions)
      .filter(([, level]) => level !== "null")
      .map(([moduleKey, level]) => ({
        name: `${moduleKey}:${level}`,
      }));

    setLoading(true);
    try {
      await createStaff({
        name,
        email,
        permissions: permissionList,
      });
      toast.success("Staff member created successfully");
      setOpen(false);
      refresh();
      // Reset form
      setName("");
      setEmail("");
      setPermissions(
        Object.fromEntries(PERMISSION_MODULES.map((mod) => [mod.key, "null"]))
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to create staff");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button >
            <span className="mr-1 text-base leading-none">+</span>
            New Staff
          </Button>
        }
      />

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Staff</DialogTitle>
          <DialogDescription>
            Create a staff account and configure access permissions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                autoComplete="name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Module Permissions</Label>
            <div className="space-y-2">
              {PERMISSION_MODULES.map((mod) => (
                <div
                  key={mod.key}
                  className="flex items-center justify-between rounded-lg border px-4 py-3"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{mod.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {mod.description}
                    </p>
                  </div>

                  <div className="flex gap-1">
                    {PERMISSION_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        htmlFor={`${mod.key}_${opt.value}`}
                        className="cursor-pointer"
                      >
                        <input
                          type="radio"
                          id={`${mod.key}_${opt.value}`}
                          name={`permission_${mod.key}`}
                          value={opt.value}
                          checked={permissions[mod.key] === opt.value}
                          onChange={() =>
                            setPermissions((prev) => ({
                              ...prev,
                              [mod.key]: opt.value,
                            }))
                          }
                          className="sr-only peer"
                        />
                        <span className="inline-flex items-center justify-center rounded-md border border-input px-3 py-1 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground peer-checked:bg-primary peer-checked:text-primary-foreground">
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Staff"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStaff;