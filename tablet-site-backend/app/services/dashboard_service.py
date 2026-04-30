from __future__ import annotations

from datetime import datetime
from zoneinfo import ZoneInfo

from app.schemas import (
    DashboardNow,
    DashboardResponse,
    HouseholdMetric,
    Meal,
    Weather,
)
from app.services.calendar_service import CalendarService
from app.services.mealie_service import MealieMeal, MealieService
from app.services.weather_service import WeatherService


class DashboardService:
    def __init__(self) -> None:
        self.weather_service = WeatherService()
        self.mealie_service = MealieService()
        self.calendar_service = CalendarService()

    def get_dashboard(self) -> DashboardResponse:
        now = datetime.now(ZoneInfo("Europe/Copenhagen"))
        weather_snapshot = self.weather_service.get_weather()
        today_meal = self.mealie_service.get_today_meal()
        upcoming_meals = self.mealie_service.get_upcoming_meals()
        calendar_snapshot = self.calendar_service.get_calendar_snapshot()

        next_event = (
            calendar_snapshot.events_today[0]
            if calendar_snapshot.events_today
            else calendar_snapshot.upcoming[0]
            if calendar_snapshot.upcoming
            else None
        )

        return DashboardResponse(
            now=DashboardNow(
                time=now.strftime("%H:%M"),
                dateLabel=self._format_date_label(now),
            ),
            weather=Weather(
                location=weather_snapshot.location,
                tempC=weather_snapshot.temp_c,
                condition=weather_snapshot.condition,
                highC=weather_snapshot.high_c,
                lowC=weather_snapshot.low_c,
                rainChance=weather_snapshot.rain_chance,
                updatedAt=weather_snapshot.updated_at,
            ),
            meal=self._to_meal_schema(today_meal),
            upcomingMeals=[
                self._to_meal_schema(meal)
                for meal in upcoming_meals
            ],
            eventsToday=calendar_snapshot.events_today,
            upcoming=calendar_snapshot.upcoming,
            household=[
                HouseholdMetric(id=1, label="Inde", value="21,4°C"),
                HouseholdMetric(id=2, label="Ude", value=f"{weather_snapshot.temp_c}°C"),
                HouseholdMetric(id=3, label="Regn", value=f"{weather_snapshot.rain_chance}%"),
                HouseholdMetric(
                    id=4,
                    label="Næste",
                    value=next_event.start if next_event else "Ingen",
                ),
            ],
        )

    @staticmethod
    def _to_meal_schema(meal: MealieMeal) -> Meal:
        return Meal(
            title=meal.title,
            mealType=meal.meal_type,
            servings=meal.servings,
            source=meal.source,
            image=meal.image,
            date=meal.date,
        )

    @staticmethod
    def _format_date_label(now: datetime) -> str:
        weekdays = {
            0: "mandag",
            1: "tirsdag",
            2: "onsdag",
            3: "torsdag",
            4: "fredag",
            5: "lørdag",
            6: "søndag",
        }

        months = {
            1: "januar",
            2: "februar",
            3: "marts",
            4: "april",
            5: "maj",
            6: "juni",
            7: "juli",
            8: "august",
            9: "september",
            10: "oktober",
            11: "november",
            12: "december",
        }

        weekday = weekdays[now.weekday()]
        month = months[now.month]

        return f"{weekday} · {now.day}. {month}"