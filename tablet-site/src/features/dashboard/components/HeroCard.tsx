import { Home, UtensilsCrossed } from "lucide-react";

import { Card, CardContent } from "../../../components/ui/card";
import type { DashboardData } from "../../../types/dashboard";
import MetricPill from "./MetricPill";

type HeroCardProps = {
  greeting: string;
  data: DashboardData;
};

export default function HeroCard({ greeting, data }: HeroCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="relative p-0">
        <div className="grid min-h-[280px] grid-cols-1 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="flex flex-col justify-between p-6 md:p-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/70">
                <Home className="h-4 w-4" />
                Familiedashboard
              </div>

              <div className="mt-5 text-3xl font-semibold tracking-tight text-white md:text-5xl">
                {greeting}
              </div>

              <div className="mt-2 text-lg text-white/80 md:text-xl">
                {data.now.dateLabel}
              </div>

              <div className="mt-1 text-5xl font-bold tracking-tight text-white md:text-7xl">
                {data.now.time}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              {data.household.map((item) => (
                <MetricPill
                  key={item.id}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </div>
          </div>

          <div className="relative min-h-[260px] overflow-hidden">
            <img
              src={data.meal.image}
              alt={data.meal.title}
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-2 text-white/75">
                <UtensilsCrossed className="h-4 w-4" />
                <span className="text-sm uppercase tracking-[0.18em]">
                  Dagens ret
                </span>
              </div>

              <div className="mt-2 text-2xl font-semibold leading-tight text-white drop-shadow-md">
                {data.meal.title}
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                <div className="rounded-xl bg-white/15 px-3 py-1 text-sm text-white">
                  {data.meal.mealType}
                </div>
                <div className="rounded-xl bg-white/15 px-3 py-1 text-sm text-white">
                  {data.meal.servings} personer
                </div>
                <div className="rounded-xl bg-white/15 px-3 py-1 text-sm text-white">
                  {data.meal.source}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}