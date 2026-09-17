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

import { PERMISSION_MODULES } from "@/types/permissions";
import { updateStaff, deleteStaff } from "./actions";
import { type Staff, type StaffPermission } from "./columns";
import { useStaffRefresh } from "./staff-context";

const PERMISSION_OPTIONS = [
  { value: "null", label: "None" },
  { value: "read", label: "Read" },
  { value: "full", label: "Full" },
] as const;

interface StaffActionsProps {
  staff: Staff;
}

function getPermissionLevel(
  permissions: StaffPermission[],
  moduleKey: string,
): string {
  for (const permission of permissions) {
    const name =
      typeof permission === "string"
        ? permission
        : permission.name;

    if (name.startsWith(`${moduleKey}:`)) {
      return name.split(":")[1] || "full";
    }
  }

  return "null";
}

export function StaffActions({ staff }: StaffActionsProps) {
  const refresh = useStaffRefresh();

  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const [editName, setEditName] = useState(staff.name);
  const [editEmail, setEditEmail] = useState(staff.email);

  const [editPermissions, setEditPermissions] = useState<
    Record<string, string>
  >(() => {
    const permissions: Record<string, string> = {};

    PERMISSION_MODULES.forEach((module) => {
      permissions[module.key] = getPermissionLevel(
        staff.permission,
        module.key,
      );
    });

    return permissions;
  });

  function handleCopyId() {
    navigator.clipboard.writeText(staff.id);
    setCopied(true);

    toast.success("Staff ID copied");

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  function handleOpenEdit() {
    setEditName(staff.name);
    setEditEmail(staff.email);

    const permissions: Record<string, string> = {};

    PERMISSION_MODULES.forEach((module) => {
      permissions[module.key] = getPermissionLevel(
        staff.permission,
        module.key,
      );
    });

    setEditPermissions(permissions);
    setEditOpen(true);
  }

  async function handleEditSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!editName.trim() || !editEmail.trim()) {
      toast.error("Name and email are required");
      return;
    }

    const permissionList = Object.entries(editPermissions)
      .filter(([, level]) => level !== "null")
      .map(([moduleKey, level]) => ({
        name: `${moduleKey}:${level}`,
      }));

    setLoading(true);

    try {
      await updateStaff(staff.id, {
        name: editName.trim(),
        email: editEmail.trim(),
        permissions: permissionList,
      });

      toast.success("Staff member updated successfully");
      setEditOpen(false);
      refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update staff",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);

    try {
      await deleteStaff(staff.id);

      toast.success("Staff member removed successfully");
      setDeleteOpen(false);
      refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete staff",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            />
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
            {copied ? "Copied" : "Copy staff ID"}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setViewOpen(true)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View staff
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleOpenEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit staff
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove staff
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Staff Details</DialogTitle>
            <DialogDescription>
              View information for {staff.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Staff Member
              </p>
              <p className="text-xl font-semibold tracking-tight">
                {staff.name}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium">
                  Account Information
                </h3>
                <p className="text-sm text-muted-foreground">
                  Staff account details
                </p>
              </div>

              <div className="grid gap-4 border-y py-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">
                    Email Address
                  </Label>
                  <p className="break-all text-sm">
                    {staff.email}
                  </p>
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground">
                    User ID
                  </Label>
                  <p className="break-all bg-muted px-3 py-2 font-mono text-xs">
                    {staff.id}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium">
                  Permissions
                </h3>
                <p className="text-sm text-muted-foreground">
                  Access granted to this staff member
                </p>
              </div>

              <div className="border-y py-4">
                {staff.permission.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {staff.permission.map((permission, index) => (
                      <Badge
                        key={`${staff.id}-permission-${index}`}
                        variant="secondary"
                      >
                        {typeof permission === "string"
                          ? permission
                          : permission.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No permissions assigned
                  </p>
                )}
              </div>
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

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Staff</DialogTitle>
            <DialogDescription>
              Update staff information and permissions.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleEditSubmit}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">
                  Full Name
                </Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(event) =>
                    setEditName(event.target.value)
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-email">
                  Email Address
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editEmail}
                  onChange={(event) =>
                    setEditEmail(event.target.value)
                  }
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
                        const inputId = `edit_${module.key}_${option.value}`;

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
                                editPermissions[module.key] ===
                                option.value
                              }
                              onChange={() =>
                                setEditPermissions((previous) => ({
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
      <AlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove Staff Member?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                {staff.name}
              </span>
              's account. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              variant="destructive"
            >
              {loading ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}