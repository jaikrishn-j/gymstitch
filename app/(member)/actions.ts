// app/dashboard/actions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { and, asc, desc, eq } from "drizzle-orm";

import { db } from "@/app/index";
import {
  paymentsTable,
  plansTable,
  weightGoalsTable,
  weightLogsTable,
} from "@/app/db/schema";

/* =========================================================
   CONSTANTS / HELPERS
   ========================================================= */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function toNumber(value: string | number | null | undefined, fallback = 0) {
  if (value === null || value === undefined) return fallback;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** "12 Sep 2025" */
function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

/** "Sep 12" — used for the weight chart x-axis */
function formatShortDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
  }).format(new Date(date));
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

/* =========================================================
   DASHBOARD DATA
   ========================================================= */

export async function getDashboardData() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [weightLogs, goalRows, paymentRows] = await Promise.all([
    // Latest weight logs (newest first)
    db
      .select()
      .from(weightLogsTable)
      .where(eq(weightLogsTable.clerkId, userId))
      .orderBy(desc(weightLogsTable.loggedAt))
      .limit(30),

    // Active weight goal
    db
      .select()
      .from(weightGoalsTable)
      .where(eq(weightGoalsTable.clerkId, userId))
      .orderBy(desc(weightGoalsTable.createdAt))
      .limit(1),

    // All successful payments joined to their plan (if any)
    db
      .select({
        id: paymentsTable.id,
        planId: paymentsTable.planId,
        planDurationDays: paymentsTable.planDurationDays,
        paidAt: paymentsTable.paidAt,
        status: paymentsTable.status,
        planName: plansTable.name,
        planDuration: plansTable.durationInDays,
      })
      .from(paymentsTable)
      .leftJoin(plansTable, eq(paymentsTable.planId, plansTable.id))
      .where(
        and(
          eq(paymentsTable.clerkId, userId),
          eq(paymentsTable.status, "SUCCESS")
        )
      )
      .orderBy(asc(paymentsTable.paidAt)),
  ]);

  /* -------------------------------------------------------
     WEIGHT
     ------------------------------------------------------- */

  const chronologicalLogs = [...weightLogs].reverse();

  const weightHistory = chronologicalLogs.map((log) => ({
    date: formatShortDate(log.loggedAt),
    weight: toNumber(log.weight),
  }));

  const currentWeight =
    weightLogs.length > 0 ? toNumber(weightLogs[0].weight) : 0;

  const targetWeight =
    goalRows.length > 0 ? toNumber(goalRows[0].targetWeight) : 0;

  /* -------------------------------------------------------
     PLAN (derived from successful payments)
     ------------------------------------------------------- */

  // A payment contributes days either from its custom duration
  // (planDurationDays) or from the linked plan's durationInDays.
  const validPayments = paymentRows.filter(
    (p) => (p.planDurationDays ?? p.planDuration ?? 0) > 0
  );

  const planBreakdown = validPayments.map((p) => ({
    name: p.planName ?? "Custom Plan",
    paidAt: formatDate(p.paidAt),
    durationDays: p.planDurationDays ?? p.planDuration ?? 0,
  }));

  const totalDays = planBreakdown.reduce(
    (sum, p) => sum + p.durationDays,
    0
  );

  const startedAtDate = validPayments[0]?.paidAt
    ? new Date(validPayments[0].paidAt)
    : null;

  const expiresAtDate = startedAtDate ? addDays(startedAtDate, totalDays) : null;

  const now = new Date();

  const daysRemaining =
    expiresAtDate && expiresAtDate.getTime() > now.getTime()
      ? Math.max(
          0,
          Math.ceil((expiresAtDate.getTime() - now.getTime()) / MS_PER_DAY)
        )
      : 0;

  const daysUsed = Math.max(
    0,
    Math.min(totalDays, totalDays - daysRemaining)
  );

  const planProgress =
    totalDays > 0 ? Math.round((daysUsed / totalDays) * 100) : 0;

  const activePlanName =
    planBreakdown.length > 0
      ? planBreakdown[planBreakdown.length - 1].name
      : "Membership";

  /* -------------------------------------------------------
     PROFILE FIELDS
     -------------------------------------------------------
     height / age / gender / fitnessLevel / goal /
     workoutFrequency are NOT part of the current DB schema.
     Add a `member_profiles` table and join it here to make
     these real. Everything else below is DB-driven.
     ------------------------------------------------------- */

  const height = 0; // cm — replace with profile value

  const bmi =
    height > 0
      ? Number((currentWeight / Math.pow(height / 100, 2)).toFixed(1))
      : 0;

  return {
    member: {
      name: userId, // swap for Clerk full name / profile name
      currentWeight,
      targetWeight,
      height,
      bmi,
      age: 0,
      gender: "—",
      fitnessLevel: "—",
      goal: "—",
      workoutFrequency: "—",
    },
    plan: {
      name: activePlanName,
      startedAt: formatDate(startedAtDate),
      expiresAt: formatDate(expiresAtDate),
      daysRemaining,
      totalDays,
      planBreakdown,
    },
    daysUsed,
    planProgress,
    weightHistory,
  };
}