"use server";

import { redirect } from "next/navigation";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/app/index";
import { paymentsTable, plansTable } from "@/app/db/schema";
import { redirectByRole } from "@/utils/userRole";
import { UserRole } from "@/types";

export interface PlanBreakdownItem {
  name: string;
  durationDays: number;
  paidAt: string;
}

export interface PlanData {
  name: string;
  startedAt: string;
  expiresAt: string;
  totalDays: number;
  daysRemaining: number;
  planBreakdown: PlanBreakdownItem[];
}

export interface MemberData {
  name: string;
  age: number;
  gender: string;
  height: number;
  currentWeight: number;
  targetWeight: number;
  bmi: number;
  fitnessLevel: string;
  goal: string;
  workoutFrequency: string;
}

export interface DashboardData {
  member: MemberData;
  plan: PlanData;
  daysUsed: number;
  planProgress: number;
}

export async function getDashboardData(): Promise<DashboardData> {
  const user = await redirectByRole("", [UserRole.MEMBER]);
  if (!user) {
    redirect("/login");
  }
  const clerkId = user.id;

  const userPayments = await db
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
    .orderBy(desc(paymentsTable.paidAt));

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
  const planProgress = totalDays > 0 ? Math.round((daysUsed / totalDays) * 100) : 0;

  const member: MemberData = {
    name: user.firstName ?? "Member",
    age: 24,
    gender: "Male",
    height: 178,
    currentWeight: 72.4,
    targetWeight: 68,
    bmi: 22.8,
    fitnessLevel: "Intermediate",
    goal: "Weight Loss",
    workoutFrequency: "4 days / week",
  };

  const plan: PlanData = {
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

  return { member, plan, daysUsed, planProgress };
}
