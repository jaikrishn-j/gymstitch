"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Search,
  User,
  Wrench,
} from "lucide-react";

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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { searchUsers, createPayment } from "./actions";
import { usePaymentRefresh } from "./payment-context";
import {
  fetchGymSettings,
  type GymSettings,
} from "@/app/admin/gym/actions";
import { fetchPlans } from "@/app/admin/plans/action";
import { type Plan } from "@/app/admin/plans/columns";

type UserResult = {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: string;
};

const PAYMENT_METHODS = [
  "Cash",
  "UPI",
  "Card",
  "Net Banking",
  "Other",
];

export const AddPayment = () => {
  const refresh = usePaymentRefresh();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] =
    useState<UserResult | null>(null);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [amount, setAmount] = useState("");
  const [amountManuallyEdited, setAmountManuallyEdited] =
    useState(false);

  const [isCustomPlan, setIsCustomPlan] = useState(false);
  const [customDays, setCustomDays] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [description, setDescription] = useState("");

  const [gymSettings, setGymSettings] =
    useState<GymSettings | null>(null);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isNewUser =
    !!selectedUser &&
    (!selectedUser.plan || selectedUser.plan === "not activated");

  const computedAmount = (() => {
    if (!selectedPlan) return "";

    const planAmount = Number(
      selectedPlan.offerPrice || selectedPlan.amount,
    );

    if (isNewUser) {
      const registrationAmount = Number(
        gymSettings?.registrationAmount || 0,
      );

      return String(planAmount + registrationAmount);
    }

    return String(planAmount);
  })();

  useEffect(() => {
    if (!amountManuallyEdited && computedAmount) {
      setAmount(computedAmount);
    }
  }, [computedAmount, amountManuallyEdited]);

  const resetForm = useCallback(() => {
    setStep(1);
    setUserSearch("");
    setUserResults([]);
    setSelectedUser(null);
    setPlans([]);
    setSelectedPlan(null);
    setAmount("");
    setAmountManuallyEdited(false);
    setIsCustomPlan(false);
    setCustomDays("");
    setPaymentMethod("Cash");
    setDescription("");
    setGymSettings(null);
  }, []);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);

      if (!isOpen && !loading) {
        resetForm();
      }
    },
    [loading, resetForm],
  );

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    fetchGymSettings().then((result) => {
      if (!cancelled && result.success && result.data) {
        setGymSettings(result.data);
      }
    });

    setLoadingPlans(true);

    fetchPlans({ page: 1, limit: 100 })
      .then((result) => {
        if (!cancelled && result.success && result.data) {
          setPlans(result.data.filter((plan) => plan.isAvailable));
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Failed to load plans");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingPlans(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setUserSearch(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length < 2) {
      setUserResults([]);
      setSearching(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);

      try {
        const result = await searchUsers(value);

        if (result.success && result.data) {
          setUserResults(result.data);
        } else {
          setUserResults([]);
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to search users",
        );
      } finally {
        setSearching(false);
      }
    }, 400);
  }, []);

  const handleSelectUser = (user: UserResult) => {
    setSelectedUser(user);
    setAmountManuallyEdited(false);
    setStep(2);
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsCustomPlan(false);
    setCustomDays("");
    setAmountManuallyEdited(false);
  };

  const handleSelectCustomPlan = () => {
    setIsCustomPlan(true);
    setSelectedPlan(null);
    setAmount("");
    setAmountManuallyEdited(false);
  };

  const handleAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setAmount(event.target.value);
    setAmountManuallyEdited(true);
  };

  const handleNextToReview = () => {
    if (!isCustomPlan && !selectedPlan) {
      toast.error("Please select a plan");
      return;
    }

    if (
      isCustomPlan &&
      (!customDays || Number(customDays) <= 0)
    ) {
      toast.error("Please enter a valid duration in days");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setStep(3);
  };

  const handleSubmit = async () => {
    if (!selectedUser) return;

    setLoading(true);

    try {
      await createPayment({
        clerkId: selectedUser.id,
        planId: isCustomPlan ? null : selectedPlan?.id ?? null,
        planDurationDays: isCustomPlan
          ? Number(customDays)
          : null,
        amount,
        paymentMethod,
        description: description || undefined,
      });

      toast.success("Payment recorded successfully");

      setOpen(false);
      resetForm();
      refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to record payment",
      );
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button>+ Add Payment</Button>} />

      <DialogContent className="flex max-h-[calc(100vh-2rem)] flex-col sm:max-w-2xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {step === 1 && "Select User"}
            {step === 2 && "Select Plan"}
            {step === 3 && "Review Payment"}
          </DialogTitle>

          <DialogDescription>
            {step === 1 &&
              "Search for an existing user to record a payment."}
            {step === 2 &&
              "Choose a plan and confirm the payment amount."}
            {step === 3 &&
              "Review the payment details before confirming."}
          </DialogDescription>
        </DialogHeader>

        <div className="shrink-0 py-4">
          <div className="flex items-center gap-3">
            <StepIndicator
              number={1}
              label="User"
              active={step === 1}
              completed={step > 1}
            />

            <div className="h-px flex-1 bg-border" />

            <StepIndicator
              number={2}
              label="Plan"
              active={step === 2}
              completed={step > 2}
            />

            <div className="h-px flex-1 bg-border" />

            <StepIndicator
              number={3}
              label="Confirm"
              active={step === 3}
              completed={false}
            />
          </div>
        </div>

        <Separator />

        <div className="min-h-0 flex-1 overflow-y-auto py-6 pr-1">
          {step === 1 && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  placeholder="Search by name, email, or phone..."
                  value={userSearch}
                  onChange={(event) =>
                    handleSearchChange(event.target.value)
                  }
                  className="pl-9"
                  autoFocus
                />
              </div>

              {searching && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Searching...
                </p>
              )}

              {!searching && userResults.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {userResults.length} user
                    {userResults.length !== 1 ? "s" : ""} found
                  </p>

                  <div className="space-y-1">
                    {userResults.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        className="flex w-full items-center gap-3 border p-3 text-left transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                          {getInitials(user.name)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {user.name}
                          </p>

                          <p className="truncate text-xs text-muted-foreground">
                            {user.email}
                            {user.phone ? ` · ${user.phone}` : ""}
                          </p>
                        </div>

                        {!user.plan ||
                        user.plan === "not activated" ? (
                          <Badge
                            variant="outline"
                            className="shrink-0"
                          >
                            New
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="shrink-0 font-normal"
                          >
                            {user.plan}
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!searching &&
                userSearch.length >= 2 &&
                userResults.length === 0 && (
                  <div className="py-8 text-center">
                    <User className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium">
                      No users found
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Try a different search term
                    </p>
                  </div>
                )}

              {userSearch.length < 2 && (
                <div className="py-8 text-center">
                  <User className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Type at least 2 characters to search for users
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 2 && selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-y py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {getInitials(selectedUser.name)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {selectedUser.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {selectedUser.email}
                  </p>
                </div>

                {isNewUser && (
                  <Badge variant="outline">New User</Badge>
                )}
              </div>

              {isNewUser &&
                gymSettings &&
                Number(gymSettings.registrationAmount) > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Registration fee:{" "}
                    <span className="font-medium text-foreground">
                      ₹
                      {Number(
                        gymSettings.registrationAmount,
                      ).toLocaleString("en-IN")}
                    </span>{" "}
                    will be added to the first payment.
                  </div>
                )}

              <div className="space-y-3">
                <div>
                  <Label>Select Plan</Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Choose an available membership plan.
                  </p>
                </div>

                {loadingPlans ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Loading plans...
                  </p>
                ) : plans.length > 0 ? (
                  <div className="space-y-2">
                    {plans.map((plan) => {
                      const selected =
                        !isCustomPlan &&
                        selectedPlan?.id === plan.id;

                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => handleSelectPlan(plan)}
                          className={`w-full border p-4 text-left transition-colors ${
                            selected
                              ? "border-primary bg-accent"
                              : "hover:bg-accent hover:text-accent-foreground"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="font-medium">
                                {plan.name}
                              </p>

                              {plan.descriptions && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {plan.descriptions}
                                </p>
                              )}

                              <p className="mt-1 text-xs text-muted-foreground">
                                {plan.durationInDays} days
                              </p>
                            </div>

                            <div className="shrink-0 text-right">
                              {plan.offerPrice &&
                              plan.offerPrice !== plan.amount ? (
                                <>
                                  <p className="text-xs text-muted-foreground line-through">
                                    ₹
                                    {Number(
                                      plan.amount,
                                    ).toLocaleString("en-IN")}
                                  </p>
                                  <p className="font-medium">
                                    ₹
                                    {Number(
                                      plan.offerPrice,
                                    ).toLocaleString("en-IN")}
                                  </p>
                                </>
                              ) : (
                                <p className="font-medium">
                                  ₹
                                  {Number(
                                    plan.amount,
                                  ).toLocaleString("en-IN")}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="py-4 text-sm text-muted-foreground">
                    No available plans found.
                  </p>
                )}

                <Separator />

                <button
                  type="button"
                  onClick={handleSelectCustomPlan}
                  className={`flex w-full items-center gap-3 border border-dashed p-4 text-left transition-colors ${
                    isCustomPlan
                      ? "border-primary bg-accent"
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      Custom Plan
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Enter a custom amount and duration.
                    </p>
                  </div>
                </button>
              </div>

              {isCustomPlan && (
                <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="custom-amount">
                      Amount (₹)
                    </Label>
                    <Input
                      id="custom-amount"
                      type="number"
                      min="0"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-days">
                      Duration (days)
                    </Label>
                    <Input
                      id="custom-days"
                      type="number"
                      min="1"
                      value={customDays}
                      onChange={(event) =>
                        setCustomDays(event.target.value)
                      }
                      placeholder="30"
                    />
                  </div>
                </div>
              )}

              {!isCustomPlan && selectedPlan && (
                <div className="space-y-2 border-t pt-4">
                  <Label htmlFor="payment-amount">
                    Amount (₹)
                  </Label>

                  <Input
                    id="payment-amount"
                    type="number"
                    min="0"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0"
                  />

                  <p className="text-xs text-muted-foreground">
                    {isNewUser &&
                    gymSettings &&
                    Number(gymSettings.registrationAmount) > 0
                      ? `Includes ₹${Number(
                          gymSettings.registrationAmount,
                        ).toLocaleString("en-IN")} registration fee`
                      : "Amount is editable and can be adjusted."}
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 3 &&
            selectedUser &&
            (selectedPlan || isCustomPlan) && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <Label>Member</Label>
                  </div>

                  <div className="flex items-center gap-3 border-y py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {getInitials(selectedUser.name)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {selectedUser.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {selectedUser.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <Label>Payment Details</Label>
                  </div>

                  {!isNewUser &&
                    selectedUser.plan &&
                    selectedUser.plan !== "not activated" && (
                      <p className="text-xs text-muted-foreground">
                        Current plan:{" "}
                        <span className="font-medium text-foreground">
                          {selectedUser.plan}
                        </span>
                        . The new plan will start when the current
                        plan expires.
                      </p>
                    )}

                  <div className="space-y-2 border-y py-4">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span>
                        {isCustomPlan
                          ? `Custom Plan (${customDays} days)`
                          : selectedPlan
                            ? `${selectedPlan.name} (${selectedPlan.durationInDays} days)`
                            : ""}
                      </span>

                      <span>
                        ₹
                        {Number(
                          isCustomPlan
                            ? amount
                            : selectedPlan
                              ? selectedPlan.offerPrice ||
                                selectedPlan.amount
                              : 0,
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>

                    {isNewUser &&
                      gymSettings &&
                      Number(gymSettings.registrationAmount) >
                        0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span>Registration Fee</span>
                          <span>
                            ₹
                            {Number(
                              gymSettings.registrationAmount,
                            ).toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}

                    <Separator />

                    <div className="flex items-center justify-between font-medium">
                      <span>Total</span>
                      <span>
                        ₹{Number(amount).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Payment Method</Label>

                  <div className="flex flex-wrap gap-2">
                    {PAYMENT_METHODS.map((method) => {
                      const selected = paymentMethod === method;

                      return (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`border px-3 py-1.5 text-sm font-medium transition-colors ${
                            selected
                              ? "border-primary bg-accent text-accent-foreground"
                              : "hover:bg-accent hover:text-accent-foreground"
                          }`}
                        >
                          {method}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description (Optional)
                  </Label>

                  <Input
                    id="description"
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    placeholder="Add a note about this payment..."
                  />
                </div>
              </div>
            )}
        </div>

        <DialogFooter className="shrink-0 border-t pt-4">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((current) => current - 1)}
              disabled={loading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}

          {step === 2 && (
            <Button
              type="button"
              onClick={handleNextToReview}
            >
              Review Payment
            </Button>
          )}

          {step === 3 && (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Recording..." : "Confirm Payment"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

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
          active
            ? "text-foreground"
            : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

export default AddPayment;