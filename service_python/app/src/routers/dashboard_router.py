from fastapi import APIRouter

from service_python.app.src.schemas.dashboard import (
    DashboardRequest,
    DashboardResponse,
    DashboardData,
)
from service_python.app.src.services.dashboard_service import generate_dashboard_data


router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.post("/overview", response_model=DashboardResponse)
def get_dashboard_overview(payload: DashboardRequest) -> DashboardResponse:
    """
    Generate data lengkap untuk dashboard overview.
    Mengkombinasikan hasil AI-1 (Analisis Kepuasan) dan AI-2 (Segmentasi).
    """
    # Convert request ke format yang diharapkan service
    responses_dict = [
        {
            "text": r.text,
            "likert": r.likert,
            "categorical": r.categorical,
        }
        for r in payload.responses
    ]
    
    # Generate dashboard data
    dashboard_data_dict = generate_dashboard_data(
        responses=responses_dict,
        likert_min=payload.likert_min,
        likert_max=payload.likert_max,
        k=payload.k,
        k_min=payload.k_min,
        k_max=payload.k_max,
    )
    
    # Convert ke Pydantic model
    dashboard_data = DashboardData(**dashboard_data_dict)
    
    return DashboardResponse(
        status="success",
        message="Dashboard data generated successfully",
        data=dashboard_data,
    )

