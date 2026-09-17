import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/index";
import { gymSettingsTable } from "@/app/db/schema";
import { checkUserType } from "@/utils/userRole";
import { UserRole } from "@/types";
import { eq } from "drizzle-orm";

// GET /api/pggateway – returns the razorpayEnabled flag from gym_settings
export async function GET() {
  try {
    const [settings] = await db
      .select({ razorpayEnabled: gymSettingsTable.razorpayEnabled })
      .from(gymSettingsTable)
      .limit(1);

    return NextResponse.json({
      success: true,
      data: { razorpayEnabled: settings?.razorpayEnabled ?? false },
    });
  } catch (error) {
    console.error("GET /api/pggateway error", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch payment gateway settings" },
      { status: 500 }
    );
  }
}

// PUT /api/pggateway – admin only, toggles razorpayEnabled
export async function PUT(request: NextRequest) {
  try {
    const user = await checkUserType([UserRole.ADMIN]);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const [existing] = await db
      .select({ id: gymSettingsTable.id })
      .from(gymSettingsTable)
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Gym settings not found. Create gym settings first." },
        { status: 404 }
      );
    }

    const body = await request.json();

    if (typeof body.razorpayEnabled !== "boolean") {
      return NextResponse.json(
        { success: false, error: "razorpayEnabled must be a boolean" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(gymSettingsTable)
      .set({
        razorpayEnabled: body.razorpayEnabled,
        updatedAt: new Date(),
      })
      .where(eq(gymSettingsTable.id, existing.id))
      .returning();

    return NextResponse.json({
      success: true,
      data: { razorpayEnabled: updated.razorpayEnabled },
    });
  } catch (error) {
    console.error("PUT /api/pggateway error", error);
    return NextResponse.json(
      { success: false, error: "Failed to update payment gateway settings" },
      { status: 500 }
    );
  }
}
