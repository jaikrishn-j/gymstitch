// app/admin/staff/actions.ts
// Client‑side API wrapper for /api/staff

import { Staff } from "./columns";

export interface StaffPermission {
  name: string;
}

export async function fetchStaff({
  page = 1,
  limit = 10,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
} = {}): Promise<{
  success: boolean;
  data?: Staff[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) params.append("search", search);

  const response = await fetch(`/api/staff?${params.toString()}`, {
    method: "GET",
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Failed to fetch staff");
  }
  return result;
}

export async function createStaff(data: {
  name: string;
  email: string;
  permissions: StaffPermission[];
}): Promise<{ success: boolean; userId?: string; error?: string }> {
  const response = await fetch("/api/staff", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Failed to create staff");
  }
  return result;
}

export async function updateStaff(
  userId: string,
  data: {
    name: string;
    email: string;
    permissions: StaffPermission[];
  }
): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(`/api/staff?userId=${encodeURIComponent(userId)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Failed to update staff");
  }
  return result;
}

export async function deleteStaff(userId: string): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(`/api/staff?userId=${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Failed to delete staff");
  }
  return result;
}