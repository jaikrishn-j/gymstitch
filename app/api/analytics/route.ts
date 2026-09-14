import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";
import { db } from "@/app/index";
import { paymentsTable } from "@/app/db/schema";

// GET /api/analytics — time-series data for charts
export async function GET() {
  try {
    // 1. Revenue by month (last 12 months)
    const revenueByMonth = await db
      .select({
        month: sql<string>`to_char(${paymentsTable.paidAt}, 'YYYY-MM')`,
        revenue: sql<string>`coalesce(sum(${paymentsTable.amount}::numeric), 0)`,
        count: sql<number>`count(*)`,
      })
      .from(paymentsTable)
      .where(
        sql`${paymentsTable.paidAt} >= now() - interval '12 months'`
      )
      .groupBy(sql`to_char(${paymentsTable.paidAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${paymentsTable.paidAt}, 'YYYY-MM')`);

    // 2. Payments by method
    const paymentsByMethod = await db
      .select({
        method: paymentsTable.paymentMethod,
        count: sql<number>`count(*)`,
        total: sql<string>`coalesce(sum(${paymentsTable.amount}::numeric), 0)`,
      })
      .from(paymentsTable)
      .groupBy(paymentsTable.paymentMethod)
      .orderBy(sql`count(*) DESC`);

    // 3. Members by plan (from Clerk metadata)
    const clerk = await clerkClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allUsers: any[] = [];
    let offset = 0;
    const batchSize = 100;

    while (true) {
      const batch = await clerk.users.getUserList({
        limit: batchSize,
        offset,
      });
      if (batch.data.length === 0) break;
      allUsers.push(...batch.data);
      offset += batchSize;
      if (batch.data.length < batchSize) break;
    }

    const members = allUsers.filter(
      (user) => user.privateMetadata?.role === "member"
    );

    const now = new Date();
    const planCounts: Record<string, number> = {};

    members.forEach((user) => {
      const plan = (user.privateMetadata?.currentPlan as string) || "not activated";
      const endDate = user.privateMetadata?.currentPlanEndDate;
      const isActive = endDate && new Date(endDate as string) > now;

      if (isActive) {
        planCounts[plan] = (planCounts[plan] || 0) + 1;
      } else {
        planCounts["Expired / No Plan"] = (planCounts["Expired / No Plan"] || 0) + 1;
      }
    });

    const membersByPlan = Object.entries(planCounts)
      .map(([plan, count]) => ({ plan, count }))
      .sort((a, b) => b.count - a.count);

    // 4. Payment status breakdown
    const paymentStatus = await db
      .select({
        status: paymentsTable.status,
        count: sql<number>`count(*)`,
      })
      .from(paymentsTable)
      .groupBy(paymentsTable.status)
      .orderBy(sql`count(*) DESC`);

    return NextResponse.json({
      success: true,
      data: {
        revenueByMonth: revenueByMonth.map((row) => ({
          month: row.month,
          revenue: Number(row.revenue),
          count: Number(row.count),
        })),
        paymentsByMethod: paymentsByMethod.map((row) => ({
          method: row.method,
          count: Number(row.count),
          total: Number(row.total),
        })),
        membersByPlan,
        paymentStatus: paymentStatus.map((row) => ({
          status: row.status,
          count: Number(row.count),
        })),
      },
    });
  } catch (error) {
    console.error("GET /api/analytics error", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
