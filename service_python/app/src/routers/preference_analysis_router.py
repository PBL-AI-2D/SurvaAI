from fastapi import APIRouter

from service_python.app.src.schemas.preference_analysis import (
    SegmentationRequest,
    SegmentationResponse,
)
from service_python.app.src.services.segmentation_service import segment_respondents


router = APIRouter(prefix="/preferences", tags=["Preferences & Segmentation"])


@router.post("/segment", response_model=SegmentationResponse)
def segment(payload: SegmentationRequest) -> SegmentationResponse:
    satisfaction_scores = [r.satisfaction for r in payload.respondents]
    sentiment_scores = [r.sentiment for r in payload.respondents]

    categorical_features = [
        (r.categorical or {}) for r in payload.respondents
    ]

    result = segment_respondents(
        satisfaction_scores=satisfaction_scores,
        sentiment_scores=sentiment_scores,
        categorical_features=categorical_features,
        k=payload.k,
        k_min=payload.k_min,
        k_max=payload.k_max,
    )

    return SegmentationResponse(
        status="success",
        message="Segmentation completed",
        data=result,
    )


