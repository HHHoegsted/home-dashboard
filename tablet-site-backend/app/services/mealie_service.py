from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta

import httpx

from app.config import get_settings


@dataclass(frozen=True)
class MealieMeal:
    title: str
    meal_type: str
    servings: int
    source: str
    image: str
    date: str | None = None


class MealieService:
    def __init__(self) -> None:
        self.settings = get_settings()

    def get_today_meal(self) -> MealieMeal:
        if not self.settings.mealie_api_token:
            return self._missing_token_meal()

        try:
            planner_item = self._get_today_planner_item()
        except httpx.HTTPError:
            return self._unavailable_meal()

        if not planner_item:
            return self._no_meal_planned()

        return self._to_mealie_meal(planner_item)

    def get_upcoming_meals(self) -> list[MealieMeal]:
        if not self.settings.mealie_api_token:
            return []

        today = date.today()
        range_end = today + timedelta(days=30)

        try:
            planner_items = self._get_planner_items(today, range_end)
        except httpx.HTTPError:
            return []

        meals = [self._to_mealie_meal(item) for item in planner_items]
        meals = [
            meal
            for meal in meals
            if meal.title
            and meal.title not in {
                "Ukendt ret",
                "Mealie mangler API-token",
                "Ingen madplan i dag",
                "Mealie kunne ikke hentes",
            }
        ]

        return meals[:8]

    def _get_today_planner_item(self) -> dict | None:
        with httpx.Client(
            base_url=self.settings.mealie_base_url,
            headers=self._headers,
            timeout=10.0,
        ) as client:
            response = client.get("/api/households/mealplans/today")
            response.raise_for_status()
            payload = response.json()

        if isinstance(payload, list):
            return payload[0] if payload else None

        if isinstance(payload, dict):
            if "items" in payload and isinstance(payload["items"], list):
                return payload["items"][0] if payload["items"] else None

            return payload

        return None

    def _get_planner_items(
        self,
        range_start: date,
        range_end: date,
    ) -> list[dict]:
        with httpx.Client(
            base_url=self.settings.mealie_base_url,
            headers=self._headers,
            timeout=10.0,
        ) as client:
            response = client.get(
                "/api/households/mealplans",
                params={
                    "start_date": range_start.isoformat(),
                    "end_date": range_end.isoformat(),
                },
            )
            response.raise_for_status()
            payload = response.json()

        if isinstance(payload, dict) and isinstance(payload.get("items"), list):
            return [
                item
                for item in payload["items"]
                if isinstance(item, dict)
            ]

        if isinstance(payload, list):
            return [
                item
                for item in payload
                if isinstance(item, dict)
            ]

        return []

    def _to_mealie_meal(self, planner_item: dict) -> MealieMeal:
        recipe = self._extract_recipe(planner_item)
        recipe_id = self._extract_recipe_id(planner_item, recipe)

        if not recipe and recipe_id:
            recipe = self._get_recipe(recipe_id)

        recipe_name = self._extract_recipe_name(planner_item, recipe)

        return MealieMeal(
            title=recipe_name,
            meal_type=self._extract_meal_type(planner_item),
            servings=self._extract_servings(recipe),
            source="Mealie",
            image=self._get_recipe_image_url(recipe_id) if recipe_id else "",
            date=self._extract_date(planner_item),
        )

    def _get_recipe(self, recipe_id: str) -> dict:
        try:
            with httpx.Client(
                base_url=self.settings.mealie_base_url,
                headers=self._headers,
                timeout=10.0,
            ) as client:
                response = client.get(f"/api/recipes/{recipe_id}")
                response.raise_for_status()
                recipe = response.json()
        except httpx.HTTPError:
            return {}

        return recipe if isinstance(recipe, dict) else {}

    def _extract_recipe(self, planner_item: dict) -> dict:
        recipe = planner_item.get("recipe")
        return recipe if isinstance(recipe, dict) else {}

    def _extract_recipe_id(self, planner_item: dict, recipe: dict) -> str:
        recipe_id = (
            recipe.get("id")
            or recipe.get("slug")
            or planner_item.get("recipeId")
            or planner_item.get("recipe_id")
            or planner_item.get("recipeSlug")
            or planner_item.get("recipe_slug")
        )

        return str(recipe_id) if recipe_id else ""

    def _extract_recipe_name(self, planner_item: dict, recipe: dict) -> str:
        recipe_name = (
            recipe.get("name")
            or recipe.get("recipeName")
            or planner_item.get("title")
            or planner_item.get("name")
            or planner_item.get("recipeName")
        )

        return str(recipe_name) if recipe_name else "Ukendt ret"

    def _extract_servings(self, recipe: dict) -> int:
        servings = recipe.get("recipeServings") or recipe.get("servings") or 4

        try:
            return int(servings)
        except (TypeError, ValueError):
            return 4

    def _extract_meal_type(self, planner_item: dict) -> str:
        entry_type = planner_item.get("entryType") or planner_item.get("mealType")

        if isinstance(entry_type, dict):
            name = entry_type.get("name")
            return str(name) if name else "Aftensmad"

        if entry_type:
            return str(entry_type)

        return "Aftensmad"

    def _extract_date(self, planner_item: dict) -> str | None:
        meal_date = planner_item.get("date")

        if not meal_date:
            return None

        return str(meal_date)

    def _get_recipe_image_url(self, recipe_id: str) -> str:
        return (
            f"{self.settings.mealie_base_url}"
            f"/api/media/recipes/{recipe_id}/images/min-original.webp"
        )

    @property
    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.settings.mealie_api_token}",
            "Accept": "application/json",
        }

    @staticmethod
    def _missing_token_meal() -> MealieMeal:
        return MealieMeal(
            title="Mealie mangler API-token",
            meal_type="Madplan",
            servings=0,
            source="Mealie",
            image="",
        )

    @staticmethod
    def _no_meal_planned() -> MealieMeal:
        return MealieMeal(
            title="Ingen madplan i dag",
            meal_type="Madplan",
            servings=0,
            source="Mealie",
            image="",
        )

    @staticmethod
    def _unavailable_meal() -> MealieMeal:
        return MealieMeal(
            title="Mealie kunne ikke hentes",
            meal_type="Madplan",
            servings=0,
            source="Mealie",
            image="",
        )