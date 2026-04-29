import { ArrowLeft, CalendarDays } from "lucide-react";

import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import type { CalendarEvent, DashboardData } from "../../../types/dashboard";
import EventRow from "./EventRow";
import SectionTitle from "./SectionTitle";

type CalendarPageProps = {
  data: DashboardData;
  onBack: () => void;
};

type CombinedCalendarEvent = {
  event: CalendarEvent;
  isToday: boolean;
};

export default function CalendarPage({ data, onBack }: CalendarPageProps) {
  const calendarEvents: CombinedCalendarEvent[] = [
    ...data.eventsToday.map((event) => ({ event, isToday: true })),
    ...data.upcoming.map((event) => ({ event, isToday: false })),
  ];

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
                <CalendarDays className="h-4 w-4" />
                Kalender
              </div>

              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
                Kommende aftaler
              </h1>

              <p className="mt-3 max-w-2xl text-lg text-white/65">
                Samlet overblik fra de valgte iCloud-kalendere.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-right">
            <div className="text-sm uppercase tracking-[0.18em] text-white/50">
              Vist
            </div>
            <div className="mt-1 text-3xl font-semibold text-white">
              {calendarEvents.length}
            </div>
            <div className="mt-1 text-sm text-white/55">
              {calendarEvents.length === 1 ? "aftale" : "aftaler"}
            </div>
          </div>
        </header>

        <Card>
          <CardHeader>
            <SectionTitle
              icon={CalendarDays}
              title="Alle aftaler"
              description="I dag og kommende begivenheder"
            />
          </CardHeader>

          <CardContent>
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
              <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-8 text-center text-white/60">
                Ingen kommende aftaler i kalenderen.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}