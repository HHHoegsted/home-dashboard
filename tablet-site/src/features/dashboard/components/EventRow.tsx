import { Clock3, MapPin } from "lucide-react";

import { cn } from "../../../lib/utils";
import type { CalendarEvent } from "../../../types/dashboard";

type EventRowProps = {
  event: CalendarEvent;
  compact?: boolean;
  highlight?: boolean;
};

type EventColorTheme = {
  border: string;
  background: string;
  highlightBackground: string;
  badgeBackground: string;
  badgeText: string;
  rail: string;
};

const DEFAULT_THEME: EventColorTheme = {
  border: "border-white/10",
  background: "bg-white/5",
  highlightBackground: "bg-white/10",
  badgeBackground: "bg-white/10",
  badgeText: "text-white/80",
  rail: "bg-white/35",
};

const HH_THEME: EventColorTheme = {
  border: "border-cyan-300/45",
  background: "bg-cyan-300/10",
  highlightBackground: "bg-cyan-300/22",
  badgeBackground: "bg-cyan-300/22",
  badgeText: "text-cyan-50",
  rail: "bg-cyan-300",
};

const CHARLIE_THEME: EventColorTheme = {
  border: "border-lime-300/45",
  background: "bg-lime-300/10",
  highlightBackground: "bg-lime-300/22",
  badgeBackground: "bg-lime-300/22",
  badgeText: "text-lime-50",
  rail: "bg-lime-300",
};

const SARA_THEME: EventColorTheme = {
  border: "border-amber-300/50",
  background: "bg-amber-300/12",
  highlightBackground: "bg-amber-300/24",
  badgeBackground: "bg-amber-300/24",
  badgeText: "text-amber-50",
  rail: "bg-amber-300",
};

function getEventTheme(source: string | undefined): EventColorTheme {
  const normalizedSource = source?.toLowerCase() ?? "";

  if (normalizedSource.startsWith("hh")) {
    return HH_THEME;
  }

  if (normalizedSource.startsWith("charlie")) {
    return CHARLIE_THEME;
  }

  if (normalizedSource.startsWith("sara")) {
    return SARA_THEME;
  }

  return DEFAULT_THEME;
}

function getOwnerLabel(source: string | undefined): string | null {
  const normalizedSource = source?.toLowerCase() ?? "";

  if (normalizedSource.startsWith("hh")) {
    return "HH";
  }

  if (normalizedSource.startsWith("charlie")) {
    return "Charlie";
  }

  if (normalizedSource.startsWith("sara")) {
    return "Sara";
  }

  return null;
}

export default function EventRow({
  event,
  compact = false,
  highlight = false,
}: EventRowProps) {
  const theme = getEventTheme(event.source);
  const ownerLabel = getOwnerLabel(event.source);

  return (
    <div
      className={cn(
        "relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl border px-4 py-3 pl-6",
        compact ? "" : "min-h-[76px]",
        theme.border,
        highlight ? theme.highlightBackground : theme.background
      )}
    >
      <div className={cn("absolute bottom-0 left-0 top-0 w-1.5", theme.rail)} />

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
          <div
            className={cn(
              "rounded-xl px-3 py-1 text-sm",
              theme.badgeBackground,
              theme.badgeText
            )}
          >
            I dag
          </div>
        ) : null}

        {ownerLabel ? (
          <div
            className={cn(
              "rounded-xl px-3 py-1 text-sm",
              theme.badgeBackground,
              theme.badgeText
            )}
          >
            {ownerLabel}
          </div>
        ) : null}

        {event.type ? (
          <div className="rounded-xl bg-white/10 px-3 py-1 text-sm text-white/80">
            {event.type}
          </div>
        ) : null}

        {event.source && !ownerLabel ? (
          <div className="rounded-xl bg-white/10 px-3 py-1 text-sm text-white/80">
            {event.source}
          </div>
        ) : null}
      </div>
    </div>
  );
}