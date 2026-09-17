"use client";

import * as React from "react";
import { toast } from "sonner";
import { CreditCard, AlertTriangle } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

import {
  fetchRazorpayEnabled,
  updateRazorpayEnabled,
} from "./actions";

export default function PaymentGatewayPage() {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [razorpayEnabled, setRazorpayEnabled] = React.useState(false);
  const [pendingValue, setPendingValue] = React.useState<boolean | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      try {
        const result = await fetchRazorpayEnabled();
        if (result.success && result.data) {
          setRazorpayEnabled(result.data.razorpayEnabled);
        } else {
          setError(result.error || "Failed to load payment gateway settings.");
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred."
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSwitchAttempt = (nextChecked: boolean) => {
    setPendingValue(nextChecked);
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (pendingValue === null) return;

    setDialogOpen(false);
    setSaving(true);

    try {
      const result = await updateRazorpayEnabled(pendingValue);
      if (result.success && result.data) {
        setRazorpayEnabled(result.data.razorpayEnabled);
        toast.success(
          result.data.razorpayEnabled
            ? "Razorpay e-Collect enabled"
            : "Razorpay e-Collect disabled"
        );
      } else {
        toast.error(result.error || "Failed to update settings");
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to update payment gateway settings"
      );
    } finally {
      setSaving(false);
      setPendingValue(null);
    }
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setPendingValue(null);
  };

  if (loading) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
          <Alert variant="destructive">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            Payment Gateway
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure online payment collection for your gym.
          </p>
        </div>

        <section className="rounded-md border">
          <div className="border-b p-6">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <h2 className="font-semibold">Razorpay e-Collect</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Enable online payment collection via Razorpay. Members will be
              able to pay for plans and registrations digitally.
            </p>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="razorpay-toggle" className="text-base">
                  Enable Razorpay e-Collect
                </Label>
                <p className="text-sm text-muted-foreground">
                  {razorpayEnabled
                    ? "Online payments are currently enabled."
                    : "Online payments are currently disabled."}
                </p>
              </div>
              <Switch
                id="razorpay-toggle"
                checked={razorpayEnabled}
                onCheckedChange={handleSwitchAttempt}
                disabled={saving}
              />
            </div>
          </div>
        </section>

        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogMedia>
                <AlertTriangle className="text-muted-foreground" />
              </AlertDialogMedia>
              <AlertDialogTitle>
                {pendingValue
                  ? "Enable Razorpay e-Collect?"
                  : "Disable Razorpay e-Collect?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {pendingValue
                  ? "Enabling this will allow members to make online payments through Razorpay. Ensure your Razorpay account is configured on the server before proceeding."
                  : "Disabling this will stop all online payment collection. Members will no longer be able to pay through Razorpay."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancel}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm}>
                {pendingValue ? "Enable" : "Disable"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>

        <div className="overflow-hidden rounded-md border">
          <div className="space-y-2 border-b p-6">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-4 w-56" />
              </div>
              <Skeleton className="h-5 w-11 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
