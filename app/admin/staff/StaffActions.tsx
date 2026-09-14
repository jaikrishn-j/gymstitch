"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal, Eye, Pencil, Trash2, Copy, Check } from "lucide-react";

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

export function StaffActions({ staff }: StaffActionsProps) {
  const refresh = useStaffRefresh();
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state for edit dialog
  const [editName, setEditName] = useState(staff.name);
  const [editEmail, setEditEmail] = useState(staff.email);
  const [editPermissions, setEditPermissions] = useState<
    Record<string, string>
  >(() => {
    const perms: Record<string, string> = {};
    PERMISSION_MODULES.forEach((mod) => {
      perms[mod.key] = getPermissionLevel(staff.permission, mod.key);
    });
    return perms;
  });

  function getPermissionLevel(
    permissions: StaffPermission[],
    moduleKey: string
  ): string {
    for (const p of permissions) {
      const name = typeof p === "string" ? p : p.name;
      if (name.startsWith(`${moduleKey}:`)) {
        return name.split(":")[1] || "full";
      }
    }
    return "null";
  }

  function handleCopyId() {
    navigator.clipboard.writeText(staff.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Reset edit form when opening dialog
  const handleOpenEdit = () => {
    setEditName(staff.name);
    setEditEmail(staff.email);
    setEditPermissions(() => {
      const perms: Record<string, string> = {};
      PERMISSION_MODULES.forEach((mod) => {
        perms[mod.key] = getPermissionLevel(staff.permission, mod.key);
      });
      return perms;
    });
    setEditOpen(true);
  };

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
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
        name: editName,
        email: editEmail,
        permissions: permissionList,
      });
      toast.success("Staff member updated successfully");
      setEditOpen(false);
      refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update staff");
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
    } catch (error: any) {
      toast.error(error.message || "Failed to delete staff");
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
            {copied ? "Copied" : "Copy staff ID"}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setViewOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View staff
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleOpenEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit staff
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove staff
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Dialog (unchanged) */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Staff Details</DialogTitle>
            <DialogDescription>
              View information for {staff.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-muted-foreground">Full Name</Label>
              <p className="text-sm">{staff.name}</p>
            </div>

            <div className="grid gap-2">
              <Label className="text-muted-foreground">Email Address</Label>
              <p className="text-sm">{staff.email}</p>
            </div>

            <div className="grid gap-2">
              <Label className="text-muted-foreground">User ID</Label>
              <p className="font-mono text-xs text-muted-foreground">
                {staff.id}
              </p>
            </div>

            <div className="grid gap-2">
              <Label className="text-muted-foreground">Permissions</Label>
              {staff.permission.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {staff.permission.map((p, i) => (
                    <Badge key={i} variant="secondary" className="font-normal">
                      {typeof p === "string" ? p : p.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No permissions</p>
              )}
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
            <DialogTitle>Edit Staff</DialogTitle>
            <DialogDescription>
              Update staff information and permissions.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
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
                          htmlFor={`edit_${mod.key}_${opt.value}`}
                          className="cursor-pointer"
                        >
                          <input
                            type="radio"
                            id={`edit_${mod.key}_${opt.value}`}
                            name={`permission_${mod.key}`}
                            value={opt.value}
                            checked={editPermissions[mod.key] === opt.value}
                            onChange={() =>
                              setEditPermissions((prev) => ({
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
            <AlertDialogTitle>Remove Staff Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{staff.name}</strong>?
              This action cannot be undone and will permanently delete their
              account.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}