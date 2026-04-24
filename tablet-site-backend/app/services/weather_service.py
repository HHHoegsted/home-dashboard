from __future__ import annotations

from dataclasses import dataclass

import httpx

from app.config import get_settings


@dataclass(frozen=True)
class WeatherSnapshot:
    location: str
    temp_c: int
    condition: str
    high_c: int
    low_c: int
    rain_chance: int
    updated_at: str


class WeatherService:
    def __init__(self) -> None:
        self.settings = get_settings()

    def get_weather(self) -> WeatherSnapshot:
        response = httpx.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": self.settings.weather_latitude,
                "longitude": self.settings.weather_longitude,
                "current": "temperature_2m,weather_code",
                "daily": "temperature_2m_max,temperature_2m_min,precipitation_probability_max",
                "timezone": "auto",
                "forecast_days": 1,
            },
            timeout=10.0,
        )
        response.raise_for_status()
        payload = response.json()

        current = payload["current"]
        daily = payload["daily"]

        return WeatherSnapshot(
            location=self.settings.weather_location_name,
            temp_c=round(current["temperature_2m"]),
            condition=self._map_weather_code(current["weather_code"]),
            high_c=round(daily["temperature_2m_max"][0]),
            low_c=round(daily["temperature_2m_min"][0]),
            rain_chance=round(daily["precipitation_probability_max"][0]),
            updated_at=self._format_updated_at(current["time"]),
        )

    @staticmethod
    def _format_updated_at(timestamp: str) -> str:
        return timestamp.split("T")[1][:5]

    @staticmethod
    def _map_weather_code(code: int) -> str:
        mapping = {
            0: "Klart vejr",
            1: "Overvejende klart",
            2: "Let skyet",
            3: "Overskyet",
            45: "Tåget",
            48: "Rim-tåge",
            51: "Let støvregn",
            53: "Støvregn",
            55: "Kraftig støvregn",
            56: "Let isslag",
            57: "Isslag",
            61: "Let regn",
            63: "Regn",
            65: "Kraftig regn",
            66: "Let underafkølet regn",
            67: "Underafkølet regn",
            71: "Let sne",
            73: "Sne",
            75: "Kraftig sne",
            77: "Snekorn",
            80: "Lette byger",
            81: "Byger",
            82: "Kraftige byger",
            85: "Let snebyge",
            86: "Kraftig snebyge",
            95: "Tordenvejr",
            96: "Torden med hagl",
            99: "Kraftigt tordenvejr med hagl",
        }
        return mapping.get(code, "Ukendt vejr")