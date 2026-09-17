import { NextRequest, NextResponse } from "next/server";
import { eq, and, sql, desc } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/app/index";
import {
  paymentRequestsTable,
  plansTable,
} from "@/app/db/schema";
import { checkUserRole, checkUserType } from "@/utils/userRole";
import { PermissionModule } from "@/types/permissions";
import { UserRole } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const user = await checkUserType([UserRole.ADMIN, UserRole.STAFF]);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    if (user.role === UserRole.STAFF) {
      const hasPermission = await checkUserRole(
        PermissionModule.MEMBERS,
        "read"
      );
      if (!hasPermission) {
        return NextResponse.json(
          { success: false, error: "Insufficient permissions" },
          { status: 403 }
        );
      }
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const statusFilter = searchParams.get("status") || "";

    const conditions = [];

    if (unreadOnly) {
      conditions.push(eq(paymentRequestsTable.isRead, false));
    }

    if (
      statusFilter &&
      ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"].includes(statusFilter)
    ) {
      conditions.push(eq(paymentRequestsTable.status, statusFilter as any));
    }

    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    const requests = await db
      .select({
        id: paymentRequestsTable.id,
        clerkId: paymentRequestsTable.clerkId,
        planId: paymentRequestsTable.planId,
        amount: paymentRequestsTable.amount,
        planDurationDays: paymentRequestsTable.planDurationDays,
        description: paymentRequestsTable.description,
        status: paymentRequestsTable.status,
        handledByClerkId: paymentRequestsTable.handledByClerkId,
        handledAt: paymentRequestsTable.handledAt,
        adminNote: paymentRequestsTable.adminNote,
        isRead: paymentRequestsTable.isRead,
        paymentId: paymentRequestsTable.paymentId,
        createdAt: paymentRequestsTable.createdAt,
        updatedAt: paymentRequestsTable.updatedAt,
        planName: plansTable.name,
        planAmount: plansTable.amount,
        planOfferPrice: plansTable.offerPrice,
        planDurationInDays: plansTable.durationInDays,
      })
      .from(paymentRequestsTable)
      .leftJoin(plansTable, eq(paymentRequestsTable.planId, plansTable.id))
      .where(whereClause)
      .orderBy(desc(paymentRequestsTable.createdAt));

    const clerk = await clerkClient();
    const enriched = await Promise.all(
      requests.map(async (req) => {
        try {
          const clerkUser = await clerk.users.getUser(req.clerkId);
          return {
            ...req,
            userName:
              [clerkUser.firstName, clerkUser.lastName]
                .filter(Boolean)
                .join(" ") || "Unknown",
            userEmail:
              clerkUser.emailAddresses[0]?.emailAddress ?? "",
            userPhone:
              (clerkUser.privateMetadata?.phone as string) || "",
          };
        } catch {
          return {
            ...req,
            userName: "Unknown User",
            userEmail: "",
            userPhone: "",
          };
        }
      })
    );

    return NextResponse.json({ success: true, data: enriched });
  } catch (error) {
    console.error("GET /api/payment-requests/admin error", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch payment requests" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await checkUserType([UserRole.ADMIN, UserRole.STAFF]);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const hasFull = await checkUserRole(PermissionModule.MEMBERS, "full");
    if (!hasFull) {
      return NextResponse.json(
        {
          success: false,
          error: "You need full members permission to modify requests",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const requestId =
      typeof body.id === "number" ? body.id : null;

    if (!requestId) {
      return NextResponse.json(
        { success: false, error: "Request ID is required" },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select({ id: paymentRequestsTable.id })
      .from(paymentRequestsTable)
      .where(eq(paymentRequestsTable.id, requestId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Payment request not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (typeof body.isRead === "boolean") {
      updateData.isRead = body.isRead;
    }

    if (
      typeof body.status === "string" &&
      ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"].includes(
        body.status
      )
    ) {
      updateData.status = body.status;
      updateData.handledByClerkId = user.id;
      updateData.handledAt = new Date();
    }

    if (typeof body.adminNote === "string") {
      updateData.adminNote = body.adminNote || null;
    }

    if (typeof body.paymentId === "number") {
      updateData.paymentId = body.paymentId;
    }

    const [updated] = await db
      .update(paymentRequestsTable)
      .set(updateData)
      .where(eq(paymentRequestsTable.id, requestId))
      .returning();

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/payment-requests/admin error", error);
    return NextResponse.json(
      { success: false, error: "Failed to update payment request" },
      { status: 500 }
    );
  }
}
