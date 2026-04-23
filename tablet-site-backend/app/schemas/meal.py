from pydantic import BaseModel


class Meal(BaseModel):
    title: str
    mealType: str
    servings: int
    source: str
    image: str