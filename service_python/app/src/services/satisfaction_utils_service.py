"""
Utility service untuk perhitungan satisfaction percentage dan helper functions.
"""
from typing import Dict


def calculate_satisfaction_percentage(sentiment_dist: Dict[str, int], total: int) -> Dict[str, float]:
    """
    Hitung persentase sentimen dari distribusi.
    
    Args:
        sentiment_dist: Dictionary dengan keys "positive", "negative", "neutral"
        total: Total jumlah responden
    
    Returns:
        Dictionary dengan keys "satisfied", "neutral", "unsatisfied" dalam persentase
    """
    if total == 0:
        return {"satisfied": 0.0, "neutral": 0.0, "unsatisfied": 0.0}
    
    satisfied = sentiment_dist.get("positive", 0)
    neutral = sentiment_dist.get("neutral", 0)
    unsatisfied = sentiment_dist.get("negative", 0)
    
    return {
        "satisfied": round((satisfied / total) * 100, 1),
        "neutral": round((neutral / total) * 100, 1),
        "unsatisfied": round((unsatisfied / total) * 100, 1),
    }

