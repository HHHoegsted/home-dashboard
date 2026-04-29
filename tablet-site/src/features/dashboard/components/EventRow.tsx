import { Clock3, MapPin } from "lucide-react";

import { cn } from "../../../lib/utils";
import type { CalendarEvent } from "../../../types/dashboard";

type EventRowProps = {
  event: CalendarEvent;
  compact?: boolean;
  highlight?: boolean;
};

export default function EventRow({
  event,
  compact = false,
  highlight = false,
}: EventRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3",
        compact ? "" : "min-h-[76px]",
        highlight
          ? "border-emerald-300/40 bg-emerald-300/15"
          : "border-white/10 bg-white/5"
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

      <div className="flex shrink-0 flex-wrap justify-end gap-2">
        {highlight ? (
          <div className="rounded-xl bg-emerald-300/20 px-3 py-1 text-sm text-emerald-50">
            I dag
          </div>
        ) : null}

        {event.type ? (
          <div className="rounded-xl bg-white/10 px-3 py-1 text-sm text-white/80">
            {event.type}
          </div>
        ) : null}

        {event.source ? (
          <div className="rounded-xl bg-white/10 px-3 py-1 text-sm text-white/80">
            {event.source}
          </div>
        ) : null}
      </div>
    </div>
  );
}