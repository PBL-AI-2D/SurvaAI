from fastapi import APIRouter
from app.src.schemas.sentiment_analysis import SingleTextInput, MultipleTextInput, APIResponse
from app.src.services import sentiment_analysis_service

router = APIRouter(prefix="/sentiment", tags=["Sentiment"])

@router.post("/one", response_model=APIResponse)
def predict_one(payload: SingleTextInput):
    result = sentiment_analysis_service.predict_single(payload.text)
    return APIResponse(status="success", message="Prediction complete", data=result)

@router.post("/all", response_model=APIResponse)
def predict_all(payload: MultipleTextInput):
    results = sentiment_analysis_service.predict_all(payload.texts)
    return APIResponse(status="success", message="Batch prediction complete", data={"predictions": results})

@router.post("/summary", response_model=APIResponse)
def predict_summary(payload: MultipleTextInput):
    results = sentiment_analysis_service.predict_all(payload.texts)
    summary = sentiment_analysis_service.summarize_predictions(results)
    return APIResponse(status="success", message="Summary prediction complete", data={"summary": summary})
