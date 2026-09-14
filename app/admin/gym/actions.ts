export interface GymSettings {
  id: number;
  gymName: string;
  gymDescription: string | null;
  registrationAmount: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  websiteUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  youtubeUrl: string | null;
  whatsappNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GymSettingsInput {
  gymName: string;
  gymDescription?: string;
  registrationAmount?: string;
  phone?: string;
  email?: string;
  address?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  whatsappNumber?: string;
}

export async function fetchGymSettings(): Promise<{
  success: boolean;
  data?: GymSettings | null;
  error?: string;
}> {
  const response = await fetch("/api/gym-settings", { method: "GET" });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Failed to fetch gym settings");
  }
  return result;
}

export async function createGymSettings(
  data: GymSettingsInput
): Promise<{ success: boolean; data?: GymSettings; error?: string }> {
  const response = await fetch("/api/gym-settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Failed to create gym settings");
  }
  return result;
}

export async function updateGymSettings(
  data: GymSettingsInput
): Promise<{ success: boolean; data?: GymSettings; error?: string }> {
  const response = await fetch("/api/gym-settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Failed to update gym settings");
  }
  return result;
}
