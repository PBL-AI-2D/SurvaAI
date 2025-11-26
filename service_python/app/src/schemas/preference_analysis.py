from typing import List, Dict, Optional, Any

from pydantic import BaseModel, Field


class RespondentFeatures(BaseModel):
    """
    Fitur per responden untuk segmentasi:
    - satisfaction: skor kepuasan 0-1
    - sentiment: skor sentimen 0-1
    - categorical: fitur kategori / preferensi / demografi (sudah di-encode 0/1 atau numerik sederhana)
    """

    satisfaction: float = Field(..., ge=0.0, le=1.0)
    sentiment: float = Field(..., ge=0.0, le=1.0)
    categorical: Optional[Dict[str, Any]] = None


class SegmentationRequest(BaseModel):
    respondents: List[RespondentFeatures]
    k: Optional[int] = Field(
        default=None,
        description="Jika diisi, pakai nilai K ini. Jika kosong, sistem akan mencari K optimal dengan Elbow & Silhouette.",
    )
    k_min: int = Field(default=2, ge=2)
    k_max: int = Field(default=10, ge=2)


class SegmentationResponse(BaseModel):
    status: str
    message: str
    data: Dict[str, Any]


