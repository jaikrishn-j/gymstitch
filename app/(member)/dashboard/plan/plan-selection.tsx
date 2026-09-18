"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  Clock3,
  CreditCard,
  Info,
  Loader2,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { createPaymentRequest, type CurrentPlanInfo, type AvailablePlan } from "./actions";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PlanSelectionProps {
  currentPlan: CurrentPlanInfo;
  availablePlans: AvailablePlan[];
  razorpayEnabled: boolean;
  registrationAmount: string;
  hasPendingRequest: boolean;
}

export function PlanSelection({
  currentPlan,
  availablePlans,
  razorpayEnabled,
  registrationAmount,
  hasPendingRequest,
}: PlanSelectionProps) {
  const [selectedPlan, setSelectedPlan] = useState<AvailablePlan | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");

  const handleSelectPlan = useCallback(
    (plan: AvailablePlan) => {
      setSelectedPlan(plan);
      setDialogOpen(true);
      setDescription("");
    },
    []
  );

  const handlePayNow = useCallback(async () => {
    if (!selectedPlan) return;
    setLoading(true);

    try {
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selectedPlan.id }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to create payment order");
      }

      const { orderId, amount, currency, razorpayKeyId, planName } =
        orderData.data;

      const options = {
        key: razorpayKeyId,
        amount,
        currency,
        name: "Gym Membership",
        description: `Payment for ${planName}`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId: selectedPlan.id,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(
                verifyData.error || "Payment verification failed"
              );
            }

            toast.success("Payment successful! Your plan has been activated.");
            setDialogOpen(false);
            window.location.reload();
          } catch (err) {
            toast.error(
              err instanceof Error
                ? err.message
                : "Payment verification failed. Contact support."
            );
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#16a34a",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            toast.info("Payment cancelled.");
          },
        },
      };

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay SDK not loaded. Please refresh the page and try again."
        );
      }

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response: any) {
        toast.error(
          response.error?.description || "Payment failed. Please try again."
        );
        setLoading(false);
      });

      razorpay.open();
      setLoading(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to initiate payment"
      );
      setLoading(false);
    }
  }, [selectedPlan]);

  const handleSendRequest = useCallback(async () => {
    if (!selectedPlan) return;
    setLoading(true);

    try {
      const result = await createPaymentRequest({
        planId: selectedPlan.id,
        amount: selectedPlan.offerPrice || selectedPlan.amount,
        description: description || undefined,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success(
        "Request submitted! The admin will review and process your plan."
      );
      setDialogOpen(false);
      window.location.reload();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit request"
      );
    } finally {
      setLoading(false);
    }
  }, [selectedPlan, description]);

  const displayAmount = (plan: AvailablePlan) => {
    const price = Number(plan.offerPrice || plan.amount);
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const hasDiscount =
    selectedPlan?.offerPrice &&
    selectedPlan.offerPrice !== selectedPlan.amount;

  return (
    <div className="space-y-8">
      {/* Current Plan Section */}
      {currentPlan.hasActivePlan && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Current Membership</CardTitle>
              {currentPlan.daysRemaining <= 3 ? (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" /> Expiring Soon
                </Badge>
              ) : (
                <Badge
                  variant="default"
                  className="bg-emerald-600 hover:bg-emerald-600"
                >
                  <Check className="mr-1 h-3 w-3" /> Active
                </Badge>
              )}
            </div>
            <CardDescription>{currentPlan.name}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-lg border p-4 bg-muted/20">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <p className="text-sm font-medium">{currentPlan.startedAt}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border p-4 bg-muted/20">
                <Clock3 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Expiry Date</p>
                  <p className="text-sm font-medium">{currentPlan.expiresAt}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border p-4 bg-muted/20">
                {currentPlan.daysRemaining <= 3 ? (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                ) : (
                  <Check className="h-5 w-5 text-emerald-500" />
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  {currentPlan.daysRemaining <= 3 ? (
                    <p className="text-sm font-medium text-amber-600">
                      Expiring Soon
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-emerald-600">
                      Active
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-muted/40 p-4 border text-center">
              <p className="text-3xl font-bold tracking-tight">
                {currentPlan.daysRemaining}
              </p>
              <p className="text-xs font-medium text-muted-foreground mt-1">
                Days Remaining
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Progress</span>
                <span>{currentPlan.planProgress}%</span>
              </div>
              <Progress value={currentPlan.planProgress} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">
                {currentPlan.daysUsed} of {currentPlan.totalDays} days used
              </p>
            </div>

            {currentPlan.planBreakdown.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <p className="text-sm font-medium">Plan History</p>
                  <div className="rounded-lg border divide-y">
                    {currentPlan.planBreakdown.map((p, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-muted/20"
                      >
                        <div>
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Paid on {p.paidAt}
                          </p>
                        </div>
                        <Badge variant="outline">{p.durationDays} days</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/40">
                    <p className="text-sm font-medium">Total Combined Days</p>
                    <Badge variant="default">{currentPlan.totalDays} days</Badge>
                  </div>
                </div>
              </>
            )}

            {currentPlan.daysRemaining <= 3 && currentPlan.daysRemaining > 0 && (
              <>
                <Separator />
                <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/50">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0 dark:text-amber-400" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-800 dark:text-amber-300">
                        Membership expiring in{" "}
                        {currentPlan.daysRemaining} day
                        {currentPlan.daysRemaining !== 1 ? "s" : ""}
                      </p>
                      <p className="text-amber-700 dark:text-amber-400 mt-0.5">
                        Recharge now to keep your membership active without
                        interruption.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pending Request Banner */}
      {hasPendingRequest && (
        <div className="rounded-lg border border-blue-300 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-950/50">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0 dark:text-blue-400" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-300">
                You have a pending payment request
              </p>
              <p className="text-blue-700 dark:text-blue-400 mt-0.5">
                Your request is being reviewed by the admin. You&apos;ll be
                notified once it&apos;s processed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Available Plans</h2>
          <p className="text-sm text-muted-foreground">
            Choose a membership plan that fits your goals.
          </p>
        </div>

        {availablePlans.length === 0 ? (
          <Card className="flex flex-col items-center justify-center text-center p-8">
            <CardContent className="space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Info className="h-7 w-7 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-lg">No Plans Available</CardTitle>
                <CardDescription>
                  There are no plans available at the moment. Please check back
                  later.
                </CardDescription>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availablePlans.map((plan) => (
              <Card
                key={plan.id}
                className="relative flex flex-col transition-colors hover:border-primary/50"
              >
                {plan.offerPrice &&
                  plan.offerPrice !== plan.amount && (
                    <div className="absolute -top-2.5 right-4">
                      <Badge className="bg-emerald-600 hover:bg-emerald-600 text-[10px] px-2 py-0.5">
                        Save ₹
                        {(
                          Number(plan.amount) - Number(plan.offerPrice)
                        ).toLocaleString("en-IN")}
                      </Badge>
                    </div>
                  )}

                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                  {plan.descriptions && (
                    <CardDescription className="text-xs line-clamp-2">
                      {plan.descriptions}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="flex flex-1 flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      {plan.offerPrice && plan.offerPrice !== plan.amount ? (
                        <>
                          <span className="text-2xl font-bold">
                            {displayAmount(plan)}
                          </span>
                          <span className="text-sm text-muted-foreground line-through">
                            ₹
                            {Number(plan.amount).toLocaleString("en-IN")}
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold">
                          {displayAmount(plan)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      for {plan.durationInDays} days
                    </p>
                  </div>

                  {plan.includedFeatures.length > 0 && (
                    <ul className="space-y-1.5">
                      {plan.includedFeatures.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                        >
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <Button
                    className="w-full"
                    onClick={() => handleSelectPlan(plan)}
                    disabled={hasPendingRequest}
                  >
                    {hasPendingRequest ? "Request Pending" : "Select Plan"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Plan Selection Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {razorpayEnabled ? "Confirm Payment" : "Send Request"}
            </DialogTitle>
            <DialogDescription>
              {razorpayEnabled
                ? "Review your plan details and proceed to payment."
                : "Review your plan details and send a request to the admin."}
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{selectedPlan.name}</p>
                    {selectedPlan.descriptions && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedPlan.descriptions}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {selectedPlan.durationInDays} days
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-1.5">
                  {hasDiscount && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground line-through">
                        ₹
                        {Number(selectedPlan.amount).toLocaleString("en-IN")}
                      </span>
                      <span className="text-muted-foreground">
                        Regular Price
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {razorpayEnabled ? "Plan Price" : "Amount"}
                    </span>
                    <span className="font-semibold">
                      ₹
                      {Number(
                        selectedPlan.offerPrice || selectedPlan.amount
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {!currentPlan.hasActivePlan &&
                    Number(registrationAmount) > 0 &&
                    razorpayEnabled && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Registration Fee
                        </span>
                        <span>
                          ₹
                          {Number(registrationAmount).toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}

                  <Separator />

                  <div className="flex items-center justify-between font-semibold">
                    <span>Total</span>
                    <span>
                      ₹
                      {(
                        Number(selectedPlan.offerPrice || selectedPlan.amount) +
                        (!currentPlan.hasActivePlan && razorpayEnabled
                          ? Number(registrationAmount)
                          : 0)
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {razorpayEnabled && (
                <p className="text-xs text-muted-foreground text-center">
                  You will be redirected to Razorpay to complete the payment
                  securely.
                </p>
              )}

              {!razorpayEnabled && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Note to Admin (Optional)
                  </label>
                  <Textarea
                    placeholder="Add a note for the admin about this request..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>

            {razorpayEnabled ? (
              <Button onClick={handlePayNow} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay Now
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleSendRequest} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Request
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
