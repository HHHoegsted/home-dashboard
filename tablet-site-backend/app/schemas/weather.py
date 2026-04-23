from pydantic import BaseModel


class Weather(BaseModel):
    location: str
    tempC: int
    condition: str
    highC: int
    lowC: int
    rainChance: int
    updatedAt: str