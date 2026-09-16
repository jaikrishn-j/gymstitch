"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Search, User, CreditCard, CheckCircle, ArrowLeft, Wrench } from "lucide-react"
import { searchUsers, createPayment } from "./actions"
import { usePaymentRefresh } from "./payment-context"
import { fetchGymSettings, type GymSettings } from "@/app/admin/gym/actions"
import { fetchPlans } from "@/app/admin/plans/action"
import { type Plan } from "@/app/admin/plans/columns"

type UserResult = {
  id: string
  name: string
  email: string
  phone: string
  plan: string
}

const PAYMENT_METHODS = ["Cash", "UPI", "Card", "Net Banking", "Other"]

export const AddPayment = () => {
  const refresh = usePaymentRefresh()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  // Step 1: User search
  const [userSearch, setUserSearch] = useState("")
  const [userResults, setUserResults] = useState<UserResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null)

  // Step 2: Plan selection
  const [plans, setPlans] = useState<Plan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [amount, setAmount] = useState("")
  const [amountManuallyEdited, setAmountManuallyEdited] = useState(false)

  // Step 2: Custom plan
  const [isCustomPlan, setIsCustomPlan] = useState(false)
  const [customDays, setCustomDays] = useState("")

  // Step 3: Payment details
  const [paymentMethod, setPaymentMethod] = useState("Cash")
  const [description, setDescription] = useState("")

  // Gym settings for registration amount
  const [gymSettings, setGymSettings] = useState<GymSettings | null>(null)

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check if user is new (no active plan)
  const isNewUser = selectedUser && (!selectedUser.plan || selectedUser.plan === "not activated")

  // Compute the auto-calculated amount (derived, not state)
  const computedAmount = (() => {
    if (!selectedPlan) return ""
    const planAmount = Number(selectedPlan.offerPrice || selectedPlan.amount)
    if (isNewUser) {
      const regAmount = Number(gymSettings?.registrationAmount || 0)
      return String(planAmount + regAmount)
    }
    return String(planAmount)
  })()

  // Auto-fill amount when plan changes (only if user hasn't manually edited)
  useEffect(() => {
    if (!amountManuallyEdited && computedAmount) {
      setAmount(computedAmount)
    }
  }, [computedAmount, amountManuallyEdited])

  const resetForm = useCallback(() => {
    setStep(1)
    setUserSearch("")
    setUserResults([])
    setSelectedUser(null)
    setPlans([])
    setSelectedPlan(null)
    setAmount("")
    setAmountManuallyEdited(false)
    setIsCustomPlan(false)
    setCustomDays("")
    setPaymentMethod("Cash")
    setDescription("")
    setGymSettings(null)
  }, [])

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      resetForm()
    }
  }, [resetForm])

  // Fetch gym settings and plans when dialog opens
  useEffect(() => {
    if (!open) return

    let cancelled = false

    fetchGymSettings().then((result) => {
      if (!cancelled && result.success && result.data) {
        setGymSettings(result.data)
      }
    })

    setLoadingPlans(true)
    fetchPlans({ page: 1, limit: 100 })
      .then((result) => {
        if (!cancelled && result.success && result.data) {
          setPlans(result.data.filter((p) => p.isAvailable))
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingPlans(false)
      })

    return () => {
      cancelled = true
    }
  }, [open])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const handleSearchChange = useCallback((value: string) => {
    setUserSearch(value)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (value.length < 2) {
      setUserResults([])
      return
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const result = await searchUsers(value)
        if (result.success && result.data) {
          setUserResults(result.data)
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to search users")
      } finally {
        setSearching(false)
      }
    }, 400)
  }, [])

  const handleSelectUser = (user: UserResult) => {
    setSelectedUser(user)
    setAmountManuallyEdited(false)
    setStep(2)
  }

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan)
    setIsCustomPlan(false)
    setCustomDays("")
    setAmountManuallyEdited(false)
  }

  const handleSelectCustomPlan = () => {
    setIsCustomPlan(true)
    setSelectedPlan(null)
    setAmount("")
    setAmountManuallyEdited(false)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value)
    setAmountManuallyEdited(true)
  }

  const handleNextToReview = () => {
    if (!isCustomPlan && !selectedPlan) {
      toast.error("Please select a plan")
      return
    }
    if (isCustomPlan && (!customDays || Number(customDays) <= 0)) {
      toast.error("Please enter a valid duration in days")
      return
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }
    setStep(3)
  }

  const handleSubmit = async () => {
    if (!selectedUser) return

    setLoading(true)
    try {
      await createPayment({
        clerkId: selectedUser.id,
        planId: isCustomPlan ? null : selectedPlan?.id ?? null,
        planDurationDays: isCustomPlan ? Number(customDays) : null,
        amount,
        paymentMethod,
        description: description || undefined,
      })
      toast.success("Payment recorded successfully")
      setOpen(false)
      refresh()
    } catch (err: any) {
      toast.error(err.message || "Failed to record payment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button>
            <span className="mr-1 text-base leading-none">+</span>
            Add Payment
          </Button>
        }
      />

      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>
            {step === 1 && "Select User"}
            {step === 2 && "Select Plan"}
            {step === 3 && "Review Payment"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Search for an existing user or proceed with a new user payment."}
            {step === 2 && "Choose a plan and confirm the payment amount."}
            {step === 3 && "Review the payment details before confirming."}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="px-6 py-3 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <StepIndicator number={1} label="User" active={step === 1} completed={step > 1} />
            <div className="h-px flex-1 bg-border" />
            <StepIndicator number={2} label="Plan" active={step === 2} completed={step > 2} />
            <div className="h-px flex-1 bg-border" />
            <StepIndicator number={3} label="Confirm" active={step === 3} completed={false} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">

          {/* Step 1: User Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={userSearch}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
              </div>

              {searching && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Searching...
                </p>
              )}

              {!searching && userResults.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {userResults.length} user{userResults.length !== 1 ? "s" : ""} found
                  </p>
                  <div className="space-y-1 max-h-[400px] overflow-y-auto">
                    {userResults.map((user) => {
                      const initials = user.name
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()

                      return (
                        <button
                          key={user.id}
                          onClick={() => handleSelectUser(user)}
                          className="w-full flex items-center gap-3 rounded-lg border p-3 text-left hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                            {initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{user.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {user.email}
                              {user.phone ? ` · ${user.phone}` : ""}
                            </p>
                          </div>
                          <div className="shrink-0">
                            {!user.plan || user.plan === "not activated" ? (
                              <Badge variant="outline" className="text-xs">New</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs font-normal">{user.plan}</Badge>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {!searching && userSearch.length >= 2 && userResults.length === 0 && (
                <div className="text-center py-8">
                  <User className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">No users found</p>
                  <p className="text-xs text-muted-foreground">
                    Try a different search term
                  </p>
                </div>
              )}

              {userSearch.length < 2 && (
                <div className="text-center py-8">
                  <User className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Type at least 2 characters to search for users
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Plan Selection */}
          {step === 2 && selectedUser && (
            <div className="space-y-4">
              {/* Selected user summary */}
              <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/30">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                  {selectedUser.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-sm">{selectedUser.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{selectedUser.email}</p>
                </div>
                {isNewUser && (
                  <Badge variant="outline" className="ml-auto text-xs">New User</Badge>
                )}
              </div>

              {isNewUser && gymSettings && Number(gymSettings.registrationAmount) > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Registration fee:</strong> ₹{Number(gymSettings.registrationAmount).toLocaleString("en-IN")} will be added for new user registration.
                  </p>
                </div>
              )}

              <Separator />

              <div className="space-y-3">
                <Label>Select Plan</Label>
                {loadingPlans ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Loading plans...</p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {plans.map((plan) => (
                      <button
                        key={plan.id}
                        onClick={() => handleSelectPlan(plan)}
                        className={`w-full rounded-lg border p-4 text-left transition-colors ${
                          !isCustomPlan && selectedPlan?.id === plan.id
                            ? "border-primary bg-primary/5"
                            : "hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{plan.name}</p>
                            {plan.descriptions && (
                              <p className="text-xs text-muted-foreground mt-1">{plan.descriptions}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">{plan.durationInDays} days</p>
                          </div>
                          <div className="text-right">
                            {plan.offerPrice && plan.offerPrice !== plan.amount ? (
                              <div>
                                <p className="text-sm line-through text-muted-foreground">
                                  ₹{Number(plan.amount).toLocaleString("en-IN")}
                                </p>
                                <p className="font-medium text-green-600">
                                  ₹{Number(plan.offerPrice).toLocaleString("en-IN")}
                                </p>
                              </div>
                            ) : (
                              <p className="font-medium">
                                ₹{Number(plan.amount).toLocaleString("en-IN")}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}

                    {/* Custom Plan option */}
                    <Separator />

                    <button
                      onClick={handleSelectCustomPlan}
                      className={`w-full rounded-lg border border-dashed p-4 text-left transition-colors ${
                        isCustomPlan
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/30 hover:border-muted-foreground/50 hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          isCustomPlan ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}>
                          <Wrench className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Custom Plan</p>
                          <p className="text-xs text-muted-foreground">
                            For exceptional cases — enter custom amount and duration
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Custom plan fields */}
              {isCustomPlan && (
                <>
                  <Separator />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="customAmount">Amount (₹)</Label>
                      <Input
                        id="customAmount"
                        type="number"
                        min="0"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customDays">Duration (days)</Label>
                      <Input
                        id="customDays"
                        type="number"
                        min="1"
                        value={customDays}
                        onChange={(e) => setCustomDays(e.target.value)}
                        placeholder="e.g. 30"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Regular plan amount field */}
              {!isCustomPlan && (
                <>
                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground">
                      {isNewUser && gymSettings && Number(gymSettings.registrationAmount) > 0
                        ? `Includes ₹${Number(gymSettings.registrationAmount).toLocaleString("en-IN")} registration fee`
                        : "Amount is editable and can be adjusted"}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Review & Confirm */}
          {step === 3 && selectedUser && (selectedPlan || isCustomPlan) && (
            <div className="space-y-4">
              {/* User info */}
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-muted-foreground">User</Label>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {selectedUser.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{selectedUser.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
              </div>

              {/* Payment breakdown */}
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-muted-foreground">Payment Details</Label>
                </div>

                {!isNewUser && selectedUser.plan && selectedUser.plan !== "not activated" && (
                  <div className="rounded-md bg-blue-50 p-2.5 dark:bg-blue-950">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      User has an active plan (<strong>{selectedUser.plan}</strong>). The new plan will start automatically when the current plan expires.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {isCustomPlan
                        ? `Custom Plan (${customDays} days)`
                        : selectedPlan
                          ? `${selectedPlan.name} (${selectedPlan.durationInDays} days)`
                          : ""}
                    </span>
                    <span>
                      ₹{Number(
                        isCustomPlan
                          ? amount
                          : selectedPlan
                            ? (selectedPlan.offerPrice || selectedPlan.amount)
                            : 0
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {isNewUser && gymSettings && Number(gymSettings.registrationAmount) > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Registration Fee</span>
                      <span>₹{Number(gymSettings.registrationAmount).toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between font-medium">
                    <span>Total</span>
                    <span>₹{Number(amount).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                        paymentMethod === method
                          ? "border-primary bg-primary text-primary-foreground"
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
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a note about this payment..."
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/40 gap-2 sm:gap-0">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}

          {step === 2 && (
            <Button onClick={handleNextToReview}>
              Review Payment
            </Button>
          )}

          {step === 3 && (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Recording..." : "Confirm Payment"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Step indicator sub-component
function StepIndicator({
  number,
  label,
  active,
  completed,
}: {
  number: number
  label: string
  active: boolean
  completed: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
          completed
            ? "bg-primary text-primary-foreground"
            : active
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
        }`}
      >
        {completed ? <CheckCircle className="h-3.5 w-3.5" /> : number}
      </div>
      <span className={`text-xs font-medium hidden sm:inline ${active ? "text-foreground" : "text-muted-foreground"}`}>
        {label}
      </span>
    </div>
  )
}

export default AddPayment
