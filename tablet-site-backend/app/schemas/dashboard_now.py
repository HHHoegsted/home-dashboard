from pydantic import BaseModel


class DashboardNow(BaseModel):
    time: str
    dateLabel: str