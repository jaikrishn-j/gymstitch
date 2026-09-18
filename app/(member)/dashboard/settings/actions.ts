"use server";

import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/app/index";
import { weightLogsTable, weightGoalsTable } from "@/app/db/schema";

export interface WeightGoalData {
  currentWeight: number;
  targetWeight: number;
  weightDiff: number;
  recentLogs: { date: string; weight: number }[];
}

export async function getWeightGoal(): Promise<WeightGoalData> {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const [weightLogs, goalRows] = await Promise.all([
    db
      .select()
      .from(weightLogsTable)
      .where(eq(weightLogsTable.clerkId, userId))
      .orderBy(desc(weightLogsTable.loggedAt))
      .limit(30),

    db
      .select()
      .from(weightGoalsTable)
      .where(eq(weightGoalsTable.clerkId, userId))
      .orderBy(desc(weightGoalsTable.createdAt))
      .limit(1),
  ]);

  const currentWeight =
    weightLogs.length > 0 ? Number(weightLogs[0].weight) : 0;
  const targetWeight =
    goalRows.length > 0 ? Number(goalRows[0].targetWeight) : 0;
  const weightDiff =
    currentWeight > 0 && targetWeight > 0
      ? Number((currentWeight - targetWeight).toFixed(1))
      : 0;

  const recentLogs = [...weightLogs].reverse().map((log) => ({
    date: new Date(log.loggedAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    weight: Number(log.weight),
  }));

  return { currentWeight, targetWeight, weightDiff, recentLogs };
}

export async function setWeightGoal(
  targetWeight: number
): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  if (!targetWeight || targetWeight <= 0) {
    return { error: "Please enter a valid target weight." };
  }

  await db.insert(weightGoalsTable).values({
    clerkId: userId,
    targetWeight: String(targetWeight),
  });

  return {};
}
