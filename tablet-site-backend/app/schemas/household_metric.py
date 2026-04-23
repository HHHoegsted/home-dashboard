from pydantic import BaseModel


class HouseholdMetric(BaseModel):
    id: int
    label: str
    value: str