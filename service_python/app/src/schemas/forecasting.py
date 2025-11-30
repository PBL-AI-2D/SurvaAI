from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class HistoricalSatisfaction(BaseModel):
    """Riwayat skor kepuasan per responden."""
    respondent_id: int
    satisfaction_history: List[float] = Field(
        ...,
        description="List skor kepuasan di waktu berbeda (chronological order)",
        min_items=1,
    )


class HistoricalPreference(BaseModel):
    """Riwayat preferensi per responden."""
    respondent_id: int
    preference_history: List[Dict[str, Any]] = Field(
        ...,
        description="List preferensi di waktu berbeda (chronological order)",
        min_items=1,
    )


class CurrentPreference(BaseModel):
    """Preferensi saat ini per responden."""
    respondent_id: int
    preferences: Dict[str, Any] = Field(
        ...,
        description="Preferensi saat ini dalam bentuk dict",
    )


class ForecastingRequest(BaseModel):
    """Request untuk forecasting ETI trend."""
    sentiment_scores: List[float] = Field(
        ...,
        description="Skor sentimen saat ini per responden (0-1)",
        min_items=1,
    )
    satisfaction_scores: List[float] = Field(
        ...,
        description="Skor kepuasan saat ini per responden (0-1)",
        min_items=1,
    )
    satisfaction_history: Optional[List[HistoricalSatisfaction]] = Field(
        default=None,
        description="Riwayat skor kepuasan per responden (optional, untuk prediksi lebih akurat)",
    )
    historical_preferences: Optional[List[HistoricalPreference]] = Field(
        default=None,
        description="Riwayat preferensi per responden (optional)",
    )
    current_preferences: Optional[List[CurrentPreference]] = Field(
        default=None,
        description="Preferensi saat ini per responden (optional)",
    )
    eti_weights: Optional[Dict[str, float]] = Field(
        default=None,
        description="Bobot untuk ETI calculation (default: equal weights)",
    )


class ForecastingResult(BaseModel):
    """Hasil forecasting ETI trend."""
    eti_scores: List[float] = Field(..., description="ETI score per responden (0-1)")
    trend_predictions: List[str] = Field(
        ...,
        description="Prediksi tren: 'naik', 'stabil', atau 'turun'",
    )
    trend_percentages: List[float] = Field(
        ...,
        description="Persentase perubahan prediksi (naik: 5-10%, turun: -10% to -5%, stabil: 0%)",
    )
    predicted_satisfaction: Optional[List[float]] = Field(
        default=None,
        description="Prediksi skor kepuasan berikutnya (jika ada historical data)",
    )
    regression_trends: Optional[List[str]] = Field(
        default=None,
        description="Tren dari linear regression (jika ada historical data)",
    )
    preference_predictions: Dict[str, List[float]] = Field(
        default_factory=dict,
        description="Prediksi preferensi per key",
    )
    feature_importance: Dict[str, float] = Field(
        default_factory=dict,
        description="Feature importance untuk prediksi preferensi",
    )
    metrics: Dict[str, float] = Field(
        default_factory=dict,
        description="Metrics evaluasi (RMSE, MAE, R²)",
    )
    preference_consistency: List[float] = Field(
        ...,
        description="Konsistensi preferensi per responden (0-1)",
    )
    extreme_deviation: List[float] = Field(
        ...,
        description="Penyimpangan ekstrem per responden (0-1)",
    )


class ForecastingResponse(BaseModel):
    """Response untuk forecasting endpoint."""
    status: str
    message: str
    data: ForecastingResult

