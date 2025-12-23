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


def _is_product_feature_question(question_text: str) -> bool:
    """
    Identifikasi apakah pertanyaan menanyakan tentang produk/features yang disukai.
    Hanya pertanyaan tentang preferensi produk/features yang akan digunakan untuk segmentasi.
    """
    if not question_text:
        return False
    
    question_lower = str(question_text).lower()
    
    # Kolom yang harus di-exclude (bukan preferensi produk/features)
    exclude_keywords = ['age', 'id', 'nama', 'name', 'email', 'phone', 'tanggal', 'date', 
                        'time', 'timestamp', 'created', 'updated', 'cluster',
                        'kendala', 'masalah', 'problem', 'issue', 'complaint', 'keluhan',
                        'saran', 'suggestion', 'feedback', 'komentar', 'comment']
    
    # Skip jika mengandung kata kunci exclude
    if any(exclude_kw in question_lower for exclude_kw in exclude_keywords):
        return False
    
    # Kata kunci yang menunjukkan pertanyaan tentang produk/features yang disukai
    product_feature_keywords = [
        'fitur', 'feature', 'produk', 'product',
        'suka', 'disukai', 'favorit', 'favorite', 'paling', 'helpful', 'membantu',
        'preferensi', 'preference', 'pilihan', 'choice', 'option',
        'manfaat', 'benefit', 'keuntungan', 'advantage',
        'yang menurut', 'yang anda', 'yang kamu', 'yang paling'
    ]
    
    # Harus mengandung minimal satu kata kunci produk/features
    return any(keyword in question_lower for keyword in product_feature_keywords)


def _convert_categorical_to_product_features(
    categorical_features: List[Dict[str, Any]]
) -> List[Dict[str, int]]:
    """
    Konversi categorical features menjadi product_features format One-Hot Encoding.
    Format output: List[Dict[str, int]] dimana setiap dict adalah one-hot untuk satu responden.
    Handle array values (checkbox) dan single values (radio/dropdown).
    
    PRIORITAS: 
    1. Hanya menggunakan VALUE/JAWABAN sebagai key, BUKAN "question:answer"
    2. Hanya mengambil produk/features yang disukai, bukan semua jawaban categorical
    Contoh: "Segmentation" bukan "Fitur Apa Saja Yang Menurut Anda Paling Membantu?: Segmentation"
    """
    if not categorical_features:
        return []
    
    # Kolom yang harus di-exclude (bukan preferensi)
    exclude_keywords = ['age', 'id', 'nama', 'name', 'email', 'phone', 'tanggal', 'date', 
                        'time', 'timestamp', 'created', 'updated', 'cluster']
    
    # Collect all unique VALUES (jawaban) saja, HANYA dari pertanyaan produk/features
    all_unique_values = set()
    for cat_dict in categorical_features:
        if not cat_dict or not isinstance(cat_dict, dict):
            continue
        for col_name, col_value in cat_dict.items():
            # Skip kolom yang jelas bukan preferensi
            col_str = str(col_name).lower()
            if any(exclude_kw in col_str for exclude_kw in exclude_keywords):
                continue
            
            # PRIORITAS: Hanya ambil pertanyaan tentang produk/features yang disukai
            if not _is_product_feature_question(col_name):
                continue
            
            if col_value is None:
                continue
            
            # Handle array values (checkbox)
            if isinstance(col_value, list):
                for val in col_value:
                    if val is not None and val != "":
                        val_str = str(val).strip()
                        if val_str:
                            all_unique_values.add(val_str)
            elif isinstance(col_value, (dict, set)):
                for val in col_value:
                    if val is not None and val != "":
                        val_str = str(val).strip()
                        if val_str:
                            all_unique_values.add(val_str)
            else:
                # Single value
                val_str = str(col_value).strip()
                if val_str:
                    all_unique_values.add(val_str)
    
    # Build one-hot encoding untuk setiap responden
    # Key hanya VALUE saja, bukan "question:value"
    product_features = []
    for cat_dict in categorical_features:
        row_dict = {}
        
        # Initialize semua kolom dengan 0 (hanya value sebagai key)
        for val in all_unique_values:
            row_dict[val] = 0
        
        # Set 1 untuk nilai yang dipilih responden ini
        if cat_dict and isinstance(cat_dict, dict):
            for col_name, col_value in cat_dict.items():
                # Skip kolom yang jelas bukan preferensi
                col_str = str(col_name).lower()
                if any(exclude_kw in col_str for exclude_kw in exclude_keywords):
                    continue
                
                # PRIORITAS: Hanya ambil pertanyaan tentang produk/features yang disukai
                if not _is_product_feature_question(col_name):
                    continue
                
                if col_value is None:
                    continue
                
                # Handle array values (checkbox)
                if isinstance(col_value, list):
                    for val in col_value:
                        if val is not None and val != "":
                            val_str = str(val).strip()
                            if val_str and val_str in row_dict:
                                row_dict[val_str] = 1
                elif isinstance(col_value, (dict, set)):
                    for val in col_value:
                        if val is not None and val != "":
                            val_str = str(val).strip()
                            if val_str and val_str in row_dict:
                                row_dict[val_str] = 1
                else:
                    # Single value
                    val_str = str(col_value).strip()
                    if val_str and val_str in row_dict:
                        row_dict[val_str] = 1
        
        product_features.append(row_dict)
    
    return product_features


def _extract_preference_from_categorical(
    categorical_features: List[Dict[str, Any]]
) -> Dict[str, float]:
    """
    Extract distribusi preferensi/pilihan dari categorical features.
    HANYA mengambil produk/features yang disukai, bukan semua jawaban categorical.
    Handle array values (untuk checkbox) dan single values (untuk radio/dropdown).
    Filter kolom yang jelas bukan preferensi (seperti age, id, dll).
    
    PRIORITAS: 
    1. Hanya return VALUE/JAWABAN saja, BUKAN "question:answer"
    2. Hanya produk/features yang disukai, bukan semua jawaban
    Contoh: {"Segmentation": 10.7} bukan {"Fitur Apa Saja Yang Menurut Anda Paling Membantu?: Segmentation": 10.7}
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
    # Struktur: {value: count} - HANYA VALUE, BUKAN "question:value"
    value_counts = {}
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
            
            # PRIORITAS: Hanya ambil pertanyaan tentang produk/features yang disukai
            if not _is_product_feature_question(col_name):
                continue
            
            # Skip jika nilai kosong atau None
            if col_value is None:
                continue
            
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
            
            # Hitung distribusi untuk setiap nilai (HANYA VALUE, BUKAN "question:value")
            for value in values_to_count:
                if value not in value_counts:
                    value_counts[value] = 0
                value_counts[value] += 1
                total_all_selections += 1
    
    # Konversi count ke persentase berdasarkan total semua pilihan (agar pie chart total = 100%)
    preferences_dict = {}
    if total_all_selections > 0:
        for value, count in value_counts.items():
            # Key: hanya value, bukan "col_name: value"
            percentage = (count / total_all_selections) * 100
            preferences_dict[value] = percentage
    
    # Sort berdasarkan persentase tertinggi
    sorted_preferences = sorted(preferences_dict.items(), key=lambda x: x[1], reverse=True)
    
    # Return top preferences (max 20 untuk menghindari terlalu banyak)
    return {pref: pct for pref, pct in sorted_preferences[:20]}


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
            # PRIORITAS: Hanya ambil pertanyaan tentang produk/features yang disukai
            pref_cols = []
            for col in cluster_cat.columns:
                if col == "cluster":
                    continue
                col_str = str(col).lower()
                # Skip kolom yang jelas bukan preferensi
                if any(exclude_kw in col_str for exclude_kw in exclude_keywords):
                    continue
                # Hanya ambil pertanyaan tentang produk/features yang disukai
                if not _is_product_feature_question(col):
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
                                        # PRIORITAS: Hanya nilai/jawaban saja, BUKAN "question: answer"
                                        # Truncate jika terlalu panjang
                                        if len(most_common_value) > 40:
                                            most_common_value = most_common_value[:37] + "..."
                                        pref_scores_dict[most_common_value] = percentage
                    except (TypeError, ValueError):
                        continue
                
                if pref_scores_dict:
                    # Sort dan ambil yang tertinggi
                    sorted_prefs = sorted(pref_scores_dict.items(), key=lambda x: x[1], reverse=True)
                    if len(sorted_prefs) > 0 and sorted_prefs[0][1] > 0:
                        # PRIORITAS: pref_key sudah hanya value saja, bukan "question: value"
                        dominant_preference = str(sorted_prefs[0][0]).strip()
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
            for pref_key, _ in sorted_prefs[:3]:  # Top 3 preferences
                # PRIORITAS: pref_key sudah hanya value saja, bukan "question: value"
                pref_value = str(pref_key).strip()
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
    # PRIORITAS 4 - MINIMUM DATA CHECK
    if len(responses) < 5:
        # Return early dengan pesan bahwa data belum cukup
        return {
            "ai_insight_summary": {
                "satisfaction_percentage": {"satisfied": 0.0, "neutral": 0.0, "unsatisfied": 0.0},
                "major_preference": {"name": "N/A", "percentage": 0.0},
                "highest_segment": {"segment_id": None, "satisfaction_percentage": 0.0},
            },
            "satisfaction_overview": {
                "total_respondents": len(responses),
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
                "total_respondents": len(responses),
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
            "insufficient_message": f"Data belum cukup untuk analisis AI. Minimal diperlukan 5 responden, saat ini hanya ada {len(responses)} responden.",
        }
    
    # Continue dengan normal flow jika data cukup
    
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
    # PRIORITAS 1 - Product Feature Mapping = 1 Responden = 1 Vektor
    product_features = _convert_categorical_to_product_features(categorical_features)
    
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
    if generate_recommendations is not None and segment_details and len(segment_details) > 0:
        try:
            segment_insights = generate_recommendations(segment_details=segment_details)
        except Exception as e:
            # Log error tapi jangan sampai mematahkan seluruh dashboard
            print(f"Warning: Error generating segment insights: {str(e)}")
            segment_insights = []

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

