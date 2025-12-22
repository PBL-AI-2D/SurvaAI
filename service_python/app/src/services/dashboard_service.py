from typing import List, Dict, Any, Optional
from collections import Counter
import numpy as np
import pandas as pd

# Import services dengan relative import
from .satisfaction_analysis_service import analyze_satisfaction
from .segmentation_service import segment_respondents

try:
    from .recommendation_service import generate_recommendations
except ImportError:  # pragma: no cover - defensive fallback
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
    Handle array values (checkbox) dan single values (radio/dropdown).
    """
    if not categorical_features:
        return []
    
    # Collect all unique values across all categorical features untuk one-hot encoding
    all_unique_values = {}
    for cat_dict in categorical_features:
        if not cat_dict or not isinstance(cat_dict, dict):
            continue
        for col_name, col_value in cat_dict.items():
            if col_name not in all_unique_values:
                all_unique_values[col_name] = set()
            
            if col_value is None:
                continue
            
            # Handle array values (checkbox)
            if isinstance(col_value, list):
                for val in col_value:
                    if val is not None and val != "":
                        all_unique_values[col_name].add(str(val))
            elif isinstance(col_value, (dict, set)):
                for val in col_value:
                    if val is not None and val != "":
                        all_unique_values[col_name].add(str(val))
            else:
                # Single value
                val_str = str(col_value).strip()
                if val_str:
                    all_unique_values[col_name].add(val_str)
    
    # Build one-hot encoding untuk setiap responden
    product_features = []
    for cat_dict in categorical_features:
        row_dict = {}
        
        # Initialize semua kolom dengan 0
        for col_name, unique_values in all_unique_values.items():
            for val in unique_values:
                key = f"{str(col_name)}:{val}"
                row_dict[key] = 0
        
        # Set 1 untuk nilai yang dipilih responden ini
        if cat_dict and isinstance(cat_dict, dict):
            for col_name, col_value in cat_dict.items():
                if col_value is None:
                    continue
                
                # Handle array values (checkbox)
                if isinstance(col_value, list):
                    for val in col_value:
                        if val is not None and val != "":
                            val_str = str(val).strip()
                            if val_str:
                                key = f"{str(col_name)}:{val_str}"
                                if key in row_dict:
                                    row_dict[key] = 1
                elif isinstance(col_value, (dict, set)):
                    for val in col_value:
                        if val is not None and val != "":
                            val_str = str(val).strip()
                            if val_str:
                                key = f"{str(col_name)}:{val_str}"
                                if key in row_dict:
                                    row_dict[key] = 1
                else:
                    # Single value
                    val_str = str(col_value).strip()
                    if val_str:
                        key = f"{str(col_name)}:{val_str}"
                        if key in row_dict:
                            row_dict[key] = 1
        
        product_features.append(row_dict)
    
    return product_features


def _extract_preference_from_categorical(
    categorical_features: List[Dict[str, Any]]
) -> Dict[str, float]:
    """
    Extract distribusi preferensi/pilihan dari categorical features.
    Mengambil semua kolom categorical yang valid dan menghitung distribusinya.
    Handle array values (untuk checkbox) dan single values (untuk radio/dropdown).
    Filter kolom yang jelas bukan preferensi (seperti age, id, dll).
    """
    if not categorical_features:
        return {}
    
    # Filter out empty dicts untuk menghitung total responden yang punya data categorical
    non_empty_categorical = [cat for cat in categorical_features if cat and isinstance(cat, dict) and len(cat) > 0]
    
    if not non_empty_categorical:
        return {}
    
    # Kolom yang harus di-exclude (bukan preferensi)
    exclude_keywords = ['age', 'id', 'nama', 'name', 'email', 'phone', 'tanggal', 'date', 
                        'time', 'timestamp', 'created', 'updated', 'cluster']
    
    # Flatten array values dan hitung distribusi
    # Struktur: {col_name: {value: count}}
    col_value_counts = {}
    total_all_selections = 0  # Total semua pilihan yang dipilih (untuk normalisasi ke 100%)
    
    # Iterate through each categorical feature dict
    for cat_dict in non_empty_categorical:
        if not cat_dict or not isinstance(cat_dict, dict):
            continue
            
        for col_name, col_value in cat_dict.items():
            # Skip kolom yang jelas bukan preferensi
            col_str = str(col_name).lower()
            if any(exclude_kw in col_str for exclude_kw in exclude_keywords):
                continue
            
            # Skip jika nilai kosong atau None
            if col_value is None:
                continue
            
            # Initialize tracking untuk kolom ini
            if col_name not in col_value_counts:
                col_value_counts[col_name] = {}
            
            # Handle array values (checkbox) dan single values (radio/dropdown)
            values_to_count = []
            
            if isinstance(col_value, list):
                # Array values - flatten semua nilai
                for val in col_value:
                    if val is not None and val != "":
                        val_str = str(val).strip()
                        if val_str:
                            values_to_count.append(val_str)
            elif isinstance(col_value, (dict, set)):
                # Convert dict/set to list
                values_to_count = [str(v).strip() for v in col_value if v is not None and v != "" and str(v).strip()]
            else:
                # Single value
                val_str = str(col_value).strip()
                if val_str:
                    values_to_count.append(val_str)
            
            # Hitung distribusi untuk setiap nilai
            for value in values_to_count:
                if value not in col_value_counts[col_name]:
                    col_value_counts[col_name][value] = 0
                col_value_counts[col_name][value] += 1
                total_all_selections += 1
    
    # Konversi count ke persentase berdasarkan total semua pilihan (agar pie chart total = 100%)
    preference_scores = {}
    if total_all_selections > 0:
        for col_name, value_counts in col_value_counts.items():
            for value, count in value_counts.items():
                percentage = (count / total_all_selections) * 100
                # Format display name: "Kolom: Nilai"
                display_name = f"{str(col_name)}: {value}"
                preference_scores[display_name] = round(percentage, 1)
    
    # Filter out nilai dengan persentase 0 dan sort by score descending
    filtered_prefs = {k: v for k, v in preference_scores.items() if v > 0}
    sorted_prefs = dict(sorted(filtered_prefs.items(), key=lambda x: x[1], reverse=True))
    
    return sorted_prefs


def _calculate_trend_from_satisfaction(
    satisfaction_scores: List[float],
) -> str:
    """
    Hitung trend sederhana berbasis perubahan rata‑rata kepuasan (AI‑3).

    - Tidak menggunakan ARIMA / LSTM / forecasting berat.
    - Menganggap urutan skor sudah merefleksikan urutan waktu pengisian.
    - Bandingkan rata‑rata awal vs akhir:
        * > +0.05  → "positive"
        * < -0.05  → "negative"
        * lainnya  → "stable"
    """
    if not satisfaction_scores or len(satisfaction_scores) < 2:
        return "stable"

    scores = np.array(satisfaction_scores, dtype=float)

    # Bagi menjadi dua bagian (awal & akhir) sebagai pendekatan tren sederhana
    mid = len(scores) // 2
    first_half = scores[:max(1, mid)]
    second_half = scores[max(1, mid):]

    avg_first = float(np.mean(first_half))
    avg_second = float(np.mean(second_half))
    diff = avg_second - avg_first

    if diff > 0.05:
        return "positive"
    if diff < -0.05:
        return "negative"
    return "stable"


def _calculate_segment_details(
    clusters: List[int],
    satisfaction_scores: List[float],
    categorical_features: Optional[List[Dict[str, Any]]],
    pca_2d: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """
    Hitung profil tiap segment (SETELAH clustering, bukan saat clustering):

    - avg_satisfaction per segment
    - dominant_preference & all_preferences (berbasis fitur kategorikal)
    - respondent_count per segment
    """
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
            
            # Kolom yang harus di-exclude (bukan preferensi)
            exclude_keywords = ['age', 'id', 'nama', 'name', 'email', 'phone', 'tanggal', 'date', 
                              'time', 'timestamp', 'created', 'updated', 'cluster']
            
            # Cari kolom preferensi dengan nilai tertinggi
            pref_cols = []
            for col in cluster_cat.columns:
                if col == "cluster":
                    continue
                col_str = str(col).lower()
                # Skip kolom yang jelas bukan preferensi
                if any(exclude_kw in col_str for exclude_kw in exclude_keywords):
                    continue
                pref_cols.append(col)
            
            if pref_cols:
                # Hitung rata-rata untuk kolom numerik atau distribusi untuk non-numerik
                pref_scores_dict = {}
                for col in pref_cols:
                    try:
                        col_data = pd.to_numeric(cluster_cat[col], errors='coerce')
                        if not col_data.isna().all():
                            avg_score = col_data.mean()
                            if avg_score > 0:
                                pref_scores_dict[col] = avg_score
                        else:
                            # Untuk non-numerik, ambil nilai yang paling sering muncul
                            # Handle array values dalam kolom
                            all_values = []
                            for val in cluster_cat[col]:
                                if pd.isna(val):
                                    continue
                                if isinstance(val, list):
                                    all_values.extend([str(v) for v in val if v is not None and str(v).strip()])
                                else:
                                    all_values.append(str(val).strip())
                            
                            if all_values:
                                value_counts = Counter(all_values)
                                if value_counts:
                                    most_common_value = value_counts.most_common(1)[0][0]
                                    most_common_count = value_counts.most_common(1)[0][1]
                                    total_count = len(all_values)
                                    if total_count > 0:
                                        percentage = (most_common_count / total_count)
                                        # Format: hanya nilai, tanpa nama kolom jika terlalu panjang
                                        if len(most_common_value) <= 30:
                                            pref_scores_dict[f"{col}: {most_common_value}"] = percentage
                                        else:
                                            pref_scores_dict[most_common_value[:30]] = percentage
                    except (TypeError, ValueError):
                        continue
                
                if pref_scores_dict:
                    # Sort dan ambil yang tertinggi
                    sorted_prefs = sorted(pref_scores_dict.items(), key=lambda x: x[1], reverse=True)
                    if len(sorted_prefs) > 0 and sorted_prefs[0][1] > 0:
                        pref_key = str(sorted_prefs[0][0])
                        # Format: jika ada ":", ambil bagian setelah ":" saja
                        if ": " in pref_key:
                            dominant_preference = pref_key.split(": ", 1)[1].strip()
                        else:
                            dominant_preference = pref_key.replace("_", " ").title()
                        # Truncate jika terlalu panjang
                        if len(dominant_preference) > 40:
                            dominant_preference = dominant_preference[:37] + "..."
        
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
        
        # Hitung min/max satisfaction untuk menunjukkan range
        min_satisfaction = round(subset["satisfaction"].min() * 100, 1)
        max_satisfaction = round(subset["satisfaction"].max() * 100, 1)
        
        # Kumpulkan semua preferences yang berbeda (top 3)
        all_preferences_list = []
        if pref_scores_dict:
            sorted_prefs = sorted(pref_scores_dict.items(), key=lambda x: x[1], reverse=True)
            for pref_key, pref_score in sorted_prefs[:3]:  # Top 3 preferences
                if ": " in pref_key:
                    pref_value = pref_key.split(": ", 1)[1].strip()
                else:
                    pref_value = pref_key.replace("_", " ").title()
                if len(pref_value) > 30:
                    pref_value = pref_value[:27] + "..."
                all_preferences_list.append(pref_value)
        
        segment_details.append({
            "segment_id": int(cluster_id),  # cluster_id sudah 1-indexed dari pca_plot
            "avg_age": int(avg_age) if avg_age else None,
            "dominant_preference": dominant_preference,
            "all_preferences": all_preferences_list if all_preferences_list else [],
            "satisfaction_percentage": avg_satisfaction_pct,
            "satisfaction_range": f"{min_satisfaction}% - {max_satisfaction}%" if min_satisfaction != max_satisfaction else f"{avg_satisfaction_pct}%",
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
    # Extract categorical features (None akan menjadi {})
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
    
    # Kumpulkan semua text responses untuk analisis
    all_text_responses = []
    for r in responses:
        text = r.get("text", "")
        if text and isinstance(text, str) and text.strip():
            all_text_responses.append(text.strip())
    
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
    
    # 6. Insight / rekomendasi berbasis SEGMENT (rule‑based, tekstual)
    segment_insights = []
    if generate_recommendations is not None and segment_details:
        segment_insights = generate_recommendations(segment_details=segment_details)

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
            # mapping responden → segment (1‑indexed, urutan sama dengan responses)
            "assignments": ai2_result.get("assignments", []),
        },
        
        # Dashboard Analytic Overview
        "analytics_overview": {
            "total_respondents": total_respondents,
            "avg_satisfaction_10": avg_satisfaction_10,
            "active_segments": ai2_result["k_used"],
            "satisfaction_trend": _calculate_trend_from_satisfaction(
                satisfaction_scores
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
        
        # Text responses untuk Word Cloud dan analisis
        "text_analysis": {
            "all_text_responses": all_text_responses,
            "total_text_responses": len(all_text_responses),
        },

        # Insight / rekomendasi per segment (teks siap tampil)
        "segment_insights": segment_insights,
    }
    
    return dashboard_data

