import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "app" / "src"))

from services.eti_service import (
    calculate_eti_score,
    predict_trend_from_eti,
    calculate_trend_from_satisfaction
)


def test_calculate_eti_score_basic():
    ikg_scores = [80, 60, 40]  # boleh 0–100
    sentiment_conf = [0.9, 0.6, 0.3]

    eti = calculate_eti_score(
        sentiment_scores=[0.8, 0.5, 0.2],
        satisfaction_scores=ikg_scores,
        sentiment_confidence=sentiment_conf
    )

    assert len(eti) == 3
    for v in eti:
        assert 0.0 <= v <= 1.0


def test_predict_trend_from_eti():
    eti_scores = [0.8, 0.5, 0.2]
    trends, percentages = predict_trend_from_eti(eti_scores)

    assert trends == ["naik", "stabil", "turun"]
    assert len(percentages) == 3


def test_calculate_trend_from_satisfaction():
    scores = [60, 65, 70, 75]
    trend = calculate_trend_from_satisfaction(scores, num_batches=4)

    assert trend in ["positive", "stable", "negative"]