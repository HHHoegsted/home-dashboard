import { useEffect, useState } from "react";
import { Home, ImageOff } from "lucide-react";

import { Card, CardContent } from "../../../components/ui/card";
import { getApiBaseUrl } from "../../../lib/apiBaseUrl";
import type { DashboardData } from "../../../types/dashboard";

type HeroCardProps = {
  greeting: string;
  data: DashboardData;
};

type HeroImageMeta = {
  label: string;
  reason: string;
};

function getHeroImageUrl(): string | null {
  try {
    return `${getApiBaseUrl()}/api/hero-image`;
  } catch {
    return null;
  }
}

function getHeroImageMetaUrl(): string | null {
  try {
    return `${getApiBaseUrl()}/api/hero-image/meta`;
  } catch {
    return null;
  }
}

export default function HeroCard({ greeting, data }: HeroCardProps) {
  const heroImageUrl = getHeroImageUrl();
  const [heroImageMeta, setHeroImageMeta] = useState<HeroImageMeta | null>(
    null
  );

  useEffect(() => {
    const metaUrl = getHeroImageMetaUrl();

    if (!metaUrl) {
      return;
    }

    fetch(metaUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch hero image metadata.");
        }

        return response.json() as Promise<HeroImageMeta>;
      })
      .then(setHeroImageMeta)
      .catch(() => setHeroImageMeta(null));
  }, [data.now.dateLabel]);

  return (
    <Card className="overflow-hidden">
      <CardContent className="relative p-0">
        <div className="grid min-h-[280px] grid-cols-1 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="flex min-h-[280px] flex-col justify-center p-6 md:p-8">
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
          </div>

          <div className="relative min-h-[260px] overflow-hidden">
            {heroImageUrl ? (
              <img
                src={heroImageUrl}
                alt="Udvalgt familiebillede"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.35),transparent_32%),radial-gradient(circle_at_70%_70%,rgba(59,130,246,0.35),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.9),rgba(30,41,59,0.85))] text-white/55">
                <ImageOff className="h-8 w-8" />
                <span className="text-sm">Intet hero-billede valgt</span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

            {heroImageMeta?.reason === "birthday" ? (
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="inline-flex max-w-full rounded-2xl bg-black/45 px-4 py-2 text-xl font-semibold tracking-tight text-white shadow-2xl backdrop-blur-md md:text-2xl">
                  {heroImageMeta.label}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
