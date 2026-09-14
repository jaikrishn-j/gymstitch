import { NextRequest, NextResponse } from "next/server";
import { eq, ilike, sql, and, SQL } from "drizzle-orm";
import { db } from "@/app/index";
import { plansTable } from "@/app/db/schema";
import { checkUserType } from "@/utils/userRole";
import { UserRole } from "@/types";

// GET /api/plans?page=1&limit=10&search=... (public)
export async function GET(request: NextRequest) {
  try {
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

    const conditions: SQL[] = [];
    if (search) {
      conditions.push(ilike(plansTable.name, `%${search}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const offset = (page - 1) * limit;

    const [countResult, plans] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(plansTable)
        .where(whereClause),
      db
        .select()
        .from(plansTable)
        .where(whereClause)
        .orderBy(plansTable.createdAt)
        .limit(limit)
        .offset(offset),
    ]);

    const total = Number(countResult[0]?.count ?? 0);

    return NextResponse.json({
      success: true,
      data: plans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/plans error", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}

// POST /api/plans – create a new plan (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await checkUserType([UserRole.ADMIN]);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const descriptions =
      typeof body.descriptions === "string" ? body.descriptions.trim() : null;
    const amount = typeof body.amount === "string" ? body.amount : "";
    const offerPrice =
      typeof body.offerPrice === "string" && body.offerPrice
        ? body.offerPrice
        : null;
    const includedFeatures = Array.isArray(body.includedFeatures)
      ? body.includedFeatures.filter((f: any) => typeof f === "string" && f)
      : [];
    const isAvailable =
      typeof body.isAvailable === "boolean" ? body.isAvailable : true;
    const durationInDays =
      typeof body.durationInDays === "number" ? body.durationInDays : 0;

    if (!name || !amount || includedFeatures.length === 0 || !durationInDays) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, amount, included features, and duration are required",
        },
        { status: 400 }
      );
    }

    const [newPlan] = await db
      .insert(plansTable)
      .values({
        name,
        descriptions,
        amount,
        offerPrice,
        includedFeatures,
        isAvailable,
        durationInDays,
      })
      .returning();

    return NextResponse.json(
      { success: true, data: newPlan },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/plans error", error);
    return NextResponse.json(
      { success: false, error: "Failed to create plan" },
      { status: 500 }
    );
  }
}

// PUT /api/plans?id=1 – update a plan (admin only)
export async function PUT(request: NextRequest) {
  try {
    const user = await checkUserType([UserRole.ADMIN]);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const planId = parseInt(searchParams.get("id") || "");

    if (isNaN(planId) || planId < 1) {
      return NextResponse.json(
        { success: false, error: "Valid plan ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const updateData: Record<string, any> = {};

    if (typeof body.name === "string") updateData.name = body.name.trim();
    if (typeof body.descriptions === "string")
      updateData.descriptions = body.descriptions.trim() || null;
    if (typeof body.amount === "string") updateData.amount = body.amount;
    if (typeof body.offerPrice === "string")
      updateData.offerPrice = body.offerPrice || null;
    if (Array.isArray(body.includedFeatures))
      updateData.includedFeatures = body.includedFeatures;
    if (typeof body.isAvailable === "boolean")
      updateData.isAvailable = body.isAvailable;
    if (typeof body.durationInDays === "number")
      updateData.durationInDays = body.durationInDays;

    updateData.updatedAt = new Date();

    if (Object.keys(updateData).length <= 1) {
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(plansTable)
      .set(updateData)
      .where(eq(plansTable.id, planId))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT /api/plans error", error);
    return NextResponse.json(
      { success: false, error: "Failed to update plan" },
      { status: 500 }
    );
  }
}

// DELETE /api/plans?id=1 – delete a plan (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const user = await checkUserType([UserRole.ADMIN]);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const planId = parseInt(searchParams.get("id") || "");

    if (isNaN(planId) || planId < 1) {
      return NextResponse.json(
        { success: false, error: "Valid plan ID is required" },
        { status: 400 }
      );
    }

    const [deleted] = await db
      .delete(plansTable)
      .where(eq(plansTable.id, planId))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/plans error", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete plan" },
      { status: 500 }
    );
  }
}
