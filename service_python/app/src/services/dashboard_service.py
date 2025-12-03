from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd

# Import services dengan relative import
from .satisfaction_analysis_service import analyze_satisfaction
from .segmentation_service import segment_respondents
from .eti_service import calculate_eti_score, predict_trend_from_eti
try:
    from .recommendation_service import generate_recommendations
except ImportError:
    # Fallback jika recommendation_service tidak ada
    generate_recommendations = None


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


def _convert_categorical_to_product_features(
    categorical_features: List[Dict[str, Any]]
) -> List[Dict[str, int]]:
    """
    Konversi categorical features menjadi product_features format One-Hot Encoding.
    Format output: List[Dict[str, int]] dimana setiap dict adalah one-hot untuk satu responden.
    """
    if not categorical_features:
        return []
    
    df_cat = pd.DataFrame(categorical_features)
    # Fill NaN values
    df_cat = df_cat.fillna(0)
    # Infer object types to avoid downcasting warning
    df_cat = df_cat.infer_objects(copy=False)
    # Convert object columns to numeric if possible, otherwise keep as is
    for col in df_cat.columns:
        try:
            df_cat[col] = pd.to_numeric(df_cat[col])
        except (TypeError, ValueError):
            # Keep as is if conversion fails
            pass
    
    # Konversi semua kolom menjadi integer (0 atau 1 untuk one-hot)
    product_features = []
    for idx in range(len(df_cat)):
        row_dict = {}
        for col in df_cat.columns:
            val = df_cat.iloc[idx][col]
            # Konversi ke 0 atau 1
            if pd.isna(val) or val == 0 or val == False or val == "":
                row_dict[str(col)] = 0  # Convert column name to string
            else:
                row_dict[str(col)] = 1  # Convert column name to string
        product_features.append(row_dict)
    
    return product_features


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
    # Handle both string and integer column names
    preference_cols = []
    for col in df_cat.columns:
        col_str = str(col).lower()  # Convert to string first
        if any(keyword in col_str for keyword in ['product', 'prefer', 'like', 'choose']):
            preference_cols.append(col)
    
    if not preference_cols:
        return {}
    
    # Hitung rata-rata (frekuensi) per preferensi
    preference_scores = {}
    for col in preference_cols:
        try:
            avg_score = df_cat[col].mean()
            if avg_score > 0:
                # Normalisasi ke persentase (asumsi one-hot encoding)
                preference_scores[str(col)] = round(avg_score * 100, 1)
        except (TypeError, ValueError):
            # Skip kolom yang tidak bisa dihitung mean-nya
            continue
    
    # Sort by score descending
    sorted_prefs = dict(sorted(preference_scores.items(), key=lambda x: x[1], reverse=True))
    return sorted_prefs


def _calculate_trend_from_eti(
    sentiment_scores: List[float],
    satisfaction_scores: List[float],
) -> str:
    """Hitung trend dari ETI score sederhana."""
    try:
        eti_scores = calculate_eti_score(
            sentiment_scores=sentiment_scores,
            satisfaction_scores=satisfaction_scores,
        )
        avg_eti = np.mean(eti_scores)
        
        if avg_eti > 0.7:
            return "positive"
        elif avg_eti < 0.4:
            return "negative"
        else:
            return "stable"
    except Exception:
        return "stable"


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
            pref_cols = []
            for col in cluster_cat.columns:
                if col == "cluster":
                    continue
                col_str = str(col).lower()  # Convert to string first
                if any(keyword in col_str for keyword in ['product', 'prefer', 'like', 'choose']):
                    pref_cols.append(col)
            
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
    
    satisfaction_scores = ai1_result.get("final_satisfaction_scores", [])
    sentiment_scores = [
        s if s is not None else 0.5
        for s in ai1_result.get("sentiment_scores", [])
    ]
    # Ensure sentiment_distribution always has the correct structure
    sentiment_dist_raw = ai1_result.get("sentiment_distribution", {})
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
    categorical_features = [r.get("categorical", {}) for r in responses]
    
    # Konversi categorical_features ke product_features (One-Hot Encoding)
    product_features = _convert_categorical_to_product_features(categorical_features)
    
    # 2. Jalankan AI-2: Segmentasi
    ai2_result = segment_respondents(
        satisfaction_scores=satisfaction_scores,
        sentiment_scores=sentiment_scores,
        product_features=product_features,
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
    
    # Extract cluster labels dari pca_plot
    pca_plot = ai2_result.get("pca_plot", [])
    clusters = [point.get("cluster", 0) for point in pca_plot] if pca_plot else []
    
    # Segment dengan highest satisfaction
    segment_details = _calculate_segment_details(
        clusters=clusters,
        satisfaction_scores=satisfaction_scores,
        categorical_features=categorical_features,
        pca_2d=pca_plot,
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
            "total_segments": ai2_result.get("k_used", 0),
            "clusters": clusters,
            "pca_2d": pca_plot,
            "segment_details": segment_details,
            "k_analysis": ai2_result.get("k_analysis"),
            "segments": ai2_result.get("segments", []),
        },
        
        # Dashboard Analytic Overview
        "analytics_overview": {
            "total_respondents": total_respondents,
            "avg_satisfaction_10": avg_satisfaction_10,
            "active_segments": ai2_result["k_used"],
            "satisfaction_trend": _calculate_trend_from_eti(
                sentiment_scores, satisfaction_scores
            ),
        },
        
        # Raw data untuk chart
        "chart_data": {
            "satisfaction_scores": satisfaction_scores,
            "sentiment_scores": sentiment_scores,
            "sentiment_labels": ai1_result.get("sentiment_labels", []),
            "likert_normalized": ai1_result.get("details", {}).get("likert_normalized", []),
            "likert_correlation": ai1_result.get("correlations", {}),
        },
    }
    
    return dashboard_data

