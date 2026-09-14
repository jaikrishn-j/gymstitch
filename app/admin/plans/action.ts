import { Plan } from "./columns";

export interface PlanInput {
  name: string;
  descriptions?: string;
  amount: string;
  offerPrice?: string;
  includedFeatures: string[];
  isAvailable: boolean;
  durationInDays: number;
}

export async function fetchPlans({
  page = 1,
  limit = 10,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
} = {}): Promise<{
  success: boolean;
  data?: Plan[];
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

  const response = await fetch(`/api/plans?${params.toString()}`, {
    method: "GET",
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Failed to fetch plans");
  }
  return result;
}

export async function createPlan(data: PlanInput): Promise<{ success: boolean; data?: Plan; error?: string }> {
  const response = await fetch("/api/plans", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Failed to create plan");
  }
  return result;
}

export async function updatePlan(
  id: number,
  data: Partial<PlanInput>
): Promise<{ success: boolean; data?: Plan; error?: string }> {
  const response = await fetch(`/api/plans?id=${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Failed to update plan");
  }
  return result;
}

export async function deletePlan(id: number): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(`/api/plans?id=${id}`, {
    method: "DELETE",
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Failed to delete plan");
  }
  return result;
}
