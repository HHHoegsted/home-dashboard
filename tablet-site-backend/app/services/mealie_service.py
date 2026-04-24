from __future__ import annotations

from dataclasses import dataclass

import httpx

from app.config import get_settings


@dataclass(frozen=True)
class MealieMeal:
    title: str
    meal_type: str
    servings: int
    source: str
    image: str


class MealieService:
    def __init__(self) -> None:
        self.settings = get_settings()

    def get_today_meal(self) -> MealieMeal:
        if not self.settings.mealie_api_token:
            return self._fallback_meal()

        planner_item = self._get_today_planner_item()
        if not planner_item:
            return self._fallback_meal()

        recipe_id = planner_item.get("recipeId")
        recipe_name = planner_item.get("title") or "Ukendt ret"

        if not recipe_id:
            return MealieMeal(
                title=recipe_name,
                meal_type="Aftensmad",
                servings=4,
                source="Mealie",
                image="https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
            )

        recipe = self._get_recipe(recipe_id)

        return MealieMeal(
            title=recipe.get("name") or recipe_name,
            meal_type="Aftensmad",
            servings=recipe.get("recipeServings") or 4,
            source="Mealie",
            image=self._get_recipe_image_url(recipe_id),
        )

    def _get_today_planner_item(self) -> dict | None:
        with httpx.Client(
            base_url=self.settings.mealie_base_url,
            headers=self._headers,
            timeout=10.0,
        ) as client:
            response = client.get(
                f"/api/households/{self.settings.mealie_household_slug}/mealplans/today"
            )
            response.raise_for_status()
            payload = response.json()

        if isinstance(payload, list):
            return payload[0] if payload else None

        if isinstance(payload, dict):
            if "items" in payload and isinstance(payload["items"], list):
                return payload["items"][0] if payload["items"] else None
            return payload

        return None

    def _get_recipe(self, recipe_id: str) -> dict:
        with httpx.Client(
            base_url=self.settings.mealie_base_url,
            headers=self._headers,
            timeout=10.0,
        ) as client:
            response = client.get(f"/api/recipes/{recipe_id}")
            response.raise_for_status()
            return response.json()

    def _get_recipe_image_url(self, recipe_id: str) -> str:
        return (
            f"{self.settings.mealie_base_url}"
            f"/api/media/recipes/{recipe_id}/images/original.webp"
        )

    @property
    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.settings.mealie_api_token}",
            "Accept": "application/json",
        }

    @staticmethod
    def _fallback_meal() -> MealieMeal:
        return MealieMeal(
            title="Boller i karry med ris",
            meal_type="Aftensmad",
            servings=4,
            source="Mealie",
            image="https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
        )