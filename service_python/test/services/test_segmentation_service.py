import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "app" / "src"))

from services.segmentation_service import segment_respondents


def test_segment_respondents_basic():
    satisfaction = [0.8, 0.6, 0.4, 0.9]
    sentiment = [0.7, 0.5, 0.3, 0.8]
    product_features = [
        {"fitur_A": 1},
        {"fitur_A": 0},
        {"fitur_A": 1},
        {"fitur_A": 1},
    ]

    result = segment_respondents(
        satisfaction_scores=satisfaction,
        sentiment_scores=sentiment,
        product_features=product_features,
        k=2
    )

    assert "segments" in result
    assert "assignments" in result
    assert len(result["assignments"]) == 4