from pydantic import BaseModel
from typing import List, Literal, Optional

class SingleTextInput(BaseModel):
    text: str

class MultipleTextInput(BaseModel):
    texts: List[str]

class PredictionResult(BaseModel):
    text: str
    label: Literal['positive', 'negative', 'neutral']
    confidence: float

class SummaryResult(BaseModel):
    positive: int
    negative: int
    neutral: int

class APIResponse(BaseModel):
    status: Literal['success', 'fail']
    message: str
    data: Optional[dict]
