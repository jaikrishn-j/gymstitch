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
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              View information for payment #{payment.id}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-muted-foreground">Payment ID</Label>
              <p className="font-mono text-xs text-muted-foreground">
                {payment.id}
              </p>
            </div>

            <div className="grid gap-2">
              <Label className="text-muted-foreground">User</Label>
              <p className="text-sm">{payment.userName}</p>
              <p className="text-xs text-muted-foreground">{payment.userEmail}</p>
            </div>

            <div className="grid gap-2">
              <Label className="text-muted-foreground">Amount</Label>
              <p className="text-sm font-medium">
                ₹{Number(payment.amount).toLocaleString("en-IN")}
              </p>
            </div>

            <div className="grid gap-2">
              <Label className="text-muted-foreground">Plan</Label>
              {payment.planName ? (
                <Badge variant="secondary" className="w-fit font-normal">
                  {payment.planName}
                </Badge>
              ) : (
                <Badge variant="outline" className="w-fit">
                  Registration
                </Badge>
              )}
            </div>

            <div className="grid gap-2">
              <Label className="text-muted-foreground">Payment Method</Label>
              <p className="text-sm capitalize">{payment.paymentMethod}</p>
            </div>

            <div className="grid gap-2">
              <Label className="text-muted-foreground">Status</Label>
              <Badge
                variant={
                  payment.status === "SUCCESS"
                    ? "default"
                    : payment.status === "PENDING"
                      ? "secondary"
                      : "destructive"
                }
                className="w-fit font-normal"
              >
                {payment.status}
              </Badge>
            </div>

            <div className="grid gap-2">
              <Label className="text-muted-foreground">Date</Label>
              <p className="text-sm">
                {new Date(payment.paidAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {payment.description && (
              <div className="grid gap-2">
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-sm">{payment.description}</p>
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
