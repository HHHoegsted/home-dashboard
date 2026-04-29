import type { DashboardData } from "../../../types/dashboard";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error("VITE_API_BASE_URL is not configured.");
}

export async function getDashboardData(): Promise<DashboardData> {
  const dashboardApiUrl = `${apiBaseUrl}/api/dashboard`;

  const response = await fetch(dashboardApiUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard data: ${response.status}`);
  }

  const data: DashboardData = await response.json();
  return data;
}