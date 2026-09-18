"use server";

import { redirect } from "next/navigation";
import { eq, and, desc, asc } from "drizzle-orm";
import { clerkClient, auth } from "@clerk/nextjs/server";
import { db } from "@/app/index";
import { paymentsTable, plansTable, weightLogsTable, weightGoalsTable } from "@/app/db/schema";
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

export interface WeightDataPoint {
  date: string;
  weight: number;
}

export interface DashboardData {
  member: MemberData;
  plan: PlanData;
  daysUsed: number;
  planProgress: number;
  weightHistory: WeightDataPoint[];
  hasLoggedToday: boolean;
}

export interface Transaction {
  id: number;
  amount: string;
  paidAt: Date;
  paymentMethod: string;
  paymentGateway: string | null;
  gatewayPaymentId: string | null;
  gatewayOrderId: string | null;
  status: string;
  description: string | null;
  planName: string | null;
  planDurationDays: number | null;
  createdAt: Date;
}

export async function getMemberTransactions(): Promise<Transaction[]> {
  const user = await redirectByRole("", [UserRole.MEMBER]);
  if (!user) {
    redirect("/login");
  }
  const clerkId = user.id;

  const transactions = await db
    .select({
      id: paymentsTable.id,
      amount: paymentsTable.amount,
      paidAt: paymentsTable.paidAt,
      paymentMethod: paymentsTable.paymentMethod,
      paymentGateway: paymentsTable.paymentGateway,
      gatewayPaymentId: paymentsTable.gatewayPaymentId,
      gatewayOrderId: paymentsTable.gatewayOrderId,
      status: paymentsTable.status,
      description: paymentsTable.description,
      planName: plansTable.name,
      planDurationDays: paymentsTable.planDurationDays,
      createdAt: paymentsTable.createdAt,
    })
    .from(paymentsTable)
    .leftJoin(plansTable, eq(paymentsTable.planId, plansTable.id))
    .where(eq(paymentsTable.clerkId, clerkId))
    .orderBy(desc(paymentsTable.paidAt));

  return transactions;
}

export async function getDashboardData(): Promise<DashboardData> {
  const user = await redirectByRole("", [UserRole.MEMBER]);
  if (!user) {
    redirect("/login");
  }
  const clerkId = user.id;

  // Fetch height from Clerk private metadata
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(clerkId);
  const metadata = clerkUser.privateMetadata || {};
  const height = typeof metadata.height === "number" ? metadata.height : 0;

  // Fetch weight logs (newest first), weight goals, and payments in parallel
  const [weightLogs, goalRows, userPayments] = await Promise.all([
    db
      .select()
      .from(weightLogsTable)
      .where(eq(weightLogsTable.clerkId, clerkId))
      .orderBy(desc(weightLogsTable.loggedAt))
      .limit(30),

    db
      .select()
      .from(weightGoalsTable)
      .where(eq(weightGoalsTable.clerkId, clerkId))
      .orderBy(desc(weightGoalsTable.createdAt))
      .limit(1),

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
      .orderBy(asc(paymentsTable.paidAt)),
  ]);

  // --- Weight ---
  const currentWeight =
    weightLogs.length > 0 ? Number(weightLogs[0].weight) : 0;
  const targetWeight =
    goalRows.length > 0 ? Number(goalRows[0].targetWeight) : 0;

  const hasLoggedToday =
    weightLogs.length > 0 &&
    new Date(weightLogs[0].loggedAt).toDateString() === new Date().toDateString();

  const weightHistory: WeightDataPoint[] = [...weightLogs]
    .reverse()
    .map((log) => ({
      date: new Date(log.loggedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }),
      weight: Number(log.weight),
    }));

  // --- BMI ---
  const bmi =
    height > 0 && currentWeight > 0
      ? Number((currentWeight / Math.pow(height / 100, 2)).toFixed(1))
      : 0;

  // --- Plan ---
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

  const activePlanName =
    userPayments.length > 0
      ? userPayments[0].planName ?? "Custom Plan"
      : "No Active Plan";

  const member: MemberData = {
    name: user.firstName ?? "Member",
    age: 0,
    gender: "—",
    height,
    currentWeight,
    targetWeight,
    bmi,
    fitnessLevel: "—",
    goal: "—",
    workoutFrequency: "—",
  };

  const plan: PlanData = {
    name: activePlanName,
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

  return { member, plan, daysUsed, planProgress, weightHistory, hasLoggedToday };
}

export async function logWeight(
  weight: number
): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  if (!weight || weight <= 0) {
    return { error: "Please enter a valid weight." };
  }

  // Check if already logged today
  const today = new Date();
  const todayStr = today.toDateString();
  const [existing] = await db
    .select({ loggedAt: weightLogsTable.loggedAt })
    .from(weightLogsTable)
    .where(eq(weightLogsTable.clerkId, userId))
    .orderBy(desc(weightLogsTable.loggedAt))
    .limit(1);

  if (existing && new Date(existing.loggedAt).toDateString() === todayStr) {
    return { error: "You have already logged your weight today." };
  }

  await db.insert(weightLogsTable).values({
    clerkId: userId,
    weight: String(weight),
  });

  return {};
}
