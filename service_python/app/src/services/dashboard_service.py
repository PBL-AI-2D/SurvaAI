from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd

# Import services dengan fallback untuk berbagai konteks
try:
    from service_python.app.src.services.satisfaction_analysis_service import analyze_satisfaction
    from service_python.app.src.services.preference_analysis_service import segment_respondents
except ImportError:
    try:
        from app.src.services.satisfaction_analysis_service import analyze_satisfaction
        from app.src.services.preference_analysis_service import segment_respondents
    except ImportError:
        # Fallback untuk relative import jika diperlukan
        import sys
        from pathlib import Path
        # Add parent to path jika belum ada
        current_file = Path(__file__).resolve()
        service_dir = current_file.parent
        if str(service_dir.parent.parent) not in sys.path:
            sys.path.insert(0, str(service_dir.parent.parent))
        from app.src.services.satisfaction_analysis_service import analyze_satisfaction
        from app.src.services.preference_analysis_service import segment_respondents


def _calculate_satisfaction_percentage(sentiment_dist: Dict[str, int], total: int) -> Dict[str, float]:
    """Hitung persentase sentimen dari distribusi."""
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


def _extract_preference_from_categorical(
    categorical_features: List[Dict[str, Any]]
) -> Dict[str, float]:
    """
    Extract preferensi produk/jasa dari categorical features.
    Asumsi: kolom yang mengandung 'product', 'prefer', atau nama produk tertentu.
    """
    if not categorical_features:
        return {}
    
    df_cat = pd.DataFrame(categorical_features)
    
    # Cari kolom yang kemungkinan adalah preferensi produk
    preference_cols = [
        col for col in df_cat.columns
        if any(keyword in col.lower() for keyword in ['product', 'prefer', 'like', 'choose'])
    ]
    
    if not preference_cols:
        return {}
    
    # Hitung rata-rata (frekuensi) per preferensi
    preference_scores = {}
    for col in preference_cols:
        avg_score = df_cat[col].mean()
        if avg_score > 0:
            # Normalisasi ke persentase (asumsi one-hot encoding)
            preference_scores[col] = round(avg_score * 100, 1)
    
    # Sort by score descending
    sorted_prefs = dict(sorted(preference_scores.items(), key=lambda x: x[1], reverse=True))
    return sorted_prefs


def _calculate_segment_details(
    clusters: List[int],
    satisfaction_scores: List[float],
    categorical_features: Optional[List[Dict[str, Any]]],
    pca_2d: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """Hitung detail per segment: avg age, dominant preference, satisfaction %."""
    df_segments = pd.DataFrame({
        "cluster": clusters,
        "satisfaction": satisfaction_scores,
    })
    
    if pca_2d:
        df_pca = pd.DataFrame(pca_2d)
        df_segments["pca_x"] = df_pca["x"]
        df_segments["pca_y"] = df_pca["y"]
    
    segment_details = []
    unique_clusters = sorted(df_segments["cluster"].unique())
    
    for cluster_id in unique_clusters:
        subset = df_segments[df_segments["cluster"] == cluster_id]
        
        # Avg satisfaction dalam persentase (0-1 -> 0-100)
        avg_satisfaction_pct = round(subset["satisfaction"].mean() * 100, 1)
        
        # Dominant preference dari categorical
        dominant_preference = "N/A"
        if categorical_features:
            cat_df = pd.DataFrame(categorical_features)
            cat_df["cluster"] = clusters
            
            cluster_cat = cat_df[cat_df["cluster"] == cluster_id]
            
            # Cari kolom preferensi dengan nilai tertinggi
            pref_cols = [
                col for col in cluster_cat.columns
                if col != "cluster" and any(keyword in col.lower() 
                    for keyword in ['product', 'prefer', 'like', 'choose'])
            ]
            
            if pref_cols:
                pref_scores = cluster_cat[pref_cols].mean().sort_values(ascending=False)
                if len(pref_scores) > 0 and pref_scores.iloc[0] > 0:
                    dominant_preference = pref_scores.index[0].replace("prefer_", "").replace("_", " ").title()
        
        # Avg age (jika ada)
        avg_age = None
        if categorical_features:
            cat_df = pd.DataFrame(categorical_features)
            cat_df["cluster"] = clusters
            cluster_cat = cat_df[cat_df["cluster"] == cluster_id]
            
            if "age" in cluster_cat.columns:
                avg_age = round(cluster_cat["age"].mean(), 0)
        
        # Tentukan status satisfaction (green/orange/red)
        if avg_satisfaction_pct >= 70:
            satisfaction_status = "high"  # green
        elif avg_satisfaction_pct >= 50:
            satisfaction_status = "medium"  # orange
        else:
            satisfaction_status = "low"  # red
        
        segment_details.append({
            "segment_id": int(cluster_id) + 1,  # 1-indexed untuk display
            "avg_age": int(avg_age) if avg_age else None,
            "dominant_preference": dominant_preference,
            "satisfaction_percentage": avg_satisfaction_pct,
            "satisfaction_status": satisfaction_status,
            "respondent_count": len(subset),
        })
    
    return segment_details


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
    
    Returns:
        Dictionary dengan struktur sesuai kebutuhan dashboard frontend.
    """
    # 1. Jalankan AI-1: Analisis Kepuasan
    ai1_result = analyze_satisfaction(
        responses=responses,
        likert_min=likert_min,
        likert_max=likert_max,
    )
    
    satisfaction_scores = ai1_result["overall_satisfaction_scores"]
    sentiment_scores = [
        s if s is not None else 0.5
        for s in ai1_result["sentiment_scores"]
    ]
    sentiment_dist = ai1_result["sentiment_distribution"]
    categorical_features = [r.get("categorical", {}) for r in responses]
    
    # 2. Jalankan AI-2: Segmentasi
    ai2_result = segment_respondents(
        satisfaction_scores=satisfaction_scores,
        sentiment_scores=sentiment_scores,
        categorical_features=categorical_features,
        k=k,
        k_min=k_min,
        k_max=k_max,
    )
    
    # 3. Aggregate data untuk dashboard
    total_respondents = len(responses)
    
    # AI Insight Summary
    satisfaction_pct = _calculate_satisfaction_percentage(sentiment_dist, total_respondents)
    
    # Major preference
    all_preferences = _extract_preference_from_categorical(categorical_features)
    major_preference = None
    major_preference_pct = 0.0
    if all_preferences:
        major_preference = list(all_preferences.keys())[0]
        major_preference_pct = all_preferences[major_preference]
    
    # Segment dengan highest satisfaction
    segment_details = _calculate_segment_details(
        clusters=ai2_result["clusters"],
        satisfaction_scores=satisfaction_scores,
        categorical_features=categorical_features,
        pca_2d=ai2_result["pca_2d"],
    )
    
    highest_segment = None
    if segment_details:
        highest_segment = max(segment_details, key=lambda x: x["satisfaction_percentage"])
    
    # Avg satisfaction dalam skala 0-10 (dari 0-1)
    avg_satisfaction_10 = round(np.mean(satisfaction_scores) * 10, 1) if satisfaction_scores else 0.0
    
    # Build response
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
            "total_segments": ai2_result["k_used"],
            "clusters": ai2_result["clusters"],
            "pca_2d": ai2_result["pca_2d"],
            "segment_details": segment_details,
            "k_analysis": ai2_result.get("k_analysis"),
        },
        
        # Dashboard Analytic Overview
        "analytics_overview": {
            "total_respondents": total_respondents,
            "avg_satisfaction_10": avg_satisfaction_10,
            "active_segments": ai2_result["k_used"],
            "satisfaction_trend": "positive",  # TODO: implement trend analysis (AI-3)
        },
        
        # Raw data untuk chart
        "chart_data": {
            "satisfaction_scores": satisfaction_scores,
            "sentiment_scores": sentiment_scores,
            "sentiment_labels": ai1_result["sentiment_labels"],
            "likert_normalized": ai1_result["likert_normalized"],
            "likert_correlation": ai1_result.get("likert_correlation", {}),
        },
    }
    
    return dashboard_data

