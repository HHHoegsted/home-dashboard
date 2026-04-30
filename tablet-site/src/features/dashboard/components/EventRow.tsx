import { Clock3, MapPin } from "lucide-react";

import { cn } from "../../../lib/utils";
import type { CalendarEvent } from "../../../types/dashboard";

type EventRowProps = {
  event: CalendarEvent;
  compact?: boolean;
  highlight?: boolean;
};

type EventColorTheme = {
  background: string;
  highlightBackground: string;
  badgeBackground: string;
  badgeText: string;
};

const DEFAULT_THEME: EventColorTheme = {
  background: "bg-white/5",
  highlightBackground: "bg-white/10",
  badgeBackground: "bg-white/10",
  badgeText: "text-white/80",
};

const HH_THEME: EventColorTheme = {
  background: "bg-blue-500/30",
  highlightBackground: "bg-blue-500/40",
  badgeBackground: "bg-blue-500/40",
  badgeText: "text-blue-50",
};

const CHARLIE_THEME: EventColorTheme = {
  background: "bg-green-500/30",
  highlightBackground: "bg-green-500/40",
  badgeBackground: "bg-green-500/40",
  badgeText: "text-green-50",
};

const SARA_THEME: EventColorTheme = {
  background: "bg-pink-500/30",
  highlightBackground: "bg-pink-500/40",
  badgeBackground: "bg-pink-500/40",
  badgeText: "text-pink-50",
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
        "flex items-center justify-between gap-3 rounded-2xl px-4 py-3",
        compact ? "" : "min-h-[76px]",
        highlight ? theme.highlightBackground : theme.background
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