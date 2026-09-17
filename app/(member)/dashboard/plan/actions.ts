"use server";

import { redirect } from "next/navigation";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/app/index";
import {
  paymentsTable,
  plansTable,
  gymSettingsTable,
  paymentRequestsTable,
} from "@/app/db/schema";
import { redirectByRole } from "@/utils/userRole";
import { UserRole } from "@/types";

export interface PlanBreakdownItem {
  name: string;
  durationDays: number;
  paidAt: string;
}

export interface CurrentPlanInfo {
  name: string;
  startedAt: string;
  expiresAt: string;
  totalDays: number;
  daysRemaining: number;
  daysUsed: number;
  planProgress: number;
  planBreakdown: PlanBreakdownItem[];
  hasActivePlan: boolean;
}

export interface AvailablePlan {
  id: number;
  name: string;
  descriptions: string | null;
  amount: string;
  offerPrice: string | null;
  includedFeatures: string[];
  durationInDays: number;
}

export interface PlanPageData {
  currentPlan: CurrentPlanInfo;
  availablePlans: AvailablePlan[];
  razorpayEnabled: boolean;
  registrationAmount: string;
  hasPendingRequest: boolean;
}

export async function getPlanPageData(): Promise<PlanPageData> {
  const user = await redirectByRole("", [UserRole.MEMBER]);
  if (!user) {
    redirect("/login");
  }
  const clerkId = user.id;

  const [gymSettings, availablePlans, userPayments, pendingRequests] =
    await Promise.all([
      db
        .select({
          razorpayEnabled: gymSettingsTable.razorpayEnabled,
          registrationAmount: gymSettingsTable.registrationAmount,
        })
        .from(gymSettingsTable)
        .limit(1),

      db
        .select()
        .from(plansTable)
        .where(eq(plansTable.isAvailable, true))
        .orderBy(plansTable.createdAt),

      db
        .select({
          paymentId: paymentsTable.id,
          planId: paymentsTable.planId,
          planDurationDays: paymentsTable.planDurationDays,
          paidAt: paymentsTable.paidAt,
          status: paymentsTable.status,
          planName: plansTable.name,
          planDurationInDays: plansTable.durationInDays,
        })
        .from(paymentsTable)
        .leftJoin(plansTable, eq(paymentsTable.planId, plansTable.id))
        .where(
          and(
            eq(paymentsTable.clerkId, clerkId),
            eq(paymentsTable.status, "SUCCESS")
          )
        )
        .orderBy(desc(paymentsTable.paidAt)),

      db
        .select({ id: paymentRequestsTable.id })
        .from(paymentRequestsTable)
        .where(
          and(
            eq(paymentRequestsTable.clerkId, clerkId),
            eq(paymentRequestsTable.status, "PENDING")
          )
        )
        .limit(1),
    ]);

  const settings = gymSettings[0];
  const durations = userPayments.map((p) =>
    p.planDurationDays ?? p.planDurationInDays ?? 0
  );
  const totalDays = durations.reduce((sum, d) => sum + d, 0);

  const paidDates = userPayments
    .map((p) => new Date(p.paidAt))
    .filter((d) => !isNaN(d.getTime()));
  const startDate = paidDates.length
    ? new Date(Math.min(...paidDates.map((d) => d.getTime())))
    : new Date();

  const expiryDate = new Date(startDate);
  expiryDate.setDate(expiryDate.getDate() + totalDays);

  const today = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUsed = Math.max(
    0,
    Math.floor((today.getTime() - startDate.getTime()) / msPerDay)
  );
  const daysRemaining = Math.max(0, totalDays - daysUsed);
  const planProgress =
    totalDays > 0 ? Math.round((daysUsed / totalDays) * 100) : 0;

  const currentPlan: CurrentPlanInfo = {
    name:
      userPayments.length > 0
        ? userPayments[0].planName ?? "Custom Plan"
        : "No Active Plan",
    startedAt: startDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    expiresAt: expiryDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    totalDays,
    daysRemaining,
    daysUsed,
    planProgress,
    hasActivePlan: totalDays > 0,
    planBreakdown: userPayments.map((p, i) => ({
      name: p.planName ?? "Custom Plan",
      durationDays: durations[i],
      paidAt: new Date(p.paidAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    })),
  };

  return {
    currentPlan,
    availablePlans: availablePlans.map((p) => ({
      id: p.id,
      name: p.name,
      descriptions: p.descriptions,
      amount: p.amount,
      offerPrice: p.offerPrice,
      includedFeatures: p.includedFeatures,
      durationInDays: p.durationInDays,
    })),
    razorpayEnabled: settings?.razorpayEnabled ?? false,
    registrationAmount: settings?.registrationAmount ?? "0",
    hasPendingRequest: pendingRequests.length > 0,
  };
}

export async function createPaymentRequest(data: {
  planId: number;
  amount: string;
  description?: string;
}): Promise<{ success: boolean; error?: string }> {
  const user = await redirectByRole("", [UserRole.MEMBER]);
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }
  const clerkId = user.id;

  const existingPending = await db
    .select({ id: paymentRequestsTable.id })
    .from(paymentRequestsTable)
    .where(
      and(
        eq(paymentRequestsTable.clerkId, clerkId),
        eq(paymentRequestsTable.status, "PENDING")
      )
    )
    .limit(1);

  if (existingPending.length > 0) {
    return {
      success: false,
      error: "You already have a pending payment request. Please wait for it to be processed.",
    };
  }

  const plan = await db
    .select({ id: plansTable.id, name: plansTable.name })
    .from(plansTable)
    .where(eq(plansTable.id, data.planId))
    .limit(1);

  if (plan.length === 0) {
    return { success: false, error: "Plan not found" };
  }

  await db.insert(paymentRequestsTable).values({
    clerkId,
    planId: data.planId,
    amount: data.amount,
    description: data.description || null,
    status: "PENDING",
  });

  return { success: true };
}
