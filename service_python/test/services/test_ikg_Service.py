import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "app" / "src"))

from services.ikg_service import compute_combined_satisfaction_index


def test_ikg_all_puas():
    result = compute_combined_satisfaction_index(
        raw_responses=[
            {'likert': {'q1': 5}, 'text': 'Sangat puas', 'categorical': {}},
            {'likert': {'q1': 4}, 'text': 'Bagus', 'categorical': {}},
        ],
        categorical_features=[{}, {}],
        sentiment_labels=['positive', 'positive'],
        sentiment_confidence_scores=[0.9, 0.85],
        likert_min_val=1,
        likert_max_val=5,
    )

    assert result['survey_index'] > 75
    assert 'puas' in result['distribution']
    assert result['distribution']['puas'] >= 1


def test_ikg_all_netral():
    result = compute_combined_satisfaction_index(
        raw_responses=[
            {'likert': {'q1': 3}, 'text': 'Biasa', 'categorical': {}},
            {'likert': {'q1': 3}, 'text': 'Netral', 'categorical': {}},
        ],
        categorical_features=[{}, {}],
        sentiment_labels=['neutral', 'neutral'],
        sentiment_confidence_scores=[0.8, 0.8],
        likert_min_val=1,
        likert_max_val=5,
    )

    assert 50 <= result['survey_index'] <= 70


def test_ikg_all_tidak_puas():
    result = compute_combined_satisfaction_index(
        raw_responses=[
            {'likert': {'q1': 1}, 'text': 'Buruk', 'categorical': {}},
            {'likert': {'q1': 2}, 'text': 'Tidak puas', 'categorical': {}},
        ],
        categorical_features=[{}, {}],
        sentiment_labels=['negative', 'negative'],
        sentiment_confidence_scores=[0.9, 0.85],
        likert_min_val=1,
        likert_max_val=5,
    )

    assert result['survey_index'] < 50
    assert result['distribution']['tidak_puas'] >= 1