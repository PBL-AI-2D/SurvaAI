"""
Dashboard Service - Orchestrator untuk menggabungkan hasil dari berbagai AI services.
Service ini hanya melakukan:
1. Validasi input sederhana
2. Memanggil service-service lain
3. Menggabungkan hasil JSON untuk dikirim ke Frontend
"""
from typing import List, Dict, Any, Optional
import numpy as np

# Import services
from .satisfaction_analysis_service import analyze_satisfaction
from .segmentation_service import segment_respondents
from .preference_analysis_service import (
    convert_categorical_to_product_features,
    extract_preference_from_categorical,
)
from .eti_service import calculate_trend_from_satisfaction
from .segment_transformation_service import transform_segments_to_details
from .satisfaction_utils_service import calculate_satisfaction_percentage

try:
    from .recommendation_service import generate_recommendations
except ImportError:  # pragma: no cover - defensive fallback
    generate_recommendations = None


def _validate_inputs(responses: List[Dict[str, Any]]) -> None:
    """
    Validasi input sederhana untuk dashboard data generation.
    
    Args:
        responses: List responses dari survey
    
    Raises:
        ValueError: Jika input tidak valid
    """
    if not isinstance(responses, list):
        raise ValueError("responses must be a list")
    
    if len(responses) == 0:
        raise ValueError("responses cannot be empty")


def _get_empty_dashboard_data(total_respondents: int) -> Dict[str, Any]:
    """
    Generate empty dashboard data structure untuk kasus data insufficient.
    
    Args:
        total_respondents: Jumlah responden
    
    Returns:
        Dictionary dengan struktur dashboard data kosong
    """
    return {
        "ai_insight_summary": {
            "satisfaction_percentage": {"satisfied": 0.0, "neutral": 0.0, "unsatisfied": 0.0},
            "major_preference": {"name": "N/A", "percentage": 0.0},
            "highest_segment": {"segment_id": None, "satisfaction_percentage": 0.0},
        },
        "satisfaction_overview": {
            "total_respondents": total_respondents,
            "satisfaction_distribution": {"positive": 0, "negative": 0, "neutral": 0},
            "satisfaction_percentage": {"satisfied": 0.0, "neutral": 0.0, "unsatisfied": 0.0},
            "avg_satisfaction_10": 0.0,
            "preferences": {},
        },
        "segmentation": {
            "total_segments": 0,
            "clusters": [],
            "pca_2d": [],
            "segment_details": [],
            "k_analysis": None,
            "segments": [],
            "assignments": [],
        },
        "analytics_overview": {
            "total_respondents": total_respondents,
            "avg_satisfaction_10": 0.0,
            "active_segments": 0,
            "satisfaction_trend": "stable",
        },
        "chart_data": {
            "satisfaction_scores": [],
            "sentiment_scores": [],
            "sentiment_labels": [],
            "likert_normalized": [],
            "likert_correlation": {},
        },
        "text_analysis": {
            "all_text_responses": [],
            "total_text_responses": 0,
        },
        "segment_insights": [],
        "data_insufficient": True,
        "insufficient_message": (
            f"Data belum cukup untuk analisis AI. "
            f"Minimal diperlukan 5 responden, saat ini hanya ada {total_respondents} responden."
        ),
    }


def _extract_text_responses(responses: List[Dict[str, Any]]) -> List[str]:
    """
    Extract text responses dari list responses.
    
    Args:
        responses: List responses dari survey
    
    Returns:
        List text responses yang valid
    """
    all_text_responses = []
    for r in responses:
        text = r.get("text", "")
        if text and isinstance(text, str) and text.strip():
            all_text_responses.append(text.strip())
    return all_text_responses


def _extract_categorical_features(responses: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Extract categorical features dari list responses.
    
    Args:
        responses: List responses dari survey
    
    Returns:
        List categorical features (dict per responden)
    """
    categorical_features = []
    for r in responses:
        cat = r.get("categorical")
        # Handle None, empty dict, atau dict yang valid
        if cat is None:
            categorical_features.append({})
        elif isinstance(cat, dict):
            categorical_features.append(cat)
        else:
            categorical_features.append({})
    return categorical_features


def _normalize_sentiment_distribution(
    sentiment_dist_raw: Any,
    satisfaction_scores: List[float],
) -> Dict[str, int]:
    """
    Normalize sentiment distribution dari hasil AI service.
    Jika sentiment distribution kosong, gunakan satisfaction scores sebagai fallback.
    
    Args:
        sentiment_dist_raw: Raw sentiment distribution dari AI service
        satisfaction_scores: List satisfaction scores (0-1)
    
    Returns:
        Dictionary dengan keys "positive", "negative", "neutral"
    """
    if not isinstance(sentiment_dist_raw, dict):
        sentiment_dist = {"positive": 0, "negative": 0, "neutral": 0}
    else:
        sentiment_dist = {
            "positive": int(sentiment_dist_raw.get("positive", 0)),
            "negative": int(sentiment_dist_raw.get("negative", 0)),
            "neutral": int(sentiment_dist_raw.get("neutral", 0)),
        }
    
    # Jika sentiment_distribution kosong (semua 0), gunakan satisfaction_scores sebagai fallback
    total_sentiment = sentiment_dist["positive"] + sentiment_dist["negative"] + sentiment_dist["neutral"]
    if total_sentiment == 0 and satisfaction_scores:
        # Hitung distribusi sentimen berdasarkan satisfaction scores
        # Score > 0.7 = positive, < 0.3 = negative, else = neutral
        for score in satisfaction_scores:
            if score > 0.7:
                sentiment_dist["positive"] += 1
            elif score < 0.3:
                sentiment_dist["negative"] += 1
            else:
                sentiment_dist["neutral"] += 1
    
    return sentiment_dist


def generate_dashboard_data(
    responses: List[Dict[str, Any]],
    likert_min: float = 1.0,
    likert_max: float = 5.0,
    k: Optional[int] = None,
    k_min: int = 2,
    k_max: int = 10,
) -> Dict[str, Any]:
    """
    Generate data lengkap untuk dashboard dengan mengkombinasikan AI-1 dan AI-2.
    
    Service ini hanya melakukan orchestration:
    1. Validasi input
    2. Memanggil service-service lain
    3. Menggabungkan hasil JSON untuk dikirim ke Frontend
    
    Args:
        responses: List responses dari survey
        likert_min: Minimum value untuk likert scale
        likert_max: Maximum value untuk likert scale
        k: Jumlah cluster (optional, akan di-optimize jika None)
        k_min: Minimum jumlah cluster untuk optimization
        k_max: Maximum jumlah cluster untuk optimization
    
    Returns:
        Dictionary dengan struktur sesuai kebutuhan dashboard frontend.
    """
    # 1. Validasi input sederhana
    _validate_inputs(responses)
    
    # 2. Minimum data check
    if len(responses) < 5:
        return _get_empty_dashboard_data(len(responses))
    
    # 3. Extract data dari responses
    categorical_features = _extract_categorical_features(responses)
    all_text_responses = _extract_text_responses(responses)
    total_respondents = len(responses)
    
    # 4. Jalankan AI-1: Analisis Kepuasan
    ai1_result = analyze_satisfaction(
        responses=responses,
        likert_min=likert_min,
        likert_max=likert_max,
    )
    
    satisfaction_scores = ai1_result.get("final_satisfaction_scores", [])
    sentiment_scores = [
        s if s is not None else 0.5
        for s in ai1_result.get("sentiment_scores", [])
    ]
    sentiment_dist = _normalize_sentiment_distribution(
        ai1_result.get("sentiment_distribution", {}),
        satisfaction_scores,
    )
    
    # 5. Konversi categorical_features ke product_features (One-Hot Encoding)
    product_features = convert_categorical_to_product_features(categorical_features)
    
    # Validasi: Pastikan jumlah product_features sama dengan jumlah responden
    if len(product_features) != len(responses):
        raise ValueError(
            f"Product features mapping error: expected {len(responses)} vectors, "
            f"got {len(product_features)}. Each respondent must have exactly one feature vector."
        )
    
    # Debug: Validasi bahwa setiap responden punya vektor sendiri
    for i, pf in enumerate(product_features):
        if not isinstance(pf, dict):
            raise ValueError(
                f"Product feature at index {i} is not a dictionary. "
                f"Each respondent must have a dict of one-hot encoded features."
            )
    
    # 6. Jalankan AI-2: Segmentasi
    ai2_result = segment_respondents(
        satisfaction_scores=satisfaction_scores,
        sentiment_scores=sentiment_scores,
        product_features=product_features,
        k=k,
        k_min=k_min,
        k_max=k_max,
    )
    
    # 7. Transform segments ke format dashboard
    segments_from_service = ai2_result.get("segments", [])
    assignments = ai2_result.get("assignments", [])
    segment_details = transform_segments_to_details(
        segments_from_service=segments_from_service,
        satisfaction_scores=satisfaction_scores,
        assignments=assignments,
    )
    
    # 8. Calculate satisfaction percentage
    satisfaction_pct = calculate_satisfaction_percentage(sentiment_dist, total_respondents)
    
    # 9. Extract preferences
    all_preferences = extract_preference_from_categorical(categorical_features)
    major_preference = None
    major_preference_pct = 0.0
    if all_preferences:
        major_preference = list(all_preferences.keys())[0]
        major_preference_pct = all_preferences[major_preference]
    
    # 10. Find highest segment
    highest_segment = None
    if segment_details:
        highest_segment = max(segment_details, key=lambda x: x["satisfaction_percentage"])
    
    # 11. Calculate average satisfaction (0-10 scale)
    avg_satisfaction_10 = round(np.mean(satisfaction_scores) * 10, 1) if satisfaction_scores else 0.0
    
    # 12. Calculate trend
    satisfaction_trend = calculate_trend_from_satisfaction(satisfaction_scores)
    
    # 13. Generate segment insights (recommendations)
    segment_insights = []
    if generate_recommendations is not None and segment_details and len(segment_details) > 0:
        try:
            segment_insights = generate_recommendations(segment_details=segment_details)
        except Exception as e:
            # Log error tapi jangan sampai mematahkan seluruh dashboard
            print(f"Warning: Error generating segment insights: {str(e)}")
            segment_insights = []
    
    # 14. Extract cluster labels dari pca_plot
    pca_plot = ai2_result.get("pca_plot", [])
    clusters = [point.get("cluster", 0) for point in pca_plot] if pca_plot else []
    
    # 15. Aggregate semua data untuk response
    dashboard_data = {
        # AI Insight Summary
        "ai_insight_summary": {
            "satisfaction_percentage": satisfaction_pct,
            "major_preference": {
                "name": major_preference.replace("_", " ").title() if major_preference else "N/A",
                "percentage": major_preference_pct,
            },
            "highest_segment": {
                "segment_id": highest_segment["segment_id"] if highest_segment else None,
                "satisfaction_percentage": highest_segment["satisfaction_percentage"] if highest_segment else 0.0,
            },
        },
        
        # Satisfaction & Preference Overview
        "satisfaction_overview": {
            "total_respondents": total_respondents,
            "satisfaction_distribution": sentiment_dist,
            "satisfaction_percentage": satisfaction_pct,
            "avg_satisfaction_10": avg_satisfaction_10,
            "preferences": all_preferences,
        },
        
        # AI Respondent Segmentation
        "segmentation": {
            "total_segments": ai2_result.get("k_used", 0),
            "clusters": clusters,
            "pca_2d": pca_plot,
            "segment_details": segment_details,
            "k_analysis": ai2_result.get("k_analysis"),
            "segments": ai2_result.get("segments", []),
            "assignments": assignments,
        },
        
        # Dashboard Analytic Overview
        "analytics_overview": {
            "total_respondents": total_respondents,
            "avg_satisfaction_10": avg_satisfaction_10,
            "active_segments": ai2_result.get("k_used", 0),
            "satisfaction_trend": satisfaction_trend,
        },
        
        # Raw data untuk chart
        "chart_data": {
            "satisfaction_scores": satisfaction_scores,
            "sentiment_scores": sentiment_scores,
            "sentiment_labels": ai1_result.get("sentiment_labels", []),
            "likert_normalized": ai1_result.get("details", {}).get("likert_normalized", []),
            "likert_correlation": ai1_result.get("correlations", {}),
        },
        
        # Text responses untuk Word Cloud dan analisis
        "text_analysis": {
            "all_text_responses": all_text_responses,
            "total_text_responses": len(all_text_responses),
        },
        
        # Insight / rekomendasi per segment (teks siap tampil)
        "segment_insights": segment_insights,
        
        # Data sufficiency flags
        "data_insufficient": False,
        "insufficient_message": None,
    }
    
    return dashboard_data
