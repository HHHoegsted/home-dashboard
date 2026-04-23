import { UtensilsCrossed } from "lucide-react";

import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import type { DashboardData } from "../../../types/dashboard";
import SectionTitle from "./SectionTitle";

type MealieCardProps = {
  data: DashboardData;
};

export default function MealieCard({ data }: MealieCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <SectionTitle
          icon={UtensilsCrossed}
          title="Mealie"
          description="Aftensmad vist automatisk"
        />
      </CardHeader>

      <CardContent className="flex h-full flex-col">
        <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
          <img
            src={data.meal.image}
            alt={data.meal.title}
            className="h-56 w-full object-cover"
          />
        </div>

        <div className="mt-4 text-2xl font-semibold tracking-tight text-white">
          {data.meal.title}
        </div>

        <div className="mt-2 text-white/65">
          Dagens planlagte aftensmad synkroniseret fra Mealie.
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <div className="rounded-xl bg-white/10 px-3 py-1 text-sm text-white">
            {data.meal.mealType}
          </div>
          <div className="rounded-xl bg-white/10 px-3 py-1 text-sm text-white">
            {data.meal.servings} personer
          </div>
        </div>
      </CardContent>
    </Card>
  );
}