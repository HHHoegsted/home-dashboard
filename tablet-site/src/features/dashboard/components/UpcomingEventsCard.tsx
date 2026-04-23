import { Bell } from "lucide-react";

import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { ScrollArea } from "../../../components/ui/scroll-area";
import type { DashboardData } from "../../../types/dashboard";
import EventRow from "./EventRow";
import SectionTitle from "./SectionTitle";

type UpcomingEventsCardProps = {
  data: DashboardData;
};

export default function UpcomingEventsCard({
  data,
}: UpcomingEventsCardProps) {
  return (
    <Card className="min-h-[280px]">
      <CardHeader>
        <SectionTitle
          icon={Bell}
          title="Kommende aftaler"
          description="Hurtigt overblik for familien"
        />
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[280px] pr-4">
          <div className="grid gap-3">
            {data.upcoming.map((event) => (
              <EventRow key={event.id} event={event} compact />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}