"use client"

import { useState } from "react"
import { MoreHorizontal, Eye, Copy, Check } from "lucide-react"

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type Payment } from "./columns"

interface PaymentActionsProps {
  payment: Payment
}

export function PaymentActions({ payment }: PaymentActionsProps) {
  const [viewOpen, setViewOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleCopyId() {
    navigator.clipboard.writeText(String(payment.id))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
            {copied ? "Copied" : "Copy payment ID"}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setViewOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View payment
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Payment Details</DialogTitle>
            <DialogDescription>
              View information for payment #{payment.id}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Amount & Status */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Payment Amount</p>
                <p className="text-2xl font-bold tracking-tight">
                  ₹{Number(payment.amount).toLocaleString("en-IN")}
                </p>
              </div>

              <Badge
                variant={
                  payment.status === "SUCCESS"
                    ? "default"
                    : payment.status === "PENDING"
                      ? "secondary"
                      : "destructive"
                }
              >
                {payment.status}
              </Badge>
            </div>

            {/* Payment Information */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold">Payment Information</h3>
                <p className="text-sm text-muted-foreground">
                  Transaction and membership details
                </p>
              </div>

              <div className="grid gap-4 rounded-lg border p-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Payment ID</Label>
                  <p className="font-mono text-xs break-all">{payment.id}</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground">Plan</Label>
                  <div>
                    {payment.planName ? (
                      <Badge variant="secondary">{payment.planName}</Badge>
                    ) : (
                      <Badge variant="outline">Registration</Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Payment Method</Label>
                    <p className="text-sm font-medium capitalize">
                      {payment.paymentMethod}
                    </p>
                  </div>

                  <div className="space-y-1 text-right">
                    <Label className="text-muted-foreground">Date</Label>
                    <p className="text-sm font-medium">
                      {new Date(payment.paidAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* User */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold">Member</h3>
                <p className="text-sm text-muted-foreground">
                  Account associated with this payment
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-lg font-semibold">{payment.userName}</p>
                <p className="text-sm text-muted-foreground break-all">
                  {payment.userEmail}
                </p>
              </div>
            </div>

            {/* Description */}
            {payment.description && (
              <div className="space-y-2">
                <Label className="text-muted-foreground">Description</Label>
                <div className="rounded-lg border bg-muted/50 p-3">
                  <p className="text-sm">{payment.description}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
