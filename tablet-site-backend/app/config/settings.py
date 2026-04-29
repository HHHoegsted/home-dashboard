from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    weather_latitude: float = 55.99261490973373
    weather_longitude: float = 11.967096034307996
    weather_location_name: str = "Hjemme"

    mealie_base_url: str = "http://192.168.0.155:9925"
    mealie_api_token: str = ""
    mealie_household_slug: str = "home"

    icloud_caldav_url: str = "https://caldav.icloud.com"

    icloud_hh_display_name: str = "HH"
    icloud_hh_username: str = ""
    icloud_hh_password: str = ""
    icloud_hh_calendar_names: str = "Home,Family"

    icloud_sara_display_name: str = "Sara"
    icloud_sara_username: str = ""
    icloud_sara_password: str = ""
    icloud_sara_calendar_names: str = ""

    icloud_charlie_display_name: str = "Charlie"
    icloud_charlie_username: str = ""
    icloud_charlie_password: str = ""
    icloud_charlie_calendar_names: str = ""

    icloud_calendar_lookahead_days: int = 30

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()