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

const createInitialPermissions = () =>
  Object.fromEntries(
    PERMISSION_MODULES.map((module) => [module.key, "null"]),
  );

export const AddStaff = () => {
  const refresh = useStaffRefresh();

  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [permissions, setPermissions] = React.useState<
    Record<string, string>
  >(createInitialPermissions);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPermissions(createInitialPermissions());
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    const permissionList = Object.entries(permissions)
      .filter(([, level]) => level !== "null")
      .map(([moduleKey, level]) => ({
        name: `${moduleKey}:${level}`,
      }));

    setLoading(true);

    try {
      await createStaff({
        name: name.trim(),
        email: email.trim(),
        permissions: permissionList,
      });

      toast.success("Staff member created successfully");

      setOpen(false);
      resetForm();
      refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create staff",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);

    if (!value && !loading) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button>+ New Staff</Button>} />

      <DialogContent className="flex max-h-[calc(100vh-2rem)] flex-col sm:max-w-2xl">
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <DialogHeader className="shrink-0">
            <DialogTitle>Add New Staff</DialogTitle>
            <DialogDescription>
              Create a staff account and configure access permissions.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto py-6 pr-1">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="staff-name">Full Name</Label>
                  <Input
                    id="staff-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="John Doe"
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="staff-email">Email Address</Label>
                  <Input
                    id="staff-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="john@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Module Permissions</Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Choose the access level for each module.
                  </p>
                </div>

                <div className="divide-y border">
                  {PERMISSION_MODULES.map((module) => (
                    <div
                      key={module.key}
                      className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {module.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {module.description}
                        </p>
                      </div>

                      <div className="flex shrink-0">
                        {PERMISSION_OPTIONS.map((option) => {
                          const inputId = `permission_${module.key}_${option.value}`;

                          return (
                            <label
                              key={option.value}
                              htmlFor={inputId}
                              className="cursor-pointer"
                            >
                              <input
                                id={inputId}
                                type="radio"
                                name={`permission_${module.key}`}
                                value={option.value}
                                checked={
                                  permissions[module.key] === option.value
                                }
                                onChange={() =>
                                  setPermissions((previous) => ({
                                    ...previous,
                                    [module.key]: option.value,
                                  }))
                                }
                                className="peer sr-only"
                              />

                              <span className="inline-flex h-8 items-center border border-input px-3 text-xs font-medium transition-colors first:rounded-l-md last:rounded-r-md -ml-px first:ml-0 hover:bg-accent hover:text-accent-foreground peer-checked:z-10 peer-checked:bg-accent peer-checked:text-accent-foreground">
                                {option.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
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
              {loading ? "Creating..." : "Create Staff"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStaff;