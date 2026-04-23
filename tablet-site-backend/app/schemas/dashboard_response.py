from pydantic import BaseModel

from app.schemas.calendar_event import CalendarEvent
from app.schemas.dashboard_now import DashboardNow
from app.schemas.household_metric import HouseholdMetric
from app.schemas.meal import Meal
from app.schemas.weather import Weather


class DashboardResponse(BaseModel):
    now: DashboardNow
    weather: Weather
    meal: Meal
    eventsToday: list[CalendarEvent]
    upcoming: list[CalendarEvent]
    household: list[HouseholdMetric]