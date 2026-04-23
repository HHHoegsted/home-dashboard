import { CalendarDays } from "lucide-react";

import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import type { DashboardData } from "../../../types/dashboard";
import EventRow from "./EventRow";
import SectionTitle from "./SectionTitle";

type CalendarCardProps = {
  data: DashboardData;
  mode: string;
  onModeChange: (value: string) => void;
};

export default function CalendarCard({
  data,
  mode,
  onModeChange,
}: CalendarCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <SectionTitle
            icon={CalendarDays}
            title="Kalender"
            description="I dag og kommende"
          />

          <Tabs value={mode} onValueChange={onModeChange}>
            <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-white/10 md:w-[240px]">
              <TabsTrigger
                value="today"
                className="rounded-xl text-white data-[state=active]:bg-white data-[state=active]:text-slate-900"
              >
                I dag
              </TabsTrigger>
              <TabsTrigger
                value="upcoming"
                className="rounded-xl text-white data-[state=active]:bg-white data-[state=active]:text-slate-900"
              >
                Kommende
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="flex h-full flex-col">
        <div className="grid gap-3">
          {(mode === "today" ? data.eventsToday : data.upcoming).map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}