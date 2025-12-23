from fastapi import APIRouter, HTTPException

from ..schemas.dashboard import (
    DashboardRequest,
    DashboardResponse,
    DashboardData,
)
from ..services.dashboard_service import generate_dashboard_data


router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.post("/overview", response_model=DashboardResponse)
def get_dashboard_overview(payload: DashboardRequest) -> DashboardResponse:
    """
    Generate data lengkap untuk dashboard overview.
    Mengkombinasikan hasil AI-1 (Analisis Kepuasan) dan AI-2 (Segmentasi).
    
    PRIORITAS 4 - MINIMUM DATA CHECK: Minimal 5 responden diperlukan.
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
    
    try:
        # Generate dashboard data
        dashboard_data_dict = generate_dashboard_data(
            responses=responses_dict,
            likert_min=payload.likert_min,
            likert_max=payload.likert_max,
            k=payload.k,
            k_min=payload.k_min,
            k_max=payload.k_max,
        )
        
        # Check jika data insufficient
        if dashboard_data_dict.get("data_insufficient", False):
            return DashboardResponse(
                status="warning",
                message=dashboard_data_dict.get("insufficient_message", "Data belum cukup untuk analisis AI"),
                data=DashboardData(**dashboard_data_dict),
            )
        
        # Convert ke Pydantic model
        dashboard_data = DashboardData(**dashboard_data_dict)
        
        return DashboardResponse(
            status="success",
            message="Dashboard data generated successfully",
            data=dashboard_data,
        )
    except ValueError as e:
        # Handle validation errors (misalnya product_features mapping error)
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(
            status_code=500,
            detail=f"Error generating dashboard data: {str(e)}"
        )

