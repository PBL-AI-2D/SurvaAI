from fastapi import APIRouter

from ..schemas.satisfaction_analysis import (
    SatisfactionRequest,
    SatisfactionAPIResponse,
    SatisfactionAnalysisResult,
)
from ..services.satisfaction_analysis_service import analyze_satisfaction


router = APIRouter(prefix="/satisfaction", tags=["Satisfaction & Preferences"])


@router.post("/analyze", response_model=SatisfactionAPIResponse)
def analyze(payload: SatisfactionRequest) -> SatisfactionAPIResponse:
    responses_dict = [
        {
            "text": r.text,
            "likert": r.likert,
            "categorical": r.categorical,
        }
        for r in payload.responses
    ]

    result_dict = analyze_satisfaction(
        responses=responses_dict,
        likert_min=payload.likert_min,
        likert_max=payload.likert_max,
    )

    result = SatisfactionAnalysisResult(**result_dict)

    return SatisfactionAPIResponse(
        status="success",
        message="Satisfaction analysis completed",
        data=result,
    )


