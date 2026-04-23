import { CloudSun, RefreshCw } from "lucide-react";

import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Progress } from "../../../components/ui/progress";
import type { DashboardData } from "../../../types/dashboard";
import MetricPill from "./MetricPill";

type WeatherCardProps = {
  data: DashboardData;
  loading: boolean;
  onRefresh: () => void | Promise<void>;
};

export default function WeatherCard({
  data,
  loading,
  onRefresh,
}: WeatherCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl text-white">
              <CloudSun className="h-5 w-5" />
              Vejr
            </CardTitle>
            <CardDescription>{data.weather.location}</CardDescription>
          </div>

          <Button
            onClick={onRefresh}
            size="icon"
            variant="ghost"
            className="rounded-2xl text-white hover:bg-white/10 hover:text-white"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-6xl font-bold tracking-tight text-white">
              {data.weather.tempC}°
            </div>
            <div className="mt-2 text-white/70">
              {data.weather.condition}
            </div>
          </div>

          <div className="grid gap-2 text-right text-sm text-white/70">
            <div>H {data.weather.highC}°</div>
            <div>L {data.weather.lowC}°</div>
            <div>Opdateret {data.weather.updatedAt}</div>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm text-white/65">
            <span>Chance for regn</span>
            <span>{data.weather.rainChance}%</span>
          </div>

          <Progress
            value={data.weather.rainChance}
            className="h-3 bg-white/10"
          />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <MetricPill label="Ude" value={`${data.weather.tempC}°C`} />
          <MetricPill
            label="Føles som"
            value={`${data.weather.tempC - 1}°C`}
          />
        </div>
      </CardContent>
    </Card>
  );
}