from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    weather_latitude: float = 55.99261490973373
    weather_longitude: float = 11.967096034307996
    weather_location_name: str = "Hjemme"

    mealie_base_url: str = "http://192.168.0.155:9925"
    mealie_api_token: str = ""
    mealie_household_slug: str = "home"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()