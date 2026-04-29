import { useEffect, useMemo, useState } from "react";

import type { DashboardData } from "../../types/dashboard";
import { loadDashboardData } from "./api/loadDashboardData";
import CalendarCard from "./components/CalendarCard";
import CalendarPage from "./components/CalendarPage";
import DashboardErrorState from "./components/DashboardErrorState";
import DashboardLoadingState from "./components/DashboardLoadingState";
import HeroCard from "./components/HeroCard";
import MealieCard from "./components/MealieCard";
import WeatherCard from "./components/WeatherCard";

type DashboardView = "dashboard" | "calendar";

export default function HomeTabletDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [view, setView] = useState<DashboardView>("dashboard");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Godmorgen";
    }

    if (hour < 18) {
      return "God eftermiddag";
    }

    return "Godaften";
  }, []);

  async function fetchDashboardData(options?: {
    silent?: boolean;
    isInitial?: boolean;
  }) {
    const silent = options?.silent ?? false;
    const isInitial = options?.isInitial ?? false;

    if (!silent) {
      setLoading(true);
    }

    if (isInitial) {
      setInitialLoading(true);
    }

    try {
      const result = await loadDashboardData();
      setData(result.data);
      setErrorMessage(result.errorMessage);
    } finally {
      if (!silent) {
        setLoading(false);
      }

      if (isInitial) {
        setInitialLoading(false);
      }
    }
  }

  useEffect(() => {
    void fetchDashboardData({ isInitial: true });
  }, []);

  useEffect(() => {
    if (!data) {
      return;
    }

    const timer = window.setInterval(() => {
      const now = new Date();

      const time = now.toLocaleTimeString("da-DK", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const dateLabel = now.toLocaleDateString("da-DK", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });

      setData((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          now: {
            time,
            dateLabel,
          },
        };
      });
    }, 30000);

    return () => window.clearInterval(timer);
  }, [data]);

  async function refreshDashboard() {
    await fetchDashboardData();
  }

  if (initialLoading && !data) {
    return <DashboardLoadingState />;
  }

  if (!data) {
    return <DashboardErrorState message={errorMessage ?? undefined} />;
  }

  if (view === "calendar") {
    return <CalendarPage data={data} onBack={() => setView("dashboard")} />;
  }

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-4 p-4 md:p-6 lg:p-8">
        {errorMessage ? (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            {errorMessage}
          </div>
        ) : null}

        <header className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[1.5fr_1fr]">
          <HeroCard greeting={greeting} data={data} />
          <WeatherCard
            data={data}
            loading={loading}
            onRefresh={refreshDashboard}
          />
        </header>

        <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[1.5fr_1fr]">
          <CalendarCard data={data} onOpen={() => setView("calendar")} />
          <MealieCard data={data} />
        </div>
      </div>
    </div>
  );
}