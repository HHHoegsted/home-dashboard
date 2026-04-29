from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, time, timedelta
from typing import Any
from urllib.parse import urljoin
from xml.etree import ElementTree

import httpx
import recurring_ical_events
from icalendar import Calendar
from icalendar.cal import Component
from zoneinfo import ZoneInfo

from app.config import get_settings
from app.schemas import CalendarEvent


DAV_NAMESPACE = "DAV:"
CALDAV_NAMESPACE = "urn:ietf:params:xml:ns:caldav"
APPLE_NAMESPACE = "http://apple.com/ns/ical/"

NAMESPACES = {
    "d": DAV_NAMESPACE,
    "c": CALDAV_NAMESPACE,
    "a": APPLE_NAMESPACE,
}


@dataclass(frozen=True)
class CalendarSnapshot:
    events_today: list[CalendarEvent]
    upcoming: list[CalendarEvent]


@dataclass(frozen=True)
class CalendarAccount:
    display_name: str
    username: str
    password: str
    allowed_calendar_names: set[str]


@dataclass(frozen=True)
class RemoteCalendar:
    account_name: str
    name: str
    url: str


@dataclass(frozen=True)
class ParsedCalendarEvent:
    title: str
    start: datetime
    end: datetime | None
    location: str | None
    source: str
    uid: str


class CalendarService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.timezone = ZoneInfo("Europe/Copenhagen")

    def get_calendar_snapshot(self) -> CalendarSnapshot:
        now = datetime.now(self.timezone)
        today_start = datetime.combine(now.date(), time.min, tzinfo=self.timezone)
        tomorrow_start = today_start + timedelta(days=1)
        range_end = today_start + timedelta(
            days=max(1, self.settings.icloud_calendar_lookahead_days)
        )

        parsed_events = self._get_events(today_start, range_end)
        parsed_events = self._deduplicate_events(parsed_events)
        parsed_events.sort(key=lambda event: event.start)

        events_today_source = [
            event
            for event in parsed_events
            if today_start <= event.start < tomorrow_start
        ]

        upcoming_source = [
            event
            for event in parsed_events
            if tomorrow_start <= event.start < range_end
        ]

        return CalendarSnapshot(
            events_today=[
                self._to_today_calendar_event(index=index, event=event)
                for index, event in enumerate(events_today_source, start=1)
            ],
            upcoming=[
                self._to_upcoming_calendar_event(index=index, event=event)
                for index, event in enumerate(upcoming_source[:12], start=1)
            ],
        )

    def _get_events(
        self,
        range_start: datetime,
        range_end: datetime,
    ) -> list[ParsedCalendarEvent]:
        events: list[ParsedCalendarEvent] = []

        for account in self._configured_accounts():
            try:
                events.extend(
                    self._get_account_events(
                        account=account,
                        range_start=range_start,
                        range_end=range_end,
                    )
                )
            except httpx.HTTPError:
                continue
            except ElementTree.ParseError:
                continue

        return events

    def _configured_accounts(self) -> list[CalendarAccount]:
        accounts = [
            CalendarAccount(
                display_name=self.settings.icloud_hh_display_name,
                username=self.settings.icloud_hh_username,
                password=self.settings.icloud_hh_password,
                allowed_calendar_names=self._parse_calendar_names(
                    self.settings.icloud_hh_calendar_names
                ),
            ),
            CalendarAccount(
                display_name=self.settings.icloud_sara_display_name,
                username=self.settings.icloud_sara_username,
                password=self.settings.icloud_sara_password,
                allowed_calendar_names=self._parse_calendar_names(
                    self.settings.icloud_sara_calendar_names
                ),
            ),
            CalendarAccount(
                display_name=self.settings.icloud_charlie_display_name,
                username=self.settings.icloud_charlie_username,
                password=self.settings.icloud_charlie_password,
                allowed_calendar_names=self._parse_calendar_names(
                    self.settings.icloud_charlie_calendar_names
                ),
            ),
        ]

        return [
            account
            for account in accounts
            if account.username.strip() and account.password.strip()
        ]

    def _get_account_events(
        self,
        account: CalendarAccount,
        range_start: datetime,
        range_end: datetime,
    ) -> list[ParsedCalendarEvent]:
        with httpx.Client(
            auth=(account.username, account.password),
            headers={"User-Agent": "home-dashboard/0.1"},
            timeout=20.0,
            follow_redirects=True,
        ) as client:
            calendar_home_url = self._discover_calendar_home_url(client)
            calendars = self._discover_calendars(
                client=client,
                account=account,
                calendar_home_url=calendar_home_url,
            )

            events: list[ParsedCalendarEvent] = []

            for calendar in calendars:
                calendar_payloads = self._fetch_calendar_payloads(
                    client=client,
                    calendar_url=calendar.url,
                    range_start=range_start,
                    range_end=range_end,
                )

                for payload in calendar_payloads:
                    events.extend(
                        self._parse_calendar_payload(
                            payload=payload,
                            source=self._format_source(calendar),
                            range_start=range_start,
                            range_end=range_end,
                        )
                    )

            return events

    def _discover_calendar_home_url(self, client: httpx.Client) -> str:
        principal_payload = """<?xml version="1.0" encoding="utf-8" ?>
<d:propfind xmlns:d="DAV:">
  <d:prop>
    <d:current-user-principal />
  </d:prop>
</d:propfind>
"""

        principal_response = client.request(
            method="PROPFIND",
            url=self.settings.icloud_caldav_url,
            headers={"Depth": "0", "Content-Type": "application/xml"},
            content=principal_payload,
        )
        principal_response.raise_for_status()

        principal_href = self._first_text(
            root=ElementTree.fromstring(principal_response.text),
            paths=[
                ".//d:current-user-principal/d:href",
                ".//{DAV:}current-user-principal/{DAV:}href",
            ],
        )

        if not principal_href:
            raise httpx.HTTPStatusError(
                "Could not discover iCloud calendar principal.",
                request=principal_response.request,
                response=principal_response,
            )

        principal_url = self._absolute_url(principal_href)

        calendar_home_payload = """<?xml version="1.0" encoding="utf-8" ?>
<d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
  <d:prop>
    <c:calendar-home-set />
  </d:prop>
</d:propfind>
"""

        calendar_home_response = client.request(
            method="PROPFIND",
            url=principal_url,
            headers={"Depth": "0", "Content-Type": "application/xml"},
            content=calendar_home_payload,
        )
        calendar_home_response.raise_for_status()

        calendar_home_href = self._first_text(
            root=ElementTree.fromstring(calendar_home_response.text),
            paths=[
                ".//c:calendar-home-set/d:href",
                ".//{urn:ietf:params:xml:ns:caldav}calendar-home-set/{DAV:}href",
            ],
        )

        if not calendar_home_href:
            raise httpx.HTTPStatusError(
                "Could not discover iCloud calendar home.",
                request=calendar_home_response.request,
                response=calendar_home_response,
            )

        return self._absolute_url(calendar_home_href)

    def _discover_calendars(
        self,
        client: httpx.Client,
        account: CalendarAccount,
        calendar_home_url: str,
    ) -> list[RemoteCalendar]:
        payload = """<?xml version="1.0" encoding="utf-8" ?>
<d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
  <d:prop>
    <d:displayname />
    <d:resourcetype />
    <c:supported-calendar-component-set />
  </d:prop>
</d:propfind>
"""

        response = client.request(
            method="PROPFIND",
            url=calendar_home_url,
            headers={"Depth": "1", "Content-Type": "application/xml"},
            content=payload,
        )
        response.raise_for_status()

        root = ElementTree.fromstring(response.text)
        calendars: list[RemoteCalendar] = []

        for item in root.findall(".//d:response", NAMESPACES):
            href = self._child_text(item, "d:href")
            if not href:
                continue

            resource_type = item.find(".//d:resourcetype", NAMESPACES)
            if resource_type is None:
                continue

            is_calendar = resource_type.find("c:calendar", NAMESPACES) is not None
            if not is_calendar:
                continue

            supported_components = item.findall(
                ".//c:supported-calendar-component-set/c:comp",
                NAMESPACES,
            )
            component_names = {
                component.attrib.get("name", "").upper()
                for component in supported_components
            }

            if component_names and "VEVENT" not in component_names:
                continue

            calendar_url = self._absolute_url(href)
            calendar_name = self._child_text(item, ".//d:displayname") or "iCloud"

            if not self._calendar_is_allowed(account, calendar_name):
                continue

            calendars.append(
                RemoteCalendar(
                    account_name=account.display_name,
                    name=calendar_name,
                    url=calendar_url,
                )
            )

        return calendars

    def _fetch_calendar_payloads(
        self,
        client: httpx.Client,
        calendar_url: str,
        range_start: datetime,
        range_end: datetime,
    ) -> list[bytes]:
        range_start_utc = range_start.astimezone(ZoneInfo("UTC"))
        range_end_utc = range_end.astimezone(ZoneInfo("UTC"))

        payload = f"""<?xml version="1.0" encoding="utf-8" ?>
<c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
  <d:prop>
    <d:getetag />
    <c:calendar-data />
  </d:prop>
  <c:filter>
    <c:comp-filter name="VCALENDAR">
      <c:comp-filter name="VEVENT">
        <c:time-range start="{range_start_utc.strftime("%Y%m%dT%H%M%SZ")}" end="{range_end_utc.strftime("%Y%m%dT%H%M%SZ")}" />
      </c:comp-filter>
    </c:comp-filter>
  </c:filter>
</c:calendar-query>
"""

        response = client.request(
            method="REPORT",
            url=calendar_url,
            headers={"Depth": "1", "Content-Type": "application/xml"},
            content=payload,
        )
        response.raise_for_status()

        root = ElementTree.fromstring(response.text)
        payloads: list[bytes] = []

        for calendar_data in root.findall(".//c:calendar-data", NAMESPACES):
            if calendar_data.text:
                payloads.append(calendar_data.text.encode("utf-8"))

        return payloads

    def _parse_calendar_payload(
        self,
        payload: bytes,
        source: str,
        range_start: datetime,
        range_end: datetime,
    ) -> list[ParsedCalendarEvent]:
        calendar = Calendar.from_ical(payload)
        expanded_events = recurring_ical_events.of(calendar).between(
            range_start,
            range_end,
        )

        parsed_events: list[ParsedCalendarEvent] = []

        for component in expanded_events:
            if component.name != "VEVENT":
                continue

            parsed_event = self._parse_event_component(component, source)
            if parsed_event:
                parsed_events.append(parsed_event)

        return parsed_events

    def _parse_event_component(
        self,
        component: Component,
        source: str,
    ) -> ParsedCalendarEvent | None:
        raw_start = self._decoded_property(component, "DTSTART")
        if raw_start is None:
            return None

        raw_end = self._decoded_property(component, "DTEND")
        start = self._to_datetime(raw_start)
        end = self._to_datetime(raw_end) if raw_end else None

        if end and end <= start:
            end = None

        title = self._component_text(component, "SUMMARY") or "Begivenhed"
        location = self._component_text(component, "LOCATION")
        uid = self._component_text(component, "UID") or f"{title}-{start.isoformat()}"

        return ParsedCalendarEvent(
            title=title,
            start=start,
            end=end,
            location=location,
            source=source,
            uid=uid,
        )

    def _to_today_calendar_event(
        self,
        index: int,
        event: ParsedCalendarEvent,
    ) -> CalendarEvent:
        return CalendarEvent(
            id=index,
            title=event.title,
            start=self._format_today_start(event.start),
            end=self._format_today_end(event.end),
            location=event.location,
            type=None,
            source=event.source,
        )

    def _to_upcoming_calendar_event(
        self,
        index: int,
        event: ParsedCalendarEvent,
    ) -> CalendarEvent:
        return CalendarEvent(
            id=index,
            title=event.title,
            start=self._format_upcoming_start(event.start),
            end=self._format_today_end(event.end),
            location=event.location,
            type=None,
            source=event.source,
        )

    def _deduplicate_events(
        self,
        events: list[ParsedCalendarEvent],
    ) -> list[ParsedCalendarEvent]:
        seen: set[tuple[str, str, str]] = set()
        deduplicated: list[ParsedCalendarEvent] = []

        for event in events:
            key = (event.source, event.uid, event.start.isoformat())
            if key in seen:
                continue

            seen.add(key)
            deduplicated.append(event)

        return deduplicated

    def _to_datetime(self, value: date | datetime) -> datetime:
        if isinstance(value, datetime):
            if value.tzinfo is None:
                value = value.replace(tzinfo=self.timezone)

            return value.astimezone(self.timezone)

        return datetime.combine(value, time.min, tzinfo=self.timezone)

    def _format_today_start(self, value: datetime) -> str:
        if value.time() == time.min:
            return "Hele dagen"

        return value.strftime("%H:%M")

    def _format_today_end(self, value: datetime | None) -> str | None:
        if value is None or value.time() == time.min:
            return None

        return value.strftime("%H:%M")

    def _format_upcoming_start(self, value: datetime) -> str:
        weekdays = {
            0: "man",
            1: "tir",
            2: "ons",
            3: "tor",
            4: "fre",
            5: "lør",
            6: "søn",
        }

        weekday = weekdays[value.weekday()]

        if value.time() == time.min:
            return f"{weekday} {value.day}."

        return f"{weekday} {value.strftime('%H:%M')}"

    def _format_source(self, calendar: RemoteCalendar) -> str:
        if calendar.name == calendar.account_name:
            return calendar.account_name

        return f"{calendar.account_name} · {calendar.name}"

    def _parse_calendar_names(self, value: str) -> set[str]:
        return {
            item.strip().casefold()
            for item in value.split(",")
            if item.strip()
        }

    def _calendar_is_allowed(
        self,
        account: CalendarAccount,
        calendar_name: str,
    ) -> bool:
        if not account.allowed_calendar_names:
            return True

        return calendar_name.casefold() in account.allowed_calendar_names

    def _decoded_property(self, component: Component, name: str) -> Any:
        try:
            return component.decoded(name)
        except KeyError:
            return None

    def _component_text(self, component: Component, name: str) -> str | None:
        value = component.get(name)

        if value is None:
            return None

        return str(value)

    def _absolute_url(self, href: str) -> str:
        return urljoin(self.settings.icloud_caldav_url, href)

    def _first_text(
        self,
        root: ElementTree.Element,
        paths: list[str],
    ) -> str | None:
        for path in paths:
            item = root.find(path, NAMESPACES)
            if item is not None and item.text:
                return item.text

        return None

    def _child_text(self, item: ElementTree.Element, path: str) -> str | None:
        child = item.find(path, NAMESPACES)

        if child is None or not child.text:
            return None

        return child.text