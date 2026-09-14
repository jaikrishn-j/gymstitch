import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { checkUserRole } from "@/utils/userRole";
import { PermissionModule } from "@/types/permissions";
import { UserRole } from "@/types";
import { PERMISSION_MODULES } from "@/types/permissions";

// Helper to generate temp password (same as before)
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

// GET /api/staff?page=1&limit=10&search=...
export async function GET(request: NextRequest) {
  try {
    // Check read permission for staff module
    const hasPermission = await checkUserRole(PermissionModule.STAFF, "read");
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

    const queryParams: any = {
      limit: limit,
      offset: (page - 1) * limit,
    };

    if (search) {
      queryParams.emailAddress = search; // Clerk exact email search
    }

    const users = await clerk.users.getUserList(queryParams);

    // Filter to only staff (Clerk query doesn't filter by metadata)
    const staffUsers = users.data.filter(
      (user) => user.privateMetadata?.role === UserRole.STAFF
    );

    const staff = staffUsers.map((user) => ({
      id: user.id,
      name:
        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        "Unnamed Staff",
      email: user.emailAddresses[0]?.emailAddress ?? "",
      permission: Array.isArray(user.privateMetadata?.permission)
        ? user.privateMetadata.permission
        : [],
    }));

    const total = users.totalCount || staffUsers.length;

    return NextResponse.json({
      success: true,
      data: staff,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/staff error", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}

// POST /api/staff – create a new staff member
export async function POST(request: NextRequest) {
  try {
    const hasPermission = await checkUserRole(PermissionModule.STAFF, "full");
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const permissions: { name: string }[] = Array.isArray(body.permissions)
      ? body.permissions.filter(
          (p: any) => typeof p.name === "string" && p.name
        )
      : [];

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    const clerk = await clerkClient();

    const user = await clerk.users.createUser({
      emailAddress: [email],
      password: generateTempPassword(),
      firstName: name.split(" ")[0],
      lastName: name.split(" ").slice(1).join(" ") || undefined,
      skipPasswordChecks: true,
      privateMetadata: {
        role: UserRole.STAFF,
        permission: permissions,
      },
    });

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
    console.error("POST /api/staff error", error);
    return NextResponse.json(
      { success: false, error: "Failed to create staff" },
      { status: 500 }
    );
  }
}

// PUT /api/staff – update a staff member (userId in query or body)
export async function PUT(request: NextRequest) {
  try {
    const hasPermission = await checkUserRole(PermissionModule.STAFF, "full");
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || (await request.json())?.userId;
    const body = await request.json();

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const permissions: { name: string }[] = Array.isArray(body.permissions)
      ? body.permissions.filter(
          (p: any) => typeof p.name === "string" && p.name
        )
      : [];

    const clerk = await clerkClient();

    const [firstName, ...rest] = name.split(" ");
    const lastName = rest.join(" ") || undefined;

    await clerk.users.updateUser(userId, {
      ...(firstName && { firstName }),
      ...(lastName !== undefined && { lastName }),
      privateMetadata: {
        role: UserRole.STAFF,
        permission: permissions,
      },
    });

    // Handle email update if changed
    if (email) {
      const user = await clerk.users.getUser(userId);
      const currentEmail = user.emailAddresses[0]?.emailAddress;

      if (email !== currentEmail) {
        await clerk.emailAddresses.createEmailAddress({
          userId,
          emailAddress: email,
          verified: true,
          primary: true,
        });

        if (currentEmail) {
          const oldEmail = user.emailAddresses.find(
            (e) => e.emailAddress === currentEmail
          );
          if (oldEmail && oldEmail.id) {
            await clerk.emailAddresses.deleteEmailAddress(oldEmail.id);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/staff error", error);
    return NextResponse.json(
      { success: false, error: "Failed to update staff" },
      { status: 500 }
    );
  }
}

// DELETE /api/staff?userId=... – delete a staff member
export async function DELETE(request: NextRequest) {
  try {
    const hasPermission = await checkUserRole(PermissionModule.STAFF, "full");
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

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
    console.error("DELETE /api/staff error", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete staff" },
      { status: 500 }
    );
  }
}