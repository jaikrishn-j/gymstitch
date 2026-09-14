// app/admin/payment/actions.ts
// Client-side API wrapper for /api/payments

import { Payment } from "./columns";

export async function fetchPayments({
  page = 1,
  limit = 10,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
} = {}): Promise<{
  success: boolean;
  data?: Payment[];
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

  const response = await fetch(`/api/payments?${params.toString()}`, {
    method: "GET",
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Failed to fetch payments");
  }
  return result;
}

export async function createPayment(data: {
  clerkId: string;
  planId?: number | null;
  planDurationDays?: number | null;
  amount: string;
  paymentMethod: string;
  description?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  const response = await fetch("/api/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Failed to create payment");
  }
  return result;
}

export async function searchUsers(search: string): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    plan: string;
  }>;
  error?: string;
}> {
  const response = await fetch(
    `/api/members?search=${encodeURIComponent(search)}&limit=50`,
    { method: "GET" }
  );

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Failed to search users");
  }
  return result;
}
