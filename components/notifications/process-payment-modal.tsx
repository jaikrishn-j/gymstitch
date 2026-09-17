"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Loader2,
  Mail,
  Phone,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { PaymentRequest } from "./notification-content";

interface ProcessPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: PaymentRequest;
  isAdmin: boolean;
  onPaymentComplete: () => void;
}

const PAYMENT_METHODS = ["Cash", "UPI", "Card", "Net Banking", "Other"];

export function ProcessPaymentModal({
  open,
  onOpenChange,
  request,
  isAdmin,
  onPaymentComplete,
}: ProcessPaymentModalProps) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(request.amount);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(1);
      setAmount(request.amount);
      setPaymentMethod("Cash");
      setDescription("");
    }
  }, [open, request]);

  const handleSubmit = useCallback(async () => {
    setLoading(true);

    try {
      const createRes = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: request.clerkId,
          planId: request.planId,
          planDurationDays: request.planDurationDays,
          amount,
          paymentMethod,
          description: description || undefined,
        }),
      });

      const createData = await createRes.json();

      if (!createRes.ok || !createData.success) {
        throw new Error(createData.error || "Failed to create payment");
      }

      const paymentId = createData.data?.id;

      await fetch("/api/payment-requests/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: request.id,
          status: "ACCEPTED",
          isRead: true,
          paymentId: paymentId || undefined,
        }),
      });

      toast.success("Payment recorded successfully");
      onPaymentComplete();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to process payment"
      );
    } finally {
      setLoading(false);
    }
  }, [request, amount, paymentMethod, description, onPaymentComplete]);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100vh-2rem)] flex-col sm:max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {step === 1 ? "Review Request" : "Confirm Payment"}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Review the payment request details before processing."
              : "Choose payment method and confirm."}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="shrink-0 py-2">
          <div className="flex items-center gap-3">
            <StepIndicator
              number={1}
              label="Review"
              active={step === 1}
              completed={step > 1}
            />
            <div className="h-px flex-1 bg-border" />
            <StepIndicator
              number={2}
              label="Payment"
              active={step === 2}
              completed={false}
            />
          </div>
        </div>

        <Separator />

        <div className="min-h-0 flex-1 overflow-y-auto py-4 pr-1">
          {step === 1 && (
            <div className="space-y-5">
              {/* User Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Label>Member</Label>
                </div>

                <div className="flex items-center gap-3 border-y py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {getInitials(request.userName)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {request.userName}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {request.userEmail}
                      </span>
                      {request.userPhone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {request.userPhone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <Label>Requested Plan</Label>
                </div>

                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">
                        {request.planName || "Unknown Plan"}
                      </p>
                      {request.planDurationInDays && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {request.planDurationInDays} days
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary">Requested</Badge>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Requested Amount
                    </span>
                    <span className="font-semibold">
                      ₹{Number(request.amount).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {request.planOfferPrice &&
                    request.planOfferPrice !== request.planAmount && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground line-through">
                          ₹
                          {Number(request.planAmount || 0).toLocaleString(
                            "en-IN"
                          )}
                        </span>
                        <span className="text-muted-foreground">
                          Regular price
                        </span>
                      </div>
                    )}
                </div>
              </div>

              {/* Request Note */}
              {request.description && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Member&apos;s Note
                  </Label>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-sm italic">
                      &quot;{request.description}&quot;
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="process-amount">Amount (₹)</Label>
                <Input
                  id="process-amount"
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">
                  You can adjust the amount if needed.
                </p>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`border px-3 py-1.5 text-sm font-medium transition-colors ${
                        paymentMethod === method
                          ? "border-primary bg-accent text-accent-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="process-description">
                  Note (Optional)
                </Label>
                <Textarea
                  id="process-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a note about this payment..."
                  rows={3}
                />
              </div>

              {/* Summary */}
              <div className="rounded-lg border p-4 space-y-2 bg-muted/20">
                <p className="text-sm font-medium">Summary</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Member</span>
                  <span>{request.userName}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Plan</span>
                  <span>{request.planName || "Unknown"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Method</span>
                  <span>{paymentMethod}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between font-semibold">
                  <span>Total</span>
                  <span>
                    ₹{Number(amount).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 border-t pt-4">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              disabled={loading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}

          {step === 1 && (
            <Button type="button" onClick={() => setStep(2)}>
              Continue
            </Button>
          )}

          {step === 2 && (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !amount || Number(amount) <= 0}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm Payment
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StepIndicator({
  number,
  label,
  active,
  completed,
}: {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <div
        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
          active || completed
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {completed ? (
          <CheckCircle className="h-3.5 w-3.5" />
        ) : (
          number
        )}
      </div>
      <span
        className={`hidden text-xs font-medium sm:inline ${
          active ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
