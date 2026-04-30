import type { DashboardData } from "../../../types/dashboard";
import { getApiBaseUrl } from "../../../lib/apiBaseUrl";

export async function getDashboardData(): Promise<DashboardData> {
  const apiBaseUrl = getApiBaseUrl();
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
