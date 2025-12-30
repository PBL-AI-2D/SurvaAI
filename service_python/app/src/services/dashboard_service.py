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
    # ------------------------------------------------------------------
    # Helper lokal untuk menghitung Indeks Kepuasan Gabungan (IKG)
    # ------------------------------------------------------------------

    def _map_sentiment_label_to_score(label: Optional[str]) -> Optional[float]:
        """
        Mapping label sentimen NLP ke skor kepuasan 0‑100.

        Sumber skor:
        - positive  -> 85
        - neutral   -> 70
        - negative  -> 50

        Alasan mapping:
        - Positif diberi skor tinggi namun tidak 100 agar masih bisa
          "dikoreksi" oleh komponen lain (Likert / pilihan).
        - Netral di tengah (70) agar tidak terlalu menurunkan skor jika
          responden tidak banyak menulis opini.
        - Negatif tidak dibuat terlalu rendah (50) supaya masih bisa
          tertolong jika Likert menunjukkan kepuasan yang baik.
        """
        if not label:
            return None

        label_lower = str(label).lower()
        if label_lower == "positive":
            return 85.0
        if label_lower == "neutral":
            return 70.0
        if label_lower == "negative":
            return 50.0
        return None

    def _map_preference_value_to_score(value: str) -> Optional[float]:
        """
        Mapping jawaban kategorikal bernuansa kepuasan ke skor 0‑100.

        Aturan semantik utama:
        - "sangat puas"      -> 90
        - "puas"             -> 80
        - "biasa saja/netral"-> 65
        - "tidak puas/kurang puas" -> 40

        Alasan mapping:
        - Skala dibuat konsisten dengan sentimen: sangat puas di atas 85,
          puas sedikit di bawah, netral di area menengah, tidak puas cukup
          rendah namun tidak 0 agar tetap bisa digabung dengan indikator lain.
        """
        if not value:
            return None

        v = str(value).strip().lower()

        # Sangat puas / sangat senang
        if "sangat puas" in v or ("sangat" in v and "puas" in v):
            return 90.0

        # Tidak puas / kurang puas
        if "tidak puas" in v or "kurang puas" in v or ("tidak" in v and "puas" in v):
            return 40.0

        # Netral / biasa saja
        if "biasa saja" in v or "biasa" in v or "netral" in v:
            return 65.0

        # Puas (tanpa modifier "sangat" / "tidak")
        if "puas" in v:
            return 80.0

        return None

    def _compute_preference_scores_from_categorical(
        categorical: List[Dict[str, Any]]
    ) -> List[Optional[float]]:
        """
        Hitung skor kepuasan berbasis jawaban dropdown / multiple choice / checkbox.

        Untuk tiap responden:
        - Ambil semua nilai kategorikal (termasuk array / checkbox).
        - Mapping dengan _map_preference_value_to_score.
        - Jika ada lebih dari satu jawaban kepuasan, diambil rata‑ratanya.

        Alasan fallback:
        - Jika tidak ada satu pun nilai yang bisa di‑mapping, kembalikan None
          agar komponen ini tidak dipakai dalam IKG responden.
        """
        result: List[Optional[float]] = []

        for ans in categorical:
            if not ans or not isinstance(ans, dict):
                result.append(None)
                continue

            scores: List[float] = []

            for raw_val in ans.values():
                if raw_val is None:
                    continue

                # Handle checkbox (list) dan single value
                values_to_check: List[Any]
                if isinstance(raw_val, list):
                    values_to_check = raw_val
                elif isinstance(raw_val, (set, tuple)):
                    values_to_check = list(raw_val)
                else:
                    values_to_check = [raw_val]

                for v in values_to_check:
                    score = _map_preference_value_to_score(str(v))
                    if score is not None:
                        scores.append(score)

            if scores:
                result.append(float(sum(scores) / len(scores)))
            else:
                result.append(None)

        return result

    def _compute_combined_satisfaction_index(
        *,
        raw_responses: List[Dict[str, Any]],
        categorical_features: List[Dict[str, Any]],
        sentiment_labels: List[Any],
        likert_min_val: float,
        likert_max_val: float,
    ) -> Dict[str, Any]:
        """
        Hitung Indeks Kepuasan Gabungan (IKG) per responden dan per survei.

        Sumber skor:
        - Likert / numerik   -> dinormalisasi ke 0‑100
        - Teks (sentimen)    -> mapping label ke skor tetap (85/70/50)
        - Pilihan (dropdown/checkbox) -> mapping label kepuasan (90/80/65/40)

        Logika fallback (WAJIB):
        - Jika suatu respon tidak punya Likert, hanya teks + pilihan yang dipakai.
        - Jika tidak punya teks, hanya Likert + pilihan yang dipakai.
        - Jika hanya punya pilihan, indeks tetap dihitung dari pilihan saja.
        - Jika ketiganya kosong, fallback terakhir memakai skor kepuasan holistik
          dari sistem (jika tersedia) supaya grafik tidak kosong.
        """
        n = len(raw_responses)
        if n == 0:
            return {
                "per_respondent": [],
                "survey_index": 0.0,
                "distribution": {"puas": 0, "netral": 0, "tidak_puas": 0},
                "labels_per_respondent": [],
            }

        # Skor preferensi per responden (berbasis jawaban kategorikal)
        preference_scores = _compute_preference_scores_from_categorical(
            categorical_features
        )

        # Indeks per responden (0‑100)
        ikg_per_respondent: List[float] = []
        labels_per_respondent: List[str] = []

        scale = max(likert_max_val - likert_min_val, 1e-6)

        for idx in range(n):
            resp = raw_responses[idx] or {}

            # 1) Skor Likert: rata‑rata semua nilai kemudian dinormalisasi ke 0‑100
            likert_raw = resp.get("likert") or {}
            likert_score_100: Optional[float] = None
            if isinstance(likert_raw, dict) and likert_raw:
                numeric_vals = []
                for v in likert_raw.values():
                    try:
                        numeric_vals.append(float(v))
                    except (TypeError, ValueError):
                        continue
                if numeric_vals:
                    mean_val = float(sum(numeric_vals) / len(numeric_vals))
                    norm_0_1 = (mean_val - likert_min_val) / scale
                    likert_score_100 = float(max(0.0, min(1.0, norm_0_1)) * 100.0)

            # 2) Skor Sentimen dari label model NLP (positive/neutral/negative)
            sentiment_label = (
                sentiment_labels[idx] if idx < len(sentiment_labels) else None
            )
            sentiment_score_100 = _map_sentiment_label_to_score(sentiment_label)

            # 3) Skor Preferensi dari jawaban kategorikal (jika ada)
            pref_score_100 = (
                preference_scores[idx]
                if idx < len(preference_scores)
                else None
            )

            components: List[float] = []
            if likert_score_100 is not None:
                components.append(likert_score_100)
            if sentiment_score_100 is not None:
                components.append(sentiment_score_100)
            if pref_score_100 is not None:
                components.append(pref_score_100)

            if components:
                ikg_value = float(sum(components) / len(components))
            else:
                # Fallback terakhir: jika benar‑benar tidak ada komponen eksplisit,
                # kembalikan 0.0 dan biarkan distribusi dianggap "Tidak Puas".
                ikg_value = 0.0

            # Clamp ke 0‑100
            ikg_value = float(max(0.0, min(100.0, ikg_value)))
            ikg_per_respondent.append(ikg_value)

            # Label kategori per responden, mengikuti aturan global:
            # ≥ 80  -> Puas, 60–79 -> Netral, < 60 -> Tidak Puas
            if ikg_value >= 80.0:
                label = "Puas"
            elif ikg_value >= 60.0:
                label = "Netral"
            else:
                label = "Tidak Puas"
            labels_per_respondent.append(label)

        # Indeks survei = rata‑rata seluruh IKG responden
        survey_index = float(sum(ikg_per_respondent) / len(ikg_per_respondent))

        # Distribusi kategori berdasarkan IKG responden
        dist = {"puas": 0, "netral": 0, "tidak_puas": 0}
        for label in labels_per_respondent:
            if label == "Puas":
                dist["puas"] += 1
            elif label == "Netral":
                dist["netral"] += 1
            else:
                dist["tidak_puas"] += 1

        return {
            "per_respondent": ikg_per_respondent,
            "survey_index": survey_index,
            "distribution": dist,
            "labels_per_respondent": labels_per_respondent,
        }

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

    # ------------------------------------------------------------------
    # 4b. HITUNG INDEKS KEPUASAN GABUNGAN (IKG)
    # ------------------------------------------------------------------
    combined_index_result = _compute_combined_satisfaction_index(
        raw_responses=responses,
        categorical_features=categorical_features,
        sentiment_labels=ai1_result.get("sentiment_labels", []),
        likert_min_val=likert_min,
        likert_max_val=likert_max,
    )

    ikg_per_respondent: List[float] = combined_index_result["per_respondent"]
    ikg_survey: float = combined_index_result["survey_index"]
    ikg_distribution = combined_index_result["distribution"]

    # Konversi IKG 0‑100 ke 0‑1 untuk reuse di chart & metrik rata‑rata
    ikg_scores_0_1: List[float] = [
        (score / 100.0) if score is not None else 0.0 for score in ikg_per_respondent
    ]
    
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
    #    Menggunakan distribusi IKG (bukan hanya sentimen) agar grafik
    #    "Distribution of respondent satisfaction levels" selalu berbasis
    #    indeks gabungan semua tipe pertanyaan.
    if total_respondents > 0:
        satisfied_pct = (ikg_distribution["puas"] / total_respondents) * 100.0
        neutral_pct = (ikg_distribution["netral"] / total_respondents) * 100.0
        unsatisfied_pct = (ikg_distribution["tidak_puas"] / total_respondents) * 100.0
    else:
        satisfied_pct = neutral_pct = unsatisfied_pct = 0.0

    satisfaction_pct = {
        "satisfied": satisfied_pct,
        "neutral": neutral_pct,
        "unsatisfied": unsatisfied_pct,
    }
    
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
    
    # 11. Calculate average satisfaction (0-10 scale) berbasis IKG
    avg_satisfaction_10 = (
        round(float(np.mean(ikg_scores_0_1)) * 10, 1) if ikg_scores_0_1 else 0.0
    )
    
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
            # Gunakan IKG (0‑1) sebagai dasar grafik kepuasan responden,
            # sehingga mencerminkan kombinasi Likert + teks + pilihan.
            "satisfaction_scores": ikg_scores_0_1,
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

    # Tambahan field untuk Indeks Kepuasan Gabungan (IKG) agar tetap
    # backward compatible (field baru, tidak mengubah struktur lama).
    dashboard_data["combined_satisfaction_index"] = ikg_survey

    if ikg_survey >= 80.0:
        combined_label = "Puas"
    elif ikg_survey >= 60.0:
        combined_label = "Netral"
    else:
        combined_label = "Tidak Puas"

    dashboard_data["combined_satisfaction_label"] = combined_label
    dashboard_data["distribution_combined_satisfaction"] = ikg_distribution
    
    return dashboard_data
