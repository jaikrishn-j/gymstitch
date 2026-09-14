import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { checkUserRole } from "@/utils/userRole";
import { PermissionModule } from "@/types/permissions";
import { UserRole } from "@/types"; // Assuming this contains enum values

// Helper to generate a temporary password (same as before)
function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const symbols = "!@#$%^&*";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  password += symbols.charAt(Math.floor(Math.random() * symbols.length));
  password += "1";
  return password;
}

// POST /api/members – create a new member
export async function POST(request: NextRequest) {
  try {
    // Check permission: "members:full" is required for creation
    const hasPermission = await checkUserRole(PermissionModule.MEMBERS, "full");
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Extract all optional fields (same as in the original action)
    const get = (key: string) =>
      typeof body[key] === "string" ? body[key] : "";

    const clerk = await clerkClient();

    // Create user in Clerk with all metadata
    const user = await clerk.users.createUser({
      emailAddress: [email],
      password: generateTempPassword(),
      firstName: name.split(" ")[0],
      lastName: name.split(" ").slice(1).join(" ") || undefined,
      skipPasswordChecks: true,
      privateMetadata: {
        role: UserRole.MEMBER,
        phone: get("phone"),
        whatsapp: get("whatsapp"),
        residentialAddress: {
          street: get("homeStreet"),
          city: get("homeCity"),
          state: get("homeState"),
          postalCode: get("homePostalCode"),
          country: get("homeCountry"),
          landmark: get("homeLandmark") || undefined,
        },
        currentAddress: {
          street: get("currentStreet"),
          city: get("currentCity"),
          state: get("currentState"),
          postalCode: get("currentPostalCode"),
          country: get("currentCountry"),
          landmark: get("currentLandmark") || undefined,
        },
        emergencyContactName: get("emergencyContactName"),
        emergencyContactRelation: get("emergencyContactRelation"),
        emergencyContactPhone: get("emergencyContactPhone"),
        height: get("height") ? Number(get("height")) : undefined,
        bloodGroup: get("bloodGroup") || undefined,
      },
    });

    // Mark email as verified (same as before)
    const emailAddress = user.emailAddresses[0];
    if (emailAddress) {
      await clerk.emailAddresses.updateEmailAddress(emailAddress.id, {
        verified: true,
      });
    }

    return NextResponse.json(
      { success: true, userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/members error", error);
    return NextResponse.json(
      { success: false, error: "Failed to create member" },
      { status: 500 }
    );
  }
}

// DELETE /api/members?userId=... – delete a member
export async function DELETE(request: NextRequest) {
  try {
    // Check permission
    const hasPermission = await checkUserRole(PermissionModule.MEMBERS, "full");
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get userId from query parameter or request body
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || (await request.json())?.userId;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const clerk = await clerkClient();
    await clerk.users.deleteUser(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/members error", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete member" },
      { status: 500 }
    );
  }
}


export async function GET(request: NextRequest) {
  try {
    // Check read permission – you may adjust the level as needed
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

    const clerk = await clerkClient();

    // Fetch all users and filter locally to support name, email, and phone search
    const allUsers: any[] = [];
    let offset = 0;
    const batchSize = 100;

    // Paginate through all Clerk users to find members
    while (true) {
      const batch = await clerk.users.getUserList({
        limit: batchSize,
        offset,
      });

      if (batch.data.length === 0) break;
      allUsers.push(...batch.data);
      offset += batchSize;

      // If we got a partial batch, we've reached the end
      if (batch.data.length < batchSize) break;
    }

    // Filter to only members
    let members = allUsers
      .filter((user) => user.privateMetadata?.role === UserRole.MEMBER)
      .map((user) => ({
        id: user.id,
        name:
          [user.firstName, user.lastName].filter(Boolean).join(" ") ||
          "Unnamed Member",
        email: user.emailAddresses[0]?.emailAddress ?? "",
        phone: (user.privateMetadata?.phone as string) || "",
        plan: (user.privateMetadata?.currentPlan as string) || "not activated",
      }));

    // Apply local search filter across name, email, and phone
    if (search) {
      const lowerSearch = search.toLowerCase();
      members = members.filter(
        (m) =>
          m.name.toLowerCase().includes(lowerSearch) ||
          m.email.toLowerCase().includes(lowerSearch) ||
          m.phone.toLowerCase().includes(lowerSearch)
      );
    }

    const total = members.length;
    const totalPages = Math.ceil(total / limit);

    // Apply pagination locally
    const start = (page - 1) * limit;
    const paginatedMembers = members.slice(start, start + limit);

    return NextResponse.json({
      success: true,
      data: paginatedMembers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("GET /api/members error", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}