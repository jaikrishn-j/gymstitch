import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";
import { db } from "@/app/index";
import { paymentsTable, plansTable } from "@/app/db/schema";
import { eq } from "drizzle-orm";

// GET /api/dashboard — aggregated stats for dashboard cards + recent payments
export async function GET() {
  try {
    // 1. Fetch all Clerk members
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

    const totalMembers = members.length;

    const now = new Date();
    const activePlanMembers = members.filter((user) => {
      const endDate = user.privateMetadata?.currentPlanEndDate;
      if (!endDate) return false;
      return new Date(endDate as string) > now;
    }).length;

    // 2. Payment stats from DB
    const [totalPaymentsResult, totalRevenueResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(paymentsTable),
      db
        .select({
          total: sql<string>`coalesce(sum(${paymentsTable.amount}::numeric), 0)`,
        })
        .from(paymentsTable),
    ]);

    const totalPayments = Number(totalPaymentsResult[0]?.count ?? 0);
    const totalRevenue = Number(totalRevenueResult[0]?.total ?? 0);

    // 3. Active plans count from DB
    const [activePlansResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(plansTable)
      .where(eq(plansTable.isAvailable, true));

    const totalPlans = Number(activePlansResult?.count ?? 0);

    // 4. Recent 5 payments with plan and user enrichment
    const recentPayments = await db
      .select({
        id: paymentsTable.id,
        clerkId: paymentsTable.clerkId,
        amount: paymentsTable.amount,
        paidAt: paymentsTable.paidAt,
        paymentMethod: paymentsTable.paymentMethod,
        status: paymentsTable.status,
        planName: plansTable.name,
      })
      .from(paymentsTable)
      .leftJoin(plansTable, eq(paymentsTable.planId, plansTable.id))
      .orderBy(sql`${paymentsTable.createdAt} DESC`)
      .limit(5);

    // Enrich recent payments with user names
    const enrichedRecent = await Promise.all(
      recentPayments.map(async (payment) => {
        try {
          const user = await clerk.users.getUser(payment.clerkId);
          return {
            ...payment,
            userName:
              [user.firstName, user.lastName].filter(Boolean).join(" ") ||
              "Unknown",
            userEmail: user.emailAddresses[0]?.emailAddress ?? "",
          };
        } catch {
          return {
            ...payment,
            userName: "Unknown User",
            userEmail: "",
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        totalMembers,
        activePlanMembers,
        totalRevenue,
        totalPayments,
        totalPlans,
        recentPayments: enrichedRecent,
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard error", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
