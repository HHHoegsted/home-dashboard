from secrets import compare_digest

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

from app.config import get_settings
from app.services.hero_image_service import (
    HeroImageNotFoundError,
    HeroImageService,
    HeroImageUploadError,
)

router = APIRouter(tags=["hero-image"])


def _check_upload_password(password: str) -> None:
    settings = get_settings()
    configured_password = settings.hero_image_upload_password

    if not configured_password:
        raise HTTPException(
            status_code=503,
            detail="Hero image uploads are not configured",
        )

    if not compare_digest(password, configured_password):
        raise HTTPException(status_code=401, detail="Wrong upload password")


@router.get("/api/hero-image")
def get_hero_image() -> FileResponse:
    service = HeroImageService()

    try:
        selection = service.get_today_image()
    except HeroImageNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error

    return FileResponse(
        selection.path,
        headers={
            "Cache-Control": "no-cache",
            "X-Hero-Image-Reason": selection.reason,
            "X-Hero-Image-Label": selection.label,
        },
    )


@router.get("/api/hero-image/meta")
def get_hero_image_metadata() -> dict[str, str]:
    service = HeroImageService()

    try:
        return service.get_today_metadata()
    except HeroImageNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.get("/api/hero-images")
def list_hero_images() -> dict[str, object]:
    service = HeroImageService()
    return {"images": service.list_images()}


@router.get("/api/hero-images/{filename}")
def get_named_hero_image(filename: str) -> FileResponse:
    service = HeroImageService()

    try:
        image_path = service.get_image(filename)
    except HeroImageNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error

    return FileResponse(image_path, headers={"Cache-Control": "no-cache"})


@router.post("/api/hero-images")
async def upload_hero_image(
    password: str = Form(...),
    image: UploadFile = File(...),
    title: str = Form(""),
    birthdayName: str = Form(""),
) -> dict[str, object]:
    _check_upload_password(password)

    service = HeroImageService()
    content = await image.read()

    try:
        uploaded = service.save_upload(
            original_filename=image.filename,
            content_type=image.content_type,
            content=content,
            title=title.strip() or None,
            birthday_name=birthdayName.strip() or None,
        )
    except HeroImageUploadError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return {"image": uploaded}


@router.delete("/api/hero-images/{filename}")
def delete_hero_image(filename: str, password: str = Form(...)) -> dict[str, str]:
    _check_upload_password(password)

    service = HeroImageService()
    try:
        service.delete_image(filename)
    except HeroImageNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error

    return {"status": "deleted"}
