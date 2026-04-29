import { CalendarDays } from "lucide-react";

import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import type { CalendarEvent, DashboardData } from "../../../types/dashboard";
import EventRow from "./EventRow";
import SectionTitle from "./SectionTitle";

type CalendarCardProps = {
  data: DashboardData;
  onOpen: () => void;
};

type CombinedCalendarEvent = {
  event: CalendarEvent;
  isToday: boolean;
};

const UPCOMING_EVENT_LIMIT = 4;

export default function CalendarCard({ data, onOpen }: CalendarCardProps) {
  const visibleUpcomingEvents = data.upcoming.slice(0, UPCOMING_EVENT_LIMIT);

  const calendarEvents: CombinedCalendarEvent[] = [
    ...data.eventsToday.map((event) => ({ event, isToday: true })),
    ...visibleUpcomingEvents.map((event) => ({ event, isToday: false })),
  ];

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      className="h-full cursor-pointer transition hover:border-white/25 hover:bg-white/[0.07]"
    >
      <CardHeader className="pb-3">
        <SectionTitle
          icon={CalendarDays}
          title="Kalender"
          description="I dag og de næste aftaler"
        />
      </CardHeader>

      <CardContent className="flex h-full flex-col">
        {calendarEvents.length > 0 ? (
          <div className="grid gap-3">
            {calendarEvents.map(({ event, isToday }, index) => (
              <EventRow
                key={`${isToday ? "today" : "upcoming"}-${event.id}-${index}`}
                event={event}
                highlight={isToday}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-8 text-center text-white/60">
            Ingen kommende aftaler i kalenderen.
          </div>
        )}

        <div className="mt-4 text-sm text-white/45">
          Tryk for at se flere aftaler.
        </div>
      </CardContent>
    </Card>
  );
}