from app.schemas import (
    CalendarEvent,
    DashboardNow,
    DashboardResponse,
    HouseholdMetric,
    Meal,
    Weather,
)
from app.services.mealie_service import MealieService
from app.services.weather_service import WeatherService


class DashboardService:
    def __init__(self) -> None:
        self.weather_service = WeatherService()
        self.mealie_service = MealieService()

    def get_dashboard(self) -> DashboardResponse:
        weather_snapshot = self.weather_service.get_weather()
        today_meal = self.mealie_service.get_today_meal()

        return DashboardResponse(
            now=DashboardNow(
                time="18:42",
                dateLabel="torsdag · 23. april",
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
            meal=Meal(
                title=today_meal.title,
                mealType=today_meal.meal_type,
                servings=today_meal.servings,
                source=today_meal.source,
                image=today_meal.image,
            ),
            eventsToday=[
                CalendarEvent(
                    id=1,
                    title="Hente Charlie fra skole",
                    start="14:45",
                    end="15:15",
                    location="Skolen",
                    type="familie",
                ),
                CalendarEvent(
                    id=2,
                    title="Fodboldtræning",
                    start="17:00",
                    end="18:30",
                    location="Idrætshallen",
                    type="børn",
                ),
                CalendarEvent(
                    id=3,
                    title="Tag kød op til i morgen",
                    start="20:00",
                    end="20:05",
                    location="Køkkenet",
                    type="hjem",
                ),
            ],
            upcoming=[
                CalendarEvent(
                    id=1,
                    title="Tandlæge",
                    start="fre 09:00",
                    end="09:30",
                    location="Tandklinikken",
                    source="Familiekalender",
                ),
                CalendarEvent(
                    id=2,
                    title="Fødselsdag hos mormor",
                    start="lør 13:00",
                    end="16:00",
                    location="Mormors hus",
                    source="Delt kalender",
                ),
                CalendarEvent(
                    id=3,
                    title="Skrald afhentes",
                    start="man 06:00",
                    end="06:10",
                    location="Indkørslen",
                    source="Hjemmepåmindelser",
                ),
                CalendarEvent(
                    id=4,
                    title="Hente dagligvarer",
                    start="tir 16:30",
                    end="17:00",
                    location="Supermarkedet",
                    source="Familiekalender",
                ),
            ],
            household=[
                HouseholdMetric(id=1, label="Inde", value="21,4°C"),
                HouseholdMetric(id=2, label="Ude", value=f"{weather_snapshot.temp_c}°C"),
                HouseholdMetric(id=3, label="Regn", value=f"{weather_snapshot.rain_chance}%"),
                HouseholdMetric(id=4, label="Næste", value="17:00"),
            ],
        )