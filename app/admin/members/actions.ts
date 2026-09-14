// app/admin/members/actions.ts
// Client‑side API wrapper for /api/members

import { Member } from "./columns";

export async function createMember(data: {
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  homeStreet?: string;
  homeCity?: string;
  homeState?: string;
  homePostalCode?: string;
  homeCountry?: string;
  homeLandmark?: string;
  currentStreet?: string;
  currentCity?: string;
  currentState?: string;
  currentPostalCode?: string;
  currentCountry?: string;
  currentLandmark?: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  height?: string | number;
  bloodGroup?: string;
}): Promise<{ success: boolean; userId?: string; error?: string }> {
  const response = await fetch('/api/members', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to create member');
  }
  return result;
}

export async function deleteMember(userId: string): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(`/api/members?userId=${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to delete member');
  }
  return result;
}


export async function fetchMembers({
  page = 1,
  limit = 10,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
} = {}): Promise<{
  success: boolean;
  data?: Member[];
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

  const response = await fetch(`/api/members?${params.toString()}`, {
    method: 'GET',
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to fetch members');
  }
  return result;
}