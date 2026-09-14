import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { eq, sql, ilike, and, SQL, desc } from "drizzle-orm";
import { db } from "@/app/index";
import { paymentsTable, plansTable } from "@/app/db/schema";
import { checkUserRole } from "@/utils/userRole";
import { PermissionModule } from "@/types/permissions";
import { UserRole } from "@/types";

// GET /api/payments?page=1&limit=10&search=...
export async function GET(request: NextRequest) {
  try {
    const hasPermission = await checkUserRole(PermissionModule.MEMBERS, "read");
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      return NextResponse.json(
        { success: false, error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    // Fetch all payments with plan info
    const conditions: SQL[] = [];

    if (search) {
      // We'll do a two-phase approach: search by payment ID, description,
      // or fetch matching clerkIds from Clerk users first
      const clerk = await clerkClient();

      // Search Clerk users by name/email/phone
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

      const lowerSearch = search.toLowerCase();
      const matchingClerkIds = allUsers
        .filter((user) => {
          const name =
            [user.firstName, user.lastName].filter(Boolean).join(" ") || "";
          const email = user.emailAddresses[0]?.emailAddress ?? "";
          const phone = (user.privateMetadata?.phone as string) || "";
          return (
            name.toLowerCase().includes(lowerSearch) ||
            email.toLowerCase().includes(lowerSearch) ||
            phone.toLowerCase().includes(lowerSearch)
          );
        })
        .map((user) => user.id);

      if (matchingClerkIds.length > 0) {
        conditions.push(
          sql`${paymentsTable.clerkId} IN (${sql.join(
            matchingClerkIds.map((id: string) => sql`${id}`),
            sql`, `
          )})`
        );
      } else {
        // Also try matching by description
        conditions.push(
          ilike(paymentsTable.description, `%${search}%`)
        );
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (page - 1) * limit;

    const [countResult, payments] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(paymentsTable)
        .where(whereClause),
      db
        .select({
          id: paymentsTable.id,
          clerkId: paymentsTable.clerkId,
          planId: paymentsTable.planId,
          amount: paymentsTable.amount,
          paidAt: paymentsTable.paidAt,
          paymentMethod: paymentsTable.paymentMethod,
          status: paymentsTable.status,
          description: paymentsTable.description,
          createdAt: paymentsTable.createdAt,
          planName: plansTable.name,
        })
        .from(paymentsTable)
        .leftJoin(plansTable, eq(paymentsTable.planId, plansTable.id))
        .where(whereClause)
        .orderBy(desc(paymentsTable.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    const total = Number(countResult[0]?.count ?? 0);

    // Enrich with user info from Clerk
    const clerk = await clerkClient();
    const enrichedPayments = await Promise.all(
      payments.map(async (payment) => {
        try {
          const user = await clerk.users.getUser(payment.clerkId);
          return {
            ...payment,
            userName:
              [user.firstName, user.lastName].filter(Boolean).join(" ") ||
              "Unknown",
            userEmail: user.emailAddresses[0]?.emailAddress ?? "",
            userPhone:
              (user.privateMetadata?.phone as string) || "",
          };
        } catch {
          return {
            ...payment,
            userName: "Unknown User",
            userEmail: "",
            userPhone: "",
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedPayments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/payments error", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

// POST /api/payments – create a new payment
export async function POST(request: NextRequest) {
  try {
    const hasPermission = await checkUserRole(PermissionModule.MEMBERS, "full");
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const clerkId = typeof body.clerkId === "string" ? body.clerkId.trim() : "";
    const planId =
      typeof body.planId === "number" ? body.planId : null;
    const planDurationDays =
      typeof body.planDurationDays === "number" && body.planDurationDays > 0
        ? body.planDurationDays
        : null;
    const amount = typeof body.amount === "string" ? body.amount.trim() : "";
    const paymentMethod =
      typeof body.paymentMethod === "string"
        ? body.paymentMethod.trim()
        : "";
    const description =
      typeof body.description === "string" ? body.description.trim() || null : null;

    if (!clerkId || !amount || !paymentMethod) {
      return NextResponse.json(
        {
          success: false,
          error: "Clerk ID, amount, and payment method are required",
        },
        { status: 400 }
      );
    }

    // Insert payment record
    const [newPayment] = await db
      .insert(paymentsTable)
      .values({
        clerkId,
        planId: planId ?? undefined,
        planDurationDays: planDurationDays ?? undefined,
        amount,
        paymentMethod,
        description,
        status: "SUCCESS",
      })
      .returning();

    // If a plan was selected (regular or custom), update Clerk metadata with plan stacking
    const durationDays = (() => {
      // Custom plan: use the provided duration
      if (!planId && planDurationDays) return planDurationDays;
      // Regular plan: we need to look up duration from DB
      return null; // resolved below
    })();

    let resolvedDuration = durationDays;
    let planName = "Custom Plan";

    if (planId) {
      // Regular plan: fetch name and duration
      const plan = await db
        .select({ name: plansTable.name, durationInDays: plansTable.durationInDays })
        .from(plansTable)
        .where(eq(plansTable.id, planId))
        .limit(1);
      if (plan.length > 0) {
        resolvedDuration = plan[0].durationInDays;
        planName = plan[0].name;
      }
    }

    if (resolvedDuration) {
      try {
        const clerk = await clerkClient();
        const existingUser = await clerk.users.getUser(clerkId);
        const meta = existingUser.privateMetadata || {};

        const now = new Date();
        const newPlanEndDate = new Date(now.getTime() + resolvedDuration * 24 * 60 * 60 * 1000);

        const currentEndDate = meta.currentPlanEndDate
          ? new Date(meta.currentPlanEndDate as string)
          : null;
        const isCurrentActive = currentEndDate && currentEndDate > now;

        let updatedMeta: Record<string, any> = { ...meta };

        if (isCurrentActive) {
          // Plan stacking: queue the new plan to start after current expires
          updatedMeta.nextPlan = planName;
          updatedMeta.nextPlanEndDate = newPlanEndDate.toISOString();
        } else {
          // No active plan: start immediately
          updatedMeta.currentPlan = planName;
          updatedMeta.currentPlanEndDate = newPlanEndDate.toISOString();
          // Clear any queued plan
          delete updatedMeta.nextPlan;
          delete updatedMeta.nextPlanEndDate;
        }

        await clerk.users.updateUser(clerkId, {
          privateMetadata: updatedMeta,
        });
      } catch (err) {
        console.error("Failed to update member plan in Clerk:", err);
      }
    }

    return NextResponse.json(
      { success: true, data: newPayment },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/payments error", error);
    return NextResponse.json(
      { success: false, error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
