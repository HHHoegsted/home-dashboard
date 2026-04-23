import type { DashboardData } from "../../../types/dashboard";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error("VITE_API_BASE_URL is not configured.");
}

const DASHBOARD_API_URL = `${apiBaseUrl}/api/dashboard`;

export async function getDashboardData(): Promise<DashboardData> {
  const response = await fetch(DASHBOARD_API_URL, {
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