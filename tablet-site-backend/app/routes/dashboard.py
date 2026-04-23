from fastapi import APIRouter

from app.schemas import DashboardResponse
from app.services import DashboardService

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardResponse)
def get_dashboard() -> DashboardResponse:
    service = DashboardService()
    return service.get_dashboard()