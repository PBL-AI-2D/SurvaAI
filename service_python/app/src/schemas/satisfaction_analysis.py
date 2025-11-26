from typing import List, Dict, Optional, Any

from pydantic import BaseModel, Field


class LikertResponse(BaseModel):
    """
    Satu responden, berisi:
    - text: opini bebas (opsional)
    - likert: jawaban skala (misal 1-5) per aspek, dalam bentuk dict
    - categorical: fitur kategori / demografi / preferensi (opsional, bisa dipakai di AI-2)
    """

    text: Optional[str] = None
    likert: Dict[str, float] = Field(
        ...,
        description="Jawaban skala per aspek, misal {'service_quality': 4, 'price_fairness': 3}",
    )
    categorical: Optional[Dict[str, Any]] = None


class SatisfactionRequest(BaseModel):
    responses: List[LikertResponse]
    likert_min: float = Field(default=1.0)
    likert_max: float = Field(default=5.0)


class SatisfactionAnalysisResult(BaseModel):
    overall_satisfaction_scores: List[float]
    sentiment_labels: List[Optional[str]]
    sentiment_scores: List[Optional[float]]
    likert_normalized: List[Dict[str, float]]
    likert_correlation: Optional[Dict[str, Dict[str, float]]] = None
    sentiment_distribution: Dict[str, int]


class SatisfactionAPIResponse(BaseModel):
    status: str
    message: str
    data: SatisfactionAnalysisResult


