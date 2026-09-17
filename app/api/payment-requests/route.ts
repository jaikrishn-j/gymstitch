import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/app/index";
import {
  paymentRequestsTable,
  plansTable,
} from "@/app/db/schema";
import { checkUserType } from "@/utils/userRole";
import { UserRole } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const user = await checkUserType([UserRole.MEMBER]);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const planId =
      typeof body.planId === "number" ? body.planId : null;
    const description =
      typeof body.description === "string"
        ? body.description.trim() || null
        : null;

    if (!planId) {
      return NextResponse.json(
        { success: false, error: "Plan ID is required" },
        { status: 400 }
      );
    }

    const [plan] = await db
      .select({
        id: plansTable.id,
        name: plansTable.name,
        offerPrice: plansTable.offerPrice,
        amount: plansTable.amount,
        isAvailable: plansTable.isAvailable,
      })
      .from(plansTable)
      .where(eq(plansTable.id, planId))
      .limit(1);

    if (!plan) {
      return NextResponse.json(
        { success: false, error: "Plan not found" },
        { status: 404 }
      );
    }

    if (!plan.isAvailable) {
      return NextResponse.json(
        { success: false, error: "This plan is no longer available" },
        { status: 400 }
      );
    }

    const [existingPending] = await db
      .select({ id: paymentRequestsTable.id })
      .from(paymentRequestsTable)
      .where(
        and(
          eq(paymentRequestsTable.clerkId, user.id),
          eq(paymentRequestsTable.status, "PENDING")
        )
      )
      .limit(1);

    if (existingPending) {
      return NextResponse.json(
        {
          success: false,
          error: "You already have a pending payment request. Please wait for it to be processed.",
        },
        { status: 400 }
      );
    }

    const requestAmount = plan.offerPrice || plan.amount;

    const [newRequest] = await db
      .insert(paymentRequestsTable)
      .values({
        clerkId: user.id,
        planId,
        amount: requestAmount,
        description,
        status: "PENDING",
      })
      .returning();

    return NextResponse.json({ success: true, data: newRequest }, { status: 201 });
  } catch (error) {
    console.error("POST /api/payment-requests error", error);
    return NextResponse.json(
      { success: false, error: "Failed to create payment request" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await checkUserType([UserRole.MEMBER]);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const requests = await db
      .select({
        id: paymentRequestsTable.id,
        amount: paymentRequestsTable.amount,
        status: paymentRequestsTable.status,
        description: paymentRequestsTable.description,
        adminNote: paymentRequestsTable.adminNote,
        createdAt: paymentRequestsTable.createdAt,
        planName: plansTable.name,
      })
      .from(paymentRequestsTable)
      .leftJoin(plansTable, eq(paymentRequestsTable.planId, plansTable.id))
      .where(eq(paymentRequestsTable.clerkId, user.id))
      .orderBy(paymentRequestsTable.createdAt);

    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    console.error("GET /api/payment-requests error", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch payment requests" },
      { status: 500 }
    );
  }
}
