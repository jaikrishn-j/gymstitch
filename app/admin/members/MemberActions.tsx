"use client"

import { useState } from "react"
import { MoreHorizontal, Eye, Pencil, Trash2, Copy, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteMember } from "./actions"
import { type Member } from "./columns"
import { useMemberRefresh } from "./member-context"

interface MemberActionsProps {
  member: Member
}

export function MemberActions({ member }: MemberActionsProps) {
  const refresh = useMemberRefresh()
  const [viewOpen, setViewOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleCopyId() {
    navigator.clipboard.writeText(member.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDelete() {
    await deleteMember(member.id)
    setDeleteOpen(false)
    refresh()
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

        <DropdownMenuContent align="end" className="w-44">
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
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove member
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Dialog */}
      
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Member Details</DialogTitle>
            <DialogDescription>
              View information for {member.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Member */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Member</p>
              <p className="text-2xl font-bold tracking-tight">{member.name}</p>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold">Contact Information</h3>
                <p className="text-sm text-muted-foreground">
                  Member contact details
                </p>
              </div>

              <div className="grid gap-4 rounded-lg border p-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Email Address</Label>
                  <p className="text-sm font-medium break-all">{member.email}</p>
                </div>

                {member.phone && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Phone Number</Label>
                    <p className="text-sm font-medium">{member.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Membership */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold">Membership</h3>
                <p className="text-sm text-muted-foreground">
                  Current membership status
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Current Plan</Label>
                  <p className="text-sm font-medium">
                    {member.plan && member.plan !== "not activated"
                      ? member.plan
                      : "No active plan"}
                  </p>
                </div>

                {!member.plan || member.plan === "not activated" ? (
                  <Badge variant="outline">Not activated</Badge>
                ) : (
                  <Badge variant="secondary">{member.plan}</Badge>
                )}
              </div>
            </div>

            {/* Member ID */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">Member ID</Label>
              <div className="rounded-md bg-muted px-3 py-2">
                <p className="font-mono text-xs break-all">{member.id}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{member.name}</strong>?
              This action cannot be undone and will permanently delete their
              account.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
