import type { DashboardData } from "../../../types/dashboard";
import { demoData } from "../data/demoData";
import { getDashboardData } from "./getDashboardData";

export type LoadDashboardDataResult = {
  data: DashboardData;
  isFallback: boolean;
  errorMessage: string | null;
};

export async function loadDashboardData(): Promise<LoadDashboardDataResult> {
  try {
    const data = await getDashboardData();

    return {
      data,
      isFallback: false,
      errorMessage: null,
    };
  } catch (error) {
    console.error(error);

    return {
      data: demoData,
      isFallback: true,
      errorMessage: "Kunne ikke hente data fra backend. Viser demo-data.",
    };
  }
}