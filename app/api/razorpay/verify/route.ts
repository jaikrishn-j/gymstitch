import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/app/index";
import { paymentsTable, plansTable, gymSettingsTable } from "@/app/db/schema";
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } =
      body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
      return NextResponse.json(
        { success: false, error: "Missing required payment verification fields" },
        { status: 400 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    const [plan] = await db
      .select({
        name: plansTable.name,
        durationInDays: plansTable.durationInDays,
        offerPrice: plansTable.offerPrice,
        amount: plansTable.amount,
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

    const durationDays = plan.durationInDays;

    const planAmount = Number(plan.offerPrice || plan.amount);

    const [existingPayment] = await db
      .select({ id: paymentsTable.id })
      .from(paymentsTable)
      .where(
        eq(paymentsTable.clerkId, user.id),
      )
      .limit(1);

    const isFirstPayment = !existingPayment;

    let registrationFee = 0;
    if (isFirstPayment) {
      const [settings] = await db
        .select({ registrationAmount: gymSettingsTable.registrationAmount })
        .from(gymSettingsTable)
        .limit(1);
      registrationFee = Number(settings?.registrationAmount ?? 0);
    }

    const paidAmount = String(planAmount + registrationFee);

    const [newPayment] = await db
      .insert(paymentsTable)
      .values({
        clerkId: user.id,
        planId,
        amount: paidAmount,
        paymentMethod: "RAZORPAY",
        paymentGateway: "RAZORPAY",
        gatewayPaymentId: razorpay_payment_id,
        gatewayOrderId: razorpay_order_id,
        status: "SUCCESS",
      })
      .returning();

    try {
      const clerk = await clerkClient();
      const existingUser = await clerk.users.getUser(user.id);
      const meta = existingUser.privateMetadata || {};

      const now = new Date();
      const newPlanEndDate = new Date(
        now.getTime() + durationDays * 24 * 60 * 60 * 1000
      );

      const currentEndDate = meta.currentPlanEndDate
        ? new Date(meta.currentPlanEndDate as string)
        : null;
      const isCurrentActive = currentEndDate && currentEndDate > now;

      let updatedMeta: Record<string, any> = { ...meta };

      if (isCurrentActive) {
        updatedMeta.nextPlan = plan.name;
        updatedMeta.nextPlanEndDate = newPlanEndDate.toISOString();
      } else {
        updatedMeta.currentPlan = plan.name;
        updatedMeta.currentPlanEndDate = newPlanEndDate.toISOString();
        delete updatedMeta.nextPlan;
        delete updatedMeta.nextPlanEndDate;
      }

      await clerk.users.updateUser(user.id, {
        privateMetadata: updatedMeta,
      });
    } catch (err) {
      console.error("Failed to update member plan in Clerk:", err);
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentId: newPayment.id,
        planName: plan.name,
        durationDays,
      },
    });
  } catch (error) {
    console.error("POST /api/razorpay/verify error", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
