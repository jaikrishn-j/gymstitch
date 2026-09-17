import React from "react";
import { ArrowLeft, CreditCard } from "lucide-react";
import Link from "next/link";

import { getPlanPageData } from "./actions";
import { PlanSelection } from "./plan-selection";

export default async function PlanPage() {
  const data = await getPlanPageData();

  return (
    <main className="w-full min-h-screen bg-background pb-12">
      <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  My Plan
                </h1>
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Browse available plans and manage your membership.
              </p>
            </div>
          </div>
        </div>

        {/* Plan Selection */}
        <PlanSelection
          currentPlan={data.currentPlan}
          availablePlans={data.availablePlans}
          razorpayEnabled={data.razorpayEnabled}
          registrationAmount={data.registrationAmount}
          hasPendingRequest={data.hasPendingRequest}
        />
      </div>
    </main>
  );
}
