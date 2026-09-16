"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Copy,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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

import { deleteMember } from "./actions";
import { type Member } from "./columns";
import { useMemberRefresh } from "./member-context";

interface MemberActionsProps {
  member: Member;
}

export function MemberActions({ member }: MemberActionsProps) {
  const refresh = useMemberRefresh();

  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleCopyId() {
    navigator.clipboard.writeText(member.id);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  async function handleDelete() {
    await deleteMember(member.id);
    setDeleteOpen(false);
    refresh();
  }

  const hasActivePlan =
    member.plan && member.plan !== "not activated";

  return (
    <>
      {/* Actions Menu */}
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

            {copied ? "Copied" : "Copy member ID"}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setViewOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View member
          </DropdownMenuItem>

          <DropdownMenuItem disabled>
            <Pencil className="mr-2 h-4 w-4" />
            Edit member
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove member
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Member Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
            <DialogDescription>
              View information for {member.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Member */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Member
              </p>

              <p className="text-xl font-semibold tracking-tight">
                {member.name}
              </p>
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium">
                  Contact Information
                </h3>

                <p className="text-sm text-muted-foreground">
                  Member contact details
                </p>
              </div>

              <div className="grid gap-4 border-y py-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">
                    Email Address
                  </Label>

                  <p className="break-all text-sm">
                    {member.email}
                  </p>
                </div>

                {member.phone && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">
                      Phone Number
                    </Label>

                    <p className="text-sm">
                      {member.phone}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Membership */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium">
                  Membership
                </h3>

                <p className="text-sm text-muted-foreground">
                  Current membership status
                </p>
              </div>

              <div className="flex items-center justify-between border-y py-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">
                    Current Plan
                  </Label>

                  <p className="text-sm">
                    {hasActivePlan
                      ? member.plan
                      : "No active plan"}
                  </p>
                </div>

                <Badge
                  variant={
                    hasActivePlan ? "secondary" : "outline"
                  }
                >
                  {hasActivePlan
                    ? member.plan
                    : "Not activated"}
                </Badge>
              </div>
            </div>

            {/* Member ID */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">
                Member ID
              </Label>

              <div className="bg-muted px-3 py-2">
                <p className="break-all font-mono text-xs">
                  {member.id}
                </p>
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

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove member?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                {member.name}
              </span>
              's account. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              variant="destructive"
            >
              Remove member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}