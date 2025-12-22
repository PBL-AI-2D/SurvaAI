from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

from .satisfaction_analysis import LikertResponse


class DashboardRequest(BaseModel):
    """Request untuk generate dashboard data."""
    responses: List[LikertResponse]
    likert_min: float = Field(default=1.0)
    likert_max: float = Field(default=5.0)
    k: Optional[int] = Field(
        default=None,
        description="Jumlah cluster untuk segmentasi. Jika kosong, akan dicari optimal.",
    )
    k_min: int = Field(default=2, ge=2)
    k_max: int = Field(default=10, ge=2)


class SatisfactionPercentage(BaseModel):
    satisfied: float
    neutral: float
    unsatisfied: float


class MajorPreference(BaseModel):
    name: str
    percentage: float


class HighestSegment(BaseModel):
    segment_id: Optional[int]
    satisfaction_percentage: float


class AIInsightSummary(BaseModel):
    satisfaction_percentage: SatisfactionPercentage
    major_preference: MajorPreference
    highest_segment: HighestSegment


class SatisfactionOverview(BaseModel):
    total_respondents: int
    satisfaction_distribution: Dict[str, int]
    satisfaction_percentage: SatisfactionPercentage
    avg_satisfaction_10: float
    preferences: Dict[str, float]


class SegmentDetail(BaseModel):
    segment_id: int
    avg_age: Optional[int]
    dominant_preference: str
    satisfaction_percentage: float
    satisfaction_status: str  # "high", "medium", "low"
    respondent_count: int


class SegmentationData(BaseModel):
    total_segments: int
    clusters: List[int]
    pca_2d: List[Dict[str, Any]]
    segment_details: List[SegmentDetail]
    k_analysis: Optional[Dict[str, Any]] = None
    # mapping responden → segment (1‑indexed, index selaras dengan urutan responses)
    assignments: List[int]


class AnalyticsOverview(BaseModel):
    total_respondents: int
    avg_satisfaction_10: float
    active_segments: int
    satisfaction_trend: str  # "positive", "stable", "negative"


class ChartData(BaseModel):
    satisfaction_scores: List[float]
    sentiment_scores: List[float]
    sentiment_labels: List[Optional[str]]
    likert_normalized: List[Dict[str, float]]
    likert_correlation: Dict[str, Dict[str, float]]


class SegmentInsight(BaseModel):
    segment_id: str
    problem: str
    cause: str
    recommendation: str
    summary: str
    satisfaction_status: str


class DashboardData(BaseModel):
    ai_insight_summary: AIInsightSummary
    satisfaction_overview: SatisfactionOverview
    segmentation: SegmentationData
    analytics_overview: AnalyticsOverview
    chart_data: ChartData
    segment_insights: List[SegmentInsight]


class DashboardResponse(BaseModel):
    status: str
    message: str
    data: DashboardData

