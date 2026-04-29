import { ArrowLeft, ImageOff, RefreshCw, UtensilsCrossed } from "lucide-react";
import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import type { DashboardData, Meal } from "../../../types/dashboard";
import { loadDashboardData } from "../api/loadDashboardData";
import SectionTitle from "./SectionTitle";

type MealPageProps = {
  data: DashboardData;
  onBack: () => void;
};

function formatMealType(mealType: string): string {
  const mealTypes: Record<string, string> = {
    breakfast: "Morgenmad",
    lunch: "Frokost",
    dinner: "Aftensmad",
  };

  return mealTypes[mealType.toLowerCase()] ?? mealType;
}

function formatMealDate(date: string | null | undefined): string {
  if (!date) {
    return "Ukendt dato";
  }

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("da-DK", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMealSortValue(meal: Meal): number {
  if (!meal.date) {
    return Number.MAX_SAFE_INTEGER;
  }

  const parsedDate = new Date(`${meal.date}T00:00:00`).getTime();

  if (Number.isNaN(parsedDate)) {
    return Number.MAX_SAFE_INTEGER;
  }

  return parsedDate;
}

function getVisibleMeals(data: DashboardData): Meal[] {
  const upcomingMeals = Array.isArray(data.upcomingMeals)
    ? data.upcomingMeals
    : [];

  const meals = [data.meal, ...upcomingMeals];
  const seen = new Set<string>();

  return meals
    .filter((meal) => meal.title.trim().length > 0)
    .sort((first, second) => getMealSortValue(first) - getMealSortValue(second))
    .filter((meal) => {
      const key = `${meal.date ?? "unknown"}-${meal.title}-${meal.mealType}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}

type MealRowProps = {
  meal: Meal;
  highlight?: boolean;
};

function MealRow({ meal, highlight = false }: MealRowProps) {
  const hasImage = Boolean(meal.image?.trim());

  return (
    <div
      className={
        highlight
          ? "grid gap-4 rounded-3xl border border-emerald-300/40 bg-emerald-300/15 p-4 md:grid-cols-[160px_1fr]"
          : "grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 md:grid-cols-[160px_1fr]"
      }
    >
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
        {hasImage ? (
          <img
            src={meal.image}
            alt={meal.title}
            className="h-32 w-full object-cover md:h-full"
          />
        ) : (
          <div className="flex h-32 w-full flex-col items-center justify-center gap-2 text-white/55">
            <ImageOff className="h-7 w-7" />
            <span className="text-xs">Intet billede</span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col justify-center">
        <div className="flex flex-wrap gap-2">
          {highlight ? (
            <div className="rounded-xl bg-emerald-300/20 px-3 py-1 text-sm text-emerald-50">
              I dag
            </div>
          ) : null}

          <div className="rounded-xl bg-white/10 px-3 py-1 text-sm text-white/80">
            {formatMealDate(meal.date)}
          </div>

          <div className="rounded-xl bg-white/10 px-3 py-1 text-sm text-white/80">
            {formatMealType(meal.mealType)}
          </div>
        </div>

        <div className="mt-3 text-2xl font-semibold leading-tight text-white">
          {meal.title}
        </div>

        <div className="mt-2 text-sm text-white/55">
          Synkroniseret fra {meal.source}
        </div>
      </div>
    </div>
  );
}

export default function MealPage({ data, onBack }: MealPageProps) {
  const [pageData, setPageData] = useState<DashboardData>(data);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const todayIsoDate = getTodayIsoDate();
  const meals = getVisibleMeals(pageData);

  useEffect(() => {
    async function refreshMealData() {
      setLoading(true);

      try {
        const result = await loadDashboardData();
        setPageData(result.data);
        setErrorMessage(result.errorMessage);
      } finally {
        setLoading(false);
      }
    }

    void refreshMealData();
  }, []);

  async function refreshMealData() {
    setLoading(true);

    try {
      const result = await loadDashboardData();
      setPageData(result.data);
      setErrorMessage(result.errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-4 p-4 md:p-6 lg:p-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Tilbage til dashboard
            </button>

            <div className="mt-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/70">
                <UtensilsCrossed className="h-4 w-4" />
                Mealie
              </div>

              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
                Madplan
              </h1>

              <p className="mt-3 max-w-2xl text-lg text-white/65">
                Dagens ret og de næste planlagte måltider fra Mealie.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-3 md:items-end">
            <button
              type="button"
              onClick={refreshMealData}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80 transition hover:bg-white/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              Opdater
            </button>

            <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-right">
              <div className="text-sm uppercase tracking-[0.18em] text-white/50">
                Vist
              </div>
              <div className="mt-1 text-3xl font-semibold text-white">
                {meals.length}
              </div>
              <div className="mt-1 text-sm text-white/55">
                {meals.length === 1 ? "måltid" : "måltider"}
              </div>
            </div>
          </div>
        </header>

        {errorMessage ? (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            {errorMessage}
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <SectionTitle
              icon={UtensilsCrossed}
              title="Kommende måltider"
              description="Madplanen fra Mealie"
            />
          </CardHeader>

          <CardContent>
            {meals.length > 0 ? (
              <div className="grid gap-3">
                {meals.map((meal, index) => (
                  <MealRow
                    key={`${meal.date ?? "unknown"}-${meal.title}-${index}`}
                    meal={meal}
                    highlight={meal.date === todayIsoDate}
                  />
                ))}
              </div>
            ) : (
              <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-8 text-center text-white/60">
                Ingen kommende måltider i Mealie.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}