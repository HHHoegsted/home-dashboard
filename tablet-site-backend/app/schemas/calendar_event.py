from pydantic import BaseModel


class CalendarEvent(BaseModel):
    id: int
    title: str
    start: str
    end: str | None = None
    location: str | None = None
    type: str | None = None
    source: str | None = None