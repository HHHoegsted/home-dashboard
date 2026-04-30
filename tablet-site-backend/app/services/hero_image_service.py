from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path
import re
from uuid import uuid4
from zoneinfo import ZoneInfo

from app.config import get_settings


SUPPORTED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
SUPPORTED_IMAGE_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


@dataclass(frozen=True)
class HeroImageSelection:
    path: Path
    label: str
    reason: str


class HeroImageNotFoundError(Exception):
    pass


class HeroImageUploadError(Exception):
    pass


@dataclass(frozen=True)
class BirthdayRule:
    name: str
    month_day: str
    birth_date: date | None = None


class HeroImageService:
    def __init__(self) -> None:
        self.settings = get_settings()

    def list_images(self) -> list[dict[str, str | int | bool]]:
        image_dir = self._get_image_dir()

        return [
            {
                "name": image.name,
                "url": f"/api/hero-images/{image.name}",
                "sizeBytes": image.stat().st_size,
                "isBirthday": image.stem.lower().startswith("birthday-"),
            }
            for image in self._list_images(image_dir)
        ]

    def get_today_image(self) -> HeroImageSelection:
        now = datetime.now(ZoneInfo("Europe/Copenhagen"))
        image_dir = self._get_image_dir()
        images = self._list_images(image_dir)

        if not images:
            raise HeroImageNotFoundError(
                f"No hero images found in {image_dir}"
            )

        birthday_image = self._get_birthday_image(now, images)
        if birthday_image:
            return birthday_image

        daily_images = [
            image
            for image in images
            if not image.stem.lower().startswith("birthday-")
        ] or images

        image = daily_images[now.toordinal() % len(daily_images)]
        return HeroImageSelection(
            path=image,
            label=image.stem.replace("-", " ").title(),
            reason="daily",
        )

    def get_today_metadata(self) -> dict[str, str]:
        selection = self.get_today_image()
        return {
            "label": selection.label,
            "reason": selection.reason,
        }

    def get_image(self, filename: str) -> Path:
        image_dir = self._get_image_dir()
        image_path = (image_dir / filename).resolve()

        if image_path.parent != image_dir:
            raise HeroImageNotFoundError("Hero image not found")

        if (
            not image_path.exists()
            or not image_path.is_file()
            or image_path.suffix.lower() not in SUPPORTED_IMAGE_EXTENSIONS
        ):
            raise HeroImageNotFoundError("Hero image not found")

        return image_path

    def save_upload(
        self,
        original_filename: str | None,
        content_type: str | None,
        content: bytes,
        title: str | None = None,
        birthday_name: str | None = None,
    ) -> dict[str, str | int | bool]:
        image_dir = self._get_image_dir()
        image_dir.mkdir(parents=True, exist_ok=True)

        max_bytes = self.settings.hero_image_upload_max_mb * 1024 * 1024
        if len(content) == 0:
            raise HeroImageUploadError("Image file is empty")

        if len(content) > max_bytes:
            raise HeroImageUploadError(
                f"Image file is larger than {self.settings.hero_image_upload_max_mb} MB"
            )

        extension = self._get_upload_extension(original_filename, content_type)
        if not extension:
            raise HeroImageUploadError(
                "Only JPG, PNG, and WebP images are supported"
            )

        if birthday_name:
            base_name = f"birthday-{self._slugify(birthday_name)}"
        elif title:
            base_name = self._slugify(title)
        elif original_filename:
            base_name = self._slugify(Path(original_filename).stem)
        else:
            base_name = "hero-image"

        base_name = base_name or "hero-image"
        filename = self._unique_filename(image_dir, base_name, extension)
        image_path = image_dir / filename
        image_path.write_bytes(content)

        return {
            "name": image_path.name,
            "url": f"/api/hero-images/{image_path.name}",
            "sizeBytes": image_path.stat().st_size,
            "isBirthday": image_path.stem.lower().startswith("birthday-"),
        }

    def delete_image(self, filename: str) -> None:
        image_path = self.get_image(filename)
        image_path.unlink()

    def _get_image_dir(self) -> Path:
        image_dir = Path(self.settings.hero_image_directory)

        if not image_dir.is_absolute():
            image_dir = Path.cwd() / image_dir

        return image_dir.resolve()

    @staticmethod
    def _list_images(image_dir: Path) -> list[Path]:
        if not image_dir.exists():
            return []

        return sorted(
            image
            for image in image_dir.iterdir()
            if image.is_file()
            and image.suffix.lower() in SUPPORTED_IMAGE_EXTENSIONS
        )

    def _get_birthday_image(
        self,
        now: datetime,
        images: list[Path],
    ) -> HeroImageSelection | None:
        today = now.strftime("%m-%d")

        for birthday in self._parse_birthdays():
            if birthday.month_day != today:
                continue

            slug = self._slugify(birthday.name)
            matching_image = next(
                (
                    image
                    for image in images
                    if image.stem.lower() == f"birthday-{slug}"
                ),
                None,
            )

            if matching_image:
                label = f"{birthday.name} har foedselsdag"
                if birthday.birth_date:
                    age = now.date().year - birthday.birth_date.year
                    label = f"{birthday.name} {age} years old"

                return HeroImageSelection(
                    path=matching_image,
                    label=label,
                    reason="birthday",
                )

        return None

    def _parse_birthdays(self) -> list[BirthdayRule]:
        birthdays: list[BirthdayRule] = []
        entries = self.settings.hero_image_birthdays.split(",")

        for entry in entries:
            if "=" not in entry:
                continue

            name, birthday_value = entry.split("=", 1)
            name = name.strip()
            birthday_value = birthday_value.strip()

            if not name:
                continue

            birth_date = self._parse_birth_date(birthday_value)
            if birth_date:
                birthdays.append(
                    BirthdayRule(
                        name=name,
                        month_day=birth_date.strftime("%m-%d"),
                        birth_date=birth_date,
                    )
                )
                continue

            if self._is_valid_month_day(birthday_value):
                birthdays.append(
                    BirthdayRule(name=name, month_day=birthday_value)
                )

        return birthdays

    @staticmethod
    def _parse_birth_date(value: str) -> date | None:
        try:
            return datetime.strptime(value, "%Y-%m-%d").date()
        except ValueError:
            return None

    @staticmethod
    def _is_valid_month_day(month_day: str) -> bool:
        try:
            datetime.strptime(month_day, "%m-%d")
        except ValueError:
            return False

        return True

    @staticmethod
    def _slugify(value: str) -> str:
        normalized = (
            value.strip()
            .lower()
            .replace("æ", "ae")
            .replace("ø", "oe")
            .replace("å", "aa")
        )
        normalized = re.sub(r"[^a-z0-9]+", "-", normalized)
        return normalized.strip("-")

    @staticmethod
    def _get_upload_extension(
        original_filename: str | None,
        content_type: str | None,
    ) -> str | None:
        if content_type in SUPPORTED_IMAGE_CONTENT_TYPES:
            return SUPPORTED_IMAGE_CONTENT_TYPES[content_type]

        if original_filename:
            extension = Path(original_filename).suffix.lower()
            if extension in SUPPORTED_IMAGE_EXTENSIONS:
                return ".jpg" if extension == ".jpeg" else extension

        return None

    @staticmethod
    def _unique_filename(
        image_dir: Path,
        base_name: str,
        extension: str,
    ) -> str:
        filename = f"{base_name}{extension}"
        if not (image_dir / filename).exists():
            return filename

        return f"{base_name}-{uuid4().hex[:8]}{extension}"
