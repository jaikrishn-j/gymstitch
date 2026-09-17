import { NextRequest, NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import Razorpay from "razorpay";
import { db } from "@/app/index";
import { plansTable, gymSettingsTable, paymentsTable } from "@/app/db/schema";
import { checkUserType } from "@/utils/userRole";
import { UserRole } from "@/types";

function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

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

    if (!planId) {
      return NextResponse.json(
        { success: false, error: "Plan ID is required" },
        { status: 400 }
      );
    }

    const [plan] = await db
      .select()
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

    const [settings] = await db
      .select({ registrationAmount: gymSettingsTable.registrationAmount })
      .from(gymSettingsTable)
      .limit(1);

    const [existingPayment] = await db
      .select({ id: paymentsTable.id })
      .from(paymentsTable)
      .where(
        and(
          eq(paymentsTable.clerkId, user.id),
          eq(paymentsTable.status, "SUCCESS")
        )
      )
      .limit(1);

    const isFirstPayment = !existingPayment;
    const planAmount = Number(plan.offerPrice || plan.amount);
    const registrationFee = isFirstPayment
      ? Number(settings?.registrationAmount ?? 0)
      : 0;
    const totalAmountPaise = Math.round((planAmount + registrationFee) * 100);

    const order = await getRazorpay().orders.create({
      amount: totalAmountPaise,
      currency: "INR",
      receipt: `plan_${planId}_${user.id}_${Date.now()}`,
      notes: {
        planId: String(planId),
        planName: plan.name,
        clerkId: user.id,
        isFirstPayment: String(isFirstPayment),
        registrationFee: String(registrationFee),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        amount: totalAmountPaise,
        currency: order.currency,
        planName: plan.name,
        razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("POST /api/razorpay/create-order error", error);
    return NextResponse.json(
      { success: false, error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}
