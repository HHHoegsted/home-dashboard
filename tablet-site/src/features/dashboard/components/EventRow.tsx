import { Clock3, MapPin } from "lucide-react";
import type { CalendarEvent } from "../../../types/dashboard";
import { cn } from "../../../lib/utils";

type EventRowProps = {
  event: CalendarEvent;
  compact?: boolean;
};

export default function EventRow({
  event,
  compact = false,
}: EventRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3",
        compact ? "" : "min-h-[76px]"
      )}
    >
      <div className="min-w-0">
        <div className="truncate text-base font-medium text-white">
          {event.title}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/60">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-4 w-4" />
            {event.start}
            {event.end ? `–${event.end}` : ""}
          </span>

          {event.location ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {event.location}
            </span>
          ) : null}
        </div>
      </div>

      {event.type ? (
        <div className="rounded-xl border-0 bg-white/10 px-3 py-1 text-sm text-white/80">
          {event.type}
        </div>
      ) : null}

      {event.source ? (
        <div className="rounded-xl border-0 bg-white/10 px-3 py-1 text-sm text-white/80">
          {event.source}
        </div>
      ) : null}
    </div>
  );
}