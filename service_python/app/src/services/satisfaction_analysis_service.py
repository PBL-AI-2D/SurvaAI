from typing import List, Dict, Any, Optional, Tuple

import numpy as np
import pandas as pd
from scipy.stats import pearsonr, spearmanr

from service_python.app.src.services import sentiment_analysis_service


def _normalize_likert(
    likert_list: List[Dict[str, float]],
    likert_min: float,
    likert_max: float,
) -> List[Dict[str, float]]:
    scale = likert_max - likert_min
    if scale <= 0:
        raise ValueError("likert_max must be greater than likert_min")

    normalized_all: List[Dict[str, float]] = []
    for ans in likert_list:
        normalized = {
            k: (float(v) - likert_min) / scale
            for k, v in ans.items()
        }
        normalized_all.append(normalized)
    return normalized_all


def _compute_overall_satisfaction(
    likert_normalized: List[Dict[str, float]]
) -> List[float]:
    scores: List[float] = []
    for ans in likert_normalized:
        if not ans:
            scores.append(0.0)
            continue
        vals = list(ans.values())
        scores.append(float(np.mean(vals)))
    return scores


def _run_sentiment(
    texts: List[Optional[str]],
) -> Tuple[List[Optional[str]], List[Optional[float]]]:
    labels: List[Optional[str]] = []
    scores: List[Optional[float]] = []

    for text in texts:
        if not text:
            labels.append(None)
            scores.append(None)
            continue

        pred = sentiment_analysis_service.predict_single(text)
        label = pred["label"]
        confidence = float(pred["confidence"])

        if label == "positive":
            score = confidence  # dekat 1
        elif label == "neutral":
            score = 0.5
        elif label == "negative":
            score = 1.0 - confidence  # dekat 0
        else:
            score = 0.5

        labels.append(label)
        scores.append(score)

    return labels, scores


def _sentiment_distribution(labels: List[Optional[str]]) -> Dict[str, int]:
    dist = {"positive": 0, "negative": 0, "neutral": 0, "unknown": 0}
    for l in labels:
        if l in dist:
            dist[l] += 1
        else:
            dist["unknown"] += 1
    return dist


def _compute_correlations(
    likert_normalized: List[Dict[str, float]],
    satisfaction_scores: List[float],
) -> Dict[str, Dict[str, float]]:
    if not likert_normalized:
        return {}

    df = pd.DataFrame(likert_normalized)
    df["overall_satisfaction"] = satisfaction_scores

    result: Dict[str, Dict[str, float]] = {}
    for col in df.columns:
        if col == "overall_satisfaction":
            continue
        try:
            pearson, _ = pearsonr(df[col], df["overall_satisfaction"])
            spearman, _ = spearmanr(df[col], df["overall_satisfaction"])
            result[col] = {
                "pearson": float(pearson),
                "spearman": float(spearman),
            }
        except Exception:
            result[col] = {
                "pearson": float("nan"),
                "spearman": float("nan"),
            }

    return result


def analyze_satisfaction(
    responses: List[Dict[str, Any]],
    likert_min: float = 1.0,
    likert_max: float = 5.0,
) -> Dict[str, Any]:
    if not responses:
        return {
            "overall_satisfaction_scores": [],
            "sentiment_labels": [],
            "sentiment_scores": [],
            "likert_normalized": [],
            "likert_correlation": {},
            "sentiment_distribution": {"positive": 0, "negative": 0, "neutral": 0, "unknown": 0},
        }

    likert_list: List[Dict[str, float]] = [r.get("likert", {}) for r in responses]
    texts: List[Optional[str]] = [r.get("text") for r in responses]

    likert_norm = _normalize_likert(likert_list, likert_min=likert_min, likert_max=likert_max)
    satisfaction_scores = _compute_overall_satisfaction(likert_norm)

    sentiment_labels, sentiment_scores = _run_sentiment(texts)
    dist = _sentiment_distribution(sentiment_labels)

    correlations = _compute_correlations(likert_norm, satisfaction_scores)

    return {
        "overall_satisfaction_scores": satisfaction_scores,
        "sentiment_labels": sentiment_labels,
        "sentiment_scores": sentiment_scores,
        "likert_normalized": likert_norm,
        "likert_correlation": correlations,
        "sentiment_distribution": dist,
    }


