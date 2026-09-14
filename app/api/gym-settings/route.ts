import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/index";
import { gymSettingsTable } from "@/app/db/schema";
import { checkUserType } from "@/utils/userRole";
import { UserRole } from "@/types";
import { eq } from "drizzle-orm";

// GET /api/gym-settings – public, returns the single gym settings row
export async function GET() {
  try {
    const [settings] = await db
      .select()
      .from(gymSettingsTable)
      .limit(1);

    if (!settings) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("GET /api/gym-settings error", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch gym settings" },
      { status: 500 }
    );
  }
}

// POST /api/gym-settings – admin only, creates settings row if none exists
export async function POST(request: NextRequest) {
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

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Settings already exist. Use PUT to update." },
        { status: 409 }
      );
    }

    const body = await request.json();

    const gymName =
      typeof body.gymName === "string" ? body.gymName.trim() : "";
    if (!gymName) {
      return NextResponse.json(
        { success: false, error: "Gym name is required" },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(gymSettingsTable)
      .values({
        gymName,
        gymDescription:
          typeof body.gymDescription === "string"
            ? body.gymDescription.trim() || null
            : null,
        registrationAmount:
          typeof body.registrationAmount === "string"
            ? body.registrationAmount
            : "0",
        phone:
          typeof body.phone === "string" ? body.phone.trim() || null : null,
        email:
          typeof body.email === "string" ? body.email.trim() || null : null,
        address:
          typeof body.address === "string"
            ? body.address.trim() || null
            : null,
        websiteUrl:
          typeof body.websiteUrl === "string"
            ? body.websiteUrl.trim() || null
            : null,
        instagramUrl:
          typeof body.instagramUrl === "string"
            ? body.instagramUrl.trim() || null
            : null,
        facebookUrl:
          typeof body.facebookUrl === "string"
            ? body.facebookUrl.trim() || null
            : null,
        youtubeUrl:
          typeof body.youtubeUrl === "string"
            ? body.youtubeUrl.trim() || null
            : null,
        whatsappNumber:
          typeof body.whatsappNumber === "string"
            ? body.whatsappNumber.trim() || null
            : null,
      })
      .returning();

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/gym-settings error", error);
    return NextResponse.json(
      { success: false, error: "Failed to create gym settings" },
      { status: 500 }
    );
  }
}

// PUT /api/gym-settings – admin only, updates the single settings row
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
        {
          success: false,
          error: "No settings found. Use POST to create first.",
        },
        { status: 404 }
      );
    }

    const body = await request.json();

    const updateData: Record<string, string | Date | null> = {};

    if (typeof body.gymName === "string")
      updateData.gymName = body.gymName.trim();
    if (typeof body.gymDescription === "string")
      updateData.gymDescription = body.gymDescription.trim() || null;
    if (typeof body.registrationAmount === "string")
      updateData.registrationAmount = body.registrationAmount;
    if (typeof body.phone === "string")
      updateData.phone = body.phone.trim() || null;
    if (typeof body.email === "string")
      updateData.email = body.email.trim() || null;
    if (typeof body.address === "string")
      updateData.address = body.address.trim() || null;
    if (typeof body.websiteUrl === "string")
      updateData.websiteUrl = body.websiteUrl.trim() || null;
    if (typeof body.instagramUrl === "string")
      updateData.instagramUrl = body.instagramUrl.trim() || null;
    if (typeof body.facebookUrl === "string")
      updateData.facebookUrl = body.facebookUrl.trim() || null;
    if (typeof body.youtubeUrl === "string")
      updateData.youtubeUrl = body.youtubeUrl.trim() || null;
    if (typeof body.whatsappNumber === "string")
      updateData.whatsappNumber = body.whatsappNumber.trim() || null;

    updateData.updatedAt = new Date();

    if (Object.keys(updateData).length <= 1) {
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(gymSettingsTable)
      .set(updateData)
      .where(eq(gymSettingsTable.id, existing.id))
      .returning();

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT /api/gym-settings error", error);
    return NextResponse.json(
      { success: false, error: "Failed to update gym settings" },
      { status: 500 }
    );
  }
}
