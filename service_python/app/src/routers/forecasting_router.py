from fastapi import APIRouter

from service_python.app.src.schemas.forecasting import (
    ForecastingRequest,
    ForecastingResponse,
    ForecastingResult,
)
from service_python.app.src.services.forecasting_service import forecast_eti_trend


router = APIRouter(prefix="/forecasting", tags=["Forecasting & ETI"])


@router.post("/eti-trend", response_model=ForecastingResponse)
def forecast_eti(payload: ForecastingRequest) -> ForecastingResponse:
    """
    Prediksi/Forecasting ETI (Expected Trend Index) Trend.
    
    Menggabungkan:
    - Skor sentimen individu
    - Skor kepuasan rata-rata
    - Konsistensi preferensi
    - Penyimpangan nilai ekstrem
    
    Untuk menghasilkan prediksi tren: Naik (5-10%), Stabil, atau Turun.
    """
    # Convert request ke format yang diharapkan service
    satisfaction_history = None
    if payload.satisfaction_history:
        # Convert ke list of lists
        satisfaction_history = []
        for hist in payload.satisfaction_history:
            satisfaction_history.append(hist.satisfaction_history)
    
    historical_preferences = None
    if payload.historical_preferences:
        historical_preferences = []
        for hist in payload.historical_preferences:
            historical_preferences.append(hist.preference_history)
    
    current_preferences = None
    if payload.current_preferences:
        current_preferences = [cp.preferences for cp in payload.current_preferences]
    
    # Jalankan forecasting
    result_dict = forecast_eti_trend(
        sentiment_scores=payload.sentiment_scores,
        satisfaction_scores=payload.satisfaction_scores,
        satisfaction_history=satisfaction_history,
        historical_preferences=historical_preferences,
        current_preferences=current_preferences,
        weights=payload.eti_weights,
    )
    
    # Convert ke Pydantic model
    result = ForecastingResult(**result_dict)
    
    return ForecastingResponse(
        status="success",
        message="ETI trend forecasting completed",
        data=result,
    )

