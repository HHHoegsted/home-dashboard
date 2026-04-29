import { ImageOff, UtensilsCrossed } from "lucide-react";

import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import type { DashboardData } from "../../../types/dashboard";
import SectionTitle from "./SectionTitle";

type MealieCardProps = {
  data: DashboardData;
};

function formatMealType(mealType: string): string {
  const mealTypes: Record<string, string> = {
    breakfast: "Morgenmad",
    lunch: "Frokost",
    dinner: "Aftensmad",
    side: "Tilbehør",
  };

  return mealTypes[mealType.toLowerCase()] ?? mealType;
}

export default function MealieCard({ data }: MealieCardProps) {
  const hasImage = data.meal.image.trim().length > 0;

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
          {hasImage ? (
            <img
              src={data.meal.image}
              alt={data.meal.title}
              className="h-56 w-full object-cover"
            />
          ) : (
            <div className="flex h-56 w-full flex-col items-center justify-center gap-3 text-white/55">
              <ImageOff className="h-8 w-8" />
              <span className="text-sm">Intet billede fra Mealie</span>
            </div>
          )}
        </div>

        <div className="mt-4 text-2xl font-semibold tracking-tight text-white">
          {data.meal.title}
        </div>

        <div className="mt-2 text-white/65">
          Dagens planlagte aftensmad synkroniseret fra Mealie.
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <div className="rounded-xl bg-white/10 px-3 py-1 text-sm text-white">
            {formatMealType(data.meal.mealType)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}