export interface RazorpaySettings {
  razorpayEnabled: boolean;
}

export async function fetchRazorpayEnabled(): Promise<{
  success: boolean;
  data?: RazorpaySettings;
  error?: string;
}> {
  const response = await fetch("/api/pggateway", { method: "GET" });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Failed to fetch payment gateway settings");
  }
  return result;
}

export async function updateRazorpayEnabled(
  enabled: boolean
): Promise<{ success: boolean; data?: RazorpaySettings; error?: string }> {
  const response = await fetch("/api/pggateway", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ razorpayEnabled: enabled }),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Failed to update payment gateway settings");
  }
  return result;
}
